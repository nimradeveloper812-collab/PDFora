import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, ShieldCheck, Zap, FileCheck,
  ChevronDown, FileText, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Lock,
  Upload, CheckCircle2, Music, FileVideo, RefreshCw, Star,
  Check
} from 'lucide-react';
import { TOOLS, FAQS } from '../data/toolsData';
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

// ── Reusable Premium SaaS ToolCard ───────────────────────────────────────────
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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/80 transition-transform duration-200 group-hover:scale-108 group-hover:bg-blue-600 group-hover:text-white shadow-xs">
            <Icon className="w-6 h-6 transition-colors" strokeWidth={2} />
          </div>

          {tool.badge && (
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${
                tool.badge === 'New AI'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 mb-1.5 transition-colors group-hover:text-blue-600">
          {tool.name}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed line-clamp-2 font-medium">
          {tool.shortDesc}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 text-xs font-bold text-blue-600 group-hover:text-blue-700">
        <span className="flex items-center gap-1">Open Tool</span>
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

// ── Category Section Header ───────────────────────────────────────────────────
function CategorySectionHeader({ title, description, count, badgeText }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 pb-3 border-b border-zinc-200/80">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          {badgeText && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70">
              {badgeText}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
            {title}
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
            {count} {count === 1 ? 'tool' : 'tools'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredTools = TOOLS.filter(
    t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTools = TOOLS.filter(t => t.popular);
  const pdfTools = TOOLS.filter(t => t.category === 'pdf');
  const documentTools = TOOLS.filter(t => t.category === 'documents');
  const imageTools = TOOLS.filter(t => t.category === 'images');
  const videoTools = TOOLS.filter(t => t.category === 'video');
  const audioTools = TOOLS.filter(t => t.category === 'audio');

  const popularQuickQueries = [
    { label: 'PDF to Word', query: 'pdf to word' },
    { label: 'Compress PDF', query: 'compress' },
    { label: 'Remove BG', query: 'background' },
    { label: 'Merge PDF', query: 'merge' },
    { label: 'Video to Audio', query: 'video to audio' },
    { label: 'Excel to PDF', query: 'excel' },
  ];

  return (
    <div className="pt-24 min-h-screen">
      <Helmet>
        <title>PDFora — Powerful Online File Tools. Completely Free &amp; Private</title>
        <meta name="description" content="100% free, private online document and media suite. Convert, compress, merge, split, and edit PDFs, Word documents, images, video, and audio with zero server uploads." />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section
        className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial from-blue-50/80 via-white to-white border-b border-zinc-200/80"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative">

          {/* ── Left Copy & Search ── */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>19 Free Online File Utilities · Zero Installation Required</span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-[1.12]">
              Powerful File Tools.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700">
                Completely Free.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl font-medium">
              Convert, compress, merge, split, and optimize your PDFs, Word files, spreadsheets, images, video, and audio in seconds with private in-browser processing.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#all-categories-section"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                Explore All 19 Tools
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#popular-tools-section"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-all"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Popular Tools
              </a>
            </div>

            {/* Live Search Bar */}
            <div className="relative pt-2 max-w-xl" role="search" aria-label="Search tools">
              <div className="flex items-center rounded-2xl bg-white p-1.5 border-2 border-blue-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 shadow-sm transition-all">
                <Search className="w-5 h-5 ml-3 shrink-0 text-zinc-400" aria-hidden="true" />
                <input
                  id="home-search-input"
                  type="search"
                  placeholder="What do you want to do? (e.g. compress, pdf to word, mp3)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-zinc-900 font-medium placeholder:text-zinc-400"
                  aria-label="Search tools"
                />
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

              {/* Quick Search Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-zinc-500 font-medium">
                <span className="text-zinc-400">Try:</span>
                {popularQuickQueries.map(item => (
                  <button
                    key={item.label}
                    onClick={() => setSearchQuery(item.query)}
                    className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Live Search Autocomplete Modal/Dropdown */}
              {searchQuery && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-2 z-30 max-h-80 overflow-y-auto bg-white border border-zinc-200 shadow-2xl animate-scale-in"
                  role="listbox"
                  aria-label="Search results"
                >
                  {filteredTools.length > 0 ? (
                    filteredTools.map(t => {
                      const Icon = iconMap[t.iconName] || FileText;
                      return (
                        <Link
                          key={t.id}
                          to={t.path}
                          role="option"
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/80 transition-colors"
                          onClick={() => setSearchQuery('')}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{t.name}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 uppercase">
                                {t.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate mt-0.5">{t.shortDesc}</div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-xs font-medium text-zinc-500">
                        No tools found for &ldquo;{searchQuery}&rdquo;
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Category Anchor Jump Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-bold text-zinc-400">Quick Jump:</span>
              <a href="#pdf-tools" className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-700 font-bold transition-colors">
                PDF Tools (6)
              </a>
              <a href="#document-tools" className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-700 font-bold transition-colors">
                Word &amp; Docs (6)
              </a>
              <a href="#image-tools" className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-700 font-bold transition-colors">
                Image Tools (3)
              </a>
              <a href="#video-tools" className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-700 font-bold transition-colors">
                Video (2)
              </a>
              <a href="#audio-tools" className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-700 font-bold transition-colors">
                Audio (2)
              </a>
            </div>
          </div>

          {/* ── Right: SaaS Product Architecture Preview ── */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-sm rounded-3xl p-6 bg-white border border-blue-200/80 shadow-2xl shadow-blue-500/10 space-y-4">
              <div className="text-center pb-3 border-b border-zinc-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Instant Client Pipeline
                </span>
                <h3 className="text-sm font-extrabold text-zinc-900 mt-0.5">
                  How PDFora Converts Files
                </h3>
              </div>

              {/* Step 1 file */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black bg-blue-100 text-blue-700">
                  DOCX
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">Q3_Quarterly_Report.docx</p>
                  <p className="text-[11px] text-zinc-400">3.8 MB · Word Document</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Progress connector */}
              <div className="flex items-center justify-center gap-2 py-0.5">
                <div className="flex-1 h-px bg-linear-to-r from-transparent to-blue-200" />
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 h-px bg-linear-to-r from-blue-200 to-transparent" />
              </div>

              {/* Step 2 file */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black bg-blue-600 text-white">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">Q3_Quarterly_Report.pdf</p>
                  <p className="text-[11px] font-bold text-blue-600">
                    Ready — 920 KB (Saved 76%)
                  </p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  Done
                </span>
              </div>

              {/* Features list */}
              <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600 font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% In-Browser Memory (Zero Uploads)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>No Registration or Daily Limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant High-Quality Conversion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST & PRIVACY STRIP
          ════════════════════════════════════════════════════ */}
      <section className="py-7 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200" aria-label="Key features">
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
          POPULAR TOOLS SECTION (EARLY ACCESS)
          ════════════════════════════════════════════════════ */}
      <section id="popular-tools-section" className="py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Most Frequently Used
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Popular Tools
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              The essential converters, compressors, and document utilities trusted by users worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {popularTools.slice(0, 6).map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STRUCTURED CATEGORIES SECTION
          ════════════════════════════════════════════════════ */}
      <section id="all-categories-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Section 1: PDF Tools */}
          <div id="pdf-tools" className="scroll-mt-28">
            <CategorySectionHeader
              badgeText="PDF SUITE"
              title="PDF Tools"
              description="Everything you need to merge, split, compress, convert, and organize PDF documents."
              count={pdfTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pdfTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 2: Word & Document Tools */}
          <div id="document-tools" className="scroll-mt-28">
            <CategorySectionHeader
              badgeText="DOCUMENTS"
              title="Word &amp; Document Tools"
              description="Convert seamlessly between Microsoft Word (.docx), Excel (.xlsx), and PDF formats."
              count={documentTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {documentTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 3: Image Tools */}
          <div id="image-tools" className="scroll-mt-28">
            <CategorySectionHeader
              badgeText="IMAGE SUITE"
              title="Image Tools &amp; Background Remover"
              description="Remove backgrounds with AI, compress image file sizes, and convert between raster formats."
              count={imageTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {imageTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 4: Video Tools */}
          <div id="video-tools" className="scroll-mt-28">
            <CategorySectionHeader
              badgeText="VIDEO SUITE"
              title="Video Tools"
              description="Transcode video containers and compress high-definition footage with zero visual quality loss."
              count={videoTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {videoTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 5: Audio Tools */}
          <div id="audio-tools" className="scroll-mt-28">
            <CategorySectionHeader
              badgeText="AUDIO SUITE"
              title="Audio Tools"
              description="Extract studio audio streams from video files and compress audio recordings efficiently."
              count={audioTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {audioTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* View All Directory CTA */}
          <div className="text-center pt-6">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-xs"
            >
              Browse Complete Directory (All {TOOLS.length} Tools)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS (3 STEPS)
          ════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-t border-b border-zinc-200"
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="faq-heading">
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
