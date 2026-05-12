# 1강 — 기초 세팅: 0에서 첫 배포까지

> **실습 시간**: 약 2시간 30분
> **완성 결과**: `https://coleitai-main.vercel.app` 와 동일한 빈 블로그가 본인 Vercel 도메인에 배포된 상태
> **사용 도구**: Claude Cowork (이하 "코워크"), 웹브라우저, 본인 컴퓨터(맥/윈도우/리눅스 무관)
> **선수 지식**: 컴퓨터 켜고 끌 줄 알면 됨. 코드는 한 줄도 안 짭니다. 모든 코드는 코워크가 씁니다.

---

## 학습 목표

이 강의를 마치면 본인이 다음을 할 수 있게 됩니다.

1. 블로그 운영에 필요한 5가지 외부 서비스 계정을 만들고 API 키를 발급받기
2. Claude Cowork를 사용해 Next.js 프로젝트를 0에서 생성하기
3. 프로젝트 헌법(`CLAUDE.md`)을 작성하여 AI가 항상 같은 규칙으로 일하게 만들기
4. 본인의 코드를 GitHub에 올리기
5. Vercel에 자동 배포 연결하기 (앞으로 코드만 푸시하면 알아서 배포됨)

---

## 결과물 미리보기

이 강의 후 본인의 사이트는 다음 상태가 됩니다.

- **URL**: `https://[본인이름]-blog.vercel.app` (Vercel이 자동 부여)
- **모양**: 빈 홈페이지에 "Hello, [본인 블로그 이름]" 한 줄만 표시됨
- **GitHub**: 본인 계정에 `my-blog` 같은 새 저장소 생성됨
- **연동**: GitHub에 푸시할 때마다 Vercel이 자동으로 새 버전을 배포

> 화려한 UI나 글쓰기 기능은 **2강 이후**에 차곡차곡 만들어 갑니다. 1강은 "재료 준비 + 조립 가능한 상태" 까지가 목표입니다.

---

# Section 1 — 사전 준비물: 5개 계정 만들기 (30분)

블로그 한 개를 운영하려면 다음 5개의 외부 서비스가 필요합니다. 모두 **무료 플랜으로 시작 가능**합니다.

| # | 서비스 | 용도 | 가입 링크 |
|---|---|---|---|
| 1 | **GitHub** | 코드 저장 (=내 작품 보관함) | https://github.com/signup |
| 2 | **Vercel** | 사이트 배포 (=실제 인터넷에 공개) | https://vercel.com/signup |
| 3 | **Turso** | 데이터베이스 (=글 저장 창고) | https://app.turso.tech/ |
| 4 | **Google AI Studio** | Gemini API (=AI로 글 자동 작성) | https://aistudio.google.com/ |
| 5 | **Unsplash Developers** | 무료 사진 (=글 썸네일 자동 생성) | https://unsplash.com/oauth/applications |

### 1-1. GitHub 가입 + 새 저장소 만들기

1. https://github.com/signup → 이메일·비밀번호·아이디 입력 후 가입
2. 가입 후 우측 상단 `+` 버튼 → **New repository** 클릭
3. 다음 값 입력:
   - **Repository name**: `my-blog` (원하는 이름 가능)
   - **Public** 선택 (Private은 Vercel 무료 플랜 제약 있음)
   - **Add a README file** 체크 **하지 마세요** (코워크가 만들 거예요)
4. **Create repository** 클릭
5. 다음 화면의 URL을 복사해서 메모장에 붙여넣으세요. 예시:
   ```
   https://github.com/yourname/my-blog.git
   ```

### 1-2. Vercel 가입 (GitHub 계정으로)

1. https://vercel.com/signup → **Continue with GitHub** 클릭
2. GitHub 로그인 후 권한 승인
3. Hobby (개인용 무료) 플랜 선택
4. 가입 완료. 아직 프로젝트를 만들지는 않습니다. **나중에 Section 9에서 합니다.**

### 1-3. Turso 가입 + 데이터베이스 1개 생성

1. https://app.turso.tech/ → **Sign up with GitHub**
2. 가입 완료 후 좌측 **Databases** → **Create Database**
3. 다음 값 입력:
   - **Name**: `my-blog-db` (원하는 이름)
   - **Region**: 가까운 지역 (한국이면 `Tokyo` 또는 `Singapore`)
4. **Create Database** 클릭
5. 생성된 DB 클릭 → 우측 상단 **Generate Token** → **Read & Write** 선택 → 토큰 생성
6. 다음 2개를 메모장에 복사:
   - **Database URL** (예: `libsql://my-blog-db-yourname.turso.io`)
   - **Auth Token** (긴 문자열)

