import React, { useState, useRef } from 'react';
import {
  UploadCloud, Sparkles, FileText, CheckCircle2, Copy, Download,
  RefreshCw, ShieldCheck, AlertCircle, Loader2, Key, Settings,
  FileCheck, ListChecks, Target, AlignLeft, Check
} from 'lucide-react';
import { clientPdfService } from '../../services/clientPdfService';
import { aiService } from '../../services/aiService';
import ApiKeyModal from '../common/ApiKeyModal';

export default function AiPdfSummarizerTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [extractedPages, setExtractedPages] = useState([]);
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryType, setSummaryType] = useState('executive');
  
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [parseProgress, setParseProgress] = useState(0);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
      setErrorMsg('Please upload a valid PDF document (.pdf)');
      return;
    }

    setErrorMsg(null);
    setIsParsing(true);
    setParseProgress(10);
    setParseStatus('Initializing PDF engine...');

    try {
      const pages = await clientPdfService.extractPdfTextPages(uploadedFile, (pct, statusText) => {
        setParseProgress(pct);
        setParseStatus(statusText);
      });

      const totalExtractedWords = pages.reduce((acc, p) => {
        return acc + (p.text ? p.text.split(/\s+/).filter(Boolean).length : 0);
      }, 0);

      setFile(uploadedFile);
      setPageCount(pages.length);
      setTotalWords(totalExtractedWords);
      setExtractedPages(pages);

      // Immediately trigger initial summary
      await generateSummary(pages, uploadedFile.name, summaryType);
    } catch (err) {
      console.error('Failed to parse PDF for summarizer:', err);
      setErrorMsg('Could not extract text from this PDF file. Please ensure it is an unencrypted PDF document.');
    } finally {
      setIsParsing(false);
    }
  };

  const generateSummary = async (pagesToUse, docName, type) => {
    const pages = pagesToUse || extractedPages;
    const fileName = docName || file?.name || 'Document.pdf';

    if (!pages || pages.length === 0) return;

    setIsSummarizing(true);
    setErrorMsg(null);

    try {
      const result = await aiService.summarizeDocument({
        pages,
        fileName,
        summaryType: type
      });

      setSummaryResult(result);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
      setErrorMsg(err.message || 'Failed to generate AI summary. Please check your network connection or API settings.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTypeChange = (newType) => {
    setSummaryType(newType);
    if (extractedPages.length > 0 && !isSummarizing) {
      generateSummary(extractedPages, file?.name, newType);
    }
  };

  const copyToClipboard = () => {
    if (!summaryResult?.summary) return;
    navigator.clipboard.writeText(summaryResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummaryText = () => {
    if (!summaryResult?.summary) return;
    const blob = new Blob([summaryResult.summary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '') || 'Document'}_Summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setPageCount(0);
    setTotalWords(0);
    setExtractedPages([]);
    setSummaryResult(null);
    setErrorMsg(null);
  };

  const hasApiKey = Boolean(aiService.getEffectiveApiKey());

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      {errorMsg && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="underline font-bold text-red-800 dark:text-red-200 text-xs cursor-pointer shrink-0"
          >
            Check API Key
          </button>
        </div>
      )}

      {isParsing && (
        <div className="p-8 rounded-3xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white font-heading">Reading PDF Document Text</h4>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{parseStatus}</p>
          </div>
          <div className="max-w-xs mx-auto bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-200"
              style={{ width: `${parseProgress}%` }}
            />
          </div>
        </div>
      )}

      {!file && !isParsing && (
        <div className="space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              e.dataTransfer.files?.[0] && handleFileUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer text-center flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all bg-white dark:bg-[#141622] border-zinc-300 dark:border-[#2A2E45] hover:border-purple-500 shadow-xs"
            style={{
              borderColor: isDragging ? '#6C3FFC' : undefined,
              backgroundColor: isDragging ? 'rgba(108, 63, 252, 0.05)' : undefined,
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900 dark:text-white font-heading">
              Upload PDF for AI Summarizer &amp; Key Point Extraction
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
              Turn long reports, research papers, textbooks, or legal contracts into executive summaries, bullet points, and action items in seconds.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer font-display"
            >
              <UploadCloud className="w-4 h-4" />
              Select PDF Document
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>100% In-Browser Privacy</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsKeyModalOpen(true); }}
                className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-bold"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{hasApiKey ? 'Gemini AI Active' : 'Configure Gemini API Key'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {file && !isParsing && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#141622] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white truncate">{file.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {pageCount} Page{pageCount > 1 ? 's' : ''} • ~{totalWords.toLocaleString()} Words •{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {summaryResult?.source === 'gemini' ? '✨ Gemini AI Engine' : '⚡ Smart NLP Engine'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] hover:bg-zinc-100 dark:hover:bg-[#2A2E45] text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                title="AI Key Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={resetAll}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#2A2E45] border border-zinc-200 dark:border-[#2A2E45] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Upload New PDF
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'executive', name: 'Executive Summary', icon: Target },
              { id: 'bullets', name: 'Bullet Breakdown', icon: ListChecks },
              { id: 'takeaways', name: 'Top Takeaways', icon: Sparkles },
              { id: 'action_items', name: 'Action Items', icon: FileCheck },
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id)}
                disabled={isSummarizing}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  summaryType === id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-[#141622] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-[#2A2E45] hover:border-purple-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </button>
            ))}
          </div>

          {/* Result Card */}
          <div className="rounded-3xl border border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#141622] overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#2A2E45] bg-zinc-50/80 dark:bg-[#1B1E2E]/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Generated Summary Output</span>
              </div>

              {summaryResult && !isSummarizing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:bg-zinc-100 dark:hover:bg-[#2A2E45] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={downloadSummaryText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 min-h-[300px]">
              {isSummarizing ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center animate-spin border border-purple-200 dark:border-purple-800">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">AI Engine Processing Document</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Generating {summaryType.replace('_', ' ')} for {file.name}...
                    </p>
                  </div>
                </div>
              ) : summaryResult?.summary ? (
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-normal">
                  {summaryResult.summary}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-400 text-xs font-medium">
                  No summary generated yet. Click a summary type above to start.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
