import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, ChevronDown, Menu, X, Sparkles,
  FileCheck, Search, ArrowRight, Grid, ChevronRight
} from 'lucide-react';
import { TOOLS } from '../../data/toolsData';
import { CATEGORIES_DATA } from '../../data/categoriesData';
import ThemeToggle from '../common/ThemeToggle';
import QuickSearchModal from '../common/QuickSearchModal';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function Header() {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]       = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat]     = useState(null);
  const [isSearchOpen, setIsSearchOpen]               = useState(false);
  const [scrolled, setScrolled]                       = useState(false);

  const navRef   = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t }    = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsToolsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-150 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0D0D14]/95 backdrop-blur-md py-2 border-b border-zinc-200 dark:border-[#2A2E45] shadow-xs'
            : 'bg-white dark:bg-[#0D0D14] py-2.5 border-b border-zinc-200 dark:border-[#2A2E45]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-12">

            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="PDFora home"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #6C3FFC 0%, #4B24C5 100%)',
                }}
              >
                <FileCheck className="w-5 h-5" strokeWidth={2.3} aria-hidden="true" />
              </div>
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white font-heading">
                PDF<span style={{ color: '#6C3FFC' }}>ora</span>
              </span>
            </Link>

            {/* Header Main Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 font-display" role="navigation">
              
              <Link
                to="/"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Home
              </Link>

              {/* Tools ▼ Mega Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    isToolsDropdownOpen
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tools &amp; Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <Link
                to="/tools"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                All Tools Directory
              </Link>

              <Link
                to="/about"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                About
              </Link>

              <Link
                to="/contact"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Support
              </Link>

            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Quick Search Button (Desktop & Tablet) */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 text-xs font-medium transition-all"
              >
                <Search className="w-3.5 h-3.5 text-purple-600" />
                <span>Search tools...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 font-bold">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Quick Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-zinc-800 sm:hidden transition-colors"
                aria-label="Search tools"
              >
                <Search className="w-5 h-5" />
              </button>

              <LanguageSwitcher />
              <ThemeToggle />

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl transition-colors text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800 lg:hidden"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Category-Structured Desktop Dropdown ───────────────────────── */}
        {isToolsDropdownOpen && (
          <div
            onMouseLeave={() => setIsToolsDropdownOpen(false)}
            className="hidden lg:block absolute top-full left-0 right-0 bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] shadow-2xl p-6 z-50 animate-fade-in font-sans"
          >
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  <span>Category → Subcategory → Tool Directory</span>
                </span>
                <button
                  onClick={() => setIsToolsDropdownOpen(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-6 text-xs">
                {CATEGORIES_DATA.map((cat) => {
                  const isAiCat = cat.id === 'pdf-ai';
                  return (
                    <div
                      key={cat.id}
                      className={`space-y-3 p-3 rounded-2xl border transition-all ${
                        isAiCat
                          ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-xs'
                          : 'bg-zinc-50/70 dark:bg-[#1B1E2E]/50 border-zinc-100 dark:border-[#2A2E45]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isAiCat ? 'bg-purple-600 animate-pulse' : 'bg-purple-600'}`} />
                          <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                            {cat.name}
                          </h4>
                        </div>
                        {isAiCat && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-600 text-white">
                            AI
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              {sub.name}
                            </p>
                            <ul className="space-y-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-1.5 border-l border-zinc-200 dark:border-zinc-700">
                              {sub.toolIds.map((tId) => {
                                const tool = TOOLS.find(t => t.id === tId);
                                if (!tool) return null;
                                return (
                                  <li key={tool.id}>
                                    <Link
                                      to={tool.path}
                                      onClick={() => setIsToolsDropdownOpen(false)}
                                      className="block hover:text-purple-600 dark:hover:text-purple-400 truncate transition-colors py-0.5"
                                    >
                                      • {tool.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Category Accordion Mobile Navigation Drawer ────────────────── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] shadow-2xl p-4 max-h-[85vh] overflow-y-auto z-50 animate-fade-in font-sans space-y-4">
            
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                <span>Search tools...</span>
              </span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-[#2A2E45] text-[10px] font-mono font-bold">Search</kbd>
            </button>

            <div className="space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                Tool Categories
              </p>

              {CATEGORIES_DATA.map((cat) => {
                const isExpanded = mobileExpandedCat === cat.id;
                const totalTools = cat.subcategories.reduce((acc, sub) => acc + sub.toolIds.length, 0);

                return (
                  <div key={cat.id} className="rounded-2xl border border-zinc-200 dark:border-[#2A2E45] overflow-hidden bg-zinc-50/50 dark:bg-[#1B1E2E]/40">
                    <button
                      type="button"
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between font-bold text-xs text-zinc-900 dark:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-extrabold">•</span>
                        <span>{cat.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {totalTools} Tools
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 space-y-3 border-t border-zinc-200/60 dark:border-[#2A2E45] bg-white dark:bg-[#141622]">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              {sub.name}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 pl-2">
                              {sub.toolIds.map((tId) => {
                                const tool = TOOLS.find(t => t.id === tId);
                                if (!tool) return null;
                                return (
                                  <Link
                                    key={tool.id}
                                    to={tool.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 truncate"
                                  >
                                    • {tool.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-[#2A2E45] flex items-center justify-around text-xs font-bold text-zinc-600 dark:text-zinc-300">
              <Link to="/tools" onClick={() => setIsMobileMenuOpen(false)}>All Directory</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Support</Link>
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
