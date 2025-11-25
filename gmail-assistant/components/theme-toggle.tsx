'use client';

import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">☀️</span>
      <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
      <span className="text-sm text-muted-foreground">🌙</span>
    </div>
  );
}
