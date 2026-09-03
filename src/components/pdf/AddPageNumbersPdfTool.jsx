import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Eye, Sliders, Type, Hash, BookOpen
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
    script.onerror = () => reject(new Error('Failed to load PDF viewer engine.'));
    document.body.appendChild(script);
  });
};

export default function AddPageNumbersPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Page Numbers Settings (iLovePDF Style)
  const [mode, setMode] = useState('single'); // 'single' | 'facing' (booklet)
  const [position, setPosition] = useState('bottom-center'); // 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  const [formatType, setFormatType] = useState('page-n-of-total'); // 'page-n' | 'page-n-of-total' | 'custom'
  const [customFormatText, setCustomFormatText] = useState('Page {n} of {p}');

  // Range & Numbering
  const [startNumber, setStartNumber] = useState(1);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);

  // Typography & Styling
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [fontSize, setFontSize] = useState(12);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [marginOffset, setMarginOffset] = useState(25); // px margin from edge

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
  const pdfCanvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const pdfDocRef = useRef(null);

  const colorPalette = [
    '#000000', '#475569', '#1E3A8A', '#2563EB',
    '#10B981', '#8B5CF6'
  ];

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
    if (!doc || !pdfCanvasRef.current) return;
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.25 * zoom });
      const canvas = pdfCanvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.warn('PDF Page rendering error:', err);
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
      const count = doc.numPages;
      setTotalPages(count);
      setCurrentPage(1);
      setFromPage(1);
      setToPage(count);
      setStatus('idle');

      setTimeout(() => renderCurrentPage(doc, 1, zoomLevel), 50);

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to open PDF document.');
      setFile(null);
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (pdfDocRef.current && status === 'idle' && file) {
      renderCurrentPage(pdfDocRef.current, currentPage, zoomLevel);
    }
  }, [currentPage, zoomLevel, renderCurrentPage, status, file]);

  /* ── Helper to calculate label text for a page ────────── */
  const getPageLabelText = (pageIndexOneBased) => {
    if (pageIndexOneBased < fromPage || pageIndexOneBased > toPage) {
      return null;
    }

    const calculatedNum = startNumber + (pageIndexOneBased - fromPage);
    const totalCount = toPage - fromPage + 1;

    if (formatType === 'page-n') {
      return `${calculatedNum}`;
    }
    if (formatType === 'page-n-of-total') {
      return `Page ${calculatedNum} of ${totalCount}`;
    }
    // Custom
    return customFormatText
      .replace(/\{n\}/gi, calculatedNum)
      .replace(/\{p\}/gi, totalCount);
  };

  /* ── Helper for Live CSS Position Overlay ─────────────── */
  const getPositionStyles = (pageIndexOneBased) => {
    let effectivePos = position;

    // Facing pages logic (alternating odd on right, even on left)
    if (mode === 'facing') {
      const isOdd = pageIndexOneBased % 2 !== 0;
      if (position.includes('top')) {
        effectivePos = isOdd ? 'top-right' : 'top-left';
      } else {
        effectivePos = isOdd ? 'bottom-right' : 'bottom-left';
      }
    }

    const marginPx = marginOffset * zoomLevel;
    const map = {
      'top-left': { top: `${marginPx}px`, left: `${marginPx}px`, transform: 'none' },
      'top-center': { top: `${marginPx}px`, left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: `${marginPx}px`, right: `${marginPx}px`, transform: 'none' },
      'bottom-left': { bottom: `${marginPx}px`, left: `${marginPx}px`, transform: 'none' },
      'bottom-center': { bottom: `${marginPx}px`, left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: `${marginPx}px`, right: `${marginPx}px`, transform: 'none' },
    };

    return map[effectivePos] || map['bottom-center'];
  };

  /* ── Core PDF Page Numbering Execution with PDF-Lib ───── */
  const handleAddPageNumbers = async () => {
    if (!file || totalPages === 0) return;

    setStatus('processing');
    setProgress(15);
    setProgressText('Preparing page numbering engine...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      let fontToUse = await pdfDoc.embedFont(StandardFonts.Helvetica);
      if (fontFamily === 'Times') fontToUse = await pdfDoc.embedFont(isBold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman);
      else if (fontFamily === 'Courier') fontToUse = await pdfDoc.embedFont(isBold ? StandardFonts.CourierBold : StandardFonts.Courier);
      else fontToUse = await pdfDoc.embedFont(isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);

      const hexToRgb = (hex) => {
        const clean = hex.replace('#', '');
        const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
        const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
        const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
        return rgb(r, g, b);
      };

      const fontRgb = hexToRgb(textColor);

      setProgress(40);
      setProgressText(`Numbering pages from ${fromPage} to ${toPage}...`);

      pages.forEach((page, idx) => {
        const pNum = idx + 1;
        const labelText = getPageLabelText(pNum);
        if (!labelText) return;

        const { width, height } = page.getSize();
        const textWidth = fontToUse.widthOfTextAtSize(labelText, fontSize);
        const margin = marginOffset;

        let effectivePos = position;
        if (mode === 'facing') {
          const isOdd = pNum % 2 !== 0;
          effectivePos = position.includes('top')
            ? (isOdd ? 'top-right' : 'top-left')
            : (isOdd ? 'bottom-right' : 'bottom-left');
        }

        let x = (width - textWidth) / 2;
        let y = margin;

        if (effectivePos === 'bottom-left') x = margin;
        else if (effectivePos === 'bottom-right') x = width - textWidth - margin;
        else if (effectivePos === 'bottom-center') x = (width - textWidth) / 2;
        else if (effectivePos === 'top-left') { x = margin; y = height - margin - fontSize; }
        else if (effectivePos === 'top-center') { x = (width - textWidth) / 2; y = height - margin - fontSize; }
        else if (effectivePos === 'top-right') { x = width - textWidth - margin; y = height - margin - fontSize; }

        page.drawText(labelText, {
          x,
          y: Math.max(5, y),
          size: fontSize,
          font: fontToUse,
          color: fontRgb
        });
      });

      setProgress(85);
      setProgressText('Compiling numbered PDF document...');

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_numbered.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(blob.size);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('add-page-numbers-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Page numbering error:', err);
      setErrorMsg(err.message || 'Failed to add page numbers to PDF.');
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
    setErrorMsg('');
  };

  const positionGridButtons = [
    { id: 'top-left', label: '↖ Top Left' },
    { id: 'top-center', label: '↑ Top Center' },
    { id: 'top-right', label: '↗ Top Right' },
    { id: 'bottom-left', label: '↙ Bottom Left' },
    { id: 'bottom-center', label: '↓ Bottom Center' },
    { id: 'bottom-right', label: '↘ Bottom Right' }
  ];

  const currentPreviewLabel = getPageLabelText(currentPage);

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
            <Hash className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser Numbering
            </span>
            <span>•</span>
            <span>Single &amp; Facing Pages Format</span>
            <span>•</span>
            <span>Custom Positions &amp; Ranges</span>
          </div>
        </div>
      )}

      {/* ── 2. LOADING STATE ───────────────────────────────── */}
      {status === 'loading_file' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {progressText || 'Reading PDF pages...'}
          </p>
        </div>
      )}

      {/* ── 3. INTERACTIVE WORKSPACE (iLovePDF Style) ───────── */}
      {status === 'idle' && file && totalPages > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* ── LEFT: LIVE INTERACTIVE PREVIEW CANVAS (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Page & Zoom Navigator Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Page <span className="text-blue-600 font-black">{currentPage}</span> of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-zinc-500 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-Res Canvas with Dynamic Live Page Number Overlay */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[520px] overflow-auto select-none">
              
              <div
                ref={canvasContainerRef}
                className="relative shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 inline-block"
              >
                {/* Real PDF Canvas */}
                <canvas ref={pdfCanvasRef} className="block max-w-full h-auto pointer-events-none" />

                {/* ── LIVE PAGE NUMBER OVERLAY ───────────────── */}
                {currentPreviewLabel && (
                  <div
                    className="absolute pointer-events-none transition-all duration-150 px-2 py-0.5 rounded bg-blue-600/10 border border-blue-500/30"
                    style={getPositionStyles(currentPage)}
                  >
                    <span
                      style={{
                        color: textColor,
                        fontSize: `${fontSize * zoomLevel}px`,
                        fontWeight: isBold ? 'bold' : 'normal',
                        fontStyle: isItalic ? 'italic' : 'normal',
                        fontFamily: fontFamily === 'Times' ? 'Times New Roman, serif' : fontFamily === 'Courier' ? 'Courier New, monospace' : 'Helvetica, Arial, sans-serif'
                      }}
                      className="whitespace-nowrap font-bold"
                    >
                      {currentPreviewLabel}
                    </span>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ── RIGHT: ILovePDF-STYLE OPTIONS SIDEBAR (4 Cols) ─ */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            {/* File Info */}
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

            {/* Page Numbering Options Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              {/* Mode Switcher: Single page vs Facing pages */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Page Mode:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E]">
                  <button
                    type="button"
                    onClick={() => setMode('single')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'single'
                        ? 'bg-white dark:bg-[#2A2E45] text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Single page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('facing')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'facing'
                        ? 'bg-white dark:bg-[#2A2E45] text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Facing pages</span>
                  </button>
                </div>
              </div>

              {/* Position Grid */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Position:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {positionGridButtons.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosition(p.id)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center ${
                        position === p.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Format */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Format:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="formatType"
                      checked={formatType === 'page-n-of-total'}
                      onChange={() => setFormatType('page-n-of-total')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Page 1 of {totalPages}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="formatType"
                      checked={formatType === 'page-n'}
                      onChange={() => setFormatType('page-n')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      1 (Number only)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="formatType"
                      checked={formatType === 'custom'}
                      onChange={() => setFormatType('custom')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Custom Format
                    </span>
                  </label>

                  {formatType === 'custom' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={customFormatText}
                        placeholder="e.g. - {n} - or Page {n}"
                        onChange={(e) => setCustomFormatText(e.target.value)}
                        className="w-full text-xs rounded-xl px-3 py-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pages to number range */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Pages to number:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">From Page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={fromPage}
                      onChange={(e) => setFromPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full text-xs rounded-xl p-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">To Page:</span>
                    <input
                      type="number"
                      min={fromPage}
                      max={totalPages}
                      value={toPage}
                      onChange={(e) => setToPage(Math.min(totalPages, parseInt(e.target.value, 10) || totalPages))}
                      className="w-full text-xs rounded-xl p-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1">Font:</span>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full text-xs rounded-lg p-1.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold"
                    >
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times">Times New Roman</option>
                      <option value="Courier">Courier</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1">Size ({fontSize}px):</span>
                    <input
                      type="range"
                      min="9"
                      max="22"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 mt-1"
                    />
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-zinc-500">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {colorPalette.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTextColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border border-white shadow-xs transition-transform ${
                          textColor === c ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Big Action Button */}
              <button
                type="button"
                onClick={handleAddPageNumbers}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add page numbers</span>
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
              Adding page numbers to your PDF...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Embedding custom numbering across pages...'}
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
              Page numbers have been added!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Your document pages have been numbered according to your exact specifications.
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
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Numbered PDF</span>
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
                title="Numbered PDF Preview"
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
              <span>Number another PDF document</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
