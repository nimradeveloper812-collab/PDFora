import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, FileVideo, Download, RotateCcw, AlertCircle,
  ShieldCheck, RefreshCw, ArrowRight, CheckCircle2
} from 'lucide-react';
import {
  convertVideo,
  SUPPORTED_VIDEO_INPUTS,
  SUPPORTED_VIDEO_OUTPUTS,
  formatBytes
} from '../../services/mediaService';
import AdBanner from '../common/AdBanner';

export default function VideoConverterTool() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [resolution, setResolution] = useState('original');
  const [quality, setQuality] = useState('balanced');
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
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFileSelect = (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    setStatus('idle');

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultBlob(null);

    const ext = incomingFile.name.split('.').pop()?.toLowerCase() || '';
    if (!SUPPORTED_VIDEO_INPUTS.includes(ext) && !incomingFile.type.startsWith('video/')) {
      setErrorMsg(`Unsupported video format (.${ext}). Please upload: ${SUPPORTED_VIDEO_INPUTS.join(', ').toUpperCase()}`);
      setFile(null);
      return;
    }

    if (incomingFile.size > 200 * 1024 * 1024) {
      setErrorMsg('File exceeds the 200 MB limit. Please upload a smaller video.');
      setFile(null);
      return;
    }

    setFile(incomingFile);

    // Pick sensible default output format
    if (ext === 'mp4') {
      setTargetFormat('webm');
    } else {
      setTargetFormat('mp4');
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
    setProgress(15);
    setProgressText('Preparing FFmpeg transcoding pipeline...');
    setErrorMsg('');

    try {
      const result = await convertVideo(
        file,
        {
          format: targetFormat,
          resolution,
          quality,
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
      console.error('Video conversion error:', err);
      setErrorMsg(err.message || 'Failed to convert video. Please try again.');
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
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setResultBlob(null);
    setResultUrl(null);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputExt = file?.name?.split('.').pop()?.toLowerCase() || '';

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
            accept="video/*,.mp4,.webm,.mkv,.avi,.mov,.flv,.wmv,.mpeg,.mpg,.m4v,.3gp,.ogv,.ts"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">
            Upload Video to Convert Format
          </h3>
          <p className="text-zinc-500 max-w-md mx-auto mb-6 text-sm">
            Drag & drop your video file here, or click to browse. Supports MP4, WebM, MKV, AVI, MOV, WMV, FLV, TS, and OGV.
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Max file size: 200 MB</span>
            <span className="hidden xs:inline">•</span>
            <span>FFmpeg hardware-accelerated transcoding</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Configuration & Processing View */}
      {(status === 'ready' || status === 'processing') && file && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8">
          {/* File summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileVideo className="w-6 h-6" />
              </div>
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
              Choose Different Video
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-zinc-800 mb-2">
                Target Video Container
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SUPPORTED_VIDEO_OUTPUTS.map((fmt) => (
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
                    <p className="text-[11px] text-zinc-500 truncate">{fmt.label.split(' ')[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-800 mb-1.5">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  disabled={status === 'processing'}
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="original">Keep Native Resolution</option>
                  <option value="1080p">1080p Full HD (1920×1080)</option>
                  <option value="720p">720p HD (1280×720)</option>
                  <option value="480p">480p SD (854×480)</option>
                  <option value="360p">360p Web (640×360)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-800 mb-1.5">
                  Encoding Preset
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={status === 'processing'}
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="balanced">Balanced (Optimal quality & speed)</option>
                  <option value="high">High Fidelity (CRF 20)</option>
                  <option value="fast">Fast Transcode (CRF 28)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action or Progress */}
          {status === 'processing' ? (
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-zinc-900 mb-1">{progressText || 'Transcoding Video...'}</p>
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
            Video Converted Successfully!
          </h3>
          <p className="text-zinc-600 text-sm mb-6">
            Your {targetFormat.toUpperCase()} video has been encoded and is ready to download.
          </p>

          {/* Size metrics card */}
          <div className="max-w-md mx-auto grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mb-6 text-left">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Original Video</p>
              <p className="font-bold text-zinc-800">{formatBytes(file?.size || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Converted ({targetFormat.toUpperCase()})</p>
              <p className="font-bold text-emerald-600">{formatBytes(outputSize || resultBlob.size)}</p>
            </div>
          </div>

          {/* Video Player Preview (if MP4/WebM) */}
          {resultUrl && (targetFormat === 'mp4' || targetFormat === 'webm') && (
            <div className="max-w-md mx-auto mb-6 p-2 rounded-2xl bg-zinc-100 border border-zinc-200">
              <video controls className="w-full max-h-64 object-contain rounded-xl bg-black">
                <source src={resultUrl} type={`video/${targetFormat}`} />
                Your browser does not support video playback.
              </video>
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
