import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Instagram, Youtube, Twitter, Github, Linkedin, Mail, MessageCircle,
  ExternalLink, Share2, X, Download, Copy, Check, QrCode,
} from 'lucide-react';
import Spinner from '../../components/atoms/Spinner';
import Avatar from '../../components/atoms/Avatar';
import { publicApi } from '../../services/publicApi';
import { trackView, trackClick } from '../../lib/tracking';
import { resolveTheme, getBackgroundStyle, getFrameBackgroundStyle, getContrastTextColor } from '../../lib/themes';
import type { Profile, ProfileLink, ThemeOverrides } from '@linkpage/shared';

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  kakao: MessageCircle,
};

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Omit<Profile, 'user_id'> | null>(null);
  const [links, setLinks] = useState<Omit<ProfileLink, 'profile_id'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    publicApi
      .getProfile(slug)
      .then(({ data }) => {
        if (data.data) {
          setProfile(data.data.profile);
          setLinks(data.data.links);
          trackView(data.data.profile.id);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-300 mb-3">404</h1>
          <p className="text-gray-500 mb-4">페이지를 찾을 수 없습니다</p>
          <a href="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.display_name,
          url: currentUrl,
        });
      } catch {
        // user cancelled
      }
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#share-qr-code svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.download = `linkpage-qr-${slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const rawTheme = resolveTheme(
    profile.theme_preset,
    profile.theme_overrides as ThemeOverrides | null,
  );
  // 배경 이미지가 있으면 오버레이가 어두우므로 흰색, 아니면 배경색 기반 자동 대비
  const autoTextColor = profile.background_image_url
    ? '#FFFFFF'
    : getContrastTextColor(rawTheme.bg);
  const theme = { ...rawTheme, text: autoTextColor };
  const bgStyle = getBackgroundStyle(
    profile.theme_preset,
    profile.theme_overrides as ThemeOverrides | null,
    profile.background_image_url,
  );
  const frameBgStyle = getFrameBackgroundStyle(
    profile.theme_preset,
    profile.theme_overrides as ThemeOverrides | null,
    profile.background_image_url,
  );

  // Linktree-like hard shadow style for buttons
  const getLinkStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      color: theme.btnText,
      borderRadius: theme.radius,
    };
    if (theme.btnStyle === 'outlined') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `2px solid ${theme.btnText}`,
      };
    }
    return {
      ...base,
      backgroundColor: theme.btnBg,
      boxShadow: `4px 4px 0 0 ${theme.btnText}20`,
    };
  };

  return (
    <div className="min-h-screen relative" style={frameBgStyle}>
      {profile.background_image_url && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Content column - theme bg on desktop, full-width on mobile */}
      <div
        className="relative min-h-screen max-w-mobile mx-auto"
        style={bgStyle}
      >
        {profile.background_image_url && (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}

        {/* Top bar - Share button */}
        <div className="relative z-10 px-5 pt-4 flex justify-end">
          <button
            onClick={() => setShareOpen(true)}
            className="p-2.5 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            style={{
              color: '#374151',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
            aria-label="공유"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div
          className="relative px-5 pt-4 pb-10"
          style={{ fontFamily: theme.font }}
        >
        {/* Profile */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar src={profile.avatar_url} size="xl" />
          <h1
            className="text-xl font-bold mt-4 tracking-tight"
            style={{ color: theme.text }}
          >
            {profile.display_name}
          </h1>
          {profile.bio && (
            <p
              className="text-sm mt-2 max-w-sm leading-relaxed opacity-80"
              style={{ color: theme.text }}
            >
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {profile.social_links && profile.social_links.length > 0 && (
            <div className="flex gap-3 mt-4">
              {profile.social_links.map((social, i) => {
                const Icon = SOCIAL_ICONS[social.type] || ExternalLink;
                return (
                  <a
                    key={i}
                    href={social.type === 'email' ? `mailto:${social.url}` : social.url}
                    target={social.type === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all hover:scale-110 active:scale-95"
                    style={{
                      color: theme.text,
                      backgroundColor: `${theme.text}10`,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3.5">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(link.id, profile.id)}
              className="group relative block w-full min-h-[56px] flex items-center justify-center py-4 px-6 text-center font-medium text-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
              style={getLinkStyle()}
            >
              <div>
                {link.label}
                {link.description && (
                  <span className="block text-xs opacity-60 mt-0.5 font-normal">
                    {link.description}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: theme.text }}
          >
            Made with LinkPage
          </a>
        </div>
      </div>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShareOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-sm mx-4 mb-0 sm:mb-0 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3">
              <h3 className="text-base font-bold text-gray-900">공유하기</h3>
              <button
                onClick={() => setShareOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-3">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {copied ? '복사 완료!' : '링크 복사'}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[220px]">
                    {currentUrl}
                  </p>
                </div>
              </button>

              {/* QR Code */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div id="share-qr-code" className="flex justify-center p-5 bg-white">
                  <QRCodeSVG value={currentUrl} size={160} level="M" />
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  QR 코드 저장
                </button>
              </div>

              {/* Native Share (mobile) */}
              {'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">다른 앱으로 공유</p>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
