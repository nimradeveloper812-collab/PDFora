import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, File, X, Plus, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, ArrowUpDown, Trash2, RotateCw, MoveLeft, MoveRight,
  Eye, RefreshCw, Layers
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import AdBanner, { AD_SLOTS } from '../common/AdBanner';
import { analytics } from '../../services/analytics';

// Dynamic PDF.js Loader for generating page 1 thumbnails
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

export default function MergePdfTool() {
  const [items, setItems] = useState([]); // Array of { id, file, name, size, pageCount, rotation: 0, thumbnail: null }
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('pdfora_merged.pdf');
  const [resultSize, setResultSize] = useState(0);
  const [resultPageCount, setResultPageCount] = useState(0);
  const [showResultPreview, setShowResultPreview] = useState(false);

  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);

  /* ── Clean up Blob URLs on Unmount ────────────────────── */
  useEffect(() => {
    return () => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    };
  }, [resultBlobUrl]);

  /* ── Format Bytes Utility ─────────────────────────────── */
  const fmt = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  /* ── Load Metadata & Thumbnail for an uploaded PDF ───── */
  const processPdfFile = async (fileItem) => {
    try {
      const arrayBuffer = await fileItem.file.arrayBuffer();
      
      // 1. Get Page Count using PDFDocument
      let pageCount = 1;
      try {
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        pageCount = doc.getPageCount();
      } catch (e) {
        console.warn('PDF-lib page count error:', e);
      }

      setItems(prev => prev.map(it => it.id === fileItem.id ? { ...it, pageCount } : it));

      // 2. Render Page 1 Thumbnail using PDF.js
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const firstPage = await pdf.getPage(1);
        
        const viewport = firstPage.getViewport({ scale: 0.35 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await firstPage.render({ canvasContext: ctx, viewport }).promise;
        const thumbnail = canvas.toDataURL('image/jpeg', 0.85);

        setItems(prev => prev.map(it => it.id === fileItem.id ? { ...it, thumbnail } : it));
      } catch (thumbErr) {
        console.warn('Thumbnail generation failed for', fileItem.name, thumbErr);
      }
    } catch (err) {
      console.error('File parsing error:', err);
    }
  };

  /* ── File Ingestion / Adding ─────────────────────────── */
  const addPdfFiles = (incomingFiles) => {
    setErrorMsg('');
    if (!incomingFiles || incomingFiles.length === 0) return;

    const validFiles = [];
    let currentTotalSize = items.reduce((sum, item) => sum + item.file.size, 0);

    for (const f of incomingFiles) {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        setErrorMsg(`"${f.name}" is not a PDF file. Please select only PDF files.`);
        return;
      }
      if (f.size > 50 * 1024 * 1024) {
        setErrorMsg(`"${f.name}" exceeds the 50 MB per-file limit.`);
        return;
      }
      currentTotalSize += f.size;
      if (currentTotalSize > 150 * 1024 * 1024) {
        setErrorMsg('Total combined file size exceeds 150 MB limit.');
        return;
      }

      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: f,
        name: f.name,
        size: f.size,
        pageCount: 1,
        rotation: 0,
        thumbnail: null
      };
      validFiles.push(newItem);
    }

    if (validFiles.length > 0) {
      setItems(prev => {
        const updated = [...prev, ...validFiles];
        return updated;
      });

      // Asynchronously process thumbnails and accurate page counts
      validFiles.forEach(fileItem => {
        processPdfFile(fileItem);
      });
    }
  };

  /* ── Reordering Functions ────────────────────────────── */
  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOverCard = (e, id) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDragEndCard = () => {
    if (draggedItemId && dragOverItemId && draggedItemId !== dragOverItemId) {
      const fromIndex = items.findIndex(it => it.id === draggedItemId);
      const toIndex = items.findIndex(it => it.id === dragOverItemId);
      if (fromIndex !== -1 && toIndex !== -1) {
        moveItem(fromIndex, toIndex);
      }
    }
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  /* ── Card Rotations & Removal ────────────────────────── */
  const rotateItem = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextRot = (item.rotation + 90) % 360;
        return { ...item, rotation: nextRot };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    setErrorMsg('');
  };

  const sortByNameAZ = () => {
    setItems(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
  };

  const sortByNameZA = () => {
    setItems(prev => [...prev].sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true })));
  };

  /* ── Core Merge Logic (iLovePDF Style) ───────────────── */
  const handleMerge = async () => {
    if (items.length < 2) {
      setErrorMsg('Please add at least 2 PDF files to merge.');
      return;
    }

    setStatus('processing');
    setProgress(5);
    setProgressText('Initializing PDF merge engine...');
    setErrorMsg('');

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPagesAdded = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const pct = 10 + Math.round(((i + 1) / items.length) * 75);
        setProgress(pct);
        setProgressText(`Processing document ${i + 1} of ${items.length}: "${item.name}"...`);

        const arrayBuffer = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);

        copiedPages.forEach(page => {
          if (item.rotation !== 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + item.rotation) % 360));
          }
          mergedPdf.addPage(page);
          totalPagesAdded++;
        });
      }

      setProgress(90);
      setProgressText('Packaging merged PDF file...');

      const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
      const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(mergedBlob);

      const cleanBaseName = items[0].name.replace(/\.pdf$/i, '');
      const outName = `${cleanBaseName}_merged.pdf`;

      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setResultSize(mergedBlob.size);
      setResultPageCount(totalPagesAdded);
      setProgress(100);
      setStatus('completed');

      // Track conversion
      analytics.trackToolExecution('merge-pdf', true, {
        fileCount: items.length,
        totalPages: totalPagesAdded,
        totalBytes: mergedBlob.size
      });

      // Trigger automatic instant download for best UX
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('PDF Merge Error:', err);
      setErrorMsg(err.message || 'An error occurred while merging your PDF files. Please ensure the files are not password-protected or corrupted.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setResultBlobUrl(null);
    setResultFilename('pdfora_merged.pdf');
    setResultSize(0);
    setResultPageCount(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setItems([]);
  };

  /* ── Total Calculations ──────────────────────────────── */
  const totalPagesSum = items.reduce((sum, item) => sum + (item.pageCount || 1), 0);
  const totalSizeSum = items.reduce((sum, item) => sum + item.size, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* ── Error Banner ──────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg('')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. INITIAL UPLOAD SCREEN (iLovePDF Style) ───────── */}
      {status === 'idle' && items.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOverDropzone(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingOverDropzone(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOverDropzone(false);
            if (e.dataTransfer.files.length) {
              addPdfFiles(Array.from(e.dataTransfer.files));
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center transition-all flex flex-col items-center justify-center min-h-[360px] cursor-pointer ${
            isDraggingOverDropzone
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
              : 'border-zinc-300 dark:border-[#2A2E45] bg-[#F8FAFC]/60 dark:bg-[#141622]/60 hover:border-blue-400 dark:hover:border-blue-500'
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

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/25 mb-6 group-hover:scale-105 transition-transform">
            <Layers className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-lg sm:text-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-3 cursor-pointer"
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
              100% Private In-Browser Merge
            </span>
            <span>•</span>
            <span>Zero File Uploads</span>
            <span>•</span>
            <span>No File Limits</span>
          </div>
        </div>
      )}

      {/* ── 2. INTERACTIVE FILE CANVAS / WORKSPACE ─────────── */}
      {status === 'idle' && items.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm">
                {items.length}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                  {items.length} PDF {items.length === 1 ? 'file' : 'files'} selected
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {totalPagesSum} total pages • {fmt(totalSizeSum)}
                </p>
              </div>
            </div>

            {/* Sorting & Utility Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={sortByNameAZ}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#252A3D] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sort A to Z by filename"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                <span>Sort (A-Z)</span>
              </button>

              <button
                type="button"
                onClick={sortByNameZA}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#252A3D] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sort Z to A by filename"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                <span>Sort (Z-A)</span>
              </button>

              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-slate-200 dark:hover:bg-slate-800 border border-blue-200 dark:border-blue-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add More</span>
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
              >
                Clear All
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

          {/* Cards Grid with Drag-to-Reorder */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item, idx) => {
              const isBeingDragged = draggedItemId === item.id;
              const isTargetDrop = dragOverItemId === item.id;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOverCard(e, item.id)}
                  onDragEnd={handleDragEndCard}
                  className={`group relative rounded-2xl bg-white dark:bg-[#141622] border transition-all select-none flex flex-col p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing ${
                    isTargetDrop
                      ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-blue-400 dark:hover:border-blue-500'
                  } ${isBeingDragged ? 'opacity-40' : 'opacity-100'}`}
                >
                  {/* Order Index Badge */}
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-zinc-900/80 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-sm shadow">
                    {idx + 1}
                  </div>

                  {/* Top-Right Quick Card Actions */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); rotateItem(item.id); }}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-[#1B1E2E]/90 hover:bg-blue-50 dark:hover:bg-blue-950 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 shadow-sm transition-colors cursor-pointer"
                      title="Rotate 90° Clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-[#1B1E2E]/90 hover:bg-blue-50 dark:hover:bg-blue-950 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 shadow-sm transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* PDF Page 1 Preview Canvas/Thumbnail */}
                  <div className="w-full aspect-[3/4] bg-zinc-100 dark:bg-[#1B1E2E] rounded-xl overflow-hidden flex items-center justify-center relative mb-3 border border-zinc-100 dark:border-[#2A2E45]/50">
                    {item.thumbnail ? (
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform duration-200"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain shadow-xs"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center text-zinc-400 gap-1 transition-transform duration-200"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                      >
                        <FileText className="w-10 h-10 text-blue-600/60" />
                        <span className="text-[10px] font-bold text-zinc-400">PDF</span>
                      </div>
                    )}

                    {/* Rotation indicator badge if rotated */}
                    {item.rotation !== 0 && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white shadow">
                        {item.rotation}°
                      </div>
                    )}
                  </div>

                  {/* File Metadata */}
                  <div className="mt-auto space-y-1">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      <span>{item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}</span>
                      <span>{fmt(item.size)}</span>
                    </div>
                  </div>

                  {/* Move Left / Right Mini Arrows */}
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-zinc-400">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveItem(idx, idx - 1); }}
                      className="p-1 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Left"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[9px] font-mono text-zinc-400">Drag to reorder</span>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveItem(idx, idx + 1); }}
                      className="p-1 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Right"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* + Add More Card */}
            <div
              onClick={() => addMoreInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-[#2A2E45] hover:border-blue-400 dark:hover:border-blue-500 bg-zinc-50/50 dark:bg-[#141622]/30 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[220px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600">
                Add More PDFs
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Click or drop files</span>
            </div>
          </div>

          {/* Big Sticky Action Bar */}
          <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#141622]/95 backdrop-blur-md border border-zinc-200 dark:border-[#2A2E45] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                  Ready to merge {items.length} PDF {items.length === 1 ? 'file' : 'files'}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Total of {totalPagesSum} pages will be combined in this exact sequence.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={items.length < 2}
              onClick={handleMerge}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Merge PDF</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 3. PROCESSING SCREEN ───────────────────────────── */}
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
              Merging your PDF files...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Assembling pages in order...'}
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

      {/* ── 4. COMPLETION & DOWNLOAD SCREEN (iLovePDF Style) ─ */}
      {status === 'completed' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-8 sm:p-14 text-center space-y-6 shadow-sm animate-scale-up">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              PDFs have been merged!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Your documents have been merged into a single standardized PDF file.
            </p>
          </div>

          {/* Output Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{resultFilename}</span>
            <span>•</span>
            <span>{resultPageCount} pages</span>
            <span>•</span>
            <span>{fmt(resultSize)}</span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Merged PDF</span>
            </a>

            <button
              type="button"
              onClick={() => setShowResultPreview(!showResultPreview)}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{showResultPreview ? 'Hide Preview' : 'Preview'}</span>
            </button>
          </div>

          {/* PDF Viewer / Preview Iframe */}
          {showResultPreview && resultBlobUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-[#2A2E45] shadow-inner max-w-3xl mx-auto">
              <iframe
                src={`${resultBlobUrl}#toolbar=0`}
                title="Merged PDF Preview"
                className="w-full h-[480px] bg-zinc-800"
              />
            </div>
          )}

          {/* Start Over Action */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Merge more files or start over</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
