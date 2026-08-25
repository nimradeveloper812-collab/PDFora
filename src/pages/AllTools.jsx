import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText, Search, Sparkles, ArrowRight, Table, Presentation,
  Image as ImageIcon, FileImage, Layers, Minimize2, Scissors,
  Music, FileVideo, RefreshCw, Grid, Code, CheckCircle2, ShieldCheck, X
} from 'lucide-react';
import { TOOLS } from '../data/toolsData';
import { CATEGORIES_DATA } from '../data/categoriesData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw, Code
};

export default function AllTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCatId = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery]   = useState('');

  const filteredCategories = CATEGORIES_DATA.filter(cat => {
    if (activeCatId !== 'all' && cat.id !== activeCatId) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white pt-16 font-sans transition-colors">
      <Helmet>
        <title>All Tools Directory — PDFora | Categories &amp; Subcategories</title>
        <meta
          name="description"
          content="Browse all 89 free online PDF, document, image, video, audio, and AI tools organized by clear Categories and Subcategories on PDFora."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/tools" />
      </Helmet>

      {/* Header Banner */}
      <section className="pt-12 pb-10 px-4 sm:px-6 lg:px-8 text-center border-b border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#141622] transition-colors">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            All Tools Directory
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
            Browse all 89 document, image, video, and developer tools.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools by name or keyword..."
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-[#2A2E45] focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-zinc-200 dark:border-[#2A2E45] no-scrollbar">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCatId === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#141622] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45]'
            }`}
          >
            All Categories ({CATEGORIES_DATA.length})
          </button>
          {CATEGORIES_DATA.map(cat => {
            const isActive = activeCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSearchParams({ category: cat.id })}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#141622] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {activeCatId !== 'all' && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-300">
              Showing filter: <span className="underline">{CATEGORIES_DATA.find(c => c.id === activeCatId)?.name || activeCatId}</span>
            </span>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all cursor-pointer"
            >
              Show All Categories &amp; Tools ➔
            </button>
          </div>
        )}

        {/* Categories Explorer Render */}
        <div className="space-y-12">
          {filteredCategories.map(cat => {
            return (
              <div key={cat.id} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-6">
                
                {/* Category Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#2A2E45]">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      Category
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">{cat.desc}</p>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="space-y-8">
                  {cat.subcategories.map(sub => {
                    const toolsInSub = sub.toolIds
                      .map(tId => TOOLS.find(t => t.id === tId))
                      .filter(Boolean)
                      .filter(tool => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase().trim();
                        return (
                          tool.name.toLowerCase().includes(q) ||
                          tool.shortDesc?.toLowerCase().includes(q) ||
                          (tool.primaryKeywords || []).some(k => k.toLowerCase().includes(q))
                        );
                      });

                    if (toolsInSub.length === 0) return null;

                    return (
                      <div key={sub.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            ↳ Subcategory: {sub.name}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">• {sub.desc}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {toolsInSub.map(tool => {
                            const Icon = iconMap[tool.iconName] || FileText;

                            return (
                              <Link
                                key={tool.id}
                                to={tool.path}
                                className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-50/70 dark:bg-[#1B1E2E]/60 border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-[#1B1E2E] transition-all"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                      Free
                                    </span>
                                  </div>

                                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {tool.name}
                                  </h3>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                    {tool.shortDesc || tool.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-zinc-200/60 dark:border-[#2A2E45] text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                  <span>Launch Tool</span>
                                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
