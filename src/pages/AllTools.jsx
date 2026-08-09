import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Sparkles, FileText, Table,
  Presentation, Image as ImageIcon, FileImage,
  Layers, Minimize2, Scissors, X
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES } from '../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors
};

export default function AllTools() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');

  const filteredTools = TOOLS.filter(tool => {
    const matchCat    = activeCategory === 'all' || tool.category === activeCategory;
    const matchSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase())
                     || tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-16 pb-20 min-h-screen">
      <Helmet>
        <title>All Free PDF Tools — PDFora | Pakistan's PDF Converter Suite</title>
        <meta name="description" content="Explore all free PDF tools on PDFora. Convert Word, Excel, PPT, images to PDF, merge, compress, and split PDFs instantly." />
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
        <div className="max-w-3xl mx-auto space-y-5">
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
            <span>🇵🇰 Pakistan's Complete PDF Suite</span>
          </div>

          <h1
            id="all-tools-heading"
            className="text-3xl sm:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            All PDF Tools
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto" style={{ color: '#52525B' }}>
            {TOOLS.length} free tools to convert, edit, merge, split, and compress your PDF
            documents — no installation, no sign-up required.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-2" role="search" aria-label="Search PDF tools">
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
              <Search className="w-4 h-4 ml-3.5 shrink-0" style={{ color: '#A1A1AA' }} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by tool name or description…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
                style={{ color: '#18181B' }}
                aria-label="Search PDF tools"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-3 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                  style={{ color: '#A1A1AA' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#3B82F6')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Tabs ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 sm:justify-center sm:flex-wrap"
          role="tablist"
          aria-label="Filter tools by category"
          style={{ scrollbarWidth: 'none' }}
        >
          {TOOLS_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const count    = cat.id === 'all'
              ? TOOLS.length
              : TOOLS.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={isActive}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 whitespace-nowrap"
                style={
                  isActive
                    ? {
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        border: '1.5px solid #3B82F6',
                        boxShadow: '0 3px 10px rgba(59, 130, 246,0.25)',
                      }
                    : {
                        background: '#FFFFFF',
                        color: '#52525B',
                        border: '1.5px solid #BFDBFE',
                      }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.color = '#3B82F6';
                    e.currentTarget.style.background = '#EFF6FF';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#BFDBFE';
                    e.currentTarget.style.color = '#52525B';
                    e.currentTarget.style.background = '#FFFFFF';
                  }
                }}
              >
                {cat.name}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    isActive
                      ? { background: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }
                      : { background: '#DBEAFE', color: '#1D4ED8' }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Tools Grid ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="PDF tools grid">

        {filteredTools.length > 0 ? (
          <>
            {/* Result count */}
            <p className="text-xs font-medium mb-6" style={{ color: '#A1A1AA' }}>
              {filteredTools.length === TOOLS.length
                ? `Showing all ${TOOLS.length} tools`
                : `${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} found`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredTools.map(tool => {
                const Icon = iconMap[tool.iconName] || FileText;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="group flex flex-col justify-between p-5 rounded-2xl transition-all duration-200"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #BFDBFE',
                      boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#3B82F6';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246,0.10), 0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#BFDBFE';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(59, 130, 246,0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
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

                      <h3
                        className="text-sm font-bold mb-1.5 transition-colors group-hover:text-blue-600"
                        style={{ color: '#18181B' }}
                      >
                        {tool.name}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#71717A' }}>
                        {tool.shortDesc}
                      </p>
                    </div>

                    <div
                      className="flex items-center justify-between pt-4 mt-4 text-xs font-bold"
                      style={{ borderTop: '1px solid #FFF0F8', color: '#3B82F6' }}
                    >
                      <span>Open Tool</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            className="max-w-sm mx-auto text-center py-16 px-8 rounded-3xl animate-scale-in"
            style={{
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              boxShadow: '0 4px 16px rgba(59, 130, 246,0.06)',
            }}
            role="status"
            aria-live="polite"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#DBEAFE', color: '#3B82F6' }}
              aria-hidden="true"
            >
              <Search className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold mb-2" style={{ color: '#18181B' }}>
              No tools found
            </h4>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: '#71717A' }}>
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'No tools match the selected category.'}
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: '#DBEAFE',
                color: '#3B82F6',
                border: '1px solid #BFDBFE',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#BFDBFE')}
              onMouseLeave={e => (e.currentTarget.style.background = '#DBEAFE')}
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
