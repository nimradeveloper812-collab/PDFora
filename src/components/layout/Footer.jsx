import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Globe } from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const pdfTools = TOOLS.filter(t => t.category === 'pdf');
const documentTools = TOOLS.filter(t => t.category === 'documents');
const imageTools = TOOLS.filter(t => t.category === 'images');
const mediaTools = TOOLS.filter(t => ['video', 'audio'].includes(t.category));
const devTools = TOOLS.filter(t => t.badge === 'Developer Tool' || t.badge === 'AI Feature' || t.id.includes('json') || t.id.includes('base64') || t.id.includes('qr') || t.id.includes('chat') || t.id.includes('resume') || t.id.includes('table'));

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 border-t border-zinc-200 dark:border-[#2A2E45] bg-[#F8FAFC] dark:bg-[#0D0D14] transition-colors"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand Column */}
          <div className="sm:col-span-2 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="PDFora home"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #6C3FFC 0%, #4B24C5 100%)',
                }}
              >
                <FileCheck className="w-4.5 h-4.5" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-heading">
                PDF<span style={{ color: '#6C3FFC' }}>ora</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed max-w-xs text-zinc-600 dark:text-zinc-400 font-sans">
              Free, private online document and media tools. Files stay in your browser.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 pt-1 font-display">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
              <span>In-Browser WebAssembly Sandbox</span>
            </div>
          </div>

          {/* PDF Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white font-display">
              PDF Suite
            </h4>
            <ul className="space-y-2">
              {pdfTools.slice(0, 7).map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white font-display">
              Convert &amp; Edit
            </h4>
            <ul className="space-y-2">
              {documentTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image & Media Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white font-display">
              Image &amp; Media
            </h4>
            <ul className="space-y-2">
              {imageTools.slice(0, 5).map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              {mediaTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer, AI & Company Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-900 dark:text-white font-display">
              Dev &amp; Company
            </h4>
            <ul className="space-y-2">
              {devTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-zinc-100 dark:border-[#2A2E45]">
                <Link to="/about" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-zinc-200 dark:border-[#2A2E45] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-sans text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Globe className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>© {year} PDFora. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
