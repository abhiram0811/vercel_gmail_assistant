'use client';

/**
 * Theme toggle components - Deprecated
 * App now uses dark-only theme, these are kept for backward compatibility
 * and will do nothing when clicked.
 */

import { Sun } from 'lucide-react';

export function ThemeToggle() {
  return (
    <button
      className="flex items-center justify-center size-9 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Theme (Dark Only)"
    >
      <Sun className="size-5 text-amber-400" />
    </button>
  );
}

export function ThemeToggleWithLabel() {
  return (
    <button
      aria-label="Theme (Dark Only)"
      className="flex items-center justify-center w-12 h-8 rounded-full bg-white/10 border border-white/20 transition-colors shadow-sm cursor-default"
    >
      <Sun className="size-[18px] text-amber-400" />
    </button>
  );
}
