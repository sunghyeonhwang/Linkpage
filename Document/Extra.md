# LinkPage MVP 개발 히스토리

> 작성일: 2026-02-19
> 프로젝트: LinkPage — 모바일 최적화 프로필 링크 페이지 빌더 (Linktree 유사)
> 기술 스택: React (Vite) + Express.js + TypeScript + Supabase PostgreSQL + Tailwind CSS + Zustand

---

## 사용 모델 / Skill / Agent

### AI 모델
| 항목 | 값 |
|------|------|
| 모델 | **Claude Opus 4.6** (`claude-opus-4-6`) |
| 도구 | **Claude Code** (Anthropic CLI) |
| 실행 환경 | macOS Darwin 25.2.0, Node.js v25.5.0 |

### 사용된 Skill
이번 구현에서는 별도의 Skill(`/commit`, `/review-pr`, `frontend-design` 등)을 호출하지 않았습니다.
계획 단계에서 아래 Skill/Agent 활용이 제안되었으나, 실제 구현은 Claude Opus 4.6 단일 에이전트가 직접 수행하였습니다.

| 계획된 Skill/Agent | 활용 여부 | 사유 |
|---|:---:|---|
| `feature-dev:feature-dev` | 미사용 | 직접 구현 |
| `frontend-design:frontend-design` | 미사용 | 직접 구현 |
| `figma:implement-design` | 미사용 | Figma 연동 불필요 (프리셋 기반 디자인) |
| `linkpage-designer` (커스텀 에이전트) | 미생성 | 단일 에이전트로 충분 |
| `auth-specialist` | 미사용 | 직접 구현 |
| `server-specialist` | 미사용 | 직접 구현 |
| `react-single-file-dev` | 미사용 | 직접 구현 |
| `vercel-deploy-optimizer` | 미사용 | 배포 미진행 |

### 사용된 도구 (Claude Code Tools)
| 도구 | 용도 | 호출 횟수 (대략) |
|------|------|:---:|
| **Write** | 새 파일 생성 | ~60회 |
| **Edit** | 기존 파일 수정 | ~5회 |
| **Read** | 파일 읽기 | ~5회 |
| **Bash** | npm install/build/migrate, 서버 테스트, API curl | ~15회 |
| **Glob** | 파일 탐색 | ~3회 |
| **Grep** | 코드 검색 | ~1회 |
| **TaskCreate/TaskUpdate** | 작업 진행 추적 | ~12회 |

### 작업 방식
- **순차 실행**: Phase 0 → 1 → 2 → 3-4 → 5-6 → 7-8 순서로 진행
- **병렬 도구 호출**: 독립적인 파일 생성은 한 번에 4-5개씩 병렬로 Write 호출
- **별도 서브에이전트(Task tool)**: 사용하지 않음 — 컨텍스트 유지를 위해 메인 에이전트가 전체 구현
- **빌드 검증**: 각 Phase 완료 시 TypeScript 타입 체크 + API 테스트로 동작 확인

---

## Phase 0: 프로젝트 초기화

### 수행 내용
1. **Monorepo 구성** — npm workspaces 기반 (`packages/shared`, `apps/server`, `apps/web`)
2. **루트 설정 파일 생성**
   - `package.json` — workspaces 설정 + `concurrently`로 동시 실행 스크립트
   - `tsconfig.base.json` — 공유 TypeScript 설정 (ES2022, ESNext, strict)
   - `.gitignore`, `.env.example`
3. **Express 서버 기본 셋업** (`apps/server/`)
   - `express` + `cors` + `helmet` 기본 미들웨어
   - 환경변수 관리 (`src/config/env.ts`)
   - DB Pool 연결 (`src/config/db.ts`) — `pg` 라이브러리, SSL, 커넥션 풀
   - Health check 엔드포인트 (`GET /api/health`)
   - 에러 핸들러 미들웨어 (`AppError` 클래스)
   - 4개 라우트 파일 스텁 (auth, profile, link, public)
4. **Vite + React + Tailwind 초기화** (`apps/web/`)
   - Vite 설정 — `@` 경로 별칭, `/api` → `localhost:3001` 프록시
   - Tailwind 설정 — 커스텀 theme 컬러(CSS 변수 참조), Pretendard 폰트, `max-w-mobile: 480px`
   - Design Token CSS 변수 정의 (`globals.css`)
   - 라우팅 구조 (`App.tsx`) — React Router v7, AuthGuard/GuestGuard
   - 레이아웃 컴포넌트 — `AuthLayout`, `DashboardLayout` (탭 네비게이션)
   - 플레이스홀더 페이지 9개 생성

