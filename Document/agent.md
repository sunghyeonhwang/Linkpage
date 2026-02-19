# LinkPage MVP 개발 계획서

> 작성일: 2026-02-19
> 기반 문서: `LinkPage_Dev_Info.md` (PRD v0.3)

---

## 1. 프로젝트 개요

사용자가 **모바일 최적화 프로필 링크 페이지**를 만들고, 링크 버튼을 관리하며, 생성된 페이지 URL을 공유할 수 있는 서비스.

### 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React (Vite) + Tailwind CSS + Zustand |
| Backend | Express.js + TypeScript |
| DB | Supabase PostgreSQL (Auth 미사용) |
| DB 연결 | `env.md` 참조 |
| 인증 | JWT (bcrypt, Express 자체 구현) |
| 패키지 매니저 | npm (workspaces) |
| 프로젝트 구조 | Monorepo |

---

## 2. 디렉토리 구조

```
LinkPage/
├── package.json                     # npm workspaces: ["packages/*", "apps/*"]
├── .gitignore
├── .env.example
├── tsconfig.base.json               # 공유 TypeScript base config
│
├── packages/
│   └── shared/                      # 공유 타입/상수/유틸
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts             # re-export
│           ├── types/
│           │   ├── user.ts
│           │   ├── profile.ts
│           │   ├── link.ts
│           │   └── theme.ts
│           ├── constants/
│           │   ├── themes.ts        # 8종 테마 프리셋
│           │   └── validation.ts    # 공유 유효성 규칙
│           └── utils/
│               ├── slug.ts          # slug 생성 (nanoid 기반)
│               └── url.ts           # URL 정규화/검증
│
├── apps/
│   ├── server/                      # Express 백엔드
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts             # 서버 진입점
│   │       ├── app.ts              # Express 앱 설정 (미들웨어)
│   │       ├── config/
│   │       │   ├── env.ts           # 환경변수 로드/검증
│   │       │   └── db.ts           # pg Pool (Supabase 연결)
│   │       ├── db/
│   │       │   └── migrations/
│   │       │       ├── 001_create_users.sql
│   │       │       ├── 002_create_profiles.sql
│   │       │       └── 003_create_profile_links.sql
│   │       ├── middleware/
│   │       │   ├── auth.ts          # JWT 인증 미들웨어
│   │       │   ├── validate.ts      # zod 기반 요청 검증
│   │       │   └── error.ts         # 전역 에러 핸들링
│   │       ├── routes/
│   │       │   ├── index.ts
│   │       │   ├── auth.routes.ts
│   │       │   ├── profile.routes.ts
│   │       │   ├── link.routes.ts
│   │       │   └── public.routes.ts
│   │       ├── controllers/
│   │       │   ├── auth.controller.ts
│   │       │   ├── profile.controller.ts
│   │       │   ├── link.controller.ts
│   │       │   └── public.controller.ts
│   │       ├── services/
│   │       │   ├── auth.service.ts
│   │       │   ├── profile.service.ts
│   │       │   ├── link.service.ts
│   │       │   └── email.service.ts
│   │       ├── repositories/
│   │       │   ├── user.repository.ts
│   │       │   ├── profile.repository.ts
│   │       │   └── link.repository.ts
│   │       └── utils/
│   │           ├── jwt.ts           # sign, verify
│   │           ├── hash.ts          # bcrypt 래퍼
│   │           └── sanitize.ts      # XSS 방지
│   │
│   └── web/                         # React (Vite) 프론트엔드
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx              # React Router 설정
│           │
│           ├── styles/
│           │   ├── globals.css      # Tailwind directives + CSS 변수
│           │   ├── tokens.css       # Design Token CSS 변수
│           │   └── fonts.css        # 웹폰트 (Pretendard, Space Grotesk)
│           │
│           ├── components/          # Atomic Design
│           │   ├── atoms/
│           │   │   ├── Button/Button.tsx
│           │   │   ├── Input/Input.tsx
│           │   │   ├── Toggle/Toggle.tsx
│           │   │   ├── Avatar/Avatar.tsx
│           │   │   ├── Icon/Icon.tsx
│           │   │   ├── Badge/Badge.tsx
│           │   │   ├── Spinner/Spinner.tsx
│           │   │   └── Toast/Toast.tsx
│           │   ├── molecules/
│           │   │   ├── FormField/FormField.tsx
│           │   │   ├── LinkItem/LinkItem.tsx
│           │   │   ├── SocialIcon/SocialIcon.tsx
│           │   │   ├── ThemeCard/ThemeCard.tsx
│           │   │   ├── ColorPicker/ColorPicker.tsx
│           │   │   ├── LinkEditCard/LinkEditCard.tsx
│           │   │   └── Modal/Modal.tsx
│           │   ├── organisms/
│           │   │   ├── ProfileHeader/ProfileHeader.tsx
│           │   │   ├── LinkList/LinkList.tsx
│           │   │   ├── ProfileEditor/ProfileEditor.tsx
│           │   │   ├── LinkManager/LinkManager.tsx
│           │   │   ├── ThemeSelector/ThemeSelector.tsx
│           │   │   ├── MobilePreview/MobilePreview.tsx
│           │   │   ├── PageList/PageList.tsx
│           │   │   └── Navbar/Navbar.tsx
│           │   └── templates/
│           │       ├── PublicPageLayout/PublicPageLayout.tsx
│           │       ├── DashboardLayout/DashboardLayout.tsx
│           │       └── AuthLayout/AuthLayout.tsx
│           │
│           ├── pages/
│           │   ├── auth/
│           │   │   ├── LoginPage.tsx
│           │   │   ├── SignupPage.tsx
│           │   │   ├── ForgotPasswordPage.tsx
│           │   │   ├── ResetPasswordPage.tsx
│           │   │   └── VerifyEmailPage.tsx
│           │   ├── dashboard/
│           │   │   ├── DashboardPage.tsx
│           │   │   ├── LinksPage.tsx
│           │   │   ├── AppearancePage.tsx
│           │   │   └── SettingsPage.tsx
│           │   └── public/
│           │       ├── PublicProfilePage.tsx
│           │       └── NotFoundPage.tsx
│           │
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   ├── useProfile.ts
│           │   ├── useLinks.ts
│           │   ├── useTheme.ts
│           │   └── useToast.ts
│           │
│           ├── services/
│           │   ├── api.ts           # Axios 인스턴스 + JWT 인터셉터
│           │   ├── auth.api.ts
│           │   ├── profile.api.ts
│           │   ├── link.api.ts
│           │   └── public.api.ts
│           │
│           ├── stores/              # Zustand
│           │   ├── authStore.ts
│           │   ├── profileStore.ts
│           │   └── linkStore.ts
│           │
│           ├── lib/
│           │   ├── themes.ts        # 테마→CSS 변수 변환 로직
│           │   ├── qrcode.ts        # QR 생성 유틸
│           │   └── clipboard.ts     # 클립보드 유틸
│           │
│           └── types/
│               └── index.ts         # 프론트 전용 타입
```

