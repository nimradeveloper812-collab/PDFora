import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, File, X, Plus, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Trash2, RotateCw, Check,
  RefreshCw, Eye, Undo, Redo
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
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

export default function RotatePdfTool() {
  const [items, setItems] = useState([]); // Array of { id, file, name, size, pageCount, pages: [{ pageNum, rotation, thumbnail }] }
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState('documents'); // 'documents' (file cards) or 'pages' (granular page cards if 1 file)
  const [specificPagesText, setSpecificPagesText] = useState('');

  // Processing & Results
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading_files' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [isResultZip, setIsResultZip] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);

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

  /* ── Process incoming PDF file ────────────────────────── */
  const processPdfItem = async (itemObj) => {
    try {
      const arrayBuffer = await itemObj.file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      const initialPages = Array.from({ length: count }, (_, i) => ({
        pageNum: i + 1,
        rotation: 0,
        thumbnail: null
      }));

      setItems(prev => prev.map(it => it.id === itemObj.id ? { ...it, pageCount: count, pages: initialPages } : it));

      // PDF.js Thumbnails
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;

        // Render thumbnails for each page (or at least page 1)
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

            setItems(prev => prev.map(it => {
              if (it.id !== itemObj.id) return it;
              const nextPages = (it.pages || []).map(p => p.pageNum === i ? { ...p, thumbnail: dataUrl } : p);
              return { ...it, pages: nextPages, mainThumbnail: i === 1 ? dataUrl : it.mainThumbnail };
            }));
          } catch (pErr) {
            console.warn(`Thumbnail error for page ${i}:`, pErr);
          }
        }
      } catch (pdfjsErr) {
        console.warn('PDF.js renderer notice:', pdfjsErr);
      }
    } catch (err) {
      console.error('File parsing error:', err);
    }
  };

  /* ── Add PDF Files ────────────────────────────────────── */
  const addPdfFiles = (incomingFiles) => {
    setErrorMsg('');
    if (!incomingFiles || incomingFiles.length === 0) return;

    const validItems = [];
    for (const f of incomingFiles) {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        setErrorMsg(`"${f.name}" is not a PDF. Please select PDF documents only.`);
        return;
      }
      if (f.size > 80 * 1024 * 1024) {
        setErrorMsg(`"${f.name}" exceeds the 80 MB limit.`);
        return;
      }

      const item = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: f,
        name: f.name,
        size: f.size,
        pageCount: 1,
        rotation: 0, // doc-level rotation
        mainThumbnail: null,
        pages: []
      };
      validItems.push(item);
    }

    if (validItems.length > 0) {
      setItems(prev => [...prev, ...validItems]);
      validItems.forEach(item => processPdfItem(item));
    }
  };

  /* ── Rotation Controls (iLovePDF Style) ───────────────── */
  const rotateDoc = (id, delta = 90) => {
    setItems(prev => prev.map(it => {
      if (it.id === id) {
        const nextRot = (it.rotation + delta) % 360;
        const normalized = nextRot >= 0 ? nextRot : nextRot + 360;
        // Also sync all child pages if individual
        const nextPages = (it.pages || []).map(p => ({
          ...p,
          rotation: (p.rotation + delta) % 360 >= 0 ? (p.rotation + delta) % 360 : (p.rotation + delta) % 360 + 360
        }));
        return { ...it, rotation: normalized, pages: nextPages };
      }
      return it;
    }));
  };

  const rotatePage = (docId, pageNum, delta = 90) => {
    setItems(prev => prev.map(it => {
      if (it.id === docId) {
        const nextPages = (it.pages || []).map(p => {
          if (p.pageNum === pageNum) {
            const nextRot = (p.rotation + delta) % 360;
            return { ...p, rotation: nextRot >= 0 ? nextRot : nextRot + 360 };
          }
          return p;
        });
        return { ...it, pages: nextPages };
      }
      return it;
    }));
  };

  const rotateAllLeft = () => {
    // -90 degrees (or 270 clockwise)
    setItems(prev => prev.map(it => {
      const nextDocRot = (it.rotation - 90 + 360) % 360;
      const nextPages = (it.pages || []).map(p => ({
        ...p,
        rotation: (p.rotation - 90 + 360) % 360
      }));
      return { ...it, rotation: nextDocRot, pages: nextPages };
    }));
  };

  const rotateAllRight = () => {
    // +90 degrees clockwise
    setItems(prev => prev.map(it => {
      const nextDocRot = (it.rotation + 90) % 360;
      const nextPages = (it.pages || []).map(p => ({
        ...p,
        rotation: (p.rotation + 90) % 360
      }));
      return { ...it, rotation: nextDocRot, pages: nextPages };
    }));
  };

  const resetAllRotations = () => {
    setItems(prev => prev.map(it => ({
      ...it,
      rotation: 0,
      pages: (it.pages || []).map(p => ({ ...p, rotation: 0 }))
    })));
    setSpecificPagesText('');
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  /* ── Specific Pages Preset ────────────────────────────── */
  const applySpecificPagesPreset = (preset) => {
    if (items.length !== 1) return;
    const doc = items[0];
    const total = doc.pageCount || 1;
    if (preset === 'all') {
      setSpecificPagesText(`1-${total}`);
    } else if (preset === 'odd') {
      const odd = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      setSpecificPagesText(odd.join(', '));
    } else if (preset === 'even') {
      const even = Array.from({ length: total }, (_, i) => i + 1).filter(p => p % 2 === 0);
      setSpecificPagesText(even.join(', '));
    } else if (preset === 'clear') {
      setSpecificPagesText('');
    }
  };

  const applyRotationToSpecificPages = (delta = 90) => {
    if (items.length !== 1) return;
    const doc = items[0];
    const targetSet = parsePageNumbers(specificPagesText, doc.pageCount || 1);
    if (targetSet.size === 0) return;

    setItems(prev => prev.map(it => {
      if (it.id === doc.id) {
        const nextPages = (it.pages || []).map(p => {
          if (targetSet.has(p.pageNum)) {
            const nextRot = (p.rotation + delta) % 360;
            return { ...p, rotation: nextRot >= 0 ? nextRot : nextRot + 360 };
          }
          return p;
        });
        return { ...it, pages: nextPages };
      }
      return it;
    }));
  };

  /* ── Core Rotate PDF Execution ────────────────────────── */
  const handleRotatePdf = async () => {
    if (items.length === 0) return;

    setStatus('processing');
    setProgress(10);
    setProgressText('Preparing document rotation...');
    setErrorMsg('');

    try {
      // Case 1: Single PDF File
      if (items.length === 1) {
        const item = items[0];
        setProgress(30);
        setProgressText('Rotating pages in document...');

        const arrayBuffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        pages.forEach((page, idx) => {
          const pNum = idx + 1;
          const pageConfig = (item.pages || []).find(p => p.pageNum === pNum);
          const customRot = pageConfig ? pageConfig.rotation : item.rotation;

          // If no custom page rotation set but document rotation is non-zero, use item.rotation
          const rotationToApply = customRot !== 0 ? customRot : item.rotation;

          if (rotationToApply !== 0) {
            const currentAngle = page.getRotation().angle;
            page.setRotation(degrees((currentAngle + rotationToApply) % 360));
          }
        });

        setProgress(85);
        setProgressText('Saving rotated PDF file...');

        const outBytes = await pdfDoc.save({ useObjectStreams: true });
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const baseName = item.name.replace(/\.pdf$/i, '');
        const outName = `${baseName}_rotated.pdf`;

        setResultBlobUrl(blobUrl);
        setResultFilename(outName);
        setResultSize(blob.size);
        setIsResultZip(false);
        setProgress(100);
        setStatus('completed');
        triggerDownload(blobUrl, outName);
        return;
      }

      // Case 2: Multiple PDF Files -> Batch rotate and package in ZIP
      setProgress(20);
      setProgressText(`Rotating ${items.length} PDF documents...`);
      const zip = new JSZip();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const pct = 20 + Math.round(((i + 1) / items.length) * 65);
        setProgress(pct);
        setProgressText(`Rotating file ${i + 1} of ${items.length}: "${item.name}"...`);

        const arrayBuffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        pages.forEach((page, idx) => {
          const pNum = idx + 1;
          const pageConfig = (item.pages || []).find(p => p.pageNum === pNum);
          const rotationToApply = pageConfig && pageConfig.rotation !== 0 ? pageConfig.rotation : item.rotation;

          if (rotationToApply !== 0) {
            const currentAngle = page.getRotation().angle;
            page.setRotation(degrees((currentAngle + rotationToApply) % 360));
          }
        });

        const outBytes = await pdfDoc.save({ useObjectStreams: true });
        const baseName = item.name.replace(/\.pdf$/i, '');
        zip.file(`${baseName}_rotated.pdf`, outBytes);
      }

      setProgress(90);
      setProgressText('Creating ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(zipBlob);
      const outName = `pdfora_rotated_files.zip`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(zipBlob.size);
      setIsResultZip(true);
      setProgress(100);
      setStatus('completed');
      triggerDownload(blobUrl, outName);

    } catch (err) {
      console.error('Rotate PDF error:', err);
      setErrorMsg(err.message || 'An error occurred while rotating PDF documents.');
      setStatus('idle');
    }
  };

  const triggerDownload = (url, filename) => {
    analytics.trackToolExecution('rotate-pdf', true, { filename });
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setItems([]);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setSpecificPagesText('');
    setErrorMsg('');
  };

  const totalPagesSum = items.reduce((sum, it) => sum + (it.pageCount || 1), 0);
  const totalSizeSum = items.reduce((sum, it) => sum + it.size, 0);

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
      {status === 'idle' && items.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files.length) {
              addPdfFiles(Array.from(e.dataTransfer.files));
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
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                addPdfFiles(Array.from(e.target.files));
              }
            }}
          />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/25 mb-6 group-hover:scale-105 transition-transform">
            <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-lg sm:text-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-3 cursor-pointer"
          >
            <span>Select PDF files</span>
            <UploadCloud className="w-6 h-6" />
          </button>

          <p className="mt-4 text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            or drop PDFs here
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Private In-Browser Rotation
            </span>
            <span>•</span>
            <span>Rotate Entire Files or Individual Pages</span>
            <span>•</span>
            <span>Zero File Limits</span>
          </div>
        </div>
      )}

      {/* ── 2. INTERACTIVE ROTATE WORKSPACE (iLovePDF Style) ── */}
      {status === 'idle' && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">

          {/* ── LEFT: INTERACTIVE CARDS CANVAS (8 Cols) ──────── */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  {items.length === 1 && items[0].pageCount > 1 && activeViewMode === 'pages'
                    ? 'Individual Pages Canvas'
                    : 'Documents Canvas'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-600 dark:text-zinc-300">
                  {items.length} {items.length === 1 ? 'file' : 'files'} • {totalPagesSum} pages
                </span>
              </div>

              {/* View Switcher if single multi-page PDF */}
              <div className="flex items-center gap-2">
                {items.length === 1 && (items[0].pageCount || 1) > 1 && (
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1B1E2E] p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('documents')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeViewMode === 'documents' ? 'bg-white dark:bg-[#2A2E45] text-red-600 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Entire Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('pages')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeViewMode === 'pages' ? 'bg-white dark:bg-[#2A2E45] text-red-600 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Page by Page
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More</span>
                </button>
              </div>
            </div>

            <input
              ref={addMoreInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  addPdfFiles(Array.from(e.target.files));
                }
              }}
            />

            {/* ── VIEW A: DOCUMENTS LEVEL CARDS GRID ────────── */}
            {activeViewMode === 'documents' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-zinc-100/50 dark:bg-[#141622]/40 border border-zinc-200/80 dark:border-[#2A2E45] max-h-[72vh] overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl bg-white dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] hover:border-red-400 dark:hover:border-red-500 p-3 flex flex-col items-center justify-between shadow-xs hover:shadow-md transition-all select-none"
                  >
                    {/* Index Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-zinc-900/80 text-white text-[10px] font-black backdrop-blur-sm shadow-xs">
                      {idx + 1}
                    </div>

                    {/* Top Right Quick Actions */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      {item.rotation !== 0 && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white shadow-xs">
                          {item.rotation}°
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-[#1B1E2E]/90 hover:bg-red-50 text-zinc-400 hover:text-red-600 shadow-xs transition-colors cursor-pointer"
                        title="Remove PDF"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* PDF Thumbnail Canvas with Hover Rotate Button */}
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#141622] flex items-center justify-center my-2 relative border border-zinc-100 dark:border-[#2A2E45]/40 group">
                      {item.mainThumbnail ? (
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-200"
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                        >
                          <img
                            src={item.mainThumbnail}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center text-zinc-400 gap-1 transition-transform duration-200"
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                        >
                          <FileText className="w-10 h-10 text-red-500/60" />
                          <span className="text-[10px] font-bold">PDF</span>
                        </div>
                      )}

                      {/* Prominent Center Hover Rotate Button (iLovePDF Style) */}
                      <button
                        type="button"
                        onClick={() => rotateDoc(item.id, 90)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all cursor-pointer backdrop-blur-xs"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Document Meta */}
                    <div className="w-full text-center space-y-0.5">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} • {fmt(item.size)}
                      </p>
                    </div>

                    {/* Bottom Rotate Trigger */}
                    <button
                      type="button"
                      onClick={() => rotateDoc(item.id, 90)}
                      className="mt-2 w-full py-1.5 rounded-lg bg-zinc-100 dark:bg-[#141622] hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-700 dark:text-zinc-300 hover:text-red-600 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── VIEW B: INDIVIDUAL PAGES GRID (Single PDF) ─── */}
            {activeViewMode === 'pages' && items.length === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-zinc-100/50 dark:bg-[#141622]/40 border border-zinc-200/80 dark:border-[#2A2E45] max-h-[72vh] overflow-y-auto">
                {(items[0].pages || []).map((page) => (
                  <div
                    key={page.pageNum}
                    className="group relative rounded-2xl bg-white dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] hover:border-red-400 p-3 flex flex-col items-center justify-between shadow-xs hover:shadow-md transition-all select-none"
                  >
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-zinc-900/80 text-white text-[10px] font-black backdrop-blur-sm shadow-xs">
                      Page {page.pageNum}
                    </div>

                    {page.rotation !== 0 && (
                      <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white shadow-xs">
                        {page.rotation}°
                      </div>
                    )}

                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#141622] flex items-center justify-center my-2 relative border border-zinc-100 dark:border-[#2A2E45]/40 group">
                      {page.thumbnail ? (
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-200"
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        >
                          <img
                            src={page.thumbnail}
                            alt={`Page ${page.pageNum}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center text-zinc-400 gap-1"
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        >
                          <FileText className="w-8 h-8 text-red-500/60" />
                          <span className="text-[10px] font-bold">Page {page.pageNum}</span>
                        </div>
                      )}

                      {/* Center Hover Rotate Button */}
                      <button
                        type="button"
                        onClick={() => rotatePage(items[0].id, page.pageNum, 90)}
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all cursor-pointer backdrop-blur-xs"
                        title="Rotate Page 90°"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => rotatePage(items[0].id, page.pageNum, 90)}
                      className="mt-1 w-full py-1.5 rounded-lg bg-zinc-100 dark:bg-[#141622] hover:bg-red-50 text-zinc-700 dark:text-zinc-300 hover:text-red-600 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate Page</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* ── RIGHT: ILovePDF-STYLE OPTIONS SIDEBAR (4 Cols) ─ */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            {/* Batch Info Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {items.length === 1 ? items[0].name : `${items.length} PDF Documents`}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {totalPagesSum} total pages • {fmt(totalSizeSum)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] transition-colors cursor-pointer"
                title="Clear all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Rotation Controls Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
                  Rotation Controls
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Rotate all documents together or click individual cards on the left.
                </p>
              </div>

              {/* Big Global Rotate Left / Right Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={rotateAllLeft}
                  className="py-3.5 px-3 rounded-2xl bg-zinc-100 hover:bg-red-50 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-zinc-800 dark:text-zinc-200 hover:text-red-600 border border-zinc-200 dark:border-[#2A2E45] transition-all flex flex-col items-center justify-center gap-1.5 font-bold text-xs cursor-pointer shadow-xs active:scale-95"
                >
                  <Undo className="w-5 h-5 text-red-600" />
                  <span>Rotate Left (-90°)</span>
                </button>

                <button
                  type="button"
                  onClick={rotateAllRight}
                  className="py-3.5 px-3 rounded-2xl bg-zinc-100 hover:bg-red-50 dark:bg-[#1B1E2E] dark:hover:bg-red-950/40 text-zinc-800 dark:text-zinc-200 hover:text-red-600 border border-zinc-200 dark:border-[#2A2E45] transition-all flex flex-col items-center justify-center gap-1.5 font-bold text-xs cursor-pointer shadow-xs active:scale-95"
                >
                  <Redo className="w-5 h-5 text-red-600" />
                  <span>Rotate Right (+90°)</span>
                </button>
              </div>

              {/* Granular Page Rotation Selector (if single PDF) */}
              {items.length === 1 && (items[0].pageCount || 1) > 1 && (
                <div className="pt-3 border-t border-zinc-100 dark:border-[#2A2E45] space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Rotate specific pages:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={specificPagesText}
                        placeholder={`e.g. 1, 3, 5-${items[0].pageCount}`}
                        onChange={(e) => setSpecificPagesText(e.target.value)}
                        className="flex-1 text-xs rounded-xl px-3 py-2 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => applyRotationToSpecificPages(90)}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        +90°
                      </button>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-zinc-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applySpecificPagesPreset('odd')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 dark:bg-[#1B1E2E] transition-colors cursor-pointer"
                    >
                      Odd
                    </button>
                    <button
                      type="button"
                      onClick={() => applySpecificPagesPreset('even')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 dark:bg-[#1B1E2E] transition-colors cursor-pointer"
                    >
                      Even
                    </button>
                    <button
                      type="button"
                      onClick={() => applySpecificPagesPreset('clear')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 dark:bg-[#1B1E2E] transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Reset Rotations Action */}
              <button
                type="button"
                onClick={resetAllRotations}
                className="w-full py-2 text-xs font-bold text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Reset all angles to 0°
              </button>

              {/* Big Prominent Action Button */}
              <button
                type="button"
                onClick={handleRotatePdf}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Rotate PDF</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ── 3. PROCESSING STATE ────────────────────────────── */}
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
              Rotating your PDF documents...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Saving new orientation angles...'}
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

      {/* ── 4. COMPLETION & DOWNLOAD SCREEN ────────────────── */}
      {status === 'completed' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-8 sm:p-14 text-center space-y-6 shadow-sm animate-scale-up">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              PDFs have been rotated!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              The new orientation angles have been permanently applied to your document.
            </p>
          </div>

          {/* Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{resultFilename}</span>
            <span>•</span>
            <span>{isResultZip ? 'Multiple files in ZIP' : 'Standard PDF'}</span>
            <span>•</span>
            <span>{fmt(resultSize)}</span>
          </div>

          {/* Download & Preview Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{isResultZip ? 'Download ZIP Archive' : 'Download Rotated PDF'}</span>
            </a>

            {!isResultZip && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
              </button>
            )}
          </div>

          {/* Preview Iframe */}
          {showPreview && !isResultZip && resultBlobUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-[#2A2E45] shadow-inner max-w-3xl mx-auto">
              <iframe
                src={`${resultBlobUrl}#toolbar=0`}
                title="Rotated PDF Preview"
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
              <span>Rotate more PDF files</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