### 생성된 파일
```
package.json, .gitignore, .env.example, tsconfig.base.json
packages/shared/package.json, tsconfig.json
apps/server/package.json, tsconfig.json, .env
apps/server/src/index.ts, app.ts, config/env.ts, config/db.ts, middleware/error.ts
apps/server/src/routes/auth.ts, profile.ts, link.ts, public.ts
apps/web/package.json, tsconfig.json, tsconfig.node.json, vite.config.ts
apps/web/postcss.config.js, tailwind.config.ts, index.html, vite-env.d.ts
apps/web/src/main.tsx, App.tsx, styles/globals.css, lib/cn.ts
apps/web/src/services/api.ts, stores/authStore.ts
apps/web/src/components/atoms/Spinner.tsx
apps/web/src/components/organisms/AuthGuard.tsx
apps/web/src/components/templates/AuthLayout.tsx, DashboardLayout.tsx
apps/web/src/pages/auth/LoginPage.tsx, SignupPage.tsx, ForgotPasswordPage.tsx, ResetPasswordPage.tsx, VerifyEmailPage.tsx
apps/web/src/pages/dashboard/DashboardPage.tsx, LinksPage.tsx, AppearancePage.tsx, SettingsPage.tsx
apps/web/src/pages/public/PublicProfilePage.tsx, NotFoundPage.tsx
```

### 검증
- `npm install` — 375 패키지 설치 완료

---

## Phase 1: DB 스키마 + 공유 패키지

### 수행 내용
1. **공유 타입 정의** (`packages/shared/src/types/`)
   - `User`, `Profile`, `ProfileLink`, `SocialLink`, `ThemeOverrides`, `ThemePreset`
   - `PublicProfile`, `ApiResponse`, `AuthResponse` 등 API 응답 타입
2. **8종 테마 프리셋 상수** (`packages/shared/src/constants/themes.ts`)
   - Clean White, Midnight Dark, Ocean Breeze, Sunset Glow, Forest Green, Lavender Dream, Neon Night, Soft Coral
   - 각 프리셋: bgColor, bgGradient, textColor, btnBgColor, btnTextColor, btnStyle, btnRadius
3. **유효성 검증 스키마** (`packages/shared/src/constants/validation.ts`)
   - Zod 기반: signupSchema, loginSchema, profileUpdateSchema, slugSchema, linkCreateSchema, linkUpdateSchema, linkReorderSchema
   - 상수: 길이 제한, 최대 링크 수(50), 아바타 크기(5MB) 등
4. **유틸리티** (`packages/shared/src/utils/`)
   - `generateSlug()` — nanoid 기반 8자 영숫자 슬러그
   - `isValidUrl()`, `sanitizeUrl()`, `escapeHtml()`
5. **SQL 마이그레이션** (`apps/server/src/db/migrations/001_initial.sql`)
   - `lp_users`, `lp_profiles`, `lp_profile_links` 테이블
   - 인덱스 7개, `updated_at` 자동 갱신 트리거 3개
   - **`lp_` 접두사** 사용 — 기존 DB에 `users` 테이블(id=integer)이 있어 충돌 방지
6. **마이그레이션 실행기** (`apps/server/src/db/migrate.ts`)

### 트러블슈팅
- **FK 타입 불일치 오류**: 기존 `users` 테이블의 `id`가 `integer`인데 새 테이블이 `uuid`를 참조하려 해서 실패 → 모든 테이블명에 `lp_` 접두사 추가하여 해결

### 생성된 파일
```
packages/shared/src/index.ts, types/index.ts, constants/themes.ts, constants/validation.ts, utils/index.ts
apps/server/src/db/migrate.ts, db/migrations/001_initial.sql
```

### 검증
- `npm run build:shared` — 컴파일 성공
- `npm run migrate` — `001_initial.sql` 실행 성공, 3개 테이블 + 인덱스 + 트리거 생성

---

## Phase 2: 인증 시스템 (BE + FE)

### 백엔드

1. **유틸리티**
   - `utils/jwt.ts` — `signToken()`, `verifyToken()` (jsonwebtoken)
   - `utils/hash.ts` — `hashPassword()`, `comparePassword()` (bcrypt, salt round 12)
   - `utils/email.ts` — `sendVerificationEmail()`, `sendPasswordResetEmail()` (nodemailer)
