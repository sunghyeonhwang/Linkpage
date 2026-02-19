import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, ExternalLink, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Avatar from '../../components/atoms/Avatar';
import FormField from '../../components/molecules/FormField';
import Spinner from '../../components/atoms/Spinner';
import { useProfileStore } from '../../stores/profileStore';
import type { SocialLink } from '@linkpage/shared';

const SOCIAL_TYPES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'kakao', label: 'KakaoTalk' },
];

export default function DashboardPage() {
  const {
    profiles, currentProfile, currentProfileId, loading: storeLoading,
    fetchProfiles, setCurrentProfile, updateProfile, updateSlug, uploadAvatar,
    createProfile, deleteProfile,
  } = useProfileStore();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [slugSaving, setSlugSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (currentProfile) {
      setDisplayName(currentProfile.display_name || '');
      setBio(currentProfile.bio || '');
      setSlug(currentProfile.slug || '');
      setSocialLinks(currentProfile.social_links || []);
    }
  }, [currentProfile]);

  const handleSave = async () => {
    if (!currentProfileId) return;
    setSaving(true);
    try {
      await updateProfile(currentProfileId, {
        display_name: displayName,
        bio: bio || null,
        social_links: socialLinks.length ? socialLinks : null,
      } as any);
      toast.success('프로필이 저장되었습니다');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleSlugSave = async () => {
    if (!currentProfileId) return;
    setSlugSaving(true);
    try {
      await updateSlug(currentProfileId, slug);
      toast.success('슬러그가 변경되었습니다');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || '슬러그 변경에 실패했습니다');
    } finally {
      setSlugSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProfileId) return;
    try {
      await uploadAvatar(currentProfileId, file);
      toast.success('프로필 이미지가 업로드되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    }
  };

  const shareUrl = `${window.location.origin}/p/${currentProfile?.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('URL이 복사되었습니다');
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#dashboard-qr-code svg');
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
      a.download = `linkpage-qr-${currentProfile?.slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { type: 'instagram', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks(socialLinks.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  if (storeLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page selector for multi-page */}
      {profiles.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentProfile(p.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                p.id === currentProfileId
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.display_name}
            </button>
          ))}
          <button
            onClick={async () => {
              const p = await createProfile();
              setCurrentProfile(p.id);
              toast.success('새 페이지가 생성되었습니다');
            }}
            className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 inline mr-1" />새 페이지
          </button>
        </div>
      )}

      {/* Share URL */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">공유 URL</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyUrl}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />복사
            </Button>
            <a
              href={`/p/${currentProfile?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />미리보기
            </a>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">{window.location.origin}/p/</span>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1" />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSlugSave}
            loading={slugSaving}
            disabled={slug === currentProfile?.slug}
          >
            변경
          </Button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center pt-4 mt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">QR 코드</p>
          <div id="dashboard-qr-code" className="bg-white p-4 rounded-xl border border-gray-200">
            <QRCodeSVG value={shareUrl} size={160} level="M" />
          </div>
          <Button size="sm" variant="secondary" className="mt-3" onClick={handleDownloadQR}>
            <Download className="w-3.5 h-3.5 mr-1.5" />다운로드
          </Button>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">프로필</h3>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar src={currentProfile?.avatar_url} size="lg" />
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              이미지 변경
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <FormField label="이름" required>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="표시할 이름"
          />
        </FormField>

        <FormField label="소개">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="간단한 소개를 작성해주세요"
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
        </FormField>

        {/* Social Links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">소셜 링크</label>
            <button
              onClick={addSocialLink}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 추가
            </button>
          </div>
          <div className="space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={link.type}
                  onChange={(e) => updateSocialLink(i, 'type', e.target.value)}
                  className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {SOCIAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <Input
                  value={link.url}
                  onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <button onClick={() => removeSocialLink(i)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {profiles.length > 1 && (
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                if (confirm('이 페이지를 삭제하시겠습니까?')) {
                  await deleteProfile(currentProfileId!);
                  toast.success('페이지가 삭제되었습니다');
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />페이지 삭제
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={handleSave} loading={saving}>
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
