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
    <div className="min-h-screen pt-14 font-sans bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white transition-colors">
      <Helmet>
        <title>PDFora — All Your PDF &amp; Document Tools in One Place</title>
        <meta
          name="description"
          content="Free, fast, and 100% private online PDF platform. Organize, convert, edit, compress, and secure PDFs with clear category-based navigation."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/" />
      </Helmet>

      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="pt-5 pb-6 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Free · Private · In-Browser</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            All Your PDF &amp; File Tools{' '}
            <span className="text-purple-600 dark:text-purple-400">In One Place</span>
          </h1>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
            Merge, convert, edit, compress, and secure documents directly in your browser. No uploads needed.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => scrollToExplorer(selectedCatId)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer active:scale-95"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#1B1E2E] hover:bg-zinc-200 dark:hover:bg-[#2A2E45] border border-zinc-200 dark:border-[#2A2E45] transition-all"
            >
              <span>View All Tools</span>
            </Link>
          </div>

          {/* Global Search Bar */}
          <div className="max-w-sm mx-auto">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools (merge, compress, jpg)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-[#2A2E45] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-[#141622] transition-all"
                aria-label="Search tools"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS ─────────────────────────── */}
      {searchQuery.trim() ? (
        <section className="py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span>{searchResults.length} results for "{searchQuery}"</span>
            <button onClick={() => setSearchQuery('')} className="text-purple-600 dark:text-purple-400 hover:underline">
              Clear
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-[#141622] rounded-xl border border-zinc-200 dark:border-[#2A2E45] p-5 space-y-1.5 max-w-sm mx-auto">
              <Search className="w-6 h-6 text-zinc-400 mx-auto" />
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white">No tools found</h3>
              <p className="text-[10px] text-zinc-500">Try "Merge", "JPG", "Compress", or "Convert".</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {searchResults.map(({ tool, categoryName, subcategoryName }) => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group flex flex-col justify-between p-3 bg-white dark:bg-[#141622] rounded-xl border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 hover:shadow-md transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase inline-block truncate max-w-full">
                      {subcategoryName}
                    </span>
                    <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {tool.shortDesc || tool.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-zinc-100 dark:border-[#2A2E45] text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    <span>Open</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ── 2. CATEGORY CARDS ───────────────────── */}
          <section className="py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3">
            <h2 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight text-center">
              Tool Categories
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {CATEGORIES_DATA.map(cat => {
                const Icon = iconComponentMap[cat.iconName] || Layers;
                const totalTools = cat.subcategories.reduce((acc, sub) => acc + sub.toolIds.length, 0);
                const isSelected = selectedCatId === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => scrollToExplorer(cat.id)}
                    className={`group cursor-pointer p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                        : 'bg-white dark:bg-[#141622] border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900 group-hover:bg-purple-600 group-hover:text-white'
                      } transition-colors`}>
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                          {cat.name}
                        </h3>
                        <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/20 dark:border-[#2A2E45] flex items-center justify-between">
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>
                        {totalTools} Tools
                      </span>
                      <ChevronRight className={`w-3 h-3 group-hover:translate-x-1 transition-transform ${isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. TOOL EXPLORER ────────────────────── */}
          <section ref={explorerRef} className="py-5 bg-white dark:bg-[#141622] border-t border-zinc-200 dark:border-[#2A2E45]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-[#2A2E45]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    <span>Tool Explorer</span><span>/</span>
                    <span className="text-zinc-900 dark:text-white">{currentCategory.name}</span>
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">{currentCategory.name} Tools</h3>
                </div>
                <select
                  value={selectedCatId}
                  onChange={e => setSelectedCatId(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  {CATEGORIES_DATA.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-5">
                {currentCategory.subcategories.map(sub => (
                  <div key={sub.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">{sub.name}</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{sub.desc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {sub.toolIds.map(tId => {
                        const tool = TOOLS.find(t => t.id === tId);
                        if (!tool) return null;
                        const Icon = iconComponentMap[currentCategory.iconName] || FileText;
                        return (
                          <div
                            key={tool.id}
                            className="p-3 rounded-xl bg-zinc-50/70 dark:bg-[#1B1E2E]/60 border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 hover:bg-white dark:hover:bg-[#1B1E2E] transition-all flex flex-col justify-between space-y-2 group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <h5 className="text-[11px] font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors leading-tight">
                                {tool.name}
                              </h5>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {tool.shortDesc || tool.description}
                              </p>
                            </div>
                            <Link
                              to={tool.path}
                              className="w-full py-1.5 rounded-lg text-[10px] font-bold text-center text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-1"
                            >
                              Launch <ArrowRight className="w-2.5 h-2.5" />
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

      {/* ── 4. TRUST SECTION ─────────────────── */}
      <section className="py-5 bg-zinc-50/80 dark:bg-[#0D0D14] border-t border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <h2 className="text-sm font-black text-zinc-900 dark:text-white text-center">Why PDFora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              { icon: CheckCircle, color: 'emerald', title: '100% Free', desc: 'No sign-up, no subscriptions, no limits.' },
              { icon: ShieldCheck, color: 'purple', title: 'Private', desc: 'Files stay in your browser. Nothing uploaded.' },
              { icon: Zap, color: 'blue', title: 'Fast', desc: 'Instant processing via WebAssembly engine.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-3.5 rounded-xl bg-white dark:bg-[#141622] border border-zinc-200/80 dark:border-[#2A2E45] flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${color}-50 dark:bg-${color}-950/60 text-${color}-600 dark:text-${color}-400 flex items-center justify-center border border-${color}-100 dark:border-${color}-900 shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ SECTION ─────────────────── */}
      <section className="py-5 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Everything you need to know about PDFora</p>
        </div>
        <div className="space-y-1.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all overflow-hidden bg-white dark:bg-[#141622] ${
                  isOpen ? 'border-purple-500 shadow-sm' : 'border-zinc-200 dark:border-[#2A2E45]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-xs font-bold ${isOpen ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-white'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-purple-600' : 'text-zinc-400'}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 pt-1 text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-[#2A2E45]">
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
