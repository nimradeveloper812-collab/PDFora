import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText, ChevronDown, Menu, X, Sparkles,
  FileCheck, Table, Presentation, Image as ImageIcon,
  FileImage, Layers, Minimize2, Scissors, Music,
  FileVideo, RefreshCw, ShieldCheck, ArrowRight, Lock, Code
} from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
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

  const imageTools = TOOLS.filter(t => t.category === 'images' || t.id.includes('image') || t.id.includes('jpg'));
  const pdfTools = TOOLS.filter(t => t.category === 'pdf' || t.id.includes('pdf'));
  const mediaTools = TOOLS.filter(t => t.category === 'video' || t.category === 'audio' || t.id.includes('video') || t.id.includes('audio'));
  const docTools = TOOLS.filter(t => t.category === 'documents');

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-150 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md py-2 border-b border-zinc-200 shadow-xs'
          : 'bg-white py-2.5 border-b border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-12">

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
            <span className="text-2xl font-black tracking-tight text-zinc-900 font-heading">
              PDF<span style={{ color: '#6C3FFC' }}>ora</span>
            </span>
          </Link>

          {/* PDFora Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 font-display" role="navigation" aria-label="Main navigation">
            
            {/* Image Tools */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'image' ? null : 'image')}
                onMouseEnter={() => setActiveDropdown('image')}
                className="px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-purple-700 hover:bg-purple-50/70 inline-flex items-center gap-1 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Image Tools</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {activeDropdown === 'image' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl space-y-1 animate-fade-in"
                >
                  {imageTools.slice(0, 6).map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-zinc-800 hover:bg-purple-50 hover:text-purple-700"
                    >
                      • {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Tools */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'pdf' ? null : 'pdf')}
                onMouseEnter={() => setActiveDropdown('pdf')}
                className="px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-purple-700 hover:bg-purple-50/70 inline-flex items-center gap-1 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {activeDropdown === 'pdf' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl space-y-1 animate-fade-in"
                >
                  {pdfTools.slice(0, 6).map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-zinc-800 hover:bg-purple-50 hover:text-purple-700"
                    >
                      • {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Video & Audio Tools */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'video' ? null : 'video')}
                onMouseEnter={() => setActiveDropdown('video')}
                className="px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-purple-700 hover:bg-purple-50/70 inline-flex items-center gap-1 transition-all"
              >
                <FileVideo className="w-3.5 h-3.5 text-purple-600" />
                <span>Video &amp; Audio</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {activeDropdown === 'video' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl space-y-1 animate-fade-in"
                >
                  {mediaTools.map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-zinc-800 hover:bg-purple-50 hover:text-purple-700"
                    >
                      • {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Document Tools */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'doc' ? null : 'doc')}
                onMouseEnter={() => setActiveDropdown('doc')}
                className="px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-purple-700 hover:bg-purple-50/70 inline-flex items-center gap-1 transition-all"
              >
                <Code className="w-3.5 h-3.5 text-purple-600" />
                <span>Document Suite</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {activeDropdown === 'doc' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl p-3 z-50 border border-zinc-200 shadow-xl space-y-1 animate-fade-in"
                >
                  {docTools.map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-zinc-800 hover:bg-purple-50 hover:text-purple-700"
                    >
                      • {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                location.pathname === '/about' ? 'text-purple-700 bg-purple-50' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50/70'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                location.pathname === '/contact' ? 'text-purple-700 bg-purple-50' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50/70'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 font-display">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 text-xs font-bold text-white rounded-xl px-4 py-2.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              style={{ backgroundColor: '#6C3FFC' }}
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md transition-colors text-zinc-900 hover:bg-zinc-100"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>
    </header>
  );
}
