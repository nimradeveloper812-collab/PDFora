import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, Grid, FileText, Minimize2, Layers, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const topTools = [
    { to: '/pdf-to-word', label: 'PDF to Word', icon: FileText, desc: 'Convert PDF to editable DOCX' },
    { to: '/compress-pdf', label: 'Compress PDF', icon: Minimize2, desc: 'Reduce PDF file size' },
    { to: '/merge-pdf', label: 'Merge PDF', icon: Layers, desc: 'Combine multiple PDFs' }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-16 pt-24 font-sans bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white transition-colors">
      <Helmet>
        <title>404 — Page Not Found | PDFora</title>
        <meta name="description" content="The requested page could not be found. Explore PDFora's 100% free online PDF conversion, compression, merging, and splitting tools." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Large 404 Visual Indicator */}
        <div
          className="text-8xl sm:text-9xl font-black leading-none select-none tracking-tight text-purple-200 dark:text-purple-950/80"
          aria-hidden="true"
        >
          404
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed max-w-md mx-auto text-zinc-500 dark:text-zinc-400">
            The link you clicked may be broken, or the page may have been relocated. You can navigate back home or explore our free tools below.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            to="/tools"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:bg-zinc-100 dark:hover:bg-[#1B1E2E] transition-all"
          >
            <Grid className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Browse All Tools
          </Link>
        </div>

        {/* Quick Shortcut Cards */}
        <div className="pt-6">
          <p className="text-xs font-bold uppercase tracking-wider mb-3 text-zinc-400 dark:text-zinc-500">
            Popular Tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {topTools.map(({ to, label, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all group block"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold truncate text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {label}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">
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
