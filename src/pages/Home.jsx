import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, ShieldCheck, Zap, FileCheck,
  ChevronDown, FileText, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, HelpCircle, Lock,
  Globe, Upload, CheckCircle2
} from 'lucide-react';
import { TOOLS, FAQS } from '../data/toolsData';
import AdBanner from '../components/common/AdBanner';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors
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
        border: '1px solid #BFDBFE',
        boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        prefetchTool(tool.id);
        e.currentTarget.style.borderColor = '#3B82F6';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246,0.10), 0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onFocus={() => prefetchTool(tool.id)}
      onTouchStart={() => prefetchTool(tool.id)}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#BFDBFE';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(59, 130, 246,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top: icon + badge */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            style={{ background: '#DBEAFE', color: '#3B82F6' }}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          {tool.badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <h4
          className="text-sm font-bold mb-1.5 transition-colors duration-150 group-hover:text-blue-600"
          style={{ color: '#18181B' }}
        >
          {tool.name}
        </h4>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#71717A' }}>
          {tool.shortDesc}
        </p>
      </div>

      {/* Bottom: CTA row */}
      <div
        className="flex items-center justify-between pt-4 mt-4 text-xs font-bold transition-all duration-150"
        style={{ borderTop: '1px solid #FFF0F8', color: '#3B82F6' }}
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

