import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, Grid, FileText, Minimize2, Layers } from 'lucide-react';

export default function NotFound() {
  const topTools = [
    { to: '/word-to-pdf', label: 'Word to PDF', icon: FileText, desc: 'Convert DOCX files to PDF' },
    { to: '/compress-pdf', label: 'Compress PDF', icon: Minimize2, desc: 'Reduce PDF file size' },
    { to: '/merge-pdf', label: 'Merge PDF', icon: Layers, desc: 'Combine multiple PDFs' }
  ];

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -5%, #DBEAFE 0%, #FFFFFF 75%)'
      }}
    >
      <Helmet>
        <title>404 — Page Not Found | PDFora</title>
        <meta name="description" content="The requested page could not be found. Explore PDFora's 100% free online PDF conversion, compression, merging, and splitting tools." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Large 404 Visual Indicator */}
        <div
          className="text-8xl sm:text-9xl font-black leading-none select-none tracking-tight"
          style={{ color: '#BFDBFE' }}
          aria-hidden="true"
        >
          404
        </div>

        <div className="space-y-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
          >
            Error 404
          </span>
          <h1
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: '#0F172A', letterSpacing: '-0.025em' }}
          >
            Page Not Found
          </h1>
          <p
            className="text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: '#475569' }}
          >
            The link you clicked may be broken, or the page may have been relocated. You can navigate back home or explore our free tools below.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
              textDecoration: 'none'
            }}
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            to="/tools"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              color: '#334155',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              textDecoration: 'none'
            }}
          >
            <Grid className="w-4 h-4" />
            Browse All Tools
          </Link>
        </div>

        {/* Quick Shortcut Cards */}
        <div className="pt-8">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>
            Popular PDF Utilities
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {topTools.map(({ to, label, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className="p-3.5 rounded-xl transition-all duration-150 group block"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DBEAFE',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#DBEAFE';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#EFF6FF', color: '#2563EB' }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold truncate group-hover:text-blue-600" style={{ color: '#0F172A' }}>
                    {label}
                  </span>
                </div>
                <p className="text-[11px] leading-tight truncate" style={{ color: '#64748B' }}>
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
