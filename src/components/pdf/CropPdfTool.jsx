import React, { useState, useRef } from 'react';
import { Crop, Download, RotateCcw, AlertCircle, FileText, Sparkles, File, Trash2, ArrowRight, Check, Sliders } from 'lucide-react';
import { pdfApi } from '../../services/pdfApi';

export default function CropPdfTool() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading_pdf' | 'ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pages, setPages] = useState([]); // Array of { pageIndex, thumbnail: null }
  
  // Crop settings
  const [cropScope, setCropScope] = useState('all'); // 'all' | 'specific'
  const [pagesToCropInput, setPagesToCropInput] = useState('');
  const [marginTop, setMarginTop] = useState(10);
  const [marginBottom, setMarginBottom] = useState(10);
  const [marginLeft, setMarginLeft] = useState(10);
  const [marginRight, setMarginRight] = useState(10);

  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef(null);

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
      script.onerror = () => reject(new Error('Failed to load PDF engine.'));
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
        thumbnail: null,
      }));
      setPages(newPages);
      setPagesToCropInput(`1-${count}`);
      setStatus('ready');

      // Async render thumbnails
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
            if (i >= 1 && i <= total) set.add(i - 1);
          }
        }
      } else {
        const val = parseInt(trimmed, 10);
        if (!isNaN(val) && val >= 1 && val <= total) {
          set.add(val - 1);
        }
      }
    }
    return set;
  };

  const targetPageSet = cropScope === 'all'
    ? new Set(pages.map(p => p.pageIndex))
    : parsePageNumbers(pagesToCropInput, pages.length);

  const togglePageSelection = (idx) => {
    if (cropScope === 'all') return;
    const newSet = new Set(targetPageSet);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    const sorted = Array.from(newSet).map(n => n + 1).sort((a, b) => a - b);
    setPagesToCropInput(sorted.join(', '));
  };

  const applyPresetPages = (preset) => {
    const total = pages.length;
    if (preset === 'first') setPagesToCropInput('1');
    else if (preset === 'last') setPagesToCropInput(`${total}`);
    else if (preset === 'odd') {
      const odd = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      setPagesToCropInput(odd.join(', '));
    } else if (preset === 'even') {
      const even = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 === 0);
      setPagesToCropInput(even.join(', '));
    } else if (preset === 'clear') {
      setPagesToCropInput('');
    }
  };

  const applyMarginPreset = (top, bottom, left, right) => {
    setMarginTop(top);
    setMarginBottom(bottom);
    setMarginLeft(left);
    setMarginRight(right);
  };

  const handleCropPdf = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(20);
    setProgressText('Cropping page margins...');
    setErrorMsg('');

    await new Promise(resolve => setTimeout(resolve, 80));

    try {
      const options = {
        cropScope,
        pagesToCrop: pagesToCropInput,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
      };

      const croppedBlob = await pdfApi.cropPdf(file, options, (pct, text) => {
        setProgress(pct);
        if (text) setProgressText(text);
      });

      const url = URL.createObjectURL(croppedBlob);
      setResultBlobUrl(url);
      setResultFilename(file.name.replace(/\.[^/.]+$/, '') + '_cropped.pdf');
      setResultSize(croppedBlob.size);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to crop PDF document.');
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
              <p className="text-xs font-bold text-red-700">Crop Error</p>
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
              <Crop className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
              Select PDF file to crop
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Drop your PDF file here, or click to browse</p>
            <button
              type="button"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Choose PDF File
            </button>
          </div>
        )}

        {status === 'loading_pdf' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">Analyzing PDF page dimensions...</p>
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
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Mode Selection Tabs: Crop All vs Crop Specific ──────────── */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setCropScope('all')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  cropScope === 'all'
                    ? 'bg-white dark:bg-purple-950 dark:text-purple-200 text-purple-700 shadow-sm border border-purple-200'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Crop className="w-4 h-4" />
                <span>Crop All Pages</span>
              </button>

              <button
                type="button"
                onClick={() => setCropScope('specific')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  cropScope === 'specific'
                    ? 'bg-white dark:bg-purple-950 dark:text-purple-200 text-purple-700 shadow-sm border border-purple-200'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Crop Specific Pages</span>
              </button>
            </div>

            {/* ── Specific Pages Selector Input (when cropScope === 'specific') ── */}
            {cropScope === 'specific' && (
              <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-purple-950 dark:text-purple-300">
                    Specific Pages to Crop (e.g. 1, 3, 5-7)
                  </label>
                  <input
                    type="text"
                    value={pagesToCropInput}
                    placeholder={`e.g. 1, 3, 5-${pages.length}`}
                    onChange={(e) => setPagesToCropInput(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-purple-300 bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-left">
                  <span className="text-[11px] font-semibold text-zinc-500 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPresetPages('first')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    First Page (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetPages('last')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    Last Page ({pages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetPages('odd')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    Odd Pages (1, 3...)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetPages('even')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    Even Pages (2, 4...)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetPages('clear')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* ── 4-Side Independent Margin Controls ──────────────────────── */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Crop Margins (All 4 Sides):
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyMarginPreset(10, 10, 10, 10)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    Equal 10%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarginPreset(15, 15, 0, 0)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    Header/Footer (15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarginPreset(0, 0, 15, 15)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    Side Margins (15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarginPreset(0, 0, 0, 0)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-800 cursor-pointer"
                  >
                    Reset (0%)
                  </button>
                </div>
              </div>

              {/* Grid of 4 Margins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                {/* Top Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>⬆️ Top Margin</span>
                    <span className="text-purple-600 font-black">{marginTop}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={marginTop}
                    onChange={(e) => setMarginTop(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Bottom Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>⬇️ Bottom Margin</span>
                    <span className="text-purple-600 font-black">{marginBottom}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={marginBottom}
                    onChange={(e) => setMarginBottom(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Left Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>⬅️ Left Margin</span>
                    <span className="text-purple-600 font-black">{marginLeft}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={marginLeft}
                    onChange={(e) => setMarginLeft(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Right Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>➡️ Right Margin</span>
                    <span className="text-purple-600 font-black">{marginRight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={marginRight}
                    onChange={(e) => setMarginRight(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ── Pages Grid with Visual Crop Rectangles Overlay ───────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>Visual Crop Preview ({targetPageSet.size} of {pages.length} pages will be cropped):</span>
                <span className="text-[11px] text-purple-600 font-medium">Click thumbnail to toggle page selection</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 py-2 max-h-[460px] overflow-y-auto pr-1">
                {pages.map((p, idx) => {
                  const isCropped = targetPageSet.has(p.pageIndex);
                  return (
                    <div
                      key={p.pageIndex}
                      onClick={() => togglePageSelection(p.pageIndex)}
                      className={`group relative rounded-xl border p-3 flex flex-col items-center justify-between space-y-3 transition-all cursor-pointer ${
                        isCropped
                          ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/50 shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      {/* Selection Badge */}
                      <span className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCropped ? 'bg-purple-600 text-white shadow-xs' : 'bg-zinc-200 text-zinc-500'
                      }`}>
                        {isCropped ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                      </span>

                      {/* Thumbnail with visual Crop Box overlay */}
                      <div className="w-full h-36 flex items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative">
                        {p.thumbnail ? (
                          <div className="relative max-w-full max-h-full flex items-center justify-center">
                            <img
                              src={p.thumbnail}
                              alt={`Page ${idx + 1}`}
                              className="max-w-full max-h-36 object-contain pointer-events-none"
                            />
                            {/* Crop Box Overlay */}
                            {isCropped && (
                              <div
                                className="absolute border-2 border-dashed border-purple-600 bg-purple-500/15 pointer-events-none transition-all"
                                style={{
                                  top: `${marginTop}%`,
                                  bottom: `${marginBottom}%`,
                                  left: `${marginLeft}%`,
                                  right: `${marginRight}%`,
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                        )}
                      </div>

                      {/* Label */}
                      <div className="text-center">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Page {idx + 1}</p>
                        <p className={`text-[10px] mt-0.5 font-semibold ${isCropped ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-zinc-400'}`}>
                          {isCropped ? 'Cropped' : 'Unchanged'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Panel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#2A2E45]">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCropPdf}
                className="px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Crop PDF
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin mx-auto flex items-center justify-center">
              <Crop className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Cropping PDF Pages</h4>
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
              <Crop className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">PDF Cropped Successfully!</h3>
              <p className="text-xs text-zinc-500">Your cropped PDF document is ready for download.</p>
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
                Cropped
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
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Crop Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
