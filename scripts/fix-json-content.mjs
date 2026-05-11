import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

function unwrapContent(content) {
  if (!content || typeof content !== 'string') return null
  let text = content.trim()
  if (text.startsWith('```json')) {
    const m = text.match(/```json\n([\s\S]*?)\n```/)
    if (m) {
      try {
        const p = JSON.parse(m[1])
        if (p.content && typeof p.content === 'string') return p.content
      } catch {}
    }
  }
  if (text.startsWith('{')) {
    try {
      const p = JSON.parse(text)
      if (p.content && typeof p.content === 'string') return p.content
    } catch {}
  }
  return null
}

async function main() {
  // Find all posts where content starts with { (potential JSON)
  const r = await turso.execute({
    sql: "SELECT id, slug, content FROM Post WHERE substr(content, 1, 1) = '{' OR content LIKE '```json%'"
  })
  console.log(`JSON 감싸진 글 후보: ${r.rows.length}개\n`)

  let fixed = 0
  for (const row of r.rows) {
    const unwrapped = unwrapContent(row.content)
    if (unwrapped) {
      await turso.execute({
        sql: 'UPDATE Post SET content = ? WHERE id = ?',
        args: [unwrapped, row.id]
      })
      console.log(`  ✅ ${row.slug}`)
      fixed++
    }
  }
  console.log(`\n=== 수정 완료: ${fixed}개 ===`)
  turso.close()
}

main().catch(e => { console.error(e); process.exit(1) })
