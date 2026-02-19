import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Check, Upload, Trash2 } from 'lucide-react';
import Button from '../../components/atoms/Button';
import Spinner from '../../components/atoms/Spinner';
import ColorPicker from '../../components/molecules/ColorPicker';
import MobilePreview from '../../components/organisms/MobilePreview';
import { useProfileStore } from '../../stores/profileStore';
import { useLinkStore } from '../../stores/linkStore';
import { THEME_PRESETS, getThemePreset, getBackgroundStyle } from '../../lib/themes';
import type { ThemeOverrides } from '@linkpage/shared';

const FONTS = [
  { value: 'Pretendard', label: 'Pretendard (기본)' },
  { value: 'IBM Plex Sans KR', label: 'IBM Plex Sans' },
  { value: 'Noto Sans KR', label: 'Noto Sans KR' },
];

export default function AppearancePage() {
  const { currentProfile, currentProfileId, loading: profileLoading, fetchProfiles, updateProfile, uploadBackgroundImage, removeBackgroundImage } = useProfileStore();
  const { links, fetchLinks } = useLinkStore();

  const [presetId, setPresetId] = useState('clean-white');
  const [overrides, setOverrides] = useState<ThemeOverrides>({});
  const [saving, setSaving] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const bgFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (currentProfileId) {
      fetchLinks(currentProfileId);
    }
  }, [currentProfileId]);

  useEffect(() => {
    if (currentProfile) {
      setPresetId(currentProfile.theme_preset || 'clean-white');
      setOverrides(currentProfile.theme_overrides || {});
    }
  }, [currentProfile]);

  const handlePresetSelect = (id: string) => {
    setPresetId(id);
    setOverrides({});
    setShowCustom(false);
  };

  const handleOverrideChange = (key: keyof ThemeOverrides, value: string) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProfileId) return;
    setBgUploading(true);
    try {
      await uploadBackgroundImage(currentProfileId, file);
      toast.success('배경 이미지가 업로드되었습니다');
    } catch {
      toast.error('업로드에 실패했습니다');
    } finally {
      setBgUploading(false);
      if (bgFileRef.current) bgFileRef.current.value = '';
    }
  };

  const handleBgRemove = async () => {
    if (!currentProfileId) return;
    setBgUploading(true);
    try {
      await removeBackgroundImage(currentProfileId);
      toast.success('배경 이미지가 삭제되었습니다');
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setBgUploading(false);
    }
  };

  const handleSave = async () => {
    if (!currentProfileId) return;
    setSaving(true);
    try {
      await updateProfile(currentProfileId, {
        theme_preset: presetId,
        theme_overrides: Object.keys(overrides).length ? overrides : null,
      } as any);
      toast.success('테마가 저장되었습니다');
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left: Settings */}
      <div className="flex-1 space-y-6">
        {/* Theme Presets */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">테마 프리셋</h3>
          <div className="grid grid-cols-4 gap-3">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] ${
                  presetId === preset.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="absolute inset-0" style={getBackgroundStyle(preset.id)} />
                <div className="relative h-full flex flex-col items-center justify-center p-2">
                  <div className="w-5 h-5 rounded-full mb-1" style={{ backgroundColor: preset.textColor, opacity: 0.3 }} />
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full h-2 rounded-sm mt-1"
                      style={{
                        backgroundColor: preset.btnStyle === 'filled' ? preset.btnBgColor : 'transparent',
                        border: preset.btnStyle === 'outlined' ? `1px solid ${preset.btnTextColor}` : 'none',
                        borderRadius: preset.btnRadius === 'full' ? '9999px' : preset.btnRadius === 'none' ? '0' : '3px',
                      }}
                    />
                  ))}
                </div>
                {presetId === preset.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <span
                  className="absolute bottom-1 inset-x-0 text-center text-[9px] font-medium"
                  style={{ color: getThemePreset(preset.id)?.textColor }}
                >
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Background Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">배경 이미지</h3>
          <input
            ref={bgFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBgUpload}
          />
          {currentProfile?.background_image_url ? (
            <div className="space-y-3">
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={currentProfile.background_image_url}
                  alt="배경 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => bgFileRef.current?.click()}
                  disabled={bgUploading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  변경
                </button>
                <button
                  onClick={handleBgRemove}
                  disabled={bgUploading}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => bgFileRef.current?.click()}
              disabled={bgUploading}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs font-medium">이미지 업로드</span>
            </button>
          )}
        </div>

        {/* Custom Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-900"
          >
            커스텀 스타일
            <span className="text-xs text-gray-400">{showCustom ? '접기' : '펼치기'}</span>
          </button>

          {showCustom && (
            <div className="mt-4 space-y-4">
              <ColorPicker
                label="배경색"
                value={overrides.bgColor || getThemePreset(presetId)?.bgColor || '#FFFFFF'}
                onChange={(v) => handleOverrideChange('bgColor', v)}
              />
              <ColorPicker
                label="텍스트 색"
                value={overrides.textColor || getThemePreset(presetId)?.textColor || '#1A1A2E'}
                onChange={(v) => handleOverrideChange('textColor', v)}
              />
              <ColorPicker
                label="버튼 배경색"
                value={overrides.btnBgColor || getThemePreset(presetId)?.btnBgColor || '#1A1A2E'}
                onChange={(v) => handleOverrideChange('btnBgColor', v)}
              />
              <ColorPicker
                label="버튼 텍스트 색"
                value={overrides.btnTextColor || getThemePreset(presetId)?.btnTextColor || '#FFFFFF'}
                onChange={(v) => handleOverrideChange('btnTextColor', v)}
              />

              {/* Button Style */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">버튼 스타일</label>
                <div className="flex gap-2">
                  {(['filled', 'outlined'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleOverrideChange('btnStyle', style)}
                      className={`px-3 py-1.5 text-xs rounded-lg border ${
                        (overrides.btnStyle || getThemePreset(presetId)?.btnStyle) === style
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {style === 'filled' ? '채움' : '아웃라인'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Radius */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">버튼 라운드</label>
                <div className="flex gap-2">
                  {([
                    { value: 'none', label: '없음' },
                    { value: 'sm', label: '약간' },
                    { value: 'md', label: '보통' },
                    { value: 'full', label: '최대' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleOverrideChange('btnRadius', value)}
                      className={`px-3 py-1.5 text-xs rounded-lg border ${
                        (overrides.btnRadius || getThemePreset(presetId)?.btnRadius) === value
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">폰트</label>
                <select
                  value={overrides.font || 'Pretendard'}
                  onChange={(e) => handleOverrideChange('font', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSave} loading={saving} fullWidth>
          테마 저장
        </Button>
      </div>

      {/* Right: Preview */}
      <div className="lg:w-[340px] shrink-0">
        <div className="sticky top-20">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">미리보기</h3>
          <MobilePreview
            profile={currentProfile}
            links={links}
            presetId={presetId}
            overrides={Object.keys(overrides).length ? overrides : null}
          />
        </div>
      </div>
    </div>
  );
}
