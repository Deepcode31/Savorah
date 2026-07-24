import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

/* ---------- Animated counter (₹ aware) ---------- */
export const Counter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}> = ({ value, prefix = '', suffix = '', className, duration = 1.2 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

/* ---------- Scroll reveal wrapper ---------- */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}> = ({ children, delay = 0, y = 28, className, once = true }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

/* ---------- Magnetic button ---------- */
export const Magnetic: React.FC<{
  children: React.ReactNode;
  className?: string;
  strength?: number;
}> = ({ children, className, strength = 0.3 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  const reduced = useReducedMotion();

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    },
    [strength, x, y, reduced]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ---------- 3D tilt card ---------- */
export const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  max?: number;
}> = ({ children, className, max = 8 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ---------- Staggered word headline ---------- */
export const SplitWords: React.FC<{ text: string; className?: string; delay?: number }> = ({
  text,
  className,
  delay = 0,
}) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden pb-1 align-bottom" aria-hidden>
        <motion.span
          className="inline-block"
          initial={{ y: '110%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
        {i < text.split(' ').length - 1 ? '\u00A0' : ''}
      </span>
    ))}
  </span>
);
