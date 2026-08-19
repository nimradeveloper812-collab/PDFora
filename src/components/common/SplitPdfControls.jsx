import React from 'react';
import { Layers, Scissors, Plus, Trash2, CheckSquare, Square, Info, Sparkles } from 'lucide-react';

export default function SplitPdfControls({ totalPages = 1, config, onChange }) {
  const mode = config.mode || 'range'; // 'range' | 'extract'
  const rangeType = config.rangeType || 'custom'; // 'custom' | 'fixed'
  const ranges = config.ranges || [{ from: 1, to: totalPages || 1 }];
  const fixedPages = config.fixedPages || 1;
  const merge = Boolean(config.merge);
  const extractMode = config.extractMode || 'all'; // 'all' | 'select'
  const extractPages = config.extractPages || '';

  // Helpers
  const update = (patch) => onChange({ ...config, ...patch });

  const handleRangeChange = (index, field, value) => {
    const next = ranges.map((r, idx) => {
      if (idx !== index) return r;
      let val = parseInt(value, 10);
      if (isNaN(val)) val = 1;
      val = Math.max(1, Math.min(val, totalPages));
      return { ...r, [field]: val };
    });
    update({ ranges: next });
  };

  const addRange = () => {
    const last = ranges[ranges.length - 1] || { from: 1, to: totalPages };
    let nextFrom = Math.min(last.to + 1, totalPages);
    let nextTo = totalPages;
    if (nextFrom > totalPages) {
      nextFrom = 1;
      nextTo = totalPages;
    }
    update({ ranges: [...ranges, { from: nextFrom, to: nextTo }] });
  };

  const removeRange = (index) => {
    if (ranges.length <= 1) return;
    update({ ranges: ranges.filter((_, i) => i !== index) });
  };

  const applyPreset = (preset) => {
    if (preset === 'all') {
      update({ extractPages: `1-${totalPages}` });
    } else if (preset === 'odd') {
      const odd = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      update({ extractPages: odd.join(', ') });
    } else if (preset === 'even') {
      const even = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 0);
      update({ extractPages: even.join(', ') });
    }
  };

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl space-y-5"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #BFDBFE',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.06)',
      }}
    >
      {/* ── Top Main Mode Tabs ──────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-blue-100">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
          <Scissors className="w-4 h-4" />
          <span>Split Options</span>
        </div>
        {totalPages > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span>Total Pages:</span>
            <strong>{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
        <button
          type="button"
          onClick={() => update({ mode: 'range' })}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            mode === 'range'
              ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Split by range</span>
        </button>

        <button
          type="button"
          onClick={() => update({ mode: 'extract' })}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            mode === 'extract'
              ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Extract pages</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PANEL 1: SPLIT BY RANGE
          ════════════════════════════════════════════════════════════════ */}
      {mode === 'range' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-modes: Custom vs Fixed */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rangeType"
                value="custom"
                checked={rangeType === 'custom'}
                onChange={() => update({ rangeType: 'custom' })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Custom ranges</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rangeType"
                value="fixed"
                checked={rangeType === 'fixed'}
                onChange={() => update({ rangeType: 'fixed' })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Fixed ranges</span>
            </label>
          </div>

          {/* Custom Ranges Card List */}
          {rangeType === 'custom' && (
            <div className="space-y-3">
              <div className="space-y-2.5">
                {ranges.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80"
                  >
                    <span className="text-xs font-bold text-blue-800 whitespace-nowrap">
                      Range {idx + 1}
                    </span>

                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700">
                      <span>from</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={r.from}
                        onChange={(e) => handleRangeChange(idx, 'from', e.target.value)}
                        className="w-20 sm:w-24 px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={r.to}
                        onChange={(e) => handleRangeChange(idx, 'to', e.target.value)}
                        className="w-20 sm:w-24 px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    {ranges.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeRange(idx)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove range"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-7" />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRange}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Range</span>
              </button>

              {/* Merge all ranges checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer transition-colors hover:bg-blue-50/40">
                <input
                  type="checkbox"
                  checked={merge}
                  onChange={(e) => update({ merge: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    Merge all ranges in one PDF file
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {merge
                      ? 'All defined ranges will be joined together into a single downloadable PDF.'
                      : 'Each defined range will be saved as its own PDF (bundled in a ZIP).'}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Fixed Ranges Input */}
          {rangeType === 'fixed' && (
            <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Split into files of:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={fixedPages}
                    onChange={(e) => update({ fixedPages: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="w-20 sm:w-24 px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-600">pages each</span>
                </div>
              </div>

              <p className="text-[11px] text-blue-700 bg-blue-100/60 p-2.5 rounded-lg">
                💡 This document ({totalPages} pages) will be split into{' '}
                <strong>{Math.ceil(totalPages / (fixedPages || 1))}</strong> separate PDF files (packaged in a ZIP).
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          PANEL 2: EXTRACT PAGES
          ════════════════════════════════════════════════════════════════ */}
      {mode === 'extract' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-modes: All vs Select */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update({ extractMode: 'all' })}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                extractMode === 'all'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Extract all pages
            </button>

            <button
              type="button"
              onClick={() => update({ extractMode: 'select' })}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                extractMode === 'select'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Select pages
            </button>
          </div>

          {extractMode === 'all' && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Extract All Pages as Individual Files</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every page in this document ({totalPages} pages total) will be converted into its own separate single-page PDF file and packaged into a ZIP archive.
              </p>
            </div>
          )}

          {extractMode === 'select' && (
            <div className="space-y-3">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-700">
                  Pages to extract (e.g. 1, 3, 5-8)
                </label>
                <input
                  type="text"
                  value={extractPages}
                  placeholder={`e.g. 1, 3, 5-${totalPages}`}
                  onChange={(e) => update({ extractPages: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-blue-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors"
                >
                  All Pages
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('odd')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Odd (1, 3, 5...)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('even')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Even (2, 4, 6...)
                </button>
              </div>

              {/* Merge extracted pages checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer transition-colors hover:bg-blue-50/40">
                <input
                  type="checkbox"
                  checked={merge}
                  onChange={(e) => update({ merge: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    Merge extracted pages into one PDF file
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {merge
                      ? 'Selected pages will be joined together into a single continuous PDF.'
                      : 'Each selected page will be downloaded as an individual single-page PDF (in a ZIP).'}
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
