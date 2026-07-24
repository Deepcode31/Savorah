import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-2xl glass hover:bg-white/8 flex items-center justify-center transition-colors overflow-hidden ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25 }}
          className="absolute"
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-300" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-indigo-500" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
