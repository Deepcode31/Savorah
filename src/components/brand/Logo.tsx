import React from 'react';
import { SITE } from '../../config/site';

interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  /** Show the "Savorah" wordmark next to the mark. */
  withWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

/**
 * Savorah brand lockup. Uses the real logo mark asset with a soft rounded
 * container so it sits cleanly on both light and dark surfaces.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 36,
  withWordmark = true,
  className = '',
  wordmarkClassName = '',
}) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <img
      src={SITE.mark}
      alt={`${SITE.name} logo`}
      width={size}
      height={size}
      className="rounded-xl object-contain shrink-0"
      style={{ width: size, height: size }}
    />
    {withWordmark && (
      <span className={`font-display font-bold tracking-tight ${wordmarkClassName}`}>
        {SITE.name}
      </span>
    )}
  </span>
);
