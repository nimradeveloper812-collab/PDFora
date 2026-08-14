import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText, ChevronDown, Menu, X, Sparkles, ArrowRight,
  FileCheck, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Grid3x3
} from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors
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
    default: break;
  }
};

// Individual nav link component
function NavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'text-blue-600 bg-blue-50 font-semibold nav-active-indicator'
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
      }`}
      style={isActive ? { color: '#3B82F6', backgroundColor: '#DBEAFE' } : {}}
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

  // Scroll listener for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [location.pathname]);

  // Body scroll lock when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close mobile menu / dropdown
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

  const convertTools = TOOLS.filter(t => t.category.startsWith('convert'));
  const otherTools  = TOOLS.filter(t => !t.category.startsWith('convert'));
  const isToolsActive = location.pathname.startsWith('/tools');

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md py-3'
          : 'bg-white/85 backdrop-blur-sm py-4'
      }`}
      style={{
        borderBottom: scrolled
          ? '1px solid #BFDBFE'
          : '1px solid rgba(241, 213, 227, 0.4)',
        boxShadow: scrolled ? '0 1px 16px rgba(59, 130, 246, 0.06)' : 'none',
      }}
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
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.30)',
              }}
            >
              <FileCheck className="w-5 h-5" strokeWidth={2.3} aria-hidden="true" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: '#18181B', letterSpacing: '-0.03em' }}>
              PDF<span style={{ color: '#3B82F6' }}>ora</span>
            </span>
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
              aria-label="Pakistan's free tool"
            >
              <span>🇵🇰</span>
              <span>PAKISTAN</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" role="navigation" aria-label="Main navigation">

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
                    ? 'font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
                style={
                  isToolsActive || isToolsOpen
                    ? { color: '#3B82F6', backgroundColor: '#DBEAFE' }
                    : {}
                }
              >
                <span>PDF Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-250 ${isToolsOpen ? 'rotate-180' : ''}`}
                  style={{ color: isToolsOpen ? '#3B82F6' : '#A1A1AA' }}
                  aria-hidden="true"
                />
              </button>

              {/* Mega Dropdown */}
              {isToolsOpen && (
                <div
                  id="tools-dropdown"
                  role="menu"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[660px] bg-white rounded-2xl p-5 z-50 animate-slide-in-top"
                  style={{
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 20px 48px rgba(59, 130, 246, 0.12), 0 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid #F9F0F5' }}>
                    <span
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: '#3B82F6' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      PDF Tool Suite
                    </span>
                    <Link
                      to="/tools"
                      onClick={() => setIsToolsOpen(false)}
                      className="flex items-center gap-1 text-xs font-semibold transition-colors hover:underline group/link"
                      style={{ color: '#71717A' }}
                      role="menuitem"
                    >
                      View All {TOOLS.length} Tools
                      <ArrowRight
                        className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left — Convert */}
                    <div>
                      <div
                        className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: '#A1A1AA' }}
                      >
                        Convert PDF
                      </div>
                      <div className="space-y-0.5">
                        {convertTools.slice(0, 4).map(tool => {
                          const Icon = iconMap[tool.iconName] || FileText;
                          return (
                            <Link
                              key={tool.id}
                              to={tool.path}
                              onClick={() => setIsToolsOpen(false)}
                              onMouseEnter={() => prefetchTool(tool.id)}
                              onFocus={() => prefetchTool(tool.id)}
                              onTouchStart={() => prefetchTool(tool.id)}
                              role="menuitem"
                              className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 group/item hover:bg-blue-50"
                              style={{ textDecoration: 'none' }}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 group-hover/item:scale-105"
                                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                              >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <div
                                  className="text-xs font-semibold transition-colors group-hover/item:text-blue-600 truncate"
                                  style={{ color: '#18181B' }}
                                >
                                  {tool.name}
                                </div>
                                <p
                                  className="text-[11px] truncate mt-0.5"
                                  style={{ color: '#A1A1AA' }}
                                >
                                  {tool.shortDesc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right — Organize & Optimize */}
                    <div>
                      <div
                        className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: '#A1A1AA' }}
                      >
                        Edit &amp; Optimize
                      </div>
                      <div className="space-y-0.5">
                        {[...otherTools, ...convertTools.slice(4)].map(tool => {
                          const Icon = iconMap[tool.iconName] || FileText;
                          return (
                            <Link
                              key={tool.id}
                              to={tool.path}
                              onClick={() => setIsToolsOpen(false)}
                              onMouseEnter={() => prefetchTool(tool.id)}
                              onFocus={() => prefetchTool(tool.id)}
                              onTouchStart={() => prefetchTool(tool.id)}
                              role="menuitem"
                              className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 group/item hover:bg-blue-50"
                              style={{ textDecoration: 'none' }}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 group-hover/item:scale-105"
                                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                              >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <div
                                  className="text-xs font-semibold transition-colors group-hover/item:text-blue-600 truncate"
                                  style={{ color: '#18181B' }}
                                >
                                  {tool.name}
                                </div>
                                <p
                                  className="text-[11px] truncate mt-0.5"
                                  style={{ color: '#A1A1AA' }}
                                >
                                  {tool.shortDesc}
                                </p>
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
              className="inline-flex items-center gap-2 text-sm font-bold text-white rounded-xl px-4 py-2.5 transition-all duration-200 hover:shadow-lg active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.30)',
                textDecoration: 'none',
              }}
            >
              <Grid3x3 className="w-4 h-4" aria-hidden="true" />
              <span>Explore Tools</span>
            </Link>
          </div>

          {/* ── Mobile Hamburger ───────────────────────────────── */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl transition-colors duration-150 relative z-50 cursor-pointer touch-manipulation"
            style={{
              color: '#18181B',
              background: isMobileMenuOpen ? '#DBEAFE' : 'transparent',
            }}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMobileMenuOpen
              ? <X className="w-5 h-5 pointer-events-none" aria-hidden="true" />
              : <Menu className="w-5 h-5 pointer-events-none" aria-hidden="true" />
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
          className="md:hidden fixed inset-x-0 bottom-0 bg-white overflow-y-auto mobile-nav-enter"
          style={{
            top: scrolled ? '57px' : '65px',
            borderTop: '1px solid #BFDBFE',
            zIndex: 40,
          }}
        >
          <div className="px-4 pt-5 pb-8 space-y-1">

            {/* Primary Nav Links */}
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About PDFora' },
              { to: '/contact', label: 'Contact Support' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150"
                style={{
                  color: location.pathname === to ? '#3B82F6' : '#18181B',
                  background: location.pathname === to ? '#DBEAFE' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}

            {/* All Tools Link */}
            <Link
              to="/tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150"
              style={{
                color: location.pathname === '/tools' ? '#3B82F6' : '#18181B',
                background: location.pathname === '/tools' ? '#DBEAFE' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <span>All PDF Tools</span>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
              >
                {TOOLS.length} Tools
              </span>
            </Link>

            {/* Quick Tool Links */}
            <div
              className="mx-1 mt-3 p-4 rounded-2xl space-y-4"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
                  style={{ color: '#3B82F6' }}
                >
                  Popular Converters
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {convertTools.slice(0, 4).map(t => (
                    <Link
                      key={t.id}
                      to={t.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ color: '#3F3F46', textDecoration: 'none' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#3B82F6' }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #BFDBFE', paddingTop: '0.75rem' }}>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
                  style={{ color: '#3B82F6' }}
                >
                  Edit &amp; Organize
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {otherTools.map(t => (
                    <Link
                      key={t.id}
                      to={t.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ color: '#3F3F46', textDecoration: 'none' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#3B82F6' }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="pt-4">
              <Link
                to="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.28)',
                  textDecoration: 'none',
                }}
              >
                <Grid3x3 className="w-4 h-4" aria-hidden="true" />
                <span>Explore All Tools</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
