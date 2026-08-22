import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { TOOLS, getToolTheme } from '../../data/toolsData';

export default function QuickSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter(t => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.shortDesc?.toLowerCase().includes(q) ||
      (t.primaryKeywords || []).some(k => k.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  const handleSelectTool = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-20 px-3 sm:px-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#141622] rounded-3xl border border-zinc-200 dark:border-[#2A2E45] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-[#2A2E45] gap-3">
          <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search 48+ tools (e.g. compress, merge, watermark, resume)..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-3 space-y-1">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No tools matching "{query}" found.
            </div>
          ) : (
            filteredTools.map(t => {
              const theme = getToolTheme(t.id, t.category);
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTool(t.path)}
                  className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-purple-50/70 dark:hover:bg-[#1B1E2E] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${theme.iconBg}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {t.name}
                        </span>
                        {t.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                            {t.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-sm font-normal">
                        {t.shortDesc || t.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#0D0D14] border-t border-zinc-200 dark:border-[#2A2E45] flex items-center justify-between text-[11px] text-zinc-400 font-sans">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            48 Online Tools • 100% In-Browser Privacy
          </span>
          <span className="font-mono">Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-[#2A2E45] text-zinc-700 dark:text-zinc-300">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
