import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Type, Image as ImageIcon, Square, Circle,
  Edit2, Trash2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Eye, Undo, Redo, Move, Palette, Bold, Italic, Layers, Plus
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
    script.onerror = () => reject(new Error('Failed to load PDF engine.'));
    document.body.appendChild(script);
  });
};

export default function EditPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageThumbnails, setPageThumbnails] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Active Tool: 'select' | 'text' | 'image' | 'draw' | 'rect' | 'circle'
  const [activeTool, setActiveTool] = useState('select');

  // Styling & Options
  const [selectedColor, setSelectedColor] = useState('#EF4444');
  const [fontSize, setFontSize] = useState(18);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [shapeFill, setShapeFill] = useState('rgba(239, 68, 68, 0.2)');

  // Annotations per page: { [pageNum]: Array<Element> }
  // Element types:
  // - text: { id, type: 'text', x, y, text, color, fontSize, isBold, isItalic, w, h }
  // - image: { id, type: 'image', x, y, w, h, dataUrl, imgObj }
  // - rect: { id, type: 'rect', x, y, w, h, strokeColor, fillColor, strokeWidth }
  // - circle: { id, type: 'circle', x, y, w, h, strokeColor, fillColor, strokeWidth }
  // - draw: { id, type: 'draw', points: [{x, y}], strokeColor, strokeWidth }
  const [annotations, setAnnotations] = useState({});
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Freehand Drawing State
  const [currentDrawPath, setCurrentDrawPath] = useState(null);

  // Element Dragging State
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    '#000000', '#EF4444', '#3B82F6', '#10B981',
    '#F59E0B', '#8B5CF6', '#EC4899', '#FFFFFF'
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
    setProgressText('Loading PDF editor...');

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

      const initialAnnotations = {};
      for (let i = 1; i <= count; i++) {
        initialAnnotations[i] = [];
      }
      setAnnotations(initialAnnotations);

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
      setErrorMsg('Failed to open PDF document. It may be password-protected or corrupted.');
      setFile(null);
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (pdfDocRef.current && status === 'idle' && file) {
      renderCurrentPage(pdfDocRef.current, currentPage, zoomLevel);
    }
  }, [currentPage, zoomLevel, renderCurrentPage, status, file]);

  /* ── Canvas Click to Add Elements ─────────────────────── */
  const handleCanvasClick = (e) => {
    if (activeTool === 'select' || activeTool === 'draw') return;
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    if (activeTool === 'text') {
      const newText = {
        id: newId,
        type: 'text',
        x: Math.min(85, Math.max(2, x)),
        y: Math.min(90, Math.max(2, y)),
        text: 'Type your text here...',
        color: selectedColor,
        fontSize: fontSize,
        isBold: isBold,
        isItalic: isItalic
      };
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newText]
      }));
      setSelectedElementId(newId);
      setActiveTool('select');
    } else if (activeTool === 'rect') {
      const newRect = {
        id: newId,
        type: 'rect',
        x: Math.min(80, Math.max(2, x)),
        y: Math.min(80, Math.max(2, y)),
        w: 25,
        h: 15,
        strokeColor: selectedColor,
        fillColor: shapeFill,
        strokeWidth: lineWidth
      };
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newRect]
      }));
      setSelectedElementId(newId);
      setActiveTool('select');
    } else if (activeTool === 'circle') {
      const newCircle = {
        id: newId,
        type: 'circle',
        x: Math.min(80, Math.max(2, x)),
        y: Math.min(80, Math.max(2, y)),
        w: 20,
        h: 20,
        strokeColor: selectedColor,
        fillColor: shapeFill,
        strokeWidth: lineWidth
      };
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newCircle]
      }));
      setSelectedElementId(newId);
      setActiveTool('select');
    }
  };

  /* ── Freehand Drawing Handlers ────────────────────────── */
  const handleMouseDownDrawing = (e) => {
    if (activeTool !== 'draw') return;
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentDrawPath({
      id: `draw-${Date.now()}`,
      type: 'draw',
      points: [{ x, y }],
      strokeColor: selectedColor,
      strokeWidth: lineWidth
    });
  };

  const handleMouseMoveDrawing = (e) => {
    if (activeTool !== 'draw' || !currentDrawPath) return;
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentDrawPath(prev => ({
      ...prev,
      points: [...prev.points, { x, y }]
    }));
  };

  const handleMouseUpDrawing = () => {
    if (activeTool === 'draw' && currentDrawPath && currentDrawPath.points.length > 1) {
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), currentDrawPath]
      }));
    }
    setCurrentDrawPath(null);
  };

  /* ── Image Upload Placement ───────────────────────────── */
  const handleImageUpload = (e) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      const newImage = {
        id: `img-${Date.now()}`,
        type: 'image',
        x: 30,
        y: 30,
        w: 30,
        h: 25,
        dataUrl: dataUrl,
        file: imgFile
      };
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newImage]
      }));
      setSelectedElementId(newImage.id);
      setActiveTool('select');
    };
    reader.readAsDataURL(imgFile);
  };

  /* ── Element Selection & Dragging ─────────────────────── */
  const handleElementMouseDown = (e, elementId) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const el = (annotations[currentPage] || []).find(it => it.id === elementId);
    if (!el) return;

    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setDragOffset({
      x: clickXPercent - el.x,
      y: clickYPercent - el.y
    });
    setIsDraggingElement(true);
  };

  const handleMouseMoveGlobal = useCallback((e) => {
    if (!isDraggingElement || !selectedElementId || !canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const nextX = Math.max(0, Math.min(95, mouseXPercent - dragOffset.x));
    const nextY = Math.max(0, Math.min(95, mouseYPercent - dragOffset.y));

    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(el => {
        if (el.id === selectedElementId) {
          return { ...el, x: nextX, y: nextY };
        }
        return el;
      })
    }));
  }, [isDraggingElement, selectedElementId, dragOffset, currentPage]);

  const handleMouseUpGlobal = useCallback(() => {
    setIsDraggingElement(false);
  }, []);

  useEffect(() => {
    if (isDraggingElement) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isDraggingElement, handleMouseMoveGlobal, handleMouseUpGlobal]);

  /* ── Update Text / Properties ─────────────────────────── */
  const updateSelectedElement = (patch) => {
    if (!selectedElementId) return;
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(el => {
        if (el.id === selectedElementId) {
          return { ...el, ...patch };
        }
        return el;
      })
    }));
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(el => el.id !== selectedElementId)
    }));
    setSelectedElementId(null);
  };

  const selectedElement = (annotations[currentPage] || []).find(el => el.id === selectedElementId);

  /* ── Core PDF Export with PDF-Lib (Baking Changes) ────── */
  const handleSaveAndExportPdf = async () => {
    if (!file || totalPages === 0) return;

    setStatus('processing');
    setProgress(15);
    setProgressText('Embedding annotations into PDF...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const hexToRgb = (hex) => {
        const clean = hex.replace('#', '');
        const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
        const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
        const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
        return rgb(r, g, b);
      };

      for (let pIdx = 0; pIdx < pages.length; pIdx++) {
        const pNum = pIdx + 1;
        const page = pages[pIdx];
        const { width, height } = page.getSize();
        const pageElements = annotations[pNum] || [];

        const pct = 15 + Math.round(((pIdx + 1) / pages.length) * 70);
        setProgress(pct);
        setProgressText(`Writing elements on page ${pNum}...`);

        for (const el of pageElements) {
          if (el.type === 'text') {
            const pdfX = (el.x / 100) * width;
            const pdfY = height - ((el.y / 100) * height) - (el.fontSize || 16);
            const fontToUse = el.isBold ? helveticaBoldFont : helveticaFont;

            page.drawText(el.text || '', {
              x: pdfX,
              y: Math.max(0, pdfY),
              size: el.fontSize || 16,
              font: fontToUse,
              color: hexToRgb(el.color || '#000000')
            });
          } else if (el.type === 'image' && el.dataUrl) {
            try {
              const imgBytes = await (await fetch(el.dataUrl)).arrayBuffer();
              const isPng = el.dataUrl.includes('image/png');
              const embeddedImg = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);

              const pdfX = (el.x / 100) * width;
              const pdfW = (el.w / 100) * width;
              const pdfH = (el.h / 100) * height;
              const pdfY = height - ((el.y / 100) * height) - pdfH;

              page.drawImage(embeddedImg, {
                x: pdfX,
                y: Math.max(0, pdfY),
                width: pdfW,
                height: pdfH
              });
            } catch (imgErr) {
              console.warn('Image embedding error:', imgErr);
            }
          } else if (el.type === 'rect') {
            const pdfX = (el.x / 100) * width;
            const pdfW = (el.w / 100) * width;
            const pdfH = (el.h / 100) * height;
            const pdfY = height - ((el.y / 100) * height) - pdfH;

            page.drawRectangle({
              x: pdfX,
              y: Math.max(0, pdfY),
              width: pdfW,
              height: pdfH,
              borderColor: hexToRgb(el.strokeColor || '#EF4444'),
              borderWidth: el.strokeWidth || 2
            });
          } else if (el.type === 'circle') {
            const pdfX = ((el.x + el.w / 2) / 100) * width;
            const pdfY = height - (((el.y + el.h / 2) / 100) * height);
            const radius = (Math.min(el.w, el.h) / 200) * width;

            page.drawCircle({
              x: pdfX,
              y: Math.max(0, pdfY),
              size: radius,
              borderColor: hexToRgb(el.strokeColor || '#EF4444'),
              borderWidth: el.strokeWidth || 2
            });
          } else if (el.type === 'draw' && el.points && el.points.length > 1) {
            // Draw connected lines for freehand
            for (let i = 0; i < el.points.length - 1; i++) {
              const p1 = el.points[i];
              const p2 = el.points[i + 1];
              page.drawLine({
                start: { x: (p1.x / 100) * width, y: height - ((p1.y / 100) * height) },
                end: { x: (p2.x / 100) * width, y: height - ((p2.y / 100) * height) },
                thickness: el.strokeWidth || 2,
                color: hexToRgb(el.strokeColor || '#EF4444')
              });
            }
          }
        }
      }

      setProgress(90);
      setProgressText('Packaging edited PDF document...');

      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_edited.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(blob.size);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('edit-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('PDF Editing Save error:', err);
      setErrorMsg(err.message || 'Failed to apply edits to the PDF document.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setTotalPages(0);
    setCurrentPage(1);
    setAnnotations({});
    setSelectedElementId(null);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

  const totalAnnotationsCount = Object.values(annotations).reduce((sum, list) => sum + (list?.length || 0), 0);

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
            <Edit2 className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser Editor
            </span>
            <span>•</span>
            <span>Add Text, Images, Shapes &amp; Freehand Drawings</span>
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

      {/* ── 3. INTERACTIVE PDF EDITOR WORKSPACE (iLovePDF Style) */}
      {status === 'idle' && file && totalPages > 0 && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Primary Editing Toolbar (iLovePDF Look & Feel) */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30">
            
            {/* Tool Selection Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              
              <button
                type="button"
                onClick={() => setActiveTool('select')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'select'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                <span>Select / Move</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'text'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Add Text</span>
              </button>

              <button
                type="button"
                onClick={() => imageUploadInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Add Image</span>
              </button>

              <input
                ref={imageUploadInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />

              <button
                type="button"
                onClick={() => setActiveTool('draw')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'draw'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Draw / Pen</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('rect')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'rect'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Rectangle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('circle')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTool === 'circle'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Circle</span>
              </button>

            </div>

            {/* Color Palette & Styling Controls */}
            <div className="flex items-center gap-3">
              
              {/* Color Circles */}
              <div className="flex items-center gap-1">
                {colorPalette.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      if (selectedElement) updateSelectedElement({ color: c, strokeColor: c });
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-xs transition-transform cursor-pointer ${
                      selectedColor === c ? 'scale-125 ring-2 ring-red-500' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>

              {/* Font Size or Thickness */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1B1E2E] px-2 py-1 rounded-lg">
                <span className="text-[10px] font-bold text-zinc-500">Size:</span>
                <select
                  value={fontSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value, 10);
                    setFontSize(size);
                    if (selectedElement && selectedElement.type === 'text') {
                      updateSelectedElement({ fontSize: size });
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {[12, 14, 16, 18, 22, 26, 32, 40, 48].map(s => (
                    <option key={s} value={s}>{s}px</option>
                  ))}
                </select>
              </div>

              {/* Delete Selected Element */}
              {selectedElementId && (
                <button
                  type="button"
                  onClick={deleteSelectedElement}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                  title="Delete Selected Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Main 2-Column Editing Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── LEFT: THUMBNAIL STRIP & CANVAS (8 Cols) ─────── */}
            <div className="lg:col-span-8 space-y-3">
              
              {/* Page Navigator Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer"
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
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
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

              {/* Main Interactive PDF Page Canvas Workspace */}
              <div className="p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[520px] overflow-auto select-none">
                
                <div
                  ref={canvasContainerRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDownDrawing}
                  onMouseMove={handleMouseMoveDrawing}
                  onMouseUp={handleMouseUpDrawing}
                  className={`relative shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 inline-block ${
                    activeTool === 'draw' ? 'cursor-crosshair' : activeTool !== 'select' ? 'cursor-copy' : 'cursor-default'
                  }`}
                >
                  {/* Base High-Res PDF Layer */}
                  <canvas ref={pdfCanvasRef} className="block max-w-full h-auto pointer-events-none" />

                  {/* ── RENDER OVERLAY ELEMENTS ─────────────── */}
                  {(annotations[currentPage] || []).map((el) => {
                    const isSelected = selectedElementId === el.id;

                    if (el.type === 'text') {
                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                          className={`absolute p-1.5 rounded-md transition-shadow group ${
                            isSelected
                              ? 'border-2 border-dashed border-red-500 ring-2 ring-red-500/30 bg-white/40 shadow-md cursor-move'
                              : 'hover:border hover:border-red-400 cursor-pointer'
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            color: el.color || '#000000',
                            fontSize: `${el.fontSize || 18}px`,
                            fontWeight: el.isBold ? 'bold' : 'normal',
                            fontStyle: el.isItalic ? 'italic' : 'normal',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}
                        >
                          <input
                            type="text"
                            value={el.text}
                            onChange={(e) => updateSelectedElement({ text: e.target.value })}
                            className="bg-transparent border-none focus:outline-none font-inherit text-inherit min-w-[60px]"
                          />
                        </div>
                      );
                    }

                    if (el.type === 'image') {
                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                          className={`absolute p-1 rounded-md ${
                            isSelected
                              ? 'border-2 border-dashed border-red-500 ring-2 ring-red-500/30 bg-white/30 cursor-move'
                              : 'hover:border hover:border-red-400 cursor-pointer'
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.w}%`,
                            height: `${el.h}%`
                          }}
                        >
                          <img
                            src={el.dataUrl}
                            alt="Uploaded Stamp"
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        </div>
                      );
                    }

                    if (el.type === 'rect') {
                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                          className={`absolute rounded-xs ${
                            isSelected
                              ? 'ring-2 ring-red-500/50 cursor-move'
                              : 'cursor-pointer hover:opacity-90'
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.w}%`,
                            height: `${el.h}%`,
                            borderColor: el.strokeColor || '#EF4444',
                            borderWidth: `${el.strokeWidth || 2}px`,
                            borderStyle: 'solid',
                            backgroundColor: el.fillColor || 'transparent'
                          }}
                        />
                      );
                    }

                    if (el.type === 'circle') {
                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                          className={`absolute rounded-full ${
                            isSelected
                              ? 'ring-2 ring-red-500/50 cursor-move'
                              : 'cursor-pointer hover:opacity-90'
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.w}%`,
                            height: `${el.h}%`,
                            borderColor: el.strokeColor || '#EF4444',
                            borderWidth: `${el.strokeWidth || 2}px`,
                            borderStyle: 'solid',
                            backgroundColor: el.fillColor || 'transparent'
                          }}
                        />
                      );
                    }

                    if (el.type === 'draw' && el.points && el.points.length > 1) {
                      const svgPath = el.points.reduce((acc, pt, idx) => {
                        return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                      }, '');

                      return (
                        <svg
                          key={el.id}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                        >
                          <path
                            d={svgPath}
                            stroke={el.strokeColor || '#EF4444'}
                            strokeWidth={(el.strokeWidth || 3) * 0.15}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      );
                    }

                    return null;
                  })}

                  {/* Active Freehand Draw in Progress */}
                  {currentDrawPath && currentDrawPath.points.length > 1 && (
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <path
                        d={currentDrawPath.points.reduce((acc, pt, idx) => {
                          return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                        }, '')}
                        stroke={currentDrawPath.strokeColor || '#EF4444'}
                        strokeWidth={(currentDrawPath.strokeWidth || 3) * 0.15}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                </div>

              </div>

            </div>

            {/* ── RIGHT: SIDEBAR / PROPERTIES & ACTION (4 Cols) ─ */}
            <div className="lg:col-span-4 space-y-5 sticky top-20">
              
              {/* Document Info */}
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
                      {totalPages} pages • {totalAnnotationsCount} elements added
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

              {/* Element Properties Box (If item selected) */}
              {selectedElement && (
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-4 animate-fade-in">
                  
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      Edit Selected Element ({selectedElement.type})
                    </h4>
                    <button
                      type="button"
                      onClick={deleteSelectedElement}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedElement.type === 'text' && (
                    <div className="space-y-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-zinc-500">Text Content:</label>
                        <input
                          type="text"
                          value={selectedElement.text}
                          onChange={(e) => updateSelectedElement({ text: e.target.value })}
                          className="w-full text-xs rounded-xl px-3 py-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({ isBold: !selectedElement.isBold })}
                          className={`p-2 rounded-lg text-xs font-bold border ${
                            selectedElement.isBold ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700'
                          }`}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({ isItalic: !selectedElement.isItalic })}
                          className={`p-2 rounded-lg text-xs font-bold border ${
                            selectedElement.isItalic ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700'
                          }`}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Pages Quick Thumbnails Navigator */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-3">
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Page Navigator ({totalPages} Pages)
                </h4>

                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {pageThumbnails.map((p) => (
                    <button
                      key={p.pageNum}
                      type="button"
                      onClick={() => setCurrentPage(p.pageNum)}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
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
                        Page {p.pageNum}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Prominent Action Button */}
              <button
                type="button"
                onClick={handleSaveAndExportPdf}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Edit PDF</span>
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
              Applying edits to your PDF...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Embedding custom elements and fonts...'}
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
              PDF has been edited!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              All your text, images, shapes, and drawings have been permanently embedded.
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
              <span>Download Edited PDF</span>
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
                title="Edited PDF Preview"
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
              <span>Edit another PDF document</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
