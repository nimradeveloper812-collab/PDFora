import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Clock, Calendar, ArrowRight,
  Sparkles, Tag, ShieldCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import AdBanner, { AD_SLOTS } from '../components/common/AdBanner';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const set = new Set(BLOG_POSTS.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];
  }, []);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://pdfora.nimradev.site/blog#blog',
    'name': 'PDFora Guides & Knowledge Base',
    'url': 'https://pdfora.nimradev.site/blog',
    'description': 'Practical guides, tutorials, and deep dives on PDF optimization, conversion, document security, and productivity.',
    'publisher': {
      '@type': 'Organization',
      'name': 'PDFora',
      'url': 'https://pdfora.nimradev.site',
      'logo': 'https://pdfora.nimradev.site/pdfora-logo.png'
    },
    'blogPost': BLOG_POSTS.map(p => ({
      '@type': 'BlogPosting',
      'headline': p.title,
      'url': `https://pdfora.nimradev.site/blog/${p.slug}`,
      'datePublished': p.publishedAt,
      'dateModified': p.updatedAt,
      'description': p.excerpt,
      'author': {
        '@type': 'Person',
        'name': p.author.name
      }
    }))
  };

  return (
    <div className="pt-14 pb-16 min-h-screen bg-zinc-50/60 dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>PDF Guides, Tutorials &amp; Document Tips — PDFora Knowledge Base</title>
        <meta
          name="description"
          content="Explore expert guides, tutorials, and practical tips on PDF compression, format conversion, document security, OCR, and digital workflows."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/blog" />
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
      </Helmet>

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-zinc-900 dark:text-white" aria-current="page">Guides &amp; Articles</span>
        </nav>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Document Mastery &amp; Digital Workflow Library</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            PDF Guides, Tutorials &amp; Tips
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            In-depth, actionable tutorials written by document engineering specialists. Learn how to compress, convert, merge, and protect your files with zero loss in quality.
          </p>

          {/* Search Bar */}
          <div className="pt-3 max-w-lg mx-auto relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. compress, merge, OCR, Word to PDF)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600/30 transition-all"
            />
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#141622] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-[#2A2E45]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Guide (shown on 'All' with no search) ────── */}
      {selectedCategory === 'All' && !searchQuery.trim() && featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white">
                <Sparkles className="w-3 h-3 text-purple-200" />
                Featured Complete Guide
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                <Link to={`/blog/${featuredPost.slug}`} className="hover:underline">
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-2xl font-normal">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredPost.readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredPost.publishedAt}
                </span>
                <span className="font-semibold text-white">
                  By {featuredPost.author.name}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 transition-colors shadow-xs"
                >
                  <span>Read Complete Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Articles Grid ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200 dark:border-[#2A2E45]">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            {selectedCategory === 'All' ? 'Latest Guides & Articles' : `${selectedCategory} (${filteredPosts.length})`}
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} available
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45]">
            <Search className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No articles matched your criteria</p>
            <p className="text-xs text-zinc-500 mt-1">Try searching for other terms like "compression", "merge", "password", or clear filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-6 space-y-3">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <Link to={`/blog/${post.slug}`} className="block">
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3 font-normal">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#1B1E2E] text-zinc-500 dark:text-zinc-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer with CTA & Tool Link */}
                <div className="px-6 py-3.5 bg-zinc-50/70 dark:bg-[#181B2B] border-t border-zinc-100 dark:border-[#2A2E45] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {post.publishedAt}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"
                  >
                    <span>Read Guide</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── In-Content Ad Slot ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdBanner slot={AD_SLOTS.ABOVE_FOOTER} format="horizontal" />
      </div>

      {/* ── Tools Hub Quick CTA ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Ready to process your documents?
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
              PDFora offers 70+ in-browser document, image, video, and audio tools. No accounts, no watermarks, and 100% private.
            </p>
          </div>
          <Link
            to="/tools"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-purple-500/20 shadow-md transition-all"
          >
            <span>Explore All 70+ Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
