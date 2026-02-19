import Avatar from '../atoms/Avatar';
import { resolveTheme, getBackgroundStyle } from '../../lib/themes';
import type { Profile, ProfileLink, ThemeOverrides } from '@linkpage/shared';

interface MobilePreviewProps {
  profile: Partial<Profile> | null;
  links: ProfileLink[];
  presetId: string;
  overrides?: ThemeOverrides | null;
}

export default function MobilePreview({ profile, links, presetId, overrides }: MobilePreviewProps) {
  const theme = resolveTheme(presetId, overrides);
  const bgStyle = getBackgroundStyle(presetId, overrides, profile?.background_image_url);

  const getLinkStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      color: theme.btnText,
      borderRadius: theme.radius,
    };
    if (theme.btnStyle === 'outlined') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `1.5px solid ${theme.btnText}`,
      };
    }
    return {
      ...base,
      backgroundColor: theme.btnBg,
      boxShadow: `3px 3px 0 0 ${theme.btnText}20`,
    };
  };

  return (
    <div className="flex justify-center">
      {/* iPhone frame */}
      <div className="w-[280px] h-[570px] bg-black rounded-[36px] p-3 shadow-2xl">
        <div className="relative w-full h-full rounded-[28px] overflow-hidden" style={bgStyle}>
          {profile?.background_image_url && (
            <div className="absolute inset-0 bg-black/40 rounded-[28px]" />
          )}
          {/* Status bar notch */}
          <div className="relative flex justify-center pt-2 pb-1">
            <div className="w-20 h-5 bg-black rounded-full" />
          </div>

          {/* Content */}
          <div
            className="relative h-[calc(100%-28px)] overflow-y-auto px-5 py-4 scrollbar-hide"
            style={{ color: theme.text, fontFamily: theme.font }}
          >
            {/* Profile */}
            <div className="flex flex-col items-center text-center mb-5">
              <Avatar src={profile?.avatar_url} size="lg" />
              <h2 className="text-base font-bold mt-3" style={{ color: theme.text }}>
                {profile?.display_name || 'My Page'}
              </h2>
              {profile?.bio && (
                <p className="text-xs mt-1 opacity-80" style={{ color: theme.text }}>
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="space-y-2.5">
              {(links.filter(l => l.is_active).length > 0
                ? links.filter(l => l.is_active)
                : [
                    { id: '1', label: 'Link 1' },
                    { id: '2', label: 'Link 2' },
                    { id: '3', label: 'Link 3' },
                  ]
              ).map((link) => (
                <div
                  key={link.id}
                  className="w-full min-h-[36px] flex items-center justify-center py-2.5 px-4 text-center text-xs font-medium"
                  style={{
                    ...getLinkStyle(),
                    opacity: 'is_active' in link ? 1 : 0.5,
                  }}
                >
                  {link.label}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-[10px] opacity-40" style={{ color: theme.text }}>
                Made with LinkPage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
