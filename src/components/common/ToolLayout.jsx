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
import JsonToCsvTool from '../pdf/JsonToCsvTool';
import Base64ToPdfTool from '../pdf/Base64ToPdfTool';
import CompressToKbTool from '../pdf/CompressToKbTool';
import ChangeBackgroundTool from '../image/ChangeBackgroundTool';
import ResizeImageTool from '../image/ResizeImageTool';
import CropImageTool from '../image/CropImageTool';
import JsonFormatterTool from '../pdf/JsonFormatterTool';
import QrGeneratorTool from '../pdf/QrGeneratorTool';
import UnlockPdfTool from '../pdf/UnlockPdfTool';
import ProtectPdfTool from '../pdf/ProtectPdfTool';
import RotatePdfTool from '../pdf/RotatePdfTool';
import CropPdfTool from '../pdf/CropPdfTool';
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0D0D14] pt-20 transition-colors">
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
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/tools?category=${tool.category}`}
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {categoryName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-zinc-900 dark:text-white" aria-current="page">
            {tool.name}
          </span>
        </nav>
      </div>

      {/* ── Tool Hero ──────────────────────────────────────── */}
      <section
        className="pt-4 pb-10 px-4 sm:px-6 lg:px-8 text-center bg-[#F8FAFC] dark:bg-[#141622] border-b border-zinc-100 dark:border-[#2A2E45] transition-colors"
        aria-labelledby="tool-heading"
      >
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>100% Free &amp; Private In-Browser Tool</span>
          </div>

          <h1
            id="tool-heading"
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight"
          >
            {h1Title}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto text-zinc-600 dark:text-zinc-300 font-normal">
            {tool.description}
          </p>
        </div>
      </section>

      {/* ── Tool Interactive Area ─────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-[#0D0D14] border-b border-zinc-200 dark:border-[#2A2E45] transition-colors"
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
        ) : tool.id === 'json-to-csv' ? (
          <JsonToCsvTool />
        ) : tool.id === 'base64-to-pdf' ? (
          <Base64ToPdfTool />
        ) : tool.id === 'compress-to-kb' ? (
          <CompressToKbTool />
        ) : tool.id === 'change-background' ? (
          <ChangeBackgroundTool />
        ) : tool.id === 'resize-image' ? (
          <ResizeImageTool />
        ) : tool.id === 'crop-image' ? (
          <CropImageTool />
        ) : tool.id === 'json-formatter' ? (
          <JsonFormatterTool />
        ) : tool.id === 'qr-generator' ? (
          <QrGeneratorTool />
        ) : tool.id === 'unlock-pdf' ? (
          <UnlockPdfTool />
        ) : tool.id === 'protect-pdf' ? (
          <ProtectPdfTool />
        ) : tool.id === 'rotate-pdf' ? (
          <RotatePdfTool />
        ) : tool.id === 'crop-pdf' ? (
          <CropPdfTool />
        ) : (
          <Dropzone tool={tool} />
        )}

        {/* Trust highlights below dropzone */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Zap,        title: 'Fast Processing',   sub: 'In-browser engine'   },
            { icon: Sparkles,   title: 'High Quality',      sub: 'Original accuracy'   },
            { icon: ShieldCheck,title: 'Privacy Secured',   sub: 'Zero server uploads' },
            { icon: Smartphone, title: 'Works Everywhere',  sub: 'Mobile & Desktop'    },
          ].map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45]"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{title}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-normal">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-6">
          <AdBanner slot="7890123456" className="my-2" />
        </div>
      </section>



      {/* ── How to Use ─────────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        aria-labelledby="how-to-use-heading"
      >
        <div className="text-center mb-8 space-y-1">
          <h2
            id="how-to-use-heading"
            className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight"
          >
            How to Use {tool.name}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
            Process your documents in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] space-y-2.5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white font-display bg-purple-600 dark:bg-purple-500"
              >
                {idx + 1}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Step {idx + 1}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
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
              className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight"
            >
              Who Uses {tool.name}?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              Built for students, freelancers, accountants, and professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.useCases.map((uc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] space-y-1"
              >
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {uc.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
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
              className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight"
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
                  className={`rounded-lg border overflow-hidden bg-white dark:bg-[#141622] transition-colors ${
                    isOpen
                      ? 'border-purple-600 dark:border-purple-500'
                      : 'border-zinc-200 dark:border-[#2A2E45]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-bold ${isOpen ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-white'}`}>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : 'text-zinc-400 dark:text-zinc-500'}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-[#2A2E45] font-normal">
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
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200 dark:border-[#2A2E45]">
          <h3
            id="related-tools-heading"
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white"
          >
            Explore Related Tools
          </h3>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
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
                className="group flex flex-col justify-between p-4 rounded-lg bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:border-purple-600 dark:hover:border-purple-500 hover:bg-zinc-50 dark:hover:bg-[#1B1E2E] transition-all shadow-xs"
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-2 border shrink-0 ${theme.iconBg}`}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-0.5">
                    {other.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 font-normal">
                    {other.shortDesc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 border-t border-zinc-100 dark:border-[#2A2E45]">
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
