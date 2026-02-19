# 배경 이미지 기능 추가 및 공개 프로필 Linktree 스타일 리디자인

## 변경 사항

### 1. DB 마이그레이션 (`apps/server/src/db/migrations/002_background_image.sql` — 신규)
- `lp_profiles` 테이블에 `background_image_url TEXT` 컬럼 추가

### 2. 공유 타입 수정 (`packages/shared/src/types/index.ts`)
- `Profile` 인터페이스에 `background_image_url: string | null` 필드 추가

### 3. 서버 리포지토리 (`apps/server/src/repositories/profileRepository.ts`)
- `allowedFields` 배열에 `'background_image_url'` 추가

### 4. 서버 컨트롤러 (`apps/server/src/controllers/profileController.ts`)
- `uploadBackgroundImage` 핸들러 추가 — avatar와 동일한 base64 data URL 패턴
- `removeBackgroundImage` 핸들러 추가 — `background_image_url`을 null로 설정

### 5. 서버 라우트 (`apps/server/src/routes/profile.ts`)
- `POST /:profileId/background-image` — multer 재사용, 배경 이미지 업로드
- `DELETE /:profileId/background-image` — 배경 이미지 삭제

### 6. 프론트엔드 API 클라이언트 (`apps/web/src/services/profileApi.ts`)
- `uploadBackgroundImage(profileId, file)` 메서드 추가
- `removeBackgroundImage(profileId)` 메서드 추가

### 7. 프론트엔드 스토어 (`apps/web/src/stores/profileStore.ts`)
- `uploadBackgroundImage` 액션 추가 — profileApi 호출 후 스토어 즉시 반영
- `removeBackgroundImage` 액션 추가

### 8. 테마 시스템 (`apps/web/src/lib/themes.ts`)
- `getBackgroundStyle`에 `backgroundImageUrl?: string | null` 세 번째 파라미터 추가
- 배경 이미지 있으면 `backgroundImage: url(...)`, `backgroundSize: cover`, `backgroundPosition: center` 반환
- `getFrameBackgroundStyle` 함수 신규 추가 — 데스크톱 외부 프레임용
  - 테마 배경색의 88% + 검정 12% 혼합 (`color-mix(in srgb, bg 88%, black 12%)`)
  - Linktree 데스크톱 프레임 패턴 재현
- `getContrastTextColor` 함수 추가 — 배경 밝기 기반 자동 텍스트 색상 결정

### 9. AppearancePage (`apps/web/src/pages/dashboard/AppearancePage.tsx`)
- 테마 프리셋과 커스텀 스타일 섹션 사이에 "배경 이미지" 섹션 추가
- 업로드 영역 (드래그 영역 스타일) + 미리보기 썸네일 + 변경/삭제 버튼
- `useRef`로 파일 입력 참조, profileStore의 upload/remove 사용

### 10. 공개 프로필 Linktree 스타일 리디자인 (`apps/web/src/pages/public/PublicProfilePage.tsx`)
- **데스크톱 프레임 레이아웃**: 외부 배경은 `getFrameBackgroundStyle` (약간 어두운 톤), 내부 콘텐츠 컬럼(580px)은 `getBackgroundStyle` (원래 테마 색)로 분리
- **자동 텍스트 대비**: 배경색 밝기 기반으로 자동 텍스트 색상 결정 (`getContrastTextColor`)
- **공유 버튼**: 우측 상단 Share2 아이콘, 흰 배경 고정
- **공유 모달**: 하단 시트 스타일 (slide-up 애니메이션)
  - 링크 복사 (클립보드 API + 복사 완료 피드백)
  - QR 코드 표시 + PNG 다운로드 (`#share-qr-code`)
  - 네이티브 공유 (Web Share API 지원 시)
- **링크 카드**: min-h-[56px], hard shadow (`4px 4px 0 0`), hover:scale+translate-y
- **소셜 아이콘**: 원형 배경 + hover scale 애니메이션
- **배경 이미지**: `getBackgroundStyle`에 `background_image_url` 전달 + 반투명 오버레이

### 11. MobilePreview 동기화 (`apps/web/src/components/organisms/MobilePreview.tsx`)
- `getLinkStyle()` 함수로 hard shadow 스타일 통일
- 배경 이미지 지원 + 반투명 오버레이

### 12. Tailwind 설정 (`apps/web/tailwind.config.ts`)
- `max-w-mobile`: 480px → 580px (Linktree 표준 데스크톱 콘텐츠 폭)

### 13. 글로벌 CSS (`apps/web/src/styles/globals.css`)
- `.animate-slide-up` 유틸리티 클래스 추가 (공유 모달 애니메이션)
- `body`에 `word-break: keep-all` 추가 (한글 단어 단위 줄바꿈)

