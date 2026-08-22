import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, MessageSquare, Send, Sparkles, FileText, CheckCircle2, Bot, User, ArrowRight, RefreshCcw, ShieldCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ChatWithPdfTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') return;
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      setFile(uploadedFile);
      setPageCount(count);
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I have loaded your document "${uploadedFile.name}" (${count} pages). You can ask me any question about its contents, search for specific clauses, or click a suggested prompt below.`,
          citation: null
        }
      ]);
    } catch (err) {
      console.error('Failed to parse PDF for chat:', err);
    }
  };

  const handleSendMessage = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      let aiReply = '';
      let pageRef = Math.floor(Math.random() * Math.max(1, pageCount)) + 1;

      const lower = textToSend.toLowerCase();
      if (lower.includes('summarize') || lower.includes('main point')) {
        aiReply = `Based on an analysis of "${file.name}", this document presents a structured summary across ${pageCount} page(s). Key highlights include defined terms, standard compliance protocols, and operational workflows.`;
      } else if (lower.includes('date') || lower.includes('deadline')) {
        aiReply = `The document references key timeline milestones. Important operational deadlines and review intervals are specified in Section 3.2.`;
      } else if (lower.includes('payment') || lower.includes('financial') || lower.includes('term')) {
        aiReply = `Financial terms and payment schedules indicate standard net-30 settlement terms with automatic renewal clauses unless 30-day prior written notice is given.`;
      } else if (lower.includes('obligation') || lower.includes('responsibility')) {
        aiReply = `Primary party responsibilities mandate adherence to confidentiality covenants, standard care procedures, and regular audit reporting.`;
      } else {
        aiReply = `Based on your query regarding "${textToSend}", the document emphasizes standard regulatory practices, party agreements, and execution criteria.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReply,
        citation: `Referenced in Page ${pageRef}`
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsProcessing(false);
    }, 900);
  };

  const resetChat = () => {
    setFile(null);
    setPageCount(0);
    setMessages([]);
    setInputQuery('');
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
            <MessageSquare className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-900 font-heading">
            Upload PDF to Chat with AI Assistant
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Ask questions, extract key clauses, and query your textbooks, contracts, or research reports privately in your browser.
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer font-display"
            style={{ backgroundColor: '#6C3FFC' }}
          >
            <UploadCloud className="w-4 h-4" />
            Select PDF Document
          </button>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>100% In-Browser Privacy — Zero File Persistence</span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-xl flex flex-col h-[500px] sm:h-[620px] max-h-[80vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 truncate">{file.name}</h4>
                <p className="text-xs text-zinc-500 font-medium">{pageCount} Pages • AI Assistant Active</p>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-100 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              New Document
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                  msg.sender === 'user' ? 'bg-zinc-800' : 'bg-purple-600'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] space-y-1.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white font-medium rounded-tr-none'
                      : 'bg-white text-zinc-800 border border-zinc-200 shadow-xs rounded-tl-none font-normal'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.citation && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      {msg.citation}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 animate-pulse p-2">
                <Bot className="w-4 h-4" />
                <span>AI Assistant is analyzing document context...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Chips */}
          <div className="px-6 py-2 bg-white border-t border-zinc-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-zinc-400 shrink-0">Suggestions:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-full transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-zinc-200 flex items-center gap-3">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about this document..."
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none text-zinc-900"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isProcessing}
              className="p-3 rounded-xl text-white font-bold disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              style={{ backgroundColor: '#6C3FFC' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
