'use client';

import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center size-9 rounded-full text-slate-400 hover:text-white dark:hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5 text-slate-600" />
      )}
    </button>
  );
}

export function ThemeToggleWithLabel() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="flex items-center justify-center w-12 h-8 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
    >
      {theme === 'dark' ? (
        <Moon className="size-[18px] text-gray-300" />
      ) : (
        <Sun className="size-[18px] text-slate-600" />
      )}
    </button>
  );
}
