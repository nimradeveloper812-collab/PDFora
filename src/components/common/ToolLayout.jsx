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
import ChatWithPdfTool from '../pdf/ChatWithPdfTool';
import AiResumeReviewerTool from '../pdf/AiResumeReviewerTool';
import AiTableExtractorTool from '../pdf/AiTableExtractorTool';
import PdfMetadataEditorTool from '../pdf/PdfMetadataEditorTool';
import JsonToCsvTool from '../pdf/JsonToCsvTool';
import Base64ToPdfTool from '../pdf/Base64ToPdfTool';
import {
  CheckCircle2, HelpCircle, Sparkles, ArrowRight,
  ShieldCheck, Zap, FileText, Table, Presentation,
  Image as ImageIcon, FileImage, Layers, Minimize2,
  Scissors, ChevronDown, Smartphone, Globe, Video, Music, FileAudio, FileVideo, RefreshCw
} from 'lucide-react';
import { TOOLS, TOOLS_CATEGORIES, getToolTheme } from '../../data/toolsData';

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
    <div className="flex flex-col min-h-screen bg-white pt-20">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        {keywordsStr && <meta name="keywords" content={keywordsStr} />}
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content="https://pdfora.nimradev.site/og-image.jpg" />
        <meta property="og:site_name" content="PDFora" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
        <nav
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/tools?category=${tool.category}`}
            className="hover:text-blue-600 transition-colors"
          >
            {categoryName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-zinc-900" aria-current="page">
            {tool.name}
          </span>
        </nav>
      </div>

      {/* ── Tool Hero ──────────────────────────────────────── */}
      <section
        className="pt-4 pb-10 px-4 sm:px-6 lg:px-8 text-center border-b border-zinc-100"
        style={{ backgroundColor: '#F8FAFC' }}
        aria-labelledby="tool-heading"
      >
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>100% Free &amp; Private In-Browser Tool</span>
          </div>

          <h1
            id="tool-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight"
          >
            {h1Title}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto text-zinc-600 font-normal">
            {tool.description}
          </p>
        </div>
      </section>

      {/* ── Tool Interactive Area ─────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-10 bg-white border-b border-zinc-200"
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
        ) : tool.id === 'chat-with-pdf' ? (
          <ChatWithPdfTool />
        ) : tool.id === 'ai-resume-reviewer' ? (
          <AiResumeReviewerTool />
        ) : tool.id === 'ai-table-extractor' ? (
          <AiTableExtractorTool />
        ) : tool.id === 'pdf-metadata-editor' ? (
          <PdfMetadataEditorTool />
        ) : tool.id === 'json-to-csv' ? (
          <JsonToCsvTool />
        ) : tool.id === 'base64-to-pdf' ? (
          <Base64ToPdfTool />
        ) : (
          <Dropzone tool={tool} />
        )}

        {/* Trust highlights below dropzone */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Zap,        title: 'Fast Processing',   sub: 'In-browser engine'   },
            { icon: Sparkles,   title: 'High Quality',      sub: 'Original accuracy'   },
            { icon: ShieldCheck,title: 'Privacy Secured',   sub: 'Zero server uploads' },
            { icon: Smartphone, title: 'Works Everywhere',  sub: 'Mobile & Desktop'    },
          ].map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">{title}</p>
                <p className="text-[10px] text-zinc-500 truncate font-normal">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-6">
          <AdBanner slot="7890123456" className="my-2" />
        </div>
      </section>

      {/* ── Overview & Deep Guide ─────────────────────────── */}
      {tool.overview && (
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          aria-labelledby="overview-heading"
        >
          <div className="p-6 sm:p-8 rounded-lg bg-white border border-zinc-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Complete Guide
              </span>
              <span className="text-xs font-medium text-zinc-500">• Updated 2026</span>
            </div>
            <h2
              id="overview-heading"
              className="text-xl sm:text-2xl font-bold mb-3 text-zinc-900 tracking-tight"
            >
              About {tool.name} on PDFora
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 font-normal">
              {tool.overview}
            </p>
          </div>
        </section>
      )}

      {/* ── How to Use ─────────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        aria-labelledby="how-to-use-heading"
      >
        <div className="text-center mb-8 space-y-1">
          <h2
            id="how-to-use-heading"
            className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight"
          >
            How to Use {tool.name}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Process your documents in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg bg-white border border-zinc-200 space-y-2.5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white font-display"
                style={{ backgroundColor: '#4F46E5' }}
              >
                {idx + 1}
              </div>
              <h3 className="text-sm font-bold text-zinc-900">
                Step {idx + 1}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Real-World Use Cases ───────────────────────────── */}
      {tool.useCases?.length > 0 && (
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          aria-labelledby="usecases-heading"
        >
          <div className="text-center mb-8 space-y-1">
            <h2
              id="usecases-heading"
              className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight"
            >
              Who Uses {tool.name}?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Built for students, freelancers, accountants, and professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.useCases.map((uc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-white border border-zinc-200 space-y-1"
              >
                <h3 className="text-sm font-bold text-zinc-900">
                  {uc.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tool FAQs ──────────────────────────────────────── */}
      {tool.faqs?.length > 0 && (
        <section
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          aria-labelledby="tool-faq-heading"
        >
          <div className="text-center mb-8 space-y-1">
            <h2
              id="tool-faq-heading"
              className="text-2xl font-bold text-zinc-900 tracking-tight"
            >
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
                  className="rounded-lg border border-zinc-200 overflow-hidden bg-white"
                  style={{
                    borderColor: isOpen ? '#0055FF' : '#E8E8E8',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-bold ${isOpen ? 'text-blue-600' : 'text-zinc-900'}`}>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : 'text-zinc-400'}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Related Tools ──────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        aria-labelledby="related-tools-heading"
      >
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200">
          <h3
            id="related-tools-heading"
            className="text-xs font-bold uppercase tracking-wider text-zinc-900"
          >
            Explore Related Tools
          </h3>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            View All Tools
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map(other => {
            const Icon = iconMap[other.iconName] || FileText;
            const theme = getToolTheme(other.id, other.category);
            return (
              <Link
                key={other.id}
                to={other.path}
                className="group flex flex-col justify-between p-4 rounded-lg bg-white border border-zinc-200 hover:border-blue-500 hover:bg-zinc-50 transition-all shadow-xs"
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-2 border shrink-0 ${theme.iconBg}`}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors mb-0.5">
                    {other.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 font-normal">
                    {other.shortDesc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 text-[11px] font-bold text-zinc-600 group-hover:text-blue-600 border-t border-zinc-100">
                  <span>Use Tool</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
