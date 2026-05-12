# 1강 — 기초 세팅: 0에서 첫 배포까지 (Claude Code 실습)

> **실습 시간**: 약 2시간 30분
> **완성 결과**: `https://coleitai-main.vercel.app` 와 동일한 빈 블로그가 본인 Vercel 도메인에 배포된 상태
> **사용 도구**: Claude Code (터미널에서 돌아가는 AI 코딩 도구), 웹브라우저
> **OS 지원**: 윈도우 10/11, 맥OS (양쪽 다 동일한 절차로 진행됨)
> **선수 지식**: 컴퓨터 켜고 끌 줄 알면 됩니다. 코드는 한 줄도 안 짭니다. 모든 코드는 클로드 코드가 직접 본인 컴퓨터에서 씁니다.

---

## 학습 목표

이 강의를 마치면 본인이 다음을 할 수 있게 됩니다.

1. 블로그 운영에 필요한 5가지 외부 서비스 계정을 만들고 API 키 발급하기
2. 본인 컴퓨터(윈도우/맥)에 **Claude Code** CLI를 설치하고 로그인하기
3. 클로드 코드에게 자연어로 지시해서 Next.js 프로젝트를 0에서 생성하기
4. 프로젝트 헌법(`CLAUDE.md`)을 만들어 AI가 항상 같은 규칙으로 일하게 만들기
5. 본인 코드를 GitHub에 올리고 Vercel에 자동 배포 연결하기

---

## 결과물 미리보기

이 강의 후 본인의 상태:

- **URL**: `https://[본인이름]-blog.vercel.app` (Vercel이 자동 부여)
- **모양**: 빈 홈에 "Hello, [본인 블로그 이름]" 한 줄 표시
- **GitHub**: 본인 계정에 `my-blog` 같은 저장소 생성
- **자동 배포**: GitHub에 푸시할 때마다 Vercel이 새 버전을 알아서 배포

> 화려한 UI나 글쓰기 기능은 **2강 이후**에 차곡차곡 만들어 갑니다. 1강은 "재료 준비 + 토대"까지가 목표입니다.

---

# 클로드 코드(Claude Code)란?

**한 문장 정의**: 본인 컴퓨터 터미널에서 돌아가는 AI 코딩 도우미. 자연어로 시키면 실제로 파일을 만들고, 코드를 수정하고, 명령어를 실행한다.

| | Claude Cowork (웹) | **Claude Code (이번 강의)** |
|---|---|---|
| 어디서 돌아? | claude.ai 웹사이트 | 본인 컴퓨터 터미널 |
| 파일 직접 만져? | 못 함 (가상 환경) | **함** (본인 컴퓨터 파일 직접 수정) |
| 명령어 실행? | 못 함 | **함** (`pnpm dev`, `git push` 등 직접 실행) |
| 비용 | Claude Pro 구독에 포함 | Claude Pro/Max 구독 또는 API 키 |

**왜 클로드 코드인가?** 우리가 만들 블로그는 본인 컴퓨터에 코드가 저장되고, Git/Vercel과 연동되어야 합니다. 웹 도구로는 이게 안 됩니다. 클로드 코드는 실제 개발자가 쓰는 도구를 그대로 씁니다.

---

# Section 1 — 사전 준비: 5개 계정 만들기 (30분)

블로그 운영에 필요한 외부 서비스 5개입니다. 모두 **무료 플랜으로 시작 가능**합니다.

| # | 서비스 | 용도 | 가입 링크 |
|---|---|---|---|
| 1 | **GitHub** | 코드 저장 (=내 작품 보관함) | https://github.com/signup |
| 2 | **Vercel** | 사이트 배포 (=인터넷에 공개) | https://vercel.com/signup |
| 3 | **Turso** | 데이터베이스 (=글 저장 창고) | https://app.turso.tech/ |
| 4 | **Google AI Studio** | Gemini API (=AI 글쓰기) | https://aistudio.google.com/ |
| 5 | **Unsplash Developers** | 무료 사진 (=썸네일 자동 생성) | https://unsplash.com/oauth/applications |

### 1-1. GitHub 가입 + 새 저장소 만들기

