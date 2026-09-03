import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, File, X, Plus, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, ArrowUpDown, Trash2, RotateCw, Check,
  Scissors, Layers, Eye, RefreshCw, ZoomIn, ZoomOut
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

export default function SplitPdfTool() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageThumbnails, setPageThumbnails] = useState([]); // Array of { pageNum: 1, thumbnail: string }
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [thumbnailZoom, setThumbnailZoom] = useState('normal'); // 'compact' | 'normal' | 'large'
  const [globalRotation, setGlobalRotation] = useState(0);

  // Split Configuration
  const [mode, setMode] = useState('range'); // 'range' | 'extract'
  const [rangeType, setRangeType] = useState('custom'); // 'custom' | 'fixed'
  const [ranges, setRanges] = useState([{ id: 1, from: 1, to: 1 }]);
  const [fixedPages, setFixedPages] = useState(2);
  const [mergeRanges, setMergeRanges] = useState(false);

  const [extractMode, setExtractMode] = useState('select'); // 'all' | 'select'
  const [extractPagesText, setExtractPagesText] = useState('1');
  const [mergeExtracted, setMergeExtracted] = useState(false);

  // Processing & Results
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading_file' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [isResultZip, setIsResultZip] = useState(false);
  const [generatedFilesCount, setGeneratedFilesCount] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

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

  /* ── File Selection & PDF.js Rendering ────────────────── */
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
    setProgressText('Loading PDF and rendering page previews...');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      
      // Load page count via PDFDocument
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);

      // Initialize defaults
      setRanges([{ id: 1, from: 1, to: count }]);
      setExtractPagesText(`1-${Math.min(count, 3)}`);
      setFixedPages(Math.max(1, Math.min(2, count)));

      const initialThumbs = Array.from({ length: count }, (_, i) => ({
        pageNum: i + 1,
        thumbnail: null
      }));
      setPageThumbnails(initialThumbs);
      setStatus('idle');

      // Async render thumbnails with PDF.js
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;

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

            setPageThumbnails(prev => prev.map(p => p.pageNum === i ? { ...p, thumbnail: dataUrl } : p));
          } catch (pErr) {
            console.warn(`Could not render thumbnail for page ${i}:`, pErr);
          }
        }
      } catch (pdfjsErr) {
        console.warn('PDF.js thumbnail rendering notice:', pdfjsErr);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to read PDF document. The file may be password-protected or corrupted.');
      setFile(null);
      setStatus('idle');
    }
  };

  /* ── Range Handlers ───────────────────────────────────── */
  const handleRangeChange = (rangeId, field, value) => {
    let numVal = parseInt(value, 10);
    if (isNaN(numVal)) numVal = 1;
    numVal = Math.max(1, Math.min(numVal, totalPages));

    setRanges(prev => prev.map(r => {
      if (r.id === rangeId) {
        return { ...r, [field]: numVal };
      }
      return r;
    }));
  };

  const addRange = () => {
    const last = ranges[ranges.length - 1] || { from: 1, to: totalPages };
    let nextFrom = Math.min(last.to + 1, totalPages);
    let nextTo = totalPages;
    if (nextFrom > totalPages) {
      nextFrom = 1;
      nextTo = totalPages;
    }
    setRanges(prev => [...prev, { id: Date.now(), from: nextFrom, to: nextTo }]);
  };

  const removeRange = (rangeId) => {
    if (ranges.length <= 1) return;
    setRanges(prev => prev.filter(r => r.id !== rangeId));
  };

  /* ── Extract Page Selection Handlers ──────────────────── */
  const selectedPageSet = parsePageNumbers(extractPagesText, totalPages);

  const togglePageSelection = (pageNum) => {
    const updatedSet = new Set(selectedPageSet);
    if (updatedSet.has(pageNum)) {
      updatedSet.delete(pageNum);
    } else {
      updatedSet.add(pageNum);
    }
    const sorted = Array.from(updatedSet).sort((a, b) => a - b);
    setExtractPagesText(sorted.join(', '));
  };

  const applyExtractPreset = (preset) => {
    if (preset === 'all') {
      setExtractPagesText(`1-${totalPages}`);
    } else if (preset === 'odd') {
      const odd = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 !== 0);
      setExtractPagesText(odd.join(', '));
    } else if (preset === 'even') {
      const even = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 0);
      setExtractPagesText(even.join(', '));
    } else if (preset === 'clear') {
      setExtractPagesText('');
    }
  };

  /* ── Check if a page belongs to any range (for styling) ─ */
  const getPageRangeInfo = (pageNum) => {
    if (mode !== 'range') return null;

    if (rangeType === 'custom') {
      for (let i = 0; i < ranges.length; i++) {
        const r = ranges[i];
        const minP = Math.min(r.from, r.to);
        const maxP = Math.max(r.from, r.to);
        if (pageNum >= minP && pageNum <= maxP) {
          return { rangeIndex: i + 1, colorIndex: i % 4 };
        }
      }
      return null;
    }

    if (rangeType === 'fixed') {
      const size = Math.max(1, fixedPages);
      const chunkIndex = Math.floor((pageNum - 1) / size) + 1;
      return { rangeIndex: chunkIndex, colorIndex: (chunkIndex - 1) % 4 };
    }

    return null;
  };

  /* ── Core Split Execution Engine ──────────────────────── */
  const handleSplitPdf = async () => {
    if (!file || totalPages === 0) return;

    setStatus('processing');
    setProgress(10);
    setProgressText('Preparing document split...');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const baseName = file.name.replace(/\.pdf$/i, '');

      // Case 1: SPLIT BY RANGE
      if (mode === 'range') {
        let activeRanges = [];

        if (rangeType === 'custom') {
          activeRanges = ranges.map((r, idx) => ({
            from: Math.max(1, Math.min(r.from, totalPages)),
            to: Math.max(1, Math.min(r.to, totalPages)),
            id: idx + 1
          }));
        } else {
          // Fixed ranges
          const size = Math.max(1, fixedPages);
          let rId = 1;
          for (let start = 1; start <= totalPages; start += size) {
            activeRanges.push({
              from: start,
              to: Math.min(totalPages, start + size - 1),
              id: rId++
            });
          }
        }

        if (activeRanges.length === 0) {
          throw new Error('Please specify at least one valid page range.');
        }

        // Subcase A: Merge all ranges into 1 PDF
        if (mergeRanges || activeRanges.length === 1) {
          setProgress(40);
          setProgressText('Combining selected ranges into one PDF...');
          const mergedDoc = await PDFDocument.create();

          for (const r of activeRanges) {
            const minP = Math.min(r.from, r.to);
            const maxP = Math.max(r.from, r.to);
            const indices = [];
            for (let p = minP; p <= maxP; p++) indices.push(p - 1);

            const copied = await mergedDoc.copyPages(srcDoc, indices);
            copied.forEach(page => {
              if (globalRotation) page.setRotation(degrees((page.getRotation().angle + globalRotation) % 360));
              mergedDoc.addPage(page);
            });
          }

          const outBytes = await mergedDoc.save({ useObjectStreams: true });
          const blob = new Blob([outBytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          const outName = `${baseName}_split_merged.pdf`;

          setResultBlobUrl(blobUrl);
          setResultFilename(outName);
          setResultSize(blob.size);
          setIsResultZip(false);
          setGeneratedFilesCount(1);
          setProgress(100);
          setStatus('completed');
          triggerDownload(blobUrl, outName);
          return;
        }

        // Subcase B: Split into individual PDFs packaged in ZIP
        setProgress(30);
        setProgressText(`Generating ${activeRanges.length} split PDF files...`);
        const zip = new JSZip();

        for (let i = 0; i < activeRanges.length; i++) {
          const r = activeRanges[i];
          const pct = 30 + Math.round(((i + 1) / activeRanges.length) * 55);
          setProgress(pct);
          setProgressText(`Creating Range ${r.id} (Pages ${r.from}-${r.to})...`);

          const subDoc = await PDFDocument.create();
          const minP = Math.min(r.from, r.to);
          const maxP = Math.max(r.from, r.to);
          const indices = [];
          for (let p = minP; p <= maxP; p++) indices.push(p - 1);

          const copied = await subDoc.copyPages(srcDoc, indices);
          copied.forEach(page => {
            if (globalRotation) page.setRotation(degrees((page.getRotation().angle + globalRotation) % 360));
            subDoc.addPage(page);
          });

          const subBytes = await subDoc.save({ useObjectStreams: true });
          zip.file(`${baseName}_part_${i + 1}_(pages_${minP}-${maxP}).pdf`, subBytes);
        }

        setProgress(90);
        setProgressText('Compressing split files into ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const blobUrl = URL.createObjectURL(zipBlob);
        const outName = `${baseName}_split_pages.zip`;

        setResultBlobUrl(blobUrl);
        setResultFilename(outName);
        setResultSize(zipBlob.size);
        setIsResultZip(true);
        setGeneratedFilesCount(activeRanges.length);
        setProgress(100);
        setStatus('completed');
        triggerDownload(blobUrl, outName);
        return;
      }

      // Case 2: EXTRACT PAGES
      if (mode === 'extract') {
        let pagesToExtract = [];

        if (extractMode === 'all') {
          for (let i = 1; i <= totalPages; i++) pagesToExtract.push(i);
        } else {
          pagesToExtract = Array.from(selectedPageSet).sort((a, b) => a - b);
        }

        if (pagesToExtract.length === 0) {
          throw new Error('Please select at least one page to extract.');
        }

        // Subcase A: Merge extracted pages into one continuous PDF
        if (mergeExtracted || pagesToExtract.length === 1) {
          setProgress(40);
          setProgressText(`Merging ${pagesToExtract.length} extracted pages...`);
          const extractedDoc = await PDFDocument.create();
          const indices = pagesToExtract.map(p => p - 1);

          const copied = await extractedDoc.copyPages(srcDoc, indices);
          copied.forEach(page => {
            if (globalRotation) page.setRotation(degrees((page.getRotation().angle + globalRotation) % 360));
            extractedDoc.addPage(page);
          });

          const outBytes = await extractedDoc.save({ useObjectStreams: true });
          const blob = new Blob([outBytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          const outName = `${baseName}_extracted.pdf`;

          setResultBlobUrl(blobUrl);
          setResultFilename(outName);
          setResultSize(blob.size);
          setIsResultZip(false);
          setGeneratedFilesCount(1);
          setProgress(100);
          setStatus('completed');
          triggerDownload(blobUrl, outName);
          return;
        }

        // Subcase B: Extract every page as separate 1-page PDF in ZIP
        setProgress(30);
        setProgressText(`Extracting ${pagesToExtract.length} separate single-page PDFs...`);
        const zip = new JSZip();

        for (let i = 0; i < pagesToExtract.length; i++) {
          const pageNum = pagesToExtract[i];
          const pct = 30 + Math.round(((i + 1) / pagesToExtract.length) * 55);
          setProgress(pct);
          setProgressText(`Exporting page ${pageNum} (${i + 1}/${pagesToExtract.length})...`);

          const singlePageDoc = await PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [pageNum - 1]);
          if (globalRotation) copiedPage.setRotation(degrees((copiedPage.getRotation().angle + globalRotation) % 360));
          singlePageDoc.addPage(copiedPage);

          const singleBytes = await singlePageDoc.save({ useObjectStreams: true });
          zip.file(`${baseName}_page_${pageNum}.pdf`, singleBytes);
        }

        setProgress(90);
        setProgressText('Compressing extracted PDFs into ZIP...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const blobUrl = URL.createObjectURL(zipBlob);
        const outName = `${baseName}_extracted_pages.zip`;

        setResultBlobUrl(blobUrl);
        setResultFilename(outName);
        setResultSize(zipBlob.size);
        setIsResultZip(true);
        setGeneratedFilesCount(pagesToExtract.length);
        setProgress(100);
        setStatus('completed');
        triggerDownload(blobUrl, outName);
        return;
      }

    } catch (err) {
      console.error('Split execution error:', err);
      setErrorMsg(err.message || 'An error occurred while splitting the PDF.');
      setStatus('idle');
    }
  };

  const triggerDownload = (url, filename) => {
    analytics.trackToolExecution('split-pdf', true, { filename });
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setTotalPages(0);
    setPageThumbnails([]);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setRanges([{ id: 1, from: 1, to: 1 }]);
    setErrorMsg('');
  };

  const rangeColorClasses = [
    { border: 'border-blue-500 ring-2 ring-blue-500/30', badge: 'bg-blue-600 text-white', label: 'Range 1' },
    { border: 'border-blue-500 ring-2 ring-blue-500/30', badge: 'bg-blue-600 text-white', label: 'Range 2' },
    { border: 'border-emerald-500 ring-2 ring-emerald-500/30', badge: 'bg-emerald-600 text-white', label: 'Range 3' },
    { border: 'border-purple-500 ring-2 ring-purple-500/30', badge: 'bg-purple-600 text-white', label: 'Range 4' },
  ];

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
            <Scissors className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser Split
            </span>
            <span>•</span>
            <span>Extract Pages & Custom Ranges</span>
            <span>•</span>
            <span>Zip Export Included</span>
          </div>
        </div>
      )}

      {/* ── 2. LOADING PDF PREVIEWS STATE ──────────────────── */}
      {status === 'loading_file' && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {progressText || 'Reading PDF pages...'}
          </p>
        </div>
      )}

      {/* ── 3. INTERACTIVE SPLIT WORKSPACE (iLovePDF Style) ─── */}
      {status === 'idle' && file && totalPages > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">

          {/* ── LEFT: INTERACTIVE PAGE THUMBNAILS CANVAS (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Canvas Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Pages Canvas
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-600 dark:text-zinc-300">
                  {totalPages} total pages
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Extract Quick Presets (Only when in Extract Select mode) */}
                {mode === 'extract' && extractMode === 'select' && (
                  <div className="flex items-center gap-1.5 mr-2">
                    <button
                      type="button"
                      onClick={() => applyExtractPreset('all')}
                      className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExtractPreset('odd')}
                      className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Odd
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExtractPreset('even')}
                      className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Even
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExtractPreset('clear')}
                      className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#1B1E2E] dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Rotate Canvas */}
                <button
                  type="button"
                  onClick={() => setGlobalRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1B1E2E] dark:hover:bg-[#252A3D] text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Rotate all pages 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rotate</span>
                </button>

                {/* Grid Density Zoom */}
                <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-[#1B1E2E] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setThumbnailZoom('compact')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      thumbnailZoom === 'compact' ? 'bg-white dark:bg-[#2A2E45] shadow-xs text-blue-600' : 'text-zinc-500'
                    }`}
                  >
                    S
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailZoom('normal')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      thumbnailZoom === 'normal' ? 'bg-white dark:bg-[#2A2E45] shadow-xs text-blue-600' : 'text-zinc-500'
                    }`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailZoom('large')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      thumbnailZoom === 'large' ? 'bg-white dark:bg-[#2A2E45] shadow-xs text-blue-600' : 'text-zinc-500'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Page Thumbnails Grid */}
            <div
              className={`grid gap-3.5 p-4 rounded-3xl bg-zinc-100/50 dark:bg-[#141622]/40 border border-zinc-200/80 dark:border-[#2A2E45] max-h-[72vh] overflow-y-auto ${
                thumbnailZoom === 'compact'
                  ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
                  : thumbnailZoom === 'large'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {pageThumbnails.map((p) => {
                const isSelectedExtract = mode === 'extract' && (extractMode === 'all' || selectedPageSet.has(p.pageNum));
                const rangeInfo = getPageRangeInfo(p.pageNum);

                let cardBorderClass = 'border-zinc-200 dark:border-[#2A2E45] opacity-80';
                if (mode === 'extract') {
                  if (isSelectedExtract) {
                    cardBorderClass = 'border-blue-500 ring-2 ring-blue-500/40 opacity-100 scale-[1.02] shadow-md';
                  } else {
                    cardBorderClass = 'border-zinc-200 dark:border-[#2A2E45] opacity-40 hover:opacity-80';
                  }
                } else if (mode === 'range' && rangeInfo) {
                  const style = rangeColorClasses[rangeInfo.colorIndex];
                  cardBorderClass = `${style.border} opacity-100 shadow-sm`;
                }

                return (
                  <div
                    key={p.pageNum}
                    onClick={() => {
                      if (mode === 'extract' && extractMode === 'select') {
                        togglePageSelection(p.pageNum);
                      }
                    }}
                    className={`group relative rounded-2xl bg-white dark:bg-[#1B1E2E] border p-2.5 flex flex-col items-center justify-between transition-all select-none ${cardBorderClass} ${
                      mode === 'extract' && extractMode === 'select' ? 'cursor-pointer hover:border-blue-400' : ''
                    }`}
                  >
                    {/* Page Number Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-zinc-900/80 text-white text-[10px] font-black backdrop-blur-sm shadow-xs">
                      {p.pageNum}
                    </div>

                    {/* Range Tag Badge (When in Range Mode) */}
                    {mode === 'range' && rangeInfo && (
                      <div
                        className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-black shadow-xs ${
                          rangeColorClasses[rangeInfo.colorIndex].badge
                        }`}
                      >
                        Range {rangeInfo.rangeIndex}
                      </div>
                    )}

                    {/* Checkmark Badge (When in Extract Mode) */}
                    {mode === 'extract' && isSelectedExtract && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Thumbnail Render Canvas */}
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#141622] flex items-center justify-center my-1.5 relative border border-zinc-100 dark:border-[#2A2E45]/40">
                      {p.thumbnail ? (
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-200"
                          style={{ transform: `rotate(${globalRotation}deg)` }}
                        >
                          <img
                            src={p.thumbnail}
                            alt={`Page ${p.pageNum}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center text-zinc-400 gap-1"
                          style={{ transform: `rotate(${globalRotation}deg)` }}
                        >
                          <FileText className="w-8 h-8 text-blue-600/50" />
                          <span className="text-[10px] font-bold">Page {p.pageNum}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                      Page {p.pageNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: ILovePDF-STYLE OPTIONS SIDEBAR (4 Cols) ─ */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            {/* File Info Card */}
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

            {/* Split Mode Switcher (Split by range vs Extract pages) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E]">
                <button
                  type="button"
                  onClick={() => setMode('range')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'range'
                      ? 'bg-white dark:bg-[#2A2E45] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Split by range</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('extract')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'extract'
                      ? 'bg-white dark:bg-[#2A2E45] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Extract pages</span>
                </button>
              </div>

              {/* ── OPTION A: SPLIT BY RANGE CONTROLS ──────── */}
              {mode === 'range' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Range Type: Custom vs Fixed */}
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rangeType"
                        checked={rangeType === 'custom'}
                        onChange={() => setRangeType('custom')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Custom ranges</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rangeType"
                        checked={rangeType === 'fixed'}
                        onChange={() => setRangeType('fixed')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Fixed ranges</span>
                    </label>
                  </div>

                  {/* Custom Ranges Input Rows */}
                  {rangeType === 'custom' && (
                    <div className="space-y-3">
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {ranges.map((r, idx) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45]"
                          >
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                              Range {idx + 1}:
                            </span>

                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              <span>from</span>
                              <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={r.from}
                                onChange={(e) => handleRangeChange(r.id, 'from', e.target.value)}
                                className="w-14 px-2 py-1 rounded-lg border border-zinc-300 dark:border-[#2A2E45] bg-white dark:bg-[#141622] text-center font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                              <span>to</span>
                              <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={r.to}
                                onChange={(e) => handleRangeChange(r.id, 'to', e.target.value)}
                                className="w-14 px-2 py-1 rounded-lg border border-zinc-300 dark:border-[#2A2E45] bg-white dark:bg-[#141622] text-center font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {ranges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRange(r.id)}
                                className="p-1 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Delete Range"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addRange}
                        className="w-full py-2 px-3 rounded-xl border border-dashed border-blue-300 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100/50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Range</span>
                      </button>

                      {/* Merge Ranges Checkbox */}
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mergeRanges}
                          onChange={(e) => setMergeRanges(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            Merge all ranges in one PDF file
                          </p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {mergeRanges
                              ? 'Combines all ranges into a single continuous PDF.'
                              : 'Downloads each range as its own PDF (bundled in a ZIP).'}
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Fixed Ranges Input */}
                  {rangeType === 'fixed' && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Split into files of:
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={fixedPages}
                            onChange={(e) => setFixedPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-16 px-2 py-1 rounded-lg border border-zinc-300 dark:border-[#2A2E45] bg-white dark:bg-[#141622] text-center font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium text-zinc-500">pages</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-[#141622] p-2.5 rounded-xl border border-zinc-100 dark:border-[#2A2E45]">
                        💡 This document will be split into <strong>{Math.ceil(totalPages / (fixedPages || 1))}</strong> separate PDF files (in a ZIP).
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* ── OPTION B: EXTRACT PAGES CONTROLS ───────── */}
              {mode === 'extract' && (
                <div className="space-y-4 animate-fade-in">
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExtractMode('all')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        extractMode === 'all'
                          ? 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800'
                          : 'bg-white dark:bg-[#1B1E2E] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-[#2A2E45]'
                      }`}
                    >
                      Extract all pages
                    </button>

                    <button
                      type="button"
                      onClick={() => setExtractMode('select')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        extractMode === 'select'
                          ? 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800'
                          : 'bg-white dark:bg-[#1B1E2E] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-[#2A2E45]'
                      }`}
                    >
                      Select pages
                    </button>
                  </div>

                  {extractMode === 'all' && (
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] text-left">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Extract every single page
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                        All {totalPages} pages will be converted into individual single-page PDF files and packaged into a ZIP.
                      </p>
                    </div>
                  )}

                  {extractMode === 'select' && (
                    <div className="space-y-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                          Selected Pages:
                        </label>
                        <input
                          type="text"
                          value={extractPagesText}
                          placeholder={`e.g. 1, 3, 5-${totalPages}`}
                          onChange={(e) => setExtractPagesText(e.target.value)}
                          className="w-full text-xs rounded-xl px-3 py-2 border border-zinc-300 dark:border-[#2A2E45] bg-white dark:bg-[#141622] font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-[10px] text-zinc-400">
                          Click page thumbnails on the left or type numbers above.
                        </p>
                      </div>

                      {/* Merge Extracted Pages Checkbox */}
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mergeExtracted}
                          onChange={(e) => setMergeExtracted(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            Merge extracted pages into one PDF
                          </p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {mergeExtracted
                              ? 'Combines selected pages into a single PDF.'
                              : 'Downloads each selected page as an individual file in a ZIP.'}
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                </div>
              )}

              {/* Big Prominent Action Button */}
              <button
                type="button"
                onClick={handleSplitPdf}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Split PDF</span>
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
              Splitting your PDF document...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Extracting requested pages...'}
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
              PDF has been split!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {isResultZip
                ? `Generated ${generatedFilesCount} separate PDF documents bundled into a ZIP archive.`
                : 'Your selected pages have been successfully saved into a clean standardized PDF.'}
            </p>
          </div>

          {/* Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{resultFilename}</span>
            <span>•</span>
            <span>{isResultZip ? `${generatedFilesCount} files in ZIP` : 'Single PDF'}</span>
            <span>•</span>
            <span>{fmt(resultSize)}</span>
          </div>

          {/* Download & Preview Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{isResultZip ? 'Download ZIP Archive' : 'Download Split PDF'}</span>
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

          {/* Preview Iframe if single PDF */}
          {showPreview && !isResultZip && resultBlobUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-[#2A2E45] shadow-inner max-w-3xl mx-auto">
              <iframe
                src={`${resultBlobUrl}#toolbar=0`}
                title="Split PDF Preview"
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
              <span>Split another PDF document</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
