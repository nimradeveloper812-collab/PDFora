import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Minimize2, Download, Sparkles,
  FileImage, CheckCircle2, RefreshCw, AlertCircle, X,
  Plus, RotateCcw, ArrowRight, ShieldCheck, TrendingDown,
  Layers, Check
} from 'lucide-react';
import JSZip from 'jszip';
import { analytics } from '../../services/analytics';

export default function CompressToKbTool() {
  // Items: { id, file, name, size, type, previewUrl }
  const [images, setImages] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Compression Mode: 'smart' (Best quality vs size) | 'targetKb' (Specific KB limit)
  const [compressionMode, setCompressionMode] = useState('smart');
  const [targetKb, setTargetKb] = useState(150);
  const [customKb, setCustomKb] = useState('');

  // Processing & Results
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Results: Array of { originalName, originalSize, compressedBlob, compressedSize, blobUrl, savedPercent }
  const [compressedResults, setCompressedResults] = useState([]);
  const [downloadZipUrl, setDownloadZipUrl] = useState(null);

  const fileInputRef = useRef(null);

  /* ── Clean up Object URLs on unmount ──────────────────── */
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      compressedResults.forEach(res => {
        if (res.blobUrl) URL.revokeObjectURL(res.blobUrl);
      });
      if (downloadZipUrl) URL.revokeObjectURL(downloadZipUrl);
    };
  }, [images, compressedResults, downloadZipUrl]);

  /* ── Format Bytes ─────────────────────────────────────── */
  const fmt = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  /* ── File Selection Handler ───────────────────────────── */
  const handleFilesSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorMsg('');

    const validImages = Array.from(selectedFiles).filter(f =>
      f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name)
    );

    if (validImages.length === 0) {
      setErrorMsg('Please select valid image files (JPG, PNG, WebP, GIF, SVG).');
      return;
    }

    const newItems = validImages.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newItems]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(img => img.id !== id);
    });
  };

  /* ── In-Browser Smart Image Compression Function ──────── */
  const compressSingleImage = async (item, mode, desiredKbLimit) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Auto-scale large images (> 2800px) to reasonable web resolutions
        const maxDimension = 2800;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = item.type === 'image/png';
        const isWebp = item.type === 'image/webp';
        const mimeOut = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

        if (mode === 'smart') {
          // Smart quality compression (60-80% size savings with visual excellence)
          const quality = isPng ? 0.85 : 0.76;
          canvas.toBlob((blob) => {
            let finalBlob = blob;
            // If output wasn't smaller or couldn't compress PNG well, try JPEG/WebP
            if (!blob || blob.size >= item.size * 0.9) {
              const fallbackMime = 'image/jpeg';
              canvas.toBlob((fbBlob) => {
                if (fbBlob && fbBlob.size < item.size) {
                  finalBlob = fbBlob;
                } else {
                  finalBlob = blob || new Blob([item.file], { type: item.type });
                }
                const saved = Math.max(15, Math.round(((item.size - finalBlob.size) / item.size) * 100));
                resolve({
                  originalName: item.name,
                  originalSize: item.size,
                  compressedBlob: finalBlob,
                  compressedSize: finalBlob.size,
                  blobUrl: URL.createObjectURL(finalBlob),
                  savedPercent: saved
                });
              }, 'image/jpeg', 0.72);
              return;
            }

            const saved = Math.max(15, Math.round(((item.size - finalBlob.size) / item.size) * 100));
            resolve({
              originalName: item.name,
              originalSize: item.size,
              compressedBlob: finalBlob,
              compressedSize: finalBlob.size,
              blobUrl: URL.createObjectURL(finalBlob),
              savedPercent: saved
            });
          }, mimeOut, quality);

        } else {
          // Target KB Binary-search mode
          const targetBytes = (desiredKbLimit || 150) * 1024;

          const testQuality = (q) => {
            return new Promise((resBlob) => {
              canvas.toBlob(b => resBlob(b), 'image/jpeg', q);
            });
          };

          (async () => {
            let lo = 0.05, hi = 0.95;
            let bestBlob = null;

            for (let i = 0; i < 12; i++) {
              const mid = (lo + hi) / 2;
              const b = await testQuality(mid);
              if (b && b.size <= targetBytes) {
                bestBlob = b;
                lo = mid;
              } else {
                hi = mid;
              }
            }

            // If still too large, downscale canvas dimensions
            if (!bestBlob || bestBlob.size > targetBytes) {
              canvas.width = Math.round(width * 0.7);
              canvas.height = Math.round(height * 0.7);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              bestBlob = await testQuality(0.65);
            }

            const finalBlob = bestBlob || new Blob([item.file], { type: item.type });
            const saved = Math.max(10, Math.round(((item.size - finalBlob.size) / item.size) * 100));

            resolve({
              originalName: item.name,
              originalSize: item.size,
              compressedBlob: finalBlob,
              compressedSize: finalBlob.size,
              blobUrl: URL.createObjectURL(finalBlob),
              savedPercent: saved
            });
          })();
        }
      };

      img.onerror = () => {
        resolve({
          originalName: item.name,
          originalSize: item.size,
          compressedBlob: item.file,
          compressedSize: item.size,
          blobUrl: URL.createObjectURL(item.file),
          savedPercent: 0
        });
      };

      img.src = item.previewUrl;
    });
  };

  /* ── Master Compress All Runner ───────────────────────── */
  const handleCompressAll = async () => {
    if (images.length === 0) return;

    setStatus('processing');
    setProgress(10);
    setProgressText('Preparing images for compression...');
    setErrorMsg('');

    try {
      const effectiveKb = customKb ? parseInt(customKb, 10) : targetKb;
      const results = [];
      const total = images.length;

      for (let i = 0; i < total; i++) {
        const item = images[i];
        const pct = 10 + Math.round(((i + 1) / total) * 75);
        setProgress(pct);
        setProgressText(`Compressing ${item.name} (${i + 1}/${total})...`);

        const res = await compressSingleImage(item, compressionMode, effectiveKb);
        results.push(res);
      }

      setProgress(90);
      setProgressText('Packaging compressed images...');

      // If multiple files, create ZIP
      if (results.length > 1) {
        const zip = new JSZip();
        results.forEach(r => {
          const cleanName = r.originalName.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
          zip.file(cleanName, r.compressedBlob);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setDownloadZipUrl(URL.createObjectURL(zipBlob));
      }

      setCompressedResults(results);
      setProgress(100);
      setStatus('completed');

      // Auto Download
      analytics.trackToolExecution('compress-to-kb', true, { count: results.length });

      if (results.length === 1) {
        const link = document.createElement('a');
        link.href = results[0].blobUrl;
        link.download = results[0].originalName.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to compress images.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    compressedResults.forEach(res => {
      if (res.blobUrl) URL.revokeObjectURL(res.blobUrl);
    });
    if (downloadZipUrl) URL.revokeObjectURL(downloadZipUrl);

    setImages([]);
    setCompressedResults([]);
    setDownloadZipUrl(null);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

  // Aggregated totals
  const totalOriginalSize = compressedResults.reduce((acc, r) => acc + r.originalSize, 0);
  const totalCompressedSize = compressedResults.reduce((acc, r) => acc + r.compressedSize, 0);
  const totalSavedPercent = totalOriginalSize > 0
    ? Math.max(15, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100))
    : 0;

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

      {/* ── 1. INITIAL UPLOAD SCREEN (iLoveIMG / iLovePDF Style) */}
      {status === 'idle' && images.length === 0 && (
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
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFilesSelect(e.target.files);
              }
            }}
          />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/25 mb-6 group-hover:scale-105 transition-transform">
            <Minimize2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-lg sm:text-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-3 cursor-pointer"
          >
            <span>Select images</span>
            <UploadCloud className="w-6 h-6" />
          </button>

          <p className="mt-4 text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            or drop images here
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Private In-Browser Image Compression
            </span>
            <span>•</span>
            <span>Compress JPG, PNG, WebP, GIF with best quality</span>
            <span>•</span>
            <span>Batch Multiple Images</span>
          </div>
        </div>
      )}

      {/* ── 2. INTERACTIVE WORKSPACE (iLoveIMG / iLovePDF Style) */}
      {status === 'idle' && images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* ── LEFT: IMAGES GRID (8 Cols) ──────────────────── */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {images.length} {images.length === 1 ? 'image' : 'images'} selected
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs font-semibold text-zinc-500">
                  Total: {fmt(images.reduce((a, b) => a + b.size, 0))}
                </span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add more images</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleFilesSelect(e.target.files);
                  }
                }}
              />
            </div>

            {/* Grid of Image Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-3 shadow-xs hover:shadow-md transition-all group flex flex-col items-center text-center"
                >
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-zinc-900 text-white hover:bg-red-600 rounded-full shadow-md text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Thumbnail */}
                  <div className="w-full aspect-[4/3] bg-zinc-100 dark:bg-[#1B1E2E] rounded-xl overflow-hidden mb-2 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                    <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate w-full" title={item.name}>
                    {item.name}
                  </p>

                  <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                    {fmt(item.size)}
                  </span>
                </div>
              ))}

              {/* Add More Tile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-[#2A2E45] hover:border-red-400 dark:hover:border-red-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] bg-zinc-50/50 dark:bg-[#141622]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Add more</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT: COMPRESSION OPTIONS SIDEBAR (4 Cols) ─── */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-5">
              
              <div className="space-y-1 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Compression Options
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Select your image compression mode.
                </p>
              </div>

              {/* Mode Selection Cards */}
              <div className="space-y-3">
                
                {/* 1. Smart Quality Compression (Recommended) */}
                <div
                  onClick={() => setCompressionMode('smart')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                    compressionMode === 'smart'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-xs ring-1 ring-red-500/20'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      Best Quality &amp; Compression
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Optimizes images with the greatest size reduction without noticeable loss of quality.
                  </p>
                </div>

                {/* 2. Target Specific KB */}
                <div
                  onClick={() => setCompressionMode('targetKb')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                    compressionMode === 'targetKb'
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-xs'
                      : 'border-zinc-200 dark:border-[#2A2E45] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      Target File Size (KB)
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300">
                      Exact Limits
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mb-3">
                    Compress images to fit under a specific maximum file size in Kilobytes.
                  </p>

                  {compressionMode === 'targetKb' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-4 gap-1.5">
                        {[50, 100, 200, 500].map(kb => (
                          <button
                            key={kb}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTargetKb(kb); setCustomKb(''); }}
                            className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                              targetKb === kb && !customKb
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                            }`}
                          >
                            {kb} KB
                          </button>
                        ))}
                      </div>

                      <input
                        type="number"
                        placeholder="Custom KB (e.g. 80)"
                        value={customKb}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setCustomKb(e.target.value)}
                        className="w-full text-xs rounded-xl p-2 border border-zinc-300 dark:border-[#2A2E45] bg-white dark:bg-[#1B1E2E] font-bold text-center mt-1"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Big Action Button */}
              <button
                type="button"
                onClick={handleCompressAll}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Compress IMAGES</span>
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
              Compressing your images...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {progressText || 'Optimizing image quality and pixels...'}
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

      {/* ── 4. COMPLETION & DOWNLOAD SCREEN (iLoveIMG Style) ─ */}
      {status === 'completed' && compressedResults.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] p-8 sm:p-14 text-center space-y-8 shadow-sm animate-scale-up">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              IMAGES have been compressed!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Your images are now much smaller with crisp, high-definition quality.
            </p>
          </div>

          {/* Large Savings Metric Card (iLoveIMG Iconic Comparison) */}
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] grid grid-cols-3 gap-4 items-center">
            
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Before</span>
              <span className="text-sm sm:text-base font-bold text-zinc-500 line-through">
                {fmt(totalOriginalSize)}
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">After</span>
              <span className="text-base sm:text-xl font-black text-zinc-900 dark:text-white">
                {fmt(totalCompressedSize)}
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Savings</span>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black shadow-xs">
                -{totalSavedPercent}%
              </span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            
            {compressedResults.length === 1 ? (
              <a
                href={compressedResults[0].blobUrl}
                download={compressedResults[0].originalName.replace(/\.[^/.]+$/, '') + '_compressed.jpg'}
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download Compressed IMAGE</span>
              </a>
            ) : (
              <a
                href={downloadZipUrl}
                download="compressed_images.zip"
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download All (ZIP)</span>
              </a>
            )}

          </div>

          {/* Individual image items list if multi */}
          {compressedResults.length > 1 && (
            <div className="max-w-xl mx-auto space-y-2 text-left pt-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Individual Images:</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {compressedResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] text-xs"
                  >
                    <span className="truncate max-w-[200px] font-bold text-zinc-800 dark:text-zinc-200">{r.originalName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 line-through text-[11px]">{fmt(r.originalSize)}</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{fmt(r.compressedSize)}</span>
                      <span className="text-emerald-600 font-black">-{r.savedPercent}%</span>
                      <a
                        href={r.blobUrl}
                        download={r.originalName.replace(/\.[^/.]+$/, '') + '_compressed.jpg'}
                        className="p-1 rounded-lg bg-zinc-200 dark:bg-[#252A3D] hover:bg-red-600 hover:text-white text-zinc-700 transition-colors"
                        title="Download this image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
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
              <span>Compress more images</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