---

## 3. 주요 라이브러리

### Backend (`apps/server`)

| 라이브러리 | 용도 | 선택 이유 |
|---|---|---|
| `express` | 서버 프레임워크 | PRD 지정 |
| `cors` | CORS 허용 | 프론트엔드 통신 필수 |
| `helmet` | HTTP 보안 헤더 | 보안 강화 |
| `pg` | PostgreSQL 클라이언트 | Supabase 직접 연결, ORM 없이 경량화 |
| `bcrypt` | 비밀번호 해시 | PRD 지정, 업계 표준 |
| `jsonwebtoken` | JWT 발급/검증 | 인증 방식 확정 |
| `zod` | 요청 유효성 검증 | 타입 안전, 프론트와 공유 가능 |
| `multer` | 파일 업로드 | 아바타 이미지 처리 |
| `@supabase/supabase-js` | Storage 접근 | 이미지 저장용 (Auth 미사용) |
| `nodemailer` | 이메일 발송 | 인증/재설정 메일 |
| `tsx` | TS 런타임 실행 | 개발 시 빠른 실행 |
| `dotenv` | 환경변수 로드 | 설정 관리 |

### Frontend (`apps/web`)

| 라이브러리 | 용도 | 선택 이유 |
|---|---|---|
| `react`, `react-dom` | UI 라이브러리 | PRD 지정 |
| `react-router-dom` v6 | SPA 라우팅 | 업계 표준 |
| `tailwindcss` | CSS 프레임워크 | PRD 지정, 모바일 우선 |
| `zustand` | 상태 관리 | 경량, 보일러플레이트 최소 |
| `axios` | HTTP 클라이언트 | 인터셉터로 JWT 자동 첨부 |
| `@hello-pangea/dnd` | 드래그앤드롭 | 리스트 정렬 특화, 간단한 API |
| `lucide-react` | 아이콘 | 트리셰이킹, 깔끔한 디자인 |
| `react-hot-toast` | 토스트 알림 | 경량, 커스터마이징 우수 |
| `qrcode.react` | QR 코드 | React 컴포넌트 형태 |
| `clsx` + `tailwind-merge` | 클래스 결합 | Tailwind 클래스 충돌 방지 |