// ── Category Header ───────────────────────────────────────────────────────────
function CategoryHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: '1px solid #BFDBFE' }}>
      <span
        className="w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0"
        style={{ background: '#DBEAFE', color: '#3B82F6' }}
        aria-hidden="true"
      >
        {number}
      </span>
      <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: '#18181B' }}>
        {title}
      </h3>
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
      t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const convertTools  = TOOLS.filter(t => t.category.startsWith('convert'));
  const organizeTools = TOOLS.filter(t => t.category === 'organize');
  const optimizeTools = TOOLS.filter(t => t.category === 'optimize');

  return (
    <div className="pt-16 min-h-screen">
      <Helmet>
        <title>PDFora — Free Online PDF Tools in Pakistan | Convert, Compress &amp; Merge</title>
        <meta name="description" content="Pakistan's premier free PDF platform. Convert Word, Excel, PPT &amp; images to PDF. Merge, compress, and split PDFs instantly — fast, private, and 100% free." />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section
        className="relative pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
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

          {/* ── Left: Copy ── */}
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
              <span>🇵🇰 Pakistan's #1 Free Online PDF Platform</span>
            </div>

            {/* H1 */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
              style={{ color: '#18181B', letterSpacing: '-0.035em' }}
            >
              Convert &amp; Organize<br />
              <span style={{ color: '#3B82F6' }}>Your PDF Documents</span><br />
              Instantly. 100% Free.
            </h1>

            {/* Sub-copy */}
            <p
              className="text-base sm:text-lg leading-relaxed max-w-xl"
              style={{ color: '#52525B' }}
            >
              Simple, fast, and private PDF tools for students, freelancers, and businesses across Pakistan.
              Convert Word, Excel, PowerPoint, and images to PDF — or merge, split, and compress PDFs instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.30)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(59, 130, 246, 0.40)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.30)')}
              >
                Explore All Tools
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  color: '#3F3F46',
                  border: '1.5px solid #E4E4E7',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                  e.currentTarget.style.color = '#3B82F6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E4E4E7';
                  e.currentTarget.style.color = '#3F3F46';
                }}
              >
                How It Works
              </a>
            </div>

            {/* Search Bar */}
            <div className="relative pt-3 max-w-xl" role="search" aria-label="Search PDF tools">
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
                <Search className="w-5 h-5 ml-3 shrink-0" style={{ color: '#A1A1AA' }} aria-hidden="true" />
                <input
                  id="home-search-input"
                  type="search"
                  placeholder="Search tools — Word to PDF, Compress, Merge…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                  style={{ color: '#18181B' }}
                  aria-label="Search PDF tools"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('home-search-input');
                    if (input) input.focus();
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95 shrink-0"
                  style={{ background: '#3B82F6' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2563EB')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3B82F6')}
                  aria-label="Search"
                >
                  Search
                </button>
              </div>

              {/* Live Search Dropdown */}
              {searchQuery && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-2 z-30 max-h-72 overflow-y-auto animate-scale-in"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 20px 48px rgba(59, 130, 246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
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
                            style={{ background: '#DBEAFE', color: '#3B82F6' }}
                            aria-hidden="true"
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold" style={{ color: '#18181B' }}>{t.name}</div>
                            <div className="text-[11px] line-clamp-1 mt-0.5" style={{ color: '#A1A1AA' }}>{t.shortDesc}</div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
                        No tools found for &ldquo;{searchQuery}&rdquo;
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-xs font-bold"
                        style={{ color: '#3B82F6' }}
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Visual Mockup ── */}
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
              {/* Card header */}
              <div
                className="text-center pb-4 mb-5"
                style={{ borderBottom: '1px solid #F9F0F5' }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#3B82F6' }}
                >
                  Document Conversion
                </span>
                <h4 className="text-sm font-bold mt-1" style={{ color: '#18181B' }}>
                  How PDFora Works
                </h4>
              </div>

              {/* Step 1 – Source file */}
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl mb-3"
                style={{ border: '1px solid #BFDBFE', background: '#FAFAFA' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: '#EFF6FF', color: '#3B82F6' }}
                  aria-label="Word document"
                >
                  DOC
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: '#18181B' }}>report_final.docx</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#A1A1AA' }}>3.4 MB · Word Document</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#DCFCE7' }}
                  aria-hidden="true"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16A34A' }} />
                </div>
              </div>

              {/* Arrow / Processing indicator */}
              <div className="flex items-center justify-center py-2 gap-2 my-1">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #BFDBFE)' }} />
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#DBEAFE', color: '#3B82F6' }}
                  aria-label="Converting"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #BFDBFE, transparent)' }} />
              </div>

              {/* Step 2 – Result file */}
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl mb-4"
                style={{ border: '1px solid #BFDBFE', background: '#EFF6FF' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246,0.25)',
                  }}
                  aria-label="PDF result"
                >
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: '#18181B' }}>report_final.pdf</p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#3B82F6' }}>
                    Ready — 1.2 MB
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                  style={{ background: '#3B82F6', color: '#FFFFFF' }}
                >
                  Free
                </span>
              </div>

              {/* Trust pills */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {[
                  { icon: Lock, text: 'TLS Encrypted' },
                  { icon: ShieldCheck, text: 'Auto-deleted' },
                  { icon: Globe, text: 'Works on mobile' },
                ].map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                    style={{ color: '#71717A' }}
                  >
                    <Icon className="w-3 h-3 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST STRIP
          ════════════════════════════════════════════════════ */}
      <section
        className="py-10 px-4 sm:px-6 lg:px-8"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #BFDBFE' }}
        aria-label="Platform highlights"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { title: '100% Private',  sub: 'Files auto-deleted',     icon: ShieldCheck },
              { title: 'TLS Encrypted', sub: 'Secure file transfer',   icon: Lock },
              { title: 'Instant',       sub: 'No processing queues',   icon: Zap },
              { title: 'Zero Cost',     sub: 'No account needed',      icon: FileCheck },
            ].map(({ title, sub, icon: Icon }) => (
              <div key={title} className="space-y-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                  style={{ background: '#DBEAFE', color: '#3B82F6' }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-base font-extrabold" style={{ color: '#18181B' }}>
                  {title}
                </h3>
                <p className="text-xs" style={{ color: '#71717A' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TOOLS GRID
          ════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="section-label">Complete Toolkit</span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              Choose a PDF Tool
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>
              Every tool runs on high-speed servers, requires no installation, and produces
              output files in seconds.
            </p>
          </div>

          <div className="space-y-14">

            {/* Category: Convert */}
            {convertTools.length > 0 && (
              <div>
                <CategoryHeader number="1" title="Convert to &amp; from PDF" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {convertTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </div>
            )}

            {/* Category: Organize */}
            {organizeTools.length > 0 && (
              <div>
                <CategoryHeader number="2" title="Organize &amp; Edit PDF" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {organizeTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </div>
            )}

            {/* Category: Optimize */}
            {optimizeTools.length > 0 && (
              <div>
                <CategoryHeader number="3" title="Optimize &amp; Compress" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {optimizeTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </div>
            )}
          </div>

          {/* View All CTA */}
          <div className="text-center mt-12">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-md group"
              style={{
                border: '1.5px solid #BFDBFE',
                color: '#3B82F6',
                textDecoration: 'none',
                background: '#FFFFFF',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.background = '#EFF6FF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              View All {TOOLS.length} PDF Tools
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════ */}
      <span id="how-it-works" aria-hidden="true" />
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: '#EFF6FF', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="section-label">Simple Process</span>
            <h2
              id="how-it-works-heading"
              className="text-3xl font-extrabold"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              How PDFora Works
            </h2>
            <p className="text-sm" style={{ color: '#71717A' }}>
              Process your documents in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector lines on desktop */}
            <div
              className="hidden md:block absolute top-10 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px"
              style={{ background: 'linear-gradient(90deg, #BFDBFE 0%, #3B82F6 50%, #BFDBFE 100%)' }}
              aria-hidden="true"
            />

            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Your File',
                desc: 'Drag and drop your PDF, Word, Excel, PowerPoint, or image into the secure upload box — or tap to browse from your device.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'PDFora Processes It',
                desc: 'Configure any options such as compression level or page size, then click convert. Most files complete in under five seconds.',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Download Your Result',
                desc: 'Your output file is ready to download instantly. Files are permanently deleted from our servers within 60 minutes.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative p-7 rounded-2xl space-y-4 text-left"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 2px 8px rgba(59, 130, 246,0.05)',
                }}
              >
                {/* Step number */}
                <span
                  className="block text-5xl font-black leading-none select-none"
                  style={{ color: '#DBEAFE', letterSpacing: '-0.05em' }}
                  aria-hidden="true"
                >
                  {step}
                </span>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#DBEAFE', color: '#3B82F6' }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                <h3 className="text-base font-bold" style={{ color: '#18181B' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Home In-Feed Ad Banner ── */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <AdBanner slot="2345678901" className="my-2" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHY PDFORA
          ════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="why-pdfora-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="section-label">Platform Values</span>
            <h2
              id="why-pdfora-heading"
              className="text-3xl font-extrabold"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              Why Choose PDFora?
            </h2>
            <p className="text-sm" style={{ color: '#71717A' }}>
              Built around simplicity, speed, and strict privacy — for every type of user.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                desc: 'High-performance servers complete most conversions in under five seconds — no queues, no waiting.',
              },
              {
                icon: FileCheck,
                title: 'Easy to Use',
                desc: 'A clean, minimal interface with no unnecessary settings or complex menus. Just upload and convert.',
              },
              {
                icon: Globe,
                title: 'Works Everywhere',
                desc: 'Fully responsive design means PDFora works on desktop, tablet, and mobile without installing anything.',
              },
              {
                icon: ShieldCheck,
                title: 'Privacy First',
                desc: 'Your files are encrypted in transit, processed in isolated sessions, and auto-deleted within an hour.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl space-y-3"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#DBEAFE', color: '#3B82F6' }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: '#18181B' }}>
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: '#EFF6FF', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="section-label">FAQ</span>
            <h2
              id="faq-heading"
              className="text-3xl font-extrabold flex items-center justify-center gap-2.5"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              <HelpCircle className="w-7 h-7 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
              Frequently Asked Questions
            </h2>
            <p className="text-sm" style={{ color: '#71717A' }}>
              Everything you need to know about PDFora.
            </p>
          </div>

          <div className="space-y-3" role="list">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  role="listitem"
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${isOpen ? '#3B82F6' : '#BFDBFE'}`,
                    boxShadow: isOpen ? '0 4px 16px rgba(59, 130, 246,0.08)' : '0 1px 4px rgba(59, 130, 246,0.03)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 transition-colors duration-150"
                    aria-expanded={isOpen}
                    style={{ color: isOpen ? '#3B82F6' : '#18181B' }}
                  >
                    <span className="text-sm font-semibold leading-snug">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: isOpen ? '#3B82F6' : '#A1A1AA' }}
                      aria-hidden="true"
                    />
                  </button>

                  <div className={`faq-accordion-content ${isOpen ? 'open' : ''}`}>
                    <div
                      className="px-5 sm:px-6 pb-5 pt-1 text-sm leading-relaxed"
                      style={{ color: '#52525B', borderTop: '1px solid #FFF0F8' }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FINAL CTA BANNER
          ════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" aria-label="Get started">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-3xl p-8 sm:p-14 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 24px 56px rgba(59, 130, 246,0.30)',
            }}
          >
            {/* Decorative orb */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)' }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white"
                style={{ letterSpacing: '-0.03em' }}
              >
                Simplify Your Document Workflow
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                No subscriptions. No sign-up. Start converting, merging, and compressing PDFs
                right now — completely free.
              </p>
              <div className="pt-2">
                <Link
                  to="/tools"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 hover:shadow-lg"
                  style={{
                    background: '#FFFFFF',
                    color: '#3B82F6',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}
                >
                  Get Started — It's Free
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
