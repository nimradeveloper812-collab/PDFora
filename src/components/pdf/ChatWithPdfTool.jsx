import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, MessageSquare, Send, Sparkles, FileText,
  Bot, User, RefreshCcw, ShieldCheck, AlertCircle, Loader2,
  Copy, Check
} from 'lucide-react';
import { clientPdfService } from '../../services/clientPdfService';
import { aiService } from '../../services/aiService';

export default function ChatWithPdfTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [extractedPages, setExtractedPages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [parseProgress, setParseProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  const samplePrompts = [
    "Summarize the main points of this document",
    "What are the key dates and deadlines?",
    "List all financial or payment terms mentioned",
    "What are the primary obligations and responsibilities?"
  ];

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
      setErrorMsg('Please upload a valid PDF document (.pdf)');
      return;
    }

    setErrorMsg(null);
    setIsParsing(true);
    setParseProgress(10);
    setParseStatus('Initializing in-browser PDF parser...');

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

      const hasText = totalExtractedWords > 5;
      const initialMessage = hasText
        ? `Hello! I have loaded "${uploadedFile.name}" (${pages.length} page${pages.length > 1 ? 's' : ''}, ~${totalExtractedWords.toLocaleString()} words). Active AI Engine: Gemini 2.0 Flash.\n\nYou can ask me any question about its contents, query specific terms, or click a suggested prompt below.`
        : `Hello! I loaded "${uploadedFile.name}" (${pages.length} page${pages.length > 1 ? 's' : ''}). Note: Very little selectable text was detected. If this is a scanned image PDF, you can run our OCR PDF tool to extract readable text.`;

      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: initialMessage,
          citation: null
        }
      ]);
    } catch (err) {
      console.error('Failed to parse PDF for chat:', err);
      setErrorMsg('Could not extract text from this PDF file. Please ensure it is a valid, unencrypted PDF.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userQuery = textToSend.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: userQuery };
    
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await aiService.chatWithDocument({
        pages: extractedPages,
        fileName: file?.name || 'Document.pdf',
        query: userQuery,
        history: messages
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        citation: response.citation,
        source: response.source
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat AI error:', err);
      setErrorMsg(err.message || 'Failed to process question.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setFile(null);
    setPageCount(0);
    setTotalWords(0);
    setExtractedPages([]);
    setMessages([]);
    setInputQuery('');
    setErrorMsg(null);
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

      {errorMsg && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isParsing && (
        <div className="p-8 rounded-3xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white font-heading">Parsing PDF Text Layer</h4>
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
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer text-center flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all bg-white dark:bg-[#141622] border-zinc-300 dark:border-[#2A2E45] hover:border-purple-500 shadow-xs"
          style={{
            borderColor: isDragging ? '#6C3FFC' : undefined,
            backgroundColor: isDragging ? 'rgba(108, 63, 252, 0.05)' : undefined,
          }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 shadow-xs">
            <MessageSquare className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900 dark:text-white font-heading">
            Upload PDF to Chat with AI Assistant
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
            Ask questions, query clauses, search facts, and extract answers from textbooks, legal documents, or contracts with AI.
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
              <span>100% In-Browser Privacy • Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      )}

      {file && !isParsing && (
        <div className="rounded-3xl border border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#141622] overflow-hidden shadow-xl flex flex-col h-[520px] sm:h-[650px] max-h-[82vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#2A2E45] bg-zinc-50/80 dark:bg-[#1B1E2E]/80 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{file.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {pageCount} Page{pageCount > 1 ? 's' : ''} • ~{totalWords.toLocaleString()} Words •{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    ✨ Gemini 2.0 AI Active
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:bg-zinc-100 dark:hover:bg-[#2A2E45] transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                New Document
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/40 dark:bg-[#0D0D14]/40">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                  msg.sender === 'user' ? 'bg-zinc-800 dark:bg-zinc-700' : 'bg-purple-600'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-[80%] space-y-1.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`group relative p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white font-medium rounded-tr-none'
                      : 'bg-white dark:bg-[#1B1E2E] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-[#2A2E45] shadow-xs rounded-tl-none font-normal'
                  }`}>
                    {msg.text}

                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.text)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-md"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {msg.citation && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      {msg.citation}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 animate-pulse p-2">
                <Bot className="w-4 h-4" />
                <span>AI Assistant is generating response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Chips */}
          <div className="px-6 py-2.5 bg-white dark:bg-[#141622] border-t border-zinc-100 dark:border-[#2A2E45] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">Suggestions:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isProcessing}
                className="shrink-0 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white dark:bg-[#141622] border-t border-zinc-200 dark:border-[#2A2E45] flex items-center gap-3">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about this document..."
              disabled={isProcessing}
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] focus:border-purple-600 dark:focus:border-purple-500 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isProcessing}
              className="p-3 rounded-xl text-white font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
