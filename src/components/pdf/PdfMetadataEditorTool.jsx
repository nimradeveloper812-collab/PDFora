import React, { useState, useRef } from 'react';
import { UploadCloud, Edit3, Download, Sparkles, FileText, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function PdfMetadataEditorTool() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: 'PDFora',
    producer: 'PDFora Engine'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') return;
    setFile(uploadedFile);
    setIsDone(false);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      setMetadata({
        title: doc.getTitle() || uploadedFile.name.replace(/\.pdf$/i, ''),
        author: doc.getAuthor() || '',
        subject: doc.getSubject() || '',
        keywords: doc.getKeywords() || '',
        creator: doc.getCreator() || 'PDFora',
        producer: doc.getProducer() || 'PDFora Engine'
      });
    } catch (err) {
      console.error('Failed to extract metadata:', err);
    }
  };

  const handleSaveMetadata = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (metadata.title) doc.setTitle(metadata.title);
      if (metadata.author) doc.setAuthor(metadata.author);
      if (metadata.subject) doc.setSubject(metadata.subject);
      if (metadata.keywords) doc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      if (metadata.creator) doc.setCreator(metadata.creator);
      if (metadata.producer) doc.setProducer(metadata.producer);

      const pdfBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultBlobUrl(url);
      setIsDone(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('Failed to update metadata:', err);
      setIsProcessing(false);
    }
  };

  const resetEditor = () => {
    setFile(null);
    setIsDone(false);
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setResultBlobUrl(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      {!file ? (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            e.dataTransfer.files?.[0] && handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer text-center flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all"
          style={{
            borderColor: isDragging ? '#6C3FFC' : '#CBD5E1',
            background: isDragging ? '#F3F0FF' : '#FFFFFF',
            boxShadow: '0 8px 32px rgba(108, 63, 252, 0.05)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-purple-50 text-purple-600 border border-purple-100 shadow-xs">
            <Edit3 className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900 font-heading">
            Upload PDF to Edit Document Metadata
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            View and modify PDF properties including Title, Author, Subject, Keywords, Creator, and Producer tags.
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer font-display"
            style={{ backgroundColor: '#6C3FFC' }}
          >
            <UploadCloud className="w-4 h-4" />
            Select PDF File
          </button>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-zinc-900 truncate max-w-xs">{file.name}</h4>
                <p className="text-xs text-zinc-500 font-medium">Edit PDF document properties &amp; metadata tags</p>
              </div>
            </div>
            <button
              onClick={resetEditor}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Change File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Document Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                placeholder="e.g. Q3 Financial Statement"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Author</label>
              <input
                type="text"
                value={metadata.author}
                onChange={e => setMetadata({ ...metadata, author: e.target.value })}
                placeholder="e.g. John Doe / Accounting Team"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Subject / Description</label>
              <input
                type="text"
                value={metadata.subject}
                onChange={e => setMetadata({ ...metadata, subject: e.target.value })}
                placeholder="e.g. Quarterly Executive Report"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Keywords (Comma separated)</label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={e => setMetadata({ ...metadata, keywords: e.target.value })}
                placeholder="e.g. finance, audit, 2026, contract"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Creator Application</label>
              <input
                type="text"
                value={metadata.creator}
                onChange={e => setMetadata({ ...metadata, creator: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">PDF Producer</label>
              <input
                type="text"
                value={metadata.producer}
                onChange={e => setMetadata({ ...metadata, producer: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 text-center sm:text-left">
            <span className="text-xs text-zinc-400 font-medium">Metadata will be permanently embedded into the PDF stream.</span>
            {!isDone ? (
              <button
                onClick={handleSaveMetadata}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: '#6C3FFC' }}
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'Updating Metadata...' : 'Save & Export Metadata PDF'}
              </button>
            ) : (
              <a
                href={resultBlobUrl}
                download={`${file.name.replace(/\.pdf$/i, '')}_updated.pdf`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4" />
                Download Updated PDF
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
