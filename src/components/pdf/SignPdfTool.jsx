import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText, Download, UploadCloud, Trash2, Plus, Check, RefreshCw, AlertCircle,
  Eye, Edit3, Type, Image as ImageIcon, Calendar, CheckSquare, Sparkles,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Copy, Layers,
  RotateCw, ArrowRight, X, Lock, Move, MoveHorizontal, RotateCcw, ShieldCheck
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { analytics } from '../../services/analytics';

// Fonts list for typed handwriting signatures
const HANDWRITING_FONTS = [
  { name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { name: 'Great Vibes', family: "'Great Vibes', cursive" },
  { name: 'Caveat', family: "'Caveat', cursive" },
  { name: 'Pacifico', family: "'Pacifico', cursive" },
  { name: 'Satisfy', family: "'Satisfy', cursive" },
  { name: 'Alex Brush', family: "'Alex Brush', cursive" }
];

export default function SignPdfTool() {
  // File & PDF states
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'processing' | 'completed'
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesMeta, setPagesMeta] = useState([]); // [{ width, height }]
  const [pageThumbnails, setPageThumbnails] = useState([]);
  const [zoom, setZoom] = useState(1.0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Saved palette items
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [savedInitials, setSavedInitials] = useState([]);

  // Placed elements on PDF: Array of objects
  // { id, pageNum, type, dataUrl, text, color, x, y, width, height, rotation }
  const [placedElements, setPlacedElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Modal states for creating Signature / Initial / Text / Date
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('signature'); // 'signature' | 'initials' | 'text' | 'date' | 'checkmark'
  const [sigMode, setSigMode] = useState('draw'); // 'draw' | 'type' | 'upload'

  // Draw signature options
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type signature options
  const [typedName, setTypedName] = useState('John Doe');
  const [selectedFont, setSelectedFont] = useState(HANDWRITING_FONTS[0].family);
  const [typedColor, setTypedColor] = useState('#000000');

  // Text & Date field options
  const [customText, setCustomText] = useState('Approved');
  const [textColor, setTextColor] = useState('#000000');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Upload signature options
  const [removeBg, setRemoveBg] = useState(true);

  // Result & Progress
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const pdfCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const pdfjsDocRef = useRef(null);

  // Dragging & Resizing element interaction state
  const dragInfoRef = useRef(null);

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontId = 'google-handwriting-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  /* ── Clean up Blob URLs on unmount ────────────────────── */
  useEffect(() => {
    return () => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    };
  }, [resultBlobUrl]);

  // Helper to load pdf.js from CDN
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

  const fmt = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  // Handle PDF file selection
  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    if (!incomingFile.name.endsWith('.pdf') && incomingFile.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setFile(incomingFile);
    setStatus('loading');
    setProgressText('Opening PDF document...');

    try {
      const buffer = await incomingFile.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const pdfDoc = await loadingTask.promise;

      pdfjsDocRef.current = pdfDoc;
      const count = pdfDoc.numPages;
      setNumPages(count);
      setCurrentPage(1);

      // Fetch metadata & dimensions for each page
      const meta = [];
      const thumbs = [];
      for (let i = 1; i <= count; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        meta.push({ width: viewport.width, height: viewport.height });
        thumbs.push({ pageNum: i, thumbnail: null });
      }
      setPagesMeta(meta);
      setPageThumbnails(thumbs);
      setStatus('ready');

      // Async render thumbnails in background
      for (let i = 1; i <= count; i++) {
        try {
          const page = await pdfDoc.getPage(i);
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
      setErrorMsg('Failed to load PDF. ' + (err.message || ''));
      setStatus('idle');
    }
  };

  // Render active page canvas whenever currentPage or zoom changes
  const renderPdfPage = useCallback(async () => {
    if (!pdfjsDocRef.current || status !== 'ready') return;
    try {
      const page = await pdfjsDocRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.35 * zoom });

      const canvas = pdfCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.warn('Page render error:', err);
    }
  }, [currentPage, zoom, status]);

  useEffect(() => {
    renderPdfPage();
  }, [renderPdfPage]);

  // Handle Drawing Canvas logic
  const startDrawing = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    isDrawingRef.current = true;
    lastPosRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const currentPos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert Typed Handwriting Text to crisp Data URL
  const generateTypedSignatureDataUrl = (text, fontStyle, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `64px ${fontStyle}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'Signature', canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  // Helper to remove white background from uploaded image signatures
  const removeImageWhiteBg = (imgElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(imgElement, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 210 && g > 210 && b > 210) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  // Save Signature/Element from Modal & Place directly on current page
  const handleSaveSignature = () => {
    let dataUrl = null;
    let label = 'Signature';

    if (modalTab === 'signature' || modalTab === 'initials') {
      if (sigMode === 'draw') {
        const canvas = sigCanvasRef.current;
        if (!canvas || !hasDrawn) {
          setErrorMsg('Please draw your signature first.');
          return;
        }
        dataUrl = canvas.toDataURL('image/png');
      } else if (sigMode === 'type') {
        if (!typedName.trim()) {
          setErrorMsg('Please type your name or initials.');
          return;
        }
        dataUrl = generateTypedSignatureDataUrl(typedName, selectedFont, typedColor);
      }
      label = modalTab === 'signature' ? 'Signature' : 'Initials';
    } else if (modalTab === 'text') {
      if (!customText.trim()) return;
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(customText, 10, 50);
      dataUrl = canvas.toDataURL('image/png');
      label = 'Text';
    } else if (modalTab === 'date') {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(dateStr, 10, 50);
      dataUrl = canvas.toDataURL('image/png');
      label = 'Date';
    } else if (modalTab === 'checkmark') {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 70px sans-serif';
      ctx.fillStyle = '#EF4444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', 50, 50);
      dataUrl = canvas.toDataURL('image/png');
      label = 'Checkmark';
    }

    if (!dataUrl) return;

    // Save to palette list
    const newItem = {
      id: Date.now(),
      type: modalTab,
      dataUrl,
      label
    };

    if (modalTab === 'signature') {
      setSavedSignatures(prev => [newItem, ...prev.slice(0, 4)]);
    } else if (modalTab === 'initials') {
      setSavedInitials(prev => [newItem, ...prev.slice(0, 4)]);
    }

    // Directly place on active document page
    placeItemOnCurrentPage(dataUrl, modalTab);

    setIsModalOpen(false);
    clearSigCanvas();
  };

  // Place an item from palette or modal directly onto the current page
  const placeItemOnCurrentPage = (dataUrl, type = 'signature') => {
    let width = 160;
    let height = 70;

    if (type === 'initials') {
      width = 90;
      height = 60;
    } else if (type === 'date' || type === 'text') {
      width = 140;
      height = 45;
    } else if (type === 'checkmark') {
      width = 45;
      height = 45;
    }

    const newElement = {
      id: Date.now() + Math.random(),
      pageNum: currentPage,
      type,
      dataUrl,
      x: 100,
      y: 150,
      width,
      height,
      rotation: 0
    };

    setPlacedElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  // Element Interaction: Drag & Drop on Canvas
  const handleElementMouseDown = (e, elemId) => {
    e.stopPropagation();
    setSelectedElementId(elemId);

    const overlay = overlayRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();

    const elem = placedElements.find(el => el.id === elemId);
    if (!elem) return;

    dragInfoRef.current = {
      action: 'move',
      elemId,
      startX: e.clientX,
      startY: e.clientY,
      initialElemX: elem.x,
      initialElemY: elem.y,
      initialW: elem.width,
      initialH: elem.height
    };

    window.addEventListener('mousemove', handleElementMouseMove);
    window.addEventListener('mouseup', handleElementMouseUp);
  };

  const handleResizeMouseDown = (e, elemId) => {
    e.stopPropagation();
    const elem = placedElements.find(el => el.id === elemId);
    if (!elem) return;

    dragInfoRef.current = {
      action: 'resize',
      elemId,
      startX: e.clientX,
      startY: e.clientY,
      initialW: elem.width,
      initialH: elem.height
    };

    window.addEventListener('mousemove', handleElementMouseMove);
    window.addEventListener('mouseup', handleElementMouseUp);
  };

  const handleElementMouseMove = (e) => {
    if (!dragInfoRef.current) return;
    const { action, elemId, startX, startY, initialElemX, initialElemY, initialW, initialH } = dragInfoRef.current;

    const deltaX = (e.clientX - startX) / zoom;
    const deltaY = (e.clientY - startY) / zoom;

    setPlacedElements(prev => prev.map(el => {
      if (el.id !== elemId) return el;

      if (action === 'move') {
        return {
          ...el,
          x: Math.max(0, initialElemX + deltaX),
          y: Math.max(0, initialElemY + deltaY)
        };
      } else if (action === 'resize') {
        const newW = Math.max(40, initialW + deltaX);
        const newH = Math.max(25, initialH + deltaY);
        return {
          ...el,
          width: newW,
          height: newH
        };
      }
      return el;
    }));
  };

  const handleElementMouseUp = () => {
    dragInfoRef.current = null;
    window.removeEventListener('mousemove', handleElementMouseMove);
    window.removeEventListener('mouseup', handleElementMouseUp);
  };

  // Duplicate element
  const duplicateElement = (elemId) => {
    const elem = placedElements.find(el => el.id === elemId);
    if (!elem) return;
    const dup = {
      ...elem,
      id: Date.now() + Math.random(),
      x: elem.x + 20,
      y: elem.y + 20
    };
    setPlacedElements(prev => [...prev, dup]);
    setSelectedElementId(dup.id);
  };

  // Delete element
  const deleteElement = (elemId) => {
    setPlacedElements(prev => prev.filter(el => el.id !== elemId));
    if (selectedElementId === elemId) setSelectedElementId(null);
  };

  // Apply Element to All Pages
  const applyToAllPages = (elemId) => {
    const elem = placedElements.find(el => el.id === elemId);
    if (!elem) return;

    const newCopies = [];
    for (let p = 1; p <= numPages; p++) {
      if (p !== elem.pageNum) {
        newCopies.push({
          ...elem,
          id: Date.now() + Math.random() + p,
          pageNum: p
        });
      }
    }
    setPlacedElements(prev => [...prev, ...newCopies]);
  };

  // Apply Signatures & Generate Final Signed PDF
  const handleApplySignatureAndDownload = async () => {
    if (placedElements.length === 0) {
      setErrorMsg('Please add at least one signature or field onto the document first.');
      return;
    }

    setStatus('processing');
    setProgressText('Embedding signatures and compiling PDF...');
    setErrorMsg('');

    try {
      const origArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(origArrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const pageNum = i + 1;
        const page = pages[i];
        const pageMeta = pagesMeta[i] || { width: page.getWidth(), height: page.getHeight() };

        const pdfW = page.getWidth();
        const pdfH = page.getHeight();

        const elementsOnPage = placedElements.filter(el => el.pageNum === pageNum);

        for (const elem of elementsOnPage) {
          if (!elem.dataUrl) continue;

          // Convert dataURL to embedded PNG image
          const imageBytes = await fetch(elem.dataUrl).then(res => res.arrayBuffer());
          const embeddedImage = await pdfDoc.embedPng(imageBytes);

          // Convert Canvas coordinates to PDF coordinates
          const scaleX = pdfW / pageMeta.width;
          const scaleY = pdfH / pageMeta.height;

          const elemPdfW = elem.width * scaleX;
          const elemPdfH = elem.height * scaleY;
          const elemPdfX = elem.x * scaleX;
          const elemPdfY = pdfH - (elem.y * scaleY) - elemPdfH;

          page.drawImage(embeddedImage, {
            x: elemPdfX,
            y: Math.max(0, elemPdfY),
            width: elemPdfW,
            height: elemPdfH,
            rotate: degrees(elem.rotation || 0)
          });
        }
      }

      const signedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_signed.pdf`;

      setResultBlobUrl(url);
      setResultFilename(outName);
      setResultSize(blob.size);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('sign-pdf', true, { filename: outName });
      const link = document.createElement('a');
      link.href = url;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sign PDF: ' + (err.message || err));
      setStatus('ready');
    }
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setNumPages(0);
    setCurrentPage(1);
    setPlacedElements([]);
    setSelectedElementId(null);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

  const currentPlacedElements = placedElements.filter(el => el.pageNum === currentPage);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">
      
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
      {status === 'idle' && (
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
            <Edit3 className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser Electronic Signatures
            </span>
            <span>•</span>
            <span>Draw, Type or Upload Signatures &amp; Initials</span>
            <span>•</span>
            <span>Zero File Limits</span>
          </div>
        </div>
      )}

      {/* ── 2. LOADING STATE ───────────────────────────────── */}
      {(status === 'loading' || status === 'processing') && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {progressText || 'Processing document...'}
          </p>
        </div>
      )}

      {/* ── 3. INTERACTIVE SIGNING WORKSPACE (iLovePDF Style) ─ */}
      {status === 'ready' && file && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Signature / Field</span>
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#2A2E45] disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#1B1E2E]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page <span className="text-red-600 font-black">{currentPage}</span> of {numPages}
              </span>
              <button
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#2A2E45] disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#1B1E2E]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls & Sign Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-[#2A2E45] overflow-hidden text-xs bg-zinc-50 dark:bg-[#1B1E2E]">
                <button
                  onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(1.8, z + 0.2))}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplySignatureAndDownload}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Sign PDF</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Signing Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── LEFT: INTERACTIVE SIGNING CANVAS (8 Cols) ───── */}
            <div className="lg:col-span-8 p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[540px] overflow-auto select-none">
              
              <div
                ref={overlayRef}
                onClick={() => setSelectedElementId(null)}
                className="relative shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 inline-block"
              >
                {/* PDF Page Canvas */}
                <canvas ref={pdfCanvasRef} className="block max-w-full h-auto pointer-events-none" />

                {/* Placed Interactive Signature Overlay Elements */}
                {currentPlacedElements.map((elem) => {
                  const isSelected = selectedElementId === elem.id;

                  return (
                    <div
                      key={elem.id}
                      onMouseDown={(e) => handleElementMouseDown(e, elem.id)}
                      className={`absolute group cursor-move select-none p-1 rounded transition-shadow ${
                        isSelected
                          ? 'border-2 border-dashed border-red-500 ring-2 ring-red-500/30 bg-white/40 shadow-lg z-20'
                          : 'border border-transparent hover:border-red-400/80 z-10'
                      }`}
                      style={{
                        left: `${elem.x * zoom}px`,
                        top: `${elem.y * zoom}px`,
                        width: `${elem.width * zoom}px`,
                        height: `${elem.height * zoom}px`,
                        transform: `rotate(${elem.rotation || 0}deg)`
                      }}
                    >
                      <img
                        src={elem.dataUrl}
                        alt={elem.type}
                        className="w-full h-full object-contain pointer-events-none"
                      />

                      {/* Element Action Controls if Selected */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-7 right-0 flex items-center gap-1 bg-zinc-900/90 text-white rounded-md p-1 shadow-md text-[10px] backdrop-blur-xs">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); duplicateElement(elem.id); }}
                              className="p-0.5 hover:text-red-400"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); applyToAllPages(elem.id); }}
                              className="p-0.5 hover:text-emerald-400"
                              title="Apply to all pages"
                            >
                              <Layers className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deleteElement(elem.id); }}
                              className="p-0.5 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Resize Handle */}
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, elem.id)}
                            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                          />
                        </>
                      )}
                    </div>
                  );
                })}

              </div>

            </div>

            {/* ── RIGHT: SIGNATURE PALETTE & PAGES (4 Cols) ───── */}
            <div className="lg:col-span-4 space-y-4 sticky top-20">
              
              {/* Palette Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-4">
                
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Signatures Palette
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New</span>
                  </button>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setModalTab('signature'); setIsModalOpen(true); }}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 hover:bg-red-50 text-zinc-800 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-red-600" />
                    <span>Signature</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalTab('initials'); setIsModalOpen(true); }}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 hover:bg-red-50 text-zinc-800 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Type className="w-4 h-4 text-red-600" />
                    <span>Initials</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalTab('date'); setIsModalOpen(true); }}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 hover:bg-red-50 text-zinc-800 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>Date Stamp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalTab('checkmark'); setIsModalOpen(true); }}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 hover:bg-red-50 text-zinc-800 hover:text-red-600 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-red-600" />
                    <span>Checkmark</span>
                  </button>
                </div>

                {/* Saved Signatures Click to Place */}
                {savedSignatures.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#2A2E45]">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Click to place on Page {currentPage}:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {savedSignatures.map(sig => (
                        <div
                          key={sig.id}
                          onClick={() => placeItemOnCurrentPage(sig.dataUrl, 'signature')}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#1B1E2E] hover:border-red-500 cursor-pointer shadow-2xs group flex items-center justify-center h-14"
                        >
                          <img src={sig.dataUrl} alt="Saved Sig" className="max-h-10 max-w-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Pages Navigator Strip */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-3">
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Document Pages ({numPages})
                </h4>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
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

            </div>

          </div>

        </div>
      )}

      {/* ── 4. COMPLETION & DOWNLOAD SCREEN ────────────────── */}
      {status === 'completed' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-8 sm:p-14 text-center space-y-6 shadow-sm animate-scale-up">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              PDF has been signed!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Your electronic signatures and fields have been securely embedded.
            </p>
          </div>

          {/* Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{resultFilename}</span>
            <span>•</span>
            <span>{numPages} pages</span>
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
              <span>Download Signed PDF</span>
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
                title="Signed PDF Preview"
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
              <span>Sign another PDF document</span>
            </button>
          </div>

        </div>
      )}

      {/* ── 5. SIGNATURE CREATION MODAL ────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#2A2E45]">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Create Signature / Field
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1B1E2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-100 dark:bg-[#1B1E2E] rounded-xl text-xs font-bold">
              {['signature', 'initials', 'text', 'date', 'checkmark'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setModalTab(t)}
                  className={`py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                    modalTab === t ? 'bg-white dark:bg-[#2A2E45] text-red-600 shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab: Signature / Initials */}
            {(modalTab === 'signature' || modalTab === 'initials') && (
              <div className="space-y-4">
                {/* Mode: Draw vs Type */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSigMode('draw')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      sigMode === 'draw' ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/40' : 'bg-white dark:bg-[#1B1E2E] border-zinc-200'
                    }`}
                  >
                    ✍️ Draw
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigMode('type')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      sigMode === 'type' ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/40' : 'bg-white dark:bg-[#1B1E2E] border-zinc-200'
                    }`}
                  >
                    ⌨️ Type (Calligraphy)
                  </button>
                </div>

                {sigMode === 'draw' && (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-zinc-300 dark:border-[#2A2E45] rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E]/40 overflow-hidden relative">
                      <canvas
                        ref={sigCanvasRef}
                        width={480}
                        height={180}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-44 cursor-crosshair block"
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-zinc-400 font-semibold">
                          Sign here with mouse or touch...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {['#000000', '#2563EB', '#DC2626'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setPenColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-5 h-5 rounded-full border border-white shadow-xs ${
                              penColor === c ? 'ring-2 ring-red-500 scale-110' : ''
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={clearSigCanvas}
                        className="text-xs font-bold text-zinc-500 hover:text-red-600"
                      >
                        Clear Canvas
                      </button>
                    </div>
                  </div>
                )}

                {sigMode === 'type' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={typedName}
                      placeholder="Type name here..."
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />

                    {/* Handwriting Font Options */}
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {HANDWRITING_FONTS.map(f => (
                        <div
                          key={f.name}
                          onClick={() => setSelectedFont(f.family)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                            selectedFont === f.family
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
                              : 'border-zinc-200 dark:border-[#2A2E45]'
                          }`}
                        >
                          <span style={{ fontFamily: f.family }} className="text-xl text-zinc-900 dark:text-white block truncate">
                            {typedName || 'Signature'}
                          </span>
                          <span className="text-[9px] text-zinc-400 mt-1 block">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Text */}
            {modalTab === 'text' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Custom Text / Notes:</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white"
                />
              </div>
            )}

            {/* Tab: Date */}
            {modalTab === 'date' && (
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Date Stamp:</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white"
                />
              </div>
            )}

            {/* Tab: Checkmark */}
            {modalTab === 'checkmark' && (
              <div className="py-6 text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-3xl font-black">
                  ✓
                </div>
                <p className="text-xs text-zinc-500">Insert an approval checkmark on the document.</p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-[#1B1E2E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30"
              >
                Place on Document
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
