import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Link2,
  BarChart3,
  Share2,
  Smartphone,
  Zap,
  Sparkles,
  GripVertical,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import LandingThemeCarousel from '../../components/organisms/LandingThemeCarousel';
import { useLandingTheme } from '../../hooks/useLandingTheme';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Link2,
    title: '무제한 링크',
    desc: '포트폴리오, SNS, 블로그 등 원하는 링크를 곳곳에 관리하세요.',
    gradient: 'linear-gradient(135deg, #2B7FFF 0%, #00B8DB 100%)',
  },
  {
    icon: BarChart3,
    title: '실시간 분석',
    desc: '각각의 링크를 누가 언제 방문했는지 실시간으로 분석하세요.',
    gradient: 'linear-gradient(135deg, #AD46FF 0%, #F6339A 100%)',
  },
  {
    icon: Smartphone,
    title: '모바일 최적화',
    desc: '어떤 디바이스에서도 완벽하게 보이는 반응형 디자인.',
    gradient: 'linear-gradient(135deg, #FF6900 0%, #FB2C36 100%)',
  },
  {
    icon: GripVertical,
    title: '통계 관리',
    desc: '드래그 앤 드롭으로 링크 순서를 자유롭게 변경하세요.',
    gradient: 'linear-gradient(135deg, #00C950 0%, #00BC7D 100%)',
  },
  {
    icon: Share2,
    title: '쉬운 공유',
    desc: '간단한 URL로 누구에게나 링크를 공유할 수 있습니다.',
    gradient: 'linear-gradient(135deg, #615FFF 0%, #2B7FFF 100%)',
  },
  {
    icon: Zap,
    title: '빠른 설정',
    desc: '회원가입 후 3분만에 나만의 링크페이지 생성.',
    gradient: 'linear-gradient(135deg, #F0B100 0%, #FF6900 100%)',
  },
];

function GradientLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'size-8' : 'size-8';
  const textSize = size === 'sm' ? 'text-xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${iconSize} rounded-[10px] flex items-center justify-center`}
        style={{ background: 'linear-gradient(135deg, #155DFC 0%, #9810FA 100%)' }}
      >
        <Link2 size={size === 'sm' ? 20 : 20} className="text-white" />
      </div>
      <span
        className={`${textSize} font-bold bg-clip-text text-transparent`}
        style={{
          backgroundImage: 'linear-gradient(90deg, #155DFC 0%, #9810FA 100%)',
        }}
      >
        LinkPage
      </span>
    </div>
  );
}

const THEME_ICON = { light: Sun, dark: Moon, system: Monitor } as const;

