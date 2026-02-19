import { cn } from '../../lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Toggle({ checked, onChange, disabled, size = 'md' }: ToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-[18px]', thumb: 'h-3.5 w-3.5', translate: 'translate-x-[14px]' },
    md: { track: 'w-10 h-[22px]', thumb: 'h-[18px] w-[18px]', translate: 'translate-x-[18px]' },
  };

  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 rounded-full transition-colors cursor-pointer',
        s.track,
        checked ? 'bg-primary-600' : 'bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-sm transform transition-transform',
          s.thumb,
          'mt-[2px] ml-[2px]',
          checked ? s.translate : 'translate-x-0',
        )}
      />
    </button>
  );
}
