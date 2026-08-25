import React, { useState, useRef, useEffect } from 'react';
import {
  Type, Edit2, Square, Eraser, Download, Eye, RefreshCw,
  ChevronLeft, ChevronRight, Check, AlertCircle, FileText,
  Sliders, Trash2, ArrowRight, Sparkles, Undo, Redo
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function EditPdfTool() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'processing' | 'completed'
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTool, setActiveTool] = useState('text'); // 'text' | 'pen' | 'rect' | 'eraser'

  // Text options
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(18);

  // Pen options
  const [penColor, setPenColor] = useState('#EF4444');
  const [penWidth, setPenWidth] = useState(3);

  // Rect options
  const [rectFill, setRectFill] = useState('rgba(255, 235, 59, 0.4)'); // Highlight yellow default

  // Per-page annotations state
  // annotations[pageIndex] = { textItems: [{id, x, y, text, color, fontSize}], drawingDataUrl: null, rects: [{id, x, y, w, h, fill}] }
  const [annotations, setAnnotations] = useState({});

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);

  const fileInputRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const pdfDocJsRef = useRef(null);

  // Colors preset
  const colorPresets = [
    '#000000', '#6C3FFC', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#FFFFFF'
  ];

  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        } catch (e) {}
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF viewer engine.'));
      document.body.appendChild(script);
    });
  };

  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    if (!incomingFile.name.endsWith('.pdf') && incomingFile.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setFile(incomingFile);
    setStatus('loading');
    setProgressText('Loading PDF pages for editing...');

    try {
      const buffer = await incomingFile.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const pdfDoc = await loadingTask.promise;

      pdfDocJsRef.current = pdfDoc;
      const count = pdfDoc.numPages;
      setNumPages(count);
      setCurrentPage(1);

      // Init empty annotations structure
      const initialAnn = {};
      for (let i = 1; i <= count; i++) {
        initialAnn[i] = { textItems: [], rects: [] };
      }
      setAnnotations(initialAnn);

      setStatus('ready');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load PDF. ' + (err.message || ''));
      setStatus('idle');
    }
  };

  // Render active page canvas and overlay whenever currentPage changes or status becomes ready
  useEffect(() => {
    if (status !== 'ready' || !pdfDocJsRef.current) return;

    let isMounted = true;
    const renderPage = async () => {
      try {
        const page = await pdfDocJsRef.current.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.25 });

        const pdfCanvas = pdfCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!pdfCanvas || !overlayCanvas) return;

        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        overlayCanvas.width = viewport.width;
        overlayCanvas.height = viewport.height;

        const ctx = pdfCanvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (isMounted) {
          redrawOverlay();
        }
      } catch (err) {
        console.warn('Page render error:', err);
      }
    };

    renderPage();
    return () => { isMounted = false; };
  }, [currentPage, status]);

  // Redraw freehand drawings & rect highlights on overlay canvas
  const redrawOverlay = () => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const pageAnn = annotations[currentPage];
    if (!pageAnn) return;

    // Draw rect highlights / whiteouts
    (pageAnn.rects || []).forEach(r => {
      ctx.fillStyle = r.fill;
      ctx.fillRect(r.x, r.y, r.w, r.h);
    });

    // Draw saved freehand canvas data if exists
    if (pageAnn.drawingDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = pageAnn.drawingDataUrl;
    }
  };

  useEffect(() => {
    if (status === 'ready') {
      redrawOverlay();
    }
  }, [annotations, currentPage]);

  // Mouse & Touch events on Overlay Canvas
  const handleOverlayMouseDown = (e) => {
    if (status !== 'ready') return;
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text') {
      const userText = prompt('Enter text to add at this location:', '');
      if (userText && userText.trim()) {
        const newItem = {
          id: 'txt_' + Date.now(),
          x,
          y,
          text: userText.trim(),
          color: textColor,
          fontSize: parseInt(fontSize, 10) || 18,
        };
        setAnnotations(prev => ({
          ...prev,
          [currentPage]: {
            ...prev[currentPage],
            textItems: [...(prev[currentPage]?.textItems || []), newItem]
          }
        }));
      }
      return;
    }

    if (activeTool === 'pen') {
      setIsDrawing(true);
      const ctx = overlay.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (activeTool === 'rect') {
      setIsDrawing(true);
      setStartPos({ x, y });
    }
  };

  const handleOverlayMouseMove = (e) => {
    if (!isDrawing || status !== 'ready') return;
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = overlay.getContext('2d');

    if (activeTool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'rect' && startPos) {
      redrawOverlay();
      ctx.fillStyle = rectFill;
      ctx.fillRect(
        Math.min(startPos.x, x),
        Math.min(startPos.y, y),
        Math.abs(x - startPos.x),
        Math.abs(y - startPos.y)
      );
    }
  };

  const handleOverlayMouseUp = (e) => {
    if (!isDrawing || status !== 'ready') return;
    setIsDrawing(false);

    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    if (activeTool === 'pen') {
      // Save current drawing to data URL
      const dataUrl = overlay.toDataURL();
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: {
          ...prev[currentPage],
          drawingDataUrl: dataUrl
        }
      }));
    } else if (activeTool === 'rect' && startPos) {
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRect = {
        id: 'rect_' + Date.now(),
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        w: Math.abs(x - startPos.x),
        h: Math.abs(y - startPos.y),
        fill: rectFill
      };

      setAnnotations(prev => ({
        ...prev,
        [currentPage]: {
          ...prev[currentPage],
          rects: [...(prev[currentPage]?.rects || []), newRect]
        }
      }));
      setStartPos(null);
    }
  };

  const removeTextItem = (pageNo, itemId) => {
    setAnnotations(prev => ({
      ...prev,
      [pageNo]: {
        ...prev[pageNo],
        textItems: (prev[pageNo]?.textItems || []).filter(item => item.id !== itemId)
      }
    }));
  };

  const clearCurrentPageAnn = () => {
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: { textItems: [], rects: [], drawingDataUrl: null }
    }));
  };

  // Convert hex color to pdf-lib rgb
  const hexToPdfRgb = (hex) => {
    let clean = (hex || '#000000').replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2) || '00', 16) / 255;
    const g = parseInt(clean.substring(2, 4) || '00', 16) / 255;
    const b = parseInt(clean.substring(4, 6) || '00', 16) / 255;
    return rgb(r, g, b);
  };

  // Export & Save Edited PDF
  const handleSavePdf = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(15);
    setProgressText('Embedding edits and rendering new PDF...');
    setErrorMsg('');

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      const overlayCanvas = overlayCanvasRef.current;
      const canvasW = overlayCanvas ? overlayCanvas.width : 1;
      const canvasH = overlayCanvas ? overlayCanvas.height : 1;

      for (let i = 0; i < pages.length; i++) {
        const pageNo = i + 1;
        const page = pages[i];
        const { width: pdfW, height: pdfH } = page.getSize();
        const pageAnn = annotations[pageNo];

        if (!pageAnn) continue;

        const scaleX = pdfW / canvasW;
        const scaleY = pdfH / canvasH;

        // 1. Draw Rect Highlights / Cover Boxes
        if (pageAnn.rects && pageAnn.rects.length > 0) {
          pageAnn.rects.forEach(r => {
            const drawX = r.x * scaleX;
            const drawY = pdfH - (r.y + r.h) * scaleY;
            const drawW = r.w * scaleX;
            const drawH = r.h * scaleY;

            let rectColor = rgb(1, 0.92, 0.23); // Yellow highlight default
            let opacity = 0.45;

            if (r.fill.includes('0, 0, 0') || r.fill.includes('#000000')) {
              rectColor = rgb(0, 0, 0); // Blackout redaction
              opacity = 1.0;
            } else if (r.fill.includes('255, 255, 255') || r.fill.includes('#FFFFFF')) {
              rectColor = rgb(1, 1, 1); // Whiteout erase
              opacity = 1.0;
            }

            page.drawRectangle({
              x: drawX,
              y: drawY,
              width: drawW,
              height: drawH,
              color: rectColor,
              opacity: opacity
            });
          });
        }

        // 2. Draw Freehand Drawings
        if (pageAnn.drawingDataUrl) {
          try {
            const imgBytes = await fetch(pageAnn.drawingDataUrl).then(res => res.arrayBuffer());
            const embeddedImg = await pdfDoc.embedPng(imgBytes);
            page.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: pdfW,
              height: pdfH
            });
          } catch (imgErr) {
            console.warn('Failed to embed freehand drawing for page:', pageNo, imgErr);
          }
        }

        // 3. Draw Added Text Items
        if (pageAnn.textItems && pageAnn.textItems.length > 0) {
          pageAnn.textItems.forEach(t => {
            const drawX = t.x * scaleX;
            const drawY = pdfH - (t.y * scaleY) - (t.fontSize * 0.8);
            page.drawText(t.text, {
              x: drawX,
              y: drawY,
              size: t.fontSize * (pdfW / 600),
              font,
              color: hexToPdfRgb(t.color)
            });
          });
        }
      }

      setProgress(90);
      setProgressText('Compiling final PDF document...');
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultBlobUrl(url);
      setResultFilename(file.name.replace(/\.[^/.]+$/, '') + '_edited.pdf');
      setResultSize(blob.size);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save edited PDF. ' + (err.message || ''));
      setStatus('ready');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setNumPages(0);
    setCurrentPage(1);
    setAnnotations({});
    setErrorMsg('');
    setProgress(0);
    if (resultBlobUrl) {
      URL.revokeObjectURL(resultBlobUrl);
      setResultBlobUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {/* ── Status Banner / Completed View ───────────────────────── */}
      {status === 'completed' && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 shadow-lg animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
              PDF Edits Saved Successfully!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              {resultFilename} • {formatBytes(resultSize)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                if (e) e.preventDefault();
                if (!resultBlobUrl) return;
                const link = document.createElement('a');
                link.href = resultBlobUrl;
                link.download = resultFilename || 'edited_document.pdf';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => document.body.removeChild(link), 100);
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Edited PDF</span>
            </button>

            <button
              type="button"
              onClick={() => window.open(resultBlobUrl, '_blank')}
              className="px-5 py-3 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 text-xs sm:text-sm font-bold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Preview PDF</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Edit Another PDF
            </button>
          </div>
        </div>
      )}

      {/* ── Processing Bar ────────────────────────────────────────── */}
      {status === 'processing' && (
        <div className="p-8 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center space-y-4 shadow-md">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-purple-900 dark:text-purple-200">
              {progressText}
            </h4>
            <div className="w-full max-w-md mx-auto h-2 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── File Selection Screen (Idle) ─────────────────────────── */}
      {status === 'idle' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-10 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-3xl bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all text-center cursor-pointer space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
              Upload PDF to Edit Interactive Canvas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Click anywhere on pages to add text, draw freehand annotations, highlight text, whiteout, or redact content.
            </p>
          </div>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Select PDF Document</span>
          </button>
        </div>
      )}

      {/* ── Interactive Editor Workspace (Ready Mode) ───────────── */}
      {status === 'ready' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xl space-y-4">

          {/* ── Top Editor Toolbar ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            {/* Tool Selection Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTool === 'text'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Add Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTool === 'pen'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Draw Pen</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('rect')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTool === 'rect'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Highlight Box</span>
              </button>
            </div>

            {/* Tool Specific Controls */}
            {activeTool === 'text' && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-zinc-500">Color:</span>
                <div className="flex items-center gap-1">
                  {colorPresets.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTextColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border ${textColor === c ? 'ring-2 ring-purple-600 scale-110' : 'border-zinc-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-zinc-500 ml-2">Size:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="rounded-lg px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                >
                  <option value={12}>12px</option>
                  <option value={16}>16px</option>
                  <option value={20}>20px</option>
                  <option value={26}>26px</option>
                  <option value={36}>36px</option>
                </select>
              </div>
            )}

            {activeTool === 'pen' && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-zinc-500">Pen Color:</span>
                <div className="flex items-center gap-1">
                  {colorPresets.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPenColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border ${penColor === c ? 'ring-2 ring-purple-600 scale-110' : 'border-zinc-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-zinc-500 ml-2">Width:</span>
                <select
                  value={penWidth}
                  onChange={(e) => setPenWidth(parseInt(e.target.value, 10))}
                  className="rounded-lg px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                >
                  <option value={2}>Fine (2px)</option>
                  <option value={4}>Medium (4px)</option>
                  <option value={8}>Thick (8px)</option>
                </select>
              </div>
            )}

            {activeTool === 'rect' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-zinc-500">Preset:</span>
                <button
                  type="button"
                  onClick={() => setRectFill('rgba(255, 235, 59, 0.4)')}
                  className="px-2.5 py-1 rounded bg-yellow-200 text-yellow-900 text-[11px] font-bold border border-yellow-300"
                >
                  🟡 Highlight Yellow
                </button>
                <button
                  type="button"
                  onClick={() => setRectFill('rgba(0, 0, 0, 1)')}
                  className="px-2.5 py-1 rounded bg-black text-white text-[11px] font-bold"
                >
                  ⬛ Redact Black
                </button>
                <button
                  type="button"
                  onClick={() => setRectFill('rgba(255, 255, 255, 1)')}
                  className="px-2.5 py-1 rounded bg-white text-zinc-800 text-[11px] font-bold border border-zinc-300"
                >
                  ⬜ Whiteout Erase
                </button>
              </div>
            )}

            {/* Clear Page Annotations */}
            <button
              type="button"
              onClick={clearCurrentPageAnn}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Page Edits</span>
            </button>
          </div>

          {/* ── Page Navigation Bar ────────────────────────────────── */}
          <div className="flex items-center justify-between px-2 text-xs font-bold">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className={`p-1.5 rounded-lg border transition-colors ${
                  currentPage <= 1
                    ? 'opacity-40 cursor-not-allowed border-zinc-200'
                    : 'bg-zinc-100 hover:bg-purple-100 text-zinc-700 hover:text-purple-700 cursor-pointer border-zinc-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-zinc-900 dark:text-white">
                Page {currentPage} of {numPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                disabled={currentPage >= numPages}
                className={`p-1.5 rounded-lg border transition-colors ${
                  currentPage >= numPages
                    ? 'opacity-40 cursor-not-allowed border-zinc-200'
                    : 'bg-zinc-100 hover:bg-purple-100 text-zinc-700 hover:text-purple-700 cursor-pointer border-zinc-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-purple-600 font-bold">
              {activeTool === 'text' ? '💡 Click anywhere on page to type text' : activeTool === 'pen' ? '✏️ Drag mouse/touch to draw' : '📦 Drag mouse to draw highlight/cover box'}
            </div>
          </div>

          {/* ── Interactive Page Viewer Canvas Container ────────────── */}
          <div className="relative border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-auto max-h-[620px] bg-zinc-900 flex justify-center p-4">
            <div className="relative inline-block shadow-2xl bg-white rounded">
              {/* PDF Background Canvas */}
              <canvas ref={pdfCanvasRef} className="block rounded" />

              {/* Drawing & Highlight Overlay Canvas */}
              <canvas
                ref={overlayCanvasRef}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                className="absolute inset-0 cursor-crosshair rounded touch-none"
              />

              {/* Text Annotations Rendered Over Page */}
              {(annotations[currentPage]?.textItems || []).map(t => (
                <div
                  key={t.id}
                  style={{
                    position: 'absolute',
                    left: `${t.x}px`,
                    top: `${t.y}px`,
                    color: t.color,
                    fontSize: `${t.fontSize}px`,
                    fontWeight: 'bold',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    transform: 'translate(0, -50%)',
                  }}
                  className="group cursor-pointer select-none bg-white/40 px-1 rounded border border-dashed border-purple-400 hover:border-red-500"
                  title="Click trash icon to delete"
                >
                  <span>{t.text}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTextItem(currentPage, t.id);
                    }}
                    className="ml-1 text-[10px] text-red-600 font-bold bg-white rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom Save Action Bar ────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cancel &amp; Change File
            </button>

            <button
              type="button"
              onClick={handleSavePdf}
              className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save &amp; Download Edited PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
