import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, ArrowRight, Sparkles, FileText, Table,
  Presentation, Image as ImageIcon, FileImage,
  Layers, Minimize2, Scissors, X,
  Music, FileVideo, RefreshCw
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES } from '../data/toolsData';
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

function ToolCard({ tool }) {
  const Icon = iconMap[tool.iconName] || FileText;
  return (
    <Link
      to={tool.path}
      className="group flex flex-col justify-between p-5 rounded-2xl transition-all duration-200"
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
          className="text-base font-bold mb-1.5 transition-colors group-hover:text-blue-600"
          style={{ color: '#0F172A' }}
        >
          {tool.name}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#64748B' }}>
          {tool.shortDesc}
        </p>
      </div>

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

export default function AllTools() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && TOOLS_CATEGORIES.some(c => c.id === cat)) {
      setActiveCategory(cat);
    }
  }, [location.search]);

  const filteredCategories = TOOLS_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => {
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

  const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.tools.length, 0);

  return (
    <div className="pt-16 pb-20 min-h-screen">
      <Helmet>
        <title>All 19 Free Online PDF &amp; Media Tools — PDFora</title>
        <meta name="description" content="Explore PDFora's complete suite of 19 free online tools. Convert Word, Excel, PPT to PDF. Compress, merge, split PDFs, edit images, and convert video and audio files privately." />
        <link rel="canonical" href="https://pdfora.nimradev.site/tools" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pdfora.nimradev.site/tools" />
        <meta property="og:title" content="All 19 Free Online PDF & Media Tools — PDFora" />
        <meta property="og:description" content="Explore PDFora's complete suite of 19 free online tools. Convert, compress, merge, and edit files privately in your browser." />
        <meta property="og:image" content="https://pdfora.nimradev.site/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://pdfora.nimradev.site/tools" />
        <meta name="twitter:title" content="All 19 Free Online PDF & Media Tools — PDFora" />
        <meta name="twitter:description" content="Explore PDFora's complete suite of 19 free online tools. Convert, compress, merge, and edit files privately in your browser." />
        <meta name="twitter:image" content="https://pdfora.nimradev.site/og-image.jpg" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'radial-gradient(ellipse 85% 55% at 50% -5%, #DBEAFE 0%, #FFFFFF 68%)',
          borderBottom: '1px solid #BFDBFE',
        }}
        aria-labelledby="all-tools-heading"
      >
        <div className="max-w-3xl mx-auto space-y-4">
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
            <span>Complete Free Online Suite</span>
          </div>

          <h1
            id="all-tools-heading"
            className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight"
          >
            All Document &amp; Media Tools
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto text-zinc-600">
            {TOOLS.length} free online tools organized by purpose. Convert, compress, edit, merge, and optimize your files with 100% browser privacy.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-2" role="search" aria-label="Search tools">
            <div
              className="flex items-center rounded-2xl bg-white transition-all duration-200"
              style={{ border: '1.5px solid #BFDBFE', boxShadow: '0 2px 8px rgba(59, 130, 246,0.05)' }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246,0.10)';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246,0.05)';
              }}
            >
              <Search className="w-4 h-4 ml-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search across all 19 tools (e.g. compress, mp4, word)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none text-zinc-900"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-3 text-xs font-bold px-2 py-1 rounded-lg text-zinc-400 hover:text-blue-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Tabs ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 sm:justify-center sm:flex-wrap"
          role="tablist"
          aria-label="Filter tools by category"
          style={{ scrollbarWidth: 'none' }}
        >
          {TOOLS_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'all'
              ? TOOLS.length
              : TOOLS.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={isActive}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600'
                }`}
              >
                {cat.name}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Grouped Categories Grid ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Tools directory">
        {totalResults > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map(cat => {
              if (cat.tools.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-zinc-200/80">
                    <div>
                      <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                        {cat.name}
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {cat.tools.length}
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {cat.tools.map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Bottom In-Feed Ad Banner */}
            <div className="max-w-4xl mx-auto pt-6">
              <AdBanner slot="3456789012" className="my-2" />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div
            className="max-w-sm mx-auto text-center py-16 px-8 rounded-3xl bg-white border border-zinc-200 shadow-xs animate-scale-in"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-50 text-blue-600"
              aria-hidden="true"
            >
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold mb-2 text-zinc-900">
              No tools found
            </h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed font-medium">
              {searchQuery
                ? `No tools match "${searchQuery}". Try a different keyword like compress, word, or video.`
                : 'No tools match the selected category filter.'}
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
