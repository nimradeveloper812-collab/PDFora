import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Minimize2, Download, RotateCcw, AlertCircle,
  ShieldCheck, FileVideo, ArrowRight, CheckCircle2
} from 'lucide-react';
import {
  compressVideo,
  SUPPORTED_VIDEO_INPUTS,
  formatBytes
} from '../../services/mediaService';
import AdBanner from '../common/AdBanner';

export default function VideoCompressorTool() {
  const [file, setFile] = useState(null);
  const [preset, setPreset] = useState('balanced'); // 'high' | 'balanced' | 'max'
  const [resolution, setResolution] = useState('original');
  const [status, setStatus] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [metrics, setMetrics] = useState(null);

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
    setMetrics(null);

    const ext = incomingFile.name.split('.').pop()?.toLowerCase() || '';
    if (!SUPPORTED_VIDEO_INPUTS.includes(ext) && !incomingFile.type.startsWith('video/')) {
      setErrorMsg(`Unsupported video format (.${ext}). Please upload: ${SUPPORTED_VIDEO_INPUTS.slice(0, 8).join(', ').toUpperCase()}`);
      setFile(null);
      return;
    }

    if (incomingFile.size > 200 * 1024 * 1024) {
      setErrorMsg('File exceeds the 200 MB limit. Please upload a smaller video.');
      setFile(null);
      return;
    }

    setFile(incomingFile);
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

  const handleCompress = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(15);
    setProgressText('Analyzing video bitstream & GOP structure...');
    setErrorMsg('');

    try {
      const result = await compressVideo(
        file,
        {
          preset,
          resolution,
        },
        (pct, text) => {
          setProgress(pct);
          setProgressText(text);
        }
      );

      const url = URL.createObjectURL(result.blob);
      setResultBlob(result.blob);
      setResultUrl(url);
      setMetrics({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        savedPercent: result.savedPercent,
        savedBytes: Math.max(0, result.originalSize - result.compressedSize),
      });
      setStatus('completed');
    } catch (err) {
      console.error('Video compression error:', err);
      setErrorMsg(err.message || 'Failed to compress video. Please try again.');
      setStatus('ready');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_compressed.mp4`;
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
    setMetrics(null);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
            Upload Video to Compress File Size
          </h3>
          <p className="text-zinc-500 max-w-md mx-auto mb-6 text-sm">
            Drag & drop your video file here, or click to browse. Supports MP4, WebM, MKV, AVI, MOV, WMV, and FLV.
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Max file size: 200 MB</span>
            <span className="hidden xs:inline">•</span>
            <span>Multi-pass H.264 compression & auto-cleanup</span>
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
                <p className="text-xs text-zinc-500">{formatBytes(file.size)}</p>
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
                Compression Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'high', label: 'High Quality', desc: 'Retains maximum sharpness. ~30-50% size reduction.' },
                  { id: 'balanced', label: 'Balanced', desc: 'Recommended profile. ~50-70% size reduction.' },
                  { id: 'max', label: 'Maximum Savings', desc: 'Smallest file size. ~70-85% size reduction.' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    disabled={status === 'processing'}
                    className={`p-4 rounded-2xl border text-left transition ${
                      preset === p.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <p className={`font-bold text-sm mb-1 ${preset === p.id ? 'text-blue-700' : 'text-zinc-900'}`}>{p.label}</p>
                    <p className="text-xs text-zinc-500">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-800 mb-2">
                Resolution Scaling
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={status === 'processing'}
                className="w-full p-3.5 rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="original">Keep Native Resolution</option>
                <option value="1080p">Downscale to 1080p FHD</option>
                <option value="720p">Downscale to 720p HD</option>
                <option value="480p">Downscale to 480p SD</option>
              </select>
              <p className="text-xs text-zinc-500 mt-2">
                Downscaling resolution significantly reduces video file size for messaging & email uploads.
              </p>
            </div>
          </div>

          {/* Action or Progress */}
          {status === 'processing' ? (
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-zinc-900 mb-1">{progressText || 'Compressing Video Stream...'}</p>
              <div className="w-full max-w-md mx-auto bg-blue-200/60 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleCompress}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Minimize2 className="w-5 h-5" />
              Compress Video
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      )}

      {/* Completed Result View */}
      {status === 'completed' && metrics && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">
            Video Compressed Successfully!
          </h3>
          <p className="text-zinc-600 text-sm mb-6">
            Your optimized MP4 video is encoded and ready to download.
          </p>

          {/* Size Reduction Card */}
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 p-5 rounded-2xl bg-zinc-50 border border-zinc-200 mb-6 text-center">
            <div className="p-2">
              <p className="text-xs text-zinc-500 font-medium mb-1">Original Size</p>
              <p className="font-bold text-zinc-800 text-base sm:text-lg">{formatBytes(metrics.originalSize)}</p>
            </div>
            <div className="p-2 border-x border-zinc-200">
              <p className="text-xs text-zinc-500 font-medium mb-1">Compressed</p>
              <p className="font-bold text-emerald-600 text-base sm:text-lg">{formatBytes(metrics.compressedSize)}</p>
            </div>
            <div className="p-2">
              <p className="text-xs text-zinc-500 font-medium mb-1">Saved</p>
              <p className="font-bold text-blue-600 text-base sm:text-lg">
                {metrics.savedPercent}%
              </p>
            </div>
          </div>

          {/* Video Player Preview */}
          {resultUrl && (
            <div className="max-w-md mx-auto mb-6 p-2 rounded-2xl bg-zinc-100 border border-zinc-200">
              <video controls className="w-full max-h-64 object-contain rounded-xl bg-black">
                <source src={resultUrl} type="video/mp4" />
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
              Download Compressed MP4
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Compress Another
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
