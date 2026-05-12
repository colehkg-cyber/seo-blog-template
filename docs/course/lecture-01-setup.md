# 1강. 0에서 배포까지 — Claude Code 실습 가이드

> **완성 템플릿**: https://github.com/colehkg-cyber/coleitai-blog
> **소요 시간**: 약 40분
> **결과물**: 완성된 블로그가 내 Vercel 주소에 배포된 상태

---

## 전체 목차

| # | 단계 | 시간 | 하는 일 |
|---|---|---|---|
| PHASE 0 | 사전 준비 | 15분 | 계정 4개 만들기 |
| PHASE 1 | 템플릿 복사 | 3분 | GitHub에서 내 계정으로 복사 |
| PHASE 2 | VS Code 세팅 | 5분 | 코드 열고 Claude Code 실행 |
| PHASE 3 | 블로그 커스텀 | 10분 | 이름·색상 내 것으로 변경 |
| PHASE 4 | 환경변수 입력 | 5분 | .env 파일에 API 키 넣기 |
| PHASE 5 | Vercel 배포 | 10분 | 인터넷에 공개 |
| PHASE 6 | 자동배포 확인 | 2분 | push → 자동 업데이트 확인 |

---

## PHASE 0. 사전 준비 (15분)

아래 4개 계정을 미리 만들어오세요. 강의 당일 이미 있어야 합니다.

| 서비스 | 가입 주소 | 비용 | 용도 |
|---|---|---|---|
| Claude | claude.ai | Pro $20/월 | Claude Code 실행 |
| GitHub | github.com | 무료 | 코드 저장 |
| Vercel | vercel.com | 무료 | 자동 배포 |
| Turso | turso.tech | 무료 | 글 저장 DB |
| Google AI Studio | aistudio.google.com | 무료 | AI 글쓰기 키 |

> ⚠️ Vercel은 반드시 GitHub 계정으로 연동해서 가입하세요.

### Turso DB + 토큰 발급 방법

1. https://app.turso.tech → GitHub으로 로그인
2. Databases → Create Database
3. Name: `my-blog-db` / Region: Tokyo
4. 생성된 DB 클릭 → Generate Token → Read & Write → Create
5. 아래 2개를 메모장에 저장:
   - Database URL: `libsql://my-blog-db-내아이디.turso.io`
   - Auth Token: `eyJ...` 로 시작하는 긴 문자열

### Gemini API 키 발급

1. https://aistudio.google.com → Google 로그인
2. Get API Key → Create API Key
3. 발급된 키 메모장에 저장 (`AIzaSy...`)

### 메모장에 이 6개 모아두기

```
GitHub 저장소 URL  : https://github.com/내아이디/my-blog
Turso DB URL      : libsql://my-blog-db-내아이디.turso.io
Turso Auth Token  : eyJ... (긴 문자열)
Gemini API Key    : AIzaSy...
관리자 비밀번호    : 본인이 정한 8자 이상 문자열
사이트 URL        : https://my-blog.vercel.app (배포 후 채움)
```

---

## PHASE 1. 템플릿 복사 (3분)

1. 브라우저에서 접속: **https://github.com/colehkg-cyber/coleitai-blog**
2. 초록색 **"Use this template"** 버튼 클릭
3. **"Create a new repository"** 선택
4. Repository name: `my-blog`
5. **Public** 선택 ← 필수
6. **"Create repository"** 클릭

이게 끝입니다. 완성된 블로그 코드 전체가 내 GitHub에 복사됩니다.

---

## PHASE 2. VS Code 세팅 (5분)

### 2-1. VS Code 설치 (없으면)

https://code.visualstudio.com → Download → 설치

### 2-2. 코드 내 컴퓨터로 가져오기

VS Code 실행 → Terminal 메뉴 → New Terminal → 아래 입력:

```bash
# 내아이디와 my-blog는 본인 것으로 변경
git clone https://github.com/내아이디/my-blog.git
cd my-blog
code .
```

`code .` 입력하면 VS Code가 프로젝트 폴더를 새 창으로 엽니다.

### 2-3. Claude Code 설치 (처음 한 번만)

VS Code 내장 터미널에서 (`Ctrl + 백틱` 또는 Terminal → New Terminal):

**Mac:**
```bash
npm install -g @anthropic-ai/claude-code
```

**Windows (PowerShell 관리자 권한으로 열기):**
```bash
npm install -g @anthropic-ai/claude-code
```

설치 확인:
```bash
claude --version
```

### 2-4. Claude Code 실행 및 로그인

```bash
claude
```

처음 실행하면 브라우저가 열립니다.
Claude Pro 계정으로 로그인 → 권한 허용 → 터미널로 돌아옴.

`>` 프롬프트가 보이면 준비 완료입니다.

---

## PHASE 3. 블로그 커스텀 (10분)

이제부터 Claude Code `>` 뒤에 아래 프롬프트를 복붙하면 됩니다.
**[대괄호] 안만 본인 것으로 바꾸세요.**

---

### 📋 프롬프트 1 — 프로젝트 파악

```
이 프로젝트의 구조를 파악해줘.

1. 어떤 파일들이 있는지 트리로 보여줘
2. 블로그 이름, 저자 이름, 사이트 설명이 어느 파일에서 관리되는지 찾아줘
3. 한국어로 설명해줘
```

---

### 📋 프롬프트 2 — 블로그 기본 정보 변경

