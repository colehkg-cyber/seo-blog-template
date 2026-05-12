import { promises as fs } from 'fs'
import path from 'path'

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
 * knowledge/ 디렉토리의 모든 지식 파일(.md, .txt)을 읽어 컨텍스트 문자열로 반환합니다.
 * system-instruction.md는 제외합니다.
 * 파일당 3000자 제한 (토큰 폭발 방지)
 */
export async function getAllKnowledgeContext(): Promise<string> {
  try {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true })
    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true })

    const knowledgeFiles = entries.filter(
      (e) =>
        e.isFile() &&
        (e.name.endsWith('.md') || e.name.endsWith('.txt')) &&
        e.name !== SYSTEM_INSTRUCTION_FILE
    )

    if (knowledgeFiles.length === 0) return ''

    const MAX_CHARS_PER_FILE = 3000
    const chunks: string[] = []

    for (const file of knowledgeFiles) {
      try {
        const filePath = path.join(KNOWLEDGE_DIR, file.name)
        let content = await fs.readFile(filePath, 'utf-8')
        if (content.length > MAX_CHARS_PER_FILE) {
          content = content.substring(0, MAX_CHARS_PER_FILE) + '\n...(truncated)'
        }
        chunks.push(`[지식 파일: ${file.name}]\n${content}`)
      } catch {
        // 개별 파일 읽기 실패는 무시
      }
    }

    if (chunks.length === 0) return ''

    return (
      '\n\n**참고 지식 (Knowledge Context):**\n' +
      chunks.join('\n\n---\n\n') +
      '\n\n**위 지식을 참고하여 전문성을 반영해 글을 작성해주세요.**\n\n'
    )
  } catch {
    return ''
  }
}

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
  return `
**쿠팡 파트너스 상품 리뷰 모드:**
- 아래 쿠팡 상품 링크를 본문 중간에 자연스럽게 삽입해주세요.
- 상품 링크: ${coupangLink}
- 링크 형식: [상품명 또는 관련 텍스트](${coupangLink})
- 상품에 대한 객관적 정보와 실제 사용 관점의 리뷰를 포함하세요.
- 과장 광고 금지, 장단점을 균형 있게 서술하세요.

**필수 면책 문구 (반드시 글 마지막에 포함):**
> 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
`
}

// 하위 호환성을 위한 re-export
export const MASTER_SYSTEM_PROMPT = FALLBACK_SYSTEM_PROMPT
