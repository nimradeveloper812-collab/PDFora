import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Dropzone from './Dropzone';
import AdBanner from './AdBanner';
import BackgroundRemoverTool from '../image/BackgroundRemoverTool';
import ImageCompressorTool from '../image/ImageCompressorTool';
import VideoToAudioTool from '../media/VideoToAudioTool';
import AudioCompressorTool from '../media/AudioCompressorTool';
import ImageConverterTool from '../media/ImageConverterTool';
import VideoConverterTool from '../media/VideoConverterTool';
import VideoCompressorTool from '../media/VideoCompressorTool';
import {
  CheckCircle2, HelpCircle, Sparkles, ArrowRight,
  ShieldCheck, Zap, FileText, Table, Presentation,
  Image as ImageIcon, FileImage, Layers, Minimize2,
  Scissors, ChevronDown, Smartphone, Globe, Video, Music, FileAudio, FileVideo, RefreshCw
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES } from '../../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Video, Music, FileAudio, FileVideo, RefreshCw
};

export default function ToolLayout({ tool }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpenFaq(null);
  }, [tool.id]);

  const categoryObj = TOOLS_CATEGORIES.find(c => c.id === tool.category);
  const categoryName = categoryObj ? categoryObj.name : 'Tools';
  const categoryUrl = `https://pdfora.nimradev.site/tools?category=${tool.category}`;

  const relatedTools = (tool.relatedToolIds && tool.relatedToolIds.length > 0)
    ? tool.relatedToolIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean)
    : TOOLS.filter(t => t.id !== tool.id).slice(0, 4);

  const canonicalUrl = `https://pdfora.nimradev.site${tool.path}`;
  const seoTitle = tool.metaTitle || `${tool.name} Online — Free, Fast & Private | PDFora`;
  const seoDesc = tool.metaDescription || `${tool.description} 100% free online PDF utility with private in-browser WebAssembly processing, zero file limits, and zero server file persistence.`;
  const h1Title = tool.h1Title || tool.name;
  const keywordsStr = (tool.primaryKeywords || []).join(', ');

  // Structured Data: WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': `${tool.name} - PDFora`,
    'url': canonicalUrl,
    'description': tool.description,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires JavaScript and HTML5 support',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'creator': {
      '@type': 'Organization',
      'name': 'PDFora',
      'url': 'https://pdfora.nimradev.site'
    }
  };

  // Structured Data: HowTo Schema for Step-by-Step Instructions
  const howToSchema = tool.steps && tool.steps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `How to use ${tool.name} online with PDFora`,
    'description': `Follow these simple steps to use ${tool.name} for free in your browser with complete privacy.`,
    'step': tool.steps.map((stepText, idx) => ({
      '@type': 'HowToStep',
      'position': idx + 1,
      'name': `Step ${idx + 1}`,
      'text': stepText,
      'url': `${canonicalUrl}#step-${idx + 1}`
    }))
  } : null;

  // Structured Data: FAQPage Schema
  const faqSchema = tool.faqs && tool.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': tool.faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  } : null;

  // Structured Data: BreadcrumbList Schema (3-tier hierarchy: Home -> Category -> Tool)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://pdfora.nimradev.site/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': categoryName,
        'item': categoryUrl
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': tool.name,
        'item': canonicalUrl
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pt-[88px] sm:pt-[96px]">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        {keywordsStr && <meta name="keywords" content={keywordsStr} />}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content="https://pdfora.nimradev.site/og-image.jpg" />
        <meta property="og:site_name" content="PDFora" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://pdfora.nimradev.site/og-image.jpg" />

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(webAppSchema)}
        </script>
        {howToSchema && (
          <script type="application/ld+json">
            {JSON.stringify(howToSchema)}
          </script>
        )}
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
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
            to={`/tools?category=${tool.category}`}
            style={{ color: '#71717A', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3B82F6')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
          >
            {categoryName}
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
            {h1Title}
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#52525B' }}
          >
            {tool.description}
          </p>
        </div>
      </section>

      {/* ── Tool Interactive Area ─────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-8 mb-12"
        aria-label={`${tool.name} interactive area`}
      >
        {tool.id === 'image-background-remover' ? (
          <BackgroundRemoverTool tool={tool} />
        ) : tool.id === 'image-compressor' ? (
          <ImageCompressorTool tool={tool} />
        ) : tool.id === 'video-to-audio' ? (
          <VideoToAudioTool />
        ) : tool.id === 'audio-compressor' ? (
          <AudioCompressorTool />
        ) : tool.id === 'image-converter' ? (
          <ImageConverterTool />
        ) : tool.id === 'video-converter' ? (
          <VideoConverterTool />
        ) : tool.id === 'video-compressor' ? (
          <VideoCompressorTool />
        ) : (
          <Dropzone tool={tool} />
        )}

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

        {/* ── Mid-page Ad Banner ── */}
        <div className="max-w-4xl mx-auto mt-6">
          <AdBanner slot="7890123456" className="my-2" />
        </div>
      </section>

      {/* ── Overview & Deep Guide ─────────────────────────── */}
      {tool.overview && (
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
          aria-labelledby="overview-heading"
        >
          <div
            className="p-6 sm:p-8 rounded-3xl"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #BFDBFE',
              boxShadow: '0 4px 24px rgba(59, 130, 246, 0.06)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="section-label">Complete Guide</span>
              <span className="text-xs font-semibold" style={{ color: '#64748B' }}>• Updated August 2026</span>
            </div>
            <h2
              id="overview-heading"
              className="text-xl sm:text-2xl font-bold mb-4"
              style={{ color: '#0F172A', letterSpacing: '-0.025em' }}
            >
              About {tool.name} on PDFora
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#334155' }}>
              {tool.overview}
            </p>
          </div>
        </section>
      )}

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
            style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
          >
            How to Use {tool.name}
          </h2>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Process your files in three easy, lightning-fast steps.
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
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246,0.09)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(59, 130, 246,0.04)';
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-all duration-200"
                style={{ background: '#DBEAFE', color: '#1D4ED8' }}
              >
                0{idx + 1}
              </div>
              <h3 className="text-sm font-bold" style={{ color: '#0F172A' }}>
                Step {idx + 1}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Real-World Use Cases ───────────────────────────── */}
      {tool.useCases?.length > 0 && (
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
          aria-labelledby="usecases-heading"
        >
          <div className="text-center mb-10 space-y-1.5">
            <span className="section-label">Real-World Applications</span>
            <h2
              id="usecases-heading"
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
            >
              Who Uses {tool.name}?
            </h2>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Built for students, freelancers, accountants, and global businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.useCases.map((uc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl transition-all duration-150"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.04)'
                }}
              >
                <h3 className="text-sm font-bold mb-1.5" style={{ color: '#0F172A' }}>
                  {uc.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Technical Specifications & Pro Tips ─────────────── */}
      {tool.technicalSpecs?.length > 0 && (
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
          aria-labelledby="specs-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Specs Table */}
            <div
              className="lg:col-span-2 p-6 rounded-2xl"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.04)'
              }}
            >
              <h3 id="specs-heading" className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>
                Technical Specifications
              </h3>
              <div className="divide-y divide-blue-100">
                {tool.technicalSpecs.map((spec, idx) => (
                  <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold" style={{ color: '#475569' }}>{spec.label}</span>
                    <span className="font-medium text-left sm:text-right" style={{ color: '#0F172A' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips Box */}
            {tool.proTips?.length > 0 && (
              <div
                className="p-6 rounded-2xl space-y-3"
                style={{
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  border: '1px solid #BFDBFE'
                }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: '#2563EB' }} />
                  <h3 className="text-sm font-bold" style={{ color: '#1E3A8A' }}>
                    Pro Tips
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {tool.proTips.map((tip, idx) => (
                    <li key={idx} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: '#1E40AF' }}>
                      <span className="font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

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
              style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
            >
              Why Use PDFora?
            </h2>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Fast, private, and accurate document processing.
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
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold" style={{ color: '#0F172A' }}>
                    {feature}
                  </h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#64748B' }}>
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
                <ShieldCheck className="w-4 h-4" style={{ color: '#2563EB' }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold" style={{ color: '#0F172A' }}>
                  End-to-End Privacy Guaranteed
                </h4>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#64748B' }}>
                  Files are processed privately in browser memory with zero permanent server storage.
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
                <Globe className="w-4 h-4" style={{ color: '#2563EB' }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold" style={{ color: '#0F172A' }}>
                  No Installation Required
                </h4>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#64748B' }}>
                  Runs entirely in your web browser across Windows, macOS, Linux, iOS, and Android.
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
              style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
            >
              <HelpCircle className="w-5 h-5 shrink-0" style={{ color: '#2563EB' }} aria-hidden="true" />
              Frequently Asked Questions
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
                    border: `1px solid ${isOpen ? '#2563EB' : '#BFDBFE'}`,
                    boxShadow: isOpen ? '0 4px 16px rgba(37, 99, 235, 0.08)' : '0 1px 4px rgba(59, 130, 246,0.03)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors duration-150"
                    aria-expanded={isOpen}
                    style={{ color: isOpen ? '#2563EB' : '#0F172A' }}
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: isOpen ? '#2563EB' : '#64748B' }}
                      aria-hidden="true"
                    />
                  </button>
                  <div className={`faq-accordion-content ${isOpen ? 'open' : ''}`}>
                    <div
                      className="px-5 pb-5 pt-1 text-sm leading-relaxed"
                      style={{ color: '#475569', borderTop: '1px solid #DBEAFE' }}
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
            style={{ color: '#0F172A' }}
          >
            Explore Related Tools
          </h3>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1 text-xs font-semibold group/more"
            style={{ color: '#2563EB', textDecoration: 'none' }}
          >
            View All
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform group-hover/more:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map(other => {
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
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.12)';
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
                    style={{ background: '#DBEAFE', color: '#2563EB' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h4
                    className="text-sm font-bold mb-1 transition-colors group-hover:text-blue-600"
                    style={{ color: '#0F172A' }}
                  >
                    {other.name}
                  </h4>
                  <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#64748B' }}>
                    {other.shortDesc}
                  </p>
                </div>
                <div
                  className="flex items-center justify-between pt-3 mt-3 text-[11px] font-bold transition-all duration-150"
                  style={{ borderTop: '1px solid #DBEAFE', color: '#2563EB' }}
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
