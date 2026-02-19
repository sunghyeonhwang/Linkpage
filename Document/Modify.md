# LinkPage 수정 이력

## 2026-02-19 — 실시간 분석 기능 + GitHub + Vercel 배포

### 1. 실시간 분석/통계 기능 구현

#### DB + Shared 타입
- `003_analytics.sql` — lp_page_views, lp_link_clicks 테이블 + 복합 인덱스
- `packages/shared/src/types/index.ts` — AnalyticsSummary, DailyStat, LinkStat, AnalyticsData, AnalyticsPeriod, TrackClickPayload, TrackViewPayload

#### Server (Repository → Service → Controller → Route)
- `analyticsRepository.ts` — recordView/Click, getSummary, getDailyStats (generate_series), getLinkStats (LEFT JOIN)
- `analyticsService.ts` — trackView/Click (fire-and-forget), getAnalytics (소유자 검증 + Promise.all 병렬), IP 해시 (SHA256 앞 16자)
- `analyticsController.ts` — trackView/Click 204 즉시 응답 + 비동기 기록, getAnalytics try-catch-next
- `routes/public.ts` — POST /track/view, /track/click 추가
- `routes/profile.ts` — GET /:profileId/analytics 추가

#### Frontend Tracking
- `lib/tracking.ts` — sendBeacon 우선, fetch keepalive 폴백
- `PublicProfilePage.tsx` — 데이터 로드 성공 시 trackView, 링크 onClick에 trackClick

#### Frontend Dashboard
- recharts 설치
- `services/analyticsApi.ts` — GET /me/profile/:id/analytics?period=
- `stores/analyticsStore.ts` — Zustand (data, period, loading, fetchAnalytics, setPeriod)
- `pages/dashboard/AnalyticsPage.tsx` — 요약 카드 4개(Eye, MousePointerClick, TrendingUp, BarChart3) + 기간 선택(7d/30d/90d) + LineChart(조회수 보라/클릭수 주황) + 링크별 클릭수 테이블
- `DashboardLayout.tsx` — BarChart3 + '통계' nav 추가
- `App.tsx` — /dashboard/analytics 라우트 추가

### 2. GitHub 연결
- `git init` → `git remote add origin https://github.com/sunghyeonhwang/Linkpage.git`
- Initial commit: 137 files, 19,205 lines

### 3. Vercel 풀스택 배포
- 프로덕션: https://linkpage-ten.vercel.app
- `vercel.json` — buildCommand, outputDirectory, rewrites
- `api/index.ts` — Express → serverless function 래핑
- 해결 이슈:
  - ESM/CJS 호환 → dynamic import()
  - Body 파싱 충돌 → req._body = true
  - CORS origin 에러 → origin: true
  - JWT_EXPIRES_IN trailing newline → .trim()
  - Express 5 req.params 타입 → as string 캐스트

### 4. 기타
- md 파일 → `Document/` 폴더 정리
- `.gitignore`에 test-results/, .vercel 추가

---

## 이전 — 배경 이미지 + 공개 프로필 Linktree 리디자인

### DB 마이그레이션
- `002_background_image.sql` — lp_profiles에 background_image_url 추가

### 서버
- profileRepository allowedFields에 background_image_url 추가
- profileController에 uploadBackgroundImage, removeBackgroundImage 핸들러
- 라우트: POST/DELETE /:profileId/background-image

### 테마 시스템
- `getBackgroundStyle` — backgroundImageUrl 파라미터 추가
- `getFrameBackgroundStyle` — 데스크톱 프레임용 (테마색 88% + 검정 12%)
- `getContrastTextColor` — 배경 밝기 기반 자동 텍스트 색상

### 공개 프로필 리디자인
- 데스크톱 프레임 레이아웃 (외부 frame + 내부 580px 콘텐츠)
- 공유 모달 (링크 복사 + QR + 네이티브 공유)
- 링크 카드 hard shadow + hover 애니메이션
- 배경 이미지 + 반투명 오버레이

### 랜딩페이지 GSAP 애니메이션
- gsap + @gsap/react 설치
- Hero timeline, Features/Theme/CTA ScrollTrigger 순차 등장
