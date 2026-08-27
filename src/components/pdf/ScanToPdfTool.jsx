import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, RefreshCw, Trash2, Download, Eye, Sparkles,
  Sliders, MoveUp, MoveDown, Check, AlertCircle, FileText, ArrowRight, Zap, ShieldCheck
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ScanToPdfTool() {
  const [pages, setPages] = useState([]); // Array of { id, originalUrl, filter: 'magic', brightness: 0, contrast: 20, rotation: 0 }
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [pageMargin, setPageMargin] = useState('small'); // 'none' | 'small' | 'normal'
  const [pageSize, setPageSize] = useState('a4'); // 'a4' | 'letter' | 'fit'
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera when component unmounts or camera closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera access was denied. Please click the camera icon in your browser address bar and allow camera access, then try again. You can also use "Upload Photos / Scans" instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera found on this device. Please use the "Upload Photos / Scans" button to add images.');
      } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
        setErrorMsg('Camera requires a secure (HTTPS) connection. Please use "Upload Photos / Scans" instead.');
      } else {
        setErrorMsg('Could not access camera. Please use "Upload Photos / Scans" to add your images instead.');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const newPage = {
      id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      originalUrl: dataUrl,
      filter: 'magic', // 'original' | 'magic' | 'bw' | 'grayscale'
      brightness: 0,
      contrast: 25,
      rotation: 0,
    };

    setPages(prev => [...prev, newPage]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(f => {
      if (!f.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        setPages(prev => [
          ...prev,
          {
            id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            originalUrl: dataUrl,
            filter: 'magic',
            brightness: 0,
            contrast: 25,
            rotation: 0,
          }
        ]);
      };
      reader.readAsDataURL(f);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updatePage = (id, updates) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePage = (id) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const movePage = (index, delta) => {
    setPages(prev => {
      const newArr = [...prev];
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });
  };

  const applyFilterToAll = (filterType) => {
    setPages(prev => prev.map(p => ({ ...p, filter: filterType })));
  };

  // Render processed filtered canvas image for PDF generation
  const processImageToCanvas = (pageObj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const isRotated90 = pageObj.rotation % 180 !== 0;
        const width = isRotated90 ? img.height : img.width;
        const height = isRotated90 ? img.width : img.height;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.save();

        // Handle rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((pageObj.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        // Apply Scanner Filters
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const bOffset = pageObj.brightness * 2.55;
        const cFactor = (259 * (pageObj.contrast + 255)) / (255 * (259 - pageObj.contrast));

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Apply contrast & brightness
          r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128 + bOffset));
          g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128 + bOffset));
          b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128 + bOffset));

          if (pageObj.filter === 'bw') {
            // High contrast Black & White Scanner
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const threshold = 145;
            const bw = gray > threshold ? 255 : 0;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
          } else if (pageObj.filter === 'grayscale') {
            // Grayscale
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          } else if (pageObj.filter === 'magic') {
            // Magic Scanner Filter (Boost white background, sharpen dark ink)
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (gray > 165) {
              // Whitify paper background
              data[i] = Math.min(255, r * 1.15 + 15);
              data[i + 1] = Math.min(255, g * 1.15 + 15);
              data[i + 2] = Math.min(255, b * 1.15 + 15);
            } else {
              // Darken text/ink
              data[i] = r * 0.85;
              data[i + 1] = g * 0.85;
              data[i + 2] = b * 0.85;
            }
          } else {
            // Original
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = pageObj.originalUrl;
    });
  };

  const handleGeneratePdf = async () => {
    if (!pages.length) return;
    setStatus('processing');
    setProgress(15);
    setProgressText('Processing scanner filters & rendering pages...');
    setErrorMsg('');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        const pct = 15 + Math.round(((i + 1) / pages.length) * 75);
        setProgress(pct);
        setProgressText(`Rendering scanned page ${i + 1} of ${pages.length}...`);

        const processedDataUrl = await processImageToCanvas(pages[i]);
        const imageBytes = await fetch(processedDataUrl).then(res => res.arrayBuffer());
        const embeddedImage = await pdfDoc.embedJpg(imageBytes);

        let pdfWidth = 595.28; // A4 width
        let pdfHeight = 841.89; // A4 height

        if (pageSize === 'letter') {
          pdfWidth = 612;
          pdfHeight = 792;
        } else if (pageSize === 'fit') {
          pdfWidth = embeddedImage.width * 0.75;
          pdfHeight = embeddedImage.height * 0.75;
        }

        const page = pdfDoc.addPage([pdfWidth, pdfHeight]);

        let marginPx = 20;
        if (pageMargin === 'none') marginPx = 0;
        else if (pageMargin === 'normal') marginPx = 40;

        const availableW = pdfWidth - marginPx * 2;
        const availableH = pdfHeight - marginPx * 2;

        const imgAspect = embeddedImage.width / embeddedImage.height;
        const pageAspect = availableW / availableH;

        let drawW = availableW;
        let drawH = availableH;

        if (imgAspect > pageAspect) {
          drawH = availableW / imgAspect;
        } else {
          drawW = availableH * imgAspect;
        }

        const drawX = marginPx + (availableW - drawW) / 2;
        const drawY = marginPx + (availableH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      setProgress(95);
      setProgressText('Compiling PDF document...');
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultBlobUrl(url);
      setResultFilename(`Scanned_Document_${Date.now()}.pdf`);
      setResultSize(blob.size);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to generate scanned PDF. ' + (err.message || ''));
      setStatus('idle');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setPages([]);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
    if (resultBlobUrl) {
      URL.revokeObjectURL(resultBlobUrl);
      setResultBlobUrl(null);
    }
    setResultFilename('');
    setResultSize(0);
    stopCamera();
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-display flex items-center justify-center gap-2">
          <Camera className="w-7 h-7 text-purple-600 animate-pulse" />
          <span>Smart Document Scanner to PDF</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Capture paper receipts, letters, notes & forms using your camera or upload photo scans.
          Apply auto-enhancement scanner filters and convert to PDF instantly.
        </p>
      </div>

      {/* ── Status Banner / Completed View ───────────────────────── */}
      {status === 'completed' && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 shadow-lg animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
              Scanned PDF Ready!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              {resultFilename} • {formatBytes(resultSize)} • {pages.length} Scanned Pages
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                if (e) e.preventDefault();
                if (!resultBlobUrl) return;
                const link = document.createElement('a');
                link.href = resultBlobUrl;
                link.download = resultFilename || 'scanned_document.pdf';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => document.body.removeChild(link), 100);
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Scanned PDF</span>
            </button>
            <button
              type="button"
              onClick={() => window.open(resultBlobUrl, '_blank')}
              className="px-5 py-3 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 text-xs sm:text-sm font-bold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Preview PDF</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Scan New Document
            </button>
          </div>
        </div>
      )}

      {/* ── Processing Indicator ──────────────────────────────────── */}
      {status === 'processing' && (
        <div className="p-8 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center space-y-4 shadow-md">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-purple-900 dark:text-purple-200">
              {progressText}
            </h4>
            <div className="w-full max-w-md mx-auto h-2 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Working Workspace (Idle or Ready) ───────────────── */}
      {status !== 'completed' && status !== 'processing' && (
        <div className="space-y-6">

          {/* ── Action Bar: Camera & Upload ────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera Scanner</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Close Camera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Upload Photos / Scans</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* ── Error Message ─────────────────────────────────────── */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span className="flex-1">{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg('')}
                className="shrink-0 text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors font-bold text-sm leading-none cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Live Camera Viewfinder ────────────────────────────── */}
          {isCameraActive && (
            <div className="p-4 rounded-2xl bg-zinc-950 text-white text-center space-y-3 shadow-2xl relative overflow-hidden border border-zinc-800">
              <div className="relative max-w-lg mx-auto overflow-hidden rounded-xl bg-black border border-zinc-800 aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Scanner Frame Overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-purple-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 px-3 py-1 rounded text-[11px] font-bold text-purple-300 tracking-wider">
                    ALIGN DOCUMENT HERE
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transform active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Document Page ({pages.length} Captured)</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Scanned Pages Grid & Controls ──────────────────────── */}
          {pages.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-lg space-y-6">

              {/* Toolbar & Filter Presets */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider font-display">
                    {pages.length} Scanned Pages Ready
                  </span>
                </div>

                {/* Global Scanner Filter Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-zinc-500 mr-1">Global Scanner Filter:</span>
                  <button
                    type="button"
                    onClick={() => applyFilterToAll('magic')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-600 text-white hover:bg-purple-700 shadow-xs cursor-pointer"
                  >
                    ✨ Magic Scanner (Clean Text)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilterToAll('bw')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    📄 B&W High-Contrast
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilterToAll('grayscale')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 cursor-pointer"
                  >
                    🌗 Grayscale
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilterToAll('original')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 cursor-pointer"
                  >
                    🖼️ Original Photo
                  </button>
                </div>
              </div>

              {/* Page Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#1B1E2E]/60 space-y-3 relative group"
                  >
                    {/* Badge & Order */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Page {idx + 1}
                      </span>
                      <span className="uppercase text-[10px] tracking-wider text-purple-600 font-mono">
                        Filter: {p.filter}
                      </span>
                    </div>

                    {/* Image Preview Canvas Thumbnail */}
                    <div className="relative aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={p.originalUrl}
                        alt={`Scan page ${idx + 1}`}
                        style={{
                          transform: `rotate(${p.rotation}deg)`,
                          filter: p.filter === 'bw'
                            ? `contrast(${180 + p.contrast}%) brightness(${100 + p.brightness}%) grayscale(100%)`
                            : p.filter === 'grayscale'
                            ? `grayscale(100%) contrast(${100 + p.contrast}%)`
                            : p.filter === 'magic'
                            ? `contrast(${130 + p.contrast}%) brightness(${105 + p.brightness}%)`
                            : `contrast(${100 + p.contrast}%) brightness(${100 + p.brightness}%)`
                        }}
                        className="max-h-full max-w-full object-contain transition-all duration-200"
                      />
                    </div>

                    {/* Page Actions Bar */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updatePage(p.id, { rotation: (p.rotation + 90) % 360 })}
                          className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100 hover:text-purple-700 text-xs font-bold border border-zinc-200 dark:border-zinc-700 transition-colors"
                          title="Rotate 90° CW"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(idx, -1)}
                          disabled={idx === 0}
                          className={`p-1.5 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 ${idx === 0 ? 'opacity-40 cursor-not-allowed' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100'}`}
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(idx, 1)}
                          disabled={idx === pages.length - 1}
                          className={`p-1.5 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 ${idx === pages.length - 1 ? 'opacity-40 cursor-not-allowed' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100'}`}
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePage(p.id)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Document Format & Layout Options ────────────────────── */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block mb-1 text-zinc-700 dark:text-zinc-300">Page Size Format</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="a4">Standard A4 Document (210 x 297 mm)</option>
                    <option value="letter">US Letter Document (8.5 x 11 in)</option>
                    <option value="fit">Auto-Fit Scanned Image Bounds</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-zinc-700 dark:text-zinc-300">Page Margins</label>
                  <select
                    value={pageMargin}
                    onChange={(e) => setPageMargin(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="none">No Margin (Full Bleed Scan)</option>
                    <option value="small">Small Clean Margin (Recommended)</option>
                    <option value="normal">Standard Document Margin</option>
                  </select>
                </div>
              </div>

              {/* ── Final Convert Button ─────────────────────────────── */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Clear All Pages
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Generate Scanned PDF ({pages.length} Pages)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