> ⚠️ Auth Token은 비밀번호와 같습니다. 다른 사람에게 보여주지 마세요.

### 1-4. Gemini API 키 발급

1. https://aistudio.google.com/ → Google 계정으로 로그인
2. 좌측 **Get API key** → **Create API key**
3. 새 프로젝트 만들거나 기존 프로젝트 선택
4. 생성된 API 키를 메모장에 복사 (예: `AIzaSy...`)

### 1-5. Unsplash Access Key 발급

1. https://unsplash.com/oauth/applications → 가입 후 **New Application**
2. 약관 체크박스 4개 모두 체크 → **Accept terms**
3. 앱 이름·설명 입력 (자유)
   - Application name: `My Blog`
   - Description: `Personal blog thumbnail` 등 아무거나
4. **Create Application** 클릭
5. 생성된 앱 페이지에서 **Access Key** 복사

### 1-6. 메모장 점검

여기까지 진행하면 메모장에 다음 6가지가 있어야 합니다.

```
[GitHub 저장소 URL]   https://github.com/yourname/my-blog.git
[Turso DB URL]        libsql://my-blog-db-yourname.turso.io
[Turso Auth Token]    eyJhbGc...(긴 문자열)
[Gemini API Key]      AIzaSy...
[Unsplash Access Key] ...
[관리자 비밀번호]      본인이 지을 8자 이상 문자열
```

> ✅ 6개 모두 준비됐다면 Section 1 통과입니다.

---

# Section 2 — Claude Cowork 환경 준비 (10분)

### 2-1. 코워크 접속

1. https://claude.ai 에 로그인 (구독 필요)
2. 좌측 메뉴 → **Cowork** 또는 코드 작업 공간 선택
3. 새 작업 공간(Workspace) 생성:
   - 이름: `my-blog`
   - 언어: `한국어`

### 2-2. 작업 폴더 만들기

코워크 안에서 다음 프롬프트를 그대로 복사해서 붙여넣고 보내세요.

```
지금부터 새로운 블로그 프로젝트를 만들 거야.
다음을 해줘.

1. 홈 디렉토리에 `my-blog` 라는 빈 폴더를 만들어
2. 그 안으로 들어가서 `pwd` 실행해서 현재 위치 확인
3. `node -v`, `npm -v`, `git --version` 실행해서 버전 출력
4. 만약 노드(node)가 18 미만이거나 설치 안 되어 있으면 알려줘. 그러면 내가 설치할게.

작업 끝나면 한국어로 결과를 보고해줘.
```

### 2-3. 노드 설치 (필요시만)

코워크가 "노드가 없거나 18 미만"이라고 하면 본인 OS에 맞게 설치:

