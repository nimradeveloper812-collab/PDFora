import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText, ChevronDown, Menu, X, Sparkles, ArrowRight,
  FileCheck, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Grid3x3,
  Music, FileVideo, RefreshCw
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

function NavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'text-blue-600 bg-blue-50 font-semibold'
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setIsToolsOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const pdfTools = TOOLS.filter(t => t.category === 'pdf');
  const documentTools = TOOLS.filter(t => t.category === 'documents');
  const mediaTools = TOOLS.filter(t => ['images', 'video', 'audio'].includes(t.category));
  const isToolsActive = location.pathname.startsWith('/tools');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md py-3 border-b border-zinc-200 shadow-xs'
            : 'bg-white/85 backdrop-blur-sm py-4 border-b border-zinc-100'
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
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 group-hover:scale-105 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                }}
              >
                <FileCheck className="w-5 h-5" strokeWidth={2.3} aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900">
                PDF<span className="text-blue-600">ora</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                100% PRIVATE
              </span>
            </Link>

            {/* ── Desktop Navigation ─────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              <NavLink to="/" isActive={location.pathname === '/'}>
                Home
              </NavLink>

              {/* Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="tools-menu-btn"
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  aria-haspopup="true"
                  aria-expanded={isToolsOpen}
                  aria-controls="tools-dropdown"
                  className={`px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1 transition-all duration-150 ${
                    isToolsActive || isToolsOpen
                      ? 'font-semibold text-blue-600 bg-blue-50'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <span>Tools Directory</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-250 ${isToolsOpen ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`}
                    aria-hidden="true"
                  />
                </button>

                {/* Mega Dropdown */}
                {isToolsOpen && (
                  <div
                    id="tools-dropdown"
                    role="menu"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[860px] bg-white rounded-2xl p-5 z-50 border border-zinc-200 shadow-xl animate-scale-in"
                  >
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        Directory of 19 Tools
                      </span>
                      <Link
                        to="/tools"
                        onClick={() => setIsToolsOpen(false)}
                        className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-blue-600 transition-colors"
                        role="menuitem"
                      >
                        Browse All Tools
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Column 1 — PDF Tools */}
                      <div>
                        <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          PDF Suite ({pdfTools.length})
                        </div>
                        <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
                          {pdfTools.map(tool => {
                            const Icon = iconMap[tool.iconName] || FileText;
                            return (
                              <Link
                                key={tool.id}
                                to={tool.path}
                                onClick={() => setIsToolsOpen(false)}
                                onMouseEnter={() => prefetchTool(tool.id)}
                                onFocus={() => prefetchTool(tool.id)}
                                role="menuitem"
                                className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-150 hover:bg-blue-50 group"
                              >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105">
                                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-zinc-800 group-hover:text-blue-600 truncate">
                                    {tool.name}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 2 — Document Tools */}
                      <div>
                        <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Word &amp; Documents ({documentTools.length})
                        </div>
                        <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
                          {documentTools.map(tool => {
                            const Icon = iconMap[tool.iconName] || FileText;
                            return (
                              <Link
                                key={tool.id}
                                to={tool.path}
                                onClick={() => setIsToolsOpen(false)}
                                onMouseEnter={() => prefetchTool(tool.id)}
                                onFocus={() => prefetchTool(tool.id)}
                                role="menuitem"
                                className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-150 hover:bg-blue-50 group"
                              >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105">
                                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-zinc-800 group-hover:text-blue-600 truncate">
                                    {tool.name}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 3 — Media & Images */}
                      <div>
                        <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Images, Video &amp; Audio ({mediaTools.length})
                        </div>
                        <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
                          {mediaTools.map(tool => {
                            const Icon = iconMap[tool.iconName] || FileText;
                            return (
                              <Link
                                key={tool.id}
                                to={tool.path}
                                onClick={() => setIsToolsOpen(false)}
                                onMouseEnter={() => prefetchTool(tool.id)}
                                onFocus={() => prefetchTool(tool.id)}
                                role="menuitem"
                                className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-150 hover:bg-blue-50 group"
                              >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105">
                                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-zinc-800 group-hover:text-blue-600 truncate">
                                    {tool.name}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/tools" isActive={location.pathname === '/tools'}>
                All Tools
              </NavLink>
              <NavLink to="/about" isActive={location.pathname === '/about'}>
                About
              </NavLink>
              <NavLink to="/contact" isActive={location.pathname === '/contact'}>
                Contact
              </NavLink>
            </nav>

            {/* ── Desktop CTA ────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 text-sm font-bold text-white rounded-xl px-4 py-2.5 bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-95"
              >
                <Grid3x3 className="w-4 h-4" aria-hidden="true" />
                <span>Explore Tools</span>
              </Link>
            </div>

            {/* ── Mobile Hamburger ───────────────────────────────── */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl transition-colors relative z-50 text-zinc-900"
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
          className="md:hidden fixed inset-x-0 bottom-0 bg-white overflow-y-auto z-40 border-t border-zinc-200"
          style={{
            top: scrolled ? '57px' : '65px',
          }}
        >
          <div className="px-4 pt-5 pb-8 space-y-2">
            {[
              { to: '/', label: 'Home' },
              { to: '/tools', label: 'All Tools (19)' },
              { to: '/about', label: 'About PDFora' },
              { to: '/contact', label: 'Contact Support' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  location.pathname === to ? 'text-blue-600 bg-blue-50' : 'text-zinc-800'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Quick Categories */}
            <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                  PDF Tools
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {pdfTools.slice(0, 6).map(t => (
                    <Link
                      key={t.id}
                      to={t.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs font-semibold text-zinc-700 py-1 truncate hover:text-blue-600"
                    >
                      • {t.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                  Document &amp; Media Tools
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[...documentTools, ...mediaTools].slice(0, 6).map(t => (
                    <Link
                      key={t.id}
                      to={t.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs font-semibold text-zinc-700 py-1 truncate hover:text-blue-600"
                    >
                      • {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                <Grid3x3 className="w-4 h-4" />
                <span>Explore All 19 Tools</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
