import React, { useState } from 'react';
import { QrCode, Download, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';

export default function QrGeneratorTool() {
  const [text, setText] = useState('https://pdfora.nimradev.site');
  const [copied, setCopied] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(text || 'https://pdfora.nimradev.site')}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${Date.now()}.png`;
      a.click();
    } catch (err) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Custom QR Code Generator</h3>
            <p className="text-xs text-zinc-500 font-medium">Generate high-resolution QR codes for websites, WiFi, and text</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Enter Website URL or Text:</label>
              <textarea
                rows={4}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="https://yourwebsite.com or any custom text..."
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyUrl}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied URL!' : 'Copy Input URL'}
              </button>
              <button
                onClick={downloadQr}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </div>
          </div>

          {/* QR Code Live Preview */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <img src={qrImageUrl} alt="QR Code Preview" className="w-48 h-48 rounded-xl shadow-md bg-white p-2" />
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Live High-Res PNG QR Code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
