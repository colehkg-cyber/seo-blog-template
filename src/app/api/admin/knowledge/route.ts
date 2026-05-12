export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')

async function ensureDir() {
  try {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true })
  } catch {
    // already exists
  }
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

  // 전체 목록 조회
  try {
    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map(async (e) => {
          const filePath = path.join(KNOWLEDGE_DIR, e.name)
          const stat = await fs.stat(filePath)
          const content = await fs.readFile(filePath, 'utf-8')
          const preview = content.split('\n').find((line) => line.trim() && !line.startsWith('#'))?.trim().slice(0, 100) || ''

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
 */
export async function POST(request: NextRequest) {
  await ensureDir()

  try {
    const { filename, content } = await request.json()

    if (!filename || typeof content !== 'string') {
      return NextResponse.json({ error: '파일 이름과 내용이 필요합니다.' }, { status: 400 })
    }

    const safeName = path.basename(filename)
    if (!safeName.endsWith('.md')) {
      return NextResponse.json({ error: '.md 파일만 업로드할 수 있습니다.' }, { status: 400 })
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
