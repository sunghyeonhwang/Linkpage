# LinkPage Test Plan

## Overview

LinkPage 프로젝트의 전체 테스트 전략, 반복 구간(ralph-loop), 사용 모델을 정의한 문서.

---

## Framework Selection

| 구분 | 도구 | 용도 |
|---|---|---|
| Unit/Integration Runner | Vitest | shared, server, web 단위/통합 테스트 |
| API Integration | Supertest | Express 라우트 통합 테스트 |
| Component Test | @testing-library/react + jsdom | React 컴포넌트 렌더링 검증 |
| Browser E2E | Playwright | 실제 브라우저 전체 플로우 테스트 |

---

## Execution Results Summary

| Phase | 모델 | 테스트 수 | 결과 | 반복 횟수 |
|---|---|---|---|---|
| 1. Shared Unit | `haiku` | 73 | **PASS** | 1 (수정 1회: vitest root 설정) |
| 2. Server Unit | `sonnet` | 29 | **PASS** | 1 |
| 3. API Integration | `sonnet` | 65 | **PASS** | 3 (dotenv, pool.end, parallelism) |
| 4. Web Component | `sonnet` | 28 | **PASS** | 2 (localStorage polyfill) |
| 5. Playwright E2E | `opus` | 12 | **PASS** | 5 (selectors, timing, networkidle) |
| **Total** | | **207** | **ALL PASS** | |

---

## Phase 1: Shared Unit Tests — COMPLETE

> `packages/shared` 순수 함수/스키마 테스트

**Model: `haiku`** | **73 tests passed**

### 테스트 파일

| 파일 | 테스트 항목 | Tests |
|---|---|---|
| `src/__tests__/utils.test.ts` | generateSlug, isValidUrl, sanitizeUrl, escapeHtml | 19 |
| `src/__tests__/validation.test.ts` | signup/login/profile/slug/link Zod 스키마 | 42 |
| `src/__tests__/themes.test.ts` | THEME_PRESETS, getThemePreset, 구조 무결성 | 12 |

### 수정 사항
- vitest.config.ts에 `root: path.resolve(__dirname)` 추가 (테스트 파일 탐지 실패 해결)

---

## Phase 2: Server Unit Tests — COMPLETE

> `apps/server` 미들웨어, 유틸리티 단위 테스트

**Model: `sonnet`** | **29 tests passed**

### 테스트 파일

| 파일 | 테스트 항목 | Tests |
|---|---|---|
| `src/__tests__/utils/jwt.test.ts` | signToken, verifyToken | 7 |
| `src/__tests__/utils/hash.test.ts` | hashPassword, comparePassword | 5 |
| `src/__tests__/middleware/validate.test.ts` | validate middleware 정상/실패 | 5 |
| `src/__tests__/middleware/auth.test.ts` | authMiddleware 인증/미인증 | 5 |
| `src/__tests__/middleware/error.test.ts` | AppError, errorHandler | 7 |

---

## Phase 3: API Integration Tests — COMPLETE

> Express 라우트 전체 통합 테스트 (Supertest + 실제 DB)

**Model: `sonnet`** | **65 tests passed** (9 test files)

### 테스트 파일

| 파일 | 시나리오 | Tests |
|---|---|---|
| `src/__tests__/routes/auth.test.ts` | signup(201/409/400), login(200/401), me, logout | 11 |
| `src/__tests__/routes/profile.test.ts` | 프로필 CRUD, slug 변경, 소유권 | 12 |
| `src/__tests__/routes/link.test.ts` | 링크 CRUD, reorder | 9 |
| `src/__tests__/routes/public.test.ts` | 공개 프로필, 활성 링크 필터링 | 4 |

### 수정 사항 (3회 반복)
1. `dotenv.config()` vitest.config.ts에 추가 (ECONNREFUSED 해결)
2. 개별 파일의 `pool.end()` 제거 (다중 호출 오류 해결)
3. `fileParallelism: false`, `testTimeout: 15000` 설정

