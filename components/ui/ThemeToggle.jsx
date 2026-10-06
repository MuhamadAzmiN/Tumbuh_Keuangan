'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
        <div className="h-[18px] w-[18px]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className="h-8 w-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="h-[18px] w-[18px] stroke-[1.8]" />
      ) : (
        <Moon className="h-[18px] w-[18px] stroke-[1.8]" />
      )}
    </button>
  );
}
