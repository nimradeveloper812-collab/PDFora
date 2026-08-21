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

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

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
        { name: "Remove Pages", path: "/remove-pages-pdf" },
        { name: "Extract Pages", path: "/extract-pages-pdf" },
        { name: "Organize PDF", path: "/organize-pdf" },
      ]
    },
    {
      title: "CONVERT TO PDF",
      color: "text-amber-600 dark:text-amber-400",
      items: [
        { name: "JPG to PDF", path: "/jpg-to-pdf" },
        { name: "Word to PDF", path: "/word-to-pdf" },
        { name: "PowerPoint to PDF", path: "/powerpoint-to-pdf" },
        { name: "Excel to PDF", path: "/excel-to-pdf" },
        { name: "HTML to PDF", path: "/html-to-pdf" },
        { name: "Scan to PDF", path: "/scan-to-pdf" },
      ]
    },
    {
      title: "CONVERT FROM PDF",
      color: "text-blue-600 dark:text-blue-400",
      items: [
        { name: "PDF to Word", path: "/pdf-to-word" },
        { name: "PDF to PowerPoint", path: "/pdf-to-powerpoint" },
        { name: "PDF to JPG", path: "/pdf-to-jpg" },
        { name: "PDF to Excel", path: "/pdf-to-excel" },
        { name: "PDF to PDF/A", path: "/pdf-to-pdfa" },
        { name: "PDF to Markdown", path: "/pdf-to-markdown" },
      ]
    },
    {
      title: "AI INTELLIGENCE",
      color: "text-purple-600 dark:text-purple-400",
      items: [
        { name: "Chat with PDF", path: "/chat-with-pdf" },
        { name: "AI Resume Reviewer", path: "/ai-resume-reviewer" },
        { name: "AI Summarizer", path: "/ai-pdf-summarizer" },
        { name: "Translate PDF", path: "/translate-pdf" },
        { name: "OCR PDF", path: "/ocr-pdf" },
      ]
    },
    {
      title: "IMAGE EDIT & BG",
      color: "text-indigo-600 dark:text-indigo-400",
      items: [
        { name: "Remove Background", path: "/image-background-remover" },
        { name: "Compress Image", path: "/image-compressor" },
        { name: "Redact PDF", path: "/redact-pdf" },
        { name: "Edit PDF", path: "/edit-pdf" },
        { name: "Sign PDF", path: "/sign-pdf" },
        { name: "Crop PDF", path: "/crop-pdf" },
      ]
    },
    {
      title: "IMAGE FORMATS",
      color: "text-emerald-600 dark:text-emerald-400",
      items: [
        { name: "JPG to PNG", path: "/image-converter" },
        { name: "PNG to JPG", path: "/image-converter" },
        { name: "WebP to PNG", path: "/image-converter" },
        { name: "HEIC to JPG", path: "/image-converter" },
        { name: "SVG to PNG", path: "/image-converter" },
      ]
    },
    {
      title: "DEV & MEDIA",
      color: "text-teal-600 dark:text-teal-400",
      items: [
        { name: "JSON to CSV", path: "/json-to-csv" },
        { name: "Base64 to PDF", path: "/base64-to-pdf" },
        { name: "PDF Metadata Editor", path: "/pdf-metadata-editor" },
        { name: "AI Table Extractor", path: "/ai-table-extractor" },
        { name: "Video to Audio", path: "/video-to-audio" },
        { name: "Video Compressor", path: "/video-compressor" },
      ]
    },
    {
      title: "PDF REPAIR & FORMS",
      color: "text-cyan-600 dark:text-cyan-400",
      items: [
        { name: "Repair PDF", path: "/repair-pdf" },
        { name: "Compare PDF", path: "/compare-pdf" },
        { name: "PDF Forms", path: "/pdf-forms" },
        { name: "Add Page Numbers", path: "/add-page-numbers-pdf" },
        { name: "Watermark PDF", path: "/watermark-pdf" },
        { name: "Unlock PDF", path: "/unlock-pdf" },
      ]
    }
  ];

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-150 ${
          scrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2 border-b border-zinc-200 dark:border-slate-800 shadow-xs'
            : 'bg-white dark:bg-slate-900 py-2.5 border-b border-zinc-200 dark:border-slate-800'
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
                  <span>All Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'mega' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* PDF Tools */}
              <Link
                to="/tools?category=pdf"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${
                  activeTab === 'pdf'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>PDF Tools</span>
              </Link>

              {/* Image Tools */}
              <Link
                to="/tools?category=images"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${
                  activeTab === 'images'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Image Tools</span>
              </Link>

              {/* Video & Audio */}
              <Link
                to="/tools?category=media"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${
                  activeTab === 'media'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileVideo className="w-3.5 h-3.5 text-purple-600" />
                <span>Video &amp; Audio</span>
              </Link>

              {/* Developer & AI */}
              <Link
                to="/tools?category=developer"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${
                  activeTab === 'developer'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-purple-600" />
                <span>Developer &amp; AI</span>
              </Link>

            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Quick Search Ctrl+K Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-700/80 text-zinc-500 dark:text-zinc-300 text-xs font-medium transition-all"
              >
                <Search className="w-3.5 h-3.5 text-purple-600" />
                <span>Search 48+ tools...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-slate-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 font-bold">
                  ⌘K
                </kbd>
              </button>

              <ThemeToggle />

              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md transition-colors text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-slate-800 lg:hidden"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Full 8-Column Mega Menu Overlay matching reference screenshot */}
        {activeDropdown === 'mega' && (
          <div
            onMouseLeave={() => setActiveDropdown(null)}
            className="absolute top-full left-0 right-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-b border-zinc-200 dark:border-slate-800 shadow-2xl p-6 z-50 animate-fade-in font-sans"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  All PDFora Tools Directory (8 Categories • 48 Tools)
                </span>
                <button
                  onClick={() => setActiveDropdown(null)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-xs">
                {megaColumns.map((col, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h5 className={`font-black text-[11px] uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </h5>
                    <ul className="space-y-1.5 font-medium text-zinc-700 dark:text-zinc-300">
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
