import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, ShieldCheck, Zap, FileCheck,
  ChevronDown, FileText, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Lock,
  Globe, Upload, CheckCircle2, Music, FileVideo, RefreshCw, Star
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

// ── Reusable Tool Card ────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const Icon = iconMap[tool.iconName] || FileText;
  return (
    <Link
      to={tool.path}
      className="group flex flex-col justify-between rounded-2xl p-5 transition-all duration-200"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        prefetchTool(tool.id);
        e.currentTarget.style.borderColor = '#3B82F6';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(59, 130, 246, 0.12), 0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onFocus={() => prefetchTool(tool.id)}
      onTouchStart={() => prefetchTool(tool.id)}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.03)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top: icon + badge */}
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' }}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          {tool.badge && (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: tool.badge === 'New AI' ? '#ECFDF5' : '#EFF6FF',
                color: tool.badge === 'New AI' ? '#059669' : '#1D4ED8',
                border: `1px solid ${tool.badge === 'New AI' ? '#A7F3D0' : '#BFDBFE'}`
              }}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <h3
          className="text-base font-bold mb-1.5 transition-colors duration-150 group-hover:text-blue-600"
          style={{ color: '#0F172A' }}
        >
          {tool.name}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#64748B' }}>
          {tool.shortDesc}
        </p>
      </div>

      {/* Bottom: Action row */}
      <div
        className="flex items-center justify-between pt-3.5 mt-4 text-xs font-bold transition-all duration-150"
        style={{ borderTop: '1px solid #F1F5F9', color: '#2563EB' }}
      >
        <span>Open Tool</span>
        <ArrowRight
          className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1"
          aria-hidden="true"
        />
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

