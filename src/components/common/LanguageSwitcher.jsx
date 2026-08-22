import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang, currentLanguageObj, LANGUAGES } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-700/80 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
        title="Change Language"
      >
        <span className="text-sm leading-none">{currentLanguageObj.flag}</span>
        <span className="uppercase font-mono text-[11px]">{currentLanguageObj.code}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-zinc-200 dark:border-slate-800 shadow-xl z-50 animate-fade-in font-sans">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                lang === l.code
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </div>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-purple-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