### Shared (`packages/shared`)

| 라이브러리 | 용도 |
|---|---|
| `zod` | 프론트/백 공유 유효성 스키마 |

---

## 4. 데이터 모델

### `users` 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  verify_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `profiles` 테이블
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '[]',
  theme_preset TEXT NOT NULL DEFAULT 'clean_white',
  theme_overrides JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_slug ON profiles(slug);
```

### `profile_links` 테이블
```sql
CREATE TABLE profile_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profile_links_profile_id ON profile_links(profile_id);
```

---

## 5. API 설계

### 인증 (Auth)
| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 로그인 상태 확인 |
| POST | `/api/auth/verify-email` | 이메일 인증 |
| POST | `/api/auth/forgot-password` | 비밀번호 재설정 요청 |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 처리 |

### 프로필
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/me/profiles` | 내 프로필 목록 |
| POST | `/api/me/profiles` | 새 프로필 생성 |
| GET | `/api/me/profiles/:profileId` | 특정 프로필 조회 |
| PUT | `/api/me/profiles/:profileId` | 프로필 수정 |
| DELETE | `/api/me/profiles/:profileId` | 프로필 삭제 |
| POST | `/api/me/profiles/:profileId/slug` | 슬러그 변경 |
| POST | `/api/me/profiles/:profileId/avatar` | 아바타 업로드 |

### 링크
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/me/profiles/:profileId/links` | 링크 목록 |
| POST | `/api/me/profiles/:profileId/links` | 링크 생성 |
| PUT | `/api/me/links/:id` | 링크 수정 |
| DELETE | `/api/me/links/:id` | 링크 삭제 |
| PUT | `/api/me/profiles/:profileId/links/reorder` | 순서 변경 |

### 퍼블릭
| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/public/profile/:slug` | 퍼블릭 프로필+활성링크 |

---

## 6. 8종 테마 프리셋

| # | 이름 | 배경 | 텍스트 | 버튼 배경 | 버튼 스타일 | 라운드 | 폰트 |
|---|---|---|---|---|---|---|---|
| 1 | **Clean White** | `#FFFFFF` | `#1A1A2E` | `#1A1A2E` | filled | 12px | Pretendard |
| 2 | **Midnight Dark** | `#0F172A` | `#F1F5F9` | `#1E293B` | filled | 12px | Pretendard |
| 3 | **Ocean Breeze** | 블루→퍼플 그라데이션 | `#FFFFFF` | 반투명 백 | filled | full | Pretendard |
| 4 | **Sunset Glow** | 오렌지→핑크 그라데이션 | `#FFFFFF` | 반투명 백 | filled | full | Pretendard |
| 5 | **Forest Green** | `#F0FDF4` | `#14532D` | `#16A34A` | filled | 8px | Pretendard |
| 6 | **Lavender Dream** | `#F5F3FF` | `#4C1D95` | `#FFFFFF` | outlined | 12px | Pretendard |
| 7 | **Neon Night** | `#0A0A0A` | `#D4FF00` | transparent | outlined | 0px | Space Grotesk |
| 8 | **Soft Coral** | `#FFF1F2` | `#881337` | `#FB7185` | filled | full | Pretendard |

---

## 7. 컴포넌트 구조 (Atomic Design)

### Atoms (최소 단위)
| 컴포넌트 | 역할 |
|---|---|
| `Button` | 모든 버튼 (variant: primary/secondary/ghost/danger) |
| `Input` | 텍스트/이메일/비밀번호 입력 |
| `Toggle` | on/off 스위치 (링크 활성/비활성) |
| `Avatar` | 프로필 이미지 (원형) |
| `Icon` | lucide-react 아이콘 래퍼 |
| `Badge` | 상태 표시 뱃지 |
| `Spinner` | 로딩 인디케이터 |
| `Toast` | 알림 메시지 |

