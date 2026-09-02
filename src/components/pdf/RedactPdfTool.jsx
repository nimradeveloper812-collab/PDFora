import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Eye, Trash2, ShieldAlert, Crosshair, Move, Check, Plus
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

export default function RedactPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageThumbnails, setPageThumbnails] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Redaction Settings (iLovePDF Style)
  const [redactionMode, setRedactionMode] = useState('blackout'); // 'blackout' | 'whiteout' | 'custom'
  const [customColor, setCustomColor] = useState('#000000');
  const [overlayTextType, setOverlayTextType] = useState('none'); // 'none' | 'redacted' | 'confidential' | 'custom'
  const [customOverlayText, setCustomOverlayText] = useState('[REDACTED]');

  // Redaction boxes per page: { [pageNum]: [{ id, x, y, w, h }] } (stored in percentages 0-100)
  const [redactions, setRedactions] = useState({});
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  // Drawing new redaction box state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [activeDrawRect, setActiveDrawRect] = useState(null);

  // Moving / Resizing box state
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizingBox, setIsResizingBox] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [initialBoxRect, setInitialBoxRect] = useState(null);

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
    setProgressText('Loading PDF for redaction...');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const doc = await loadingTask.promise;

      pdfDocRef.current = doc;
      const count = doc.numPages;
      setTotalPages(count);
      setCurrentPage(1);

      const initialThumbs = Array.from({ length: count }, (_, i) => ({
        pageNum: i + 1,
        thumbnail: null
      }));
      setPageThumbnails(initialThumbs);

      const initialRedactions = {};
      for (let i = 1; i <= count; i++) {
        initialRedactions[i] = [];
      }
      setRedactions(initialRedactions);

      setStatus('idle');
      setTimeout(() => renderCurrentPage(doc, 1, zoomLevel), 50);

      // Async thumbnails
      for (let i = 1; i <= count; i++) {
        try {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPageThumbnails(prev => prev.map(p => p.pageNum === i ? { ...p, thumbnail: dataUrl } : p));
        } catch (tErr) {}
      }

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

  /* ── Interactive Drawing of Redaction Boxes ───────────── */
  const handleCanvasMouseDown = (e) => {
    // If clicking on an existing handle or box, ignore canvas draw
    if (e.target.closest('.redaction-box') || e.target.closest('.resize-handle')) {
      return;
    }

    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setActiveDrawRect({ x, y, w: 0, h: 0 });
    setSelectedBoxId(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !drawStart || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);

    setActiveDrawRect({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      w: Math.min(100 - x, w),
      h: Math.min(100 - y, h)
    });
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && activeDrawRect && activeDrawRect.w > 1.5 && activeDrawRect.h > 1) {
      const newBox = {
        id: `redact-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        x: activeDrawRect.x,
        y: activeDrawRect.y,
        w: activeDrawRect.w,
        h: activeDrawRect.h
      };

      setRedactions(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox]
      }));
      setSelectedBoxId(newBox.id);
    }
    setIsDrawing(false);
    setDrawStart(null);
    setActiveDrawRect(null);
  };

  /* ── Element Move / Dragging Handlers ─────────────────── */
  const handleBoxMouseDown = (e, boxId) => {
    e.stopPropagation();
    setSelectedBoxId(boxId);
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const box = (redactions[currentPage] || []).find(b => b.id === boxId);
    if (!box) return;

    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    setDragOffset({
      x: mouseX - box.x,
      y: mouseY - box.y
    });
    setIsDraggingBox(true);
  };

  const handleBoxResizeMouseDown = (e, boxId, handle) => {
    e.stopPropagation();
    setSelectedBoxId(boxId);
    if (!canvasContainerRef.current) return;

    const box = (redactions[currentPage] || []).find(b => b.id === boxId);
    if (!box) return;

    setResizeHandle(handle);
    setInitialBoxRect({ ...box, mouseStartX: e.clientX, mouseStartY: e.clientY });
    setIsResizingBox(true);
  };

  // Global mousemove for moving & resizing boxes
  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();

      if (isDraggingBox && selectedBoxId) {
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

        setRedactions(prev => ({
          ...prev,
          [currentPage]: (prev[currentPage] || []).map(b => {
            if (b.id !== selectedBoxId) return b;
            const nextX = Math.max(0, Math.min(100 - b.w, mouseX - dragOffset.x));
            const nextY = Math.max(0, Math.min(100 - b.h, mouseY - dragOffset.y));
            return { ...b, x: nextX, y: nextY };
          })
        }));
      }

      if (isResizingBox && selectedBoxId && initialBoxRect) {
        const deltaX = ((e.clientX - initialBoxRect.mouseStartX) / rect.width) * 100;
        const deltaY = ((e.clientY - initialBoxRect.mouseStartY) / rect.height) * 100;

        setRedactions(prev => ({
          ...prev,
          [currentPage]: (prev[currentPage] || []).map(b => {
            if (b.id !== selectedBoxId) return b;
            let { x, y, w, h } = initialBoxRect;

            if (resizeHandle.includes('e')) w = Math.max(2, w + deltaX);
            if (resizeHandle.includes('s')) h = Math.max(1, h + deltaY);
            if (resizeHandle.includes('w')) {
              const newW = Math.max(2, w - deltaX);
              x = x + (w - newW);
              w = newW;
            }
            if (resizeHandle.includes('n')) {
              const newH = Math.max(1, h - deltaY);
              y = y + (h - newH);
              h = newH;
            }

            return {
              ...b,
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
              w: Math.min(100 - x, w),
              h: Math.min(100 - y, h)
            };
          })
        }));
      }
    };

    const handleWindowMouseUp = () => {
      setIsDraggingBox(false);
      setIsResizingBox(false);
      setResizeHandle(null);
      setInitialBoxRect(null);
    };

    if (isDraggingBox || isResizingBox) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [isDraggingBox, isResizingBox, selectedBoxId, dragOffset, initialBoxRect, resizeHandle, currentPage]);

  const deleteBox = (boxId) => {
    setRedactions(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(b => b.id !== boxId)
    }));
    if (selectedBoxId === boxId) setSelectedBoxId(null);
  };

  const clearCurrentPageRedactions = () => {
    setRedactions(prev => ({
      ...prev,
      [currentPage]: []
    }));
    setSelectedBoxId(null);
  };

  /* ── Core PDF Redaction Execution with PDF-Lib ────────── */
  const handleApplyRedactions = async () => {
    if (!file || totalPages === 0) return;

    const totalCount = Object.values(redactions).reduce((sum, list) => sum + (list?.length || 0), 0);
    if (totalCount === 0) {
      setErrorMsg('Please draw at least one redaction box on the document first.');
      return;
    }

    setStatus('processing');
    setProgress(15);
    setProgressText('Preparing permanent redaction layer...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Color mapping
      let fillRgb = rgb(0, 0, 0); // Blackout
      let textRgb = rgb(1, 1, 1); // White text

      if (redactionMode === 'whiteout') {
        fillRgb = rgb(1, 1, 1);
        textRgb = rgb(0.2, 0.2, 0.2);
      } else if (redactionMode === 'custom') {
        const clean = customColor.replace('#', '');
        const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
        const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
        const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
        fillRgb = rgb(r, g, b);
      }

      // Label text
      let labelText = '';
      if (overlayTextType === 'redacted') labelText = '[REDACTED]';
      else if (overlayTextType === 'confidential') labelText = '[CONFIDENTIAL]';
      else if (overlayTextType === 'custom') labelText = customOverlayText;

      setProgress(40);
      setProgressText(`Baking redactions across pages...`);

      pages.forEach((page, idx) => {
        const pNum = idx + 1;
        const boxes = redactions[pNum] || [];
        if (boxes.length === 0) return;

        const { width, height } = page.getSize();

        boxes.forEach(box => {
          const pdfX = (box.x / 100) * width;
          const pdfW = (box.w / 100) * width;
          const pdfH = (box.h / 100) * height;
          const pdfY = height - ((box.y / 100) * height) - pdfH;

          // 1. Draw solid opaque rectangle over the content
          page.drawRectangle({
            x: pdfX,
            y: Math.max(0, pdfY),
            width: pdfW,
            height: pdfH,
            color: fillRgb,
            opacity: 1.0
          });

          // 2. Optionally draw label in center of redaction box
          if (labelText && pdfW > 30 && pdfH > 10) {
            const calculatedFontSize = Math.max(8, Math.min(14, pdfH * 0.5));
            const textWidth = font.widthOfTextAtSize(labelText, calculatedFontSize);

            if (textWidth < pdfW - 4) {
              const textX = pdfX + (pdfW - textWidth) / 2;
              const textY = pdfY + (pdfH - calculatedFontSize) / 2 + (calculatedFontSize * 0.15);

              page.drawText(labelText, {
                x: textX,
                y: textY,
                size: calculatedFontSize,
                font,
                color: textRgb
              });
            }
          }
        });
      });

      setProgress(85);
      setProgressText('Generating secure redacted PDF...');

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_redacted.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(blob.size);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('redact-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Redaction error:', err);
      setErrorMsg(err.message || 'Failed to apply redactions to PDF.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setTotalPages(0);
    setCurrentPage(1);
    setRedactions({});
    setSelectedBoxId(null);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

  const currentPageRedactions = redactions[currentPage] || [];
  const totalRedactionsCount = Object.values(redactions).reduce((sum, list) => sum + (list?.length || 0), 0);

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
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser Redaction
            </span>
            <span>•</span>
            <span>Permanently Blackout or Whiteout Sensitive Data</span>
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

      {/* ── 3. INTERACTIVE REDACTION WORKSPACE (iLovePDF Style) */}
      {status === 'idle' && file && totalPages > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* ── LEFT: INTERACTIVE CANVAS WITH DRAWING (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Top Toolbar: Navigator & Zoom */}
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

              {/* Instructions Tip */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <Crosshair className="w-3.5 h-3.5 text-red-500" />
                <span>Click and drag on the page to redact text or images</span>
              </div>

              {/* Zoom Controls */}
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

            {/* Main Interactive Canvas Area */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[520px] overflow-auto select-none">
              
              <div
                ref={canvasContainerRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="relative shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 inline-block cursor-crosshair"
              >
                {/* PDF Page Canvas */}
                <canvas ref={pdfCanvasRef} className="block max-w-full h-auto pointer-events-none" />

                {/* Existing Drawn Redaction Boxes on This Page */}
                {currentPageRedactions.map((box) => {
                  const isSelected = selectedBoxId === box.id;

                  return (
                    <div
                      key={box.id}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id)}
                      className={`redaction-box absolute transition-all select-none ${
                        isSelected
                          ? 'ring-2 ring-red-500 ring-offset-1 z-20 cursor-move'
                          : 'hover:ring-1 hover:ring-red-400 z-10 cursor-pointer'
                      }`}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                        backgroundColor: redactionMode === 'whiteout' ? '#ffffff' : redactionMode === 'custom' ? customColor : '#000000',
                        opacity: isSelected ? 0.95 : 0.88,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* Redaction Label in Box */}
                      <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none px-1">
                        <span
                          className={`text-[10px] font-black tracking-wider uppercase select-none ${
                            redactionMode === 'whiteout' ? 'text-zinc-600' : 'text-zinc-200'
                          }`}
                        >
                          {overlayTextType === 'redacted' ? '[REDACTED]' : overlayTextType === 'confidential' ? '[CONFIDENTIAL]' : overlayTextType === 'custom' ? customOverlayText : ''}
                        </span>
                      </div>

                      {/* Selected Box Controls: Delete & Resize Handles */}
                      {isSelected && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteBox(box.id); }}
                            className="absolute -top-7 right-0 p-1 rounded bg-zinc-900 text-white hover:text-red-400 shadow-md text-xs cursor-pointer z-30 flex items-center gap-1"
                            title="Delete this redaction box"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* 4 Corner Resize Handles */}
                          <div
                            onMouseDown={(e) => handleBoxResizeMouseDown(e, box.id, 'nw')}
                            className="resize-handle absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-600 border border-white rounded-xs cursor-nwse-resize z-30"
                          />
                          <div
                            onMouseDown={(e) => handleBoxResizeMouseDown(e, box.id, 'ne')}
                            className="resize-handle absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-600 border border-white rounded-xs cursor-nesw-resize z-30"
                          />
                          <div
                            onMouseDown={(e) => handleBoxResizeMouseDown(e, box.id, 'se')}
                            className="resize-handle absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-red-600 border border-white rounded-xs cursor-nwse-resize z-30"
                          />
                          <div
                            onMouseDown={(e) => handleBoxResizeMouseDown(e, box.id, 'sw')}
                            className="resize-handle absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-red-600 border border-white rounded-xs cursor-nesw-resize z-30"
                          />
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Active Drawing Box Ghost */}
                {isDrawing && activeDrawRect && (
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none z-30"
                    style={{
                      left: `${activeDrawRect.x}%`,
                      top: `${activeDrawRect.y}%`,
                      width: `${activeDrawRect.w}%`,
                      height: `${activeDrawRect.h}%`
                    }}
                  />
                )}

              </div>

            </div>

          </div>

          {/* ── RIGHT: REDACTION OPTIONS SIDEBAR (4 Cols) ───── */}
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
                    {totalPages} pages • {totalRedactionsCount} redactions placed
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

            {/* Redaction Settings Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              {/* Style Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Redaction Style:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E]">
                  <button
                    type="button"
                    onClick={() => setRedactionMode('blackout')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      redactionMode === 'blackout'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <span>Blackout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedactionMode('whiteout')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      redactionMode === 'whiteout'
                        ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <span>Whiteout</span>
                  </button>
                </div>
              </div>

              {/* Overlay Label Text */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Overlay Text Label (Optional):
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="overlayTextType"
                      checked={overlayTextType === 'none'}
                      onChange={() => setOverlayTextType('none')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      No text (Solid color block)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="overlayTextType"
                      checked={overlayTextType === 'redacted'}
                      onChange={() => setOverlayTextType('redacted')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      [REDACTED]
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                    <input
                      type="radio"
                      name="overlayTextType"
                      checked={overlayTextType === 'confidential'}
                      onChange={() => setOverlayTextType('confidential')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      [CONFIDENTIAL]
                    </span>
                  </label>
                </div>
              </div>

              {/* Redaction List Counter & Clear */}
              <div className="pt-2 border-t border-zinc-100 dark:border-[#2A2E45] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {currentPageRedactions.length} on page {currentPage}
                </span>
                {currentPageRedactions.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCurrentPageRedactions}
                    className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Clear Page {currentPage}
                  </button>
                )}
              </div>

              {/* Pages Quick Thumbnails Navigator */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45] text-left">
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                  Navigate Pages ({totalPages}):
                </span>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                  {pageThumbnails.map((p) => {
                    const countOnP = (redactions[p.pageNum] || []).length;
                    return (
                      <button
                        key={p.pageNum}
                        type="button"
                        onClick={() => setCurrentPage(p.pageNum)}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                          currentPage === p.pageNum
                            ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/50 dark:bg-red-950/20'
                            : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-zinc-100 dark:bg-[#1B1E2E] rounded-lg overflow-hidden mb-1 flex items-center justify-center">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={`Page ${p.pageNum}`} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] font-bold text-zinc-400">P.{p.pageNum}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                          P.{p.pageNum}
                        </span>
                        {countOnP > 0 && (
                          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center shadow-xs">
                            {countOnP}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Big Action Button */}
              <button
                type="button"
                onClick={handleApplyRedactions}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Redact PDF</span>
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
              Applying permanent redactions...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Blacking out selected sensitive areas...'}
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
              PDF has been redacted!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              All chosen text, images, and numbers have been permanently blackened out and erased.
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
              <span>Download Redacted PDF</span>
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
                title="Redacted PDF Preview"
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
              <span>Redact another PDF document</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
