# PRD: 프로필 링크 페이지 빌더 (MVP 범위) — (가칭: LinkPage)

> 문서 목적: “프로필 섹션 + 링크 버튼 리스트 + 테마/스타일링 + 링크 관리 + 페이지 공유/푸터”까지만 구현하는 **MVP 사이트 기획서/요구사항**을 정의한다.  
> 작성일: 2026-02-19 (Asia/Seoul)  
> 버전: v0.3 (**Supabase Auth 미사용 확정**)  
> 기술 스택: **React + Express**, DB: **Supabase (PostgreSQL)**  
> 인증/로그인: **Supabase Auth 사용 금지** → **Express 자체 인증(세션/JWT) + DB 기반 사용자 관리**

---

## 0. 한 줄 정의
사용자가 **모바일 최적화 프로필 링크 페이지**를 만들고, **링크 버튼을 관리**하며, 생성된 **페이지 URL을 공유**할 수 있는 서비스.

---

## 1. 이번 MVP 범위(필수 기능) ✅

### 1) 프로필 섹션
- 프로필 이미지(선택)
- 디스플레이 이름(필수)
- 한 줄 소개/바이오(선택)
- 소셜/연락처 아이콘(선택: 인스타/유튜브/카카오/이메일 등 “링크”로만 처리)

### 2) 링크 버튼 리스트
- 링크 버튼 추가/수정/삭제
- 드래그로 순서 변경
- 버튼 유형: **URL 열기만**(전화/문자/메일 등은 이번 MVP 제외)
- 버튼: 라벨(필수), 설명(선택), URL(필수), 아이콘(선택), 활성/비활성 토글

### 3) 테마/스타일링
- 페이지 테마 프리셋(최소 8종)
- 커스텀 스타일(간단):
  - 배경색(또는 그라데이션 1종)
  - 텍스트 색
  - 버튼 스타일(라운드 정도, 채움/아웃라인)
  - 폰트(기본 1종 + 선택 2종 정도)
- 실시간 미리보기(모바일 우선)

### 4) 링크 관리 기능(대시보드)
- 내 페이지 설정(초기에는 “페이지 1개”만 제공해도 됨 / 확장 가능)
- 링크 목록 관리(정렬, 활성/비활성)

### 5) 페이지 공유 & 푸터
- 공개 페이지 URL 발급: `/p/:slug`
- 공유 버튼:
  - URL 복사
  - QR 생성(선택: v0.3에는 “있으면 좋음”, 없으면 v0.4)
- 푸터:
  - 작은 브랜드 문구/로고(예: “Made with LinkPage”)

---

## 2. 이번 MVP에서 제외(명확히) ❌
- 개인화 링크(엑셀 업로드, 토큰 치환)
- 예약/설문/문의 폼
- 결제/크레딧/구독 시스템
- 상세 분석(페이지뷰/클릭, 다운로드)
- 팀/권한/워크스페이스
- 커스텀 도메인

---

## 3. 사용자 플로우

### 3.1 온보딩/제작 플로우(자체 인증)
0) **랜딩 페이지(`/`)**: 서비스 소개, 기능 카드, 테마 미리보기, CTA 버튼 → 회원가입 유도
   - 인증된 사용자가 `/` 접속 시 자동으로 `/dashboard` 리다이렉트
1) 회원가입(이메일+비밀번호) 또는 이메일 매직링크(선택)
2) 로그인(세션/JWT)
3) "내 페이지" 생성(또는 자동 생성)
4) 프로필 섹션 입력
5) 링크 버튼 추가/정렬/활성 토글
6) 테마 선택 및 간단 스타일 조정
7) 저장 → 공유 URL 복사 → 배포

### 3.2 방문자 플로우(퍼블릭 페이지)
1) 공유 URL 접속(`/p/:slug`)  
2) 프로필 확인 → 링크 버튼 클릭  
3) 푸터 노출

---

