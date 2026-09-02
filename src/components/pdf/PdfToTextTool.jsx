import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Plus, Copy, Check, Languages, Cpu
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { analytics } from '../../services/analytics';

// PDF.js dynamic loader
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

export default function PdfToTextTool() {
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState({ pages: 0, thumbnail: null });
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // OCR Settings
  const [ocrLanguage, setOcrLanguage] = useState('eng'); // 'eng' | 'spa' | 'fra' | 'deu' | 'ara' | 'urd'
  const [extractionMode, setExtractionMode] = useState('hybrid'); // 'hybrid' | 'force_ocr'

  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Results
  const [extractedText, setExtractedText] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    };
  }, [resultBlobUrl]);

  const fmt = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');

    const isPdf = incomingFile.type === 'application/pdf' || incomingFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setFile(incomingFile);

    try {
      const pdfjs = await loadPdfJs();
      const buf = await incomingFile.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
      const count = doc.numPages;

      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

      setFileMeta({ pages: count, thumbnail });
    } catch (err) {
      console.warn('Metadata load error:', err);
    }
  };

  /* ── Core OCR & Text Extraction Engine ─────────────────── */
  const handleExtractText = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(10);
    setProgressText('Loading PDF pages...');
    setErrorMsg('');

    try {
      const pdfjs = await loadPdfJs();
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
      const numPages = doc.numPages;

      let fullText = '';
      let tesseractWorker = null;

      for (let pNum = 1; pNum <= numPages; pNum++) {
        const page = await doc.getPage(pNum);
        const textContent = await page.getTextContent();
        const nativePageText = textContent.items.map(it => it.str).join(' ').trim();

        const pct = 10 + Math.round(((pNum - 1) / numPages) * 80);
        setProgress(pct);

        // If native text is present and mode is hybrid, use fast native extraction
        if (nativePageText.length > 30 && extractionMode === 'hybrid') {
          setProgressText(`Extracted digital text from page ${pNum} of ${numPages}...`);
          fullText += `\n\n--- Page ${pNum} ---\n` + nativePageText;
        } else {
          // Render page to canvas and run Tesseract OCR
          setProgressText(`Running OCR character recognition on page ${pNum} of ${numPages}...`);

          if (!tesseractWorker) {
            tesseractWorker = await createWorker(ocrLanguage);
          }

          const viewport = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;

          const ocrRes = await tesseractWorker.recognize(canvas);
          const recognizedText = ocrRes.data.text.trim();

          fullText += `\n\n--- Page ${pNum} (OCR) ---\n` + (recognizedText || '[No readable text detected on this page]');
        }
      }

      if (tesseractWorker) {
        await tesseractWorker.terminate();
      }

      setProgress(95);
      setProgressText('Packaging plain text (.txt) file...');

      const textClean = fullText.trim();
      const blob = new Blob([textClean], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.pdf$/i, '.txt');

      setExtractedText(textClean);
      setResultBlobUrl(blobUrl);
      setResultFilename(outName);
      setProgress(100);
      setStatus('completed');

      analytics.trackToolExecution('ocr-pdf-to-text', true, { pages: numPages, mode: extractionMode });

      // Auto Download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to extract text from PDF: ' + (err.message || err));
      setStatus('idle');
    }
  };

  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {}
  };

  const handleReset = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setFile(null);
    setFileMeta({ pages: 0, thumbnail: null });
    setExtractedText('');
    setResultBlobUrl(null);
    setResultFilename('');
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

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

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/25 mb-6 group-hover:scale-105 transition-transform">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
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
              100% Private In-Browser OCR
            </span>
            <span>•</span>
            <span>Works on Scanned Photocopies &amp; Invoices</span>
            <span>•</span>
            <span>Accurate Searchable Text Output</span>
          </div>
        </div>
      )}

      {/* ── 2. INTERACTIVE WORKSPACE (iLovePDF Style) ───────── */}
      {status === 'idle' && file && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* ── LEFT: FILE CARD (8 Cols) ────────────────────── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-100/70 dark:bg-[#141622]/60 border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-center min-h-[440px]">
              
              <div className="relative rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-5 shadow-md flex flex-col items-center text-center max-w-xs w-full">
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute -top-2 -right-2 p-1.5 bg-zinc-900 text-white hover:bg-red-600 rounded-full shadow-md text-xs cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="w-full aspect-[3/4] bg-zinc-100 dark:bg-[#1B1E2E] rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                  {fileMeta.thumbnail ? (
                    <img src={fileMeta.thumbnail} alt={file.name} className="w-full h-full object-contain" />
                  ) : (
                    <FileText className="w-12 h-12 text-zinc-400" />
                  )}
                </div>

                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate w-full" title={file.name}>
                  {file.name}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mt-1">
                  <span>{fileMeta.pages} pages</span>
                  <span>•</span>
                  <span>{fmt(file.size)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT: OCR OPTIONS SIDEBAR (4 Cols) ─────────── */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div className="space-y-1 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  OCR PDF to Text Options
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Recognize and extract text from digital or scanned PDF documents.
                </p>
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-red-600" />
                  <span>Document Language:</span>
                </label>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value)}
                  className="w-full text-xs rounded-xl p-2.5 border border-zinc-300 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] font-bold text-zinc-800 dark:text-zinc-200"
                >
                  <option value="eng">English</option>
                  <option value="spa">Spanish (Español)</option>
                  <option value="fra">French (Français)</option>
                  <option value="deu">German (Deutsch)</option>
                  <option value="ara">Arabic (العربية)</option>
                  <option value="urd">Urdu (اردو)</option>
                </select>
              </div>

              {/* Extraction Mode Cards */}
              <div className="space-y-2.5">
                <div
                  onClick={() => setExtractionMode('hybrid')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    extractionMode === 'hybrid'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      Smart Hybrid OCR
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Fast instant extraction for digital text + OCR for scanned pages and images.
                  </p>
                </div>

                <div
                  onClick={() => setExtractionMode('force_ocr')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    extractionMode === 'force_ocr'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      Deep OCR on All Pages
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300">
                      Deep Scan
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Runs optical recognition through every page regardless of digital layers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExtractText}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Extract Text (OCR)</span>
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
              Running OCR Text Extraction...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Analyzing document and recognizing characters...'}
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

      {/* ── 4. COMPLETION & TEXT VIEWER SCREEN ─────────────── */}
      {status === 'completed' && extractedText && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-6 sm:p-10 text-center space-y-6 shadow-sm animate-scale-up">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              Text Extracted Successfully!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your document has been processed with OCR. You can copy the text below or download the .txt file.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
            <a
              href={resultBlobUrl}
              download={resultFilename}
              className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .TXT</span>
            </a>

            <button
              type="button"
              onClick={handleCopyText}
              className="px-6 py-3 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#252A3D] text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          {/* Text Output Box */}
          <div className="max-w-3xl mx-auto text-left space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Recognized Content Preview:
            </label>
            <textarea
              readOnly
              value={extractedText}
              rows={12}
              className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#141622] font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed focus:outline-none resize-y"
            />
          </div>

          {/* Start Over */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Extract from another PDF</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
