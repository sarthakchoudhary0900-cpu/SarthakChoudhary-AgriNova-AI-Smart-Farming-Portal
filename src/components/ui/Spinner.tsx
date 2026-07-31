import { Loader2 } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number;
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return <Loader2 className={classNames('animate-spin text-brand-500', className)} size={size} />;
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size={40} />
      <p className="text-forest-500 dark:text-brand-200/70 font-medium">{label}</p>
    </div>
  );
}