### Molecules (Atom 조합)
| 컴포넌트 | 역할 |
|---|---|
| `FormField` | Input + 라벨 + 에러 메시지 |
| `LinkItem` | 퍼블릭 페이지 링크 버튼 (아이콘+라벨+URL) |
| `SocialIcon` | 소셜 미디어 아이콘 버튼 |
| `ThemeCard` | 테마 선택 미니 프리뷰 카드 |
| `ColorPicker` | 색상 선택 (hex 입력+컬러 피커) |
| `LinkEditCard` | 대시보드 링크 편집 카드 (드래그 핸들+편집+토글) |
| `Modal` | 오버레이 모달 |

### Organisms (비즈니스 로직 포함)
| 컴포넌트 | 역할 |
|---|---|
| `ProfileHeader` | 퍼블릭 페이지 상단 (아바타+이름+바이오+소셜) |
| `LinkList` | 퍼블릭 페이지 링크 목록 |
| `ProfileEditor` | 대시보드 프로필 편집 폼 |
| `LinkManager` | 대시보드 링크 관리 (DnD+CRUD) |
| `ThemeSelector` | 테마/스타일 선택 패널 |
| `MobilePreview` | 실시간 모바일 미리보기 (iPhone 프레임) |
| `PageList` | 다중 페이지 목록 |
| `Navbar` | 대시보드 네비게이션 |

### Templates (레이아웃)
| 컴포넌트 | 역할 |
|---|---|
| `PublicPageLayout` | 퍼블릭 프로필 페이지 (max-width: 480px, 중앙) |
| `DashboardLayout` | 대시보드 (Navbar + 콘텐츠 + 미리보기) |
| `AuthLayout` | 인증 페이지 (중앙 카드) |

### Pages (라우트 매핑)
| 경로 | 페이지 | 인증 |
|---|---|---|
| `/login` | LoginPage | X |
| `/signup` | SignupPage | X |
| `/forgot-password` | ForgotPasswordPage | X |
| `/reset-password/:token` | ResetPasswordPage | X |
| `/verify-email/:token` | VerifyEmailPage | X |
| `/app` | DashboardPage | O |
| `/app/links` | LinksPage | O |
| `/app/appearance` | AppearancePage | O |
| `/app/settings` | SettingsPage | O |
| `/p/:slug` | PublicProfilePage | X |

---

## 8. 단계별 개발 계획

### Phase 0: 프로젝트 초기화

**목표**: Monorepo 환경 구성, 개발 서버 구동 확인

**작업 내용**:
1. Root `package.json`에 npm workspaces 설정
2. 공유 TypeScript base config
3. Express 서버 기본 셋업 (cors, helmet, json parser, health check)
4. Vite + React 프로젝트 생성, Tailwind CSS 설정
5. `concurrently`로 동시 실행 스크립트 설정
6. Vite proxy 설정 (`/api` → `localhost:3001`)
7. Design Token CSS 변수 파일 생성
8. 웹폰트 로드 설정 (Pretendard, Space Grotesk)
9. `.gitignore`, `.env.example` 작성

**검증**: `npm run dev`로 프론트(5173)+백(3001) 동시 구동, `/api/health` 응답 확인

---

### Phase 1: DB + 공유 패키지

**목표**: 테이블 생성, 공유 타입/상수 정의

**작업 내용**:
1. `pg` Pool로 Supabase PostgreSQL 연결
2. SQL 마이그레이션 작성 (users, profiles, profile_links)
3. `updated_at` 자동 갱신 트리거
4. 공유 TypeScript 인터페이스 정의
5. 8종 테마 프리셋 상수 정의
6. 유효성 검증 상수, slug/URL 유틸

**검증**: 마이그레이션 실행 → Supabase 대시보드에서 테이블 3개 확인

---

### Phase 2: 인증 시스템

**목표**: 회원가입/로그인/로그아웃/JWT/이메일인증/비밀번호재설정

**백엔드 작업**:
1. `hash.ts`: bcrypt 래퍼 (hash, compare)
2. `jwt.ts`: sign, verify (accessToken 24h 만료)
3. `auth.middleware.ts`: Authorization 헤더 → JWT 검증 → `req.user`
4. `validate.ts`: zod 스키마 기반 요청 검증 미들웨어
5. `error.ts`: AppError 클래스, 전역 에러 핸들링
6. `user.repository.ts`: DB CRUD 함수
7. `auth.service.ts`: 비즈니스 로직
8. `email.service.ts`: nodemailer + HTML 템플릿
9. Auth 라우트 7개

