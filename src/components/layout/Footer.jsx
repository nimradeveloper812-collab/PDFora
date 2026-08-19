import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Lock, Zap, Heart } from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const pdfTools = TOOLS.filter(t => t.category === 'pdf');
const documentTools = TOOLS.filter(t => t.category === 'documents');
const imageTools = TOOLS.filter(t => t.category === 'images');
const mediaTools = TOOLS.filter(t => ['video', 'audio'].includes(t.category));

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 bg-white border-t border-zinc-200"
      role="contentinfo"
    >
      {/* ── Trust Banner ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-blue-50/60 border border-blue-200">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 border border-blue-200"
              aria-hidden="true"
            >
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                100% Private &amp; Secure In-Browser Processing
              </h3>
              <p className="text-xs mt-0.5 leading-relaxed max-w-xl text-zinc-500 font-medium">
                Document and image conversions run directly in your web browser memory with client-side WebAssembly. Zero file uploads or third-party storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-blue-200 pt-3 sm:pt-0 w-full sm:w-auto">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
              <Lock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              Client Sandbox
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
              <Zap className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              Zero Queue
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Link Grid ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="PDFora home"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                }}
              >
                <FileCheck className="w-4.5 h-4.5" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-900">
                PDF<span className="text-blue-600">ora</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed max-w-xs text-zinc-500 font-medium">
              Free, private online document and media toolkit. Convert, merge, split, compress, and edit files without registration.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <span>Engineered with</span>
              <Heart className="w-3 h-3 text-blue-600 fill-blue-600" aria-hidden="true" />
              <span>for users worldwide</span>
            </div>
          </div>

          {/* PDF Tools Column */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider mb-4 text-zinc-900">
              PDF Tools
            </h4>
            <ul className="space-y-2.5">
              {pdfTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-600 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Tools Column */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider mb-4 text-zinc-900">
              Word &amp; Docs
            </h4>
            <ul className="space-y-2.5">
              {documentTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-600 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools Column */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider mb-4 text-zinc-900">
              Image Tools
            </h4>
            <ul className="space-y-2.5">
              {imageTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-600 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Video & Audio Column */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider mb-4 text-zinc-900">
              Video &amp; Audio
            </h4>
            <ul className="space-y-2.5">
              {mediaTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-600 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Sub-Footer ───────────────────────────────────── */}
        <div className="pt-8 mt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {year} PDFora. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
