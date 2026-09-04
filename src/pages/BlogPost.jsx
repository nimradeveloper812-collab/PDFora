import React, { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Clock, Calendar, ArrowLeft, ArrowRight, Share2,
  CheckCircle2, Sparkles, BookOpen, User, Tag,
  ExternalLink, Copy, Check
} from 'lucide-react';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blogData';
import AdBanner, { AD_SLOTS } from '../components/common/AdBanner';

export default function BlogPost() {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = useMemo(() => getRelatedBlogPosts(post.slug, 3), [post.slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://pdfora.nimradev.site/blog/${post.slug}`
    },
    'headline': post.title,
    'description': post.excerpt,
    'datePublished': post.publishedAt,
    'dateModified': post.updatedAt,
    'author': {
      '@type': 'Person',
      'name': post.author.name,
      'jobTitle': post.author.role
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'PDFora',
      'url': 'https://pdfora.nimradev.site',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://pdfora.nimradev.site/pdfora-logo.png'
      }
    },
    'keywords': post.tags.join(', ')
  };

  // Helper to parse markdown-like headers and tables into clean JSX
  const renderFormattedContent = (contentStr) => {
    const lines = contentStr.trim().split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const flushTable = (keyIndex) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(2); // row 1 is delimiter | :--- |

        elements.push(
          <div key={`table-${keyIndex}`} className="overflow-x-auto my-6 rounded-xl border border-zinc-200 dark:border-[#2A2E45]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white font-bold">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="p-3 border-b border-zinc-200 dark:border-[#2A2E45]">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-[#2A2E45] bg-white dark:bg-[#141622]">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-zinc-700 dark:text-zinc-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // Horizontal Rule
      if (trimmed === '---') {
        elements.push(
          <hr key={index} className="my-8 border-zinc-200 dark:border-[#2A2E45]" />
        );
        return;
      }

      // H2 Heading
      if (trimmed.startsWith('## ')) {
        const title = trimmed.replace('## ', '');
        elements.push(
          <h2
            key={index}
            className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-10 mb-4 tracking-tight"
          >
            {title}
          </h2>
        );
        return;
      }

      // H3 Heading
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace('### ', '');
        elements.push(
          <h3
            key={index}
            className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-2 tracking-tight"
          >
            {title}
          </h3>
        );
        return;
      }

      // Bullet Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.slice(2);
        elements.push(
          <li key={index} className="ml-5 list-disc text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
          </li>
        );
        return;
      }

      // Numbered lists (1. , 2. )
      if (/^\d+\.\s/.test(trimmed)) {
        const numText = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <li key={index} className="ml-5 list-decimal text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numText) }} />
          </li>
        );
        return;
      }

      // Paragraphs
      if (trimmed.length > 0) {
        elements.push(
          <p
            key={index}
            className="text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 my-3.5"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
          />
        );
      }
    });

    if (inTable) {
      flushTable('end');
    }

    return elements;
  };

  // Inline formatting helper for bold, italics, links, and code
  const formatInlineMarkdown = (text) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-zinc-900 dark:text-white">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-purple-700 dark:text-purple-300 font-semibold">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="font-bold text-purple-600 dark:text-purple-400 underline decoration-purple-300 hover:text-purple-700 transition-colors">$1</a>');
  };

  return (
    <div className="pt-14 pb-20 min-h-screen bg-white dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>{post.title} — PDFora Guide</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://pdfora.nimradev.site/blog/${post.slug}`} />
        <meta property="og:title" content={`${post.title} — PDFora`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://pdfora.nimradev.site/blog/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      {/* ── Breadcrumb & Back Navigation ────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/blog" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Guides</Link>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-zinc-900 dark:text-white truncate max-w-xs">{post.shortTitle}</span>
          </nav>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Guides</span>
          </Link>
        </div>
      </div>

      {/* ── Article Header ───────────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal">
            {post.excerpt}
          </p>

          {/* Author Bio Bar & Share Button */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 dark:border-[#2A2E45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm border border-purple-200 dark:border-purple-800">
                N
              </div>
              <div>
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white">
                  {post.author.name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {post.author.role} • Updated {post.updatedAt}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Share Guide</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Article Layout ──────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Recommended Tool Hero Banner */}
        {post.toolLink && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Featured Online Tool
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Use our free in-browser {post.toolName} tool
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                100% private WebAssembly processing. No files uploaded to servers.
              </p>
            </div>
            <Link
              to={post.toolLink}
              className="shrink-0 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <span>Launch Tool Free</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Formatted Article Content */}
        <div className="prose dark:prose-invert max-w-none">
          {renderFormattedContent(post.content)}
        </div>

        {/* Mid-Article / Below-Article AdSense Banner */}
        <div className="my-8">
          <AdBanner slot={AD_SLOTS.TOOL_BELOW_CONTENT} format="auto" />
        </div>

        {/* Tags Section */}
        <div className="pt-6 border-t border-zinc-200 dark:border-[#2A2E45]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Article Topics &amp; Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#1B1E2E] text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                <Tag className="w-3 h-3 text-purple-600" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-[#2A2E45]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
              Recommended Reading
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map(rel => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:border-purple-500 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      {rel.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-3 mt-3 border-t border-zinc-100 dark:border-[#2A2E45]">
                    <span>{rel.readTime}</span>
                    <span className="font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
