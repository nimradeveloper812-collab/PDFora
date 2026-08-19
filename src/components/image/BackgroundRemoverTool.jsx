import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Sparkles, Download, RotateCcw, AlertCircle,
  CheckCircle2, ShieldCheck, FileImage, ArrowRight
} from 'lucide-react';
import {
  validateImageFile,
  removeImageBackground,
  createManagedObjectURL,
  revokeManagedObjectURL,
  formatBytes
} from '../../services/imageService';
import ImageComparisonSlider from '../common/ImageComparisonSlider';
import AdBanner from '../common/AdBanner';

export default function BackgroundRemoverTool() {
  const [file, setFile] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [outputFormat, setOutputFormat] = useState('png'); // 'png' | 'webp' | 'jpg'
  const [status, setStatus] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up Object URLs when unmounting or resetting
  useEffect(() => {
    return () => {
      if (previewUrl) revokeManagedObjectURL(previewUrl);
      if (resultUrl) revokeManagedObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    setStatus('idle');

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(incomingFile.type) && !/\.(jpe?g|png|webp)$/i.test(incomingFile.name)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (35 MB max)
    if (incomingFile.size > 35 * 1024 * 1024) {
      setErrorMsg('File exceeds 35 MB limit. Please upload a smaller image.');
      return;
    }

    try {
      const meta = await getImageMetadata(incomingFile);
      setImageMeta(meta);
      setFile(incomingFile);
      const url = createManagedObjectURL(incomingFile);
      setPreviewUrl(url);
      setStatus('ready');
    } catch (err) {
      setErrorMsg('Could not read image file. Please try another image.');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(10);
    setProgressText('Preparing AI segmentation engine...');
    setErrorMsg('');

    try {
      const blob = await removeImageBackground(file, (pct, text) => {
        setProgress(pct);
        if (text) setProgressText(text);
      });

      setResultBlob(blob);
      const url = createManagedObjectURL(blob);
      setResultUrl(url);
      setStatus('completed');
      setProgress(100);
      setProgressText('Background removed successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove background. Please try with another image.');
      setStatus('ready');
    }
  };

  const handleDownload = async () => {
    if (!resultBlob && !resultUrl) return;
    const baseName = (file?.name || 'image').replace(/\.[^/.]+$/, '');
    
    let finalBlob = resultBlob;
    let ext = outputFormat;
    let mime = 'image/png';

    if (outputFormat === 'jpg') {
      mime = 'image/jpeg';
      ext = 'jpg';
      // Flatten onto white canvas
      const img = new Image();
      img.src = resultUrl;
      await new Promise(r => { img.onload = r; });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      finalBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
    } else if (outputFormat === 'webp') {
      mime = 'image/webp';
      ext = 'webp';
      const img = new Image();
      img.src = resultUrl;
      await new Promise(r => { img.onload = r; });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      finalBlob = await new Promise(r => canvas.toBlob(r, 'image/webp', 0.92));
    }

    const downloadUrl = URL.createObjectURL(finalBlob);
    const filename = `${baseName}_bg_removed_pdfora.${ext}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleReset = () => {
    if (previewUrl) revokeManagedObjectURL(previewUrl);
    if (resultUrl) revokeManagedObjectURL(resultUrl);
    setFile(null);
    setImageMeta(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setOutputFormat('png');
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Tool Container Card */}
      <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden p-6 sm:p-8 md:p-10 transition-all">
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fade-in" role="alert">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 font-medium">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg('')}
              className="text-red-400 hover:text-red-600 font-bold ml-2"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* State 1: Upload / Idle */}
        {status === 'idle' && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                : 'border-zinc-300 hover:border-blue-500 hover:bg-blue-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 border border-blue-100">
                <Sparkles className="w-10 h-10" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-xl font-bold text-zinc-900">
                  Drag & Drop your image here
                </h3>
                <p className="text-sm text-zinc-500">
                  or click to browse from your device
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all">
                <UploadCloud className="w-4 h-4" />
                <span>Choose Image</span>
              </div>

              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 mr-1">Supported Formats:</span>
                  {['JPG', 'JPEG', 'PNG', 'WEBP'].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70 shadow-xs"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span className="text-xs font-medium text-zinc-400 ml-1">(Up to 35 MB)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% In-Browser &amp; Private AI Processing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Ready to Process (Uploaded & Preview) */}
        {status === 'ready' && previewUrl && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 truncate max-w-xs sm:max-w-md">
                    {file?.name}
                  </p>
                  <p className="text-xs text-zinc-500 font-medium">
                    {formatBytes(imageMeta?.size)} • {imageMeta?.width} × {imageMeta?.height} px
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Choose Different Image</span>
              </button>
            </div>

            {/* Select Output Format Points */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                1. Select Desired Output Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOutputFormat('png')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    outputFormat === 'png'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">PNG</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Transparent</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">Full alpha transparency, loss-free detail</p>
                </button>

                <button
                  type="button"
                  onClick={() => setOutputFormat('webp')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    outputFormat === 'webp'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">WebP</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Ultra-Light</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">Transparent &amp; 70% smaller file size</p>
                </button>

                <button
                  type="button"
                  onClick={() => setOutputFormat('jpg')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    outputFormat === 'jpg'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">JPG</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Solid White</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">Solid white background for shop catalogs</p>
                </button>
              </div>
            </div>

            {/* Image Preview Box */}
            <div className="relative rounded-2xl border border-zinc-200 bg-zinc-900/5 flex items-center justify-center p-4 min-h-[260px] max-h-[420px] overflow-hidden">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={handleProcess}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Remove Background ({outputFormat.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* State 3: Processing */}
        {status === 'processing' && (
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
              <div className="w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center">
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-extrabold text-zinc-900">
                Removing Background with AI…
              </h3>
              <p className="text-sm text-zinc-500 font-medium">
                {progressText || 'Detecting subject and extracting transparent layers...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-zinc-100 rounded-full h-3 overflow-hidden border border-zinc-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-blue-600 tracking-wider">
              {progress}% COMPLETED
            </span>
          </div>
        )}

        {/* State 4: Completed Result */}
        {status === 'completed' && previewUrl && resultUrl && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Background Removed Successfully ({outputFormat.toUpperCase()})!</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Process Another Image</span>
                </button>
              </div>
            </div>

            {/* Comparison Slider */}
            <ImageComparisonSlider
              originalUrl={previewUrl}
              processedUrl={resultUrl}
              originalLabel="Original Photo"
              processedLabel={`Processed ${outputFormat.toUpperCase()}`}
              isTransparent={outputFormat !== 'jpg'}
            />

            {/* Download CTA Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100">
              <div className="text-xs text-zinc-500 text-center sm:text-left">
                <p className="font-semibold text-zinc-800">Export Format: {outputFormat.toUpperCase()}</p>
                <p>{outputFormat === 'jpg' ? 'Saved with clean white solid background' : 'Saved with full alpha transparency at original resolution'}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Download {outputFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* AdBanner integration below tool */}
      <div className="mt-8">
        <AdBanner slot="horizontal-leaderboard" />
      </div>
    </div>
  );
}
