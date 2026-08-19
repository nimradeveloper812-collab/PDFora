import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText, ChevronDown, Menu, X, Sparkles,
  FileCheck, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Grid3x3,
  Music, FileVideo, RefreshCw, Lock
} from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw
};

const prefetchTool = (id) => {
  switch (id) {
    case 'word-to-pdf': import('../../pages/tools/WordToPdf'); break;
    case 'excel-to-pdf': import('../../pages/tools/ExcelToPdf'); break;
    case 'powerpoint-to-pdf': import('../../pages/tools/PowerPointToPdf'); break;
    case 'jpg-to-pdf': import('../../pages/tools/JpgToPdf'); break;
    case 'pdf-to-jpg': import('../../pages/tools/PdfToJpg'); break;
    case 'merge-pdf': import('../../pages/tools/MergePdf'); break;
    case 'compress-pdf': import('../../pages/tools/CompressPdf'); break;
    case 'split-pdf': import('../../pages/tools/SplitPdf'); break;
    case 'image-background-remover': import('../../pages/tools/ImageBackgroundRemover'); break;
    case 'image-compressor': import('../../pages/tools/ImageCompressor'); break;
    case 'pdf-to-word': import('../../pages/tools/PdfToWord'); break;
    case 'pdf-to-excel': import('../../pages/tools/PdfToExcel'); break;
    case 'excel-to-word': import('../../pages/tools/ExcelToWord'); break;
    case 'word-to-excel': import('../../pages/tools/WordToExcel'); break;
    case 'video-to-audio': import('../../pages/tools/VideoToAudio'); break;
    case 'audio-compressor': import('../../pages/tools/AudioCompressor'); break;
    case 'image-converter': import('../../pages/tools/ImageConverter'); break;
    case 'video-converter': import('../../pages/tools/VideoConverter'); break;
    case 'video-compressor': import('../../pages/tools/VideoCompressor'); break;
    default: break;
  }
};

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'pdf' | 'docs' | 'media' | null
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const pdfTools = TOOLS.filter(t => t.category === 'pdf');
  const documentTools = TOOLS.filter(t => t.category === 'documents');
  const mediaTools = TOOLS.filter(t => ['images', 'video', 'audio'].includes(t.category));

  return (
    <>
      {/* ── Top Announcement Bar ─────────────────────────────── */}
      <aside
        className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-[11px] font-semibold py-1.5 px-4 text-center tracking-tight flex items-center justify-center gap-2 shadow-xs"
        aria-label="Platform announcement"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-200" aria-hidden="true" />
          <span><strong>100% Free Online File Tools</strong> — No signup, no software installation, private in-browser processing</span>
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-blue-200">
          · <Lock className="w-3 h-3 inline" /> 100% Private Sandbox
        </span>
      </aside>

      {/* ── Main Sticky Header ───────────────────────────────── */}
      <header
        ref={navRef}
        className={`fixed top-[28px] left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md py-2.5 border-b border-zinc-200/90 shadow-sm'
            : 'bg-white/90 backdrop-blur-sm py-3.5 border-b border-zinc-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* ── Logo ───────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="PDFora — Home"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 group-hover:scale-105 shadow-md shadow-blue-500/25"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                }}
              >
                <FileCheck className="w-5 h-5" strokeWidth={2.3} aria-hidden="true" />
              </div>
              <span className="text-xl font-black tracking-tight text-zinc-900">
                PDF<span className="text-blue-600">ora</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                100% PRIVATE
              </span>
            </Link>

            {/* ── Desktop Navigation ─────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
              >
                Home
              </Link>

              {/* PDF Tools Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'pdf' ? null : 'pdf')}
                  onMouseEnter={() => setActiveDropdown('pdf')}
                  aria-expanded={activeDropdown === 'pdf'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all ${
                    activeDropdown === 'pdf'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70'
                  }`}
                >
                  <span>PDF Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'pdf' ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`}
                  />
                </button>

                {activeDropdown === 'pdf' && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl animate-scale-in"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2.5 py-1 mb-1 border-b border-zinc-100 flex items-center justify-between">
                      <span>PDF Suite</span>
                      <span className="text-blue-600 font-bold">{pdfTools.length} Tools</span>
                    </div>
                    <div className="space-y-0.5">
                      {pdfTools.map(t => {
                        const Icon = iconMap[t.iconName] || FileText;
                        return (
                          <Link
                            key={t.id}
                            to={t.path}
                            onClick={() => setActiveDropdown(null)}
                            onMouseEnter={() => prefetchTool(t.id)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50/80 transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 truncate">{t.name}</div>
                              <div className="text-[10px] text-zinc-400 truncate">{t.shortDesc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Tools Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'docs' ? null : 'docs')}
                  onMouseEnter={() => setActiveDropdown('docs')}
                  aria-expanded={activeDropdown === 'docs'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all ${
                    activeDropdown === 'docs'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70'
                  }`}
                >
                  <span>Word &amp; Docs</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'docs' ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`}
                  />
                </button>

                {activeDropdown === 'docs' && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl animate-scale-in"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2.5 py-1 mb-1 border-b border-zinc-100 flex items-center justify-between">
                      <span>Document Conversion</span>
                      <span className="text-blue-600 font-bold">{documentTools.length} Tools</span>
                    </div>
                    <div className="space-y-0.5">
                      {documentTools.map(t => {
                        const Icon = iconMap[t.iconName] || FileText;
                        return (
                          <Link
                            key={t.id}
                            to={t.path}
                            onClick={() => setActiveDropdown(null)}
                            onMouseEnter={() => prefetchTool(t.id)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50/80 transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 truncate">{t.name}</div>
                              <div className="text-[10px] text-zinc-400 truncate">{t.shortDesc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Image & Media Tools Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'media' ? null : 'media')}
                  onMouseEnter={() => setActiveDropdown('media')}
                  aria-expanded={activeDropdown === 'media'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all ${
                    activeDropdown === 'media'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70'
                  }`}
                >
                  <span>Images &amp; Media</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'media' ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`}
                  />
                </button>

                {activeDropdown === 'media' && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-1.5 w-84 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl animate-scale-in"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-2.5 py-1 mb-1 border-b border-zinc-100 flex items-center justify-between">
                      <span>Images, Video &amp; Audio</span>
                      <span className="text-blue-600 font-bold">{mediaTools.length} Tools</span>
                    </div>
                    <div className="space-y-0.5">
                      {mediaTools.map(t => {
                        const Icon = iconMap[t.iconName] || FileText;
                        return (
                          <Link
                            key={t.id}
                            to={t.path}
                            onClick={() => setActiveDropdown(null)}
                            onMouseEnter={() => prefetchTool(t.id)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50/80 transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 truncate">{t.name}</div>
                              <div className="text-[10px] text-zinc-400 truncate">{t.shortDesc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/tools"
                className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                  location.pathname === '/tools'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
              >
                <span>All Tools</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">
                  {TOOLS.length}
                </span>
              </Link>
            </nav>

            {/* ── Desktop CTA ────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 text-xs font-bold text-white rounded-xl px-4 py-2.5 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Grid3x3 className="w-4 h-4" />
                <span>Explore All 19 Tools</span>
              </Link>
            </div>

            {/* ── Mobile Hamburger ───────────────────────────────── */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl transition-colors relative z-50 text-zinc-900 hover:bg-zinc-100"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMobileMenuOpen
                ? <X className="w-5 h-5" aria-hidden="true" />
                : <Menu className="w-5 h-5" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ───────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
          className="lg:hidden fixed inset-x-0 bottom-0 bg-white overflow-y-auto z-40 border-t border-zinc-200 shadow-2xl"
          style={{
            top: '88px',
          }}
        >
          <div className="px-4 pt-4 pb-10 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-bold text-zinc-800 hover:bg-zinc-50"
            >
              Home
            </Link>

            <Link
              to="/tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-blue-600 bg-blue-50"
            >
              <span>Explore All Tools</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                19 Tools
              </span>
            </Link>

            {/* Mobile Category Collapsible Accordions */}
            <div className="space-y-1.5 pt-2">
              
              {/* PDF Category */}
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <button
                  onClick={() => setMobileCategoryOpen(mobileCategoryOpen === 'pdf' ? null : 'pdf')}
                  className="w-full px-4 py-3 text-left font-bold text-xs text-zinc-900 flex items-center justify-between bg-zinc-50"
                >
                  <span>PDF Suite ({pdfTools.length})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen === 'pdf' ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`} />
                </button>
                {mobileCategoryOpen === 'pdf' && (
                  <div className="p-2 space-y-1 bg-white">
                    {pdfTools.map(t => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        • {t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents Category */}
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <button
                  onClick={() => setMobileCategoryOpen(mobileCategoryOpen === 'docs' ? null : 'docs')}
                  className="w-full px-4 py-3 text-left font-bold text-xs text-zinc-900 flex items-center justify-between bg-zinc-50"
                >
                  <span>Word &amp; Documents ({documentTools.length})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen === 'docs' ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`} />
                </button>
                {mobileCategoryOpen === 'docs' && (
                  <div className="p-2 space-y-1 bg-white">
                    {documentTools.map(t => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        • {t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Category */}
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <button
                  onClick={() => setMobileCategoryOpen(mobileCategoryOpen === 'media' ? null : 'media')}
                  className="w-full px-4 py-3 text-left font-bold text-xs text-zinc-900 flex items-center justify-between bg-zinc-50"
                >
                  <span>Images &amp; Media ({mediaTools.length})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen === 'media' ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`} />
                </button>
                {mobileCategoryOpen === 'media' && (
                  <div className="p-2 space-y-1 bg-white">
                    {mediaTools.map(t => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        • {t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Static links */}
            <div className="pt-3 border-t border-zinc-200 space-y-1">
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-blue-600"
              >
                About PDFora
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-blue-600"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
