import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Globe } from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const pdfTools = TOOLS.filter(t => t.category === 'pdf');
const documentTools = TOOLS.filter(t => t.category === 'documents');
const imageTools = TOOLS.filter(t => t.category === 'images');
const mediaTools = TOOLS.filter(t => ['video', 'audio'].includes(t.category));

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 border-t border-zinc-200"
      style={{ backgroundColor: '#FAFAFC' }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="PDFora home"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                }}
              >
                <FileCheck className="w-4.5 h-4.5" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 font-heading">
                PDF<span style={{ color: '#4F46E5' }}>ora</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed max-w-xs text-zinc-600 font-sans">
              Free, private online document and media toolkit. Convert, merge, split, compress, and edit files in your browser with zero server file logging.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 pt-1 font-display">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>In-Browser WebAssembly Sandbox</span>
            </div>
          </div>

          {/* PDF Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 font-display">
              PDF Suite
            </h4>
            <ul className="space-y-2">
              {pdfTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 hover:text-indigo-700 transition-colors font-sans"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 font-display">
              Convert &amp; Edit
            </h4>
            <ul className="space-y-2">
              {documentTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 hover:text-indigo-700 transition-colors font-sans"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 font-display">
              Image Tools
            </h4>
            <ul className="space-y-2">
              {imageTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 hover:text-indigo-700 transition-colors font-sans"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Media & Company Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 font-display">
              Media &amp; Company
            </h4>
            <ul className="space-y-2">
              {mediaTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 hover:text-indigo-700 transition-colors font-sans"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/about" className="text-xs text-zinc-600 hover:text-indigo-700 transition-colors font-sans">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-zinc-600 hover:text-indigo-700 transition-colors font-sans">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-sans">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span>© {year} PDFora. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-indigo-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-indigo-700 transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="hover:text-indigo-700 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-indigo-700 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
