import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileCheck, Layers, Scissors, Minimize2, FileText, Table,
  Presentation, Image as ImageIcon, FileImage, Sparkles,
  Music, FileVideo, RefreshCw, ChevronDown, Home as HomeIcon,
  ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react';
import { TOOLS, getToolTheme } from '../../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const [openSection, setOpenSection] = useState({
    pdf: true,
    convert: true,
    media: true
  });

  const toggleSection = (key) => {
    setOpenSection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pdfTools = TOOLS.filter(t => ['compress-pdf', 'merge-pdf', 'split-pdf', 'rotate-pdf', 'protect-pdf', 'unlock-pdf'].includes(t.id));
  const convertTools = TOOLS.filter(t => t.category === 'documents' || ['jpg-to-pdf', 'pdf-to-jpg', 'powerpoint-to-pdf'].includes(t.id));
  const mediaTools = TOOLS.filter(t => ['images', 'video', 'audio'].includes(t.category) && !['jpg-to-pdf', 'pdf-to-jpg'].includes(t.id));

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 w-60 shrink-0 font-sans">
      {/* ── Brand Logo Header ───────────────────────────────────── */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="flex items-center gap-2.5 group"
          aria-label="PDFora home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #6C3FFC 0%, #4B24C5 100%)',
            }}
          >
            <FileCheck className="w-4.5 h-4.5" strokeWidth={2.3} aria-hidden="true" />
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900 font-heading">
            PDF<span style={{ color: '#6C3FFC' }}>ora</span>
          </span>
        </Link>
      </div>

      {/* ── Navigation Tree ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        
        {/* Home & All Tools */}
        <div className="space-y-1">
          <Link
            to="/"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all font-display ${
              location.pathname === '/'
                ? 'bg-purple-50 text-purple-700 font-bold border border-purple-100'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <HomeIcon className="w-4 h-4 text-zinc-500" />
            <span>Application Home</span>
          </Link>

          <Link
            to="/tools"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all font-display ${
              location.pathname === '/tools'
                ? 'bg-purple-50 text-purple-700 font-bold border border-purple-100'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>All 19 Tools</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
              19
            </span>
          </Link>
        </div>



        {/* 1. PDF Suite */}
        <div>
          <button
            onClick={() => toggleSection('pdf')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-display hover:text-zinc-700"
          >
            <span>Organize PDF</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSection.pdf ? 'rotate-180' : ''}`} />
          </button>

          {openSection.pdf && (
            <div className="mt-1 space-y-0.5">
              {pdfTools.map(t => {
                const Icon = iconMap[t.iconName] || FileText;
                const isActive = location.pathname === t.path;
                return (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600' : 'text-zinc-400'}`} />
                    <span className="truncate">{t.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Convert PDF */}
        <div>
          <button
            onClick={() => toggleSection('convert')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-display hover:text-zinc-700"
          >
            <span>Convert PDF</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSection.convert ? 'rotate-180' : ''}`} />
          </button>

          {openSection.convert && (
            <div className="mt-1 space-y-0.5">
              {convertTools.map(t => {
                const Icon = iconMap[t.iconName] || FileText;
                const isActive = location.pathname === t.path;
                return (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600' : 'text-zinc-400'}`} />
                    <span className="truncate">{t.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Image & Media */}
        <div>
          <button
            onClick={() => toggleSection('media')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-display hover:text-zinc-700"
          >
            <span>Image &amp; Media</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSection.media ? 'rotate-180' : ''}`} />
          </button>

          {openSection.media && (
            <div className="mt-1 space-y-0.5">
              {mediaTools.map(t => {
                const Icon = iconMap[t.iconName] || FileText;
                const isActive = location.pathname === t.path;
                return (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600' : 'text-zinc-400'}`} />
                    <span className="truncate">{t.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Pages */}
        <div className="pt-2 border-t border-zinc-100 space-y-1">
          <Link
            to="/about"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="block px-2.5 py-1 text-xs text-zinc-500 hover:text-purple-700"
          >
            About PDFora
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="block px-2.5 py-1 text-xs text-zinc-500 hover:text-purple-700"
          >
            Contact Support
          </Link>
          <Link
            to="/privacy-policy"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="block px-2.5 py-1 text-xs text-zinc-500 hover:text-purple-700"
          >
            Privacy Policy
          </Link>
        </div>

      </div>

      {/* Footer Info inside Sidebar */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50 text-[10px] text-zinc-400 text-center font-display">
        PDFora In-Browser Engine v2.5
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 240px) */}
      <aside className="hidden lg:block fixed top-8 left-0 bottom-0 z-30 w-60">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-xs flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="relative w-64 max-w-full h-full bg-white"
            onClick={e => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
