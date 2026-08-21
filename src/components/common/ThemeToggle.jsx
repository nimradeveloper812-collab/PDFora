import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pdfora-theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('pdfora-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pdfora-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 shadow-xs'
          : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 shadow-xs'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 transition-transform duration-300 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-4.5 h-4.5 transition-transform duration-300 hover:-rotate-12 text-zinc-700" />
      )}
    </button>
  );
}
