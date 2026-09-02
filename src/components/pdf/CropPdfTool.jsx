import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Crop, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Sliders, Eye
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { analytics } from '../../services/analytics';

// PDF.js dynamic loader for high-res page rendering
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
    script.onerror = () => reject(new Error('Failed to load PDF rendering engine.'));
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

export default function CropPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Normalized Crop Box Percentages (0 to 100)
  // x, y = top-left corner in % of page width/height; w, h = width/height in %
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialCropBox, setInitialCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });

  // Crop Scope
  const [cropScope, setCropScope] = useState('all'); // 'all' | 'current' | 'custom'
  const [customPagesText, setCustomPagesText] = useState('1');

  // Processing & Results
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading_file' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const pdfDocRef = useRef(null);

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

  /* ── Render Active PDF Page on Canvas ─────────────────── */
  const renderCurrentPage = useCallback(async (doc, pageNum, zoom) => {
    if (!doc || !canvasRef.current) return;
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 * zoom });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.warn('Page render warning:', err);
    }
  }, []);

  /* ── Load Document ────────────────────────────────────── */
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
    setProgressText('Loading PDF page...');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const doc = await loadingTask.promise;

      pdfDocRef.current = doc;
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setCustomPagesText(`1-${doc.numPages}`);
      setCropBox({ x: 8, y: 8, w: 84, h: 84 });
      setStatus('idle');

      setTimeout(() => {
        renderCurrentPage(doc, 1, zoomLevel);
      }, 50);

    } catch (err) {
      console.error('PDF load error:', err);
      setErrorMsg('Failed to open PDF document. The file might be corrupted or protected.');
      setFile(null);
      setStatus('idle');
    }
  };

  // Re-render when page or zoom changes
  useEffect(() => {
    if (pdfDocRef.current && status === 'idle' && file) {
      renderCurrentPage(pdfDocRef.current, currentPage, zoomLevel);
    }
  }, [currentPage, zoomLevel, renderCurrentPage, status, file]);

  /* ── Interactive Crop Box Mouse / Touch Dragging ──────── */
  const handleMouseDownBox = (e) => {
    e.preventDefault();
    setIsDraggingBox(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialCropBox({ ...cropBox });
  };

  const handleMouseDownHandle = (e, handleName) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandle(handleName);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialCropBox({ ...cropBox });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingBox && !activeHandle) return;
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartPos.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartPos.y) / rect.height) * 100;

    if (isDraggingBox) {
      // Move whole box
      let nextX = Math.max(0, Math.min(100 - initialCropBox.w, initialCropBox.x + deltaXPercent));
      let nextY = Math.max(0, Math.min(100 - initialCropBox.h, initialCropBox.y + deltaYPercent));
      setCropBox(prev => ({ ...prev, x: nextX, y: nextY }));
      return;
    }

    if (activeHandle) {
      let { x, y, w, h } = initialCropBox;

      if (activeHandle.includes('e')) { // Right
        w = Math.max(10, Math.min(100 - x, initialCropBox.w + deltaXPercent));
      }
      if (activeHandle.includes('s')) { // Bottom
        h = Math.max(10, Math.min(100 - y, initialCropBox.h + deltaYPercent));
      }
      if (activeHandle.includes('w')) { // Left
        const maxDelta = initialCropBox.w - 10;
        const clampedDelta = Math.min(maxDelta, Math.max(-initialCropBox.x, deltaXPercent));
        x = initialCropBox.x + clampedDelta;
        w = initialCropBox.w - clampedDelta;
      }
      if (activeHandle.includes('n')) { // Top
        const maxDelta = initialCropBox.h - 10;
        const clampedDelta = Math.min(maxDelta, Math.max(-initialCropBox.y, deltaYPercent));
        y = initialCropBox.y + clampedDelta;
        h = initialCropBox.h - clampedDelta;
      }

      setCropBox({ x, y, w, h });
    }
  }, [isDraggingBox, activeHandle, dragStartPos, initialCropBox]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingBox(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDraggingBox || activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingBox, activeHandle, handleMouseMove, handleMouseUp]);

  /* ── Presets ─────────────────────────────────────────── */
  const applyPreset = (presetName) => {
    if (presetName === 'auto_trim') {
      setCropBox({ x: 5, y: 5, w: 90, h: 90 });
    } else if (presetName === 'letter_center') {
      setCropBox({ x: 12, y: 8, w: 76, h: 84 });
    } else if (presetName === 'square') {
      setCropBox({ x: 15, y: 20, w: 70, h: 60 });
    } else if (presetName === 'full') {
      setCropBox({ x: 0, y: 0, w: 100, h: 100 });
    }
  };

  /* ── Core Crop Execution with PDF-Lib ────────────────── */
  const handleCropPdf = async () => {
    if (!file || totalPages === 0) return;

    setStatus('processing');
    setProgress(15);
    setProgressText('Preparing crop coordinates...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      let targetPagesSet = new Set();
      if (cropScope === 'all') {
        for (let i = 1; i <= totalPages; i++) targetPagesSet.add(i);
      } else if (cropScope === 'current') {
        targetPagesSet.add(currentPage);
      } else {
        targetPagesSet = parsePageNumbers(customPagesText, totalPages);
      }

      if (targetPagesSet.size === 0) {
        throw new Error('Please select at least one page to crop.');
      }

      setProgress(40);
      setProgressText(`Applying crop box to ${targetPagesSet.size} pages...`);

      // cropBox is in percentages: x, y, w, h
      // Note: PDF coordinate system has (0,0) at bottom-left!
      pages.forEach((page, idx) => {
        const pNum = idx + 1;
        if (targetPagesSet.has(pNum)) {
          const { width, height } = page.getSize();

          const cropX = (cropBox.x / 100) * width;
          const cropW = (cropBox.w / 100) * width;
          // In PDF, Y=0 is bottom, so top-left y% translates to:
          const cropH = (cropBox.h / 100) * height;
          const cropY = height - ((cropBox.y / 100) * height) - cropH;

          // Set both CropBox and MediaBox to ensure universal viewer clipping
          page.setCropBox(cropX, Math.max(0, cropY), cropW, cropH);
          page.setMediaBox(cropX, Math.max(0, cropY), cropW, cropH);
        }
      });

      setProgress(85);
      setProgressText('Packaging cropped PDF document...');

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_cropped.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(blob.size);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('crop-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Crop PDF error:', err);
      setErrorMsg(err.message || 'Failed to crop PDF document.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setTotalPages(0);
    setCurrentPage(1);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setCropBox({ x: 8, y: 8, w: 84, h: 84 });
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* ── Error Banner ──────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg('')}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors cursor-pointer"
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
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 scale-[1.01]'
              : 'border-zinc-300 dark:border-[#2A2E45] bg-[#F8FAFC]/60 dark:bg-[#141622]/60 hover:border-red-400 dark:hover:border-red-600'
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

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/25 mb-6 group-hover:scale-105 transition-transform">
            <Crop className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-lg sm:text-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-3 cursor-pointer"
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
              100% Private In-Browser Crop
            </span>
            <span>•</span>
            <span>Visual Draggable Crop Box</span>
            <span>•</span>
            <span>Zero Server Uploads</span>
          </div>
        </div>
      )}

      {/* ── 2. LOADING STATE ───────────────────────────────── */}
      {status === 'loading_file' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {progressText || 'Reading PDF pages...'}
          </p>
        </div>
      )}

      {/* ── 3. INTERACTIVE CROP WORKSPACE (iLovePDF Style) ─── */}
      {status === 'idle' && file && totalPages > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">

          {/* ── LEFT: INTERACTIVE CROP VIEWER CANVAS (8 Cols) ─ */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Page Navigation & Zoom Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              
              {/* Page Navigator */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Page <span className="text-red-600 font-black">{currentPage}</span> of {totalPages}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-zinc-500 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-[10px] font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>

            </div>

            {/* Main Interactive Canvas & Draggable Crop Overlay Area */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[500px] overflow-auto select-none">
              
              <div
                ref={canvasContainerRef}
                className="relative shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 inline-block"
              >
                {/* Real High-Res Rendered PDF Canvas */}
                <canvas ref={canvasRef} className="block max-w-full h-auto" />

                {/* Darkened Mask Outside Crop Box */}
                <div
                  className="absolute inset-0 bg-black/40 pointer-events-none"
                  style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% 0%,
                      ${cropBox.x}% ${cropBox.y}%,
                      ${cropBox.x}% ${cropBox.y + cropBox.h}%,
                      ${cropBox.x + cropBox.w}% ${cropBox.y + cropBox.h}%,
                      ${cropBox.x + cropBox.w}% ${cropBox.y}%,
                      ${cropBox.x}% ${cropBox.y}%
                    )`
                  }}
                />

                {/* ── DRAGGABLE & RESIZABLE CROP BOX OVERLAY ── */}
                <div
                  onMouseDown={handleMouseDownBox}
                  className="absolute border-2 border-red-500 shadow-sm cursor-move group"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.w}%`,
                    height: `${cropBox.h}%`
                  }}
                >
                  {/* Grid Lines (Rule of Thirds) */}
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity">
                    <div className="border-r border-b border-white/60 border-dashed" />
                    <div className="border-r border-b border-white/60 border-dashed" />
                    <div className="border-b border-white/60 border-dashed" />
                    <div className="border-r border-b border-white/60 border-dashed" />
                    <div className="border-r border-b border-white/60 border-dashed" />
                    <div className="border-b border-white/60 border-dashed" />
                    <div className="border-r border-white/60 border-dashed" />
                    <div className="border-r border-white/60 border-dashed" />
                    <div />
                  </div>

                  {/* 8 Resize Handles */}
                  {/* NW */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                  />
                  {/* N */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-ns-resize shadow-md"
                  />
                  {/* NE */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-nesw-resize shadow-md"
                  />
                  {/* E */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'e')}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-ew-resize shadow-md"
                  />
                  {/* SE */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                  />
                  {/* S */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-ns-resize shadow-md"
                  />
                  {/* SW */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-nesw-resize shadow-md"
                  />
                  {/* W */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle(e, 'w')}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-ew-resize shadow-md"
                  />

                  {/* Dimensions Tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono font-bold backdrop-blur-xs pointer-events-none">
                    {Math.round(cropBox.w)}% × {Math.round(cropBox.h)}%
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ── RIGHT: ILovePDF-STYLE OPTIONS SIDEBAR (4 Cols) ─ */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            {/* File Info */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
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
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] transition-colors cursor-pointer"
                title="Change PDF file"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Crop Settings Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
                  Crop Options
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Drag handles on the canvas or pick a preset below.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Crop Presets:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('auto_trim')}
                    className="py-2 px-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 text-zinc-700 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold border border-zinc-200 dark:border-[#2A2E45] transition-colors cursor-pointer"
                  >
                    Trim Margins
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('letter_center')}
                    className="py-2 px-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 text-zinc-700 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold border border-zinc-200 dark:border-[#2A2E45] transition-colors cursor-pointer"
                  >
                    Center Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('square')}
                    className="py-2 px-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 text-zinc-700 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold border border-zinc-200 dark:border-[#2A2E45] transition-colors cursor-pointer"
                  >
                    Square Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('full')}
                    className="py-2 px-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 text-zinc-700 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold border border-zinc-200 dark:border-[#2A2E45] transition-colors cursor-pointer"
                  >
                    Reset Full
                  </button>
                </div>
              </div>

              {/* Crop Scope (All pages vs Current vs Custom) */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Apply crop to:
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={cropScope === 'all'}
                      onChange={() => setCropScope('all')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      All pages in document ({totalPages} pages)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={cropScope === 'current'}
                      onChange={() => setCropScope('current')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Current page only (Page {currentPage})
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={cropScope === 'custom'}
                      onChange={() => setCropScope('custom')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Custom page selection
                    </span>
                  </label>
                </div>

                {cropScope === 'custom' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={customPagesText}
                      placeholder={`e.g. 1, 3, 5-${totalPages}`}
                      onChange={(e) => setCustomPagesText(e.target.value)}
                      className="w-full text-xs rounded-xl px-3 py-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>

              {/* Big Prominent Action Button */}
              <button
                type="button"
                onClick={handleCropPdf}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Crop PDF</span>
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
            <div className="w-20 h-20 rounded-full border-4 border-red-100 dark:border-red-950 border-t-red-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-zinc-900 dark:text-white">
              {progress}%
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
              Cropping PDF document...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Recalculating page bounding boxes...'}
            </p>
          </div>

          <div className="max-w-md mx-auto w-full bg-zinc-100 dark:bg-[#1B1E2E] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300 ease-out"
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
              PDF has been cropped!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              The selected crop area has been permanently applied to your document pages.
            </p>
          </div>

          {/* Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{resultFilename}</span>
            <span>•</span>
            <span>{totalPages} pages</span>
            <span>•</span>
            <span>{fmt(resultSize)}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Cropped PDF</span>
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
                title="Cropped PDF Preview"
                className="w-full h-[480px] bg-zinc-800"
              />
            </div>
          )}

          {/* Start Over */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Crop another PDF document</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
