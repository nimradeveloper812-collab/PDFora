import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Download, Sparkles, RefreshCw } from 'lucide-react';

export default function ResizeImageTool() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [keepAspect, setKeepAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setResultUrl(null);

    const img = new Image();
    img.src = URL.createObjectURL(uploadedFile);
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
    };
  };

  const handleWidthChange = (val) => {
    const w = parseInt(val, 10) || 0;
    setWidth(w);
    if (keepAspect && aspectRatio) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (val) => {
    const h = parseInt(val, 10) || 0;
    setHeight(h);
    if (keepAspect && aspectRatio) {
      setWidth(Math.round(h * aspectRatio));
    }
  };

  const handleResize = () => {
    if (!file) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        setResultUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
      }, file.type || 'image/jpeg');
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg, .jpeg, .png, .webp"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer text-center flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed border-zinc-300 hover:border-purple-600 bg-white transition-all shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-purple-50 text-purple-600 border border-purple-100">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900 font-heading">
            Upload Image to Resize Dimensions
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Resize image width and height in pixels while locking aspect ratio.
          </p>
          <button type="button" className="px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md bg-purple-600 hover:bg-purple-700">
            Select Photo Image
          </button>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">{file.name}</h4>
            </div>
            <button onClick={() => setFile(null)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
              <RefreshCcw className="w-3.5 h-3.5" />
              Change Photo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Width (pixels):</label>
              <input
                type="number"
                value={width}
                onChange={e => handleWidthChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Height (pixels):</label>
              <input
                type="number"
                value={height}
                onChange={e => handleHeightChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aspect"
              checked={keepAspect}
              onChange={e => setKeepAspect(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="aspect" className="text-xs font-bold text-zinc-700">Lock Aspect Ratio</label>
          </div>

          <div className="pt-2 flex justify-between items-center">
            {resultUrl ? (
              <a
                href={resultUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_resized.${file.type?.split('/')[1] || 'jpg'}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Resized Image ({width}x{height}px)
              </a>
            ) : (
              <button
                onClick={handleResize}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'Resizing Image...' : 'Resize Image Now'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
