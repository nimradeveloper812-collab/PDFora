import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, FileImage, Download, RotateCcw, AlertCircle,
  ShieldCheck, RefreshCw, ArrowRight, CheckCircle2, Info
} from 'lucide-react';
import {
  convertImage,
  SUPPORTED_IMAGE_INPUTS,
  SUPPORTED_IMAGE_OUTPUTS,
  formatBytes
} from '../../services/mediaService';
import AdBanner from '../common/AdBanner';

export default function ImageConverterTool() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [targetFormat, setTargetFormat] = useState('webp');
  const [quality, setQuality] = useState(85);
  const [lossless, setLossless] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [outputSize, setOutputSize] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const handleFileSelect = (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    setStatus('idle');

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultBlob(null);

    const ext = incomingFile.name.split('.').pop()?.toLowerCase() || '';
    if (!SUPPORTED_IMAGE_INPUTS.includes(ext) && !incomingFile.type.startsWith('image/')) {
      setErrorMsg(`Unsupported image format (.${ext}). Please upload: ${SUPPORTED_IMAGE_INPUTS.join(', ').toUpperCase()}`);
      setFile(null);
      return;
    }

    if (incomingFile.size > 50 * 1024 * 1024) {
      setErrorMsg('Image exceeds the 50 MB limit. Please upload a smaller image.');
      setFile(null);
      return;
    }

    const url = URL.createObjectURL(incomingFile);
    setFile(incomingFile);
    setPreviewUrl(url);

    // Pick sensible default target format
    if (ext === 'webp') {
      setTargetFormat('png');
    } else if (ext === 'png') {
      setTargetFormat('webp');
    } else {
      setTargetFormat('webp');
    }

    setStatus('ready');
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

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(20);
    setProgressText('Processing image conversion...');
    setErrorMsg('');

    try {
      const result = await convertImage(
        file,
        {
          format: targetFormat,
          quality,
          lossless,
        },
        (pct, text) => {
          setProgress(pct);
          setProgressText(text);
        }
      );

      const url = URL.createObjectURL(result.blob);
      setResultBlob(result.blob);
      setResultUrl(url);
      setOutputSize(result.outputSize);
      setStatus('completed');
    } catch (err) {
      console.error('Image conversion error:', err);
      setErrorMsg(err.message || 'Failed to convert image. Please try again.');
      setStatus('ready');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}.${targetFormat}`;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputExt = file?.name?.split('.').pop()?.toLowerCase() || '';
  const isTargetLossy = ['jpg', 'jpeg', 'webp', 'avif'].includes(targetFormat);
  const willFlattenTransparency = (inputExt === 'png' || inputExt === 'webp') && (targetFormat === 'jpg' || targetFormat === 'jpeg');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Upload Zone */}
      {status === 'idle' && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 bg-white hover:bg-blue-50/30 ${
            isDragging ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' : 'border-zinc-300 hover:border-blue-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.avif,.svg,.ico"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">
            Upload Image to Convert Format
          </h3>
          <p className="text-zinc-500 max-w-md mx-auto mb-6 text-sm">
            Drag & drop any image here, or click to browse. Supports JPG, PNG, WebP, GIF, BMP, TIFF, AVIF, and SVG.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Max file size: 50 MB • Full alpha transparency & color depth preservation
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Configuration & Processing View */}
      {(status === 'ready' || status === 'processing') && file && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8">
          {/* File summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 mb-6">
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-zinc-200" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileImage className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate max-w-xs sm:max-w-md">{file.name}</p>
                <p className="text-xs text-zinc-500">{formatBytes(file.size)} • Format: {inputExt.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              disabled={status === 'processing'}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 transition disabled:opacity-50"
            >
              Choose Different Image
            </button>
          </div>

          {/* Transparency Warning Notice */}
          {willFlattenTransparency && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <p>
                <strong>Transparency Notice:</strong> JPEG does not support transparent backgrounds. Any transparent areas in your {inputExt.toUpperCase()} will be rendered on a solid white background. To preserve transparency, select <strong>WebP</strong>, <strong>PNG</strong>, or <strong>AVIF</strong>.
              </p>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-zinc-800 mb-2">
                Target Image Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SUPPORTED_IMAGE_OUTPUTS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    disabled={status === 'processing'}
                    className={`p-3 rounded-2xl border text-left transition ${
                      targetFormat === fmt.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <p className={`font-bold text-sm ${targetFormat === fmt.id ? 'text-blue-700' : 'text-zinc-800'}`}>
                      {fmt.id.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{fmt.desc.split(' ')[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-800 mb-2 flex items-center justify-between">
                <span>Quality & Settings</span>
                {isTargetLossy && <span className="text-xs font-semibold text-blue-600">{quality}%</span>}
              </label>

              {isTargetLossy ? (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={status === 'processing' || lossless}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-3"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 font-semibold mb-4">
                    <span>Smaller File (20%)</span>
                    <span>Balanced (80%)</span>
                    <span>High Fidelity (100%)</span>
                  </div>

                  {(targetFormat === 'webp' || targetFormat === 'avif') && (
                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lossless}
                        onChange={(e) => setLossless(e.target.checked)}
                        disabled={status === 'processing'}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      Enable Bit-for-Bit Lossless Mode
                    </label>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                  <p className="font-semibold text-zinc-800 mb-1">{targetFormat.toUpperCase()} Lossless Engine</p>
                  <p>Preserves 100% pixel fidelity with maximum lossless compression.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action or Progress */}
          {status === 'processing' ? (
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-zinc-900 mb-1">{progressText || 'Converting Image...'}</p>
              <div className="w-full max-w-md mx-auto bg-blue-200/60 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleConvert}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              Convert to {targetFormat.toUpperCase()}
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      )}

      {/* Completed Result View */}
      {status === 'completed' && resultBlob && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">
            Image Converted Successfully!
          </h3>
          <p className="text-zinc-600 text-sm mb-6">
            Your {targetFormat.toUpperCase()} image has been rendered with full precision.
          </p>

          {/* Size metrics card */}
          <div className="max-w-md mx-auto grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mb-6 text-left">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Original ({inputExt.toUpperCase()})</p>
              <p className="font-bold text-zinc-800">{formatBytes(file?.size || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Converted ({targetFormat.toUpperCase()})</p>
              <p className="font-bold text-emerald-600">{formatBytes(outputSize || resultBlob.size)}</p>
            </div>
          </div>

          {/* Image preview */}
          {resultUrl && (
            <div className="max-w-md mx-auto mb-6 p-2 rounded-2xl bg-zinc-100 border border-zinc-200">
              <img src={resultUrl} alt="Converted preview" className="w-full max-h-64 object-contain rounded-xl" />
            </div>
          )}

          {/* Download and Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={handleDownload}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Download {targetFormat.toUpperCase()}
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Convert Another
            </button>
          </div>
        </div>
      )}

      {/* Ad placement */}
      <div className="mt-8">
        <AdBanner />
      </div>
    </div>
  );
}