### 14. 랜딩페이지 GSAP 애니메이션 (`apps/web/src/pages/public/LandingPage.tsx`)
- 배경 영상: `blur-sm` + 오버레이 `bg-black/70`으로 어둡게 + 흐릿하게 처리
- **GSAP + ScrollTrigger** 스크롤 애니메이션 적용:
  - **Hero** (페이지 로드 시 timeline): badge → title 1행 → title 2행 → subtitle → CTA 순차 fade in + slide up
  - **Features** (ScrollTrigger): 제목/서브 fade in + 6개 카드 `stagger: 0.1` 순차 등장
  - **Theme Preview** (ScrollTrigger): 제목/서브 fade in + 캐러셀 scale up
  - **Final CTA** (ScrollTrigger): 제목 → 서브 → 버튼 순차 fade in
  - **Footer**: fade in
- `useGSAP()` 훅 + `scope: containerRef`로 React 클린업 자동 처리
- 각 요소에 CSS 클래스 셀렉터 추가 (`.hero-badge`, `.feature-card` 등)

## 신규 의존성
- `gsap` — 애니메이션 라이브러리
- `@gsap/react` — useGSAP 훅 (React 자동 클린업)

## 검증 결과
- `npm run migrate` — 마이그레이션 성공
- `npm run build:shared` — 빌드 성공
- `npm run build -w apps/web` — Vite 빌드 성공
- `npm test` — 17개 파일, 166개 테스트 전체 통과

---

# 랜딩페이지 GSAP 스크롤 애니메이션 계획

## 설치 패키지
```bash
npm install gsap @gsap/react -w apps/web
```

## 사용 API
- `gsap.from()` / `gsap.fromTo()` — 요소 진입 애니메이션
- `ScrollTrigger` 플러그인 — 스크롤 위치 기반 트리거
- `useGSAP()` 훅 (from `@gsap/react`) — React 컴포넌트 내 자동 클린업
- `stagger` — 여러 요소에 순차 딜레이

## 적용 대상 (`LandingPage.tsx`)

### 1. Hero 섹션 (페이지 로드 시 — ScrollTrigger 없이)
| 요소 | 애니메이션 | 설정 |
|------|-----------|------|
| Badge ("새로운 방식의 링크 관리") | fade in + slide down | `from { y: -20, opacity: 0 }`, delay: 0.2 |
| Title 1행 ("나의 모든 링크를") | fade in + slide up | `from { y: 40, opacity: 0 }`, delay: 0.4 |
| Title 2행 ("하나의 페이지에") | fade in + slide up | `from { y: 40, opacity: 0 }`, delay: 0.6 |
| Subtitle | fade in + slide up | `from { y: 30, opacity: 0 }`, delay: 0.8 |
| CTA 버튼 그룹 | fade in + slide up | `from { y: 20, opacity: 0 }`, delay: 1.0 |

- ease: `power3.out`
- duration: 0.8~1s

### 2. Features 섹션 (스크롤 시)
| 요소 | 애니메이션 | 설정 |
|------|-----------|------|
| 섹션 제목 ("필요한 모든 기능") | fade in + slide up | ScrollTrigger `start: "top 80%"` |
| 섹션 서브 텍스트 | fade in + slide up | delay: 0.2 |
| 6개 피처 카드 | stagger fade in + slide up | `stagger: 0.1`, `from { y: 60, opacity: 0 }` |

- ease: `power2.out`
- duration: 0.7s

### 3. Theme Preview 섹션 (스크롤 시)
| 요소 | 애니메이션 | 설정 |
|------|-----------|------|
| 섹션 제목 ("테마 미리보기") | fade in + slide up | ScrollTrigger `start: "top 80%"` |
| 섹션 서브 텍스트 | fade in + slide up | delay: 0.2 |
| 캐러셀 컴포넌트 | fade in + scale up | `from { opacity: 0, scale: 0.95 }`, delay: 0.3 |

- ease: `power2.out`

### 4. Final CTA 섹션 (스크롤 시)
| 요소 | 애니메이션 | 설정 |
|------|-----------|------|
| 제목 ("지금 바로 시작하세요") | fade in + slide up | ScrollTrigger `start: "top 85%"` |
| 서브 텍스트 | fade in | delay: 0.2 |
| CTA 버튼 | fade in + slide up | delay: 0.4 |

- ease: `power2.out`

## 구현 방식
```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero: 페이지 로드 시 timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero-badge', { y: -20, opacity: 0, duration: 0.8 })
      .from('.hero-title-1', { y: 40, opacity: 0, duration: 0.9 }, '-=0.4')
      .from('.hero-title-2', { y: 40, opacity: 0, duration: 0.9 }, '-=0.5')
      .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4');

    // Features: 스크롤 트리거
    gsap.from('.features-header', {
      scrollTrigger: { trigger: '.features-section', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
    });
    gsap.from('.feature-card', {
      scrollTrigger: { trigger: '.features-section', start: 'top 75%' },
      y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
    });

    // 나머지 섹션도 동일 패턴...
  }, { scope: containerRef });
}
```

## 주의 사항
- `useGSAP` 훅이 자동으로 언마운트 시 클린업 처리
- `scope: containerRef`로 셀렉터 범위를 컴포넌트 내부로 제한
- 초기 상태에서 `opacity: 0`인 요소는 `gsap.from()`으로 처리 (CSS에 별도 설정 불필요)
- ScrollTrigger의 `once: true` 옵션으로 애니메이션 1회만 실행