2. **미들웨어**
   - `middleware/auth.ts` — Bearer 토큰 검증, `req.userId`/`req.userEmail` 주입
   - `middleware/validate.ts` — Zod 스키마 유효성 검증
3. **Repository → Service → Controller 패턴**
   - `repositories/userRepository.ts` — findByEmail, findById, create, verifyEmail, setPasswordResetToken, resetPassword, updatePassword, deleteUser
   - `services/authService.ts` — signup, login, getMe, verifyEmail, forgotPassword, resetPassword
   - `controllers/authController.ts` — 각 엔드포인트 핸들러
4. **라우트** (`routes/auth.ts`)
   - `POST /api/auth/signup` — 회원가입 (bcrypt 해시 + JWT 발급 + 인증 이메일)
   - `POST /api/auth/login` — 로그인 (비밀번호 검증 + JWT 발급)
   - `POST /api/auth/logout` — 로그아웃 (클라이언트 토큰 제거)
   - `GET /api/auth/me` — 로그인 상태 확인 (auth 미들웨어)
   - `POST /api/auth/verify-email` — 이메일 인증
   - `POST /api/auth/forgot-password` — 비밀번호 재설정 요청
   - `POST /api/auth/reset-password` — 비밀번호 재설정 실행

### 프론트엔드

1. **Atom 컴포넌트**
   - `Button` — variant(primary/secondary/outline/ghost/danger), size, loading 상태
   - `Input` — error 상태, 포커스 링
2. **Molecule 컴포넌트**
   - `FormField` — label + children + error 메시지
3. **서비스/스토어**
   - `services/authApi.ts` — Axios 기반 auth API 래퍼
   - `stores/authStore.ts` — Zustand + persist, JWT/user 상태 관리
   - `services/api.ts` — Axios 인스턴스, JWT 인터셉터, 401 자동 로그아웃
4. **인증 페이지 5개**
   - `LoginPage` — 이메일/비밀번호 입력, 로그인 후 대시보드 리다이렉트
   - `SignupPage` — 회원가입 + 비밀번호 확인
   - `ForgotPasswordPage` — 이메일 입력 → 발송 완료 화면
   - `ResetPasswordPage` — URL 토큰 기반 비밀번호 재설정
   - `VerifyEmailPage` — URL 토큰 자동 인증 → 결과 표시

### 생성된 파일
```
apps/server/src/utils/jwt.ts, hash.ts, email.ts
apps/server/src/middleware/auth.ts, validate.ts
apps/server/src/repositories/userRepository.ts
apps/server/src/services/authService.ts
apps/server/src/controllers/authController.ts
apps/server/src/routes/auth.ts (업데이트)
apps/web/src/components/atoms/Button.tsx, Input.tsx
apps/web/src/components/molecules/FormField.tsx
apps/web/src/services/authApi.ts
apps/web/src/pages/auth/LoginPage.tsx, SignupPage.tsx, ForgotPasswordPage.tsx, ResetPasswordPage.tsx, VerifyEmailPage.tsx (실제 구현)
```

### 검증
- `POST /api/auth/signup` → 201 + JWT + user 반환 확인
- `POST /api/auth/login` → 200 + JWT + user 반환 확인

---

## Phase 3: 프로필 관리

### 백엔드
1. **profileRepository.ts** — findByUserId, findById, findBySlug, create, update, updateSlug, delete, isSlugAvailable
2. **profileService.ts** — getProfiles(자동 생성 포함), getProfile, updateProfile, updateSlug, createProfile, deleteProfile(최소 1개 보장)
3. **profileController.ts** — CRUD + 아바타 업로드 (Base64 data URL)
4. **routes/profile.ts** — multer(5MB, 이미지만), authMiddleware, zod validation

### 프론트엔드
1. **Atom**: `Avatar` (이미지 또는 User 아이콘 폴백), `Toggle` (커스텀 switch)
2. **서비스/스토어**: `profileApi.ts`, `profileStore.ts` (Zustand)
3. **DashboardPage** — 프로필 편집 (이름/바이오/아바타/소셜링크), 슬러그 변경, 공유 URL 복사, 다중 페이지 선택기