## 4. 화면 구성(IA) — MVP

### 4.0 랜딩 페이지 ✅ (구현 완료 — Figma 디자인 반영)
- `/` (미인증 사용자 → 랜딩 페이지, 인증된 사용자 → `/dashboard` 리다이렉트)
  - **Header**: sticky, 그라디언트 로고(아이콘 blue→purple + 텍스트 gradient) + 로그인/시작하기(gradient) 버튼
  - **Hero**: 그라디언트 배경 오버레이, "✨ 새로운 방식의 링크 관리" 배지 pill, 제목("나의 모든 링크를" dark + "하나의 페이지에" gradient text blue→purple→pink), CTA 2개("무료로 시작하기" gradient 버튼, "데모 미리보기" outline 버튼 → `#themes` 앵커)
  - **Features**: 흰 배경, 6개 기능 카드 (무제한 링크, 실시간 분석, 모바일 최적화, 통계 관리, 쉬운 공유, 빠른 설정) — 각 아이콘에 고유 그라디언트 배경, border-gray-100 카드
  - **Theme Preview**: `#themes` 앵커, `LandingThemeCarousel` (7개 프리셋 emoji pill 버튼, 선택 시 gradient bg, blur glow 뒤 MobilePreview)
  - **Final CTA**: 3색 그라디언트 배경(blue→purple→pink), 흰색 버튼 + 파란 텍스트
  - **Footer**: 중앙 정렬, 그라디언트 로고 + 저작권
- 디자인 참조: Figma `bz4R1BxCfLYIOU1OoTY5bn` (node `0:3`)
- 구현 파일:
  - `apps/web/src/pages/public/LandingPage.tsx`
  - `apps/web/src/components/organisms/LandingThemeCarousel.tsx`
  - `apps/web/src/App.tsx` (`LandingRoute` 컴포넌트 — auth 상태 기반 분기)

### 4.1 퍼블릭 페이지
- `/p/:slug`
  - 상단: 프로필 섹션
  - 중단: 링크 버튼 리스트
  - 하단: 푸터

### 4.2 제작/관리(대시보드)
- `/dashboard` (로그인 필요)
  - 페이지 설정(프로필/테마)
  - 링크 관리(추가/정렬/활성)
  - 공유(URL 복사)

---

## 5. 요구사항 상세(Functional Requirements)

### 5.1 프로필 섹션
**FR-PF-01** 프로필 이미지 업로드(선택)  
- 이미지 저장 위치:
  - 옵션 A(권장): Supabase Storage 사용(단, Auth 없이 Public bucket + Signed URL 정책을 별도 설계)  
  - 옵션 B: 별도 S3 호환 스토리지(Cloudflare R2/S3) 사용  
- MVP에서는 **업로드 용량/해상도 제한**을 두고, 리사이즈는 후순위

**FR-PF-02** 이름/바이오 입력  
- 이름 필수, 바이오 선택  
- XSS 방지(escape)

**FR-PF-03** 소셜 링크(선택)  
- 단순 링크 필드로 처리(아이콘+URL)

---

### 5.2 링크 버튼 리스트
**FR-LK-01** 링크 생성/수정/삭제  
- 필드: `label*`, `url*`, `description`, `icon`, `is_active`

**FR-LK-02** 링크 순서 변경  
- 드래그앤드롭 정렬 → `sort_order` 저장

**FR-LK-03** 유효성 검증  
- URL 스킴(`https://` 권장) 기본 검증  
- 저장 실패/성공 토스트

---

### 5.3 테마/스타일링
**FR-TH-01** 프리셋 테마 선택  
- 최소 8종(라이트/다크/컬러풀 등)

**FR-TH-02** 커스텀 스타일(간단)  
- 배경색, 텍스트색, 버튼 스타일(rounded/filled), 폰트 선택

**FR-TH-03** 실시간 미리보기  
- 에디터 화면에 모바일 프리뷰 제공