**프론트엔드 작업**:
1. Axios 인스턴스 (JWT 인터셉터, 401 처리)
2. authStore (Zustand)
3. Atom: Button, Input, Spinner
4. Molecule: FormField
5. Template: AuthLayout
6. Pages: Login, Signup, ForgotPassword, ResetPassword, VerifyEmail
7. React Router 설정, ProtectedRoute

**검증**: 회원가입→로그인→대시보드, 잘못된 토큰 401, 비밀번호 재설정 플로우

---

### Phase 3: 프로필 관리

**목표**: 프로필 CRUD, 슬러그 설정, 아바타 업로드

**백엔드 작업**:
1. `profile.repository.ts`: findByUserId, findBySlug, create, update
2. `profile.service.ts`: 자동 생성, 슬러그 중복 체크, 아바타 업로드
3. Supabase Storage public bucket 연동

**프론트엔드 작업**:
1. profileStore (Zustand)
2. Atom: Avatar, Toggle
3. Molecule: SocialIcon
4. Organism: ProfileEditor, Navbar
5. Template: DashboardLayout
6. Page: DashboardPage

**검증**: 프로필 편집→저장→재로드 유지, 아바타 업로드, 슬러그 중복 에러

---

### Phase 4: 링크 관리

**목표**: 링크 CRUD, 드래그앤드롭 정렬, 활성/비활성 토글

**백엔드 작업**:
1. `link.repository.ts`: CRUD, reorder (트랜잭션 일괄 업데이트)
2. `link.service.ts`: sort_order 자동 계산, URL 검증

**프론트엔드 작업**:
1. linkStore (Zustand, 낙관적 업데이트)
2. Molecule: LinkEditCard (드래그 핸들+인라인 편집+Toggle+삭제)
3. Organism: LinkManager (@hello-pangea/dnd)
4. Page: LinksPage
5. 토스트 알림

**검증**: 링크 5개 추가→드래그 정렬→새로고침 후 순서 유지, 비활성 토글

---

### Phase 5: 테마/스타일링

**목표**: 8종 프리셋, 커스텀 스타일, 실시간 미리보기

**작업 내용**:
1. `themes.ts`: `applyTheme(preset, overrides?)` CSS 변수 변환 함수
2. Molecule: ThemeCard (미니 프리뷰 48x80px), ColorPicker
3. Organism: ThemeSelector (프리셋 그리드 + 커스텀 패널)
4. Organism: MobilePreview (iPhone 프레임 + scale(0.6) 렌더링)
5. Page: AppearancePage (좌: 설정, 우: 미리보기)
6. Tailwind config 확장 (CSS 변수 참조 컬러/폰트)

**커스텀 패널 옵션**:
- 배경색 ColorPicker (+ 그라데이션 on/off)
- 텍스트색 ColorPicker
- 버튼 스타일 (filled / outlined)
- 버튼 라운드 (none / sm / md / full)
- 폰트 선택 (Pretendard / Noto Sans KR / Space Grotesk)

**검증**: 8종 프리셋 전환 즉시 반영, 커스텀 수정→저장→유지

---

### Phase 6: 퍼블릭 페이지 + 공유

**목표**: `/p/:slug` 공개 페이지, URL 복사, QR 생성, 푸터

**백엔드 작업**:
1. `GET /api/public/profile/:slug` — 프로필+활성링크(sort_order순) 조인

**프론트엔드 작업**:
1. Atom: Icon, Toast
2. Molecule: LinkItem (테마 반영 버튼, 호버 효과)
3. Organism: ProfileHeader, LinkList
4. Template: PublicPageLayout (max-width: 480px, 중앙정렬)
5. Page: PublicProfilePage (테마 CSS 변수 적용, 로딩 스켈레톤, 404)
6. Footer: "Made with LinkPage"
7. URL 복사 (`navigator.clipboard`) + QR 코드 (`qrcode.react`)
8. Page: SettingsPage (공유 섹션)

**검증**: `/p/:slug` 접속, 비활성 링크 미노출, 404 처리, QR 스캔, 모바일 렌더링

---

### Phase 7: 다중 페이지 지원

**목표**: 한 사용자가 여러 프로필 페이지 생성/관리