### API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/me/profile` | 내 프로필 목록 (없으면 자동 생성) |
| POST | `/api/me/profile` | 새 프로필 생성 |
| GET | `/api/me/profile/:profileId` | 특정 프로필 조회 |
| PUT | `/api/me/profile/:profileId` | 프로필 수정 |
| POST | `/api/me/profile/:profileId/slug` | 슬러그 변경 |
| POST | `/api/me/profile/:profileId/avatar` | 아바타 업로드 |
| DELETE | `/api/me/profile/:profileId` | 프로필 삭제 |

---

## Phase 4: 링크 관리

### 백엔드
1. **linkRepository.ts** — findByProfileId, findById, create(자동 sort_order), update, delete, reorder(트랜잭션), findActiveByProfileId
2. **linkService.ts** — getLinks, createLink(최대 50개 제한), updateLink, deleteLink, reorderLinks
3. **linkController.ts** — CRUD + reorder
4. **routes/link.ts** — authMiddleware, zod validation

### 프론트엔드
1. **서비스/스토어**: `linkApi.ts`, `linkStore.ts` (Zustand, 낙관적 업데이트)
2. **LinksPage** — 링크 추가/수정/삭제, 드래그앤드롭 정렬(@hello-pangea/dnd), 활성/비활성 토글, 인라인 편집

### API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/me/links/:profileId` | 링크 목록 |
| POST | `/api/me/links/:profileId` | 링크 생성 |
| PUT | `/api/me/links/:profileId/reorder` | 순서 변경 (트랜잭션) |
| PUT | `/api/me/links/:profileId/:linkId` | 링크 수정 |
| DELETE | `/api/me/links/:profileId/:linkId` | 링크 삭제 |

### 생성된 파일
```
apps/server/src/repositories/profileRepository.ts, linkRepository.ts
apps/server/src/services/profileService.ts, linkService.ts, publicService.ts
apps/server/src/controllers/profileController.ts, linkController.ts, publicController.ts
apps/server/src/routes/profile.ts, link.ts, public.ts (실제 구현)
apps/web/src/services/profileApi.ts, linkApi.ts, publicApi.ts
apps/web/src/stores/profileStore.ts, linkStore.ts
apps/web/src/components/atoms/Toggle.tsx, Avatar.tsx
apps/web/src/pages/dashboard/DashboardPage.tsx, LinksPage.tsx (실제 구현)
```

### 검증
- `PUT /api/me/profile/:id` → 프로필 수정 200 확인
- `POST /api/me/links/:id` → 링크 생성 201 확인
- `GET /api/public/profile/:slug` → 퍼블릭 프로필 + 활성 링크 반환 확인

---

## Phase 5: 테마/스타일링

### 수행 내용
1. **테마 엔진** (`apps/web/src/lib/themes.ts`)
   - `resolveTheme(presetId, overrides)` — 프리셋 + 오버라이드를 병합한 `ResolvedTheme` 객체 반환
   - `getBackgroundStyle()` — 그라데이션/단색 배경 스타일 반환
2. **ColorPicker** — 라벨 + 컬러 프리뷰 버튼 + hex 입력 + 16색 퀵 팔레트
3. **MobilePreview** — iPhone 프레임(280x570) 안에 실시간 프로필+링크 렌더링
4. **AppearancePage**
   - 좌측: 프리셋 그리드(4x2, 미니 프리뷰) + 커스텀 패널(배경색/텍스트색/버튼 배경색/버튼 텍스트/스타일/라운드/폰트)
   - 우측: sticky MobilePreview

### 트러블슈팅
- **CSS 변수 타입 에러**: `getThemeCSSVars()` 함수가 `React.CSSProperties`에 `--theme-*` 키를 사용하면 TS7053 에러 발생 → 구조화된 `ResolvedTheme` 인터페이스 반환하는 `resolveTheme()`으로 리팩토링

### 생성된 파일
```
apps/web/src/lib/themes.ts
apps/web/src/components/molecules/ColorPicker.tsx
apps/web/src/components/organisms/MobilePreview.tsx
apps/web/src/pages/dashboard/AppearancePage.tsx (실제 구현)
```

---

## Phase 6: 퍼블릭 페이지 + 공유