---

### 5.4 링크 관리(대시보드)
**FR-MG-01** 내 페이지 설정 저장  
- 변경 즉시 자동 저장(디바운스) 또는 “저장” 버튼(택1)

**FR-MG-02** 링크 관리 화면  
- 링크 목록, 정렬, 활성 토글, 편집/삭제

---

### 5.5 페이지 공유 & 푸터
**FR-SH-01** 공유 URL 생성
- `/p/:slug` 형태
- 슬러그: 자동 생성(권장) + 최초 1회 변경 허용(추천 정책)

**FR-SH-02** URL 복사 버튼 제공

**FR-FT-01** 푸터 표시
- 브랜드 문구/로고

---

### 5.6 랜딩 페이지 ✅ (구현 완료 — Figma 디자인 반영)
**FR-LP-01** 랜딩 페이지 라우팅
- `/` 접속 시 인증 상태 확인 후 분기
- 미인증 → 랜딩 페이지 표시
- 인증됨 → `/dashboard` 리다이렉트
- 로딩 중 → Spinner 표시

**FR-LP-02** 서비스 소개 Hero 섹션 (Figma 반영)
- 그라디언트 배경 오버레이 (subtle blue-white)
- "✨ 새로운 방식의 링크 관리" 배지 pill (bg-blue-50, border-blue-200)
- 제목: "나의 모든 링크를" dark + "하나의 페이지에" 3색 그라디언트 텍스트 (blue→purple→pink)
- CTA: "무료로 시작하기" 그라디언트 버튼 (blue→purple + shadow) + "데모 미리보기" outline 버튼 → `#themes`
- 헤더: `GradientLogo` (gradient icon + gradient text), "시작하기" gradient 버튼

**FR-LP-03** 기능 소개 카드 (6개, Figma 반영)
- 흰 배경, border-gray-100 카드, rounded-2xl
- 각 아이콘에 고유 그라디언트 배경 (blue→cyan, purple→pink, orange→red, green→teal, indigo→blue, yellow→orange)
- 카드: 무제한 링크, 실시간 분석, 모바일 최적화, 통계 관리, 쉬운 공유, 빠른 설정

**FR-LP-04** 인터랙티브 테마 미리보기 (Figma 반영)
- `LandingThemeCarousel` 컴포넌트: 7개 프리셋 (Clean White 제외), emoji pill 버튼
- 선택 시: 그라디언트 배경 (blue→purple) + shadow, 미선택: 흰 배경 + border
- 더미 프로필("당신의 이름", "@username · Creator") + 4개 링크
- MobilePreview 뒤에 blur glow 효과

