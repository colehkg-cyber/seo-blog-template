# 1강. 0에서 배포까지 — Claude Code 실습 가이드

> **완성 템플릿**: https://github.com/colehkg-cyber/coleitai-blog
> **소요 시간**: 약 70분
> **결과물**: 완성된 블로그가 내 Vercel 주소에 배포된 상태

---

## 전체 목차

| # | 단계 | 시간 | 하는 일 |
|---|---|---|---|
| PHASE 0 | 도구 이해 + 계정 만들기 | 35분 | 5개 서비스 가입 + 키 발급 |
| PHASE 1 | 템플릿 복사 | 3분 | GitHub에서 내 계정으로 복사 |
| PHASE 2 | VS Code 세팅 | 5분 | 코드 열고 Claude Code 실행 |
| PHASE 3 | 블로그 커스텀 | 10분 | 이름·색상 내 것으로 변경 |
| PHASE 4 | 환경변수 입력 | 5분 | .env 파일에 API 키 넣기 |
| PHASE 5 | Vercel 배포 | 10분 | 인터넷에 공개 |
| PHASE 6 | 자동배포 확인 | 2분 | push → 자동 업데이트 확인 |

---

## PHASE 0. 도구 이해 + 계정 만들기 (35분)

### 우리가 쓰는 5개 도구 — 한눈에

| 서비스 | 한 줄 정의 | 비용 | 이 강의에서 하는 일 |
|---|---|---|---|
| Claude | AI 어시스턴트 (코딩까지 됨) | Pro $20/월 | Claude Code로 코드 자동 작성 |
| GitHub | 코드 저장소 (개발자 드롭박스) | 무료 | 내 블로그 코드를 안전하게 보관 |
| Vercel | 웹사이트 자동 배포 서비스 | 무료 | GitHub에 push → 자동으로 인터넷 공개 |
| Turso | 클라우드 SQLite DB | 무료 | 블로그 글·조회수 저장 |
| Google AI Studio | Gemini API 발급처 | 무료 | AI가 블로그 글 써주는 키 |

> 💡 **돈 드는 건 Claude Pro 단 하나.** 나머지 4개는 모두 무료 플랜으로 충분합니다. 블로그 트래픽이 월 수십만 PV 넘어가야 유료로 넘어갑니다.

---

### 도구별 자세한 설명 (왜 이걸 쓰는가)

#### 1. Claude — AI 코딩 파트너

- **뭐 하는 곳?**: Anthropic이 만든 AI. ChatGPT의 경쟁자
- **왜 Pro($20/월)가 필요?**: 우리는 채팅이 아니라 **Claude Code(CLI 도구)** 를 쓸 거예요. 터미널에서 `claude` 한 번 실행하면 AI가 내 컴퓨터 파일을 직접 읽고 수정합니다. 이게 Pro 구독 안에 포함됨
- **무료 대안 없음?**: Claude.ai 무료는 채팅만 됨. 코드 자동 수정은 안 됨
- **왜 Claude를 쓰나? ChatGPT 안 됨?**: Claude Code가 현재 가장 잘 만들어진 CLI 코딩 에이전트. Cursor·Copilot은 IDE 안에 갇혀 있지만 Claude Code는 터미널에서 직접 파일·git·배포까지 자동화

#### 2. GitHub — 코드 저장소

- **뭐 하는 곳?**: 코드 버전 관리 사이트. "이 파일을 언제 누가 어떻게 바꿨는지" 전부 기록됨
- **왜 무료?**: Microsoft가 인수했고 개인·소규모는 무료가 정책. Public 저장소는 용량 무제한 무료
- **이 강의에서 하는 역할**: ① 완성 템플릿을 내 계정으로 복사 ② 내가 코드 바꿀 때마다 백업 ③ Vercel이 여기서 코드를 가져가 배포
- **알아둘 점**: Public(누구나 봄) vs Private(나만 봄). 우리는 Public으로 만들 거예요 (Vercel 무료 플랜은 Public 권장)

#### 3. Vercel — 자동 배포 호스팅

- **뭐 하는 곳?**: Next.js를 만든 회사. Next.js 사이트를 자동으로 인터넷에 띄워주는 서비스
- **왜 무료?**: 개인용 Hobby 플랜은 무료. 월 100GB 대역폭 + 무제한 배포 + 자동 HTTPS 다 포함
- **마법 같은 점**: GitHub에 코드 push만 하면 **20초 안에 자동 배포** 됨. 서버 세팅, 도메인, SSL 인증서 전부 자동
- **유료로 넘어가야 할 때**: 월 트래픽 100GB 초과(아주 잘 되는 블로그 기준 월 50만 PV 수준) — 1강 단계에서는 신경 X

#### 4. Turso — 클라우드 DB

- **뭐 하는 곳?**: SQLite를 클라우드에서 돌려주는 회사. SQLite는 파일 하나로 동작하는 가장 가벼운 DB
- **왜 무료?**: 무료 플랜이 9GB 저장 + 월 10억 read + 2500만 write. 개인 블로그는 평생 무료라고 보면 됨
- **왜 MySQL/PostgreSQL 안 쓰나?**: 그건 서버를 따로 켜둬야 함(비싸고 복잡). Turso는 Vercel 같은 서버리스 환경과 궁합이 완벽
- **이 강의에서 하는 역할**: 블로그 글, 조회수, 카테고리, 댓글 다 여기 저장

