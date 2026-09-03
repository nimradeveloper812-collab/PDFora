import React, { useState, useRef } from 'react';
import { Crop, UploadCloud, Download, RotateCcw, AlertCircle, Image as ImageIcon, Sliders, Check, Sparkles, ArrowRight } from 'lucide-react';

export default function CropImageTool() {
  const [file, setFile] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'completed'
  const [errorMsg, setErrorMsg] = useState('');

  // Crop Margins (%)
  const [marginTop, setMarginTop] = useState(10);
  const [marginBottom, setMarginBottom] = useState(10);
  const [marginLeft, setMarginLeft] = useState(10);
  const [marginRight, setMarginRight] = useState(10);

  const [resultUrl, setResultUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultDimensions, setResultDimensions] = useState({ width: 0, height: 0 });
  const [resultSize, setResultSize] = useState(0);

  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setErrorMsg('');

    if (!uploadedFile.type.startsWith('image/') && !/\.(jpg|jpeg|png|webp|bmp|heic)$/i.test(uploadedFile.name)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, BMP).');
      return;
    }

    setFile(uploadedFile);
    const objectUrl = URL.createObjectURL(uploadedFile);

    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      setImageObj(img);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setStatus('ready');
    };
    img.onerror = () => {
      setErrorMsg('Failed to load image preview.');
      setFile(null);
      setStatus('idle');
    };
  };

  const applyPreset = (preset) => {
    if (preset === 'equal10') {
      setMarginTop(10); setMarginBottom(10); setMarginLeft(10); setMarginRight(10);
    } else if (preset === 'headerFooter15') {
      setMarginTop(15); setMarginBottom(15); setMarginLeft(0); setMarginRight(0);
    } else if (preset === 'sides15') {
      setMarginTop(0); setMarginBottom(0); setMarginLeft(15); setMarginRight(15);
    } else if (preset === 'square1to1') {
      const { width, height } = imageDimensions;
      if (width && height) {
        if (width > height) {
          const diffPct = Math.round(((width - height) / width / 2) * 100);
          setMarginTop(0); setMarginBottom(0); setMarginLeft(diffPct); setMarginRight(diffPct);
        } else {
          const diffPct = Math.round(((height - width) / height / 2) * 100);
          setMarginTop(diffPct); setMarginBottom(diffPct); setMarginLeft(0); setMarginRight(0);
        }
      }
    } else if (preset === 'landscape16to9') {
      setMarginTop(12); setMarginBottom(12); setMarginLeft(5); setMarginRight(5);
    } else if (preset === 'reset') {
      setMarginTop(0); setMarginBottom(0); setMarginLeft(0); setMarginRight(0);
    }
  };

  // Calculate pixel dimensions after crop
  const croppedWidthPx = Math.max(1, Math.round(imageDimensions.width * (1 - (marginLeft + marginRight) / 100)));
  const croppedHeightPx = Math.max(1, Math.round(imageDimensions.height * (1 - (marginTop + marginBottom) / 100)));

  const handleCropImage = () => {
    if (!file || !imageObj) return;
    setStatus('processing');

    setTimeout(() => {
      try {
        const { width: origW, height: origH } = imageDimensions;
        const cropX = origW * (marginLeft / 100);
        const cropY = origH * (marginTop / 100);
        const cropW = origW * (1 - (marginLeft + marginRight) / 100);
        const cropH = origH * (1 - (marginTop + marginBottom) / 100);

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(cropW));
        canvas.height = Math.max(1, Math.round(cropH));
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          imageObj,
          cropX, cropY, cropW, cropH,
          0, 0, canvas.width, canvas.height
        );

        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = outputType === 'image/jpeg' ? 0.92 : undefined;

        canvas.toBlob((blob) => {
          if (!blob) {
            setErrorMsg('Failed to process cropped image.');
            setStatus('ready');
            return;
          }
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
          const ext = outputType === 'image/png' ? '.png' : '.jpg';
          setResultFilename(file.name.replace(/\.[^/.]+$/, '') + '_cropped' + ext);
          setResultDimensions({ width: canvas.width, height: canvas.height });
          setResultSize(blob.size);
          setStatus('completed');
        }, outputType, quality);
      } catch (err) {
        console.error(err);
        setErrorMsg('Error cropping image.');
        setStatus('ready');
      }
    }, 100);
  };

  const handleReset = () => {
    setFile(null);
    setImageObj(null);
    setImageDimensions({ width: 0, height: 0 });
    setStatus('idle');
    setErrorMsg('');
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setResultFilename('');
    setResultDimensions({ width: 0, height: 0 });
    setResultSize(0);
    setMarginTop(10);
    setMarginBottom(10);
    setMarginLeft(10);
    setMarginRight(10);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg, .jpeg, .png, .webp, .bmp, .heic, image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      <div className="rounded-3xl bg-white dark:bg-[#141622] border border-blue-200 dark:border-[#2A2E45] shadow-xl p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Image Crop Issue</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer text-center flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-blue-300 hover:border-purple-500 bg-linear-to-b from-white to-zinc-50 dark:to-zinc-950/20 min-h-[260px] transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-4">
              <Crop className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
              Select Image file to crop
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Drop your photo or image file here, or click to browse</p>
            <button
              type="button"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Choose Photo File
            </button>
          </div>
        )}

        {status === 'ready' && file && imageObj && (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Header controls */}
            <div className="pb-4 border-b border-zinc-100 dark:border-[#2A2E45] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{file.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Original: {imageDimensions.width} × {imageDimensions.height} px · {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* ── 4-Side Independent Margin Controls ──────────────────────── */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Image Crop Margins (All 4 Sides):
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPreset('equal10')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    Equal 10%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('headerFooter15')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    Top/Bottom (15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('sides15')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    Left/Right (15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('square1to1')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 cursor-pointer"
                  >
                    1:1 Square
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('reset')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-800 cursor-pointer"
                  >
                    Reset (0%)
                  </button>
                </div>
              </div>

              {/* Grid of 4 Margins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                {/* Top Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>⬆️ Top Margin</span>
                    <span className="text-purple-600 font-black">{marginTop}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={marginTop}
                    onChange={(e) => setMarginTop(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Bottom Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>⬇️ Bottom Margin</span>
                    <span className="text-purple-600 font-black">{marginBottom}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={marginBottom}
                    onChange={(e) => setMarginBottom(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Left Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>⬅️ Left Margin</span>
                    <span className="text-purple-600 font-black">{marginLeft}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={marginLeft}
                    onChange={(e) => setMarginLeft(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Right Margin */}
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>➡️ Right Margin</span>
                    <span className="text-purple-600 font-black">{marginRight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={marginRight}
                    onChange={(e) => setMarginRight(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ── Visual Live Crop Preview Box ─────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>Visual Live Crop Box Overlay:</span>
                <span className="text-xs text-purple-600 font-extrabold bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Target Dimensions: {croppedWidthPx} × {croppedHeightPx} px
                </span>
              </div>

              <div className="w-full h-80 sm:h-96 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={imageObj.src}
                    alt="Image to crop"
                    className="max-w-full max-h-[320px] sm:max-h-[350px] object-contain pointer-events-none rounded-lg"
                  />
                  {/* Interactive Crop Boundary Box */}
                  <div
                    className="absolute border-2 border-dashed border-purple-500 bg-purple-500/20 shadow-2xl pointer-events-none transition-all"
                    style={{
                      top: `${marginTop}%`,
                      bottom: `${marginBottom}%`,
                      left: `${marginLeft}%`,
                      right: `${marginRight}%`,
                    }}
                  >
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-purple-600 text-white rounded text-[9px] font-black uppercase tracking-wider shadow-xs">
                      {croppedWidthPx} × {croppedHeightPx} px
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Panel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#2A2E45]">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCropImage}
                className="px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Crop Photo Image
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin mx-auto flex items-center justify-center">
              <Crop className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Cropping Photo Image...</h4>
          </div>
        )}

        {status === 'completed' && (
          <div className="py-8 text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <Crop className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Image Cropped Successfully!</h3>
              <p className="text-xs text-zinc-500">Your high-resolution cropped photo is ready for download.</p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs">{resultFilename}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {resultDimensions.width} × {resultDimensions.height} px · {formatBytes(resultSize)}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                Cropped
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={(e) => {
                  if (e) e.preventDefault();
                  if (!resultUrl) return;
                  const link = document.createElement('a');
                  link.href = resultUrl;
                  link.download = resultFilename || 'cropped_image.png';
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => document.body.removeChild(link), 100);
                }}
                className="flex-1 min-w-[140px] py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Cropped Image
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Crop Another
              </button>
            </div>

            {/* Cropped Image Output Preview */}
            {resultUrl && (
              <div className="w-full mt-6 pt-6 border-t border-zinc-100 dark:border-[#2A2E45]">
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-3">Cropped Image Output:</p>
                <div className="w-full max-w-lg mx-auto bg-zinc-950 rounded-2xl p-4 border border-zinc-800 shadow-inner flex items-center justify-center">
                  <img src={resultUrl} alt="Cropped result" className="max-w-full max-h-[350px] object-contain rounded-lg" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
