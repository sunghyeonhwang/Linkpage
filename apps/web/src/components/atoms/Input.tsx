import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'placeholder:text-gray-400',
        error
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
export default Input;
