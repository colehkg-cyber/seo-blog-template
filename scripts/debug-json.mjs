import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

function forceExtractContent(raw) {
  // Try normal JSON parse first
  try {
    const parsed = JSON.parse(raw)
    if (parsed.content) return parsed.content
  } catch {}

  // Fallback: regex extract "content": "..." field
  // Match "content": " then capture everything until the pattern breaks
  const match = raw.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*,\s*\n|"\s*\}|$)/)
  if (match) {
    // Unescape JSON string escapes
    let content = match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    return content
  }

  return null
}

async function main() {
  const r = await turso.execute({
    sql: "SELECT id, slug, content FROM Post WHERE substr(content, 1, 1) = '{'"
  })

  console.log(`JSON 감싸진 글: ${r.rows.length}개\n`)

  for (const row of r.rows) {
    const extracted = forceExtractContent(row.content)
    if (extracted && extracted.length > 100) {
      console.log(`${row.slug}`)
      console.log(`  원본 길이: ${row.content.length} → 추출 길이: ${extracted.length}`)
      console.log(`  미리보기: ${extracted.substring(0, 80)}...`)

      await turso.execute({
        sql: 'UPDATE Post SET content = ? WHERE id = ?',
        args: [extracted, row.id]
      })
      console.log(`  ✅ 수정 완료\n`)
    } else {
      console.log(`${row.slug} — ❌ 추출 실패`)
    }
  }

  turso.close()
}

main().catch(e => { console.error(e); process.exit(1) })