```
블로그 기본 정보를 아래와 같이 바꿔줘.

블로그 이름: [내 블로그 이름]
블로그 설명: [한 줄 소개]
저자 이름: [내 이름 또는 닉네임]
저자 이메일: [내 이메일]

관련된 파일을 모두 찾아서 빠짐없이 바꿔줘.
바꾼 파일 목록을 한국어로 보고해줘.
```

---

### 📋 프롬프트 3 — 색상 테마 변경

```
아래 수정을 해줘.
Lighthouse 점수(성능·접근성·SEO)에 영향 주지 않게 유지하면서 작업해줘.

메인 컬러를 [원하는 색상, 예: 딥그린 / 네이비 / 오렌지] 계열로 바꿔줘.
헤더, 링크, 버튼, 강조 색상 전부 통일해줘.
바꾼 파일 목록 한국어로 보고해줘.
```

---

### 📋 프롬프트 4 — 변경사항 GitHub에 저장

```
방금 바꾼 내용을 git에 커밋하고 push해줘.
커밋 메시지는 "블로그 기본 정보 및 디자인 커스텀"으로 해줘.
push 결과 한국어로 보고해줘.
```

> Claude Code가 git add → git commit → git push를 자동으로 실행합니다.
> 승인 요청이 오면 `y` 또는 Enter를 누르세요.

---

## PHASE 4. 환경변수 입력 (5분)

Claude Code에서 나와서 (`Ctrl + C`) VS Code로 돌아옵니다.

VS Code 왼쪽 파일 트리에서 `.env.example` 파일을 클릭 → 내용 확인.

같은 폴더에 `.env` 파일을 새로 만들고 Phase 0에서 메모해둔 값들을 채웁니다:

```
NEXT_PUBLIC_SITE_URL=https://my-blog.vercel.app
TURSO_DATABASE_URL=libsql://my-blog-db-내아이디.turso.io
DATABASE_AUTH_TOKEN=eyJ... (Turso 토큰)
GEMINI_API_KEY=AIzaSy... (Gemini 키)
ADMIN_PASSWORD=내가정한비밀번호
```

저장 후 다시 Claude Code 실행:

```bash
claude
```

### 📋 프롬프트 5 — .env 안전 점검

```
.env 파일 작성했어. 두 가지 확인해줘.

1. .env 파일에 빈 값이 있는지 확인해줘
2. .gitignore에 .env가 있는지 확인해줘. 없으면 추가해줘.
3. git status 실행해서 .env가 추적 목록에 안 보이는지 확인해줘.

한국어로 결과 보고해줘.
```

---

## PHASE 5. Vercel 배포 (10분)

이 단계는 브라우저에서 직접 합니다.

### 5-1. Vercel 프로젝트 연결

1. https://vercel.com → 로그인
2. **Add New Project** 클릭
3. my-blog 저장소 옆 **Import** 클릭
4. **Environment Variables** 섹션을 펼쳐서 아래 값 입력:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://my-blog.vercel.app` |
| `TURSO_DATABASE_URL` | Turso DB URL |
| `DATABASE_AUTH_TOKEN` | Turso 토큰 |
| `GEMINI_API_KEY` | Gemini 키 |
| `ADMIN_PASSWORD` | 내가 정한 비밀번호 |

5. **Deploy** 클릭 → 2~3분 대기

### 5-2. 배포 완료 확인

Vercel이 도메인을 줍니다: `https://my-blog-내아이디.vercel.app`

접속해서 블로그가 보이면 성공!

### 5-3. DB 초기화 (첫 배포 후 1회만)

```
https://my-blog-내아이디.vercel.app/admin/setup
```

접속 → 안내에 따라 진행.

---

## PHASE 6. 자동배포 확인 (2분)

Claude Code에서:

### 📋 프롬프트 6 — 자동배포 테스트

```
홈페이지 메인 타이틀 아래에 딱 한 줄만 추가해줘.

내용: "자동 배포 테스트 완료 🚀"

추가 후 git 커밋하고 push해줘.
커밋 메시지: "test: 자동배포 확인"
```

push 후 10~20초 뒤:
- Vercel 대시보드 → Deployments 탭에 새 빌드 자동으로 시작되는지 확인
- 빌드 완료 후 내 사이트 새로고침 → 문구가 보이면 완료

---

## ✅ 완료 체크리스트

- [ ] 템플릿을 내 GitHub으로 복사 완료
- [ ] VS Code에서 Claude Code 실행 성공
- [ ] 블로그 이름/저자/색상 변경 완료
- [ ] .env에 API 키 5개 입력 + GitHub에 노출 안 됨
- [ ] Vercel 배포 완료 (내 도메인으로 접속 가능)
- [ ] push → 자동 배포 작동 확인

---

## 자주 막히는 에러

### "command not found: claude"

터미널을 완전히 닫고 새로 열기.
그래도 안 되면 Claude Code에 붙여넣기:
```
npm install -g @anthropic-ai/claude-code
```

### Vercel 빌드 실패

Claude Code에 붙여넣기:
```
Vercel 빌드 로그에 이런 에러가 났어:
[에러 메시지 그대로 붙여넣기]

원인 설명하고 바로 고쳐줘. 한국어로 보고해줘.
```

### git push 시 인증 오류

Claude Code에 붙여넣기:
```
git push 할 때 인증 오류가 났어.
GitHub Personal Access Token(PAT)으로 인증하는 방법을 한국어로 단계별로 알려줘.
```

---

## 2강 예고

1강은 완성된 블로그를 내 것으로 만들고 배포하는 것까지.
2강에서는:

- 황금 키워드 발굴
- AI로 첫 번째 블로그 글 쓰기
- 구글 서치 콘솔 등록
- 애드센스 신청 준비
