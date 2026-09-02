import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Type, Image as ImageIcon, RotateCw, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Eye, Grid, Sliders, Layers, Check
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
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

export default function WatermarkPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Watermark Settings (iLovePDF Style)
  const [watermarkType, setWatermarkType] = useState('text'); // 'text' | 'image'
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [fontSize, setFontSize] = useState(48);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [textColor, setTextColor] = useState('#EF4444');
  
  // Image Watermark
  const [imageFile, setImageFile] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);

  // Layout & Styling
  const [position, setPosition] = useState('center'); // 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  const [isMosaic, setIsMosaic] = useState(false); // Repeat across page
  const [rotation, setRotation] = useState(45); // 0, 45, 90, 180, 270 or custom
  const [opacity, setOpacity] = useState(30); // 10 to 100%

  // Scope
  const [scope, setScope] = useState('all'); // 'all' | 'custom'
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
  const imageUploadInputRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const pdfDocRef = useRef(null);

  const colorPalette = [
    '#EF4444', '#000000', '#2563EB', '#10B981',
    '#F59E0B', '#8B5CF6', '#64748B', '#DC2626'
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
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setCustomPagesText(`1-${doc.numPages}`);
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

  /* ── Handle Image Watermark Upload ────────────────────── */
  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target?.result);
      setWatermarkType('image');
    };
    reader.readAsDataURL(f);
  };

  /* ── Position Helpers for CSS Overlay ─────────────────── */
  const getPositionStyles = () => {
    const map = {
      'top-left': { top: '10%', left: '10%', transform: 'translate(0, 0)' },
      'top-center': { top: '10%', left: '50%', transform: 'translate(-50%, 0)' },
      'top-right': { top: '10%', right: '10%', transform: 'translate(0, 0)' },
      'middle-left': { top: '50%', left: '10%', transform: 'translate(0, -50%)' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'middle-right': { top: '50%', right: '10%', transform: 'translate(0, -50%)' },
      'bottom-left': { bottom: '10%', left: '10%', transform: 'translate(0, 0)' },
      'bottom-center': { bottom: '10%', left: '50%', transform: 'translate(-50%, 0)' },
      'bottom-right': { bottom: '10%', right: '10%', transform: 'translate(0, 0)' }
    };
    return map[position] || map['center'];
  };

  /* ── Core Watermark Execution with PDF-Lib ────────────── */
  const handleApplyWatermark = async () => {
    if (!file || totalPages === 0) return;

    setStatus('processing');
    setProgress(15);
    setProgressText('Preparing watermark overlay...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      let targetPagesSet = new Set();
      if (scope === 'all') {
        for (let i = 1; i <= totalPages; i++) targetPagesSet.add(i);
      } else {
        targetPagesSet = parsePageNumbers(customPagesText, totalPages);
      }

      if (targetPagesSet.size === 0) {
        throw new Error('Please select at least one page for the watermark.');
      }

      const hexToRgb = (hex) => {
        const clean = hex.replace('#', '');
        const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
        const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
        const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
        return rgb(r, g, b);
      };

      let embeddedImage = null;
      if (watermarkType === 'image' && imageDataUrl) {
        const imgBytes = await (await fetch(imageDataUrl)).arrayBuffer();
        embeddedImage = imageDataUrl.includes('image/png')
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);
      }

      let fontToUse = await pdfDoc.embedFont(StandardFonts.Helvetica);
      if (fontFamily === 'Times') fontToUse = await pdfDoc.embedFont(isBold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman);
      else if (fontFamily === 'Courier') fontToUse = await pdfDoc.embedFont(isBold ? StandardFonts.CourierBold : StandardFonts.Courier);
      else fontToUse = await pdfDoc.embedFont(isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);

      setProgress(40);
      setProgressText(`Applying watermark to ${targetPagesSet.size} pages...`);

      pages.forEach((page, idx) => {
        const pNum = idx + 1;
        if (!targetPagesSet.has(pNum)) return;

        const { width, height } = page.getSize();
        const opacityRatio = opacity / 100;
        const rotDegrees = degrees(rotation);

        if (isMosaic) {
          // Repeat in a 3x3 grid across the whole page
          const rows = 3;
          const cols = 3;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const xPos = (width / cols) * c + (width / (cols * 2));
              const yPos = (height / rows) * r + (height / (rows * 2));

              if (watermarkType === 'text') {
                page.drawText(watermarkText || 'CONFIDENTIAL', {
                  x: xPos - (fontSize * 1.5),
                  y: yPos,
                  size: fontSize * 0.7,
                  font: fontToUse,
                  color: hexToRgb(textColor),
                  opacity: opacityRatio,
                  rotate: rotDegrees
                });
              } else if (embeddedImage) {
                const imgW = width * 0.25;
                const imgH = (imgW / embeddedImage.width) * embeddedImage.height;
                page.drawImage(embeddedImage, {
                  x: xPos - imgW / 2,
                  y: yPos - imgH / 2,
                  width: imgW,
                  height: imgH,
                  opacity: opacityRatio,
                  rotate: rotDegrees
                });
              }
            }
          }
        } else {
          // Calculate single position based on 9-point grid
          let targetX = width / 2;
          let targetY = height / 2;

          if (position.includes('left')) targetX = width * 0.2;
          else if (position.includes('right')) targetX = width * 0.8;

          if (position.includes('top')) targetY = height * 0.85;
          else if (position.includes('bottom')) targetY = height * 0.15;

          if (watermarkType === 'text') {
            const textW = fontToUse.widthOfTextAtSize(watermarkText || 'CONFIDENTIAL', fontSize);
            page.drawText(watermarkText || 'CONFIDENTIAL', {
              x: targetX - (textW / 2) * Math.cos((rotation * Math.PI) / 180),
              y: targetY - (textW / 2) * Math.sin((rotation * Math.PI) / 180),
              size: fontSize,
              font: fontToUse,
              color: hexToRgb(textColor),
              opacity: opacityRatio,
              rotate: rotDegrees
            });
          } else if (embeddedImage) {
            const imgW = width * 0.4;
            const imgH = (imgW / embeddedImage.width) * embeddedImage.height;
            page.drawImage(embeddedImage, {
              x: targetX - imgW / 2,
              y: targetY - imgH / 2,
              width: imgW,
              height: imgH,
              opacity: opacityRatio,
              rotate: rotDegrees
            });
          }
        }
      });

      setProgress(85);
      setProgressText('Compiling watermarked PDF...');

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_watermarked.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(blob.size);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('watermark-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Watermark error:', err);
      setErrorMsg(err.message || 'Failed to apply watermark to PDF.');
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
    setImageFile(null);
    setImageDataUrl(null);
    setErrorMsg('');
  };

  const positionButtons = [
    { id: 'top-left', label: '↖' },
    { id: 'top-center', label: '↑' },
    { id: 'top-right', label: '↗' },
    { id: 'middle-left', label: '←' },
    { id: 'center', label: '•' },
    { id: 'middle-right', label: '→' },
    { id: 'bottom-left', label: '↙' },
    { id: 'bottom-center', label: '↓' },
    { id: 'bottom-right', label: '↘' }
  ];

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
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser Watermarking
            </span>
            <span>•</span>
            <span>Text &amp; Image Watermarks with 9-Grid Positions</span>
            <span>•</span>
            <span>Zero File Limits</span>
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

      {/* ── 3. INTERACTIVE WATERMARK WORKSPACE (iLovePDF Style) */}
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
                  Page <span className="text-red-600 font-black">{currentPage}</span> of {totalPages}
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

            {/* High-Res Canvas with Dynamic Live Watermark Overlay */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[520px] overflow-auto select-none">
              
              <div
                ref={canvasContainerRef}
                className="relative shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 inline-block"
              >
                {/* Real PDF Canvas */}
                <canvas ref={pdfCanvasRef} className="block max-w-full h-auto pointer-events-none" />

                {/* ── LIVE WATERMARK SIMULATION OVERLAY ─────── */}
                {isMosaic ? (
                  /* Mosaic Repeat Grid */
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none p-4">
                    {Array.from({ length: 9 }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-center overflow-hidden">
                        {watermarkType === 'text' ? (
                          <span
                            style={{
                              color: textColor,
                              fontSize: `${fontSize * 0.45 * zoomLevel}px`,
                              fontWeight: isBold ? 'bold' : 'normal',
                              fontStyle: isItalic ? 'italic' : 'normal',
                              opacity: opacity / 100,
                              transform: `rotate(${rotation}deg)`,
                              fontFamily: fontFamily === 'Times' ? 'Times New Roman, serif' : fontFamily === 'Courier' ? 'Courier New, monospace' : 'Helvetica, Arial, sans-serif'
                            }}
                            className="whitespace-nowrap select-none font-black tracking-wider"
                          >
                            {watermarkText || 'CONFIDENTIAL'}
                          </span>
                        ) : imageDataUrl ? (
                          <img
                            src={imageDataUrl}
                            alt="Watermark Logo"
                            style={{
                              opacity: opacity / 100,
                              transform: `rotate(${rotation}deg)`,
                              maxWidth: '70%',
                              maxHeight: '70%'
                            }}
                            className="object-contain select-none"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Single 9-Point Positioned Overlay */
                  <div
                    className="absolute pointer-events-none flex items-center justify-center transition-all duration-150"
                    style={getPositionStyles()}
                  >
                    {watermarkType === 'text' ? (
                      <span
                        style={{
                          color: textColor,
                          fontSize: `${fontSize * 0.75 * zoomLevel}px`,
                          fontWeight: isBold ? 'bold' : 'normal',
                          fontStyle: isItalic ? 'italic' : 'normal',
                          opacity: opacity / 100,
                          transform: `rotate(${rotation}deg)`,
                          fontFamily: fontFamily === 'Times' ? 'Times New Roman, serif' : fontFamily === 'Courier' ? 'Courier New, monospace' : 'Helvetica, Arial, sans-serif'
                        }}
                        className="whitespace-nowrap select-none font-black tracking-wider"
                      >
                        {watermarkText || 'CONFIDENTIAL'}
                      </span>
                    ) : imageDataUrl ? (
                      <img
                        src={imageDataUrl}
                        alt="Watermark Stamp"
                        style={{
                          opacity: opacity / 100,
                          transform: `rotate(${rotation}deg)`,
                          maxWidth: `${180 * zoomLevel}px`,
                          maxHeight: `${140 * zoomLevel}px`
                        }}
                        className="object-contain select-none"
                      />
                    ) : (
                      <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                        Please upload an image
                      </span>
                    )}
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

            {/* Watermark Options Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              {/* Type Switcher: Text vs Image */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E]">
                <button
                  type="button"
                  onClick={() => setWatermarkType('text')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    watermarkType === 'text'
                      ? 'bg-white dark:bg-[#2A2E45] text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Place text</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWatermarkType('image');
                    if (!imageDataUrl) imageUploadInputRef.current?.click();
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    watermarkType === 'image'
                      ? 'bg-white dark:bg-[#2A2E45] text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Place image</span>
                </button>
              </div>

              <input
                ref={imageUploadInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* ── TEXT WATERMARK CONFIG ───────────────────── */}
              {watermarkType === 'text' && (
                <div className="space-y-3 animate-fade-in text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Watermark Text:
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      placeholder="e.g. CONFIDENTIAL, DRAFT"
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full text-xs rounded-xl px-3 py-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Font, Size & Colors */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500">Font:</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full text-xs rounded-lg p-1.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold"
                      >
                        <option value="Helvetica">Helvetica / Arial</option>
                        <option value="Times">Times New Roman</option>
                        <option value="Courier">Courier Monospace</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500">Font Size ({fontSize}px):</label>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-red-600 mt-2"
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">Color:</label>
                    <div className="flex items-center gap-1.5">
                      {colorPalette.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border border-white shadow-xs transition-transform ${
                            textColor === c ? 'scale-125 ring-2 ring-red-500' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── IMAGE WATERMARK CONFIG ──────────────────── */}
              {watermarkType === 'image' && (
                <div className="space-y-3 animate-fade-in text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Stamp / Logo Image:
                    </label>
                    {imageDataUrl ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E]">
                        <img src={imageDataUrl} alt="Preview" className="h-10 max-w-[100px] object-contain" />
                        <button
                          type="button"
                          onClick={() => imageUploadInputRef.current?.click()}
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageUploadInputRef.current?.click()}
                        className="w-full py-3 rounded-xl border border-dashed border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload Logo or Stamp</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── 9-POINT POSITION MATRIX ─────────────────── */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Position on Page:
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMosaic}
                      onChange={(e) => setIsMosaic(e.target.checked)}
                      className="w-3.5 h-3.5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span>Tile / Mosaic Grid</span>
                  </label>
                </div>

                {!isMosaic && (
                  <div className="grid grid-cols-3 gap-1.5 max-w-[160px] mx-auto p-2 rounded-2xl bg-zinc-100 dark:bg-[#1B1E2E]">
                    {positionButtons.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPosition(p.id)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          position === p.id
                            ? 'bg-red-600 text-white shadow-xs scale-105'
                            : 'bg-white dark:bg-[#2A2E45] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                        title={p.id}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── ROTATION & OPACITY SLIDERS ──────────────── */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    <span>Rotation:</span>
                    <span className="font-mono text-red-600">{rotation}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 45, 90, 180, 270].map(deg => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setRotation(deg)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                          rotation === deg ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-100 dark:bg-[#1B1E2E] border-zinc-200'
                        }`}
                      >
                        {deg === 45 ? '45° (Diag)' : `${deg}°`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    <span>Transparency (Opacity):</span>
                    <span className="font-mono text-red-600">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>

              {/* Big Action Button */}
              <button
                type="button"
                onClick={handleApplyWatermark}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add Watermark</span>
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
              Adding watermark to your PDF...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Stamping watermark across pages...'}
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
              PDF has been watermarked!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              The watermark has been permanently applied to all requested pages.
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
              <span>Download Watermarked PDF</span>
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
                title="Watermarked PDF Preview"
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
              <span>Watermark another PDF document</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
