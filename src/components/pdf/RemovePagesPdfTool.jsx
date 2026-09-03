import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Trash2, RotateCw, Check, Eye
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { analytics } from '../../services/analytics';

// PDF.js dynamic loader for page thumbnails
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
    script.onerror = () => reject(new Error('Failed to load PDF preview engine.'));
    document.body.appendChild(script);
  });
};

function parsePageNumbers(str, total) {
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
          if (i >= 1 && i <= total) set.add(i);
        }
      }
    } else {
      const val = parseInt(trimmed, 10);
      if (!isNaN(val) && val >= 1 && val <= total) {
        set.add(val);
      }
    }
  }
  return set;
}

export default function RemovePagesPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageThumbnails, setPageThumbnails] = useState([]); // Array of { pageNum: 1, thumbnail: string }
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [thumbnailZoom, setThumbnailZoom] = useState('normal'); // 'compact' | 'normal' | 'large'
  const [globalRotation, setGlobalRotation] = useState(0);

  const [pagesToRemoveInput, setPagesToRemoveInput] = useState('');
  
  // Processing & Results
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading_file' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [resultRemainingPages, setResultRemainingPages] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

  /* ── Clean up Blob URLs on unmount ────────────────────── */
  useEffect(() => {
    return () => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    };
  }, [resultBlobUrl]);

  /* ── Format Bytes ─────────────────────────────────────── */
  const fmt = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  /* ── File Selection & PDF.js Rendering ────────────────── */
  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');

    const isPdf = incomingFile.type === 'application/pdf' || incomingFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMsg('Please upload a valid PDF document.');
      return;
    }
    if (incomingFile.size > 80 * 1024 * 1024) {
      setErrorMsg('File size exceeds 80 MB limit.');
      return;
    }

    setFile(incomingFile);
    setStatus('loading_file');
    setProgressText('Loading PDF and rendering page previews...');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      
      // Load page count via PDFDocument
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);

      setPagesToRemoveInput('');

      const initialThumbs = Array.from({ length: count }, (_, i) => ({
        pageNum: i + 1,
        thumbnail: null
      }));
      setPageThumbnails(initialThumbs);
      setStatus('idle');

      // Async render thumbnails with PDF.js
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;

        for (let i = 1; i <= count; i++) {
          try {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.35 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

            setPageThumbnails(prev => prev.map(p => p.pageNum === i ? { ...p, thumbnail: dataUrl } : p));
          } catch (pErr) {
            console.warn(`Could not render thumbnail for page ${i}:`, pErr);
          }
        }
      } catch (pdfjsErr) {
        console.warn('PDF.js thumbnail rendering notice:', pdfjsErr);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to read PDF document. The file may be password-protected or corrupted.');
      setFile(null);
      setStatus('idle');
    }
  };

  /* ── Selection Set Handlers (2-Way Synced) ───────────── */
  const removePageSet = parsePageNumbers(pagesToRemoveInput, totalPages);

  const togglePageRemoval = (pageNum) => {
    const updatedSet = new Set(removePageSet);
    if (updatedSet.has(pageNum)) {
      updatedSet.delete(pageNum);
    } else {
      updatedSet.add(pageNum);
    }
    const sorted = Array.from(updatedSet).sort((a, b) => a - b);
    setPagesToRemoveInput(sorted.join(', '));
  };

  const applyPreset = (preset) => {
    if (preset === 'odd') {
      const odd = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      setPagesToRemoveInput(odd.join(', '));
    } else if (preset === 'even') {
      const even = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 0);
      setPagesToRemoveInput(even.join(', '));
    } else if (preset === 'clear') {
      setPagesToRemoveInput('');
    }
  };

  /* ── Core Remove Pages Execution ──────────────────────── */
  const handleRemovePages = async () => {
    if (!file || totalPages === 0) return;

    const removedIndices = removePageSet;
    if (removedIndices.size === 0) {
      setErrorMsg('Please select at least one page to remove.');
      return;
    }
    if (removedIndices.size >= totalPages) {
      setErrorMsg('You cannot remove all pages. The PDF must contain at least one page.');
      return;
    }

    setStatus('processing');
    setProgress(15);
    setProgressText('Loading PDF and filtering pages...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const keepPageIndices = [];
      for (let i = 1; i <= totalPages; i++) {
        if (!removedIndices.has(i)) {
          keepPageIndices.push(i - 1);
        }
      }

      setProgress(45);
      setProgressText(`Preserving ${keepPageIndices.length} pages...`);

      const copiedPages = await newDoc.copyPages(srcDoc, keepPageIndices);
      copiedPages.forEach(page => {
        if (globalRotation) {
          page.setRotation(degrees((page.getRotation().angle + globalRotation) % 360));
        }
        newDoc.addPage(page);
      });

      setProgress(85);
      setProgressText('Generating final PDF document...');

      const outBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_pages_removed.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(blob.size);
      setResultRemainingPages(keepPageIndices.length);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('remove-pages-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Remove pages error:', err);
      setErrorMsg(err.message || 'An error occurred while removing pages from the PDF.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setTotalPages(0);
    setPageThumbnails([]);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setPagesToRemoveInput('');
    setErrorMsg('');
  };

  const remainingPagesCount = Math.max(0, totalPages - removePageSet.size);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* ── Error Banner ──────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg('')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. INITIAL UPLOAD SCREEN (iLovePDF Style) ───────── */}
      {status === 'idle' && !file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files.length) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center transition-all flex flex-col items-center justify-center min-h-[360px] cursor-pointer ${
            isDraggingOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
              : 'border-zinc-300 dark:border-[#2A2E45] bg-[#F8FAFC]/60 dark:bg-[#141622]/60 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/25 mb-6 group-hover:scale-105 transition-transform">
            <Trash2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-lg sm:text-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-3 cursor-pointer"
          >
            <span>Select PDF file</span>
            <UploadCloud className="w-6 h-6" />
          </button>

          <p className="mt-4 text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            or drop PDF here
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Private In-Browser Removal
            </span>
            <span>•</span>
            <span>Click Any Page to Delete</span>
            <span>•</span>
            <span>Zero File Limits</span>
          </div>
        </div>
      )}

      {/* ── 2. LOADING PDF PREVIEWS STATE ──────────────────── */}
      {status === 'loading_file' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {progressText || 'Reading PDF pages...'}
          </p>
        </div>
      )}

      {/* ── 3. INTERACTIVE REMOVE WORKSPACE (iLovePDF Style) ── */}
      {status === 'idle' && file && totalPages > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">

          {/* ── LEFT: INTERACTIVE PAGE THUMBNAILS CANVAS (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Canvas Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Click pages to remove
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-600 dark:text-zinc-300">
                  {totalPages} total pages
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Presets */}
                <div className="flex items-center gap-1.5 mr-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('odd')}
                    className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Odd
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('even')}
                    className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Even
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Rotate Canvas */}
                <button
                  type="button"
                  onClick={() => setGlobalRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Rotate all pages 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rotate</span>
                </button>

                {/* Grid Density Zoom */}
                <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-[#1B1E2E] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setThumbnailZoom('compact')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      thumbnailZoom === 'compact' ? 'bg-white dark:bg-[#2A2E45] shadow-xs text-blue-600' : 'text-zinc-500'
                    }`}
                  >
                    S
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailZoom('normal')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      thumbnailZoom === 'normal' ? 'bg-white dark:bg-[#2A2E45] shadow-xs text-blue-600' : 'text-zinc-500'
                    }`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailZoom('large')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      thumbnailZoom === 'large' ? 'bg-white dark:bg-[#2A2E45] shadow-xs text-blue-600' : 'text-zinc-500'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Page Thumbnails Grid */}
            <div
              className={`grid gap-3.5 p-4 rounded-3xl bg-zinc-100/50 dark:bg-[#141622]/40 border border-zinc-200/80 dark:border-[#2A2E45] max-h-[72vh] overflow-y-auto ${
                thumbnailZoom === 'compact'
                  ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
                  : thumbnailZoom === 'large'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {pageThumbnails.map((p) => {
                const isMarkedForRemoval = removePageSet.has(p.pageNum);

                return (
                  <div
                    key={p.pageNum}
                    onClick={() => togglePageRemoval(p.pageNum)}
                    className={`group relative rounded-2xl border p-2.5 flex flex-col items-center justify-between transition-all select-none cursor-pointer ${
                      isMarkedForRemoval
                        ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/40 opacity-90 scale-[0.98]'
                        : 'bg-white dark:bg-[#1B1E2E] border-zinc-200 dark:border-[#2A2E45] hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    {/* Page Number Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-zinc-900/80 text-white text-[10px] font-black backdrop-blur-sm shadow-xs">
                      {p.pageNum}
                    </div>

                    {/* Delete / Removed Overlay Badge */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      {isMarkedForRemoval ? (
                        <div className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          <span>Removed</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-[#141622] group-hover:bg-blue-100 dark:group-hover:bg-blue-950 text-zinc-400 group-hover:text-blue-600 flex items-center justify-center transition-colors shadow-xs">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Render Canvas */}
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#141622] flex items-center justify-center my-1.5 relative border border-zinc-100 dark:border-[#2A2E45]/40">
                      {p.thumbnail ? (
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-200"
                          style={{ transform: `rotate(${globalRotation}deg)` }}
                        >
                          <img
                            src={p.thumbnail}
                            alt={`Page ${p.pageNum}`}
                            className={`max-w-full max-h-full object-contain ${
                              isMarkedForRemoval ? 'grayscale contrast-75 opacity-40' : ''
                            }`}
                          />
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center text-zinc-400 gap-1"
                          style={{ transform: `rotate(${globalRotation}deg)` }}
                        >
                          <FileText className="w-8 h-8 text-blue-600/50" />
                          <span className="text-[10px] font-bold">Page {p.pageNum}</span>
                        </div>
                      )}

                      {/* Red Strikethrough Cross Icon over removed pages */}
                      {isMarkedForRemoval && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10 backdrop-blur-[0.5px]">
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg animate-scale-up">
                            <Trash2 className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold ${
                        isMarkedForRemoval ? 'text-blue-600 dark:text-blue-400 line-through' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      Page {p.pageNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: ILovePDF-STYLE OPTIONS SIDEBAR (4 Cols) ─ */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            {/* File Info Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {totalPages} pages • {fmt(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-zinc-400 hover:text-blue-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] transition-colors cursor-pointer"
                title="Change PDF file"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Removal Summary & Text Input Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Pages to remove:
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {removePageSet.size} marked for deletion
                  </span>
                </div>

                <input
                  type="text"
                  value={pagesToRemoveInput}
                  placeholder={`e.g. 1, 3, 5-${totalPages}`}
                  onChange={(e) => setPagesToRemoveInput(e.target.value)}
                  className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-zinc-400">
                  Click pages on the canvas or type page numbers / ranges above.
                </p>
              </div>

              {/* Dynamic Pages Status Breakdown */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-100 dark:border-[#2A2E45] text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Removing</span>
                  <p className="text-sm font-black text-blue-600">
                    {removePageSet.size} {removePageSet.size === 1 ? 'page' : 'pages'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Remaining</span>
                  <p className="text-sm font-black text-emerald-600">
                    {remainingPagesCount} {remainingPagesCount === 1 ? 'page' : 'pages'}
                  </p>
                </div>
              </div>

              {/* Big Action Button */}
              <button
                type="button"
                disabled={removePageSet.size === 0 || removePageSet.size >= totalPages}
                onClick={handleRemovePages}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white font-black text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Remove pages</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ── 4. PROCESSING STATE ────────────────────────────── */}
      {status === 'processing' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-10 sm:p-16 text-center space-y-6 shadow-sm">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-blue-100 dark:border-blue-950 border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-zinc-900 dark:text-white">
              {progress}%
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
              Removing selected pages...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Cleaning PDF document structure...'}
            </p>
          </div>

          <div className="max-w-md mx-auto w-full bg-zinc-100 dark:bg-[#1B1E2E] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── 5. COMPLETION & DOWNLOAD SCREEN ────────────────── */}
      {status === 'completed' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-8 sm:p-14 text-center space-y-6 shadow-sm animate-scale-up">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              Pages have been removed!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              The selected pages were permanently removed from your document.
            </p>
          </div>

          {/* Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{resultFilename}</span>
            <span>•</span>
            <span>{resultRemainingPages} pages left</span>
            <span>•</span>
            <span>{fmt(resultSize)}</span>
          </div>

          {/* Download & Preview Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </a>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
            </button>
          </div>

          {/* Preview Iframe */}
          {showPreview && resultBlobUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-[#2A2E45] shadow-inner max-w-3xl mx-auto">
              <iframe
                src={`${resultBlobUrl}#toolbar=0`}
                title="Result PDF Preview"
                className="w-full h-[480px] bg-zinc-800"
              />
            </div>
          )}

          {/* Start Over */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Remove pages from another PDF</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