### 수행 내용
1. **퍼블릭 API** — `GET /api/public/profile/:slug` (프로필 + 활성 링크 조인)
2. **PublicProfilePage** (`/p/:slug`)
   - 프로필 섹션: 아바타, 이름, 바이오, 소셜 아이콘(Instagram/YouTube/Twitter/GitHub/LinkedIn/Email/KakaoTalk)
   - 링크 버튼 리스트: 테마 스타일 적용, hover scale 애니메이션
   - 푸터: "Made with LinkPage"
   - 로딩 스피너 + 404 에러 페이지
   - 모바일 최적화: `max-w-mobile(480px)`, 중앙 정렬
3. **QR 코드** — `qrcode.react` 기반 SVG QR 생성 + PNG 다운로드
4. **SettingsPage** — 계정 정보, 공유 URL 복사, QR 코드 생성/다운로드

### 생성된 파일
```
apps/web/src/pages/public/PublicProfilePage.tsx (실제 구현)
apps/web/src/pages/dashboard/SettingsPage.tsx (실제 구현)
```

---

## Phase 7: 다중 페이지 지원

### 수행 내용
- DB 스키마에서 `lp_profiles.user_id`에 UNIQUE 제약 없음 → **1:N 관계 기본 지원**
- API: `GET /api/me/profile` — 사용자의 모든 프로필 반환
- API: `POST /api/me/profile` — 새 프로필 생성
- API: `DELETE /api/me/profile/:id` — 프로필 삭제 (최소 1개 보장)
- 프론트: DashboardPage에 **페이지 선택기** (프로필 탭 + "새 페이지" 버튼)
- `profileStore`의 `currentProfileId` 기반 프로필 전환

---

## Phase 8: 마무리 + 검증

### 수행 내용
1. **임시 파일 정리** — `db/check.ts` 삭제
2. **TypeScript 타입 체크** — `tsc --noEmit` 통과 (에러 0)
3. **Vite 프로덕션 빌드** — 성공 (537KB JS + 21KB CSS)
4. **서버 통합 테스트**
   - Health check: `GET /api/health` → `{"status":"ok"}`
   - Signup: `POST /api/auth/signup` → 201 + JWT
   - Login: `POST /api/auth/login` → 200 + JWT
   - Profile CRUD: GET/PUT → 200
   - Link CRUD: POST → 201
   - Public profile: GET → 200 (프로필 + 링크 반환)
5. **동시 실행** — `npm run dev` → 서버(3001) + Vite(5173) 동시 기동 확인

---

## 최종 디렉토리 구조

