import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'font-bold border-3 border-neo-primary shadow-neo transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo';
    
    const variants = {
      default: 'bg-neo-secondary text-neo-primary hover:bg-neo-gray',
      destructive: 'bg-neo-red text-neo-secondary hover:bg-red-600',
      success: 'bg-neo-green text-neo-primary hover:bg-green-400',
      warning: 'bg-neo-yellow text-neo-primary hover:bg-yellow-300',
      blue: 'bg-neo-blue text-neo-secondary hover:bg-blue-600',
      purple: 'bg-neo-purple text-neo-secondary hover:bg-purple-600',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 
