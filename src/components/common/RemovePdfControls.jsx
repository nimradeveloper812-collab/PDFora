import React from 'react';
import { Trash2, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';

function getPagesToRemoveSet(str) {
  if (!str || !str.trim()) return new Set();
  const set = new Set();
  const parts = str.split(',');
  for (const p of parts) {
    const trimmed = p.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          set.add(i);
        }
      }
    } else {
      const val = parseInt(trimmed, 10);
      if (!isNaN(val)) set.add(val);
    }
  }
  return set;
}

export default function RemovePdfControls({ totalPages = 1, value = '', onChange }) {
  const removeSet = getPagesToRemoveSet(value);

  const togglePageNumber = (pageNum) => {
    const newSet = new Set(removeSet);
    if (newSet.has(pageNum)) {
      newSet.delete(pageNum);
    } else {
      newSet.add(pageNum);
    }
    const sorted = Array.from(newSet).sort((a, b) => a - b);
    onChange(sorted.join(', '));
  };

  const applyPreset = (preset) => {
    if (preset === 'first') {
      onChange('1');
    } else if (preset === 'last') {
      onChange(`${totalPages}`);
    } else if (preset === 'odd') {
      const odd = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      onChange(odd.join(', '));
    } else if (preset === 'even') {
      const even = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 0);
      onChange(even.join(', '));
    } else if (preset === 'clear') {
      onChange('');
    }
  };

  const remainingCount = Math.max(0, totalPages - removeSet.size);

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl space-y-5"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* ── Header Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Trash2 className="w-4 h-4 text-slate-500" />
          <span>Page Removal Options</span>
        </div>
        {totalPages > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Document Pages:</span>
            <strong className="text-blue-950">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* ── Input Box & Presets ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700">
            Pages to Remove (e.g. 1, 3, 5-7)
          </label>
          <input
            type="text"
            value={value}
            placeholder={`e.g. 1, 3, 5-${totalPages}`}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap text-left">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('first')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
          >
            First Page (1)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('last')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Last Page ({totalPages})
          </button>
          <button
            type="button"
            onClick={() => applyPreset('odd')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Odd Pages (1, 3...)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('even')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Even Pages (2, 4...)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('clear')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* ── Page Number Side Cards / Badges Selector ─────────────── */}
      {totalPages > 0 && (
        <div className="space-y-2 text-left pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Page Number Selector ({removeSet.size} of {totalPages} pages marked to remove):
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Click page cards to toggle deletion</span>
          </div>

          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-56 overflow-y-auto">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isRemoved = removeSet.has(pageNum);
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => togglePageNumber(pageNum)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer relative ${
                    isRemoved
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Page</span>
                  <span className="text-sm font-black">{pageNum}</span>
                  {isRemoved ? (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xs">
                      <Trash2 className="w-2.5 h-2.5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[8px] font-extrabold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Real-Time Status Summary ─────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-left text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-900">
            {removeSet.size === 0 ? (
              'No pages selected for deletion.'
            ) : removeSet.size >= totalPages ? (
              <span className="text-slate-800 font-bold">⚠️ Warning: All pages are marked for removal.</span>
            ) : (
              <>
                Removing <strong>{removeSet.size}</strong> page{removeSet.size > 1 ? 's' : ''} — <strong>{remainingCount}</strong> page{remainingCount > 1 ? 's' : ''} will remain in your output PDF.
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