---

## Phase 4: Web Unit & Component Tests — COMPLETE

> React 컴포넌트, Zustand 스토어, 유틸리티 테스트

**Model: `sonnet`** | **28 tests passed**

### 테스트 파일

| 파일 | 테스트 항목 | Tests |
|---|---|---|
| `src/__tests__/lib/themes.test.ts` | resolveTheme, getBackgroundStyle | 8 |
| `src/__tests__/lib/cn.test.ts` | cn() 유틸리티 | 4 |
| `src/__tests__/stores/authStore.test.ts` | setAuth, logout 상태 변이 | 5 |
| `src/__tests__/components/atoms/Button.test.tsx` | 렌더링, 이벤트, loading | 5 |
| `src/__tests__/components/atoms/Toggle.test.tsx` | ARIA, 토글 이벤트 | 6 |

### 수정 사항 (2회 반복)
1. setup.ts에 localStorage polyfill 추가 (Zustand persist 호환)

---

## Phase 5: Playwright Browser E2E Tests — COMPLETE

> 실제 브라우저에서 전체 사용자 플로우 검증

**Model: `opus`** | **12 tests passed**

### 테스트 파일

| 파일 | 시나리오 | Tests |
|---|---|---|
| `e2e/tests/auth.spec.ts` | 회원가입, 로그인(성공/실패), AuthGuard, GuestGuard, 로그아웃 | 6 |
| `e2e/tests/links.spec.ts` | 링크 추가, 수정, 삭제, 활성/비활성 토글 | 4 |
| `e2e/tests/public-profile.spec.ts` | 공개 프로필 표시, 404 처리 | 2 |

### 수정 사항 (5회 반복)
1. **Iteration 1**: placeholder 기반 선택자로 전환, `getByRole('link')` 사용
2. **Iteration 2**: strict mode 수정 (`exact: true`), form scoping 추가
3. **Iteration 3**: `waitForResponse` 패턴으로 API 응답 대기 추가
4. **Iteration 4**: `page.waitForLoadState('networkidle')` 추가 — fetchProfiles/fetchLinks 완료 대기 (loading 상태 변경으로 인한 폼 재마운트 문제 해결)
5. **Iteration 5**: lucide SVG 클래스명 수정 (`lucide-trash2`, 하이픈 없음), `getByText` exact 옵션 추가

### 주요 디버깅 노트
- **핵심 이슈**: LinksPage의 `fetchProfiles()` → `fetchLinks()` 체인에서 `loading: true` 설정 시 스피너가 렌더링되면서 LinkEditor가 언마운트 → 폼 상태 초기화
- **해결**: `beforeEach`에서 `page.waitForLoadState('networkidle')` 추가하여 모든 네트워크 요청 완료 후 테스트 시작
- **lucide-react v0.475.0**: `toKebabCase("Trash2")` → `"trash2"` (하이픈 없음), SVG class는 `lucide lucide-trash2`

---

## npm Scripts

```jsonc
// root package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:shared": "vitest run --config packages/shared/vitest.config.ts",
    "test:server": "vitest run --config apps/server/vitest.config.ts",
    "test:web": "vitest run --config apps/web/vitest.config.ts",
    "test:e2e": "npx playwright test --config e2e/playwright.config.ts",
    "test:e2e:ui": "npx playwright test --config e2e/playwright.config.ts --ui"
  }
}
```

---

## 실행 순서 (완료)

```
Phase 1 (haiku)     ─→  73 tests ✅  (1회 수정)
Phase 2 (sonnet)    ─→  29 tests ✅  (1회 통과)
Phase 3 (sonnet)    ─→  65 tests ✅  (3회 반복)
Phase 4 (sonnet)    ─→  28 tests ✅  (2회 반복)
Phase 5 (opus)      ─→  12 tests ✅  (5회 반복)
─────────────────────────────────────
Total: 207 tests     ALL PASSED
```
