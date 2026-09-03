import React, { useState, useRef } from 'react';
import {
  Upload, RefreshCw, Trash2, Download, Eye, Sparkles,
  MoveUp, MoveDown, Check, ArrowRight, FileImage
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ScanToPdfTool() {
  const [pages, setPages] = useState([]);
  const [pageMargin, setPageMargin] = useState('small');
  const [pageSize, setPageSize] = useState('a4');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const addImageFiles = (files) => {
    Array.from(files).forEach(f => {
      if (!f.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPages(prev => [
          ...prev,
          {
            id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            originalUrl: evt.target.result,
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

  const handleFileUpload = (e) => addImageFiles(e.target.files || []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addImageFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const updatePage = (id, updates) =>
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const removePage = (id) =>
    setPages(prev => prev.filter(p => p.id !== id));

  const movePage = (index, delta) => {
    setPages(prev => {
      const arr = [...prev];
      const target = index + delta;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const applyFilterToAll = (filterType) =>
    setPages(prev => prev.map(p => ({ ...p, filter: filterType })));

  const processImageToCanvas = (pageObj) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isRotated90 = pageObj.rotation % 180 !== 0;
        const width = isRotated90 ? img.height : img.width;
        const height = isRotated90 ? img.width : img.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((pageObj.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const bOffset = pageObj.brightness * 2.55;
        const cFactor = (259 * (pageObj.contrast + 255)) / (255 * (259 - pageObj.contrast));

        for (let i = 0; i < data.length; i += 4) {
          let r = Math.min(255, Math.max(0, cFactor * (data[i] - 128) + 128 + bOffset));
          let g = Math.min(255, Math.max(0, cFactor * (data[i+1] - 128) + 128 + bOffset));
          let b = Math.min(255, Math.max(0, cFactor * (data[i+2] - 128) + 128 + bOffset));

          if (pageObj.filter === 'bw') {
            const bw = (0.299 * r + 0.587 * g + 0.114 * b) > 145 ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = bw;
          } else if (pageObj.filter === 'grayscale') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = data[i+1] = data[i+2] = gray;
          } else if (pageObj.filter === 'magic') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (gray > 165) {
              data[i] = Math.min(255, r * 1.15 + 15);
              data[i+1] = Math.min(255, g * 1.15 + 15);
              data[i+2] = Math.min(255, b * 1.15 + 15);
            } else {
              data[i] = r * 0.85; data[i+1] = g * 0.85; data[i+2] = b * 0.85;
            }
          } else {
            data[i] = r; data[i+1] = g; data[i+2] = b;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = pageObj.originalUrl;
    });

  const handleGeneratePdf = async () => {
    if (!pages.length) return;
    setStatus('processing');
    setProgress(15);
    setProgressText('Processing scanner filters & rendering pages...');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < pages.length; i++) {
        setProgress(15 + Math.round(((i + 1) / pages.length) * 75));
        setProgressText(`Rendering scanned page ${i + 1} of ${pages.length}...`);
        const dataUrl = await processImageToCanvas(pages[i]);
        const imageBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
        const embeddedImage = await pdfDoc.embedJpg(imageBytes);
        let pdfWidth = 595.28, pdfHeight = 841.89;
        if (pageSize === 'letter') { pdfWidth = 612; pdfHeight = 792; }
        else if (pageSize === 'fit') { pdfWidth = embeddedImage.width * 0.75; pdfHeight = embeddedImage.height * 0.75; }
        const page = pdfDoc.addPage([pdfWidth, pdfHeight]);
        let marginPx = pageMargin === 'none' ? 0 : pageMargin === 'normal' ? 40 : 20;
        const availW = pdfWidth - marginPx * 2, availH = pdfHeight - marginPx * 2;
        const imgAspect = embeddedImage.width / embeddedImage.height;
        const pageAspect = availW / availH;
        let drawW = availW, drawH = availH;
        if (imgAspect > pageAspect) drawH = availW / imgAspect;
        else drawW = availH * imgAspect;
        page.drawImage(embeddedImage, {
          x: marginPx + (availW - drawW) / 2,
          y: marginPx + (availH - drawH) / 2,
          width: drawW, height: drawH,
        });
      }
      setProgress(95);
      setProgressText('Compiling PDF document...');
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlobUrl(URL.createObjectURL(blob));
      setResultFilename(`Scanned_Document_${Date.now()}.pdf`);
      setResultSize(blob.size);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setPages([]);
    setStatus('idle');
    setProgress(0);
    setProgressText('');
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setResultBlobUrl(null);
    setResultFilename('');
    setResultSize(0);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">

      {/* ── Completed View ─────────────────────────────────────── */}
      {status === 'completed' && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Scanned PDF Ready!</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              {resultFilename} • {formatBytes(resultSize)} • {pages.length} Scanned Pages
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
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
            <button type="button" onClick={handleReset}
              className="px-4 py-3 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              Scan New Document
            </button>
          </div>
        </div>
      )}

      {/* ── Processing Indicator ───────────────────────────────── */}
      {status === 'processing' && (
        <div className="p-8 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center space-y-4 shadow-md">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-purple-900 dark:text-purple-200">{progressText}</h4>
            <div className="w-full max-w-md mx-auto h-2 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
              <div className="h-full bg-purple-600 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Workspace ─────────────────────────────────────── */}
      {status !== 'completed' && status !== 'processing' && (
        <div className="space-y-6">

          {/* ── Upload Drop Zone ──────────────────────────────── */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all
              ${isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 scale-[1.01]'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#141622] hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
              }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <FileImage className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
                Drop photos or scans here
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                or <span className="text-purple-600 font-bold">click to browse</span> — JPG, PNG, WEBP, HEIC supported
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center gap-2 pointer-events-none"
            >
              <Upload className="w-4 h-4" />
              <span>Select Photos / Scans</span>
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

          {/* ── Scanned Pages Grid ────────────────────────────── */}
          {pages.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-lg space-y-6">

              {/* Toolbar & Filter Presets */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                    {pages.length} Pages Ready
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-zinc-500 mr-1">Scanner Filter:</span>
                  {[
                    { key: 'magic', label: '✨ Magic (Clean Text)', cls: 'bg-purple-600 text-white hover:bg-purple-700' },
                    { key: 'bw', label: '📄 B&W High-Contrast', cls: 'bg-zinc-900 text-white hover:bg-zinc-800' },
                    { key: 'grayscale', label: '🌗 Grayscale', cls: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200' },
                    { key: 'original', label: '🖼️ Original', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
                  ].map(f => (
                    <button key={f.key} type="button" onClick={() => applyFilterToAll(f.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${f.cls}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1">
                {pages.map((p, idx) => (
                  <div key={p.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#1B1E2E]/60 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">Page {idx + 1}</span>
                      <span className="uppercase text-[10px] tracking-wider text-purple-600 font-mono">Filter: {p.filter}</span>
                    </div>
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
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updatePage(p.id, { rotation: (p.rotation + 90) % 360 })}
                          className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100 hover:text-purple-700 border border-zinc-200 dark:border-zinc-700 transition-colors" title="Rotate 90°">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => movePage(idx, -1)} disabled={idx === 0}
                          className={`p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 ${idx === 0 ? 'opacity-40 cursor-not-allowed' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100'}`} title="Move Up">
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => movePage(idx, 1)} disabled={idx === pages.length - 1}
                          className={`p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 ${idx === pages.length - 1 ? 'opacity-40 cursor-not-allowed' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100'}`} title="Move Down">
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button type="button" onClick={() => removePage(p.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Delete Page">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Format Options */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block mb-1 text-zinc-700 dark:text-zinc-300">Page Size Format</label>
                  <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                    <option value="a4">Standard A4 Document (210 x 297 mm)</option>
                    <option value="letter">US Letter Document (8.5 x 11 in)</option>
                    <option value="fit">Auto-Fit Scanned Image Bounds</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-zinc-700 dark:text-zinc-300">Page Margins</label>
                  <select value={pageMargin} onChange={(e) => setPageMargin(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                    <option value="none">No Margin (Full Bleed Scan)</option>
                    <option value="small">Small Clean Margin (Recommended)</option>
                    <option value="normal">Standard Document Margin</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2 flex items-center justify-between">
                <button type="button" onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  Clear All Pages
                </button>
                <button type="button" onClick={handleGeneratePdf}
                  className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer">
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
