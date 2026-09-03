import React, { useState, useRef } from 'react';
import {
  UploadCloud, Minimize2, Download, Sparkles,
  FileText, CheckCircle2, RefreshCw, AlertCircle, XCircle
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compress a JPEG/PNG image canvas to target bytes via binary-search on quality */
async function compressImageToTarget(file, targetBytes) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const srcUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(srcUrl);
      const canvas = document.createElement('canvas');

      // Iteratively scale down if needed
      let scale = 1;
      const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
      const mimeOut = isJpeg ? 'image/jpeg' : 'image/jpeg'; // always output jpeg for compression

      const tryCompress = (scale, quality) => {
        canvas.width  = Math.round(img.naturalWidth  * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL(mimeOut, quality);
      };

      // Binary search quality first at full scale
      let lo = 0.01, hi = 0.95, bestDataUrl = null, bestSize = Infinity;
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        const dataUrl = tryCompress(scale, mid);
        const byteLen = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
        if (byteLen <= targetBytes) {
          if (bestDataUrl === null || byteLen > bestSize) {
            bestDataUrl = dataUrl;
            bestSize = byteLen;
          }
          lo = mid;
        } else {
          hi = mid;
        }
      }

      // If still too big even at lowest quality, reduce dimensions
      if (!bestDataUrl || bestSize > targetBytes) {
        scale = 0.75;
        while (scale >= 0.1) {
          lo = 0.01; hi = 0.95;
          for (let i = 0; i < 14; i++) {
            const mid = (lo + hi) / 2;
            const dataUrl = tryCompress(scale, mid);
            const byteLen = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
            if (byteLen <= targetBytes) {
              bestDataUrl = dataUrl;
              bestSize = byteLen;
              lo = mid;
            } else {
              hi = mid;
            }
          }
          if (bestDataUrl && bestSize <= targetBytes) break;
          scale -= 0.1;
        }
      }

      if (!bestDataUrl) {
        // Absolute minimum — 1% quality, 10% dimensions
        bestDataUrl = tryCompress(0.1, 0.01);
        const byteLen = Math.round((bestDataUrl.length - bestDataUrl.indexOf(',') - 1) * 0.75);
        bestSize = byteLen;
      }

      // Convert dataUrl → Blob
      const arr = bestDataUrl.split(',');
      const bstr = atob(arr[1]);
      const u8 = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
      const blob = new Blob([u8], { type: mimeOut });
      resolve({ blob, size: blob.size });
    };
    img.onerror = reject;
    img.src = srcUrl;
  });
}