1. https://github.com/signup → 이메일·비밀번호·아이디 입력 후 가입
2. 가입 후 우측 상단 `+` → **New repository**
3. 다음 값 입력:
   - **Repository name**: `my-blog` (원하는 이름)
   - **Public** 선택 (Private은 Vercel 무료 플랜 제약 있음)
   - **Add a README file** 체크 **하지 마세요** (클로드 코드가 만듭니다)
4. **Create repository**
5. 다음 화면의 URL을 메모장에 복사. 예:
   ```
   https://github.com/yourname/my-blog.git
   ```

### 1-2. Vercel 가입 (GitHub 계정으로)

1. https://vercel.com/signup → **Continue with GitHub**
2. GitHub 로그인 후 권한 승인
3. Hobby (개인 무료) 플랜 선택. 끝.

### 1-3. Turso 가입 + DB 1개 생성

1. https://app.turso.tech/ → **Sign up with GitHub**
2. 좌측 **Databases** → **Create Database**
3. 입력값:
   - **Name**: `my-blog-db`
   - **Region**: `Tokyo` 또는 `Singapore` (한국에서 가까움)
4. **Create Database**
5. 생성된 DB 클릭 → 우측 상단 **Generate Token** → **Read & Write** → 토큰 발급
6. 메모장에 2개 복사:
   - **Database URL** (`libsql://my-blog-db-yourname.turso.io`)
   - **Auth Token** (긴 문자열)

> ⚠️ Auth Token은 비밀번호와 같습니다. 절대 노출 금지.

### 1-4. Gemini API 키 발급

1. https://aistudio.google.com/ → Google 계정으로 로그인
2. 좌측 **Get API key** → **Create API key**
3. 새 프로젝트 만들거나 기존 선택
4. 발급된 키 메모장에 복사 (`AIzaSy...`)

### 1-5. Unsplash Access Key 발급

1. https://unsplash.com/oauth/applications → 가입 후 **New Application**
2. 약관 4개 체크 → **Accept terms**
3. 정보 입력:
   - Application name: `My Blog`
   - Description: `Personal blog thumbnail`
4. **Create Application**
5. 생성된 앱 페이지에서 **Access Key** 복사

### 1-6. 메모장 점검

여기까지 진행 후 메모장에 다음 6가지가 있어야 합니다.

```
[GitHub 저장소 URL]    https://github.com/yourname/my-blog.git
[Turso DB URL]         libsql://my-blog-db-yourname.turso.io
[Turso Auth Token]     eyJhbGc...(긴 문자열)
[Gemini API Key]       AIzaSy...
[Unsplash Access Key]  ...
[관리자 비밀번호]       본인이 지을 8자 이상 문자열
```

> ✅ 6개 모두 준비됐다면 Section 1 통과.

---

# Section 2 — 본인 컴퓨터 도구 설치 (25분)

윈도우와 맥 따라하는 명령어가 살짝 다릅니다. 본인 OS 섹션만 보세요.

## 🪟 윈도우 사용자

### 2-W-1. PowerShell 열기

1. 시작 메뉴 → `PowerShell` 검색 → **Windows PowerShell** 우클릭 → **관리자 권한으로 실행**
2. 다음 명령어를 한 줄씩 실행해서 **버전 확인**:
   ```powershell
   node -v
   git --version
   ```
3. 둘 다 버전 숫자가 나오면 통과. **하나라도 "찾을 수 없습니다" 에러**가 나면 아래 설치:

### 2-W-2. Node.js 설치 (이미 18+ 있으면 스킵)

1. https://nodejs.org/ 접속 → **LTS** (왼쪽 버튼) 다운로드
2. 설치 마법사 끝까지 **Next** 클릭 (기본값 유지)
3. **설치 후 PowerShell 창 닫고 새로 열어야** 합니다 (PATH 갱신)
4. 다시 `node -v` 확인 → `v20.x.x` 같은 게 나오면 성공

### 2-W-3. Git 설치 (이미 있으면 스킵)

1. https://git-scm.com/download/win 다운로드 → 설치
2. 옵션은 전부 기본값 (Next 연타)
3. 설치 후 PowerShell 새로 열고 `git --version` 확인

