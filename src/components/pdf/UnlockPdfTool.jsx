import React, { useState, useRef } from 'react';
import { ShieldAlert, Unlock, Download, RotateCcw, AlertCircle, FileText, Sparkles, Eye, File } from 'lucide-react';
import { pdfApi } from '../../services/pdfApi';
import { PDFDocument } from 'pdf-lib';
import AdBanner from '../common/AdBanner';

export default function UnlockPdfTool() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'locked' | 'unlocked_ready' | 'processing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + s[i];
  };

  const handleFileSelect = async (incomingFile) => {
    if (!incomingFile) return;
    setErrorMsg('');
    setFile(incomingFile);
    setStatus('checking');

    try {
      const arrayBuffer = await incomingFile.arrayBuffer();
      try {
        await PDFDocument.load(arrayBuffer);
        // Not locked! Can proceed directly
        setStatus('unlocked_ready');
      } catch (loadErr) {
        // Locked if it throws encryption/password error
        if (loadErr.message.includes('encrypted') || loadErr.message.includes('password') || loadErr.message.includes('decrypt')) {
          setStatus('locked');
        } else {
          throw loadErr;
        }
      }
    } catch (err) {
      setErrorMsg('Invalid PDF file or failed to read structure.');
      setFile(null);
      setStatus('idle');
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(15);
    setProgressText('Decrypting PDF document streams...');
    setErrorMsg('');

    // Yield for React render
    await new Promise(resolve => setTimeout(resolve, 80));

    try {
      const decryptedBlob = await pdfApi.unlockPdf(file, password, (pct, text) => {
        setProgress(pct);
        if (text) setProgressText(text);
      });

      const url = URL.createObjectURL(decryptedBlob);
      setResultBlobUrl(url);
      setResultFilename(file.name.replace(/\.[^/.]+$/, '') + '_unlocked.pdf');
      setResultSize(decryptedBlob.size);
      setStatus('completed');
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect password or failed to unlock PDF.');
      setStatus(password ? 'locked' : 'locked');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
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
    setShowPreview(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#141622] border border-blue-200 dark:border-[#2A2E45] shadow-xl p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-blue-600" />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Decryption Issue</p>
              <p className="text-xs text-blue-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer text-center flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-blue-300 hover:border-purple-500 bg-linear-to-b from-white to-zinc-50 dark:to-zinc-950/20 min-h-[260px] transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-4">
              <Unlock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
              Select password-protected PDF to unlock
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Drop your file here, or click to browse</p>
            <button
              type="button"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Choose PDF File
            </button>
          </div>
        )}

        {status === 'checking' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">Checking PDF encryption status...</p>
          </div>
        )}

        {(status === 'locked' || status === 'unlocked_ready') && file && (
          <div className="space-y-6 text-left animate-fade-in">
            <div className="pb-4 border-b border-zinc-100 dark:border-[#2A2E45] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">{file.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>

            {status === 'locked' ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-800">This file is password protected</h5>
                    <p className="text-[11px] text-amber-600 mt-0.5">Please enter the correct password to unlock the document.</p>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <label className="block text-xs font-bold text-zinc-700">Enter PDF Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter document open password"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-800 font-bold">This PDF is not locked with a user password!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">You can proceed to decrypt permissions restrictions directly.</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#2A2E45]">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Unlock className="w-4 h-4" />
                Unlock PDF
              </button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin mx-auto flex items-center justify-center">
              <Unlock className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Unlocking PDF Document</h4>
              <p className="text-xs text-zinc-400">{progressText}</p>
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-purple-600">{progress}% completed</span>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="py-8 text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <Unlock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">PDF Decrypted Successfully!</h3>
              <p className="text-xs text-zinc-500">Your document has been unlocked and security restrictions are removed.</p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs">{resultFilename}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{formatBytes(resultSize)}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                Unlocked
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={(e) => {
                  if (e) e.preventDefault();
                  if (!resultBlobUrl) return;
                  const link = document.createElement('a');
                  link.href = resultBlobUrl;
                  link.download = resultFilename || 'unlocked_document.pdf';
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => document.body.removeChild(link), 100);
                }}
                className="flex-1 min-w-[140px] py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              {showPreview && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Unlock Another
              </button>
            </div>

            {resultBlobUrl && showPreview && (
              <div className="w-full mt-6 pt-6 border-t border-zinc-100 dark:border-[#2A2E45]">
                <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-2 border border-zinc-200 dark:border-[#2A2E45] shadow-inner overflow-hidden">
                  <iframe
                    src={resultBlobUrl}
                    title="PDF Preview"
                    className="w-full h-[450px] rounded-xl border-0 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
