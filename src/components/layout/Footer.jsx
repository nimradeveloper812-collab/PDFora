import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Lock, Zap, Heart, ArrowRight } from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const pdfTools = TOOLS.filter(t => t.category.startsWith('convert'));
const docTools = TOOLS.filter(t => t.category === 'organize' || t.category === 'optimize');
const mediaTools = TOOLS.filter(t => ['image', 'video', 'audio'].includes(t.category));

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16"
      style={{ background: '#FFFFFF', borderTop: '1px solid #BFDBFE' }}
      role="contentinfo"
    >
      {/* ── Trust Banner ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div
          className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#DBEAFE', color: '#3B82F6' }}
              aria-hidden="true"
            >
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-bold" style={{ color: '#18181B' }}>
                Private &amp; Secure Processing
              </h4>
              <p className="text-xs mt-0.5 leading-relaxed max-w-lg" style={{ color: '#71717A' }}>
                All document and media processing executes in secure memory sandboxes with zero server file persistence. Your sensitive files never persist on server storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 sm:pl-4" style={{ borderLeft: '1px solid #BFDBFE' }}>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#3F3F46' }}>
              <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
              100% Private
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#3F3F46' }}>
              <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
              Zero Storage Leaks
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
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                }}
              >
                <FileCheck className="w-4.5 h-4.5" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span
                className="text-lg font-extrabold tracking-tight"
                style={{ color: '#18181B', letterSpacing: '-0.03em' }}
              >
                PDF<span style={{ color: '#3B82F6' }}>ora</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#71717A' }}>
              Fast, private, and 100% free online PDF and media conversion platform. Convert, merge, split, and compress
              documents, images, videos, and audio with zero server file persistence.
            </p>

            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#A1A1AA' }}>
              <span>Engineered with</span>
              <Heart
                className="w-3 h-3"
                style={{ color: '#3B82F6', fill: '#3B82F6' }}
                aria-hidden="true"
              />
              <span>for students, creators &amp; professionals worldwide</span>
            </div>
          </div>

          {/* PDF Tools Column */}
          <div>
            <h5
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#18181B' }}
            >
              PDF Tools
            </h5>
            <ul className="space-y-2.5">
              {pdfTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-500 hover:underline transition-all duration-150"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organize / Document Tools Column */}
          <div>
            <h5
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#18181B' }}
            >
              Edit &amp; Docs
            </h5>
            <ul className="space-y-2.5">
              {docTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-500 hover:underline transition-all duration-150"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Media & Image Tools Column */}
          <div>
            <h5
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#18181B' }}
            >
              Media &amp; Images
            </h5>
            <ul className="space-y-2.5">
              {mediaTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-500 hover:underline transition-all duration-150"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal Column */}
          <div>
            <h5
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#18181B' }}
            >
              Company
            </h5>
            <ul className="space-y-2.5">
              {[
                { to: '/about',           label: 'About PDFora' },
                { to: '/contact',         label: 'Contact Support' },
                { to: '/privacy-policy',  label: 'Privacy Policy' },
                { to: '/terms-of-service',label: 'Terms of Service' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-500 hover:underline transition-all duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────── */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: '1px solid #DBEAFE' }}
      >
        <p className="text-xs" style={{ color: '#A1A1AA' }}>
          © {year} PDFora. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {[
            { to: '/privacy-policy',   label: 'Privacy Policy' },
            { to: '/terms-of-service', label: 'Terms of Service' },
            { to: '/contact',          label: 'Support' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-xs font-medium text-zinc-400 hover:text-blue-500 hover:underline transition-all duration-150"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
