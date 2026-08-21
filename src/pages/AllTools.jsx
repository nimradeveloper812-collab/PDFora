import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText, Search, Sparkles, ArrowRight, Table, Presentation,
  Image as ImageIcon, FileImage, Layers, Minimize2, Scissors,
  Music, FileVideo, RefreshCw
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES, getToolTheme } from '../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw
};

export default function AllTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.primaryKeywords || []).some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white pt-16">
      <Helmet>
        <title>All 19 Free Online PDF &amp; Document Tools | PDFora</title>
        <meta name="description" content="Browse all 19 free online PDF, document, image, video, and audio tools on PDFora. Convert Word, Excel, PPT, JPG to PDF, merge, compress, and split documents instantly." />
        <link rel="canonical" href="https://pdfora.nimradev.site/tools" />
      </Helmet>

      {/* Header */}
      <section
        className="pt-10 pb-12 px-4 sm:px-6 lg:px-8 text-center border-b border-zinc-200"
        style={{ backgroundColor: '#FAFAFC' }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-display">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Complete Document Toolkit — 100% Free &amp; Private</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight font-heading">
            All Document &amp; Media Tools
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-sans">
            Select any tool to convert, compress, merge, split, or edit files instantly.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-4.5 h-4.5 absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter tools by keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-white text-zinc-900 border border-zinc-300 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills & Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 border-b border-zinc-200 pb-4">
          <button
            onClick={() => setSearchParams({})}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all font-display ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All Tools ({TOOLS.length})
          </button>
          {TOOLS_CATEGORIES.map(cat => {
            const count = TOOLS.filter(t => t.category === cat.id).length;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id })}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all font-display ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 rounded-xl border border-zinc-200 max-w-md mx-auto my-8 space-y-3">
            <Search className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800 font-heading">No tools found matching your filter</h3>
            <p className="text-xs text-zinc-500 font-sans">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => { setSearchQuery(''); setSearchParams({}); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs font-display cursor-pointer"
              style={{ backgroundColor: '#4F46E5' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTools.map(tool => {
              const Icon = iconMap[tool.iconName] || FileText;
              const theme = getToolTheme(tool.id, tool.category);

              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group flex flex-col justify-between p-4 bg-white rounded-xl border border-zinc-200 hover:border-indigo-600 hover:shadow-md transition-all duration-200"
                  style={{ textDecoration: 'none' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${theme.iconBg}`}>
                        <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-display ${theme.badgeBg}`}>
                        {tool.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors mb-1 font-heading">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-sans line-clamp-2">
                      {tool.shortDesc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 text-[11px] font-bold text-zinc-700 group-hover:text-indigo-600 font-display">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
