# Threads 글 연동 → 블로그 포스트 자동 생성

> 작업일: 2026-05-10

---

## 개요

Threads API로 글을 가져와 Gemini AI로 블로그 포스트를 자동 생성하는 기능.
기존 YouTube 동기화와 동일한 패턴(Settings DB, Gemini AI, 어드민 UI)을 재활용.

---

## 수정한 파일 (3개)

| 파일 | 변경 내용 |
|------|-----------|
| `prisma/schema.prisma` | Post 모델에 `threadsPostId String?` 필드 + `@@index([threadsPostId])` 추가 |
| `src/lib/settings.ts` | `THREADS_TOKEN_*` 동적 키 패턴 지원, `THREADS_DEFAULT_ACCOUNT` 허용 키 추가 |
| `src/app/admin/layout.tsx` | 어드민 네비게이션에 "Threads" 링크 추가 |

---

## 새로 만든 파일 (8개)

### 타입 정의
| 파일 | 설명 |
|------|------|
| `src/types/threads.ts` | `ThreadsMediaType`, `ThreadsPost`, `ThreadsAccount`, `ThreadsPostsResponse` 타입 |

### 핵심 라이브러리
| 파일 | 설명 |
|------|------|
| `src/lib/threads.ts` | Threads API 클라이언트 — 글 목록 조회, 단건 조회, 토큰 갱신, 해시태그 추출, 발췌문 생성 |
| `src/lib/threads-to-blog-service.ts` | AI 변환 서비스 — Gemini 2.5 Flash Lite로 짧은 글 → 풀 블로그 포스트 확장 (youtube-to-blog-service.ts 패턴 동일) |

### API 라우트
| 파일 | 메서드 | 설명 |
|------|--------|------|
| `src/app/api/threads/posts/route.ts` | GET | 글 목록 조회 (account 파라미터 필수), 포스팅 여부 표시 |
| `src/app/api/threads-to-blog/route.ts` | POST | 개별 글 → 블로그 포스트 변환 |
| `src/app/api/threads/accounts/route.ts` | GET/POST | 계정 목록 조회 / 토큰 저장·갱신 |

### 어드민 UI
| 파일 | 설명 |
|------|------|
| `src/app/admin/threads/page.tsx` | 글 관리 페이지 — 계정 선택, 글 목록, 필터(포스트 상태), 개별/벌크 포스트 생성, 커서 페이지네이션 |
| `src/app/admin/threads-sync/page.tsx` | 설정/동기화 페이지 — 등록된 계정 목록, 토큰 입력/저장 폼, 토큰 갱신 버튼, API 가이드 |

---

## 빌드 검증

- `prisma generate` — 성공
- TypeScript 타입 체크 — 새로 추가한 파일 전부 에러 없음
- `pnpm build` 컴파일 — 성공 (404 페이지 useRef 에러는 기존 이슈)

---

## 배포 전 수동 작업

### 1. DB 마이그레이션
Turso DB에 `threadsPostId` 컬럼 추가:
```bash
# 방법 A: prisma db push
pnpm db:push

# 방법 B: 직접 SQL
ALTER TABLE Post ADD COLUMN threadsPostId TEXT;
CREATE INDEX Post_threadsPostId_idx ON Post (threadsPostId);
```

### 2. 환경변수 등록
`.env` 또는 Vercel 대시보드에 추가:
```
THREADS_TOKEN_PARTNERS_DANA=THAAW29b...
```
또는 어드민 `/admin/threads-sync` 페이지에서 UI로 등록 가능.

### 3. 기존 빌드 에러 수정
404 페이지의 `useRef` 에러는 별도 수정 필요 (Threads와 무관).

---

## 사용 흐름

1. `/admin/threads-sync` → 토큰 등록
2. `/admin/threads` → 계정 선택 → 글 목록 로드
3. 글 선택 → "포스트 생성" → AI가 DRAFT 포스트 생성
4. 생성된 포스트 검토 후 수동 발행

---

## 주의사항

- Threads 토큰은 **60일마다 만료** → 어드민에서 "토큰 갱신" 버튼 클릭
- **50자 미만** 글은 블로그 변환 불가 (품질 필터)
- media_url은 임시 URL이라 만료 가능 → coverImage 용도로만 사용
- API 요청 간 **2초 딜레이** 적용 (rate limit 방지)
