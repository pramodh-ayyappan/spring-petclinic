import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'blue' | 'green' | 'yellow' | 'pink';
}

const Card = ({ children, className, variant = 'default' }: CardProps) => {
  const variants = {
    default: 'bg-neo-secondary border-neo-primary',
    accent: 'bg-neo-accent border-neo-primary text-neo-secondary',
    blue: 'bg-neo-blue border-neo-primary text-neo-secondary',
    green: 'bg-neo-green border-neo-primary text-neo-primary',
    yellow: 'bg-neo-yellow border-neo-primary text-neo-primary',
    pink: 'bg-neo-pink border-neo-primary text-neo-secondary',
  };

  return (
    <div
      className={cn(
        'border-3 shadow-neo p-6',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-2xl font-bold', className)}>
    {children}
  </h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('space-y-4', className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mt-6 flex gap-2', className)}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter }; 
