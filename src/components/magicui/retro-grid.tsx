'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RetroGridProps {
  className?: string;
  containerClassName?: string;
  angle?: number;
  speed?: 'slow' | 'normal' | 'fast';
}

export function RetroGrid({ 
  className,
  containerClassName,
  angle = 45,
  speed = 'normal'
}: RetroGridProps) {
  const duration = {
    slow: 0.8,
    normal: 0.5,
    fast: 0.3
  }[speed];

  return (
    <div className={cn('absolute inset-0 -z-10 overflow-hidden', containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration }}
        style={{
          transform: `rotate(${angle}deg)`,
        }}
        className={cn(
          'absolute -inset-[100%] grid grid-cols-6 gap-px opacity-50 [background-size:100px_100px]',
          className
        )}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="col-span-1 h-full w-full border-b border-r border-white/5 backdrop-blur-[1px]"
          />
        ))}
      </motion.div>
    </div>
  );
}