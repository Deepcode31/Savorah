import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  minFontSize?: number;
  /** Keep brand casing; set true only when you want all-caps. */
  uppercase?: boolean;
  /** Soft shimmer across glyphs (pairs with pressure). */
  shine?: boolean;
  shineColor?: string;
  shineSpeed?: number;
}

const NORMAL_VARIATION = `'wght' 700, 'wdth' 100, 'ital' 0`;

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Variable-font pressure effect (ported from
 * https://codepen.io/JuanFuentes/full/rgXKGQ).
 * Starts as normal type; morphs only while the cursor is over the word.
 */
const TextPressure: React.FC<TextPressureProps> = ({
  text = 'Compressa',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  className = '',
  minFontSize = 24,
  uppercase = false,
  shine = false,
  shineColor = '#ffffff',
  shineSpeed = 3.2,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef(false);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);
  const [active, setActive] = useState(false);

  const chars = text.split('');

  const resetSpans = useCallback(() => {
    spansRef.current.forEach((span) => {
      if (!span) return;
      span.style.fontVariationSettings = NORMAL_VARIATION;
      if (alpha) span.style.opacity = '1';
    });
  }, [alpha]);

  const activate = useCallback(
    (x: number, y: number) => {
      cursorRef.current.x = x;
      cursorRef.current.y = y;
      // Snap mouse toward cursor so the first frame feels responsive.
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
      }
    },
    []
  );

  const deactivate = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setActive(false);
    resetSpans();
  }, [resetSpans]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const onEnter = (e: MouseEvent) => activate(e.clientX, e.clientY);
    const onLeave = () => deactivate();
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) activate(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };
    const onTouchEnd = () => deactivate();

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    // Resting state: normal weight/width.
    resetSpans();

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [activate, deactivate, resetSpans]);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      if (activeRef.current && titleRef.current) {
        mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
        mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 700;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0';
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(
    () => (
      <style>{`
        @import url('${fontUrl}');
        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
        .text-pressure-shine span {
          background-image: linear-gradient(
            105deg,
            ${textColor} 0%,
            ${textColor} 38%,
            ${shineColor} 50%,
            ${textColor} 62%,
            ${textColor} 100%
          );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .text-pressure-shine.is-active span {
          animation: text-pressure-shimmer ${shineSpeed}s ease-in-out infinite alternate;
        }
        @keyframes text-pressure-shimmer {
          0% { background-position: 140% center; }
          100% { background-position: -40% center; }
        }
      `}</style>
    ),
    [fontUrl, textColor, strokeColor, strokeWidth, shineColor, shineSpeed]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-transparent cursor-default"
    >
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${className} ${flex ? 'flex justify-between' : ''} ${
          stroke ? 'stroke' : ''
        } ${shine ? 'text-pressure-shine' : ''} ${active ? 'is-active' : ''} ${
          uppercase ? 'uppercase' : ''
        } text-center`}
        style={{
          fontFamily,
          fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          fontWeight: 700,
          fontVariationSettings: NORMAL_VARIATION,
          color: stroke || shine ? undefined : textColor,
        }}
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            ref={(el) => {
              spansRef.current[i] = el;
              if (el && !activeRef.current) {
                el.style.fontVariationSettings = NORMAL_VARIATION;
              }
            }}
            data-char={char}
            className="inline-block"
            style={{ fontVariationSettings: NORMAL_VARIATION }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
