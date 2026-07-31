import { type ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={classNames('glass p-10 flex flex-col items-center justify-center text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-300 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-forest-800 dark:text-brand-50">{title}</h3>
      {description && (
        <p className="mt-2 text-forest-500 dark:text-brand-200/60 max-w-md">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
