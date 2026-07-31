import { type ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SectionTitle({ title, subtitle, centered = false, className, children }: SectionTitleProps) {
  return (
    <div className={classNames('mb-10', centered && 'text-center', className)}>
      <h2 className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-forest-700 to-brand-600 dark:from-brand-300 dark:to-brand-500 bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className={classNames('mt-3 text-forest-600 dark:text-brand-200/70 text-lg', centered && 'max-w-2xl mx-auto')}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