**FR-LP-05** 회원가입 유도 CTA 섹션 (Figma 반영)
- 3색 그라디언트 배경 (blue→purple→pink)
- 큰 제목 (text-6xl), 흰색 버튼 + 파란 텍스트 (#155DFC)

**FR-LP-06** Footer (Figma 반영)
- 중앙 정렬 `GradientLogo` + 저작권 텍스트

---

## 6. 비기능 요구사항(NFR)

### 6.1 성능
- 퍼블릭 페이지는 모바일 기준 빠르게 로딩(LCP 개선)
- 이미지 lazy-load(필요 시)

### 6.2 보안(중요: Auth 미사용)
- 로그인은 **Express 자체 인증**으로 구현:
  - 비밀번호는 반드시 해시(예: bcrypt/argon2)
  - 로그인 성공 시 세션 쿠키(HTTPOnly) 또는 JWT 발급
- 모든 “수정/저장” API는 인증 필수
- 입력값 escape, URL 검증

### 6.3 개인정보
- 이번 MVP는 개인정보 수집 기능(폼/예약/설문) 없음  
- 계정 정보(이메일 등) 보관/삭제 정책 필요

---

## 7. 기술 설계(React + Express + Supabase Postgres)

### 7.1 아키텍처
- Frontend: React (SPA)
- Backend: Express API (인증/권한, DB 접근, 파일 업로드 URL 발급)
- DB: Supabase PostgreSQL (Auth 미사용)
- (선택) Storage: Supabase Storage 또는 별도 Object Storage

### 7.2 인증 설계(대안)
> Supabase Auth를 사용하지 않기 때문에, 아래를 사용
DATABASE_URL=process.env.DATABASE_URL
---

## 8. 데이터 모델(초안, Supabase Postgres)

### 8.1 테이블
#### `users`
- `id` (uuid, pk)
- `email` (text, unique, not null)
- `password_hash` (text, not null)  // bcrypt/argon2 결과
- `email_verified` (boolean, not null, default false) // 이메일 인증 도입 시
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `profiles`
- `id` (uuid, pk) — profile id
- `user_id` (uuid, fk -> users.id, unique, not null)  // 1:1
- `slug` (text, unique, not null)
- `display_name` (text, not null)
- `bio` (text, null)
- `avatar_url` (text, null)
- `social_links` (jsonb, null)  // [{type, url}]
- `theme_preset` (text, not null, default 'preset_1')
- `theme_overrides` (jsonb, null) // {bgColor, textColor, buttonStyle, font}
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `profile_links`
- `id` (uuid, pk)
- `profile_id` (uuid, fk -> profiles.id, not null)
- `label` (text, not null)
- `url` (text, not null)
- `description` (text, null)
- `icon` (text, null) // icon key
- `is_active` (boolean, not null, default true)
- `sort_order` (int, not null, default 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### (선택) `sessions` (세션 기반 인증 시)
- `id` (text, pk) // session id
- `user_id` (uuid, fk -> users.id, not null)
- `expires_at` (timestamptz, not null)
- `data` (jsonb, null)
- `created_at` (timestamptz)

### 8.2 RLS(정책)
- **옵션 1(권장: MVP 단순)**: RLS를 최소화하고, DB는 **서버(Express)만 접근**하도록 구성(서버 키 사용).  
  - 퍼블릭 페이지 조회도 Express가 수행하여 응답.
- **옵션 2(고급)**: 클라이언트 직접 조회가 필요하면 RLS 설계가 필요하지만, Supabase Auth 없이 RLS를 안전하게 쓰기 까다로움.  
MVP에서는 **옵션 1**을 권장한다.

---

## 9. API 설계(Express) — MVP (Auth 미사용 반영)

### 9.1 Auth Endpoints(자체)
- `POST /api/auth/signup` 회원가입
- `POST /api/auth/login` 로그인
- `POST /api/auth/logout` 로그아웃
- `GET  /api/auth/me` 로그인 상태 확인

### 9.2 Profile/Links
#### 프로필
- `GET /api/me/profile` 내 프로필 조회
- `PUT /api/me/profile` 내 프로필 수정(이름/바이오/테마 등)
- `POST /api/me/profile/slug` 슬러그 설정/변경(최초 1회 정책 추천)
- `POST /api/me/profile/avatar` (선택) 업로드 URL 발급 또는 업로드 처리

#### 링크
- `GET /api/me/links` 내 링크 리스트
- `POST /api/me/links` 링크 생성
- `PUT /api/me/links/:id` 링크 수정
- `DELETE /api/me/links/:id` 링크 삭제
- `PUT /api/me/links/reorder` 링크 정렬 저장([{id, sort_order}])

#### 퍼블릭
- `GET /api/public/profile/:slug` 퍼블릭 프로필 + 활성 링크 반환

---

## 10. Acceptance Criteria(출시 기준)

### MVP 출시 기준
- 대시보드에서 프로필/링크/테마를 설정하면 퍼블릭 페이지에 즉시 반영
- 링크 추가/정렬/활성 토글이 모바일/데스크탑에서 안정적으로 동작
- `/p/:slug` 페이지가 주요 모바일 브라우저에서 깨지지 않음(Chrome/Safari/삼성인터넷)
- 기본 보안:
  - 비로그인 사용자는 수정 불가
  - 계정 비밀번호는 해시 저장
  - 세션/JWT 검증이 누락되지 않음(모든 쓰기 API 보호)

---

## 11. 오픈 이슈(결정 필요)
1) 인증 방식 확정: JWT  
2) 이메일 인증/비밀번호 재설정 플로우 포함해줘
3) QR 제공 여부(v0.3 포함)  
4) 페이지 개수: 다중 페이지
5) 테마 프리셋 디자인 세트는 알아서 만들어줘 

