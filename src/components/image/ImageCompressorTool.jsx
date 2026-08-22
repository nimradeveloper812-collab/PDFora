import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, Minimize2, Download, RotateCcw, AlertCircle,
  ShieldCheck, FileImage, ArrowRight, ArrowDownRight
} from 'lucide-react';
import {
  validateImageFile,
  compressImage,
  createManagedObjectURL,
  revokeManagedObjectURL,
  formatBytes
} from '../../services/imageService';
import ImageComparisonSlider from '../common/ImageComparisonSlider';
import AdBanner from '../common/AdBanner';

export default function ImageCompressorTool() {
  const [file, setFile] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Compression settings
  const [preset, setPreset] = useState('balanced'); // 'high' | 'balanced' | 'max' | 'custom'
  const [customQuality, setCustomQuality] = useState(75);
  const [outputFormat, setOutputFormat] = useState('original'); // 'original' | 'image/webp' | 'image/jpeg' | 'image/png'
  const [maxDimension, setMaxDimension] = useState('original'); // 'original' | '3840' | '1920' | '1280' | '800'

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

    if (previewUrl) revokeManagedObjectURL(previewUrl);
    if (resultUrl) revokeManagedObjectURL(resultUrl);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultData(null);

    try {
      const meta = await validateImageFile(incomingFile, 50);
      const url = createManagedObjectURL(incomingFile);
      setFile(incomingFile);
      setImageMeta(meta);
      setPreviewUrl(url);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err.message || 'Please upload a valid JPG, PNG, or WebP image.');
      setFile(null);
      setImageMeta(null);
      setStatus('idle');
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

  const executeCompression = useCallback(async (incomingFile = file) => {
    if (!incomingFile) return;
    setStatus('processing');
    setProgress(15);
    setProgressText('Analyzing image compression profile...');
    setErrorMsg('');

    if (resultUrl) revokeManagedObjectURL(resultUrl);

    try {
      const options = {
        qualityPreset: preset,
        customQuality: Number(customQuality),
        outputFormat,
        maxWidth: maxDimension !== 'original' ? parseInt(maxDimension, 10) : null,
      };

      const result = await compressImage(incomingFile, options, (pct, text) => {
        setProgress(pct);
        if (text) setProgressText(text);
      });

      const url = createManagedObjectURL(result.blob);
      setResultData(result);
      setResultUrl(url);
      setStatus('completed');
      setProgress(100);
      setProgressText('Image compressed successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to compress image. Please try again.');
      setStatus('ready');
    }
  }, [file, preset, customQuality, outputFormat, maxDimension, resultUrl]);

  const handleDownload = () => {
    if (!resultUrl || !resultData) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = resultData.filename || 'compressed_image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (previewUrl) revokeManagedObjectURL(previewUrl);
    if (resultUrl) revokeManagedObjectURL(resultUrl);
    setFile(null);
    setImageMeta(null);
    setPreviewUrl(null);
    setResultData(null);
    setResultUrl(null);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
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

        {/* State 1: Upload / Dropzone */}
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
                <Minimize2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-xl font-bold text-zinc-900">
                  Drag & Drop images here to compress
                </h3>
                <p className="text-sm text-zinc-500">
                  or click to select from your device
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all">
                <UploadCloud className="w-4 h-4" />
                <span>Select Image</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400 mt-2 font-medium text-center">
                <span>Supports JPG, PNG, WebP up to 50 MB</span>
                <span className="hidden xs:inline">•</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Privacy
                </span>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Ready / Compression Controls */}
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
                    Original Size: <strong className="text-zinc-800">{formatBytes(imageMeta?.size)}</strong> • {imageMeta?.width} × {imageMeta?.height} px
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

            {/* Compression Settings Panel */}
            <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/80 space-y-5">
              
              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2.5">
                  Compression Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreset('high')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      preset === 'high'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">High Quality</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">~88%</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-snug">Minimal reduction, crystal-clear detail</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreset('balanced')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      preset === 'balanced'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Balanced</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Recommended</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-snug">Optimal balance of size & visual clarity (~70% smaller)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreset('max')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      preset === 'max'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Max Compression</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Smallest</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-snug">Maximum file size reduction (~85%+ smaller)</p>
                  </button>
                </div>
              </div>

              {/* Advanced Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-200/60">
                {/* Format selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-zinc-300 bg-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="original">Original Format ({imageMeta?.extension?.toUpperCase() || 'AUTO'})</option>
                    <option value="image/webp">WebP (Best Compression & Speed)</option>
                    <option value="image/jpeg">JPEG (Universal Compatibility)</option>
                    <option value="image/png">PNG (Lossless / High Detail)</option>
                  </select>
                </div>

                {/* Max Dimension */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Max Resolution Sizing
                  </label>
                  <select
                    value={maxDimension}
                    onChange={(e) => setMaxDimension(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-zinc-300 bg-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="original">Original Dimensions ({imageMeta?.width}px)</option>
                    <option value="3840">Scale to 4K (3840px max width)</option>
                    <option value="1920">Scale to Full HD (1920px max width)</option>
                    <option value="1280">Scale to HD (1280px max width)</option>
                    <option value="800">Scale to Web (800px max width)</option>
                  </select>
                </div>

                {/* Quality Slider (Custom or fine tuning) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-700">
                      Quality: {customQuality}%
                    </label>
                    <span className="text-[10px] text-zinc-400">Manual Slider</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={customQuality}
                    onChange={(e) => {
                      setCustomQuality(Number(e.target.value));
                      setPreset('custom');
                    }}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Image Preview Box */}
            <div className="relative rounded-2xl border border-zinc-200 bg-zinc-900/5 flex items-center justify-center p-4 min-h-[240px] max-h-[380px] overflow-hidden">
              <img
                src={previewUrl}
                alt="Original preview"
                className="max-h-[340px] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Action CTA Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => executeCompression()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all"
              >
                <Minimize2 className="w-5 h-5" />
                <span>Compress Image Now</span>
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
                <Minimize2 className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-extrabold text-zinc-900">
                Compressing Image…
              </h3>
              <p className="text-sm text-zinc-500 font-medium">
                {progressText || 'Optimizing pixel data and stream compression...'}
              </p>
            </div>

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
        {status === 'completed' && previewUrl && resultUrl && resultData && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Real Stats Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Original Size
                </span>
                <span className="text-lg font-extrabold text-zinc-800">
                  {formatBytes(resultData.originalSize)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Compressed Size
                </span>
                <span className="text-lg font-extrabold text-blue-700">
                  {formatBytes(resultData.compressedSize)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Space Saved
                </span>
                <span className="text-lg font-extrabold text-emerald-700 flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" />
                  {resultData.savedPercent > 0 ? `${resultData.savedPercent}%` : '0%'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
                  Dimensions
                </span>
                <span className="text-sm font-extrabold text-purple-800 truncate block mt-0.5">
                  {resultData.width} × {resultData.height} px
                </span>
              </div>
            </div>

            {/* Quick Adjustment Controls while viewing result */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-700">Try different preset:</span>
                <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5">
                  {['high', 'balanced', 'max'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPreset(p);
                        setTimeout(() => executeCompression(), 50);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                        preset === p ? 'bg-blue-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {p === 'max' ? 'Max' : p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 border border-zinc-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Compress Another Image</span>
              </button>
            </div>

            {/* Before / After Comparison Slider */}
            <ImageComparisonSlider
              originalUrl={previewUrl}
              processedUrl={resultUrl}
              originalLabel={`Original (${formatBytes(resultData.originalSize)})`}
              processedLabel={`Compressed (${formatBytes(resultData.compressedSize)})`}
            />

            {/* Download Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100">
              <div className="text-xs text-zinc-500 text-center sm:text-left">
                <p className="font-bold text-zinc-800">{resultData.filename}</p>
                <p>Saved {formatBytes(resultData.savedBytes)} of disk/bandwidth space</p>
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
                  <span>Download Compressed Image</span>
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