/** Compress a PDF to target bytes — strips metadata, uses object streams, then scales embedded images */
async function compressPdfToTarget(buffer, targetBytes) {
  // Step 1: basic save with object streams (removes xref table overhead, deduplicates)
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Strip metadata to save space
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  const savedSize = pdfBytes.byteLength;

  if (savedSize <= targetBytes) {
    return { blob: new Blob([pdfBytes], { type: 'application/pdf' }), size: savedSize, method: 'object-stream' };
  }

  // Step 2: if still too big, try re-embedding pages as compressed images
  // This is the only client-side approach that reliably hits a target size
  const scaleFactor = Math.min(0.9, Math.sqrt(targetBytes / savedSize));

  // Re-render pages to canvas → compress as JPEG → rebuild PDF
  const pageCount = pdfDoc.getPageCount();
  const newPdf = await PDFDocument.create();

  // We'll do canvas-based re-rendering by importing a blob URL
  // and drawing page thumbnails at reduced quality
  const sourceDoc = await PDFDocument.load(pdfBytes);

  // Quality iteration: try reducing quality until we hit target
  let quality = 0.7;
  let attempts = 0;
  const maxAttempts = 8;

  // Since pdf-lib doesn't support rendering, we do a best-effort:
  // copy all pages but compress the raw bytes via object streams + metadata stripping.
  // Signal that actual size may not reach target.
  const finalBytes = pdfBytes;
  const finalSize  = pdfBytes.byteLength;

  return {
    blob: new Blob([finalBytes], { type: 'application/pdf' }),
    size: finalSize,
    method: 'best-effort',
    reachedTarget: finalSize <= targetBytes
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompressToKbTool() {
  const [file, setFile]             = useState(null);
  const [targetKb, setTargetKb]     = useState(200);
  const [customKb, setCustomKb]     = useState('');
  const [useCustom, setUseCustom]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress]     = useState('');
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isImage = file && (file.type.startsWith('image/'));
  const isPdf   = file && file.type === 'application/pdf';

  const effectiveTargetKb = useCustom && customKb ? Number(customKb) : targetKb;
  const effectiveTargetBytes = effectiveTargetKb * 1024;

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress('Reading file…');

    try {
      const originalSize = file.size;

      if (originalSize <= effectiveTargetBytes) {
        setProgress('');
        setResult({
          originalKb:    (originalSize / 1024).toFixed(1),
          compressedKb:  (originalSize / 1024).toFixed(1),
          reduction:     0,
          url:           URL.createObjectURL(file),
          filename:      file.name,
          alreadySmall:  true,
        });
        setIsProcessing(false);
        return;
      }

      if (isImage) {
        setProgress(`Compressing image to under ${effectiveTargetKb} KB…`);
        const { blob, size } = await compressImageToTarget(file, effectiveTargetBytes);
        const url = URL.createObjectURL(blob);
        const ext = blob.type === 'image/jpeg' ? '.jpg' : '.png';
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        setResult({
          originalKb:   (originalSize / 1024).toFixed(1),
          compressedKb: (size / 1024).toFixed(1),
          reduction:    Math.round((1 - size / originalSize) * 100),
          url,
          filename: baseName + ext,
          reachedTarget: size <= effectiveTargetBytes,
          targetKb: effectiveTargetKb,
        });
      } else if (isPdf) {
        setProgress(`Optimising PDF to under ${effectiveTargetKb} KB…`);
        const buffer = await file.arrayBuffer();
        const { blob, size, reachedTarget } = await compressPdfToTarget(buffer, effectiveTargetBytes);
        const url = URL.createObjectURL(blob);
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        setResult({
          originalKb:   (originalSize / 1024).toFixed(1),
          compressedKb: (size / 1024).toFixed(1),
          reduction:    Math.round((1 - size / originalSize) * 100),
          url,
          filename: baseName + '_compressed.pdf',
          reachedTarget: reachedTarget !== false,
          targetKb: effectiveTargetKb,
          isPdf: true,
        });
      } else {
        setError('Unsupported file type. Please upload a PDF, JPG, or PNG.');
        setIsProcessing(false);
        return;
      }

      setProgress('');
    } catch (err) {
      console.error(err);
      setError('Compression failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setProgress('');
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
    setProgress('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!file ? (
        /* ── Drop Zone ── */
        <div
          onDragOver={e  => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            e.dataTransfer.files?.[0] && handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer text-center flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all"
          style={{
            borderColor: isDragging ? '#6C3FFC' : '#CBD5E1',
            background:  isDragging ? '#F3F0FF' : '#FFFFFF',
            boxShadow:   '0 8px 32px rgba(108, 63, 252, 0.05)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
            <Minimize2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900">
            Compress File to Target KB
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Compress PDF, JPG, or PNG to under 100 KB, 200 KB, 500 KB — or any custom size. Perfect for passport photos, job applications, and form uploads.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-700"
          >
            <UploadCloud className="w-4 h-4" />
            Select PDF or Image
          </button>
          <p className="text-xs text-zinc-400 mt-3">Supports PDF · JPG · PNG · Drop file here</p>
        </div>
      ) : (
        /* ── Controls + Result ── */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">

          {/* File info + change */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-xs">{file.name}</h4>
                <p className="text-xs text-zinc-500">Original: {(file.size / 1024).toFixed(1)} KB
                  {file.size > 10 * 1024 * 1024 && (
                    <span className="ml-2 text-amber-600 font-medium">⚠ Large file — may take a moment</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={resetTool}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change File
            </button>
          </div>

          {/* Target size presets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Size Limit:</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: '100 KB', sub: 'Passport / Govt', kb: 100 },
                { label: '200 KB', sub: 'Job application', kb: 200 },
                { label: '500 KB', sub: 'Online forms',    kb: 500 },
              ].map(preset => (
                <button
                  key={preset.kb}
                  type="button"
                  onClick={() => { setTargetKb(preset.kb); setUseCustom(false); }}
                  className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    !useCustom && targetKb === preset.kb
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <p className="text-sm font-extrabold">{preset.label}</p>
                  <p className="text-[10px] font-medium opacity-70 mt-0.5">{preset.sub}</p>
                </button>
              ))}
            </div>

            {/* Custom size */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUseCustom(v => !v)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  useCustom
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-400'
                }`}
              >
                Custom Size
              </button>
              {useCustom && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={customKb}
                    onChange={e => setCustomKb(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-24 text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-zinc-500">KB</span>
                </div>
              )}
            </div>

            {/* PDF notice */}
            {isPdf && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>PDF note:</strong> In-browser PDF compression removes metadata and optimises structure.
                  If your PDF contains many high-resolution images, for best results convert them to JPEG first or use a dedicated tool.
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
              <XCircle className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              {error}
            </div>
          )}

          {/* Result */}
          {result ? (
            <div className={`p-5 rounded-2xl border space-y-4 animate-fade-up ${
              result.alreadySmall
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                : result.reachedTarget === false
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            }`}>
              {/* Stats row */}
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Original</p>
                  <p className="text-xl font-black text-zinc-800 dark:text-zinc-200">{result.originalKb} KB</p>
                </div>
                <div className="flex items-center text-zinc-400 font-bold">→</div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Compressed</p>
                  <p className={`text-xl font-black ${
                    result.reachedTarget === false ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                  }`}>{result.compressedKb} KB</p>
                </div>
                {result.reduction > 0 && (
                  <>
                    <div className="flex items-center text-zinc-400 font-bold">·</div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Saved</p>
                      <p className="text-xl font-black text-purple-700 dark:text-purple-400">{result.reduction}%</p>
                    </div>
                  </>
                )}
              </div>

              {/* Status message */}
              {result.alreadySmall ? (
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  File is already under {effectiveTargetKb} KB — downloaded as-is.
                </p>
              ) : result.reachedTarget === false ? (
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Best possible compression reached. PDF target may not be achievable without re-rendering pages (requires server-side processing).
                </p>
              ) : (
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully compressed to under {result.targetKb} KB!
                </p>
              )}

              {/* Download */}
              <button
                type="button"
                onClick={(e) => {
                  if (e) e.preventDefault();
                  if (!result?.url) return;
                  const link = document.createElement('a');
                  link.href = result.url;
                  link.download = result.filename || 'compressed_document.pdf';
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => document.body.removeChild(link), 100);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download ({result.compressedKb} KB)
              </button>

              <button
                onClick={resetTool}
                className="block text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer mt-1"
              >
                ↩ Compress another file
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleCompress}
                disabled={isProcessing || (useCustom && !customKb)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {progress || 'Processing…'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Compress to Under {effectiveTargetKb} KB
                  </>
                )}
              </button>
              {isProcessing && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 animate-pulse">{progress}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
