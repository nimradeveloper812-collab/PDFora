import React, { useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Sparkles, ArrowRight, ShieldCheck, Zap,
  ChevronDown, Layers, ArrowRightLeft, Edit3, Minimize2, Cpu,
  Image as ImageIcon, Video, CheckCircle, X, ChevronRight
} from 'lucide-react';
import { TOOLS } from '../data/toolsData';
import { CATEGORIES_DATA } from '../data/categoriesData';

const iconComponentMap = {
  Layers, ArrowRightLeft, Edit3, ShieldCheck, Minimize2, Cpu, ImageIcon, Video, FileText
};

export default function Home() {
  const [selectedCatId, setSelectedCatId] = useState('pdf-organization');
  const [searchQuery, setSearchQuery]     = useState('');
  const [openFaq, setOpenFaq]             = useState(null);
  const explorerRef                       = useRef(null);

  // Selected Category Object
  const currentCategory = useMemo(() => {
    return CATEGORIES_DATA.find(c => c.id === selectedCatId) || CATEGORIES_DATA[0];
  }, [selectedCatId]);

  // Search Filtering with Category Path
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const results = [];
    CATEGORIES_DATA.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.toolIds.forEach(tId => {
          const tool = TOOLS.find(t => t.id === tId);
          if (tool) {
            const matches =
              tool.name.toLowerCase().includes(q) ||
              tool.shortDesc?.toLowerCase().includes(q) ||
              tool.description?.toLowerCase().includes(q) ||
              cat.name.toLowerCase().includes(q) ||
              sub.name.toLowerCase().includes(q) ||
              (tool.primaryKeywords || []).some(k => k.toLowerCase().includes(q));

            if (matches) {
              results.push({
                tool,
                categoryName: cat.name,
                subcategoryName: sub.name,
              });
            }
          }
        });
      });
    });
    return results;
  }, [searchQuery]);

  const scrollToExplorer = (catId) => {
    setSelectedCatId(catId);
    if (explorerRef.current) {
      explorerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      q: 'Are my files kept private and secure?',
      a: 'Yes, 100%. PDFora processes all files locally inside your browser memory sandbox using client-side WebAssembly and JavaScript engines. Your documents are never uploaded to remote server storage.'
    },
    {
      q: 'Is PDFora completely free to use?',
      a: 'Yes! There are no subscriptions, no registration required, no credit cards, and no hidden file count limits.'
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'PDFora supports files up to 50 MB per file, covering standard PDFs, Office documents, high-res photos, audio tracks, and videos.'
    },
    {
      q: 'Does it work on mobile phones and tablets?',
      a: 'Yes, PDFora is fully responsive and works directly inside modern mobile browsers on iOS and Android with zero app installation needed.'
    }
  ];

  return (
    <div className="min-h-screen pt-16 font-sans bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white transition-colors">
      <Helmet>
        <title>PDFora — All Your PDF &amp; Document Tools in One Place</title>
        <meta
          name="description"
          content="Free, fast, and 100% private online PDF platform. Organize, convert, edit, compress, and secure PDFs with clear category-based navigation."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/" />
      </Helmet>

      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="pt-12 pb-14 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Category-Organized PDF Platform · 100% Private In-Browser</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            All Your PDF &amp; File Tools <br className="hidden sm:inline" />
            <span className="text-purple-600 dark:text-purple-400">In One Place</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Easily discover tools organized by clear categories. Merge, convert, edit, compress, and secure documents directly inside your browser.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToExplorer(selectedCatId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25 transition-all cursor-pointer active:scale-95"
            >
              <span>Explore Categories &amp; Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#2A2E45] border border-zinc-200 dark:border-[#2A2E45] transition-all"
            >
              <span>Browse 8-Column Directory</span>
            </Link>
          </div>

          {/* Global Search Bar */}
          <div className="max-w-lg mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools or categories (e.g. merge, word to pdf, compress)..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-[#2A2E45] shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-[#141622] transition-all"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  type="button"
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

      {/* ── SEARCH RESULTS (IF SEARCHING) ─────────────────────────── */}
      {searchQuery.trim() ? (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span>Showing {searchResults.length} search results for "{searchQuery}":</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#141622] rounded-3xl border border-zinc-200 dark:border-[#2A2E45] p-8 space-y-3 max-w-md mx-auto">
              <Search className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">No tools found</h3>
              <p className="text-xs text-zinc-500">Try searching for terms like "Merge", "JPG", "Compress", or "Convert".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map(({ tool, categoryName, subcategoryName }) => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group flex flex-col justify-between p-5 bg-white dark:bg-[#141622] rounded-2xl border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider inline-block">
                      {categoryName} → {subcategoryName}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {tool.shortDesc || tool.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-[#2A2E45] text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ── 2. MAIN INTERFACE: CATEGORY CARDS ───────────────────── */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Select a Tool Category
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Choose a category below to explore dedicated tools.
              </p>
            </div>

            {/* 8 Primary Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {CATEGORIES_DATA.map(cat => {
                const Icon = iconComponentMap[cat.iconName] || Layers;
                const totalTools = cat.subcategories.reduce((acc, sub) => acc + sub.toolIds.length, 0);
                const isSelected = selectedCatId === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => scrollToExplorer(cat.id)}
                    className={`group cursor-pointer p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-600/20 scale-[1.02]'
                        : 'bg-white dark:bg-[#141622] border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900 group-hover:bg-purple-600 group-hover:text-white'
                      } transition-colors`}>
                        <Icon className="w-6 h-6" strokeWidth={2} />
                      </div>

                      <div>
                        <h3 className={`text-base font-extrabold ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                          {cat.name}
                        </h3>
                        <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {cat.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/20 dark:border-[#2A2E45] flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>
                        {totalTools} Tools Available
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. TOOL EXPLORER (CATEGORY → SUBCATEGORY → TOOLS) ───── */}
          <section ref={explorerRef} className="py-12 bg-white dark:bg-[#141622] border-t border-zinc-200 dark:border-[#2A2E45]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              {/* Category Explorer Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-[#2A2E45]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    <span>Tool Explorer</span>
                    <span>/</span>
                    <span className="text-zinc-900 dark:text-white">{currentCategory.name}</span>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                    {currentCategory.name} Tools
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentCategory.desc}</p>
                </div>

                {/* Switch Category Selector */}
                <select
                  value={selectedCatId}
                  onChange={e => setSelectedCatId(e.target.value)}
                  className="text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  {CATEGORIES_DATA.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategories Blocks */}
              <div className="space-y-10">
                {currentCategory.subcategories.map(sub => (
                  <div key={sub.id} className="space-y-4">
                    
                    {/* Subcategory Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      <div>
                        <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                          {sub.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub.desc}</p>
                      </div>
                    </div>

                    {/* Tool Cards inside Subcategory */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sub.toolIds.map(tId => {
                        const tool = TOOLS.find(t => t.id === tId);
                        if (!tool) return null;
                        const Icon = iconComponentMap[currentCategory.iconName] || FileText;

                        return (
                          <div
                            key={tool.id}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-[#1B1E2E]/60 border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-[#1B1E2E] transition-all flex flex-col justify-between space-y-4 group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                  Free
                                </span>
                              </div>

                              <div>
                                <h5 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {tool.name}
                                </h5>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mt-0.5">
                                  {tool.shortDesc || tool.description}
                                </p>
                              </div>
                            </div>

                            <Link
                              to={tool.path}
                              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-center text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <span>Launch {tool.name}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </section>
        </>
      )}

      {/* ── 4. TRUST & VALUE SECTION ─────────────────────────────── */}
      <section className="py-12 bg-zinc-50/80 dark:bg-[#0D0D14] border-t border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Why Use PDFora?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Designed for speed, privacy, and seamless usability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200/80 dark:border-[#2A2E45] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">100% Free &amp; Unlimited</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No credit cards, no subscriptions, and no paywalls. Process as many files as you need anytime.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200/80 dark:border-[#2A2E45] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">100% Private (In-Browser)</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your files are processed locally inside your web browser sandbox. Zero files are uploaded to servers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200/80 dark:border-[#2A2E45] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Fast &amp; Studio Quality</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Powered by native multi-threaded WebAssembly engines for instant conversion and original quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ SECTION ─────────────────────────────────────────── */}
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
