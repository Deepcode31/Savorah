import React from 'react';

interface SavorahLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const SavorahLogo: React.FC<SavorahLogoProps> = ({
  className = 'w-8 h-8',
  size,
  showText = false,
}) => {
  return (
    <div className="inline-flex items-center gap-2.5 shrink-0">
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        {/* Dark Forest Green Top Half (#12542a) */}
        <path
          d="M 365 72 
             L 215 72 
             C 140 72 90 118 90 195 
             C 90 235 118 265 165 285 
             L 280 332 
             V 212 
             L 195 178 
             C 178 170 170 160 170 148 
             C 170 132 185 120 215 120 
             L 305 120 
             Z"
          fill="#12542a"
        />

        {/* Bright Lime Green Bottom Half (#78be12) */}
        <path
          d="M 280 212 
             V 332 
             L 298 339 
             C 335 354 390 354 390 410 
             C 390 452 355 478 285 478 
             L 80 478 
             L 138 398 
             L 285 398 
             C 305 398 318 388 318 376 
             C 318 360 300 350 270 338 
             L 280 212 
             Z"
          fill="#78be12"
        />
      </svg>
      {showText && (
        <span className="font-extrabold text-slate-900 tracking-tight text-lg uppercase">
          SAVORAH
        </span>
      )}
    </div>
  );
};
