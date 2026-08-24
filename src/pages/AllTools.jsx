import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText, Search, Sparkles, ArrowRight, Table, Presentation,
  Image as ImageIcon, FileImage, Layers, Minimize2, Scissors,
  Music, FileVideo, RefreshCw, Grid, Code, CheckCircle2, ShieldCheck, X
} from 'lucide-react';
import { TOOLS } from '../data/toolsData';

const iconMap = {
  FileText, Table, Presentation,
  Image: ImageIcon, FileImage, Layers, Minimize2, Scissors, Sparkles,
  Music, FileVideo, RefreshCw, Code
};

export default function AllTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  // 8 Organized Tool Columns
  const directoryColumns = [
    {
      title: "ORGANIZE PDF",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
      items: [
        { name: "Merge PDF", path: "/merge-pdf", desc: "Combine multiple PDFs into one" },
        { name: "Split PDF", path: "/split-pdf", desc: "Separate PDF into individual pages" },
        { name: "Rotate PDF", path: "/rotate-pdf", desc: "Rotate pages 90° or 180°" },
        { name: "Protect PDF", path: "/protect-pdf", desc: "Encrypt PDF with password" },
        { name: "Unlock PDF", path: "/unlock-pdf", desc: "Remove PDF password & permissions" },
      ]
    },
    {
      title: "CONVERT TO PDF",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
      items: [
        { name: "JPG to PDF", path: "/jpg-to-pdf", desc: "Convert images to PDF" },
        { name: "PNG to PDF", path: "/png-to-pdf", desc: "Convert PNG images to PDF" },
        { name: "Word to PDF", path: "/word-to-pdf", desc: "DOCX documents to PDF" },
        { name: "PowerPoint to PDF", path: "/powerpoint-to-pdf", desc: "PPTX slides to PDF" },
      ]
    },
    {
      title: "CONVERT FROM PDF",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
      items: [
        { name: "PDF to Word", path: "/pdf-to-word", desc: "PDF to editable DOCX" },
        { name: "PDF to PowerPoint", path: "/pdf-to-powerpoint", desc: "PDF pages to PPTX slides" },
        { name: "PDF to JPG", path: "/pdf-to-jpg", desc: "Extract PDF pages as images" },
        { name: "PDF to Text", path: "/pdf-to-text", desc: "Extract plain text string" },
      ]
    },
    {
      title: "OPTIMIZE & EXTRACT",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
      items: [
        { name: "Compress PDF", path: "/compress-pdf", desc: "Shrink PDF file size" },
        { name: "PDF to PNG", path: "/pdf-to-png", desc: "Convert PDF pages to PNG" },
        { name: "Compress to KB", path: "/compress-to-kb", desc: "Target 100KB, 200KB limit" },
        { name: "Compress Image", path: "/image-compressor", desc: "Shrink image filesize" },
      ]
    },
    {
      title: "IMAGE EDIT & BG",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50",
      items: [
        { name: "Remove Background", path: "/image-background-remover", desc: "Instant AI BG removal" },
        { name: "Change Background", path: "/change-background", desc: "Replace background color" },
        { name: "Resize Image", path: "/resize-image", desc: "Resize width/height px" },
        { name: "Crop Image", path: "/crop-image", desc: "Crop image borders" },
      ]
    },
    {
      title: "PNG & SVG VECTOR",
      color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50",
      items: [
        { name: "HEIC to PNG", path: "/heic-to-png", desc: "Convert iPhone HEIC to PNG" },
        { name: "WebP to PNG", path: "/webp-to-png", desc: "Convert WebP to PNG" },
        { name: "SVG to PNG", path: "/svg-to-png", desc: "Convert SVG vector to PNG" },
        { name: "PNG to SVG", path: "/png-to-svg", desc: "Vectorize PNG to SVG" },
      ]
    },
    {
      title: "JPG & FORMATS",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
      items: [
        { name: "HEIC to JPG", path: "/heic-to-jpg", desc: "Convert iPhone HEIC to JPG" },
        { name: "BMP to JPG", path: "/bmp-to-jpg", desc: "Convert BMP to JPG" },
        { name: "TIFF to JPG", path: "/tiff-to-jpg", desc: "Convert TIFF to JPG" },
        { name: "JFIF to JPEG", path: "/jfif-to-jpeg", desc: "Convert JFIF to JPEG" },
      ]
    },
    {
      title: "DEV & VIDEO",
      color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/50",
      items: [
        { name: "JSON Formatter", path: "/json-formatter", desc: "Format & validate JSON" },
        { name: "QR Generator", path: "/qr-generator", desc: "Generate custom QR code" },
        { name: "MP4 to MP3", path: "/video-to-audio", desc: "Extract MP3 from MP4" },
        { name: "Compress Video", path: "/video-compressor", desc: "Compress video files" },
      ]
    }
  ];

  const filteredTools = TOOLS.filter(tool => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'pdf' && (tool.category === 'pdf' || tool.id.includes('pdf'))) ||
      (activeCategory === 'images' && (tool.category === 'images' || tool.id.includes('image') || tool.id.includes('jpg'))) ||
      (activeCategory === 'media' && (tool.category === 'video' || tool.category === 'audio' || tool.id.includes('video') || tool.id.includes('audio'))) ||
      (activeCategory === 'developer' && (tool.badge === 'Developer Tool' || tool.badge === 'AI Feature' || tool.id.includes('json') || tool.id.includes('base64') || tool.id.includes('qr')));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      (tool.primaryKeywords || []).some(k => k.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white pt-16 font-sans transition-colors">
      <Helmet>
        <title>All 48 Free Online PDF, Image &amp; Media Tools | PDFora</title>
        <meta
          name="description"
          content="Browse all 48 free online PDF, document, image, video, audio, and AI tools on PDFora. Convert Word, Excel, PPT, JPG to PDF, merge, compress, split, and edit metadata instantly."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/tools" />
      </Helmet>

      {/* Header Banner */}
      <section className="pt-12 pb-10 px-4 sm:px-6 lg:px-8 text-center border-b border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#141622] transition-colors">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>48 In-Browser Tools · Zero File Uploads · 100% Free</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            All Document &amp; File Tools
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
            Organize, convert, compress, and edit your files directly inside your browser with complete privacy.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 48+ tools by name or keyword..."
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-[#2A2E45] focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs Bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-200 dark:border-[#2A2E45] pb-4">
          {[
            { id: 'all', label: 'All Tools (48)' },
            { id: 'pdf', label: 'PDF Tools' },
            { id: 'images', label: 'Image Tools' },
            { id: 'media', label: 'Video & Audio' },
            { id: 'developer', label: 'Developer & Utilities' },
          ].map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSearchParams(cat.id === 'all' ? {} : { category: cat.id })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#1B1E2E] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2A2E45] border border-zinc-200 dark:border-[#2A2E45]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Display Grouped 8-Column Directory Layout when viewing All Tools without search */}
        {activeCategory === 'all' && !searchQuery ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <Grid className="w-4 h-4" />
                <span>All PDFora Tools Directory (8 Categories • 48 Tools)</span>
              </h3>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden sm:inline">
                Click any tool to launch in-browser
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
              {directoryColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3 min-w-0">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border truncate max-w-full ${col.color}`}>
                      {col.title}
                    </span>

                    <ul className="space-y-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            to={item.path}
                            className="group block hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          >
                            <span className="block font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              • {item.name}
                            </span>
                            <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-normal line-clamp-1">
                              {item.desc}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Filtered Card Grid View */
          <div>
            {filteredTools.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#141622] rounded-3xl border border-zinc-200 dark:border-[#2A2E45] max-w-md mx-auto my-8 space-y-3 p-8">
                <Search className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-white">No tools found matching your search</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Try clearing your search query or selecting another category tab.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTools.map(tool => {
                  const Icon = iconMap[tool.iconName] || FileText;

                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group flex flex-col justify-between p-5 bg-white dark:bg-[#141622] rounded-2xl border border-zinc-200/80 dark:border-[#2A2E45] hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-150"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <Icon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider">
                            {tool.badge || tool.category}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                          {tool.shortDesc || tool.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-[#2A2E45] text-xs font-bold text-purple-600 dark:text-purple-400">
                        <span>Open Tool</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