**작업 내용**:
1. DB: `profiles.user_id` UNIQUE 제약 제거 → 1:N
2. API: `/api/me/profiles` CRUD, 프로필별 링크 관리
3. Organism: PageList
4. Molecule: PageCard (미니 프리뷰+슬러그+편집/삭제)
5. profileStore에 `currentProfileId`, `profiles[]` 추가

**검증**: 페이지 2개+ 생성, 각각 독립 테마/링크, 삭제 시 CASCADE

---

### Phase 8: 마무리 + 통합 테스트

**목표**: 전체 플로우 점검, 보안/UX 보강

**작업 내용**:
1. XSS 방지 (서버 escape, `javascript:` 스킴 차단)
2. 에러 바운더리 컴포넌트
3. NotFoundPage (404)
4. 로딩/빈 상태 UI
5. 접근성 (키보드 내비게이션, focus 스타일, aria-label)
6. 반응형 최종 점검 (375/390/414px, 1440px)

**전체 E2E 테스트 시나리오**:
1. 회원가입 → 이메일 인증 → 로그인
2. 프로필 작성 → 링크 5개 추가 → 드래그 정렬
3. 테마 선택 → 커스텀 수정 → 저장
4. 공유 URL 복사 → 시크릿 창에서 접속 확인
5. QR 코드 스캔 → 모바일 접속
6. 다중 페이지 생성 → 독립 확인
7. 비밀번호 재설정 플로우
8. Lighthouse 모바일 Performance 80+ 목표

---

## 9. 환경변수 목록

```env
# apps/server/.env
DATABASE_URL=postgresql://postgres.hcbemyxfiqypzgxkilqc:pc8500im_12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-key       # JWT 서명 비밀키
JWT_EXPIRES_IN=24h                     # JWT 만료 시간

SUPABASE_URL=https://xxx.supabase.co   # Supabase Storage용 URL
SUPABASE_SERVICE_KEY=eyJ...            # Service Role Key (Storage만 사용)

SMTP_HOST=smtp.gmail.com               # 메일 서버
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app-password
MAIL_FROM="LinkPage <noreply@linkpage.app>"

CLIENT_URL=http://localhost:5173       # 프론트엔드 URL (CORS, 메일 링크)
PORT=3001                              # Express 서버 포트
NODE_ENV=development
```

---

## 10. 활용할 Skills & Agents

### 내장 Skills
| Skill | 용도 | 활용 Phase |
|---|---|---|
| `feature-dev:feature-dev` | 각 Phase별 기능 구현 가이드 | 전체 |
| `frontend-design:frontend-design` | 고품질 UI 컴포넌트/페이지 구현 | Phase 2~6 |
| `figma:implement-design` | Wanted Design System Figma 참조 구현 | Phase 5~6 |
| `figma:create-design-system-rules` | 프로젝트 디자인 시스템 규칙 생성 | Phase 0 |

### 커스텀 에이전트 (`.claude/agents/`)
| Agent | 용도 | 활용 Phase | 비고 |
|---|---|---|---|
| `auth-specialist` | Express JWT 인증 시스템 | Phase 2 | 인증 로직/보안 패턴 참조 |
| `server-specialist` | Express 서버 개발 | Phase 0~4 | API 설계/에러 핸들링 패턴 참조 |
| `react-single-file-dev` | React 프론트엔드 | Phase 2~6 | 컴포넌트 구조/디자인 시스템 패턴 참조 |
| `vercel-deploy-optimizer` | Vercel 배포 자동화 | Phase 8+ | 배포 시 그대로 활용 |

> **참고**: 기존 에이전트들은 단일 파일 구조(server.js / index.html)에 특화되어 있음.
> Monorepo 구조에서는 에이전트의 **설계 패턴과 보안 원칙**을 참조하되, 파일 구조 제약은 따르지 않음.

---

## 11. 주요 설계 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| DB 접근 | raw SQL (`pg`) | 테이블 3개, 쿼리 단순. ORM 오버헤드 불필요 |
| 상태 관리 | Zustand | 스토어 3개로 충분, Redux 보일러플레이트 과다 |
| DnD | @hello-pangea/dnd | 수직 리스트 정렬 특화, dnd-kit보다 간단 |
| JWT 저장 | localStorage | MVP 빠른 구현. 추후 httpOnly 쿠키 전환 권장 |
| 미리보기 | 동일 DOM + CSS 스코프 | iframe 대비 실시간 반영 용이 |
| 이미지 저장 | Supabase Storage | Public bucket + 서버 경유 업로드 |
