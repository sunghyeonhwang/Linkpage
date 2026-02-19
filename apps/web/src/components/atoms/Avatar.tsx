import { cn } from '../../lib/cn';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

const iconSizes = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 40,
};

export default function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 flex items-center justify-center',
        sizes[size],
        className,
      )}
    >
      <User size={iconSizes[size]} className="text-gray-400" />
    </div>
  );
}
