import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Download, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ChangeBackgroundTool() {
  const [file, setFile] = useState(null);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const fileInputRef = useRef(null);

  const colors = [
    { label: 'Pure White', hex: '#FFFFFF' },
    { label: 'Passport Blue', hex: '#2563EB' },
    { label: 'Light Gray', hex: '#F1F5F9' },
    { label: 'Studio Red', hex: '#DC2626' },
    { label: 'Soft Green', hex: '#16A34A' },
    { label: 'Dark Slate', hex: '#0F172A' },
  ];

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setResultUrl(null);
  };

  const handleChangeBg = () => {
    if (!file) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Fill Background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        setResultUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
      }, 'image/png');
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900 font-heading">
            Upload Image to Change Background Color
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Replace background with passport blue, pure white, studio colors, or custom shades in seconds.
          </p>
          <button type="button" className="px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md bg-indigo-600 hover:bg-indigo-700">
            Select Photo Image
          </button>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">{file.name}</h4>
            </div>
            <button onClick={() => setFile(null)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
              <RefreshCcw className="w-3.5 h-3.5" />
              Change Photo
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700">Choose Replacement Background Color:</label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5">
              {colors.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBgColor(c.hex)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bgColor === c.hex ? 'ring-2 ring-indigo-600 border-transparent shadow-xs' : 'border-zinc-200'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
            {resultUrl ? (
              <a
                href={resultUrl}
                download={`${file.name.replace(/\.[^/.]+$/, "")}_bg_changed.png`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Image with New Background
              </a>
            ) : (
              <button
                onClick={handleChangeBg}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md bg-indigo-600 hover:bg-indigo-700"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'Applying Background Color...' : 'Apply Background Color'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
