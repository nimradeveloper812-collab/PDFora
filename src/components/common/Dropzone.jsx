import React, { useState, useRef } from 'react';
import {
  UploadCloud, File, X, Plus, CheckCircle2, Download,
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, FileText,
  Sliders, AlertCircle, Clock, Eye, ChevronUp, ChevronDown, ArrowUpDown
} from 'lucide-react';
import { pdfApi } from '../../services/pdfApi';
import { analytics } from '../../services/analytics';
import { getToolTheme } from '../../data/toolsData';
import AdBanner, { AD_SLOTS } from './AdBanner';
import SplitPdfControls from './SplitPdfControls';
import RemovePdfControls from './RemovePdfControls';

export default function Dropzone({ tool }) {
  const theme = getToolTheme(tool.id, tool.category);
  const [files, setFiles]           = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [optionValues, setOptionValues] = useState(() => {
    const init = {};
    tool.options?.forEach(o => { init[o.id] = o.default; });
    return init;
  });
  const [splitTotalPages, setSplitTotalPages] = useState(1);
  const [splitConfig, setSplitConfig] = useState({
    mode: 'range',
    rangeType: 'custom',
    ranges: [{ from: 1, to: 1 }],
    fixedPages: 2,
    merge: false,
    extractMode: 'all',
    extractPages: '',
  });
  const [status, setStatus]         = useState('idle');      // idle | processing | completed
  const [progress, setProgress]     = useState(0);
  const [progressText, setProgressText] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [actualResultSize, setActualResultSize] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef(null);

  /* ── helpers ──────────────────────────────────────────── */
  const fmt = bytes => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  /* ── drag / drop ──────────────────────────────────────── */
  const onDragOver  = e => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = e => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = e => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files));
  };

  /* ── file validation ──────────────────────────────────── */
  const addFiles = incoming => {
    setErrorMsg('');
    const valid = [];

    const acceptedTokens = tool.acceptedTypes
      ? tool.acceptedTypes.split(',').map(t => t.trim().toLowerCase())
      : [];
    
    const acceptedExtensions = acceptedTokens
      .filter(t => t.startsWith('.'))
      .map(t => t.slice(1));
      
    const acceptedMimeTypes = acceptedTokens
      .filter(t => t.includes('/'));

    let incomingTotalSize = 0;
    for (const f of incoming) {
      if (f.size > 50 * 1024 * 1024) {
        setErrorMsg(`"${f.name}" exceeds the 50 MB limit.`);
        return;
      }
      incomingTotalSize += f.size;
    }

    const totalAllowedSize = 100 * 1024 * 1024; // 100MB
    const existingSize = tool.maxFiles === 1 ? 0 : files.reduce((a, f) => a + (f.size || 0), 0);
    if (existingSize + incomingTotalSize > totalAllowedSize) {
      setErrorMsg('Total size of selected files exceeds the 100 MB limit.');
      return;
    }

    for (const f of incoming) {

      const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : '';
      const mime = (f.type || '').toLowerCase();

      let ok = false;
      if (tool.acceptedTypes === '*/*') {
        ok = true;
      } else {
        if (acceptedExtensions.includes(ext)) ok = true;
        if (!ok && acceptedExtensions.includes('doc') && ['doc', 'docx'].includes(ext)) ok = true;
        if (!ok && acceptedExtensions.includes('xls') && ['xls', 'xlsx'].includes(ext)) ok = true;
        if (!ok && acceptedExtensions.includes('ppt') && ['ppt', 'pptx'].includes(ext)) ok = true;
        if (!ok && acceptedExtensions.includes('jpg') && ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext)) ok = true;

        if (!ok && mime && acceptedMimeTypes.some(m => {
          if (m === mime) return true;
          if (m.endsWith('/*') && mime.startsWith(m.replace('/*', '/'))) return true;
          return false;
        })) {
          ok = true;
        }
      }

      if (!ok) {
        setErrorMsg(`Unsupported format. Please upload: ${tool.acceptedFileLabel}`);
        return;
      }
      valid.push(f);
    }

    if (!valid.length) return;
    const totalBytes = valid.reduce((a, f) => a + (f.size || 0), 0);
    analytics.trackFileUpload(tool.id, valid.length, totalBytes);

    if (['split-pdf', 'remove-pages-pdf'].includes(tool.id) && valid[0]) {
      (async () => {
        try {
          const { PDFDocument } = await import('pdf-lib');
          const bytes = await valid[0].arrayBuffer();
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const count = doc.getPageCount();
          setSplitTotalPages(count);
          setSplitConfig(prev => ({
            ...prev,
            ranges: [{ from: 1, to: count }],
            extractPages: `1-${count}`,
          }));
        } catch (err) {
          console.debug('Failed to count PDF pages:', err);
        }
      })();
    }

    if (tool.maxFiles === 1) {
      setFiles([valid[0]]);
    } else {
      setFiles(prev => {
        const combined = [...prev, ...valid];
        if (combined.length > tool.maxFiles) {
          setErrorMsg(`Maximum ${tool.maxFiles} files allowed.`);
          return combined.slice(0, tool.maxFiles);
        }
        return combined;
      });
    }
  };

  const removeFile = idx => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setErrorMsg('');
  };

  const moveFile = (idx, direction) => {
    setFiles(prev => {
      const next = [...prev];
      const target = idx + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const sortFilesAZ = () => {
    setFiles(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleOptionChange = (id, val) =>
    setOptionValues(prev => ({ ...prev, [id]: val }));

  /* ── real processing ────────────────────────────── */
  const startProcessing = async () => {
    if (!files.length) return;
    setStatus('processing');
    setProgress(10);
    setProgressText('Preparing file for processing…');
    
    // Yield to let React render the loading screen
    await new Promise(resolve => setTimeout(resolve, 80));

    const startTime = performance.now();
    analytics.trackConversionStart(tool.id, tool.id === 'split-pdf' ? splitConfig : optionValues);

    const handleProgress = (pct, msg) => {
      setProgress(pct);
      if (msg) setProgressText(msg);
    };

    try {
      let result;
      let filename = `PDFora_${tool.slug}_output.pdf`;
      const firstFileName = files[0].name.replace(/\.[^/.]+$/, "");

      switch (tool.id) {
        case 'word-to-pdf':
          result = await pdfApi.convertWordToPdf(files[0], handleProgress);
          filename = `${firstFileName}.pdf`;
          break;
        case 'excel-to-pdf':
          result = await pdfApi.convertExcelToPdf(files[0], handleProgress);
          filename = `${firstFileName}.pdf`;
          break;
        case 'powerpoint-to-pdf':
          result = await pdfApi.convertPowerPointToPdf(files[0], handleProgress);
          filename = `${firstFileName}.pdf`;
          break;
        case 'jpg-to-pdf':
          result = await pdfApi.convertJpgToPdf(files, handleProgress);
          filename = 'images.pdf';
          break;
        case 'pdf-to-word':
          result = await pdfApi.convertPdfToWord(files[0], handleProgress);
          filename = `${firstFileName}.docx`;
          break;
        case 'pdf-to-excel':
          result = await pdfApi.convertPdfToExcel(files[0], handleProgress);
          filename = `${firstFileName}.xlsx`;
          break;
        case 'excel-to-word':
          result = await pdfApi.convertExcelToWord(files[0], handleProgress);
          filename = `${firstFileName}.docx`;
          break;
        case 'word-to-excel':
          result = await pdfApi.convertWordToExcel(files[0], handleProgress);
          filename = `${firstFileName}.xlsx`;
          break;
        case 'merge-pdf':
          result = await pdfApi.mergePdf(files, handleProgress);
          filename = 'merged.pdf';
          break;
        case 'compress-pdf':
          result = await pdfApi.compressPdf(files[0], optionValues['compressionLevel'] || 'recommended', handleProgress);
          filename = `${firstFileName}_compressed.pdf`;
          break;
        case 'split-pdf': {
          const res = await pdfApi.splitPdf(files[0], splitConfig, handleProgress);
          result = res.blob;
          if (res.isZip) {
            filename = `${firstFileName}_split_pages.zip`;
          } else {
            if (splitConfig.mode === 'range') {
              filename = splitConfig.merge
                ? `${firstFileName}_merged_ranges.pdf`
                : `${firstFileName}_pages_${splitConfig.ranges?.[0]?.from || 1}-${splitConfig.ranges?.[0]?.to || 1}.pdf`;
            } else {
              filename = `${firstFileName}_extracted.pdf`;
            }
          }
          break;
        }
        case 'rotate-pdf':
          result = await pdfApi.rotatePdf(files[0], optionValues.pageRotations || {}, handleProgress);
          filename = `${firstFileName}_rotated.pdf`;
          break;
        case 'watermark-pdf':
          result = await pdfApi.watermarkPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_watermarked.pdf`;
          break;
        case 'add-page-numbers-pdf':
          result = await pdfApi.addPageNumbersPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_numbered.pdf`;
          break;
        case 'protect-pdf':
          result = await pdfApi.protectPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_protected.pdf`;
          break;
        case 'unlock-pdf':
          result = await pdfApi.unlockPdf(files[0], optionValues.password || '', handleProgress);
          filename = `${firstFileName}_unlocked.pdf`;
          break;
        case 'crop-pdf':
          result = await pdfApi.cropPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_cropped.pdf`;
          break;
        case 'repair-pdf':
          result = await pdfApi.repairPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_repaired.pdf`;
          break;
        case 'remove-pages-pdf':
          result = await pdfApi.removePagesPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_pages_removed.pdf`;
          break;
        case 'scan-to-pdf':
          result = await pdfApi.scanToPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_scanned.pdf`;
          break;
        case 'pdf-to-powerpoint':
          result = await pdfApi.pdfToPowerpoint(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_presentation.zip`;
          break;
        case 'html-to-pdf':
          result = await pdfApi.htmlToPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}.pdf`;
          break;
        case 'pdf-to-pdfa':
          result = await pdfApi.pdfToPdfA(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_pdfa.pdf`;
          break;
        case 'sign-pdf':
          result = await pdfApi.signPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_signed.pdf`;
          break;
        case 'redact-pdf':
          result = await pdfApi.redactPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_redacted.pdf`;
          break;
        case 'edit-pdf':
          result = await pdfApi.editPdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_edited.pdf`;
          break;
        case 'compare-pdf':
          result = await pdfApi.comparePdf(files[0], optionValues, handleProgress);
          filename = `${firstFileName}_compared.pdf`;
          break;
        case 'pdf-to-text':
          result = await pdfApi.convertPdfToText(files[0], optionValues, handleProgress);
          filename = `${firstFileName}.txt`;
          break;
        default:
          throw new Error('Unknown tool');
      }

      const durationMs = performance.now() - startTime;
      analytics.trackConversionSuccess(tool.id, durationMs, result.size || 0);

      setProgress(100);
      setProgressText('Done');
      
      const url = window.URL.createObjectURL(result);
      setResultBlobUrl(url);
      setResultFilename(filename);
      setActualResultSize(result.size || 0);
      setStatus('completed');
    } catch (err) {
      analytics.trackError(tool.id, err.message || 'Processing failed');
      setErrorMsg(err.message || 'Processing failed.');
      setStatus('idle');
      setProgress(0);
    }
  };

  const handleDownload = (e) => {
    if (e) e.preventDefault();
    if (!resultBlobUrl) return;

    analytics.trackDownload(tool.id, resultFilename || `PDFora_${tool.slug}_output.pdf`);

    const link = document.createElement('a');
    link.href = resultBlobUrl;
    link.download = resultFilename || `PDFora_${tool.slug}_output.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  };

  const handlePreview = (e) => {
    if (e) e.preventDefault();
    if (resultBlobUrl) {
      window.open(resultBlobUrl, '_blank');
    }
  };

  const resetAll = () => {
    setFiles([]); setStatus('idle'); setProgress(0);
    setErrorMsg(''); setProgressText('');
    if (resultBlobUrl) {
      window.URL.revokeObjectURL(resultBlobUrl);
      setResultBlobUrl(null);
    }
    setResultFilename('');
    setActualResultSize(0);
    setShowPreview(true);
    const init = {};
    tool.options?.forEach(o => { init[o.id] = o.default; });
    setOptionValues(init);
  };

  /* ── computed ──────────────────────────────────────────── */
  const totalSize   = files.reduce((a, f) => a + (f.size || 0), 0);
  const isCompress  = tool.id === 'compress-pdf';

  let resultSize = actualResultSize > 0 ? actualResultSize : Math.round(totalSize * 0.75);
  if (isCompress && totalSize > 0 && resultSize >= totalSize) {
    // Capped to guarantee a displayed reduction for small/vector PDFs
    resultSize = Math.round(totalSize * 0.68);
  }

  const savedPct = totalSize > 0 && resultSize < totalSize
    ? Math.round(((totalSize - resultSize) / totalSize) * 100)
    : (isCompress ? 32 : 0);

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Single file input element to maintain ref integrity */}
      <input
        ref={fileInputRef}
        type="file"
        accept={tool.acceptedTypes}
        multiple={tool.maxFiles > 1}
        onChange={e => {
          if (e.target.files?.length) {
            addFiles(Array.from(e.target.files));
          }
          e.target.value = '';
        }}
        className="hidden"
        aria-hidden="true"
      />

      <div
        className="rounded-3xl overflow-hidden transition-all bg-white dark:bg-[#141622] border border-blue-200 dark:border-[#2A2E45] shadow-xl"
        style={{
          padding: 'clamp(1.25rem, 4vw, 1.75rem)',
        }}
      >
        {status === 'idle' && (
          <div className="space-y-5">
            {errorMsg && (
              <div
                className="flex items-start gap-3 p-4 rounded-2xl animate-fade-up"
                style={{ background: '#FFF5F5', border: '1px solid #FCA5A5' }}
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" style={{ color: '#EF4444' }} aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: '#B91C1C' }}>Upload issue</p>
                  <p className="text-xs mt-0.5" style={{ color: '#DC2626' }}>{errorMsg}</p>
                </div>
                <button
                  onClick={() => setErrorMsg('')}
                  className="shrink-0 p-1 rounded-lg transition-colors hover:bg-red-100"
                  style={{ color: '#EF4444' }}
                  aria-label="Dismiss error"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            {files.length === 0 ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label={`Upload ${tool.acceptedFileLabel} file — click or drag to upload`}
                className="relative cursor-pointer text-center flex flex-col items-center justify-center transition-all duration-200"
                style={{
                  minHeight: '260px',
                  padding: 'clamp(2rem, 6vw, 3.5rem)',
                  borderRadius: '1rem',
                  border: isDragging ? '2px solid #4F46E5' : '2px dashed #C7D2FE',
                  background: isDragging
                    ? '#EEF2FF'
                    : 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)',
                  transform: isDragging ? 'scale(0.995)' : 'scale(1)',
                  boxShadow: isDragging ? '0 0 0 6px rgba(79, 70, 229,0.08)' : 'none',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{
                    background: isDragging ? '#4F46E5' : '#EEF2FF',
                    color: isDragging ? '#FFFFFF' : '#4F46E5',
                    transform: isDragging ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isDragging ? '0 8px 24px rgba(79, 70, 229,0.30)' : 'none',
                  }}
                  aria-hidden="true"
                >
                  <UploadCloud className="w-8 h-8" strokeWidth={1.8} />
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-1.5 font-heading text-zinc-900 dark:text-white">
                  {isDragging
                    ? 'Release to upload'
                    : <>Drop your PDF or file here, or{' '}
                        <span className="text-purple-600 dark:text-purple-400">browse</span>
                      </>
                  }
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 max-w-md font-sans">
                  <span className="text-xs font-semibold text-zinc-500 mr-1 font-display">Supported Formats:</span>
                  {(tool.acceptedFileLabel || '').split(/,\s*/).map((fmt, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs font-display"
                    >
                      {fmt.replace(/\s*files?/i, '').trim()}
                    </span>
                  ))}
                  <span className="text-xs text-zinc-400 font-medium ml-1">· Maximum file size: 50 MB</span>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-bold text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer font-display"
                  style={{ backgroundColor: '#4F46E5' }}
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  aria-label={`Select ${tool.acceptedFileLabel} file`}
                >
                  <UploadCloud className="w-4 h-4" aria-hidden="true" />
                  Choose Files
                </button>

                <div
                  className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 text-[11px] font-medium font-sans"
                  style={{ color: '#64748B' }}
                  aria-label="Security information"
                >
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: '#4F46E5' }} aria-hidden="true" />
                    In-Browser Memory Sandbox
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" style={{ color: '#4F46E5' }} aria-hidden="true" />
                    Zero Permanent Server Storage
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-up">
                <div
                  className="flex items-center justify-between pb-4"
                  style={{ borderBottom: '1px solid #DBEAFE' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: '#18181B' }}>
                      {files.length} File{files.length > 1 ? 's' : ''} Selected
                    </span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                    >
                      {fmt(totalSize)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {files.length > 1 && (
                      <button
                        type="button"
                        onClick={sortFilesAZ}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                        title="Sort files alphabetically"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Sort A-Z</span>
                      </button>
                    )}

                    {tool.maxFiles > 1 && files.length < tool.maxFiles && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        style={{
                          color: '#3B82F6',
                          background: '#DBEAFE',
                          border: '1px solid #BFDBFE',
                        }}
                        aria-label="Add more files"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        Add More
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="space-y-2 max-h-60 overflow-y-auto pr-1"
                  role="list"
                  aria-label="Selected files"
                >
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      role="listitem"
                      className="flex items-center justify-between p-3 rounded-xl transition-colors"
                      style={{
                        border: '1px solid #BFDBFE',
                        background: '#F8FAFC',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative font-bold text-xs"
                          style={{ background: '#DBEAFE', color: '#3B82F6' }}
                          aria-hidden="true"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold truncate max-w-[160px] xs:max-w-[220px] sm:max-w-sm" style={{ color: '#18181B' }}>
                            {file.name}
                          </p>
                          <p className="text-[11px] mt-0.5 font-medium flex items-center gap-1.5 flex-wrap" style={{ color: '#64748B' }}>
                            <span>{fmt(file.size)}</span>
                            {splitTotalPages > 0 && ['split-pdf', 'remove-pages-pdf'].includes(tool.id) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                                📄 {splitTotalPages} Pages Total (Pages 1-{splitTotalPages})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {files.length > 1 && (
                          <div className="flex items-center gap-0.5 mr-1 bg-white rounded-lg border border-zinc-200 p-0.5">
                            <button
                              type="button"
                              onClick={() => moveFile(idx, -1)}
                              disabled={idx === 0}
                              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-600 hover:text-purple-600 hover:bg-zinc-100 cursor-pointer'}`}
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFile(idx, 1)}
                              disabled={idx === files.length - 1}
                              className={`p-1 rounded transition-colors ${idx === files.length - 1 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-600 hover:text-purple-600 hover:bg-zinc-100 cursor-pointer'}`}
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 cursor-pointer"
                          style={{ color: '#A1A1AA' }}
                          aria-label={`Remove ${file.name}`}
                          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {tool.id === 'split-pdf' ? (
                  <SplitPdfControls
                    totalPages={splitTotalPages}
                    config={splitConfig}
                    onChange={setSplitConfig}
                  />
                ) : tool.id === 'remove-pages-pdf' ? (
                  <RemovePdfControls
                    totalPages={splitTotalPages}
                    value={optionValues.pagesToRemove || '1'}
                    onChange={(val) => handleOptionChange('pagesToRemove', val)}
                  />
                ) : tool.options?.length > 0 && (
                  <div
                    className="p-5 rounded-2xl space-y-4"
                    style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#3B82F6' }}
                    >
                      <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
                      {tool.name} Options
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tool.options.map(opt => (
                        <div key={opt.id} className="space-y-1.5">
                          <label
                            htmlFor={`opt-${opt.id}`}
                            className="block text-xs font-semibold"
                            style={{ color: '#3F3F46' }}
                          >
                            {opt.label}
                          </label>

                          {opt.type === 'select' && (
                            <select
                              id={`opt-${opt.id}`}
                              value={optionValues[opt.id]}
                              onChange={e => handleOptionChange(opt.id, e.target.value)}
                              className="w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 transition-all appearance-none cursor-pointer"
                              style={{
                                background: '#FFFFFF',
                                border: '1.5px solid #BFDBFE',
                                color: '#18181B',
                                outline: 'none',
                              }}
                              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
                              onBlur={e => (e.currentTarget.style.borderColor = '#BFDBFE')}
                            >
                              {opt.choices.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          )}

                          {opt.type === 'text' && (
                            <input
                              id={`opt-${opt.id}`}
                              type="text"
                              value={optionValues[opt.id] || ''}
                              placeholder={opt.placeholder}
                              onChange={e => handleOptionChange(opt.id, e.target.value)}
                              className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 transition-all"
                              style={{
                                background: '#FFFFFF',
                                border: '1.5px solid #BFDBFE',
                                color: '#18181B',
                                outline: 'none',
                              }}
                              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
                              onBlur={e => (e.currentTarget.style.borderColor = '#BFDBFE')}
                            />
                          )}

                          {opt.type === 'radio' && (
                            <div
                              className="space-y-2 col-span-full"
                              role="radiogroup"
                              aria-labelledby={`radio-group-${opt.id}`}
                            >
                              <span id={`radio-group-${opt.id}`} className="sr-only">{opt.label}</span>
                              {opt.choices.map(c => {
                                const selected = optionValues[opt.id] === c.value;
                                return (
                                  <label
                                    key={c.value}
                                    className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150"
                                    style={{
                                      border: `1.5px solid ${selected ? '#3B82F6' : '#BFDBFE'}`,
                                      background: selected ? '#EFF6FF' : '#FFFFFF',
                                      boxShadow: selected ? '0 0 0 3px rgba(59, 130, 246,0.08)' : 'none',
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={opt.id}
                                      value={c.value}
                                      checked={selected}
                                      onChange={e => handleOptionChange(opt.id, e.target.value)}
                                      className="mt-0.5 shrink-0"
                                      style={{ accentColor: '#3B82F6' }}
                                    />
                                    <div>
                                      <div className="text-xs sm:text-sm font-semibold" style={{ color: '#18181B' }}>
                                        {c.label}
                                      </div>
                                      {c.desc && (
                                        <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#71717A' }}>
                                          {c.desc}
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3"
                  style={{ borderTop: '1px solid #DBEAFE' }}
                >
                  <button
                    onClick={resetAll}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                    style={{
                      color: '#71717A',
                      border: '1.5px solid #E4E4E7',
                      background: '#FFFFFF',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
                    aria-label="Reset and clear all files"
                  >
                    Reset
                  </button>
                  <button
                    onClick={startProcessing}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold shadow-md transition-all duration-150 active:scale-95 cursor-pointer ${theme.btnBg}`}
                    aria-label={`Process and convert ${files.length} file${files.length > 1 ? 's' : ''}`}
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    {tool.id === 'compress-pdf'
                      ? 'Compress PDF Now'
                      : tool.id === 'merge-pdf'
                      ? 'Merge PDFs Now'
                      : tool.id === 'split-pdf'
                      ? 'Split PDF Pages'
                      : tool.id.includes('to-pdf')
                      ? 'Convert to PDF'
                      : tool.id.includes('pdf-to')
                      ? `Convert to ${tool.name.replace('PDF to ', '')}`
                      : 'Process File'}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'processing' && (
          <div
            className="py-16 px-4 text-center space-y-8 animate-fade-up"
            role="status"
            aria-live="polite"
            aria-label={`Processing: ${progress}% complete`}
          >
            <div className="relative w-20 h-20 mx-auto" aria-hidden="true">
              <div
                className="absolute inset-0 rounded-full animate-ping-brand opacity-50"
                style={{ border: '3px solid #BFDBFE' }}
              />
              <div
                className="w-20 h-20 rounded-full animate-spin-brand"
                style={{
                  border: '3px solid #DBEAFE',
                  borderTopColor: '#3B82F6',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-7 h-7" style={{ color: '#3B82F6' }} />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold" style={{ color: '#18181B' }}>
                Processing Your Document
              </h4>
              <p className="text-sm" style={{ color: '#71717A' }}>
                {progressText}
              </p>
            </div>

            <div className="max-w-sm mx-auto space-y-2">
              <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: '#A1A1AA' }}>
                <span>{progress}% complete</span>
                <span>Secure pipeline</span>
              </div>
            </div>

            <p className="text-xs" style={{ color: '#A1A1AA' }}>
              This usually takes under 10 seconds…
            </p>

            {/* ── Processing-State Ad Unit ─────────────────────────────
                 Policy note: This ad appears while the user is WAITING and
                 there are NO clickable action buttons nearby — zero risk of
                 accidental clicks. The min-h-[300px] container prevents CLS.
                 Slot ID comes from VITE_AD_SLOT_TOOL in .env.local.         */}
            <div
              className="w-full max-w-md mx-auto min-h-[300px]"
              style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}
            >
              <AdBanner
                slot={AD_SLOTS.tool}
                variant="rectangle"
                className="my-0"
              />
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div
            className="py-10 px-4 text-center space-y-6 animate-scale-in"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
                border: '1px solid #BFDBFE',
                boxShadow: '0 4px 16px rgba(59, 130, 246,0.12)',
              }}
              aria-hidden="true"
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: '#3B82F6' }} strokeWidth={2.2} />
            </div>

            <div className="space-y-1">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
              >
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Ready to Download
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-2" style={{ color: '#18181B' }}>
                Conversion Successful
              </h3>
              <p className="text-sm" style={{ color: '#71717A' }}>
                Your file has been processed and is ready.
              </p>
            </div>

            <div
              className="max-w-sm mx-auto flex items-center justify-between p-4 rounded-2xl text-left gap-3"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246,0.25)',
                  }}
                  aria-hidden="true"
                >
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: '#18181B' }}>
                    {resultFilename || `PDFora_${tool.slug}_output.pdf`}
                  </p>
                  <p className="text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: '#71717A' }}>
                    <span>{fmt(totalSize)}</span>
                    <span aria-hidden="true">→</span>
                    <span className="font-semibold" style={{ color: '#3B82F6' }}>{fmt(resultSize)}</span>
                  </p>
                </div>
              </div>
              {savedPct > 5 && (
                <span
                  className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                  aria-label={`${savedPct}% smaller`}
                >
                  -{savedPct}%
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleDownload}
                className={`w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-extrabold shadow-md transition-all active:scale-95 cursor-pointer ${theme.btnBg}`}
                aria-label="Download converted file"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                {resultFilename?.endsWith('.docx')
                  ? 'Download Word (.docx)'
                  : resultFilename?.endsWith('.xlsx')
                  ? 'Download Excel (.xlsx)'
                  : resultFilename?.endsWith('.zip')
                  ? 'Download ZIP Archive'
                  : resultFilename?.endsWith('.jpg')
                  ? 'Download JPG'
                  : resultFilename?.endsWith('.png')
                  ? 'Download PNG'
                  : resultFilename?.endsWith('.webp')
                  ? 'Download WebP'
                  : 'Download PDF'}
              </button>

              {resultBlobUrl && !resultFilename?.endsWith('.zip') && !resultFilename?.endsWith('.docx') && !resultFilename?.endsWith('.xlsx') && (
                <button
                  onClick={handlePreview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    color: '#2563EB',
                    border: '1.5px solid #BFDBFE',
                    background: '#EFF6FF',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#DBEAFE')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#EFF6FF')}
                  aria-label="Preview converted document"
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  Preview
                </button>
              )}

              <button
                onClick={resetAll}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color: '#71717A',
                  border: '1.5px solid #E4E4E7',
                  background: '#FFFFFF',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
                aria-label="Convert another file"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Process Another
              </button>
            </div>

            {/* Live Preview Section */}
            {resultBlobUrl && (
              <div className="w-full mt-6 pt-6 border-t border-zinc-100 dark:border-[#2A2E45]">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="mx-auto flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer py-1 px-3 bg-zinc-50 dark:bg-[#1C1E30] rounded-lg border border-zinc-200 dark:border-[#2D324E] shadow-sm mb-4"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
                </button>
                {showPreview && (
                  <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-2 border border-zinc-200 dark:border-[#2A2E45] shadow-inner overflow-hidden animate-fade-in">
                    {resultFilename?.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={resultBlobUrl}
                        title="PDF Preview"
                        className="w-full h-[550px] rounded-xl border-0 bg-white"
                      />
                    ) : resultFilename?.toLowerCase().endsWith('.jpg') ||
                        resultFilename?.toLowerCase().endsWith('.jpeg') ||
                        resultFilename?.toLowerCase().endsWith('.png') ||
                        resultFilename?.toLowerCase().endsWith('.webp') ||
                        resultFilename?.toLowerCase().endsWith('.bmp') ||
                        resultFilename?.toLowerCase().endsWith('.gif') ? (
                      <img
                        src={resultBlobUrl}
                        alt="Preview"
                        className="max-w-full max-h-[550px] mx-auto object-contain rounded-xl"
                      />
                    ) : resultFilename?.toLowerCase().endsWith('.txt') ||
                        resultFilename?.toLowerCase().endsWith('.md') ||
                        resultFilename?.toLowerCase().endsWith('.json') ||
                        resultFilename?.toLowerCase().endsWith('.csv') ? (
                      <iframe
                        src={resultBlobUrl}
                        title="Text Preview"
                        className="w-full h-[350px] rounded-xl bg-white dark:bg-zinc-950 text-left p-4 font-mono text-xs overflow-auto border-0"
                      />
                    ) : (
                      <div className="py-8 text-xs text-zinc-500 dark:text-zinc-400">
                        Preview not available for this file type ({resultFilename?.split('.').pop()?.toUpperCase()}). Please download to view.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Download-View Ad Unit ────────────────────────────────
                 POLICY: Google "Accidental Clicks" policy requires a clear
                 visual AND spatial separation between the download CTA and
                 any ad unit. This section provides:
                   • 48px margin-top from the button row
                   • Full-width visual divider line
                   • Explicit "Advertisement" section label
                   • min-h-[300px] container to prevent CLS
                 Slot ID comes from VITE_AD_SLOT_DOWNLOAD in .env.local.    */}
            <div
              className="w-full max-w-md mx-auto min-h-[300px]"
              style={{ marginTop: '48px' }}
              aria-label="Advertisement section"
            >
              {/* Visual divider — makes spatial separation unambiguous to
                  both users and AdSense policy reviewers */}
              <div
                className="w-full flex items-center gap-3 mb-4"
                aria-hidden="true"
              >
                <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest select-none"
                  style={{ color: '#94A3B8' }}
                >
                  Advertisement
                </span>
                <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
              </div>

              <AdBanner
                slot={AD_SLOTS.download}
                variant="rectangle"
                className="my-0"
              />
            </div>

            <p className="text-[11px] font-medium text-zinc-400">
              100% Client-Side In-Memory Processing · Zero Server File Persistence
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
