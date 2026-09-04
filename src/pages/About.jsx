import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ShieldCheck, Zap, Globe,
  ArrowRight, Lock, Cpu, Heart, Users, Mail, FileCheck,
  Award, EyeOff, ServerOff, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const corePillars = [
    {
      icon: EyeOff,
      title: 'Zero File Retention & In-Browser Privacy',
      desc: 'Your documents never touch external servers for standard operations. Processing occurs client-side in your browser memory (RAM) via WebAssembly and Canvas pipelines. When your tab closes, your memory is completely cleared.',
    },
    {
      icon: Zap,
      title: 'Zero Latency & Near-Instant Processing',
      desc: 'Because documents are processed locally on your device rather than uploaded to remote cloud servers, there are no upload bottlenecks or queuing delays. Tasks complete in seconds.',
    },
    {
      icon: Lock,
      title: 'No Paywalls, Accounts or Credit Cards',
      desc: 'Every single one of our 70+ tools is 100% free. No artificial limits, no hidden subscriptions, no email registration requirements, and no surprise paywalls.',
    },
    {
      icon: Globe,
      title: 'Universal Cross-Platform Compatibility',
      desc: 'Engineered to work seamlessly across Windows, macOS, Linux, iOS (iPhone & iPad), and Android on modern browsers including Chrome, Safari, Firefox, and Edge.',
    },
  ];

  const aboutFaqs = [
    {
      q: 'Who created PDFora and who runs it?',
      a: 'PDFora was conceived, engineered, and launched by Nimra and the engineering team behind nimradev.site. We are a specialized team of software engineers, UI designers, and privacy advocates dedicated to creating open, accessible, and privacy-preserving web utilities for users worldwide.'
    },
    {
      q: 'How does PDFora remain completely free?',
      a: 'PDFora is sustainably funded through clean, non-intrusive contextual advertising powered by Google AdSense. We do not sell user data, we do not require paid subscriptions, and we never place digital watermarks on your processed documents.'
    },
    {
      q: 'Are my confidential documents safe on PDFora?',
      a: 'Yes, 100%. For all client-side tools (including Compress PDF, Merge PDF, Split PDF, Rotate PDF, Protect PDF, Unlock PDF, and Sign PDF), your files never leave your computer or smartphone. For complex conversions that require backend assistance (such as legacy Office parsing), files are transmitted over TLS 1.3 encryption and permanently purged immediately after download.'
    },
    {
      q: 'Can PDFora or any third party view the content of my files?',
      a: 'No. Our client-side tools run in your browser sandbox, meaning our servers never receive the file data. We have zero technical ability to read, copy, inspect, or archive your documents.'
    }
  ];

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://pdfora.nimradev.site/about#about',
    'name': 'About PDFora — Privacy-First Document & File Productivity Platform',
    'url': 'https://pdfora.nimradev.site/about',
    'description': 'Learn about PDFora, our privacy-first in-browser document processing architecture, our mission, and the engineering team behind the platform.',
    'publisher': {
      '@type': 'Organization',
      'name': 'PDFora',
      'url': 'https://pdfora.nimradev.site',
      'logo': 'https://pdfora.nimradev.site/pdfora-logo.png',
      'founder': {
        '@type': 'Person',
        'name': 'Nimra',
        'jobTitle': 'Lead Software Engineer & Platform Founder',
        'url': 'https://nimradev.site'
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'email': 'contact@nimradev.site',
        'contactType': 'Customer Support'
      }
    }
  };

  return (
    <div className="pt-14 pb-20 min-h-screen bg-zinc-50/60 dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>About Us — PDFora | Free &amp; Private In-Browser Document Suite</title>
        <meta
          name="description"
          content="Learn about PDFora — a fast, 100% private in-browser document suite built by Nimra and the engineering team. Discover our privacy architecture and mission."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/about" />
        <script type="application/ld+json">
          {JSON.stringify(aboutSchema)}
        </script>
      </Helmet>

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-zinc-900 dark:text-white" aria-current="page">About Us</span>
        </nav>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Built by Developers, for Everyday Users Worldwide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            About PDFora
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            We believe essential digital productivity tools should be fast, private, free, and accessible to everyone — without corporate paywalls, tracking cookies, or forced registrations.
          </p>
        </div>
      </section>

      {/* ── Founder Story & Mission ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Story Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Our Origin &amp; Mission</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Why we started PDFora and the problem we set out to solve</p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p>
              PDFora was born out of a real frustration shared by millions of students, freelancers, office workers, and small business owners around the world. Every time you need to compress a PDF for a job portal, combine two contracts, or extract text from a scanned receipt, mainstream online tools demand:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
              <li>Signing up with personal email addresses and verifying phone numbers</li>
              <li>Uploading sensitive personal, medical, or corporate documents to unknown third-party cloud servers</li>
              <li>Paying steep recurring subscriptions ($15 to $30 every month) just to delete or rotate a single page</li>
              <li>Tolerating low-quality document watermarks plastered across important legal agreements</li>
            </ul>
            <p>
              We knew the modern web could do drastically better. Advances in browser computing — specifically <strong>WebAssembly (Wasm)</strong>, <strong>HTML5 Canvas</strong>, and <strong>Web Workers</strong> — now allow modern computers and smartphones to execute complex file manipulations locally inside the browser, at near-native hardware speed.
            </p>
            <p>
              That realization became our mission: <strong>Build a universal, high-performance document suite where user privacy is guaranteed by architecture, not just by promises.</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
              <strong className="font-bold">Our Core Architectural Guarantee:</strong> We do not store, inspect, log, or harvest your documents. For standard operations, files are processed directly in your browser's local RAM.
            </div>
          </div>
        </div>

        {/* The Team & Creator Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Who Is Behind PDFora?</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Meet the engineering team behind the platform</p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p>
              PDFora is designed, developed, and maintained by <strong>Nimra</strong> (Lead Full-Stack Engineer and Platform Architect at <a href="https://nimradev.site" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline font-semibold">nimradev.site</a>) alongside a dedicated team of frontend specialists and security researchers.
            </p>
            <p>
              With extensive experience in client-side performance optimization, high-throughput Node.js microservices, and web standards compliance, our team continually improves PDFora to ensure lightning-fast execution, zero-downtime reliability, and strict adherence to global privacy regulations, including the <strong>General Data Protection Regulation (GDPR)</strong> and <strong>California Consumer Privacy Act (CCPA)</strong>.
            </p>
          </div>

          {/* Contact Bar */}
          <div className="pt-3 border-t border-zinc-100 dark:border-[#2A2E45] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Mail className="w-4 h-4 text-purple-600" />
              <span>Direct Founder &amp; Support Email:</span>
              <a href="mailto:contact@nimradev.site" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
                contact@nimradev.site
              </a>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Visit Contact &amp; Support Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 4 Core Pillars Grid ──────────────────────────────── */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Our 4 Guiding Principles</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">The values that govern every feature and line of code we ship</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {corePillars.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Platform Milestones / Metrics ────────────────────── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-[#2A2E45]">
            <div className="p-2 space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">70+</p>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Free Tools</p>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">0 Bytes</p>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Files Retained</p>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">100%</p>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Free to Use</p>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">TLS 1.3</p>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Bank-Grade Security</p>
            </div>
          </div>
        </div>

        {/* ── Frequently Asked Questions ──────────────────────── */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Common Questions About PDFora</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Transparency is central to everything we do</p>
          </div>

          <div className="space-y-3">
            {aboutFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] space-y-1.5"
              >
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Call to Action ───────────────────────────── */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-center space-y-4 shadow-md">
          <h3 className="text-2xl font-bold">Experience Private Document Productivity</h3>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto leading-relaxed">
            Try our suite of 70+ utilities today. No registration, no watermarks, and complete peace of mind.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/tools"
              className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 transition-colors shadow-xs"
            >
              Browse All Tools
            </Link>
            <Link
              to="/blog"
              className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-white font-bold text-xs border border-purple-400/40 transition-colors"
            >
              Read Guides &amp; Tutorials
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
