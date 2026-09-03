import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Download, Sparkles, RefreshCw, CheckCircle2, Sliders, AlertCircle } from 'lucide-react';

export default function ChangeBackgroundTool() {
  const [file, setFile] = useState(null);
  const [bgColor, setBgColor] = useState('#2563EB'); // Passport Blue default
  const [tolerance, setTolerance] = useState(35); // Background keying sensitivity
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const colorPresets = [
    { label: 'Passport Blue', hex: '#2563EB' },
    { label: 'Pure White', hex: '#FFFFFF' },
    { label: 'Navy Blue', hex: '#1E3A8A' },
    { label: 'Light Gray', hex: '#F1F5F9' },
    { label: 'Soft Green', hex: '#16A34A' },
    { label: 'Dark Slate', hex: '#0F172A' },
  ];

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setResultUrl(null);
    const objectUrl = URL.createObjectURL(uploadedFile);
    setPreviewUrl(objectUrl);
  };

  // Re-process image whenever file, bgColor, or tolerance changes
  useEffect(() => {
    if (!file || !previewUrl) return;
    processImage();
  }, [file, previewUrl, bgColor, tolerance]);

  const processImage = () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Detect background color by sampling top-left, top-right, bottom-left, bottom-right corners
      const cornerR = (data[0] + data[(canvas.width - 1) * 4] + data[(canvas.height - 1) * canvas.width * 4]) / 3;
      const cornerG = (data[1] + data[(canvas.width - 1) * 4 + 1] + data[(canvas.height - 1) * canvas.width * 4 + 1]) / 3;
      const cornerB = (data[2] + data[(canvas.width - 1) * 4 + 2] + data[(canvas.height - 1) * canvas.width * 4 + 2]) / 3;

      // Parse target new background hex color
      const hex = bgColor.replace('#', '');
      const newR = parseInt(hex.substring(0, 2), 16);
      const newG = parseInt(hex.substring(2, 4), 16);
      const newB = parseInt(hex.substring(4, 6), 16);

      const maxDiff = (tolerance / 100) * 255;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // 1. Handle transparent pixels (PNG/WebP)
        if (a < 50) {
          data[i] = newR;
          data[i + 1] = newG;
          data[i + 2] = newB;
          data[i + 3] = 255;
          continue;
        }

        // 2. Color keying distance from sample background color
        const colorDiff = Math.sqrt(
          (r - cornerR) ** 2 +
          (g - cornerG) ** 2 +
          (b - cornerB) ** 2
        );

        if (colorDiff <= maxDiff) {
          data[i] = newR;
          data[i + 1] = newG;
          data[i + 2] = newB;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob(blob => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
      }, 'image/png');
    };
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto font-sans space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer text-center flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 transition-all shadow-xs space-y-3"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 text-purple-600 border border-purple-200 dark:border-purple-800">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Upload Image to Change Background Color
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Replace photo background with passport blue, pure white, studio colors, or custom shades.
            </p>
          </div>
          <button type="button" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-purple-600 hover:bg-purple-700">
            Select Photo Image
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-lg space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                {file.name}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Photo
            </button>
          </div>

          {/* Color Preset Selectors */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Select New Background Color:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {colorPresets.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBgColor(c.hex)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    bgColor === c.hex
                      ? 'bg-purple-50 dark:bg-purple-950 border-purple-600 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'bg-zinc-50 dark:bg-[#1B1E2E] border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" style={{ backgroundColor: c.hex }} />
                  <span>{c.label}</span>
                </button>
              ))}

              {/* Custom Color Input */}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[11px] text-zinc-500 font-medium">Custom:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border border-zinc-300"
                  title="Pick custom background color"
                />
              </div>
            </div>
          </div>

          {/* Background Keying Sensitivity Slider */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Background Keying Sensitivity</span>
              </span>
              <span>{tolerance}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={tolerance}
              onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Image Preview Canvas */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Background Change Preview:
            </label>
            <div className="relative max-h-80 overflow-hidden rounded-xl bg-zinc-900 flex items-center justify-center p-2 border border-zinc-200 dark:border-zinc-800">
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="Background replaced result"
                  className="max-h-72 object-contain rounded"
                />
              ) : (
                <div className="text-xs text-zinc-400 py-8 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                  Processing background replacement...
                </div>
              )}
            </div>
          </div>

          {/* Hidden Canvas Ref */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Download Button */}
          {resultUrl && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  if (e) e.preventDefault();
                  if (!resultUrl) return;
                  const link = document.createElement('a');
                  link.href = resultUrl;
                  link.download = `${file.name.replace(/\.[^/.]+$/, '')}_bg_changed.png`;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => document.body.removeChild(link), 100);
                }}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Image with New Background</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
