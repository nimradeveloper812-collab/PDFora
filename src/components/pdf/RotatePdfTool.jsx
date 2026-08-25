import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Download, RotateCcw, AlertCircle, FileText, Sparkles, Eye, File, Trash2, ArrowRight } from 'lucide-react';
import { pdfApi } from '../../services/pdfApi';

export default function RotatePdfTool() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading_pdf' | 'ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pages, setPages] = useState([]); // Array of { pageIndex, rotation: 0, thumbnail: null }
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [rotateMode, setRotateMode] = useState('all'); // 'all' | 'specific'
  const [specificPagesInput, setSpecificPagesInput] = useState('');

  const parsePageNumbers = (str, total) => {
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
            if (i >= 1 && i <= total) set.add(i - 1); // 0-indexed
          }
        }
      } else {
        const val = parseInt(trimmed, 10);
        if (!isNaN(val) && val >= 1 && val <= total) {
          set.add(val - 1); // 0-indexed
        }
      }
    }
    return set;
  };

  const applySpecificRotation = (delta = 90) => {
    const targetSet = parsePageNumbers(specificPagesInput, pages.length);
    if (targetSet.size === 0) return;
    setPages(prev => prev.map(p => {
      if (targetSet.has(p.pageIndex)) {
        const nextRot = (p.rotation + delta) % 360;
        return { ...p, rotation: nextRot >= 0 ? nextRot : nextRot + 360 };
      }
      return p;
    }));
  };

  const resetSpecificRotation = () => {
    const targetSet = parsePageNumbers(specificPagesInput, pages.length);
    if (targetSet.size === 0) return;
    setPages(prev => prev.map(p => {
      if (targetSet.has(p.pageIndex)) {
        return { ...p, rotation: 0 };
      }
      return p;
    }));
  };

  const applyPresetSpecificPages = (preset) => {
    const total = pages.length;
    if (preset === 'first') setSpecificPagesInput('1');
    else if (preset === 'last') setSpecificPagesInput(`${total}`);
    else if (preset === 'odd') {
      const odd = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      setSpecificPagesInput(odd.join(', '));
    } else if (preset === 'even') {
      const even = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 === 0);
      setSpecificPagesInput(even.join(', '));
    } else if (preset === 'clear') {
      setSpecificPagesInput('');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF library.'));
      document.body.appendChild(script);
    });
  };

  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    if (incomingFile.type !== 'application/pdf' && !incomingFile.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document.');
      return;
    }

    setFile(incomingFile);
    setStatus('loading_pdf');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const count = pdfDoc.numPages;

      const newPages = Array.from({ length: count }, (_, i) => ({
        pageIndex: i,
        rotation: 0,
        thumbnail: null,
      }));
      setPages(newPages);
      setStatus('ready');

      // Async render thumbnails one by one
      for (let i = 0; i < count; i++) {
        try {
          const page = await pdfDoc.getPage(i + 1);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          setPages(prev => prev.map(p => p.pageIndex === i ? { ...p, thumbnail: dataUrl } : p));
        } catch (thumbErr) {
          console.warn('Thumbnail generation failed for page:', i + 1, thumbErr);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load PDF document.');
      setFile(null);
      setStatus('idle');
    }
  };

  const rotatePage = (index, delta = 90) => {
    setPages(prev => prev.map(p => {
      if (p.pageIndex === index) {
        const nextRot = (p.rotation + delta) % 360;
        return { ...p, rotation: nextRot >= 0 ? nextRot : nextRot + 360 };
      }
      return p;
    }));
  };

  const rotateAll = (delta = 90) => {
    setPages(prev => prev.map(p => {
      const nextRot = (p.rotation + delta) % 360;
      return { ...p, rotation: nextRot >= 0 ? nextRot : nextRot + 360 };
    }));
  };

  const resetAllRotations = () => {
    setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
  };

  const handleRotatePdf = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(20);
    setProgressText('Preparing document...');
    setErrorMsg('');

    // Yield for React render
    await new Promise(resolve => setTimeout(resolve, 80));

    try {
      // Map to page rotations (0-indexed indices to angles)
      const pageRotations = {};
      pages.forEach(p => {
        if (p.rotation !== 0) {
          pageRotations[p.pageIndex] = p.rotation;
        }
      });

      const rotatedBlob = await pdfApi.rotatePdf(file, pageRotations, (pct, text) => {
        setProgress(pct);
        if (text) setProgressText(text);
      });

      const url = URL.createObjectURL(rotatedBlob);
      setResultBlobUrl(url);
      setResultFilename(file.name.replace(/\.[^/.]+$/, '') + '_rotated.pdf');
      setResultSize(rotatedBlob.size);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to rotate PDF pages.');
      setStatus('ready');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
    if (resultBlobUrl) {
      URL.revokeObjectURL(resultBlobUrl);
      setResultBlobUrl(null);
    }
    setResultFilename('');
    setResultSize(0);
    setShowPreview(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <div className="rounded-3xl bg-white dark:bg-[#141622] border border-blue-200 dark:border-[#2A2E45] shadow-xl p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-red-700">Rotation Error</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer text-center flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-blue-300 hover:border-purple-500 bg-linear-to-b from-white to-zinc-50 dark:to-zinc-950/20 min-h-[260px] transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
              Select PDF file to rotate
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Drop your file here, or click to browse</p>
            <button
              type="button"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Choose PDF File
            </button>
          </div>
        )}

        {status === 'loading_pdf' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">Loading PDF pages orientation...</p>
          </div>
        )}

        {status === 'ready' && file && (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Header controls */}
            <div className="pb-4 border-b border-zinc-100 dark:border-[#2A2E45] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{file.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{pages.length} Pages · {formatBytes(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetAllRotations}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                >
                  Reset All Rotations
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Mode Selection Tabs ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setRotateMode('all')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  rotateMode === 'all'
                    ? 'bg-white dark:bg-purple-950 dark:text-purple-200 text-purple-700 shadow-sm border border-purple-200'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rotate All Pages</span>
              </button>

              <button
                type="button"
                onClick={() => setRotateMode('specific')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  rotateMode === 'specific'
                    ? 'bg-white dark:bg-purple-950 dark:text-purple-200 text-purple-700 shadow-sm border border-purple-200'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Rotate Specific Pages</span>
              </button>
            </div>

            {/* ── Panel 1: Rotate All Controls ──────────────────────────────── */}
            {rotateMode === 'all' && (
              <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3">
                <div className="text-xs font-bold text-purple-900 dark:text-purple-300">
                  Quick Angle Options for All {pages.length} Pages:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => rotateAll(90)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Rotate All +90° Clockwise
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateAll(180)}
                    className="px-3.5 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs font-bold rounded-xl border border-purple-300 transition-all cursor-pointer"
                  >
                    Rotate All 180°
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateAll(270)}
                    className="px-3.5 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs font-bold rounded-xl border border-purple-300 transition-all cursor-pointer"
                  >
                    Rotate All +270° (90° CCW)
                  </button>
                </div>
              </div>
            )}

            {/* ── Panel 2: Rotate Specific Pages Controls ──────────────────── */}
            {rotateMode === 'specific' && (
              <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-purple-950 dark:text-purple-300">
                    Specific Pages to Rotate (e.g. 1, 3, 5-7)
                  </label>
                  <input
                    type="text"
                    value={specificPagesInput}
                    placeholder={`e.g. 1, 3, 5-${pages.length}`}
                    onChange={(e) => setSpecificPagesInput(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-purple-300 bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap text-left">
                  <span className="text-[11px] font-semibold text-zinc-500 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPresetSpecificPages('first')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    First Page (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetSpecificPages('last')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    Last Page ({pages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetSpecificPages('odd')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    Odd Pages (1, 3...)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetSpecificPages('even')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    Even Pages (2, 4...)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetSpecificPages('clear')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Specific Rotation Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => applySpecificRotation(90)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Rotate Selected +90°
                  </button>
                  <button
                    type="button"
                    onClick={() => applySpecificRotation(180)}
                    className="px-3.5 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs font-bold rounded-xl border border-purple-300 transition-all cursor-pointer"
                  >
                    Rotate Selected 180°
                  </button>
                  <button
                    type="button"
                    onClick={() => applySpecificRotation(270)}
                    className="px-3.5 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs font-bold rounded-xl border border-purple-300 transition-all cursor-pointer"
                  >
                    Rotate Selected +270°
                  </button>
                  <button
                    type="button"
                    onClick={resetSpecificRotation}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-300 transition-all cursor-pointer"
                  >
                    Reset Selected
                  </button>
                </div>
              </div>
            )}

            {/* Pages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 py-4 max-h-[500px] overflow-y-auto pr-1">
              {pages.map((p, idx) => {
                const targetSet = parsePageNumbers(specificPagesInput, pages.length);
                const isTargeted = rotateMode === 'specific' && targetSet.has(p.pageIndex);
                return (
                  <div
                    key={p.pageIndex}
                    className={`group relative rounded-xl border p-3 flex flex-col items-center justify-between space-y-3 transition-all ${
                      isTargeted
                        ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/50 shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs'
                    }`}
                  >
                    {/* Rotate Trigger Overlay */}
                    <button
                      onClick={() => {
                        rotatePage(p.pageIndex, 90);
                        if (rotateMode === 'specific') {
                          const currentSet = new Set(targetSet);
                          currentSet.add(p.pageIndex);
                          const sorted = Array.from(currentSet).map(n => n + 1).sort((a, b) => a - b);
                          setSpecificPagesInput(sorted.join(', '));
                        }
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-purple-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer"
                      title="Rotate 90° Clockwise"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>

                    {/* Thumbnail area */}
                    <div
                      onClick={() => {
                        rotatePage(p.pageIndex, 90);
                        if (rotateMode === 'specific') {
                          const currentSet = new Set(targetSet);
                          currentSet.add(p.pageIndex);
                          const sorted = Array.from(currentSet).map(n => n + 1).sort((a, b) => a - b);
                          setSpecificPagesInput(sorted.join(', '));
                        }
                      }}
                      className="w-full h-32 flex items-center justify-center cursor-pointer overflow-hidden rounded-lg bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 relative"
                    >
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={`Page ${idx + 1}`}
                          style={{
                            transform: `rotate(${p.rotation}deg)`,
                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                          className="max-w-full max-h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <div className="w-6 h-6 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Page {idx + 1}</p>
                      <p className={`text-[10px] mt-0.5 font-semibold ${p.rotation !== 0 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-zinc-400'}`}>
                        {p.rotation !== 0 ? `${p.rotation}° Rotated` : 'Default 0°'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom panel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#2A2E45]">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRotatePdf}
                className="px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Rotate PDF
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin mx-auto flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Rotating PDF Pages</h4>
              <p className="text-xs text-zinc-400">{progressText}</p>
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-purple-600">{progress}% completed</span>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="py-8 text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <RefreshCw className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">PDF Rotated Successfully!</h3>
              <p className="text-xs text-zinc-500">Your rotated document has been processed and is ready for download.</p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs">{resultFilename}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{formatBytes(resultSize)}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                Rotated
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
              <a
                href={resultBlobUrl}
                download={resultFilename}
                className="flex-1 min-w-[140px] py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
              {showPreview && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Rotate Another
              </button>
            </div>

            {resultBlobUrl && showPreview && (
              <div className="w-full mt-6 pt-6 border-t border-zinc-100 dark:border-[#2A2E45]">
                <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-2 border border-zinc-200 dark:border-[#2A2E45] shadow-inner overflow-hidden">
                  <iframe
                    src={resultBlobUrl}
                    title="PDF Preview"
                    className="w-full h-[450px] rounded-xl border-0 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