export default function LandingPage() {
  const { mode, toggle } = useLandingTheme();
  const ThemeIcon = THEME_ICON[mode];
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero: 페이지 로드 시 순차 등장
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero-badge', { y: -20, opacity: 0, duration: 0.8 })
      .from('.hero-title-1', { y: 40, opacity: 0, duration: 0.9 }, '-=0.4')
      .from('.hero-title-2', { y: 40, opacity: 0, duration: 0.9 }, '-=0.5')
      .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4');

    // Features: 스크롤 시 등장
    gsap.from('.features-title', {
      scrollTrigger: { trigger: '.features-section', start: 'top 80%', once: true },
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
    });
    gsap.from('.features-subtitle', {
      scrollTrigger: { trigger: '.features-section', start: 'top 80%', once: true },
      y: 30, opacity: 0, duration: 0.7, delay: 0.15, ease: 'power2.out',
    });
    gsap.from('.feature-card', {
      scrollTrigger: { trigger: '.features-grid', start: 'top 85%', once: true },
      y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
    });

    // Theme Preview: 스크롤 시 등장
    gsap.from('.themes-title', {
      scrollTrigger: { trigger: '.themes-section', start: 'top 80%', once: true },
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
    });
    gsap.from('.themes-subtitle', {
      scrollTrigger: { trigger: '.themes-section', start: 'top 80%', once: true },
      y: 30, opacity: 0, duration: 0.7, delay: 0.15, ease: 'power2.out',
    });
    gsap.from('.themes-carousel', {
      scrollTrigger: { trigger: '.themes-section', start: 'top 75%', once: true },
      opacity: 0, scale: 0.95, duration: 0.8, delay: 0.25, ease: 'power2.out',
    });

    // Final CTA: 스크롤 시 등장
    gsap.from('.cta-title', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 85%', once: true },
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
    });
    gsap.from('.cta-subtitle', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 85%', once: true },
      y: 20, opacity: 0, duration: 0.7, delay: 0.2, ease: 'power2.out',
    });
    gsap.from('.cta-button', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 85%', once: true },
      y: 20, opacity: 0, duration: 0.7, delay: 0.35, ease: 'power2.out',
    });

    // Footer
    gsap.from('.footer-content', {
      scrollTrigger: { trigger: '.footer-content', start: 'top 95%', once: true },
      opacity: 0, duration: 0.6, ease: 'power2.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Hero + Header */}
      <section className="relative overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          src="https://unrealsummit16.cafe24.com/2026/speaker/simless_link_page_loop.mp4"
        />
        {/* Dark + blur overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1280px] mx-auto px-6 h-[68px] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div
                className="size-8 rounded-[10px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #155DFC 0%, #9810FA 100%)' }}
              >
                <Link2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">LinkPage</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={`테마: ${mode}`}
              >
                <ThemeIcon size={18} />
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="btn-gradient px-4 py-2 text-sm font-medium text-white rounded-lg shadow-[0_10px_15px_rgba(43,127,255,0.3)]"
                style={{
                  background: 'linear-gradient(90deg, #155DFC 0%, #9810FA 100%)',
                }}
              >
                시작하기
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative max-w-[1024px] mx-auto px-6 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
            <Sparkles size={16} className="text-blue-300" />
            <span className="text-sm font-medium text-white">
              새로운 방식의 링크 관리
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight tracking-tight">
            <span className="hero-title-1 block text-white">나의 모든 링크를</span>
            <span
              className="hero-title-2 block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #155DFC 0%, #9810FA 50%, #E60076 100%)',
              }}
            >
              하나의 페이지에
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mt-8 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            포트폴리오, SNS, 블로그, 유튜브 — 흩어진 링크를 깔끔하게
            나타낼 수 있는 공간을 만들어보세요.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta mt-12 flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="btn-gradient px-8 py-3 text-lg font-medium text-white rounded-lg shadow-[0_25px_50px_rgba(43,127,255,0.3)]"
              style={{
                background: 'linear-gradient(90deg, #155DFC 0%, #9810FA 100%)',
              }}
            >
              무료로 시작하기
            </Link>
            <a
              href="#themes"
              className="btn-outline px-8 py-3 text-lg font-medium text-white rounded-lg bg-white/10 border-2 border-white/20 backdrop-blur-sm"
            >
              데모 미리보기
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section bg-white dark:bg-[#0A0A0A] py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="features-title text-4xl sm:text-5xl font-bold text-[#0A0A0A] dark:text-white text-center mb-4 tracking-tight">
            필요한 모든 기능
          </h2>
          <p className="features-subtitle text-xl text-[#4A5565] dark:text-gray-400 text-center mb-16 max-w-xl mx-auto">
            복잡한 설정 없이 바로 사용할 수 있는 직관적인 링크 관리 도구
          </p>
          <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="feature-card bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6"
                  style={{ background: f.gradient }}
                >
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white mb-3">{f.title}</h3>
                <p className="text-base text-[#4A5565] dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Preview */}
      <section id="themes" className="themes-section py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="themes-title text-4xl sm:text-5xl font-bold text-[#0A0A0A] dark:text-white text-center mb-4 tracking-tight">
            테마 미리보기
          </h2>
          <p className="themes-subtitle text-xl text-[#4A5565] dark:text-gray-400 text-center mb-16 max-w-xl mx-auto">
            취향에 맞는 테마를 선택하고 스타일을 꾸며보세요
          </p>
          <div className="themes-carousel">
            <LandingThemeCarousel />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="cta-section relative py-24 overflow-hidden"
        style={{
          background:
            'linear-gradient(165deg, #155DFC 0%, #9810FA 50%, #E60076 100%)',
        }}
      >
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="cta-title text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="cta-subtitle text-xl text-white/90 mb-12">
            무료로 나만의 링크 페이지를 만들어보세요. 1분이면 충분합니다.
          </p>
          <Link
            to="/signup"
            className="cta-button btn-white inline-block px-8 py-3 text-lg font-medium text-[#155DFC] bg-white rounded-lg shadow-[0_25px_50px_rgba(0,0,0,0.25)]"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10">
        <div className="footer-content max-w-[1280px] mx-auto px-6 flex flex-col items-center gap-4">
          <GradientLogo />
          <p className="text-sm text-[#99A1AF]">
            &copy; {new Date().getFullYear()} LinkPage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
