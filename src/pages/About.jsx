import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Award, Sparkles, CheckCircle2, ShieldCheck,
  Zap, Globe, ArrowRight, Lock, Cpu
} from 'lucide-react';

const commitments = [
  {
    icon: ShieldCheck,
    title: 'Zero Server Storage',
    desc: 'Your documents are processed locally inside your web browser sandbox. Files never upload to or persist on remote servers.',
  },
  {
    icon: Cpu,
    title: 'Client-Side In-Browser Engine',
    desc: 'Using modern WebAssembly and JavaScript pipelines, conversions happen directly on your device with zero transfer latency.',
  },
  {
    icon: Lock,
    title: 'No Account Required',
    desc: 'Convert, merge, split, and compress files instantly without creating an account, subscription, or providing personal details.',
  },
  {
    icon: Globe,
    title: 'Works on Any Device',
    desc: 'PDFora is fully responsive and runs seamlessly in any modern web browser across desktop, tablet, iPhone, and Android.',
  },
];

const values = [
  {
    icon: Zap,
    title: 'Instant Speed',
    desc: 'Direct in-browser execution delivers instantaneous document rendering and conversion with zero upload wait times.',
  },
  {
    icon: CheckCircle2,
    title: 'Simplicity',
    desc: 'A clean, distraction-free interface with no complex setups, artificial daily caps, or hidden paywalls.',
  },
  {
    icon: ShieldCheck,
    title: 'Complete Privacy',
    desc: 'Your confidential contracts, tax forms, and personal files stay securely in your device memory at all times.',
  },
];

export default function About() {
  const location = useLocation();
  return (
    <div className="pt-16 pb-20 min-h-screen">
      <Helmet>
        <title>About Us — PDFora | Free, Private & Secure Online PDF Tools</title>
        <meta name="description" content="Learn about PDFora, a fast, private, in-browser online PDF suite built for students, professionals, and businesses worldwide." />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'radial-gradient(ellipse 85% 55% at 50% -5%, #DBEAFE 0%, #FFFFFF 68%)',
          borderBottom: '1px solid #BFDBFE',
        }}
        aria-labelledby="about-heading"
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
            <span>Privacy-First PDF Suite</span>
          </div>
          <h1
            id="about-heading"
            className="text-3xl sm:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            About PDFora
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto" style={{ color: '#52525B' }}>
            PDFora was built with one clear mission: document tools should be instant,
            100% free, and strictly private for everyone worldwide.
          </p>
        </div>
      </section>

      {/* ── Story & Commitments ───────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — Story */}
          <div className="space-y-6">
            <div>
              <span className="section-label">Our Mission</span>
              <h2
                className="text-2xl sm:text-3xl font-extrabold mt-2"
                style={{ color: '#18181B', letterSpacing: '-0.03em' }}
              >
                Built for Students, Freelancers &amp; Professionals Worldwide
              </h2>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: '#52525B' }}>
              Every day, millions of students, university researchers, freelancers, and businesses need to convert, combine, or compress PDF documents. Traditional online converters upload your sensitive contracts, resumes, and personal documents to distant third-party servers.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#52525B' }}>
              PDFora revolutionizes this experience by executing text formatting, layout structuring, and image processing directly inside your modern browser sandbox. Your confidential files never leave your device, ensuring maximum security and zero transfer latency.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { value: '100%',   label: 'Free & Open Tools' },
                { value: '0 Bytes', label: 'Server File Storage' },
                { value: 'Client', label: 'In-Browser Engine' },
                { value: '0',      label: 'Accounts Required' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
                  }}
                >
                  <div
                    className="text-2xl font-black"
                    style={{ color: '#3B82F6', letterSpacing: '-0.03em' }}
                  >
                    {value}
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mt-1"
                    style={{ color: '#71717A' }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Core Commitments Card */}
          <div
            className="rounded-3xl p-7 space-y-5"
            style={{
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              boxShadow: '0 8px 32px rgba(59, 130, 246,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <h3
              className="text-base font-bold flex items-center gap-2"
              style={{ color: '#18181B' }}
            >
              <Award className="w-5 h-5 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
              Core Commitments
            </h3>

            <div className="space-y-4">
              {commitments.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#DBEAFE', color: '#3B82F6' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#18181B' }}>{title}</h4>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#71717A' }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #BFDBFE', paddingTop: '1rem' }}>
              <Link
                to="/tools"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 14px rgba(59, 130, 246,0.28)',
                  textDecoration: 'none',
                }}
              >
                Explore PDF Tools
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values Section ────────────────────────────────── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: '#EFF6FF', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}
        aria-labelledby="values-heading"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="section-label">Our Values</span>
            <h2
              id="values-heading"
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: '#18181B', letterSpacing: '-0.03em' }}
            >
              What We Stand For
            </h2>
            <p className="text-sm" style={{ color: '#71717A' }}>
              Three principles that guide every design and engineering decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl text-center space-y-3"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                  style={{ background: '#DBEAFE', color: '#3B82F6' }}
                  aria-hidden="true"
                >
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold" style={{ color: '#18181B' }}>
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" aria-label="Get started with PDFora">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: '#18181B', letterSpacing: '-0.03em' }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>
            Try any of our {8} PDF tools — completely free, with no sign-up or installation.
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              boxShadow: '0 6px 20px rgba(59, 130, 246,0.30)',
              textDecoration: 'none',
            }}
          >
            Browse All Tools
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

    </div>
  );
}