#### 5. Google AI Studio (Gemini) — AI 글쓰기 키

- **뭐 하는 곳?**: 구글의 AI 모델 Gemini의 API 키를 발급해주는 곳
- **왜 무료?**: 구글이 OpenAI/Claude를 따라잡으려고 Gemini Flash를 무료로 풀어둠. 분당 15회 / 일 1500회까지 무료
- **왜 OpenAI 안 쓰나?**: OpenAI는 결제카드 필수 + 유료. Gemini는 카드 없이 키만 받아서 바로 시작 가능
- **이 강의에서 하는 역할**: 2강에서 "키워드만 입력하면 블로그 글 자동 작성" 기능에 사용

---

### 5개 계정 한 번에 만들기 — 순서대로 따라하세요

> ⚠️ **순서가 중요합니다.** GitHub → Vercel/Turso → Claude → Google 순서로 만드세요. 뒤 3개는 GitHub 계정으로 로그인하면 가입이 빠릅니다.

#### Step 1. GitHub 계정 (5분)

1. https://github.com/signup 접속
2. 이메일 입력 → 비밀번호 → Username 입력
   - **Username 팁**: `j-kim-blog`처럼 깔끔하게. 이게 저장소 URL에 들어갑니다 (`github.com/j-kim-blog/my-blog`)
3. 메일 인증 → 완료
4. (선택) 무료 플랜 그대로 두기. 별도 결제 카드 등록 안 해도 됨

#### Step 2. Vercel 계정 (3분)

1. https://vercel.com/signup 접속
2. **"Continue with GitHub"** 버튼 클릭 ← 반드시 이거로
3. GitHub 로그인 → 권한 허용
4. Hobby (무료) 플랜 선택
5. 완료. 따로 비밀번호 만들 필요 없음 (GitHub으로 로그인)

> 💡 GitHub 연동으로 가입해야 PHASE 5에서 저장소를 바로 import할 수 있습니다.

#### Step 3. Turso 계정 + DB 생성 + 토큰 발급 (10분)

1. https://app.turso.tech 접속
2. **"Sign in with GitHub"** 클릭 → 권한 허용
3. 첫 화면에서 **Create Database** 클릭
4. 입력값:
   - **Name**: `my-blog-db`
   - **Group**: `default`
   - **Region**: `nrt` (Tokyo, 가장 가까움)
5. **Create Database** 클릭
6. 생성된 DB 카드 클릭 → 상세 페이지로 이동
7. **Database URL** 복사 → 메모장에 저장
   - 모양: `libsql://my-blog-db-내아이디.turso.io`
8. 같은 페이지에서 **"Generate Token"** 클릭
9. **Expiration: Never** / **Permissions: Read & Write** 선택 → Create
10. 나타나는 긴 토큰(`eyJ...`로 시작) 즉시 복사 → 메모장에 저장
    - ⚠️ 이 토큰은 **한 번만 보여줍니다.** 놓치면 새로 발급해야 함

#### Step 4. Google AI Studio (Gemini API Key) (5분)

1. https://aistudio.google.com 접속
2. 구글 계정으로 로그인 (기존 Gmail 계정 사용 가능)
3. 좌측 메뉴에서 **"Get API Key"** 클릭
4. **"Create API Key"** → "Create API key in new project" 선택
5. 발급된 키 (`AIzaSy...`로 시작) 복사 → 메모장에 저장

> 💡 카드 등록 안 해도 됩니다. 무료 플랜 자동 적용.

#### Step 5. Claude Pro 구독 (5분, 유료 $20/월)

1. https://claude.ai 접속 → Sign up
2. 구글 또는 이메일로 가입
3. 가입 후 좌측 하단 본인 이름 → **Settings → Plans & Billing**
4. **"Upgrade to Pro"** 클릭 → 카드 결제
5. 완료 후 한 번 로그아웃했다 다시 로그인 (Pro 활성화 확인)

> 💡 이미 ChatGPT Plus 쓰고 있어도 Claude Pro는 별도. Claude Code 쓰려면 Pro 필수입니다.
> 💡 첫 달만 써보고 환불도 가능 (가입 후 7일 내 환불 정책).

---

### 메모장 체크리스트 — 다음 단계로 가기 전 확인

아래 6개가 메모장에 다 적혀 있는지 확인하세요. 하나라도 비면 멈추고 다시 발급하세요.

```
[ ] GitHub Username       : j-kim-blog
[ ] GitHub 저장소 URL      : (PHASE 1에서 채움)
[ ] Turso DB URL          : libsql://my-blog-db-xxxx.turso.io
[ ] Turso Auth Token      : eyJ... (긴 문자열)
[ ] Gemini API Key        : AIzaSy...
[ ] 관리자 비밀번호         : 본인이 정한 8자 이상 문자열
[ ] Vercel 사이트 URL      : (PHASE 5에서 채움)
```

> 🚨 **절대 하지 말 것**: 위 키들을 카톡·이메일·블로그 어디에도 올리지 마세요. 누가 키를 훔치면 본인 명의로 AI 호출이 무한히 일어나거나 DB가 털립니다.

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