### 2-W-4. Claude Code 설치

PowerShell 새 창에서:

```powershell
npm install -g @anthropic-ai/claude-code
```

설치 끝나면:

```powershell
claude --version
```

버전이 나오면 성공.

### 2-W-5. 작업 폴더 만들기

PowerShell에서 다음 한 줄씩 실행:

```powershell
cd $HOME
mkdir my-blog
cd my-blog
```

### 2-W-6. Claude Code 실행 및 로그인

`my-blog` 폴더 안에서:

```powershell
claude
```

처음 실행 시:
1. **로그인 방법 선택** 화면이 뜸
2. **Claude.ai (Pro/Max 구독)** 선택 권장 → 브라우저가 열림 → claude.ai 계정으로 로그인 → 권한 승인
3. (또는 **API Key**를 직접 입력해도 됨 — https://console.anthropic.com/settings/keys)
4. 터미널로 돌아오면 클로드 코드 프롬프트 (`>`) 가 표시됨

> ✅ `>` 프롬프트가 보이면 Section 2 통과. **Section 3로 이동**.

---

## 🍎 맥 사용자

### 2-M-1. Terminal 열기

1. `⌘ + Space` → "Terminal" 입력 → 엔터
2. 다음 명령어로 **버전 확인**:
   ```bash
   node -v
   git --version
   ```
3. 둘 다 버전이 나오면 통과. **하나라도 "command not found"** 면 아래 설치.

### 2-M-2. Homebrew 설치 (이미 있으면 스킵)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치 끝에 나오는 안내(2~3줄)를 그대로 복붙해서 실행 (PATH 추가).

### 2-M-3. Node.js 설치

```bash
brew install node@20
brew link node@20 --force
```

확인:

```bash
node -v
```

`v20.x.x` 가 나오면 성공.

### 2-M-4. Git 설치 (보통 맥에 이미 있음)

`git --version` 안 나오면:

```bash
brew install git
```

### 2-M-5. Claude Code 설치

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

버전이 나오면 성공.

### 2-M-6. 작업 폴더 만들기

```bash
cd ~
mkdir my-blog
cd my-blog
```

### 2-M-7. Claude Code 실행 및 로그인

`my-blog` 폴더 안에서:

```bash
claude
```

처음 실행 시:
1. **로그인 방법 선택** 화면이 뜸
2. **Claude.ai (Pro/Max 구독)** 선택 권장 → 브라우저 열림 → claude.ai 로그인 → 권한 승인
3. (또는 API Key 직접 입력 — https://console.anthropic.com/settings/keys)
4. 터미널로 돌아오면 클로드 코드 프롬프트 (`>`) 표시

> ✅ `>` 프롬프트가 보이면 Section 2 통과.

---

# Section 3 — 첫 대화: 환경 점검 (5분)

지금부터는 윈도우/맥 동일합니다. 클로드 코드 프롬프트 (`>`) 에 다음을 **복붙해서 엔터**.

### 프롬프트 1 — 환경 점검

```
지금부터 새 블로그 프로젝트를 만들 거야.
다음을 해줘.

1. `pwd` 로 현재 위치 확인
2. `node -v`, `npm -v`, `git --version` 실행해서 버전 출력
3. node 가 18 미만이면 멈추고 알려줘
4. pnpm 이 있는지 `pnpm -v` 로 확인. 없으면 `npm install -g pnpm` 으로 설치
5. 모든 결과를 한국어로 보고해줘
```

클로드 코드가 명령어를 직접 실행하기 전에 **"Allow"** 또는 **"y"** 같은 승인을 물어볼 수 있습니다. 첫 실행에는 그냥 승인하세요.

> ✅ "모든 도구 준비 완료" 같은 보고가 나오면 Section 3 통과.

---

# Section 4 — Next.js 프로젝트 생성 (20분)

### 프롬프트 2 — Next.js 생성

클로드 코드 프롬프트에 복붙:

```
지금 폴더(my-blog)에 Next.js 15 프로젝트를 만들어줘.

조건:
- 패키지 매니저: pnpm
- TypeScript: yes
- ESLint: yes
- TailwindCSS: yes
- src/ 디렉토리: yes
- App Router: yes
- Turbopack: no
- import alias: 기본값 (@/*)

이 폴더가 비어 있으니까 `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack` 명령어로 현재 폴더에 바로 설치해.
"directory not empty" 비슷한 메시지가 나오면 빈 폴더라고 무시하고 진행하는 옵션 선택해줘.
설치 끝나면 `ls` 실행해서 생성된 파일들 보여줘.
```

설치 시간: 약 2~5분. 다음과 같은 파일들이 생기면 성공:

```
package.json   next.config.ts   tailwind.config.ts   tsconfig.json
src/           public/          .gitignore           node_modules/
```

### 프롬프트 3 — 첫 실행 확인

```
이제 개발 서버를 띄워서 동작 확인하자.

1. `pnpm dev` 를 백그라운드로 실행
2. 5초 기다린 다음 `curl -s http://localhost:3000` 응답 앞부분 200줄 보여줘
3. 응답에 "Next.js" 또는 HTML 태그가 보이면 성공이라고 알려줘
4. 끝나면 개발 서버를 종료해줘
```

> ✅ "성공"이 나오면 Section 4 통과.

---

# Section 5 — 프로젝트 헌법 CLAUDE.md 작성 (15분)

> **왜 헌법이 필요한가?**
> 클로드 코드는 작업 시작할 때 자동으로 프로젝트 루트의 `CLAUDE.md` 를 읽습니다. 한 번만 잘 써두면 매번 "한국어로 보고해" 같은 지시를 반복할 필요가 없습니다.

### 프롬프트 4 — CLAUDE.md 만들기

```
프로젝트 루트에 `CLAUDE.md` 파일을 만들어줘.
이건 너가 매번 먼저 읽고 따라야 하는 우리 프로젝트의 헌법이야.
다음 내용으로 작성:

---

# My Blog — 프로젝트 헌법

## 1. 프로젝트 의도
누구나(중학생도) 본인의 SEO 블로그를 만들 수 있는 밀키트 템플릿이다.

## 2. 커뮤니케이션 규칙
- 항상 한국어로 보고한다
- 중학생도 이해할 수준으로 설명한다
- 전문 용어는 괄호 안에 쉬운 설명을 붙인다
- 작업 끝나면 3줄 이내로 요약 보고

## 3. 기본 스킬 스택 (모든 작업에 적용)
- development-lifecycle: 요구사항 → 설계 → 구현 → 검증 → 리뷰
- harness-engineering: 단일 진입점, 검증 루프, worklog 기록
- context7-docs: 라이브러리 변경 전 최신 공식 문서 확인
- systematic-debugging: 재현 → 가설 → 검증 → 재검증
- continuous-code-review: 작업 단위별 리뷰

## 4. 안전 영역 (자유 수정 가능)
- src/app/page.tsx 등 페이지
- src/components/
- public/
- tailwind.config.ts

## 5. 위험 영역 (수정 전 반드시 사용자 승인)
- next.config.ts
- prisma/schema.prisma
- src/middleware.ts
- src/app/api/ 내 인증·보안 코드

## 6. 검증 기준 (모든 변경 후 확인)
1. `pnpm build` 빌드 성공
2. `pnpm type-check` TypeScript 에러 0개
3. 모바일에서 깨지지 않음

## 7. worklog 기록 규칙
의미 있는 작업 끝나면 `worklog.md` 에 누적 기록:
- **날짜**:
- **변경**: 수정한 파일과 내용
- **이유**: 왜 필요했는지
- **검증**: 어떻게 확인했는지

## 8. 에러 대응 규칙
1. 에러 메시지를 한국어로 번역해서 보여준다
2. 원인을 1~2줄로 설명한다
3. 코드를 수정하고 빌드/타입체크를 다시 실행한다
4. 해결됐음을 확인하고 보고한다

에러 원문만 그대로 보여주는 건 금지.

---

이 내용으로 CLAUDE.md 저장하고, 빈 worklog.md 파일도 같이 만들어줘.
worklog.md 첫 줄은 `# Worklog` 로.
```

### 프롬프트 5 — 헌법 작동 테스트

```
방금 만든 CLAUDE.md 를 처음부터 다시 읽고, 우리 프로젝트의 규칙을 3줄로 요약해줘.
```

클로드 코드가 한국어로 짧게 요약해주면 통과. Section 5 완료.

---

# Section 6 — 첫 페이지 만들기 (20분)

### 프롬프트 6 — 사이트 정보 + 빈 홈

본인 이름·블로그 이름으로 일부 수정해서 복붙:

```
사이트 정보를 한 곳에서 관리할 수 있게 설정 파일을 만들어줘.

1. `src/config/site.config.ts` 생성, 다음 내용:

   export const siteConfig = {
     name: '내 이름 블로그',           // ← 본인 블로그 이름
     description: '나의 첫 SEO 블로그', // ← 한 줄 설명
     url: 'https://example.com',        // ← 일단 그대로
     author: {
       name: '본인 이름',
       email: 'me@example.com',
     },
     keywords: ['블로그', '나의 일기'],
   } as const

2. `src/app/page.tsx` 를 수정:
   - 화면 가운데에 큰 글자로 사이트 이름
   - 그 아래 작게 description
   - 흰 배경, 검정 글자
   - TailwindCSS 클래스 사용

3. 끝나면 `pnpm dev` 띄우고 `curl -s http://localhost:3000 | head -50` 로 사이트 이름이 보이는지 확인하고 서버 종료
```

### 본인 컴퓨터 브라우저로 직접 확인

같은 터미널 말고 **새 터미널 창**을 열어서:

```bash
cd ~/my-blog
pnpm dev
```

(윈도우면 PowerShell, 맥이면 Terminal)

브라우저로 http://localhost:3000 접속 →
- 사이트 이름이 큰 글자로 보이는지
- 설명이 그 아래 작게 보이는지

확인 후 그 터미널에서 `Ctrl + C` 로 서버 종료.

> ✅ 보이면 Section 6 통과.

---

# Section 7 — 환경 변수 (.env) 설정 (15분)

### 프롬프트 7 — .env 파일 만들기

```
환경 변수 파일을 만들어줘.

1. 프로젝트 루트에 `.env.example` 작성, 내용:

   # 사이트 URL (Vercel 배포 후 채움)
   NEXT_PUBLIC_SITE_URL=https://example.com

   # Turso 데이터베이스
   TURSO_DATABASE_URL=
   DATABASE_AUTH_TOKEN=

   # Gemini AI
   GEMINI_API_KEY=

   # 관리자 비밀번호
   ADMIN_PASSWORD=changeme

   # Unsplash
   UNSPLASH_ACCESS_KEY=

   # Prisma 로컬 SQLite (그대로 두기)
   DATABASE_URL=file:./dev.db

2. `.env.example` 을 그대로 복사해서 `.env` 파일 생성.

3. `.gitignore` 에 `.env` 가 있는지 확인. 없으면 추가.

4. `git status` 실행해서 .env 가 untracked 에 안 보이는지 확인.
   만약 보이면 .gitignore 손봐줘.

5. 한국어로 결과 보고.
```

### 본인이 직접 .env 채우기 — 중요

본인 컴퓨터의 IDE(VS Code 추천) 또는 메모장으로 `~/my-blog/.env` 파일을 엽니다.

> **윈도우 메모장 주의**: 메모장으로 저장하면 `.env.txt` 가 될 수 있음. VS Code 또는 PowerShell의 `notepad .env` 사용 권장.
> **VS Code 설치**: https://code.visualstudio.com/

Section 1에서 메모해둔 값들로 채우기:

```
NEXT_PUBLIC_SITE_URL=https://example.com   # 일단 그대로
TURSO_DATABASE_URL=libsql://my-blog-db-yourname.turso.io
DATABASE_AUTH_TOKEN=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
ADMIN_PASSWORD=내가지은비밀번호12345
UNSPLASH_ACCESS_KEY=...
DATABASE_URL=file:./dev.db
```

저장 후 클로드 코드에:

### 프롬프트 8 — .env 안전 점검

```
.env 작성 끝났어. 다음 두 가지를 확인해줘.

1. `cat .env | grep -E "^[A-Z_]+="` 실행해서 모든 키가 값을 갖고 있는지 (빈 값은 알려줘)
2. `git status` 결과에 `.env` 가 절대 안 보여야 해. 보이면 .gitignore 가 잘못된 거니까 즉시 고쳐줘.
3. 한국어로 결과 보고.
```

> ✅ "모든 키 값 있음 + .env 가 git 추적에서 제외됨" 보고 나오면 Section 7 통과.

---

# Section 8 — GitHub 첫 푸시 (15분)

### 프롬프트 9 — Git 초기화 + 푸시

본인 GitHub 저장소 URL을 7번째 단계에 넣고 복붙:

```
이제 코드를 GitHub에 올릴 거야.

1. `git init` 으로 git 시작
2. `git branch -M main` 으로 메인 브랜치를 main 으로 설정
3. `git add -A` 로 모든 파일 스테이지
4. `git status` 로 .env 가 안 보이는지 다시 확인. 보이면 멈추고 알려줘.
5. 커밋 메시지:
   "feat: 블로그 프로젝트 초기 셋업

   - Next.js 15 + TypeScript + TailwindCSS 기본 구성
   - 사이트 설정 (src/config/site.config.ts)
   - 환경 변수 템플릿 (.env.example)
   - 프로젝트 헌법 (CLAUDE.md)
   - 빈 홈페이지"
6. 원격 저장소 연결:
   git remote add origin https://github.com/yourname/my-blog.git
   ← 이 URL은 나의 실제 저장소로 바꿔서 실행해
7. `git push -u origin main` 으로 푸시

푸시 도중 GitHub 인증 요청이 뜨면 멈추고 나에게 알려줘.
```

### GitHub 인증 (처음에만)

푸시 명령이 인증을 요구하면 OS별로:

**🍎 맥**: 브라우저가 자동으로 열림 → GitHub 로그인 → 권한 승인 → 자동 완료

**🪟 윈도우**:
- Git for Windows 설치 시 함께 들어오는 **Git Credential Manager** 가 자동으로 브라우저 인증 창을 띄움 → GitHub 로그인 → 자동 완료
- 만약 안 뜨면 **PAT(Personal Access Token)** 직접 발급:
  1. https://github.com/settings/tokens → **Generate new token (classic)**
  2. **Scopes**: `repo` 만 체크
  3. 발급된 토큰 복사 → `git push` 시 username에 본인 GitHub ID, password에 **토큰** 붙여넣기

### 푸시 결과 확인

브라우저로 `https://github.com/yourname/my-blog` 접속:

- ✅ 파일 목록에 `CLAUDE.md`, `package.json`, `src/` 가 보임
- ✅ `.env` 가 **보이지 않음**
- ✅ `node_modules/` 가 보이지 않음 (.gitignore 덕분)

> 만약 .env 가 보이면 → 비상사태. 곧바로 FAQ Q5 참고.

---

# Section 9 — Vercel 자동 배포 연결 (20분)

이 단계는 **브라우저로 직접** 진행합니다. 클로드 코드는 Vercel 대시보드를 못 만집니다.

### 9-1. Vercel 프로젝트 생성

1. https://vercel.com/new 접속
2. **Import Git Repository** → `my-blog` 옆 **Import**
3. 처음이면 GitHub 권한 요청 → **Install** → 본인 저장소 접근 권한 부여
4. **Configure Project** 화면:
   - **Framework Preset**: `Next.js` (자동 감지)
   - **Build Command**: 비워두기 (자동)
   - **Output Directory**: 비워두기 (자동)
5. **Environment Variables** 섹션을 펼치기 → Section 7의 .env 값을 그대로 등록:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 일단 비워두기 (배포 후 추가) |
| `TURSO_DATABASE_URL` | Section 1-3 값 |
| `DATABASE_AUTH_TOKEN` | Section 1-3 값 |
| `GEMINI_API_KEY` | Section 1-4 값 |
| `ADMIN_PASSWORD` | 본인이 정한 비밀번호 |
| `UNSPLASH_ACCESS_KEY` | Section 1-5 값 |
| `DATABASE_URL` | `file:./dev.db` |

6. **Deploy** 클릭
7. 빌드 진행 (2~5분 대기)

### 9-2. 첫 배포 결과 확인

배포 완료 후 Vercel이 자동 도메인을 부여 (예: `https://my-blog-yourname.vercel.app`).

브라우저로 그 URL 접속:
- 사이트 이름이 보이는지
- 모바일 (개발자 도구 → 모바일 뷰)에서도 안 깨지는지

### 9-3. NEXT_PUBLIC_SITE_URL 채우기

1. Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_SITE_URL` 추가:
   - Value: 방금 받은 본인 URL (예: `https://my-blog-yourname.vercel.app`)
3. **Save**
4. **Deployments** → 최근 배포 우측 `...` → **Redeploy**

### 9-4. 자동 배포 검증

클로드 코드에 복붙:

### 프롬프트 10 — 자동 배포 작동 확인

```
홈페이지(src/app/page.tsx)에서 사이트 이름 아래에 다음 한 줄을 추가해줘.

"환영합니다! 곧 멋진 글들을 발행할 예정이에요."

작업 끝나면:
1. 변경 내용 보여주기
2. git add, git commit (메시지: "feat: 홈페이지 환영 문구 추가")
3. git push origin main
4. 한국어로 푸시 결과 보고
```

푸시 후 약 10~20초 뒤:
- Vercel Dashboard → **Deployments** 탭에 새 빌드가 자동으로 떠 있는지 확인
- 빌드 완료 후 본인 URL 새로고침 → 환영 문구가 보이면 통과

> ✅ Section 9 통과 = **1강 전체 완료**.

---

# 1강 체크포인트

다음 6가지를 모두 만족하면 1강 완료입니다.

- [ ] 본인 컴퓨터에서 `claude` 명령으로 클로드 코드 실행 가능
- [ ] GitHub 저장소 `my-blog` 에 코드가 올라가 있음
- [ ] `.env` 가 GitHub에 노출되지 않음
- [ ] Vercel 무료 도메인 (`*.vercel.app`)으로 사이트 접속 가능
- [ ] 사이트에 본인 블로그 이름이 표시됨
- [ ] 코드 푸시 → Vercel 자동 배포가 작동
- [ ] 프로젝트 루트에 `CLAUDE.md`, `worklog.md` 가 있음

---

# 자주 막히는 곳 (FAQ)

### Q1. 클로드 코드를 실행하면 "claude: command not found" (맥) / "claude는 인식되지 않습니다" (윈도우)

PATH 문제. 다음 순서로 해결:

1. 터미널/PowerShell **완전히 닫고 새 창** 열기 (PATH 갱신)
2. 새 창에서 `claude --version` 다시 시도
3. 그래도 안 되면:
   - **맥**: `npm root -g` 실행 → 나온 경로 + `/bin` 을 PATH에 추가
   - **윈도우**: `npm root -g` → 결과 경로의 상위 폴더를 시스템 환경 변수 Path 에 추가 후 PC 재시작

### Q2. `pnpm dev` 가 "port 3000 already in use" 에러

클로드 코드에 복붙:
```
3000 포트가 잡혀 있어. 무엇이 잡고 있는지 확인하고 (맥: lsof -i :3000, 윈도우: netstat -ano | findstr 3000), 그 프로세스를 종료한 다음 다시 pnpm dev 해줘.
```

### Q3. 윈도우에서 PowerShell이 `npm install -g ...` 권한 에러

PowerShell을 **관리자 권한으로** 실행하지 않은 경우. 시작 메뉴 → PowerShell 우클릭 → **관리자 권한으로 실행** 후 재시도.

### Q4. Vercel 빌드 실패 — "Cannot find module 'xxx'"

클로드 코드에 복붙:
```
Vercel 빌드 로그에 다음 에러가 나왔어:
[여기에 에러 메시지 그대로 붙여넣기]

원인 파악하고 한국어로 설명해줘. 해결 방법도 제시해줘. 우리 프로젝트 코드를 직접 수정해도 돼.
```

### Q5. ⚠️ 비상: .env 가 GitHub에 올라갔다

즉시 클로드 코드에 복붙:
```
.env 가 GitHub에 실수로 올라갔어. 비상 상황이야.

1. 어디서 다음 키들을 무효화/재발급하면 되는지 한국어로 알려줘:
   - Turso Auth Token
   - Gemini API Key
   - Unsplash Access Key

2. git에서 .env 를 제거하는 절차 진행:
   - `git rm --cached .env`
   - .gitignore 에 .env 추가
   - 커밋·푸시

3. GitHub 커밋 히스토리에서도 완전히 지우는 방법(BFG Repo-Cleaner)을 한국어로 단계별 설명해줘.

작업 끝날 때까지 다른 일 하지 마.
```

### Q6. 클로드 코드가 매번 "Allow"를 묻는다

기본 설정이 안전 모드입니다. 신뢰할 수 있는 명령은 자동 승인할 수 있습니다:

클로드 코드 실행 중에 `/permissions` 명령으로 권한 정책 변경 가능. 단, **공용 컴퓨터에서는 자동 승인 켜지 마세요**.

### Q7. 맥에서 `pnpm` 설치 시 "permission denied"

```bash
sudo npm install -g pnpm
```

(비밀번호 입력 요구됨)

---

# 2강 예고

1강은 빈 껍데기 + 자동 배포 흐름까지. 2강에서는:

- **데이터베이스 연결** (Prisma + Turso)
- **첫 블로그 글 모델** (`Post` 테이블)
- **글 목록 페이지** (`/posts`)
- **글 상세 페이지** (`/posts/[slug]`)

까지. 약 2시간 30분 분량 예정.

---

# 강사 노트 (수강생용 X)

## 1강 실제 난이도 평가

| 구간 | 예상 시간 | 막힐 확률 | 막히는 이유 |
|---|---|---|---|
| Section 1 (계정 5개) | 30분 | 30% | Turso·Unsplash 영어 UI 당황 |
| Section 2 (도구 설치) | 25분 | **45%** | 윈도우 PATH 갱신 안 됨, npm 권한 |
| Section 3 (환경 점검) | 5분 | 5% | 거의 없음 |
| Section 4 (Next.js 생성) | 20분 | 15% | 빈 폴더 아니면 설치 실패 |
| Section 5 (CLAUDE.md) | 15분 | 0% | 복붙이라 안 막힘 |
| Section 6 (첫 페이지) | 20분 | 15% | tailwind 인식 가끔 |
| Section 7 (.env) | 15분 | 25% | 메모장이 .env.txt 만드는 사고 |
| Section 8 (GitHub 푸시) | 15분 | **40%** | 윈도우 PAT 인증 어려움 |
| Section 9 (Vercel 배포) | 20분 | 25% | 환경변수 빠뜨려 빌드 실패 흔함 |

**가장 큰 난관 TOP 3**:
1. 윈도우 사용자의 Node.js + PATH 설정 (Section 2)
2. 윈도우 사용자의 GitHub PAT 인증 (Section 8)
3. 메모장으로 .env 만들 때 .env.txt 사고 (Section 7)

## 수강생에게 미리 안내할 점

1. **윈도우 사용자**:
   - PowerShell **관리자 권한**으로 실행 필수
   - VS Code 미리 설치 권장 (.env 편집 사고 방지)
   - PAT 발급 짧은 영상 별도 권장
2. **맥 사용자**: 비교적 순조로움. Homebrew 미리 설치되어 있으면 더 빠름
3. **API 키 메모**: 메모장보다 **1Password/Bitwarden** 권장 (장기 안전)
4. **클로드 구독**: Claude.ai Pro/Max 또는 API key 필요 — 미리 안내

## 1강 보완 체크리스트 (1회차 운영 후 업데이트)

- [ ] 윈도우 Node.js + PATH 설정 짧은 영상
- [ ] 윈도우 PAT 발급 짧은 영상
- [ ] VS Code 설치 + 폴더 열기 짧은 영상
- [ ] 각 Section 끝 1분 체크포인트 영상
- [ ] FAQ Q5 (.env 노출) 사고를 별도 비상 페이지로 분리
- [ ] Claude.ai 구독·API 키 선택 가이드 별도 페이지
