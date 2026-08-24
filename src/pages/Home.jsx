import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Sparkles, ArrowRight, ShieldCheck, Zap,
  ChevronDown, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Music, FileVideo,
  RefreshCw, Code, CheckCircle, Smartphone, Lock, Award, X
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES } from '../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw, Code
};

const POPULAR_SHORTCUTS = [
  { name: 'PDF to Word', path: '/pdf-to-word' },
  { name: 'Merge PDF', path: '/merge-pdf' },
  { name: 'Compress to KB', path: '/compress-to-kb' },
  { name: 'Remove Background', path: '/image-background-remover' },
  { name: 'QR Generator', path: '/qr-generator' },
  { name: 'Compress PDF', path: '/compress-pdf' },
  { name: 'Video to Audio', path: '/video-to-audio' },
  { name: 'JSON Formatter', path: '/json-formatter' },
];

const CATEGORIES = [
  { id: 'all',       label: 'All Tools',        count: 48 },
  { id: 'pdf',       label: 'PDF Tools',        count: 24 },
  { id: 'images',    label: 'Image Tools',      count: 14 },
  { id: 'media',     label: 'Video & Audio',    count: 4  },
  { id: 'documents', label: 'Office & Docs',    count: 4  },
  { id: 'developer', label: 'Developer Tools',  count: 6  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  // Filter tools based on search and active category
  const filteredTools = useMemo(() => {
    let list = TOOLS;

    if (activeCategory !== 'all') {
      if (activeCategory === 'pdf') {
        list = list.filter(t => t.category === 'pdf' || t.id.includes('pdf'));
      } else if (activeCategory === 'images') {
        list = list.filter(t => t.category === 'images' || t.id.includes('image') || t.id.includes('jpg') || t.id.includes('png'));
      } else if (activeCategory === 'media') {
        list = list.filter(t => ['video', 'audio'].includes(t.category) || t.id.includes('video') || t.id.includes('audio'));
      } else if (activeCategory === 'documents') {
        list = list.filter(t => t.category === 'documents' || t.id.includes('word') || t.id.includes('excel') || t.id.includes('powerpoint'));
      } else if (activeCategory === 'developer') {
        list = list.filter(t => t.badge === 'Developer Tool' || t.badge === 'AI Feature' || t.id.includes('json') || t.id.includes('base64') || t.id.includes('qr'));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        (t.primaryKeywords || []).some(k => k.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchQuery, activeCategory]);

  const faqs = [
    {
      q: 'Are my files kept private and secure?',
      a: 'Yes, 100%. PDFora processes all files locally inside your browser memory using WebAssembly. Your documents are never uploaded to any remote server or stored anywhere.'
    },
    {
      q: 'Is PDFora completely free to use?',
      a: 'Yes! There are no subscriptions, no registration required, no credit cards, and no hidden file count limits.'
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'PDFora supports files up to 50 MB per file, covering standard PDFs, photos, Office documents, audio tracks, and videos.'
    },
    {
      q: 'Does it work on mobile phones and tablets?',
      a: 'Yes, PDFora is fully responsive and works directly inside modern mobile browsers on iOS and Android with no app installation needed.'
    }
  ];

  return (
    <div className="min-h-screen pt-16 font-sans bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white transition-colors">
      <Helmet>
        <title>PDFora — Free Online File Tools (PDF, Image, Video, Converter)</title>
        <meta
          name="description"
          content="Free, fast, and 100% private in-browser document tools. Convert, merge, split, compress, and edit PDFs, images, videos, and developer data with zero server uploads."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/" />
      </Helmet>

      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <section className="pt-12 pb-10 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>100% Free · No Sign Up · Private In-Browser</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            Free Online <span className="text-purple-600 dark:text-purple-400">File Tools</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Convert, compress, and edit PDFs, images, videos, and data directly in your browser with zero file uploads.
          </p>

          {/* Clean Search Input */}
          <div className="max-w-lg mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search any tool (e.g. PDF to Word, Compress to KB, Remove BG)..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-[#2A2E45] shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-[#141622] transition-all"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Popular Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mr-1">Popular:</span>
            {POPULAR_SHORTCUTS.map((pill, idx) => (
              <Link
                key={idx}
                to={pill.path}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 dark:hover:text-purple-400 border border-zinc-200/80 dark:border-[#2A2E45] transition-all"
              >
                {pill.name}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── TOOL DIRECTORY SECTION ─────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        {/* Category Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-200 dark:border-[#2A2E45]">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#141622] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search / Category Status Heading */}
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 pt-1">
          <span>
            {searchQuery
              ? `Search results for "${searchQuery}" (${filteredTools.length} found)`
              : `Showing ${CATEGORIES.find(c => c.id === activeCategory)?.label || 'All Tools'} (${filteredTools.length})`}
          </span>
          <Link
            to="/tools"
            className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View 8-Column Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141622] rounded-3xl border border-zinc-200 dark:border-[#2A2E45] max-w-md mx-auto space-y-3 p-8">
            <Search className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">No tools found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Try searching with a different term like "PDF", "Convert", "Compress", or "Image".
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTools.map(tool => {
              const Icon = iconMap[tool.iconName] || FileText;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group flex flex-col justify-between p-5 bg-white dark:bg-[#141622] rounded-2xl border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-150"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                        {tool.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-[#2A2E45] text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 3 KEY PILLARS (TO THE POINT) ───────────────────────────── */}
      <section className="py-12 bg-white dark:bg-[#141622] border-y border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Why Use PDFora?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Designed for speed, privacy, and simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200/80 dark:border-[#2A2E45] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">100% Free &amp; Unlimited</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No credit cards, no subscriptions, and no paywalls. Process as many files as you need anytime.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200/80 dark:border-[#2A2E45] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">100% Private (In-Browser)</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your files are processed locally inside your web browser. Zero files are uploaded or stored on servers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200/80 dark:border-[#2A2E45] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Fast &amp; High Quality</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Powered by native multi-threaded WebAssembly engines for instant conversion and original quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ────────────────────────────────────────────── */}
      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-1">
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Everything you need to know about PDFora</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-[#141622] ${
                  isOpen
                    ? 'border-purple-500 dark:border-purple-500 shadow-sm'
                    : 'border-zinc-200 dark:border-[#2A2E45]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm font-bold ${isOpen ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-white'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : 'text-zinc-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-[#2A2E45]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