---

## 변경 이력
- v0.5 (2026-02-19): 랜딩 페이지 Figma 디자인 반영 — 그라디언트 로고/Hero/CTA, 배지 pill, gradient text, 아이콘별 고유 그라디언트, emoji theme pill 버튼, blur glow, 텍스트 Figma 일치
- v0.4 (2026-02-19): 랜딩 페이지 추가 — `/` 라우트에 서비스 소개 페이지 (Hero, Features, 테마 미리보기, CTA) 구현, 인증 상태 기반 라우팅 분기
- v0.3 (2026-02-19): Supabase Auth 사용 금지 반영 → 자체 인증(Express)으로 전환, RLS 권장안 수정
---

# 12. 디자인 시스템 기준 (Design System Guideline)

## 12.1 디자인 시스템 참조

본 프로젝트의 UI/UX 설계 및 컴포넌트 구조는 아래 디자인 시스템을 참고하여 구축한다.

### ① Wanted Montage Design System
- 문서: https://montage.wanted.co.kr/docs/getting-started
- 목적:
  - 컴포넌트 구조 표준화
  - 디자인 토큰 기반 스타일링
  - 일관된 인터랙션 패턴 적용

### ② Wanted Design System (Figma)
- Figma 파일:
  https://www.figma.com/design/nfNcE5jfxgqyjds6RS3N1W/Wanted-Design-System--Community-?node-id=0-1&t=nWslE68oe8cb0Foh-1
- 목적:
  - 컬러/타이포/간격 시스템 정립
  - 버튼/폼/카드 컴포넌트 구조 참고
  - 모바일 UI 기준 확보

---

## 12.2 적용 원칙

### 1) Design Token 기반 개발
- React 코드에서 색상/간격을 하드코딩하지 않는다.
- 토큰 예시:
  - `--color-primary`
  - `--color-background`
  - `--color-text-primary`
  - `--radius-md`
  - `--spacing-16`
- 테마 변경은 토큰/프리셋 변경으로만 처리한다.

### 2) 컴포넌트 구조 표준화
Atomic Design 구조를 따르며, 최소 컴포넌트는 아래를 포함한다.
- `Button`
- `ProfileHeader`
- `LinkItem`
- `LinkList`
- `PageContainer`
- `Footer`

각 컴포넌트는:
- Props 기반 스타일 변경
- 상태(hover/active/disabled) 정의
- 재사용 가능한 구조

### 3) 반응형 기준
- 기본 타겟: 모바일
- 최대 width: 480px
- 중앙 정렬 컨테이너
- 데스크탑은 모바일 미러 형태

### 4) 접근성(A11y)
- 버튼은 `button` 태그 사용
- 키보드 포커스 가능
- 명확한 focus 스타일 제공
- WCAG 대비 기준 준수

---

## 12.3 스타일 구현 전략
권장 옵션: Tailwind + Custom Theme (권장)

Montage Design System을 참고하여 Tailwind theme 확장 또는 CSS 변수 기반 테마 엔진을 구성한다.

---

## 12.4 MVP 디자인 범위
이번 MVP에서 구현할 디자인 영역:
- 프로필 카드 UI
- 링크 버튼 UI (primary style 1종)
- 테마 프리셋 8종
- 푸터 UI

