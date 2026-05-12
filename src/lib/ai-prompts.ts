import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { extractCoupangUrl, sanitizeCoupangEmbed } from '@/lib/coupang'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')
const SYSTEM_INSTRUCTION_FILE = 'system-instruction.md'

// 폴백 시스템 프롬프트 (파일 읽기 실패 시)
const FALLBACK_SYSTEM_PROMPT = `
ROLE & GOAL: 당신은 전문 블로그 콘텐츠 작성자입니다.
목표는 사용자가 선택한 주제에 대해 정확하고 실용적인 정보를 독자가 이해하기 쉽게 전달하는 것입니다.

글쓰기 스타일:
- 한국어로 작성
- 존댓말 사용 (합쇼체)
- 전문적이되 친근한 톤
- 구체적인 숫자와 사례를 활용

SEO 규칙:
1. 검색 의도에 맞는 제목 (60자 이내)
2. 메타 설명 (160자 이내)
3. H2/H3 계층 구조
4. 키워드 자연스럽게 3-5회 포함

OUTPUT FORMAT (JSON):
{
  "title": "SEO 최적화 제목 (60자 이내)",
  "slug": "url-friendly-slug",
  "excerpt": "2-3문장 요약",
  "content": "마크다운 형식 본문 (1500-2500자)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "seoTitle": "SEO 제목",
  "seoDescription": "메타 설명 (160자 이내)"
}
`

/**
 * knowledge/system-instruction.md 에서 시스템 지침을 읽어옵니다.
 * 파일이 없으면 폴백 프롬프트를 반환합니다.
 */
export async function getSystemInstruction(): Promise<string> {
  try {
    const filePath = path.join(KNOWLEDGE_DIR, SYSTEM_INSTRUCTION_FILE)
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch {
    console.warn('system-instruction.md를 읽을 수 없습니다. 폴백 프롬프트를 사용합니다.')
    return FALLBACK_SYSTEM_PROMPT
  }
}

/**
 * DB에 아카이빙된 지식과 로컬 knowledge/ 파일을 함께 읽어옵니다.
 * 간단 RAG 버전: query와 겹치는 단어가 많은 지식을 우선 사용합니다.
 */
export async function getRelevantKnowledgeContext(query: string = ''): Promise<string> {
  const MAX_CHARS_PER_SOURCE = 3500
  const MAX_SOURCES = 6
  const queryTerms = query
    .toLowerCase()
    .split(/[\s,.;:!?()[\]{}"'`~]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)

  const scoreContent = (content: string, source: string) => {
    if (queryTerms.length === 0) return 1
    const haystack = `${source}\n${content}`.toLowerCase()
    return queryTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0)
  }

  const sources: Array<{ source: string; content: string; updatedAt?: Date }> = []

  try {
    const records = await prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    for (const record of records) {
      sources.push({
        source: record.source || `knowledge-${record.id}`,
        content: record.content,
        updatedAt: record.createdAt,
      })
    }
  } catch {
    // DB가 아직 준비되지 않은 로컬/빌드 환경에서는 파일 기반 지식만 사용합니다.
  }

  try {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true })
    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true })

    const knowledgeFiles = entries.filter(
      (e) =>
        e.isFile() &&
        (e.name.endsWith('.md') || e.name.endsWith('.txt')) &&
        e.name !== SYSTEM_INSTRUCTION_FILE
    )

    for (const file of knowledgeFiles) {
      try {
        const filePath = path.join(KNOWLEDGE_DIR, file.name)
        const content = await fs.readFile(filePath, 'utf-8')
        sources.push({ source: file.name, content })
      } catch {
        // 개별 파일 읽기 실패는 무시
      }
    }
  } catch {
    // 로컬 파일 지식이 없어도 DB 지식은 그대로 사용합니다.
  }

  if (sources.length === 0) return ''

  const chunks = sources
    .map((item) => ({
      ...item,
      score: scoreContent(item.content, item.source),
    }))
    .filter((item) => queryTerms.length === 0 || item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES)
    .map((item) => {
      const content =
        item.content.length > MAX_CHARS_PER_SOURCE
          ? item.content.substring(0, MAX_CHARS_PER_SOURCE) + '\n...(truncated)'
          : item.content
      return `[지식 자료: ${item.source}]\n${content}`
    })

  if (chunks.length === 0) return ''

  return (
    '\n\n**참고 지식 (Knowledge Context):**\n' +
    chunks.join('\n\n---\n\n') +
    '\n\n**위 지식을 사실 근거와 전문성 보강 자료로 참고해서 글을 작성해주세요.**\n\n'
  )
}

export const getAllKnowledgeContext = getRelevantKnowledgeContext

/**
 * 사용자 입력으로부터 AI 콘텐츠 생성 프롬프트를 만듭니다.
 */
export function generateContentPrompt(
  userInput: string,
  keywords?: string[],
  draftOutline?: string
): string {
  let prompt = `다음 주제로 블로그 글을 작성해주세요: ${userInput}\n`

  if (keywords && keywords.length > 0) {
    prompt += `타겟 키워드: ${keywords.join(', ')}\n`
  }

  if (draftOutline && draftOutline.trim()) {
    prompt += `\n초안/개요:\n${draftOutline}\n\n위 초안을 참고하여 완성된 글을 작성해주세요.\n`
  }

  prompt += `
작성 요구사항:
- 1500-2500자, 정확하고 실용적인 정보
- H2/H3 구조 사용, 짧은 문단
- 구체적인 숫자와 실제 사례 포함
- 독자가 행동할 수 있는 실질적 팁 제공
- 글 마지막에 핵심 요약 또는 체크리스트 포함

반드시 JSON 형식으로 응답:
{"title":"SEO 제목 (60자 이내)","slug":"url-slug","excerpt":"2-3문장 요약","content":"마크다운 본문","tags":["태그1","태그2","태그3"],"seoTitle":"SEO 제목","seoDescription":"메타 설명 (160자 이내)"}`

  return prompt
}

/**
 * 쿠팡 파트너스 상품 리뷰 모드 프롬프트
 */
export function generateCoupangPrompt(coupangLink: string): string {
  const coupangUrl = extractCoupangUrl(coupangLink)
  const coupangEmbed = sanitizeCoupangEmbed(coupangLink)

  return `
**쿠팡 파트너스 상품 리뷰 모드:**
- 아래 쿠팡 파트너스 URL 또는 배너를 바탕으로 해당 상품에 대한 글을 작성해주세요.
- 쿠팡 파트너스 URL: ${coupangUrl}
${coupangEmbed ? `- 본문 중간에 아래 배너 HTML을 그대로 한 번 포함해주세요:\n${coupangEmbed}` : `- 링크 형식: [상품명 또는 관련 텍스트](${coupangUrl})`}
- 상품에 대한 객관적 정보와 실제 사용 관점의 리뷰를 포함하세요.
- 과장 광고 금지, 장단점을 균형 있게 서술하세요.
- 태그에는 반드시 "쿠팡파트너스"를 포함하세요.

**필수 면책 문구 (반드시 글 마지막에 포함):**
<small>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</small>
`
}

// 하위 호환성을 위한 re-export
export const MASTER_SYSTEM_PROMPT = FALLBACK_SYSTEM_PROMPT