- **맥**: 터미널에서 `brew install node@20` (Homebrew 없으면 https://brew.sh 먼저)
- **윈도우**: https://nodejs.org/ → LTS 버전 다운로드 → 설치
- **리눅스**: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`

설치 후 코워크에 다시 `node -v` 실행 요청.

---

# Section 3 — Next.js 프로젝트 생성 (20분)

### 3-1. 프로젝트 생성 프롬프트

코워크에 다음을 복붙:

```
my-blog 폴더 안에서 Next.js 15 프로젝트를 만들어줘.

조건:
- 패키지 매니저: pnpm (없으면 `npm install -g pnpm` 으로 먼저 설치)
- TypeScript: yes
- ESLint: yes
- TailwindCSS: yes
- src/ 디렉토리 사용: yes
- App Router: yes
- Turbopack: no
- import alias 변경: no (기본 @/* 사용)

명령어는 `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` 비슷한 형태로 실행해.
설치 끝나면 `ls` 실행해서 생성된 파일들 보여줘.
```

코워크가 작업하는 동안 약 2~5분 기다리세요. 완료되면 다음과 같은 파일들이 보일 겁니다.

```
package.json   next.config.ts   tailwind.config.ts   tsconfig.json
src/           public/          .gitignore           node_modules/
```

### 3-2. 첫 실행으로 동작 확인

코워크에 다음 복붙:

```
이제 개발 서버를 띄워서 동작 확인하자.

1. `pnpm dev` 를 백그라운드로 실행
2. 5초 정도 기다린 다음 http://localhost:3000 으로 curl 해서 응답 첫 100줄 보여줘
3. 응답에 "Next.js" 또는 "Welcome" 단어가 보이면 성공이라고 알려줘
4. 끝나면 개발 서버 멈춰
```

> ✅ "성공"이 보이면 본인 컴퓨터에서 Next.js가 돌아가고 있는 겁니다. Section 3 통과.

---

# Section 4 — 프로젝트 헌법 CLAUDE.md 작성 (15분)

> **왜 헌법이 필요한가?**
> 코워크에 매번 "한국어로 설명해줘", "코드 바꿀 때 조심해줘" 같은 지시를 반복하면 피곤합니다. 프로젝트 루트의 `CLAUDE.md` 파일은 **AI가 항상 먼저 읽고 따르는 규칙서**입니다. 한 번만 잘 써두면 같은 지시를 안 해도 됩니다.

### 4-1. CLAUDE.md 생성 프롬프트

코워크에 다음을 복붙:

```
my-blog 프로젝트의 루트에 `CLAUDE.md` 파일을 만들어줘.
이 파일은 앞으로 너가 매번 먼저 읽고 따라야 하는 우리 프로젝트의 헌법이야.
다음 내용으로 작성해줘.

---

# My Blog — 프로젝트 헌법

## 1. 프로젝트 의도
누구나 (중학생도) 본인의 SEO 블로그를 만들 수 있는 밀키트 템플릿이다.

## 2. 커뮤니케이션 규칙
- 항상 한국어로 보고한다
- 중학생도 이해할 수 있는 수준으로 설명한다
- 전문 용어는 괄호 안에 쉬운 설명을 붙인다
- 작업 끝나면 3줄 이내로 요약 보고

## 3. 기본 스킬 스택 (모든 작업에 적용)
- development-lifecycle: 요구사항 → 설계 → 구현 → 검증 → 리뷰
- harness-engineering: 단일 진입점, 검증 루프, worklog 기록
- context7-docs: 라이브러리 변경 전 최신 공식 문서 확인
- systematic-debugging: 재현 → 가설 → 검증 → 재검증
- continuous-code-review: 작업 단위별 리뷰 루프

## 4. 안전 영역 (자유롭게 수정 가능)
- src/app/page.tsx 등 페이지
- src/components/
- public/
- tailwind.config.ts (디자인)

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
의미 있는 작업 끝나면 `worklog.md` 에 다음 형식으로 누적 기록:
- **날짜**:
- **변경**: 수정한 파일과 내용
- **이유**: 왜 이 변경이 필요했는지
- **검증**: 어떻게 확인했는지

## 8. 에러 대응 규칙
1. 에러 메시지를 한국어로 번역해 사용자에게 보여준다
2. 원인을 1~2줄로 설명한다
3. 코드를 수정하고 빌드/타입체크를 다시 실행한다
4. 해결됐음을 확인하고 보고한다

에러 원문을 그대로 보여주지 않는다.

---

이 내용으로 `CLAUDE.md` 를 저장하고, 동시에 빈 `worklog.md` 파일도 만들어줘.
worklog.md 첫 줄은 `# Worklog` 로 시작하면 돼.
```

### 4-2. 헌법이 실제로 작동하는지 테스트

다음 프롬프트로 테스트:

```
방금 만든 CLAUDE.md 를 읽고, 우리 프로젝트의 규칙을 본인 말로 3줄로 요약해줘.
```

코워크가 한국어로 짧게 요약해주면 통과입니다. Section 4 완료.

---

# Section 5 — 첫 페이지 만들기: 빈 홈 (20분)

### 5-1. 사이트 정보 설정

코워크에 다음을 복붙 (본인 정보로 일부 수정):

```
프로젝트의 사이트 정보를 한 곳에서 관리할 수 있게 설정 파일을 만들어줘.

1. `src/config/site.config.ts` 파일을 만들고 다음 내용으로 채워줘:

   ```typescript
   export const siteConfig = {
     name: '내 이름 블로그',           // ← 여기는 본인 블로그 이름
     description: '나의 첫 SEO 블로그',  // ← 한 줄 설명
     url: 'https://example.com',        // ← 일단 이대로 두면 됨
     author: {
       name: '본인 이름',                 // ← 본인 이름
       email: 'me@example.com',
     },
     keywords: ['블로그', '나의 일기'],   // ← 검색 키워드
   } as const
   ```

2. 그리고 `src/app/page.tsx` 를 수정해서 다음처럼 만들어줘:
   - 화면 가운데에 큰 글자로 사이트 이름 표시
   - 그 아래 작게 description 표시
   - 배경색은 흰색, 글자색은 검정
   - TailwindCSS 클래스 사용

작업 끝나면 `pnpm dev` 띄우고 http://localhost:3000 응답에서 사이트 이름이 보이는지 확인해줘.
```

### 5-2. 브라우저로 직접 확인

본인 컴퓨터 브라우저에서 http://localhost:3000 에 접속해서:

- 사이트 이름이 큰 글자로 보이는지
- 그 아래 설명이 보이는지

> ✅ 보이면 Section 5 통과. 안 보이면 다음 프롬프트로 코워크에 도움 요청:
> ```
> http://localhost:3000 이 안 떠. 에러 메시지가 [여기에 화면 캡처 또는 텍스트] 야. 해결해줘.
> ```

---

# Section 6 — 환경 변수 (.env) 설정 (15분)

### 6-1. 환경 변수 파일 만들기

코워크에 다음을 복붙:

```
프로젝트 루트에 환경 변수 파일을 만들어줘.

1. `.env.example` 파일에 다음 내용을 넣어줘 (이건 깃에 올라가는 템플릿):

   ```
   # 사이트 URL (Vercel 배포 후 채움)
   NEXT_PUBLIC_SITE_URL=https://example.com

   # Turso 데이터베이스
   TURSO_DATABASE_URL=
   DATABASE_AUTH_TOKEN=

   # Gemini AI
   GEMINI_API_KEY=

   # 관리자 비밀번호
   ADMIN_PASSWORD=changeme

   # Unsplash (썸네일 자동 생성)
   UNSPLASH_ACCESS_KEY=

   # 로컬 개발용 SQLite (Prisma 내부용)
   DATABASE_URL=file:./dev.db
   ```

2. 그 다음 `.env.example` 을 그대로 복사해서 `.env` 파일을 만들어줘.
   이 .env 는 절대 깃에 안 올라가야 해.

3. `.gitignore` 에 `.env` 가 포함되어 있는지 확인해줘. 없으면 추가.

4. 작업 끝나면 한국어로 결과 보고해줘.
```

### 6-2. .env 파일에 실제 값 채우기

본인 컴퓨터에서 `my-blog/.env` 파일을 메모장이나 VSCode로 열고 Section 1에서 메모해둔 값들을 채웁니다.

```
NEXT_PUBLIC_SITE_URL=https://example.com   ← 일단 그대로 (Vercel 배포 후 수정)
TURSO_DATABASE_URL=libsql://my-blog-db-yourname.turso.io   ← Section 1-3 값
DATABASE_AUTH_TOKEN=eyJhbGc...                              ← Section 1-3 값
GEMINI_API_KEY=AIzaSy...                                    ← Section 1-4 값
ADMIN_PASSWORD=내가지은비밀번호12345                          ← Section 1-6 값
UNSPLASH_ACCESS_KEY=...                                     ← Section 1-5 값
DATABASE_URL=file:./dev.db                                   ← 이건 그대로
```

저장 후 코워크에:

```
.env 파일 작성 끝났어. .env 가 .gitignore 에 포함됐는지 다시 한번 확인하고,
`git status` 실행해서 .env 가 untracked 목록에 나오지 않는지 확인해줘.
.env 가 untracked 에 나오면 절대 커밋되면 안 되니까 .gitignore 를 다시 손봐줘.
```

> ✅ `git status` 결과에 `.env` 가 안 보이면 안전합니다.

---

# Section 7 — GitHub에 첫 푸시 (15분)

### 7-1. Git 초기화 + 첫 커밋

코워크에 다음을 복붙 (본인 GitHub 저장소 URL로 한 줄 수정):

```
이제 코드를 GitHub에 올릴 거야.

1. `git init` 으로 git 시작
2. `git branch -M main` 으로 메인 브랜치 이름 main 으로 설정
3. `git add -A` 로 모든 파일 스테이지 (.env 는 .gitignore 덕분에 제외됨)
4. `git status` 로 스테이지된 파일 확인 — 만약 .env 가 보이면 멈춰서 알려줘
5. 커밋 메시지는 다음으로:
   "feat: 블로그 프로젝트 초기 셋업

   - Next.js 15 + TypeScript + TailwindCSS 4 기본 구성
   - 사이트 설정 파일 (src/config/site.config.ts)
   - 환경 변수 템플릿 (.env.example)
   - 프로젝트 헌법 (CLAUDE.md)
   - 빈 홈페이지"
6. GitHub 원격 저장소 연결:
   `git remote add origin https://github.com/yourname/my-blog.git`
   ← 여기 URL은 내가 알려준 거 그대로 써
7. `git push -u origin main` 으로 푸시

푸시 도중에 GitHub 인증 창이 뜨면 나에게 알려줘.
```

### 7-2. GitHub 인증 (처음에만)

푸시 명령어가 인증을 요구하면:

- **맥/리눅스**: 브라우저로 인증 페이지가 자동으로 열림 → GitHub 로그인 → 권한 승인
- **윈도우**: GitHub Desktop 또는 PAT(Personal Access Token) 필요
  - PAT 발급: https://github.com/settings/tokens → **Generate new token (classic)** → `repo` 권한 체크 → 발급된 토큰을 비밀번호 자리에 붙여넣기

### 7-3. 푸시 확인

브라우저로 `https://github.com/yourname/my-blog` 접속:

- 파일 목록에 `CLAUDE.md`, `package.json`, `src/` 가 보이는지
- `.env` 는 **보이지 않아야** 함 (보이면 즉시 코워크에 알려서 삭제)

> ✅ 위 조건 만족하면 Section 7 통과.

---

# Section 8 — Vercel 자동 배포 연결 (20분)

### 8-1. Vercel 프로젝트 생성

브라우저로 진행 (코워크는 이 단계 못 함):

1. https://vercel.com/new 접속
2. **Import Git Repository** → 본인 GitHub 저장소 `my-blog` 옆 **Import** 클릭
3. (처음이면 GitHub 권한 승인 요청이 뜸 → 승인)
4. **Configure Project** 화면에서:
   - **Framework Preset**: `Next.js` (자동 감지됨)
   - **Build Command**: 비워두기 (자동)
   - **Output Directory**: 비워두기 (자동)
5. **Environment Variables** 섹션 펼치기 → Section 6의 .env 내용을 그대로 입력:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 일단 비워두기 (배포 후 추가) |
| `TURSO_DATABASE_URL` | Section 1-3 값 |
| `DATABASE_AUTH_TOKEN` | Section 1-3 값 |
| `GEMINI_API_KEY` | Section 1-4 값 |
| `ADMIN_PASSWORD` | 본인 비밀번호 |
| `UNSPLASH_ACCESS_KEY` | Section 1-5 값 |
| `DATABASE_URL` | `file:./dev.db` |

6. **Deploy** 클릭
7. 빌드 진행 (약 2~5분 대기)

### 8-2. 첫 배포 결과 확인

배포 완료 후 Vercel이 자동 도메인을 부여합니다. 예: `https://my-blog-yourname.vercel.app`

브라우저로 그 URL에 접속해서:

- 사이트 이름이 큰 글자로 보이는지
- 모바일 화면에서도 깨지지 않는지

### 8-3. NEXT_PUBLIC_SITE_URL 채우기

1. Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_SITE_URL` 추가:
   - Value: `https://my-blog-yourname.vercel.app` (방금 받은 본인 URL)
3. **Save**
4. **Deployments** 탭 → 최근 배포 우측 `...` → **Redeploy** 클릭

### 8-4. 자동 배포 검증

이제 코드만 푸시하면 알아서 배포되는지 확인합니다.

코워크에 다음을 복붙:

```
홈페이지(src/app/page.tsx)에서 사이트 이름 아래에 다음 한 줄을 추가해줘.

"환영합니다! 곧 멋진 글들을 발행할 예정이에요."

작업 끝나면:
1. 변경 내용 확인
2. git add, git commit (메시지: "feat: 홈페이지 환영 문구 추가")
3. git push origin main
4. 푸시 끝나고 10초 뒤에 GitHub API 로 최근 커밋의 Vercel 배포 상태(statuses) 조회해서 보여줘.
```

푸시 후 10초 뒤 Vercel Dashboard → **Deployments** 탭에서 새 빌드가 자동으로 시작됐는지 확인.

배포 완료 후 본인 URL 새로고침 → 환영 문구가 보이면 통과.

> ✅ Section 8 통과 = 1강 전체 완료.

---

# 1강 체크포인트

다음 6가지를 모두 만족하면 1강을 완료한 겁니다.

- [ ] GitHub 저장소 `my-blog` 에 코드가 올라가 있음
- [ ] `.env` 가 GitHub에 노출되지 않음 (저장소 파일 목록에 안 보임)
- [ ] Vercel 무료 도메인 (`*.vercel.app`)으로 사이트 접속 가능
- [ ] 사이트에 본인 블로그 이름이 보임
- [ ] 코드 푸시 → Vercel 자동 배포 가 작동함
- [ ] 프로젝트 루트에 `CLAUDE.md`, `worklog.md` 가 있음

---

# 자주 막히는 곳 (FAQ)

### Q1. 코워크가 `pnpm` 명령어를 못 찾는다고 합니다
다음 복붙:
```
pnpm 이 설치 안 되어 있어. npm install -g pnpm 으로 설치하고 다시 시도해줘.
```

### Q2. `pnpm dev` 가 "port 3000 already in use" 에러를 냅니다
다음 복붙:
```
3000 포트가 다른 프로세스에 잡혀 있어. `lsof -i :3000` 로 무엇인지 확인하고,
필요하면 그 프로세스를 종료한 다음 다시 pnpm dev 해줘.
```

### Q3. GitHub 푸시할 때 인증이 안 됩니다 (윈도우)
1. https://github.com/settings/tokens → **Generate new token (classic)**
2. Scopes: `repo` 만 체크
3. 발급된 토큰 복사
4. `git push` 시 username에 본인 GitHub ID, password에 **토큰** 붙여넣기

### Q4. Vercel 빌드가 실패합니다 — "Cannot find module 'xxx'"
다음 복붙:
```
Vercel 빌드 로그에 [여기에 에러 메시지 붙여넣기] 에러가 나왔어.
원인 파악하고 한국어로 설명해줘. 해결 방법도 제시해줘.
```

### Q5. .env 가 실수로 GitHub에 올라갔어요!
다음 복붙 (긴급):
```
.env 파일이 GitHub에 실수로 올라갔어. 비상이야.

1. 모든 API 키를 일단 무효화해야 해. 어디서 무효화/재발급하면 되는지 알려줘:
   - Turso Auth Token
   - Gemini API Key
   - Unsplash Access Key

2. git에서 .env 를 완전히 제거하는 방법 알려줘.
   `git rm --cached .env` 후 .gitignore 에 추가하고 커밋·푸시.

3. 단, GitHub 커밋 히스토리에는 여전히 남아있으니 BFG Repo-Cleaner 사용 방법도 알려줘.
```

---

# 2강 예고

1강에서는 빈 껍데기를 만들었습니다. 2강에서는:

- **데이터베이스 연결** (Prisma + Turso)
- **첫 블로그 글 모델 만들기** (Post 테이블)
- **글 목록 페이지** (`/posts`)
- **글 상세 페이지** (`/posts/[slug]`)

까지 만듭니다. 약 2시간 30분 소요 예정입니다.

---

# 강사 노트 (수강생용 X, 강의 운영자용)

## 1강 실제 난이도 평가

| 구간 | 예상 시간 | 막힐 확률 | 막히는 이유 |
|---|---|---|---|
| Section 1 (계정 5개) | 30분 | 30% | Turso·Unsplash 가입 시 영어 UI 당황 |
| Section 2 (코워크 환경) | 10분 | 10% | node 버전 18 미만이면 설치 필요 |
| Section 3 (Next.js 생성) | 20분 | 5% | pnpm 미설치 가능 |
| Section 4 (CLAUDE.md) | 15분 | 0% | 복붙이라 안 막힘 |
| Section 5 (첫 페이지) | 20분 | 15% | tailwind 클래스 인식 문제 가끔 |
| Section 6 (.env) | 15분 | 20% | .env 파일을 IDE에서 못 만들어서 헷갈림 |
| Section 7 (GitHub 푸시) | 15분 | 40% | **윈도우 PAT 인증이 최대 난관** |
| Section 8 (Vercel 배포) | 20분 | 25% | env 변수 빠뜨려서 빌드 실패 흔함 |

## 수강생에게 미리 안내할 점

1. **윈도우 사용자**: Section 7 시작 전 PAT 발급 미리 받기 (별도 영상 권장)
2. **API 키 메모**: 메모장이 아닌 **1Password / Bitwarden** 같은 비밀번호 매니저 사용 권장 (장기적으로 안전)
3. **Vercel 빌드 실패 시**: 빌드 로그를 그대로 코워크에 붙여넣으라고 미리 알려주기

## 1강 보완할 점 (강의 1회차 운영 후 업데이트)

- [ ] 윈도우 PAT 발급 짧은 영상 추가
- [ ] 각 Section 끝에 1분 체크포인트 영상 (잘 따라왔는지)
- [ ] FAQ Q5 (.env 노출) 사고 시 대처를 별도 페이지로 분리
