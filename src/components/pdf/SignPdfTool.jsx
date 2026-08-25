import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText, Download, Upload, Trash2, Plus, Check, RefreshCw, AlertCircle,
  Eye, Edit3, Type, Image as ImageIcon, Calendar, CheckSquare, Sparkles,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Copy, Layers,
  RotateCw, ArrowRight, X, Lock, Move, MoveHorizontal
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

// Fonts list for typed signatures
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
  const [customText, setCustomText] = useState('Confidential');
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
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF viewer engine.'));
      document.body.appendChild(script);
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  // Handle PDF file selection
  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    if (incomingFile.type !== 'application/pdf' && !incomingFile.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setFile(incomingFile);
    setStatus('loading');
    setProgressText('Loading PDF document...');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      pdfjsDocRef.current = pdfDoc;

      const total = pdfDoc.numPages;
      setNumPages(total);
      setCurrentPage(1);

      // Extract metadata & generate page thumbnails
      const meta = [];
      const thumbs = [];

      for (let i = 1; i <= Math.min(total, 30); i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        meta.push({ width: page.view[2] - page.view[0], height: page.view[3] - page.view[1] });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push(canvas.toDataURL('image/png'));
      }

      setPagesMeta(meta);
      setPageThumbnails(thumbs);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setErrorMsg('Error opening PDF document: ' + (err.message || err));
      setStatus('idle');
    }
  };

  // Render main active page onto canvas whenever currentPage or zoom changes
  const renderCurrentPage = useCallback(async () => {
    if (!pdfjsDocRef.current || status !== 'ready') return;
    try {
      const page = await pdfjsDocRef.current.getPage(currentPage);
      const canvas = pdfCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: zoom });

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      ctx.scale(dpr, dpr);
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error('Page render error:', err);
    }
  }, [currentPage, zoom, status]);

  useEffect(() => {
    if (status === 'ready') {
      renderCurrentPage();
    }
  }, [status, currentPage, zoom, renderCurrentPage]);

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
      // If pixel is white or nearly white, make transparent
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
        if (!canvas || !hasDrawn) return;
        dataUrl = canvas.toDataURL('image/png');
        label = modalTab === 'signature' ? 'Drawn Signature' : 'Drawn Initial';
      } else if (sigMode === 'type') {
        if (!typedName.trim()) return;
        dataUrl = generateTypedSignatureDataUrl(typedName, selectedFont, typedColor);
        label = typedName;
      }
    } else if (modalTab === 'text') {
      dataUrl = generateTypedSignatureDataUrl(customText, 'sans-serif', textColor);
      label = customText;
    } else if (modalTab === 'date') {
      dataUrl = generateTypedSignatureDataUrl(dateStr, 'sans-serif', textColor);
      label = dateStr;
    } else if (modalTab === 'checkmark') {
      dataUrl = generateTypedSignatureDataUrl('✓', 'sans-serif', '#10B981');
      label = 'Checkmark';
    }

    if (!dataUrl) return;

    const newItem = {
      id: Date.now() + Math.random(),
      type: modalTab,
      label,
      dataUrl
    };

    if (modalTab === 'initials') {
      setSavedInitials(prev => [...prev, newItem]);
    } else {
      setSavedSignatures(prev => [...prev, newItem]);
    }

    // Place element on current page
    placeElementOnPage(newItem);
    setIsModalOpen(false);
    clearSigCanvas();
  };

  // Handle uploaded image file
  const handleImageUpload = (e) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        let finalDataUrl = evt.target.result;
        if (removeBg) {
          finalDataUrl = removeImageWhiteBg(img);
        }

        const newItem = {
          id: Date.now() + Math.random(),
          type: 'signature',
          label: 'Uploaded Image',
          dataUrl: finalDataUrl
        };

        setSavedSignatures(prev => [...prev, newItem]);
        placeElementOnPage(newItem);
        setIsModalOpen(false);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(imgFile);
  };

  // Add an item to the current PDF page
  const placeElementOnPage = (item) => {
    const pageMeta = pagesMeta[currentPage - 1] || { width: 600, height: 800 };
    const defaultW = item.type === 'checkmark' ? 50 : item.type === 'initials' ? 100 : 180;
    const defaultH = item.type === 'checkmark' ? 50 : item.type === 'initials' ? 60 : 70;

    const newElem = {
      id: Date.now() + Math.random(),
      pageNum: currentPage,
      type: item.type,
      dataUrl: item.dataUrl,
      x: (pageMeta.width / 2) - (defaultW / 2),
      y: (pageMeta.height / 2) - (defaultH / 2),
      width: defaultW,
      height: defaultH,
      rotation: 0
    };

    setPlacedElements(prev => [...prev, newElem]);
    setSelectedElementId(newElem.id);
  };

  // Dragging & Resizing Overlay Handlers
  const handleElementMouseDown = (e, elemId, actionType) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElementId(elemId);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const elem = placedElements.find(el => el.id === elemId);
    if (!elem) return;

    dragInfoRef.current = {
      elemId,
      actionType,
      startX: clientX,
      startY: clientY,
      initialX: elem.x,
      initialY: elem.y,
      initialW: elem.width,
      initialH: elem.height
    };

    const handleWindowMouseMove = (evt) => {
      if (!dragInfoRef.current) return;
      const currX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const currY = evt.touches ? evt.touches[0].clientY : evt.clientY;

      const deltaX = (currX - dragInfoRef.current.startX) / zoom;
      const deltaY = (currY - dragInfoRef.current.startY) / zoom;

      const { elemId, actionType, initialX, initialY, initialW, initialH } = dragInfoRef.current;

      setPlacedElements(prev => prev.map(el => {
        if (el.id !== elemId) return el;

        if (actionType === 'move') {
          return {
            ...el,
            x: Math.max(0, initialX + deltaX),
            y: Math.max(0, initialY + deltaY)
          };
        } else if (actionType === 'se') {
          return {
            ...el,
            width: Math.max(30, initialW + deltaX),
            height: Math.max(20, initialH + deltaY)
          };
        } else if (actionType === 'sw') {
          const nextW = Math.max(30, initialW - deltaX);
          return {
            ...el,
            x: initialX + (initialW - nextW),
            width: nextW,
            height: Math.max(20, initialH + deltaY)
          };
        } else if (actionType === 'ne') {
          const nextH = Math.max(20, initialH - deltaY);
          return {
            ...el,
            y: initialY + (initialH - nextH),
            width: Math.max(30, initialW + deltaX),
            height: nextH
          };
        } else if (actionType === 'nw') {
          const nextW = Math.max(30, initialW - deltaX);
          const nextH = Math.max(20, initialH - deltaY);
          return {
            ...el,
            x: initialX + (initialW - nextW),
            y: initialY + (initialH - nextH),
            width: nextW,
            height: nextH
          };
        }
        return el;
      }));
    };

    const handleWindowMouseUp = () => {
      dragInfoRef.current = null;
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowMouseMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowMouseMove);
    window.addEventListener('touchend', handleWindowMouseUp);
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
      setErrorMsg('Please add at least one signature or element onto the document first.');
      return;
    }

    setStatus('processing');
    setProgressText('Embedding signatures and compiling PDF...');

    try {
      const origArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(origArrayBuffer);
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

          // Convert Canvas coordinates (top-left 0,0) to PDF coordinates (bottom-left 0,0)
          const scaleX = pdfW / pageMeta.width;
          const scaleY = pdfH / pageMeta.height;

          const elemPdfW = elem.width * scaleX;
          const elemPdfH = elem.height * scaleY;
          const elemPdfX = elem.x * scaleX;
          const elemPdfY = pdfH - (elem.y * scaleY) - elemPdfH;

          page.drawImage(embeddedImage, {
            x: elemPdfX,
            y: elemPdfY,
            width: elemPdfW,
            height: elemPdfH,
            rotate: degrees(elem.rotation || 0)
          });
        }
      }

      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultBlobUrl(url);
      setResultFilename(file.name.replace(/\.pdf$/i, '_signed.pdf'));
      setResultSize(blob.size);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sign PDF: ' + (err.message || err));
      setStatus('ready');
    }
  };

  const currentPlacedElements = placedElements.filter(el => el.pageNum === currentPage);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* ── IDLE / FILE DROPZONE STATE ─────────────────────────────────────── */}
      {status === 'idle' && (
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer p-10 rounded-3xl border-2 border-dashed border-purple-300 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 transition-all text-center space-y-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
              <Edit3 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Select PDF file to Sign
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Create electronic signatures, add text & dates, and sign your PDF directly in your browser.
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Select File
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* ── LOADING STATE ─────────────────────────────────────────────────── */}
      {(status === 'loading' || status === 'processing') && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xl text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {status === 'loading' ? 'Opening Document...' : 'Signing PDF Document...'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{progressText}</p>
          </div>
        </div>
      )}

      {/* ── READY / INTERACTIVE SIGNING WORKSPACE ───────────────────────────── */}
      {status === 'ready' && (
        <div className="space-y-4">
          {/* Top Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Signature / Field</span>
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {currentPage} of {numPages}
              </span>
              <button
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom & Action Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs bg-zinc-50 dark:bg-zinc-800">
                <button
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(2.0, z + 0.25))}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplySignatureAndDownload}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Sign & Download</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Main Document View & Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
            {/* Saved Signatures & Thumbnails Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Palette of Saved Signatures */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center justify-between">
                  <span>Signature Palette</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-950 text-purple-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </h4>

                {savedSignatures.length === 0 && savedInitials.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 italic text-center py-3">
                    No saved signatures yet. Click "Add Signature" to create one!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {savedSignatures.map(sig => (
                      <div
                        key={sig.id}
                        onClick={() => placeElementOnPage(sig)}
                        className="group p-2 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] hover:border-purple-500 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <img src={sig.dataUrl} alt={sig.label} className="max-h-8 object-contain" />
                        <span className="text-[10px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          + Add
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Page Thumbnails Drawer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Pages ({numPages})
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {pageThumbnails.map((thumb, idx) => {
                    const pNum = idx + 1;
                    const isCur = currentPage === pNum;
                    const hasElem = placedElements.some(el => el.pageNum === pNum);

                    return (
                      <div
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`relative p-1.5 rounded-xl border cursor-pointer transition-all text-center space-y-1 ${
                          isCur
                            ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40'
                            : 'border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] hover:border-purple-400'
                        }`}
                      >
                        <img src={thumb} alt={`Page ${pNum}`} className="w-full rounded object-contain shadow-xs" />
                        <div className="flex items-center justify-between px-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                          <span>p. {pNum}</span>
                          {hasElem && <Check className="w-3 h-3 text-emerald-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Document Render Viewport & Placement Canvas */}
            <div className="lg:col-span-3 p-4 rounded-2xl bg-zinc-100 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex justify-center items-start overflow-auto min-h-[500px]">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden bg-white select-none"
                onClick={() => setSelectedElementId(null)}
              >
                {/* PDF Page Canvas */}
                <canvas ref={pdfCanvasRef} className="block" />

                {/* Overlaid Placed Elements Container */}
                <div
                  ref={overlayRef}
                  className="absolute inset-0 pointer-events-auto"
                  style={{
                    width: pdfCanvasRef.current ? pdfCanvasRef.current.style.width : 'auto',
                    height: pdfCanvasRef.current ? pdfCanvasRef.current.style.height : 'auto'
                  }}
                >
                  {currentPlacedElements.map((elem) => {
                    const isSelected = selectedElementId === elem.id;

                    return (
                      <div
                        key={elem.id}
                        onMouseDown={(e) => handleElementMouseDown(e, elem.id, 'move')}
                        onTouchStart={(e) => handleElementMouseDown(e, elem.id, 'move')}
                        style={{
                          position: 'absolute',
                          left: elem.x * zoom,
                          top: elem.y * zoom,
                          width: elem.width * zoom,
                          height: elem.height * zoom,
                          transform: `rotate(${elem.rotation || 0}deg)`,
                          cursor: 'move'
                        }}
                        className={`group absolute border-2 transition-shadow ${
                          isSelected
                            ? 'border-purple-600 shadow-xl ring-2 ring-purple-600/30'
                            : 'border-transparent hover:border-purple-400/80'
                        }`}
                      >
                        {/* Signature / Element Image */}
                        <img
                          src={elem.dataUrl}
                          alt="signature element"
                          className="w-full h-full object-contain pointer-events-none"
                        />

                        {/* Interactive Floating Action Toolbar when Selected */}
                        {isSelected && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-xl text-xs z-30 pointer-events-auto">
                            <button
                              title="Duplicate"
                              onClick={(e) => { e.stopPropagation(); duplicateElement(elem.id); }}
                              className="p-1 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Apply to All Pages"
                              onClick={(e) => { e.stopPropagation(); applyToAllPages(elem.id); }}
                              className="p-1 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete"
                              onClick={(e) => { e.stopPropagation(); deleteElement(elem.id); }}
                              className="p-1 hover:bg-red-600 rounded text-red-400 hover:text-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Corner Resize Handles when Selected */}
                        {isSelected && (
                          <>
                            <div
                              onMouseDown={(e) => handleElementMouseDown(e, elem.id, 'nw')}
                              onTouchStart={(e) => handleElementMouseDown(e, elem.id, 'nw')}
                              className="w-3 h-3 bg-purple-600 border border-white rounded-full absolute -top-1.5 -left-1.5 cursor-nwse-resize z-20"
                            />
                            <div
                              onMouseDown={(e) => handleElementMouseDown(e, elem.id, 'ne')}
                              onTouchStart={(e) => handleElementMouseDown(e, elem.id, 'ne')}
                              className="w-3 h-3 bg-purple-600 border border-white rounded-full absolute -top-1.5 -right-1.5 cursor-nesw-resize z-20"
                            />
                            <div
                              onMouseDown={(e) => handleElementMouseDown(e, elem.id, 'sw')}
                              onTouchStart={(e) => handleElementMouseDown(e, elem.id, 'sw')}
                              className="w-3 h-3 bg-purple-600 border border-white rounded-full absolute -bottom-1.5 -left-1.5 cursor-nesw-resize z-20"
                            />
                            <div
                              onMouseDown={(e) => handleElementMouseDown(e, elem.id, 'se')}
                              onTouchStart={(e) => handleElementMouseDown(e, elem.id, 'se')}
                              className="w-3 h-3 bg-purple-600 border border-white rounded-full absolute -bottom-1.5 -right-1.5 cursor-nwse-resize z-20"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE SIGNATURE / ELEMENT MODAL ──────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#141622] rounded-3xl max-w-xl w-full border border-zinc-200 dark:border-[#2A2E45] shadow-2xl overflow-hidden space-y-4 p-6">
            {/* Modal Header & Category Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#2A2E45] pb-4">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Create Signature or Field
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Primary Type Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-[#2A2E45]">
              {[
                { id: 'signature', label: 'Signature', icon: Edit3 },
                { id: 'initials', label: 'Initials', icon: Type },
                { id: 'text', label: 'Text Field', icon: FileText },
                { id: 'date', label: 'Date', icon: Calendar },
                { id: 'checkmark', label: 'Checkmark', icon: CheckSquare },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setModalTab(id)}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    modalTab === id
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* SIGNATURE & INITIALS CREATION BODY */}
            {(modalTab === 'signature' || modalTab === 'initials') && (
              <div className="space-y-4 pt-2">
                {/* Sub-mode Tabs: Draw | Type | Upload */}
                <div className="flex justify-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E]">
                  {[
                    { id: 'draw', label: 'Draw', icon: Edit3 },
                    { id: 'type', label: 'Type', icon: Type },
                    { id: 'upload', label: 'Upload Image', icon: ImageIcon },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSigMode(id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        sigMode === id
                          ? 'bg-white dark:bg-[#141622] text-purple-600 dark:text-purple-400 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* 1. DRAW MODE (CANVAS SIGNATURE PAD) */}
                {sigMode === 'draw' && (
                  <div className="space-y-3">
                    <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white">
                      <canvas
                        ref={sigCanvasRef}
                        width={500}
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
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-300 text-xs italic font-medium">
                          Draw signature here using your mouse or touch screen
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Color Palette */}
                      <div className="flex items-center gap-2">
                        {['#000000', '#002B7F', '#DC2626', '#047857'].map(c => (
                          <button
                            key={c}
                            onClick={() => setPenColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              penColor === c ? 'border-purple-600 scale-110' : 'border-white'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={clearSigCanvas}
                        className="text-xs font-bold text-zinc-500 hover:text-red-600 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. TYPE MODE (HANDWRITING FONTS) */}
                {sigMode === 'type' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={typedName}
                      onChange={e => setTypedName(e.target.value)}
                      placeholder="Type your name or initials..."
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] focus:ring-2 focus:ring-purple-600 outline-none"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Choose Handwriting Style
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {HANDWRITING_FONTS.map(font => (
                          <div
                            key={font.name}
                            onClick={() => setSelectedFont(font.family)}
                            style={{ fontFamily: font.family }}
                            className={`p-3 rounded-xl border text-xl text-center cursor-pointer transition-all truncate ${
                              selectedFont === font.family
                                ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                                : 'border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] hover:border-purple-400'
                            }`}
                          >
                            {typedName || 'Signature'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UPLOAD MODE (IMAGE SIGNATURE) */}
                {sigMode === 'upload' && (
                  <div className="space-y-3 text-center">
                    <label className="p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl block cursor-pointer bg-zinc-50 dark:bg-[#1B1E2E] hover:border-purple-500 transition-colors space-y-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-purple-600" />
                      <span className="text-xs font-bold block text-zinc-700 dark:text-zinc-300">
                        Upload scanned signature (PNG or JPG)
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    <label className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeBg}
                        onChange={e => setRemoveBg(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Auto-remove white background pixels</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* TEXT FIELD MODAL BODY */}
            {modalTab === 'text' && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Custom Text Content
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            )}

            {/* DATE MODAL BODY */}
            {modalTab === 'date' && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Select Date
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            )}

            {/* CHECKMARK MODAL BODY */}
            {modalTab === 'checkmark' && (
              <div className="text-center py-6 space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black">
                  ✓
                </div>
                <p className="text-xs text-zinc-500">Click save to place checkmark on PDF</p>
              </div>
            )}

            {/* Modal Actions Footer */}
            {sigMode !== 'upload' && (
              <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-[#2A2E45] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Save & Place
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLETED SUCCESS & DOWNLOAD UI ───────────────────────────────── */}
      {status === 'completed' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white">
              Your PDF is Signed Successfully!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Signatures and fields have been burned into the document. File size: {formatBytes(resultSize)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed PDF</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setFile(null);
                setPlacedElements([]);
                setSavedSignatures([]);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#2A2E45] text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sign Another File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


