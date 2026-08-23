import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, ChevronDown, Menu, X, Sparkles,
  FileCheck, Search, ArrowRight, ShieldCheck,
  Grid, Layers, Scissors, Code, Image as ImageIcon,
  Video, Lock, Edit3, Table, RefreshCw, FileVideo, Award
} from 'lucide-react';
import { TOOLS } from '../../data/toolsData';
import ThemeToggle from '../common/ThemeToggle';
import QuickSearchModal from '../common/QuickSearchModal';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine Active Category for Navigation Highlighting
  const getActiveTab = () => {
    const path = location.pathname;
    const search = location.search;

    if (path === '/tools' && search.includes('category=pdf')) return 'pdf';
    if (path === '/tools' && search.includes('category=images')) return 'images';
    if (path === '/tools' && search.includes('category=media')) return 'media';
    if (path === '/tools' && search.includes('category=developer')) return 'developer';

    const currentTool = TOOLS.find(t => t.path === path);
    if (currentTool) {
      if (currentTool.category === 'images') return 'images';
      if (currentTool.category === 'video' || currentTool.category === 'audio') return 'media';
      if (currentTool.badge === 'Developer Tool' || currentTool.badge === 'AI Feature' || currentTool.id.includes('json') || currentTool.id.includes('base64')) return 'developer';
      return 'pdf';
    }

    if (path === '/tools') return 'all';
    return null;
  };

  const activeTab = getActiveTab();

  // 8-Column Mega Menu Tool Categories matching reference layout
  const megaColumns = [
    {
      title: "ORGANIZE PDF",
      color: "text-rose-600 dark:text-rose-400",
      items: [
        { name: "Merge PDF", path: "/merge-pdf" },
        { name: "Split PDF", path: "/split-pdf" },
        { name: "Rotate PDF", path: "/rotate-pdf" },
        { name: "Protect PDF", path: "/protect-pdf" },
        { name: "Unlock PDF", path: "/unlock-pdf" },
      ]
    },
    {
      title: "CONVERT TO PDF",
      color: "text-amber-600 dark:text-amber-400",
      items: [
        { name: "JPG to PDF", path: "/jpg-to-pdf" },
        { name: "PNG to PDF", path: "/png-to-pdf" },
        { name: "Word to PDF", path: "/word-to-pdf" },
        { name: "PowerPoint to PDF", path: "/powerpoint-to-pdf" },
      ]
    },
    {
      title: "CONVERT FROM PDF",
      color: "text-blue-600 dark:text-blue-400",
      items: [
        { name: "PDF to Word", path: "/pdf-to-word" },
        { name: "PDF to PowerPoint", path: "/pdf-to-powerpoint" },
        { name: "PDF to JPG", path: "/pdf-to-jpg" },
        { name: "PDF to Text", path: "/pdf-to-text" },
      ]
    },
    {
      title: "OPTIMIZE & EXTRACT",
      color: "text-emerald-600 dark:text-emerald-400",
      items: [
        { name: "Compress PDF", path: "/compress-pdf" },
        { name: "PDF to PNG", path: "/pdf-to-png" },
        { name: "Compress to KB", path: "/compress-to-kb" },
        { name: "Compress Image", path: "/image-compressor" },
      ]
    },
    {
      title: "IMAGE EDIT & BG",
      color: "text-indigo-600 dark:text-indigo-400",
      items: [
        { name: "Remove Background", path: "/image-background-remover" },
        { name: "Change Background", path: "/change-background" },
        { name: "Resize Image", path: "/resize-image" },
        { name: "Crop Image", path: "/crop-image" },
      ]
    },
    {
      title: "PNG & SVG VECTOR",
      color: "text-cyan-600 dark:text-cyan-400",
      items: [
        { name: "HEIC to PNG", path: "/heic-to-png" },
        { name: "WebP to PNG", path: "/webp-to-png" },
        { name: "SVG to PNG", path: "/svg-to-png" },
        { name: "PNG to SVG", path: "/png-to-svg" },
      ]
    },
    {
      title: "JPG & FORMATS",
      color: "text-amber-600 dark:text-amber-400",
      items: [
        { name: "HEIC to JPG", path: "/heic-to-jpg" },
        { name: "BMP to JPG", path: "/bmp-to-jpg" },
        { name: "TIFF to JPG", path: "/tiff-to-jpg" },
        { name: "JFIF to JPEG", path: "/jfif-to-jpeg" },
      ]
    },
    {
      title: "DEV & VIDEO",
      color: "text-teal-600 dark:text-teal-400",
      items: [
        { name: "JSON Formatter", path: "/json-formatter" },
        { name: "QR Generator", path: "/qr-generator" },
        { name: "MP4 to MP3", path: "/video-to-audio" },
        { name: "Compress Video", path: "/video-compressor" },
      ]
    }
  ];

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

            {/* Header Tabs Navigation */}
            <nav className="hidden lg:flex items-center gap-1 font-display" role="navigation">
              
              {/* All Tools Mega Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'mega' ? null : 'mega')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDropdown === 'mega' || activeTab === 'all'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('allTools')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'mega' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* PDF Tools Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'pdf' ? null : 'pdf')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDropdown === 'pdf' || activeTab === 'pdf'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('pdfTools')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'pdf' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Image Tools Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'images' ? null : 'images')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDropdown === 'images' || activeTab === 'images'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('imageTools')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'images' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Video & Audio Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'media' ? null : 'media')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDropdown === 'media' || activeTab === 'media'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileVideo className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('mediaTools')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'media' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Developer & AI Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'developer' ? null : 'developer')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDropdown === 'developer' || activeTab === 'developer'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('developerAi')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'developer' ? 'rotate-180' : ''}`} />
                </button>
              </div>

            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Mobile Quick Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 sm:hidden transition-colors"
                aria-label="Search tools"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quick Search Ctrl+K Button (Desktop & Tablet) */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-700/80 text-zinc-500 dark:text-zinc-300 text-xs font-medium transition-all"
              >
                <Search className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('searchPlaceholder')}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-slate-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 font-bold">
                  ⌘K
                </kbd>
              </button>

              <LanguageSwitcher />
              <ThemeToggle />

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl transition-colors text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-slate-800 lg:hidden"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Dynamic Mobile Navigation Drawer (< lg screens) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] shadow-2xl p-4 max-h-[80vh] overflow-y-auto z-50 animate-fade-in font-sans">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-[#2A2E45]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-display">{t('language')}:</span>
                  <LanguageSwitcher />
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{t('searchPlaceholder')}</span>
                </span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-[#2A2E45] text-[10px] font-mono font-bold">
                  Search
                </kbd>
              </button>

              <div className="pt-2 border-t border-zinc-100 dark:border-[#2A2E45] space-y-1">
                <Link
                  to="/tools"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40"
                >
                  <span className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>All 48 Tools Directory</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {megaColumns.map((col, idx) => (
                  <div key={idx} className="pt-2">
                    <div className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pl-3 pt-1">
                      {col.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 truncate"
                        >
                          • {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-[#2A2E45] flex items-center justify-around text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-purple-600 dark:hover:text-purple-400">
                  About Us
                </Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-purple-600 dark:hover:text-purple-400">
                  Contact
                </Link>
                <Link to="/privacy-policy" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-purple-600 dark:hover:text-purple-400">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Categorized Mega Menu Overlay (Desktop >= lg) */}
        {activeDropdown && (
          <div
            onMouseLeave={() => setActiveDropdown(null)}
            className="hidden lg:block absolute top-full left-0 right-0 bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] shadow-2xl p-6 z-50 animate-fade-in font-sans"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  {activeDropdown === 'mega' && 'All PDFora Tools Directory (8 Categories)'}
                  {activeDropdown === 'pdf' && 'PDF Tools Suite (4 Categories)'}
                  {activeDropdown === 'images' && 'Image Tools & Formats Suite (3 Categories)'}
                  {activeDropdown === 'media' && 'Video & Audio Converter Suite'}
                  {activeDropdown === 'developer' && 'Developer & AI Intelligence Suite'}
                </span>
                <button
                  onClick={() => setActiveDropdown(null)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-xs">
                {megaColumns
                  .filter((_, idx) => {
                    if (activeDropdown === 'mega') return true;
                    if (activeDropdown === 'pdf') return [0, 1, 2, 3].includes(idx);
                    if (activeDropdown === 'images') return [4, 5, 6].includes(idx);
                    if (activeDropdown === 'media') return [7].includes(idx);
                    if (activeDropdown === 'developer') return [7, 3].includes(idx);
                    return true;
                  })
                  .map((col, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <h5 className={`font-black text-[11px] uppercase tracking-wider ${col.color}`}>
                        {col.title}
                      </h5>
                      <ul className="space-y-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                        {col.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              to={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="block hover:text-purple-600 dark:hover:text-purple-400 truncate transition-colors"
                            >
                              • {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
