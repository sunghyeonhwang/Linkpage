import { useState } from 'react';
import MobilePreview from './MobilePreview';
import { THEME_PRESETS } from '../../lib/themes';
import type { ProfileLink } from '@linkpage/shared';

const DEMO_PROFILE = {
  display_name: '당신의 이름',
  bio: '@username · Creator',
  avatar_url: null,
};

const DEMO_LINKS: ProfileLink[] = [
  { id: '1', label: '포트폴리오', url: '#', is_active: true },
  { id: '2', label: 'Instagram', url: '#', is_active: true },
  { id: '3', label: '블로그', url: '#', is_active: true },
  { id: '4', label: 'YouTube', url: '#', is_active: true },
] as ProfileLink[];

const THEME_EMOJI: Record<string, string> = {
  'ocean-breeze': '🌊',
  'midnight-dark': '🌙',
  'sunset-glow': '🌅',
  'forest-green': '🌲',
  'lavender-dream': '💜',
  'neon-night': '✨',
  'soft-coral': '🌸',
};

const DISPLAY_PRESETS = THEME_PRESETS.filter((p) => p.id !== 'clean-white');

export default function LandingThemeCarousel() {
  const [selectedPreset, setSelectedPreset] = useState('ocean-breeze');

  return (
    <div className="flex flex-col items-center gap-16">
      {/* Theme selector buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {DISPLAY_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all ${
                isSelected
                  ? 'text-white shadow-[0_10px_15px_rgba(0,0,0,0.1)]'
                  : 'bg-white dark:bg-[#1A1A1A] text-[#364153] dark:text-gray-300 border border-gray-200 dark:border-[#2A2A2A] hover:shadow-md'
              }`}
              style={
                isSelected
                  ? { background: 'linear-gradient(90deg, #155DFC 0%, #9810FA 100%)' }
                  : undefined
              }
            >
              {THEME_EMOJI[preset.id] || ''}{preset.name}
            </button>
          );
        })}
      </div>

      {/* Mobile preview with glow */}
      <div className="relative">
        {/* Blur glow */}
        <div
          className="absolute inset-0 rounded-[48px] blur-[64px] -z-10 scale-105"
          style={{
            background:
              'linear-gradient(117deg, rgba(43,127,255,0.2) 0%, rgba(173,70,255,0.2) 100%)',
          }}
        />
        <MobilePreview
          profile={DEMO_PROFILE}
          links={DEMO_LINKS}
          presetId={selectedPreset}
        />
      </div>
    </div>
  );
}