```
LinkPage/
├── package.json                     # npm workspaces
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── History.md                       # ← 이 파일
│
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts             # 배럴 export
│           ├── types/index.ts       # User, Profile, ProfileLink, ThemePreset 등
│           ├── constants/
│           │   ├── themes.ts        # 8종 테마 프리셋
│           │   └── validation.ts    # Zod 스키마 + 상수
│           └── utils/index.ts       # generateSlug, isValidUrl, escapeHtml
│
├── apps/
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts             # 서버 엔트리 (DB 연결 + listen)
│   │       ├── app.ts               # Express 앱 (미들웨어 + 라우트)
│   │       ├── config/
│   │       │   ├── env.ts           # 환경변수 파싱
│   │       │   └── db.ts            # pg Pool + 연결 테스트
│   │       ├── db/
│   │       │   ├── migrate.ts       # 마이그레이션 실행기
│   │       │   └── migrations/
│   │       │       └── 001_initial.sql  # lp_users, lp_profiles, lp_profile_links
│   │       ├── middleware/
│   │       │   ├── auth.ts          # JWT 인증 미들웨어
│   │       │   ├── validate.ts      # Zod 유효성 검증 미들웨어
│   │       │   └── error.ts         # AppError + 에러 핸들러
│   │       ├── repositories/
│   │       │   ├── userRepository.ts
│   │       │   ├── profileRepository.ts
│   │       │   └── linkRepository.ts
│   │       ├── services/
│   │       │   ├── authService.ts
│   │       │   ├── profileService.ts
│   │       │   ├── linkService.ts
│   │       │   └── publicService.ts
│   │       ├── controllers/
│   │       │   ├── authController.ts
│   │       │   ├── profileController.ts
│   │       │   ├── linkController.ts
│   │       │   └── publicController.ts
│   │       ├── routes/
│   │       │   ├── auth.ts          # /api/auth/*
│   │       │   ├── profile.ts       # /api/me/profile/*
│   │       │   ├── link.ts          # /api/me/links/*
│   │       │   └── public.ts        # /api/public/*
│   │       └── utils/
│   │           ├── jwt.ts           # signToken, verifyToken
│   │           ├── hash.ts          # hashPassword, comparePassword
│   │           └── email.ts         # sendVerificationEmail, sendPasswordResetEmail
│   │
│   └── web/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx              # 라우터 + Toaster
│           ├── styles/globals.css   # Tailwind + Design Tokens
│           ├── lib/
│           │   ├── cn.ts            # clsx + tailwind-merge
│           │   └── themes.ts        # resolveTheme, getBackgroundStyle
│           ├── services/
│           │   ├── api.ts           # Axios 인스턴스 + JWT 인터셉터
│           │   ├── authApi.ts
│           │   ├── profileApi.ts
│           │   ├── linkApi.ts
│           │   └── publicApi.ts
│           ├── stores/
│           │   ├── authStore.ts     # Zustand + persist
│           │   ├── profileStore.ts
│           │   └── linkStore.ts
│           ├── components/
│           │   ├── atoms/
│           │   │   ├── Button.tsx
│           │   │   ├── Input.tsx
│           │   │   ├── Spinner.tsx
│           │   │   ├── Toggle.tsx
│           │   │   └── Avatar.tsx
│           │   ├── molecules/
│           │   │   ├── FormField.tsx
│           │   │   └── ColorPicker.tsx
│           │   ├── organisms/
│           │   │   ├── AuthGuard.tsx
│           │   │   └── MobilePreview.tsx
│           │   └── templates/
│           │       ├── AuthLayout.tsx
│           │       └── DashboardLayout.tsx
│           └── pages/
│               ├── auth/
│               │   ├── LoginPage.tsx
│               │   ├── SignupPage.tsx
│               │   ├── ForgotPasswordPage.tsx
│               │   ├── ResetPasswordPage.tsx
│               │   └── VerifyEmailPage.tsx
│               ├── dashboard/
│               │   ├── DashboardPage.tsx    # 프로필 편집
│               │   ├── LinksPage.tsx        # 링크 관리 + 드래그정렬
│               │   ├── AppearancePage.tsx   # 테마 프리셋 + 커스텀 + 미리보기
│               │   └── SettingsPage.tsx     # 계정 정보 + QR 코드
│               └── public/
│                   ├── PublicProfilePage.tsx # /p/:slug 퍼블릭 페이지
│                   └── NotFoundPage.tsx
```

---

## API 엔드포인트 전체 목록

| Method | Path | Auth | 설명 |
|--------|------|:----:|------|
| GET | `/api/health` | - | 헬스 체크 |
| POST | `/api/auth/signup` | - | 회원가입 |
| POST | `/api/auth/login` | - | 로그인 |
| POST | `/api/auth/logout` | - | 로그아웃 |
| GET | `/api/auth/me` | O | 현재 사용자 정보 |
| POST | `/api/auth/verify-email` | - | 이메일 인증 |
| POST | `/api/auth/forgot-password` | - | 비밀번호 재설정 요청 |
| POST | `/api/auth/reset-password` | - | 비밀번호 재설정 |
| GET | `/api/me/profile` | O | 내 프로필 목록 |
| POST | `/api/me/profile` | O | 프로필 생성 |
| GET | `/api/me/profile/:id` | O | 프로필 조회 |
| PUT | `/api/me/profile/:id` | O | 프로필 수정 |
| POST | `/api/me/profile/:id/slug` | O | 슬러그 변경 |
| POST | `/api/me/profile/:id/avatar` | O | 아바타 업로드 |
| DELETE | `/api/me/profile/:id` | O | 프로필 삭제 |
| GET | `/api/me/links/:profileId` | O | 링크 목록 |
| POST | `/api/me/links/:profileId` | O | 링크 생성 |
| PUT | `/api/me/links/:profileId/reorder` | O | 링크 순서 변경 |
| PUT | `/api/me/links/:profileId/:linkId` | O | 링크 수정 |
| DELETE | `/api/me/links/:profileId/:linkId` | O | 링크 삭제 |
| GET | `/api/public/profile/:slug` | - | 퍼블릭 프로필 + 링크 |

---

## DB 스키마

### lp_users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| email | TEXT UNIQUE | |
| password_hash | TEXT | bcrypt |
| email_verified | BOOLEAN | 기본 false |
| email_verify_token | TEXT | |
| password_reset_token | TEXT | |
| password_reset_expires | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | 트리거 자동 갱신 |

