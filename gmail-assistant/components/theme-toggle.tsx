'use client';

import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center size-9 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
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
      className="flex items-center justify-center w-12 h-8 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors shadow-sm"
    >
      {theme === 'dark' ? (
        <Sun className="size-[18px] text-amber-400" />
      ) : (
        <Moon className="size-[18px] text-slate-700" />
      )}
    </button>
  );
}