// ── Main Component ────────────────────────────────────────────────────────────
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

  return (
    <div className="pt-16 min-h-screen">
      <Helmet>
        <title>PDFora — Free Online Document, Image &amp; Media Tools Suite</title>
        <meta name="description" content="100% free, private online document and media toolkit. Convert, compress, merge, split, and edit PDFs, Word documents, images, video, and audio with zero server uploads." />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section
        className="relative pt-14 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% -5%, #DBEAFE 0%, #FFFFFF 70%)',
          borderBottom: '1px solid #BFDBFE',
        }}
      >
        {/* Subtle decorative blobs */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246,0.06) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246,0.04) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative">

          {/* ── Left: Copy & Search ── */}
          <div className="lg:col-span-7 space-y-6 text-left">

            {/* Label pill */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: '#DBEAFE',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                boxShadow: '0 1px 4px rgba(59, 130, 246,0.08)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>100% Free &amp; Private Document &amp; Media Suite</span>
            </div>

            {/* H1 */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
              style={{ color: '#0F172A', letterSpacing: '-0.035em' }}
            >
              All Your File Tools<br />
              <span style={{ color: '#2563EB' }}>In One Private Place</span>
            </h1>

            {/* Sub-copy */}
            <p
              className="text-base sm:text-lg leading-relaxed max-w-xl"
              style={{ color: '#475569' }}
            >
              Fast, secure in-browser utility suite. Convert, compress, merge, split, and optimize PDFs, Word documents, images, video, and audio without queues or subscriptions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#all-tools-section"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.30)',
                  textDecoration: 'none',
                }}
              >
                Explore All 19 Tools
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#popular-tools-section"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  color: '#334155',
                  border: '1.5px solid #E2E8F0',
                  textDecoration: 'none',
                }}
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Popular Tools
              </a>
            </div>

            {/* Fast Live Search Bar */}
            <div className="relative pt-2 max-w-xl" role="search" aria-label="Search tools">
              <div
                className="flex items-center rounded-2xl bg-white p-1.5 transition-all duration-200"
                style={{ border: '1.5px solid #BFDBFE', boxShadow: '0 2px 8px rgba(59, 130, 246,0.05)' }}
                onFocusCapture={e => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246,0.12)';
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = '#BFDBFE';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246,0.05)';
                }}
              >
                <Search className="w-5 h-5 ml-3 shrink-0" style={{ color: '#94A3B8' }} aria-hidden="true" />
                <input
                  id="home-search-input"
                  type="search"
                  placeholder="What do you want to do? (e.g. compress, word, merge, audio)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                  style={{ color: '#0F172A' }}
                  aria-label="Search tools"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('home-search-input');
                    if (input) input.focus();
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95 shrink-0"
                  style={{ background: '#2563EB' }}
                  aria-label="Search"
                >
                  Search
                </button>
              </div>

              {/* Live Search Dropdown */}
              {searchQuery && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-2 z-30 max-h-80 overflow-y-auto animate-scale-in"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 20px 48px rgba(59, 130, 246,0.14), 0 4px 16px rgba(0,0,0,0.06)',
                  }}
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
                          className="flex items-center gap-3 p-2.5 rounded-xl transition-colors duration-100 hover:bg-blue-50"
                          style={{ textDecoration: 'none' }}
                          onClick={() => setSearchQuery('')}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: '#DBEAFE', color: '#2563EB' }}
                            aria-hidden="true"
                          >
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
                      <p className="text-sm font-medium text-zinc-500">
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

            {/* Quick Category Anchor Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-zinc-400">Quick Jump:</span>
              <a href="#pdf-tools" className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-600 font-medium transition-colors">
                PDF Tools
              </a>
              <a href="#document-tools" className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-600 font-medium transition-colors">
                Word &amp; Docs
              </a>
              <a href="#image-tools" className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-600 font-medium transition-colors">
                Images
              </a>
              <a href="#video-tools" className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-600 font-medium transition-colors">
                Video
              </a>
              <a href="#audio-tools" className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-zinc-600 font-medium transition-colors">
                Audio
              </a>
            </div>
          </div>

          {/* ── Right: Visual SaaS Mockup ── */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div
              className="w-full max-w-sm relative"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                boxShadow: '0 24px 64px rgba(59, 130, 246,0.12), 0 4px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div className="text-center pb-4 mb-4 border-b border-zinc-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Universal File Pipeline
                </span>
                <h3 className="text-sm font-bold text-zinc-900 mt-1">
                  How PDFora Works
                </h3>
              </div>

              {/* Source file */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl mb-2.5 bg-zinc-50 border border-zinc-200/70">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black bg-blue-50 text-blue-600">
                  DOCX
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">annual_financial_report.docx</p>
                  <p className="text-[11px] text-zinc-400">4.2 MB · Microsoft Word</p>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>

              {/* Processing connector */}
              <div className="flex items-center justify-center py-1.5 gap-2">
                <div className="flex-1 h-px bg-linear-to-r from-transparent to-blue-200" />
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex-1 h-px bg-linear-to-r from-blue-200 to-transparent" />
              </div>

              {/* Converted file */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl mb-4 bg-blue-50/70 border border-blue-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white bg-linear-to-br from-blue-500 to-blue-700 shadow-xs">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">annual_financial_report.pdf</p>
                  <p className="text-[11px] font-semibold text-blue-600">
                    Ready — 1.1 MB (Saved 74%)
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  Free
                </span>
              </div>

              {/* Privacy highlights */}
              <div className="flex items-center justify-center gap-3 flex-wrap pt-1 border-t border-zinc-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                  <Lock className="w-3 h-3 text-blue-600" /> Client Sandbox
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> 100% In-Browser
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                  <Globe className="w-3 h-3 text-blue-600" /> Multi-Platform
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST STRIP
          ════════════════════════════════════════════════════ */}
      <section
        className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200"
        aria-label="Platform highlights"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { title: '100% Private', sub: 'Runs locally in your browser', icon: ShieldCheck },
              { title: 'No File Storage', sub: 'Zero remote server logs', icon: Lock },
              { title: 'Zero Queues', sub: 'Instant high-speed conversion', icon: Zap },
              { title: 'Always Free', sub: 'No subscriptions or limits', icon: FileCheck },
            ].map(({ title, sub, icon: Icon }) => (
              <div key={title} className="space-y-1.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto bg-blue-50 text-blue-600 border border-blue-100"
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          POPULAR TOOLS SECTION
          ════════════════════════════════════════════════════ */}
      <section id="popular-tools-section" className="py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70">
              Most Frequently Used
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Popular Tools
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              The essential converters, compressors, and document utilities trusted by millions of users daily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.slice(0, 6).map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STRUCTURED CATEGORIES SECTION
          ════════════════════════════════════════════════════ */}
      <section id="all-tools-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Section 1: PDF Tools */}
          <div id="pdf-tools" className="scroll-mt-24">
            <CategorySectionHeader
              badgeText="PDF SUITE"
              title="PDF Tools"
              description="Everything you need to merge, split, compress, convert, and organize PDF documents."
              count={pdfTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 2: Word & Document Tools */}
          <div id="document-tools" className="scroll-mt-24">
            <CategorySectionHeader
              badgeText="DOCUMENTS"
              title="Word &amp; Document Tools"
              description="Convert seamlessly between Microsoft Word (.docx), Excel (.xlsx), and PDF formats."
              count={documentTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 3: Image Tools */}
          <div id="image-tools" className="scroll-mt-24">
            <CategorySectionHeader
              badgeText="IMAGE SUITE"
              title="Image Tools &amp; Background Remover"
              description="Remove backgrounds with AI, compress image file sizes, and convert between raster formats."
              count={imageTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 4: Video Tools */}
          <div id="video-tools" className="scroll-mt-24">
            <CategorySectionHeader
              badgeText="VIDEO SUITE"
              title="Video Tools"
              description="Transcode video containers and compress high-definition footage with zero visual quality loss."
              count={videoTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videoTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* Section 5: Audio Tools */}
          <div id="audio-tools" className="scroll-mt-24">
            <CategorySectionHeader
              badgeText="AUDIO SUITE"
              title="Audio Tools"
              description="Extract studio audio streams from video files and compress audio recordings efficiently."
              count={audioTools.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {audioTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          {/* View All Directory Button */}
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
          HOW IT WORKS
          ════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-18 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-t border-b border-zinc-200"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 3-Step Process
            </span>
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight"
            >
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
              <div
                key={step}
                className="relative p-6 rounded-2xl space-y-3 bg-white border border-zinc-200 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-100 tracking-tight select-none">
                    {step}
                  </span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* In-Feed Ad Banner */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <AdBanner slot="2345678901" className="my-2" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════ */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Frequently Asked Questions
            </span>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Everything you need to know about security, formats, and browser-based conversions.
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
          <div
            className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 20px 50px rgba(37, 99, 235, 0.25)',
            }}
          >
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto text-white">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Streamline Your File Workflow Today
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-blue-100 font-medium">
                No accounts. No software installations. Convert, compress, and edit documents, images, and videos in seconds.
              </p>
              <div className="pt-2">
                <Link
                  to="/tools"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md active:scale-95"
                >
                  Start Using All Tools Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