### lp_profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK | lp_users.id, CASCADE |
| slug | TEXT UNIQUE | 자동 생성 (nanoid 8자) |
| display_name | TEXT | 기본 'My Page' |
| bio | TEXT | |
| avatar_url | TEXT | Base64 data URL |
| social_links | JSONB | [{type, url}] |
| theme_preset | TEXT | 기본 'clean-white' |
| theme_overrides | JSONB | 커스텀 스타일 |
| created_at / updated_at | TIMESTAMPTZ | |

### lp_profile_links
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| profile_id | UUID FK | lp_profiles.id, CASCADE |
| label | TEXT | |
| url | TEXT | |
| description | TEXT | |
| icon | TEXT | |
| is_active | BOOLEAN | 기본 true |
| sort_order | INTEGER | 기본 0 |
| created_at / updated_at | TIMESTAMPTZ | |

---

## 8종 테마 프리셋

| # | ID | 이름 | 배경 | 텍스트 | 버튼 | 스타일 |
|---|---|---|---|---|---|---|
| 1 | clean-white | Clean White | #FFFFFF | #1A1A2E | #1A1A2E / filled | md |
| 2 | midnight-dark | Midnight Dark | #0F172A | #F1F5F9 | #1E293B / filled | md |
| 3 | ocean-breeze | Ocean Breeze | 블루→퍼플 gradient | #FFFFFF | 반투명 / filled | full |
| 4 | sunset-glow | Sunset Glow | 오렌지→핑크 gradient | #FFFFFF | 반투명 / filled | full |
| 5 | forest-green | Forest Green | #F0FDF4 | #14532D | #16A34A / filled | sm |
| 6 | lavender-dream | Lavender Dream | #F5F3FF | #4C1D95 | #FFFFFF / outlined | md |
| 7 | neon-night | Neon Night | #0A0A0A | #D4FF00 | transparent / outlined | none |
| 8 | soft-coral | Soft Coral | #FFF1F2 | #881337 | #FB7185 / filled | full |

---

## 주요 라이브러리

### Backend (apps/server)
| 라이브러리 | 버전 | 용도 |
|---|---|---|
| express | ^5.1.0 | HTTP 서버 |
| cors + helmet | ^2.8.5 / ^8.0.0 | 보안 |
| pg | ^8.13.3 | PostgreSQL 연결 |
| bcrypt | ^5.1.1 | 비밀번호 해시 |
| jsonwebtoken | ^9.0.2 | JWT |
| zod | ^3.24.2 | 유효성 검증 |
| multer | ^1.4.5-lts.2 | 파일 업로드 |
| nodemailer | ^6.10.0 | 이메일 발송 |
| nanoid | ^5.1.2 | 슬러그 생성 |

### Frontend (apps/web)
| 라이브러리 | 버전 | 용도 |
|---|---|---|
| react + react-dom | ^19.0.0 | UI |
| react-router-dom | ^7.1.5 | 라우팅 |
| zustand | ^5.0.3 | 상태 관리 |
| axios | ^1.7.9 | HTTP 클라이언트 |
| @hello-pangea/dnd | ^18.0.1 | 드래그앤드롭 |
| lucide-react | ^0.475.0 | 아이콘 |
| react-hot-toast | ^2.5.2 | 토스트 알림 |
| qrcode.react | ^4.2.0 | QR 코드 |
| tailwindcss | ^3.4.17 | CSS |
| clsx + tailwind-merge | ^2.1.1 / ^3.0.2 | 클래스 유틸 |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 공유 패키지 빌드
npm run build:shared

# DB 마이그레이션 실행
npm run migrate

# 개발 서버 실행 (서버 3001 + 프론트 5173)
npm run dev
```

---

## 트러블슈팅 기록

| 이슈 | 원인 | 해결 |
|------|------|------|
| FK 타입 불일치 (`uuid` vs `integer`) | 기존 `users` 테이블의 id가 `integer` | 테이블명에 `lp_` 접두사 추가 |
| shared 빌드 실패 (no inputs) | `src/` 디렉토리에 파일 없음 | Phase 1에서 소스 파일 생성 후 빌드 |
| CSS 변수 TS7053 에러 | `React.CSSProperties`에 `--theme-*` 키 사용 불가 | `resolveTheme()` → 구조화된 `ResolvedTheme` 객체 반환 |
| tsconfig references 에러 | `tsconfig.node.json`에 `composite: true` 없음 | `references` 제거 |
