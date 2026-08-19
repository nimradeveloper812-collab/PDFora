import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, ShieldCheck, Zap, FileCheck,
  ChevronDown, FileText, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Lock,
  Upload, CheckCircle2, Music, FileVideo, RefreshCw, Star,
  Check, X
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES, FAQS } from '../data/toolsData';
import AdBanner from '../components/common/AdBanner';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw
};

const prefetchTool = (id) => {
  switch (id) {
    case 'word-to-pdf': import('./tools/WordToPdf'); break;
    case 'excel-to-pdf': import('./tools/ExcelToPdf'); break;
    case 'powerpoint-to-pdf': import('./tools/PowerPointToPdf'); break;
    case 'jpg-to-pdf': import('./tools/JpgToPdf'); break;
    case 'pdf-to-jpg': import('./tools/PdfToJpg'); break;
    case 'merge-pdf': import('./tools/MergePdf'); break;
    case 'compress-pdf': import('./tools/CompressPdf'); break;
    case 'split-pdf': import('./tools/SplitPdf'); break;
    case 'image-background-remover': import('./tools/ImageBackgroundRemover'); break;
    case 'image-compressor': import('./tools/ImageCompressor'); break;
    case 'pdf-to-word': import('./tools/PdfToWord'); break;
    case 'pdf-to-excel': import('./tools/PdfToExcel'); break;
    case 'excel-to-word': import('./tools/ExcelToWord'); break;
    case 'word-to-excel': import('./tools/WordToExcel'); break;
    case 'video-to-audio': import('./tools/VideoToAudio'); break;
    case 'audio-compressor': import('./tools/AudioCompressor'); break;
    case 'image-converter': import('./tools/ImageConverter'); break;
    case 'video-converter': import('./tools/VideoConverter'); break;
    case 'video-compressor': import('./tools/VideoCompressor'); break;
    default: break;
  }
};

