export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = ['.md', '.txt', '.pdf']

async function ensureDir() {
  try {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true })
  } catch {
    // already exists
  }
}

function isAllowedFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return ALLOWED_EXTENSIONS.includes(ext)
}

/**
 * GET /api/admin/knowledge
 * 지식 파일 목록 조회 또는 개별 파일 내용 조회
 */
export async function GET(request: NextRequest) {
  await ensureDir()

  const filename = request.nextUrl.searchParams.get('filename')

  // 개별 파일 내용 조회
  if (filename) {
    const safeName = path.basename(filename)
    const filePath = path.join(KNOWLEDGE_DIR, safeName)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({ filename: safeName, content })
    } catch {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
    }
  }

  // 전체 목록 조회 (.md, .txt, .pdf)
  try {
    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile() && isAllowedFile(e.name))
        .map(async (e) => {
          const filePath = path.join(KNOWLEDGE_DIR, e.name)
          const stat = await fs.stat(filePath)

          let preview = ''
          // PDF는 미리보기 생략, 텍스트 파일만 미리보기
          if (e.name.endsWith('.md') || e.name.endsWith('.txt')) {
            try {
              const content = await fs.readFile(filePath, 'utf-8')
              preview = content.split('\n').find((line) => line.trim() && !line.startsWith('#'))?.trim().slice(0, 100) || ''
            } catch {
              // ignore
            }
          } else if (e.name.endsWith('.pdf')) {
            preview = '(PDF 파일)'
          }

          return {
            name: e.name,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
            preview,
          }
        })
    )

    files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ files: [] })
  }
}

/**
 * POST /api/admin/knowledge
 * 지식 파일 생성/수정
 * - JSON 모드: { filename, content } — .md, .txt 인라인 에디터
 * - FormData 모드: file 필드로 PDF/TXT 업로드 (5MB 제한)
 */
export async function POST(request: NextRequest) {
  await ensureDir()

  const contentType = request.headers.get('content-type') || ''

  // FormData 모드 (파일 업로드)
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 })
      }

      // 크기 제한
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: '파일 크기는 5MB 이하여야 합니다.' },
          { status: 400 }
        )
      }

      const safeName = path.basename(file.name)
      const ext = path.extname(safeName).toLowerCase()

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: '.md, .txt, .pdf 파일만 업로드할 수 있습니다.' },
          { status: 400 }
        )
      }

      if (ext === '.pdf') {
        // PDF → 텍스트 추출 → .md 로 변환 저장
        try {
          const { PDFParse } = await import('pdf-parse')
          const arrayBuffer = await file.arrayBuffer()
          const pdf = new PDFParse({ data: new Uint8Array(arrayBuffer) })
          const textResult = await pdf.getText()
          const extractedText = textResult.text

          // PDF 파일명에서 .pdf를 .md로 변경
          const mdName = safeName.replace(/\.pdf$/i, '.md')
          const filePath = path.join(KNOWLEDGE_DIR, mdName)

          const mdContent = `# ${safeName} (PDF에서 추출)\n\n${extractedText}`
          await fs.writeFile(filePath, mdContent, 'utf-8')

          return NextResponse.json({ ok: true, filename: mdName, converted: true })
        } catch (err) {
          console.error('PDF 파싱 실패:', err)
          return NextResponse.json(
            { error: 'PDF 파일을 읽을 수 없습니다. 파일이 손상되었거나 암호화되어 있을 수 있습니다.' },
            { status: 400 }
          )
        }
      } else {
        // .txt, .md → 그대로 저장
        const content = await file.text()
        const filePath = path.join(KNOWLEDGE_DIR, safeName)
        await fs.writeFile(filePath, content, 'utf-8')

        return NextResponse.json({ ok: true, filename: safeName })
      }
    } catch {
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
    }
  }

  // JSON 모드 (인라인 에디터)
  try {
    const { filename, content } = await request.json()

    if (!filename || typeof content !== 'string') {
      return NextResponse.json({ error: '파일 이름과 내용이 필요합니다.' }, { status: 400 })
    }

    const safeName = path.basename(filename)
    const ext = path.extname(safeName).toLowerCase()

    if (ext !== '.md' && ext !== '.txt') {
      return NextResponse.json({ error: '.md 또는 .txt 파일만 직접 편집할 수 있습니다.' }, { status: 400 })
    }

    const filePath = path.join(KNOWLEDGE_DIR, safeName)
    await fs.writeFile(filePath, content, 'utf-8')

    return NextResponse.json({ ok: true, filename: safeName })
  } catch {
    return NextResponse.json({ error: '파일 저장에 실패했습니다.' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/knowledge
 * 지식 파일 삭제
 */
export async function DELETE(request: NextRequest) {
  await ensureDir()

  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: '파일 이름이 필요합니다.' }, { status: 400 })
    }

    const safeName = path.basename(filename)
    const filePath = path.join(KNOWLEDGE_DIR, safeName)

    await fs.unlink(filePath)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '파일 삭제에 실패했습니다.' }, { status: 500 })
  }
}
