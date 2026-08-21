import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Sparkles, ArrowRight, ShieldCheck, Zap,
  Smartphone, Globe, ChevronDown, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Music, FileVideo, RefreshCw, Code, CheckCircle
} from 'lucide-react';
import { TOOLS } from '../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw, Code
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const quickShortcuts = [
    { name: 'PDF to Word', path: '/pdf-to-word' },
    { name: 'Remove Background', path: '/image-background-remover' },
    { name: 'Merge PDF', path: '/merge-pdf' },
    { name: 'Split PDF', path: '/split-pdf' },
    { name: 'Compress PDF', path: '/compress-pdf' },
    { name: 'JPG to PDF', path: '/jpg-to-pdf' },
    { name: 'MP4 to MP3', path: '/video-to-audio' },
    { name: 'Compress Image', path: '/image-compressor' }
  ];

  const imageTools = TOOLS.filter(t => t.category === 'images' || t.id.includes('image') || t.id.includes('jpg'));
  const pdfTools = TOOLS.filter(t => t.category === 'pdf' || t.id.includes('pdf'));
  const mediaTools = TOOLS.filter(t => t.category === 'video' || t.category === 'audio' || t.id.includes('video') || t.id.includes('audio'));
  const docTools = TOOLS.filter(t => t.category === 'documents');

  const filteredTools = TOOLS.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.primaryKeywords || []).some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const faqs = [
    {
      q: 'What is PDFora?',
      a: 'PDFora is a fast, 100% free online file suite. Convert, compress, and edit PDFs, images, videos, and document data directly in your web browser.'
    },
    {
      q: 'Are my files kept private?',
      a: 'Yes! PDFora processes all files locally inside your browser memory using WebAssembly and canvas pipelines. Your documents are never uploaded to remote server storage.'
    },
    {
      q: 'Do I need an account to use PDFora?',
      a: 'No registration, credit cards, or login required. All tools are immediately accessible for free.'
    },
    {
      q: 'What is the maximum file size limit?',
      a: 'PDFora supports files up to 50 MB per file, covering standard PDFs, Office files, decks, images, and audio tracks.'
    }
  ];

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-50 dark:bg-slate-900 text-zinc-900 dark:text-white">
      <Helmet>
        <title>PDFora — Free All-in-One Online File Converter &amp; Editor</title>
        <meta name="description" content="Free, fast, and private online suite to convert, compress, and edit PDFs, images, videos, and developer data in seconds." />
        <link rel="canonical" href="https://pdfora.nimradev.site/" />
      </Helmet>

      {/* ── 1. PDFORA HERO BANNER ───────────────────────────────── */}
      <section className="pt-14 pb-12 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 font-display">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>PDFora Free Online File Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight font-heading leading-tight">
            Free All-in-One Online <br className="hidden sm:inline" />
            <span style={{ color: '#6C3FFC' }}>File Converter &amp; Editor</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Fast, secure online tools to split and merge PDFs, remove image backgrounds, convert videos, and format document data — right in your browser.
          </p>

          {/* Quick Shortcut Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-2xl mx-auto font-display">
            {quickShortcuts.map((pill, idx) => (
              <Link
                key={idx}
                to={pill.path}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 hover:bg-purple-50 hover:text-purple-700 border border-zinc-200 transition-all shadow-xs"
              >
                {pill.name}
              </Link>
            ))}
          </div>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Remove Background, Merge PDF)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm bg-zinc-50 text-zinc-900 placeholder-zinc-400 border border-zinc-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs font-bold text-zinc-400 hover:text-zinc-700 px-2 py-1 font-display"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORIZED TOOL SECTIONS (FILEMORPH STYLE) ────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">

        {searchQuery ? (
          /* Filtered View */
          <div>
            <div className="mb-4 text-xs font-bold text-zinc-500 font-display">
              Showing search results for "{searchQuery}" ({filteredTools.length} tools):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTools.map(tool => {
                const Icon = iconMap[tool.iconName] || FileText;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-zinc-200 hover:border-purple-600 hover:shadow-xl transition-all"
                    style={{ textDecoration: 'none' }}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-purple-700 transition-colors mb-1 font-heading">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-sans line-clamp-2">
                        {tool.shortDesc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 text-xs font-bold text-purple-600 font-display">
                      <span>Open Tool</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* Full Categorized View */
          <div className="space-y-12">
            
            {/* Category 1: Image Tools */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-100">
                    <ImageIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 font-heading">Image Tools</h2>
                    <p className="text-xs text-zinc-500 font-sans">Remove backgrounds, compress, resize, crop, and convert image formats.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageTools.map(tool => {
                  const Icon = iconMap[tool.iconName] || ImageIcon;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-zinc-200 hover:border-purple-600 hover:shadow-xl transition-all"
                      style={{ textDecoration: 'none' }}
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-purple-700 transition-colors mb-1 font-heading">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans line-clamp-2">
                          {tool.shortDesc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 text-xs font-bold text-purple-600 font-display">
                        <span>Open tool</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Category 2: PDF Tools */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 font-heading">PDF Tools</h2>
                    <p className="text-xs text-zinc-500 font-sans">Merge, split, compress, and convert PDF documents in browser.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfTools.map(tool => {
                  const Icon = iconMap[tool.iconName] || FileText;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-zinc-200 hover:border-purple-600 hover:shadow-xl transition-all"
                      style={{ textDecoration: 'none' }}
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-purple-700 transition-colors mb-1 font-heading">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans line-clamp-2">
                          {tool.shortDesc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 text-xs font-bold text-purple-600 font-display">
                        <span>Open tool</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Category 3: Video & Audio Tools */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <FileVideo className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 font-heading">Video &amp; Audio Tools</h2>
                    <p className="text-xs text-zinc-500 font-sans">Extract audio tracks, convert video formats, and compress media.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaTools.map(tool => {
                  const Icon = iconMap[tool.iconName] || FileVideo;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-zinc-200 hover:border-purple-600 hover:shadow-xl transition-all"
                      style={{ textDecoration: 'none' }}
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-purple-700 transition-colors mb-1 font-heading">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans line-clamp-2">
                          {tool.shortDesc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 text-xs font-bold text-purple-600 font-display">
                        <span>Open tool</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Category 4: Document Suite */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Table className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 font-heading">Document Suite</h2>
                    <p className="text-xs text-zinc-500 font-sans">Convert between Word (.docx), Excel (.xlsx), and PDF spreadsheets.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {docTools.map(tool => {
                  const Icon = iconMap[tool.iconName] || Table;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-zinc-200 hover:border-purple-600 hover:shadow-xl transition-all"
                      style={{ textDecoration: 'none' }}
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-purple-700 transition-colors mb-1 font-heading">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans line-clamp-2">
                          {tool.shortDesc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 text-xs font-bold text-purple-600 font-display">
                        <span>Open tool</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* ── 3. FILEMORPH FEATURES SECTION ───────────────────────────── */}
      <section className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-display">
              PDFora Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight font-heading">
              100% Free, Private &amp; Studio Quality
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 font-heading">100% Free &amp; Unlimited</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                No credit cards, no subscriptions, and no hidden file counts. Convert and edit freely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 font-heading">Private &amp; Secure</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Your files are processed securely in temporary isolated browser memory and automatically erased.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 font-heading">Studio-Quality Results</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Powered by native multi-threaded FFmpeg, PyMuPDF, and high-fidelity WebAssembly vector engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FREQUENTLY ASKED QUESTIONS ─────────────────────────── */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-heading">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3" role="list">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                role="listitem"
                className="rounded-xl border border-zinc-200 overflow-hidden bg-white"
                style={{ borderColor: isOpen ? '#6C3FFC' : '#E5E7EB' }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-sans cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm font-bold ${isOpen ? 'text-purple-700' : 'text-zinc-900'}`}>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-purple-600' : 'text-zinc-400'}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. FINAL CTA BANNER ───────────────────────────────────── */}
      <section className="py-14 px-4 max-w-5xl mx-auto mb-12">
        <div
          className="rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #6C3FFC 0%, #4B24C5 100%)',
          }}
        >
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-heading">
            Start Converting &amp; Editing Documents
          </h2>
          <p className="text-xs sm:text-sm max-w-xl mx-auto text-purple-100 font-sans">
            The complete, privacy-first online suite to convert, compress, and edit PDFs, images, videos, and document data directly in your browser.
          </p>
          <div className="pt-2">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-extrabold bg-white text-purple-700 hover:bg-purple-50 transition-all active:scale-95 shadow-md font-display cursor-pointer"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
