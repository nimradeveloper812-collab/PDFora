import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import Dropzone from './Dropzone';
import {
  CheckCircle2, HelpCircle, Sparkles, ArrowRight,
  ShieldCheck, Zap, FileText, Table, Presentation,
  Image as ImageIcon, FileImage, Layers, Minimize2,
  Scissors, ChevronDown, Smartphone, Globe
} from 'lucide-react';
import { TOOLS } from '../../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors
};

export default function ToolLayout({ tool }) {
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpenFaq(null);
  }, [tool.id]);

  const otherTools = TOOLS.filter(t => t.id !== tool.id).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Helmet>
        <title>{tool.name} — Free Online PDF Tool | PDFora Pakistan</title>
        <meta name="description" content={`${tool.description} Fast, private, and 100% free online PDF tool in Pakistan.`} />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav
          className="flex items-center gap-2 text-xs font-medium"
          aria-label="Breadcrumb"
          style={{ color: '#A1A1AA' }}
        >
          <Link
            to="/"
            style={{ color: '#71717A', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3B82F6')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to="/tools"
            style={{ color: '#71717A', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3B82F6')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
          >
            Tools
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold" style={{ color: '#18181B' }} aria-current="page">
            {tool.name}
          </span>
        </nav>
      </div>

      {/* ── Tool Hero ──────────────────────────────────────── */}
      <section
        className="pt-6 pb-12 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% -5%, #DBEAFE 0%, #FFFFFF 65%)',
        }}
        aria-labelledby="tool-heading"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: '#DBEAFE',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              boxShadow: '0 1px 4px rgba(59, 130, 246,0.08)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            100% Free Online Tool
          </div>

          <h1
            id="tool-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            {tool.name}
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#52525B' }}
          >
            {tool.description}
          </p>
        </div>
      </section>

      {/* ── Upload Dropzone ────────────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-8 mb-12"
        aria-label={`${tool.name} upload area`}
      >
        <Dropzone tool={tool} />

        {/* Trust highlights below dropzone */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Zap,        title: 'Fast Processing',   sub: '1-click conversion'  },
            { icon: Sparkles,   title: 'High Quality',      sub: 'No quality loss'     },
            { icon: ShieldCheck,title: 'Privacy Focused',   sub: 'Auto-deleted files'  },
            { icon: Smartphone, title: 'Works on Mobile',   sub: 'Full touch support'  },
          ].map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-2.5 p-3.5 rounded-xl transition-all duration-150"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                aria-hidden="true"
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: '#18181B' }}>{title}</p>
                <p className="text-[10px] truncate" style={{ color: '#A1A1AA' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to Use ─────────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        aria-labelledby="how-to-use-heading"
      >
        <div className="text-center mb-10 space-y-1.5">
          <span className="section-label">Step by Step</span>
          <h2
            id="how-to-use-heading"
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: '#18181B', letterSpacing: '-0.03em' }}
          >
            How to Use {tool.name}
          </h2>
          <p className="text-sm" style={{ color: '#71717A' }}>
            Process your files in three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl space-y-3 group transition-all duration-200"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246,0.09)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(59, 130, 246,0.04)';
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-all duration-200"
                style={{ background: '#DBEAFE', color: '#3B82F6' }}
              >
                0{idx + 1}
              </div>
              <h3 className="text-sm font-bold" style={{ color: '#18181B' }}>
                Step {idx + 1}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features & Security ────────────────────────────── */}
      <section
        className="py-14 mb-16"
        style={{ background: '#EFF6FF', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}
        aria-labelledby="features-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-1.5">
            <span className="section-label">Platform Benefits</span>
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              Why Use PDFora?
            </h2>
            <p className="text-sm" style={{ color: '#71717A' }}>
              Fast, private, and accurate document conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {tool.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#DBEAFE' }}
                  aria-hidden="true"
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold" style={{ color: '#18181B' }}>
                    {feature}
                  </h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#71717A' }}>
                    Output maintains original quality and formatting throughout the process.
                  </p>
                </div>
              </div>
            ))}

            {/* Static security feature */}
            <div
              className="flex items-start gap-3.5 p-4 rounded-2xl"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#DBEAFE' }}
                aria-hidden="true"
              >
                <ShieldCheck className="w-4 h-4" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold" style={{ color: '#18181B' }}>
                  End-to-End Privacy Guaranteed
                </h4>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#71717A' }}>
                  Files are encrypted during transit and permanently deleted within 60 minutes.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3.5 p-4 rounded-2xl"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#DBEAFE' }}
                aria-hidden="true"
              >
                <Globe className="w-4 h-4" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold" style={{ color: '#18181B' }}>
                  No Installation Required
                </h4>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#71717A' }}>
                  Runs entirely in your browser on Mac, Windows, iOS, and Android.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool FAQs ──────────────────────────────────────── */}
      {tool.faqs?.length > 0 && (
        <section
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
          aria-labelledby="tool-faq-heading"
        >
          <div className="text-center mb-8 space-y-1.5">
            <span className="section-label">Common Questions</span>
            <h2
              id="tool-faq-heading"
              className="text-2xl font-extrabold flex items-center justify-center gap-2"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              <HelpCircle className="w-5 h-5 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
              Tool FAQs
            </h2>
          </div>

          <div className="space-y-3" role="list">
            {tool.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  role="listitem"
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${isOpen ? '#3B82F6' : '#BFDBFE'}`,
                    boxShadow: isOpen ? '0 4px 16px rgba(59, 130, 246,0.08)' : '0 1px 4px rgba(59, 130, 246,0.03)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors duration-150"
                    aria-expanded={isOpen}
                    style={{ color: isOpen ? '#3B82F6' : '#18181B' }}
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: isOpen ? '#3B82F6' : '#A1A1AA' }}
                      aria-hidden="true"
                    />
                  </button>
                  <div className={`faq-accordion-content ${isOpen ? 'open' : ''}`}>
                    <div
                      className="px-5 pb-5 pt-1 text-sm leading-relaxed"
                      style={{ color: '#52525B', borderTop: '1px solid #FFF0F8' }}
                    >
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Related Tools ──────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="related-tools-heading"
      >
        <div
          className="flex items-center justify-between mb-8 pb-3"
          style={{ borderBottom: '1px solid #BFDBFE' }}
        >
          <h3
            id="related-tools-heading"
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: '#18181B' }}
          >
            Explore Related Tools
          </h3>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1 text-xs font-semibold group/more"
            style={{ color: '#3B82F6', textDecoration: 'none' }}
          >
            View All
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform group-hover/more:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherTools.map(other => {
            const Icon = iconMap[other.iconName] || FileText;
            return (
              <Link
                key={other.id}
                to={other.path}
                className="group flex flex-col justify-between p-5 rounded-2xl transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246,0.10)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#BFDBFE';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(59, 130, 246,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-105"
                    style={{ background: '#DBEAFE', color: '#3B82F6' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h4
                    className="text-sm font-bold mb-1 transition-colors group-hover:text-blue-600"
                    style={{ color: '#18181B' }}
                  >
                    {other.name}
                  </h4>
                  <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#71717A' }}>
                    {other.shortDesc}
                  </p>
                </div>
                <div
                  className="flex items-center justify-between pt-3 mt-3 text-[11px] font-bold transition-all duration-150"
                  style={{ borderTop: '1px solid #FFF0F8', color: '#3B82F6' }}
                >
                  <span>Open Tool</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
