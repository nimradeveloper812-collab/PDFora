import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ShieldCheck, Zap, Globe, ArrowRight, Lock, Cpu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const commitments = [
    {
      icon: ShieldCheck,
      title: t('aboutCommitment1Title'),
      desc: t('aboutCommitment1Desc'),
    },
    {
      icon: Cpu,
      title: t('aboutCommitment2Title'),
      desc: t('aboutCommitment2Desc'),
    },
    {
      icon: Lock,
      title: t('aboutCommitment3Title'),
      desc: t('aboutCommitment3Desc'),
    },
    {
      icon: Globe,
      title: t('aboutCommitment4Title'),
      desc: t('aboutCommitment4Desc'),
    },
  ];

  return (
    <div className="pt-16 pb-16 min-h-screen bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>About Us — PDFora | Free &amp; Private Document Tools</title>
        <meta name="description" content="Learn about PDFora — a fast, 100% private, in-browser online PDF suite built for everyone." />
        <link rel="canonical" href="https://pdfora.nimradev.site/about" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{t('aboutBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
            {t('aboutTitle')}
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
            {t('aboutDesc')}
          </p>
        </div>
      </section>

      {/* ── Core Commitments Grid ─────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {commitments.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-8 text-center">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md"
          >
            <span>{t('exploreAllPdfTools')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

