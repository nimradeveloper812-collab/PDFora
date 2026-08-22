import React, { useState, useRef } from 'react';
import { UploadCloud, Code, Download, Copy, Check, Sparkles, FileText, RefreshCw, AlertCircle } from 'lucide-react';

export default function Base64ToPdfTool() {
  const [mode, setMode] = useState('base64-to-pdf'); // 'base64-to-pdf' | 'pdf-to-base64'
  const [base64Input, setBase64Input] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [generatedBase64, setGeneratedBase64] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleConvertBase64ToPdf = () => {
    setErrorMsg('');
    if (!base64Input.trim()) return;

    try {
      let clean = base64Input.trim();
      if (clean.includes(',')) clean = clean.split(',')[1];
      clean = clean.replace(/\s/g, '');

      const byteCharacters = atob(clean);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(url);
    } catch (err) {
      setErrorMsg('Invalid Base64 string. Please enter a valid PDF Base64 string.');
    }
  };

  const handlePdfFile = async (file) => {
    if (!file) return;
    setErrorMsg('');

    try {
      const buffer = await file.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const dataUri = `data:application/pdf;base64,${base64}`;
      setGeneratedBase64(dataUri);
    } catch (err) {
      setErrorMsg('Failed to convert PDF to Base64.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handlePdfFile(e.target.files[0])}
      />

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-zinc-100 border border-zinc-200 max-w-md mx-auto">
        <button
          onClick={() => { setMode('base64-to-pdf'); setErrorMsg(''); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'base64-to-pdf' ? 'bg-white text-purple-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Base64 String to PDF
        </button>
        <button
          onClick={() => { setMode('pdf-to-base64'); setErrorMsg(''); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'pdf-to-base64' ? 'bg-white text-purple-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          PDF File to Base64 String
        </button>
      </div>

      {mode === 'base64-to-pdf' ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">Decode Base64 to PDF Document</h3>
          <p className="text-xs text-zinc-500">Paste your Base64 encoded string below to convert it into a downloadable PDF file.</p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <textarea
            rows={6}
            value={base64Input}
            onChange={e => setBase64Input(e.target.value)}
            placeholder="Paste Base64 string here (e.g. JVBERi0xLj... or data:application/pdf;base64,JVBERi0...)"
            className="w-full text-xs font-mono p-4 rounded-2xl border border-zinc-200 focus:border-purple-600 outline-none bg-zinc-50/50"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-400 font-medium">Instant client-side Base64 decoding</span>
            <button
              onClick={handleConvertBase64ToPdf}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: '#6C3FFC' }}
            >
              <Sparkles className="w-4 h-4" />
              Decode &amp; Generate PDF
            </button>
          </div>

          {pdfBlobUrl && (
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between animate-fade-up">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                PDF Decoded Successfully!
              </span>
              <a
                href={pdfBlobUrl}
                download="decoded_document.pdf"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Decoded PDF
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">Encode PDF File to Base64 String</h3>
          <p className="text-xs text-zinc-500">Upload a PDF file to convert it into a Base64 string for APIs and web development.</p>

          {!generatedBase64 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-center p-8 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-purple-600 bg-zinc-50/50 transition-all"
            >
              <UploadCloud className="w-10 h-10 mx-auto text-purple-600 mb-2" />
              <p className="text-sm font-bold text-zinc-800">Click to upload PDF file</p>
              <p className="text-xs text-zinc-400 mt-1">Convert file contents into Base64 string</p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700">Generated Base64 Data String:</span>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Base64 String'}
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                value={generatedBase64}
                className="w-full text-xs font-mono p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700 outline-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => setGeneratedBase64('')}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                >
                  Convert Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
