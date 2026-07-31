import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export function GlassCard({ children, hover = false, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={classNames(
        'glass p-6',
        hover && 'hover:shadow-glow hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
