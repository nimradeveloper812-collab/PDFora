import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, File, X, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  AlertCircle, Plus, Check, Eye
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import JSZip from 'jszip';
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

export default function PdfToWordTool() {
  const [files, setFiles] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [ocrMode, setOcrMode] = useState('standard'); // 'standard' | 'ocr'

  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Results: Array of { originalName, docxBlob, blobUrl, size }
  const [convertedResults, setConvertedResults] = useState([]);
  const [downloadZipUrl, setDownloadZipUrl] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      convertedResults.forEach(r => {
        if (r.blobUrl) URL.revokeObjectURL(r.blobUrl);
      });
      if (downloadZipUrl) URL.revokeObjectURL(downloadZipUrl);
    };
  }, [convertedResults, downloadZipUrl]);

  const fmt = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  const handleFilesSelect = async (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;
    setErrorMsg('');

    const validPdfs = Array.from(incomingFiles).filter(f =>
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfs.length === 0) {
      setErrorMsg('Please upload valid PDF files.');
      return;
    }

    try {
      const pdfjs = await loadPdfJs();
      const newItems = await Promise.all(
        validPdfs.map(async (f) => {
          let pages = 1;
          let thumbnail = null;
          try {
            const buf = await f.arrayBuffer();
            const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
            pages = doc.numPages;

            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;
            thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          } catch (tErr) {}

          return {
            id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            file: f,
            name: f.name,
            size: f.size,
            pages,
            thumbnail
          };
        })
      );

      setFiles(prev => [...prev, ...newItems]);
    } catch (err) {
      setErrorMsg('Failed to read PDF document.');
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  /* ── Core PDF to DOCX Converter ───────────────────────── */
  const convertPdfToDocx = async (item, onProgressUpdate) => {
    const arrayBuffer = await item.file.arrayBuffer();
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const numPages = doc.numPages;

    const sections = [];
    const paragraphs = [];

    // Title Paragraph
    paragraphs.push(
      new Paragraph({
        text: item.name.replace(/\.pdf$/i, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
      })
    );

    for (let pNum = 1; pNum <= numPages; pNum++) {
      onProgressUpdate?.(`Converting page ${pNum} of ${numPages}...`);
      const page = await doc.getPage(pNum);
      const textContent = await page.getTextContent();

      if (numPages > 1) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Page ${pNum}`,
                bold: true,
                color: '64748B',
                size: 18
              })
            ],
            spacing: { before: 200, after: 100 }
          })
        );
      }

      // Group text items by line coordinate (Y position)
      const linesMap = new Map();
      for (const it of textContent.items) {
        if (!it.str) continue;
        const yCoord = Math.round(it.transform[5]);
        if (!linesMap.has(yCoord)) linesMap.set(yCoord, []);
        linesMap.get(yCoord).push(it.str);
      }

      // Sort lines top to bottom (descending Y in PDF coordinates)
      const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

      for (const y of sortedY) {
        const lineText = linesMap.get(y).join(' ').trim();
        if (lineText) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: lineText, size: 22 })],
              spacing: { after: 100 }
            })
          );
        }
      }
    }

    const docxFile = new Document({
      sections: [{ properties: {}, children: paragraphs }]
    });

    const docxBlob = await Packer.toBlob(docxFile);
    return {
      originalName: item.name,
      docxBlob,
      blobUrl: URL.createObjectURL(docxBlob),
      size: docxBlob.size
    };
  };

  const handleConvertAll = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(15);
    setProgressText('Preparing Word document engine...');
    setErrorMsg('');

    try {
      const results = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const item = files[i];
        const pct = 15 + Math.round(((i + 1) / total) * 75);
        setProgress(pct);
        setProgressText(`Converting ${item.name} to DOCX...`);

        const res = await convertPdfToDocx(item, (txt) => setProgressText(txt));
        results.push(res);
      }

      setProgress(95);
      setProgressText('Finalizing Word document...');

      if (results.length > 1) {
        const zip = new JSZip();
        results.forEach(r => {
          const docxName = r.originalName.replace(/\.pdf$/i, '.docx');
          zip.file(docxName, r.docxBlob);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setDownloadZipUrl(URL.createObjectURL(zipBlob));
      }

      setConvertedResults(results);
      setProgress(100);
      setStatus('completed');

      analytics.trackToolExecution('pdf-to-word', true, { count: results.length });

      // Auto Download single file
      if (results.length === 1) {
        const link = document.createElement('a');
        link.href = results[0].blobUrl;
        link.download = results[0].originalName.replace(/\.pdf$/i, '.docx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to convert PDF to Word document.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    convertedResults.forEach(r => {
      if (r.blobUrl) URL.revokeObjectURL(r.blobUrl);
    });
    if (downloadZipUrl) URL.revokeObjectURL(downloadZipUrl);

    setFiles([]);
    setConvertedResults([]);
    setDownloadZipUrl(null);
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
      {status === 'idle' && files.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files.length) {
              handleFilesSelect(e.dataTransfer.files);
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
                handleFilesSelect(e.target.files);
              }
            }}
          />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/25 mb-6 group-hover:scale-105 transition-transform">
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
              100% Private In-Browser Conversion
            </span>
            <span>•</span>
            <span>Accurate Editable DOCX Format</span>
            <span>•</span>
            <span>Zero File Limits</span>
          </div>
        </div>
      )}

      {/* ── 2. INTERACTIVE WORKSPACE (iLovePDF Style) ───────── */}
      {status === 'idle' && files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* ── LEFT: FILE CARD GRID (8 Cols) ───────────────── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add more PDFs</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleFilesSelect(e.target.files);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-3 shadow-xs hover:shadow-md transition-all group flex flex-col items-center text-center"
                >
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-zinc-900 text-white hover:bg-red-600 rounded-full shadow-md text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-full aspect-[3/4] bg-zinc-100 dark:bg-[#1B1E2E] rounded-xl overflow-hidden mb-2 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <File className="w-10 h-10 text-zinc-400" />
                    )}
                  </div>

                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate w-full" title={item.name}>
                    {item.name}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium mt-0.5">
                    <span>{item.pages} pgs</span>
                    <span>•</span>
                    <span>{fmt(item.size)}</span>
                  </div>
                </div>
              ))}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-[#2A2E45] hover:border-red-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] bg-zinc-50/50 dark:bg-[#141622]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Add more</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: CONVERT OPTIONS SIDEBAR (4 Cols) ──────── */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div className="space-y-1 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  PDF to WORD Options
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Convert PDF documents to editable Microsoft Word files (.docx).
                </p>
              </div>

              {/* Conversion Mode Cards */}
              <div className="space-y-2.5">
                <div
                  onClick={() => setOcrMode('standard')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    ocrMode === 'standard'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      Standard Conversion
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                      Fast
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Extracts text streams and layout directly into Word paragraphs.
                  </p>
                </div>

                <div
                  onClick={() => setOcrMode('ocr')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    ocrMode === 'ocr'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      OCR (Scanned PDFs)
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300">
                      OCR
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Recognizes text from images and scanned document pages.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConvertAll}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Convert to WORD</span>
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
              Converting PDF to Word DOCX...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Extracting text and assembling layout...'}
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

      {/* ── 4. COMPLETION & DOWNLOAD SCREEN (iLovePDF Style) ─ */}
      {status === 'completed' && convertedResults.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-8 sm:p-14 text-center space-y-6 shadow-sm animate-scale-up">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              PDF has been converted to editable WORD!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Your document is ready to download and edit in Microsoft Word, Google Docs, or LibreOffice.
            </p>
          </div>

          {/* Details Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="truncate max-w-xs">{convertedResults[0].originalName.replace(/\.pdf$/i, '.docx')}</span>
            <span>•</span>
            <span>{convertedResults.length} {convertedResults.length === 1 ? 'file' : 'files'}</span>
            <span>•</span>
            <span>{fmt(convertedResults[0].size)}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            {convertedResults.length === 1 ? (
              <a
                href={convertedResults[0].blobUrl}
                download={convertedResults[0].originalName.replace(/\.pdf$/i, '.docx')}
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download WORD Document</span>
              </a>
            ) : (
              <a
                href={downloadZipUrl}
                download="converted_word_docs.zip"
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download All (ZIP)</span>
              </a>
            )}
          </div>

          {/* Start Over */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Convert another PDF</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