// ── Reusable SaaS ToolCard ───────────────────────────────────────────────────
function ToolCard({ tool }) {
  const Icon = iconMap[tool.iconName] || FileText;
  return (
    <Link
      to={tool.path}
      className="group relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-200 bg-white border border-zinc-200/90 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/70 hover:-translate-y-1"
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => prefetchTool(tool.id)}
      onFocus={() => prefetchTool(tool.id)}
      onTouchStart={() => prefetchTool(tool.id)}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/80 transition-all duration-200 group-hover:scale-108 group-hover:bg-blue-600 group-hover:text-white shadow-xs">
            <Icon className="w-6 h-6 transition-colors" strokeWidth={2} />
          </div>

          {tool.badge && (
            <span
              className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${
                tool.badge === 'New AI'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-black text-zinc-900 mb-1.5 transition-colors group-hover:text-blue-600">
          {tool.name}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed line-clamp-2 font-medium">
          {tool.shortDesc}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 text-xs font-bold text-blue-600 group-hover:text-blue-700">
        <span className="flex items-center gap-1 font-bold">Open Tool</span>
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const categoriesToShow = TOOLS_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => {
    const catTools = TOOLS.filter(t => {
      const matchCat = cat.id === t.category;
      const matchSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
    return {
      ...cat,
      tools: catTools
    };
  }).filter(cat => activeCategory === 'all' || activeCategory === cat.id);

  const totalFilteredCount = categoriesToShow.reduce((acc, cat) => acc + cat.tools.length, 0);
  const popularTools = TOOLS.filter(t => t.popular);

  return (
    <div className="pt-24 min-h-screen">
      <Helmet>
        <title>PDFora — All 19 Free Online File Tools (PDF, Word, Excel, Images, Video &amp; Audio)</title>
        <meta name="description" content="100% free, private online document and media suite. Convert, compress, merge, split, and edit PDFs, Word documents, images, video, and audio with zero server uploads." />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section
        className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial from-blue-50/90 via-white to-white border-b border-zinc-200"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">

          {/* ── Left Copy & Search ── */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>All 19 Free Tools Available Online · 100% In-Browser Privacy</span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-[1.12]">
              All Your File Tools.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700">
                Completely Free &amp; Private.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl font-medium">
              Convert, compress, merge, split, and edit your PDFs, Word documents, spreadsheets, images, videos, and audio files right in your browser with zero server uploads.
            </p>

            {/* Live Instant Search Bar */}
            <div className="relative pt-1 max-w-xl" role="search" aria-label="Search tools">
              <div className="flex items-center rounded-2xl bg-white p-1.5 border-2 border-blue-300 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 shadow-sm transition-all">
                <Search className="w-5 h-5 ml-3 shrink-0 text-zinc-400" aria-hidden="true" />
                <input
                  id="home-search-input"
                  type="search"
                  placeholder="Search all 19 tools (e.g. compress, word to pdf, background remover, mp3)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-zinc-900 font-medium placeholder:text-zinc-400"
                  aria-label="Search tools"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 mr-1"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('home-search-input');
                    if (input) input.focus();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Quick Keywords */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-zinc-500 font-medium">
                <span className="text-zinc-400 font-bold">Popular:</span>
                {[
                  { label: 'PDF to Word', q: 'pdf to word' },
                  { label: 'Compress PDF', q: 'compress pdf' },
                  { label: 'Remove BG', q: 'background' },
                  { label: 'Merge PDF', q: 'merge' },
                  { label: 'Video to Audio', q: 'audio' },
                  { label: 'Excel to PDF', q: 'excel' },
                ].map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => { setActiveCategory('all'); setSearchQuery(chip.q); }}
                    className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors font-medium"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Feature Highlights Box ── */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-sm rounded-3xl p-6 bg-white border border-blue-200 shadow-xl shadow-blue-500/10 space-y-4">
              <div className="text-center pb-3 border-b border-zinc-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Universal File Suite
                </span>
                <h3 className="text-sm font-extrabold text-zinc-900 mt-0.5">
                  19 Tools · Ready in Your Browser
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { name: 'PDF Suite', count: '6 Tools', icon: FileText, color: '#3B82F6' },
                  { name: 'Word & Docs', count: '6 Tools', icon: Table, color: '#2563EB' },
                  { name: 'Image Tools', count: '3 Tools', icon: ImageIcon, color: '#10B981' },
                  { name: 'Video & Audio', count: '4 Tools', icon: FileVideo, color: '#8B5CF6' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                        <span className="text-xs font-bold text-zinc-800">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-400">{item.count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600 font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% In-Browser Memory (Zero Uploads)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>No Registration or Daily Limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant High-Quality Conversion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          POPULAR TOOLS SHOWCASE
          ════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50/60 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  QUICK ACCESS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Popular Tools
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                The most frequently used converters and utilities by millions of users daily.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {popularTools.slice(0, 6).map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          INTERACTIVE CATEGORY FILTER TABS + ALL 19 TOOLS
          ════════════════════════════════════════════════════ */}
      <section id="all-tools-directory" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Section Header with Category Tabs */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              EXPLORE COMPLETE SUITE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              All 19 Online Tools
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Click any category filter below or search to find the exact tool you need.
            </p>

            {/* Interactive Category Filter Pills */}
            <div
              className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 sm:justify-center sm:flex-wrap"
              role="tablist"
              aria-label="Filter tools"
            >
              {TOOLS_CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const count = cat.id === 'all'
                  ? TOOLS.length
                  : TOOLS.filter(t => t.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); }}
                    role="tab"
                    aria-selected={isActive}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-150 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {cat.name}
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All 19 Tools Displayed by Category */}
          {totalFilteredCount > 0 ? (
            <div className="space-y-14">
              {categoriesToShow.map(cat => {
                if (cat.tools.length === 0) return null;
                return (
                  <div key={cat.id} className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-zinc-200">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                          {cat.name}
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {cat.tools.length} {cat.tools.length === 1 ? 'Tool' : 'Tools'}
                          </span>
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {cat.tools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center max-w-sm mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-xs">
              <Search className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-zinc-900 mb-1">No tools match your search</h4>
              <p className="text-xs text-zinc-500 mb-4 font-medium">
                No tools found for &ldquo;{searchQuery}&rdquo;. Try another term like &quot;word&quot; or &quot;compress&quot;.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST & PRIVACY STRIP
          ════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-t border-b border-zinc-200" aria-label="Key features">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { title: '100% Private', sub: 'Executes locally on your device', icon: ShieldCheck },
            { title: 'No File Persistence', sub: 'Zero remote server logs', icon: Lock },
            { title: 'Zero Queue Lag', sub: 'Instant high-speed processing', icon: Zap },
            { title: 'Always Free', sub: 'No subscriptions or caps', icon: FileCheck },
          ].map(({ title, sub, icon: Icon }) => (
            <div key={title} className="space-y-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto bg-blue-50 text-blue-600 border border-blue-100" aria-hidden="true">
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-extrabold text-zinc-900">{title}</h3>
              <p className="text-xs text-zinc-500 font-medium">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS (3 STEPS)
          ════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 3-Step Process
            </span>
            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              How PDFora Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Transform and process your files in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Your File',
                desc: 'Drag & drop your PDF, Word document, Excel spreadsheet, image, or video directly into the upload area.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'Choose Options & Process',
                desc: 'Select your preferred output format or compression presets. Processing completes in seconds locally.',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Download Result Instantly',
                desc: 'Download your converted document or media file immediately with zero wait queues or watermarks.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="p-6 rounded-2xl space-y-3 bg-white border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-100 select-none">
                    {step}
                  </span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-zinc-900">{title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-8">
          <AdBanner slot="2345678901" className="my-2" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ ACCORDION
          ════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50/50" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Frequently Asked Questions
            </span>
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Got Questions? We&apos;ve Got Answers.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Everything you need to know about privacy, security, and supported file formats.
            </p>
          </div>

          <div className="space-y-3" role="list">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  role="listitem"
                  className="rounded-2xl overflow-hidden transition-all duration-200 border bg-white"
                  style={{
                    borderColor: isOpen ? '#3B82F6' : '#E2E8F0',
                    boxShadow: isOpen ? '0 4px 16px rgba(59, 130, 246,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-bold ${isOpen ? 'text-blue-600' : 'text-zinc-900'}`}>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 font-medium">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FINAL CTA BANNER
          ════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" aria-label="Get started">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 text-center bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/25 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Your Files. Your Tools. One Private Place.
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto font-medium leading-relaxed">
              Explore PDFora&apos;s free online tools and transform your documents, images, and videos in seconds.
            </p>
            <div className="pt-2">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md active:scale-95"
              >
                Explore All 19 Tools Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
