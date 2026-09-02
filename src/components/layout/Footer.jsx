import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Globe } from 'lucide-react';
import { TOOLS } from '../../data/toolsData';
import { useLanguage } from '../../context/LanguageContext';

const pdfTools = TOOLS.filter(t => t.category === 'pdf');
const documentTools = TOOLS.filter(t => t.category === 'documents');
const imageTools = TOOLS.filter(t => t.category === 'images');
const mediaTools = TOOLS.filter(t => ['video', 'audio'].includes(t.category));
const devTools = TOOLS.filter(t => t.badge === 'Developer Tool' || t.id.includes('json') || t.id.includes('base64') || t.id.includes('qr'));

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer
      className="mt-6 border-t border-zinc-200 dark:border-[#2A2E45] bg-[#F8FAFC] dark:bg-[#0D0D14] transition-colors"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-5">

          {/* Brand Column */}
          <div className="sm:col-span-2 space-y-2.5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 group"
              aria-label="PDFora home"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #6C3FFC 0%, #4B24C5 100%)',
                }}
              >
                <FileCheck className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white font-heading">
                PDF<span style={{ color: '#6C3FFC' }}>ora</span>
              </span>
            </Link>

            <p className="text-[11px] leading-relaxed max-w-xs text-zinc-600 dark:text-zinc-400 font-sans">
              {t('footerDesc')}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 font-display">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
              <span>{t('footerSandbox')}</span>
            </div>
          </div>

          {/* PDF Tools Column */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-900 dark:text-white font-display">
              {t('footerPdfSuite')}
            </h4>
            <ul className="space-y-1">
              {pdfTools.slice(0, 7).map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {t(tool)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Tools Column */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-900 dark:text-white font-display">
              {t('footerConvertEdit')}
            </h4>
            <ul className="space-y-1">
              {documentTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {t(tool)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image & Media Tools Column */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-900 dark:text-white font-display">
              {t('footerImageMedia')}
            </h4>
            <ul className="space-y-1">
              {imageTools.slice(0, 5).map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {t(tool)}
                  </Link>
                </li>
              ))}
              {mediaTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans truncate block"
                  >
                    {t(tool)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support Column */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-900 dark:text-white font-display">
              {t('footerCompany')}
            </h4>
            <ul className="space-y-1">
              <li><Link to="/tools" className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">{t('footerAllTools')}</Link></li>
              <li><Link to="/about" className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">{t('footerAbout')}</Link></li>
              <li><Link to="/contact" className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">{t('footerContact')}</Link></li>
              <li><Link to="/privacy-policy" className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">{t('footerPrivacy')}</Link></li>
              <li><Link to="/terms-of-service" className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">{t('footerTerms')}</Link></li>
              <li><Link to="/disclaimer" className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-sans block">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-[#2A2E45] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans text-center sm:text-left">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <Globe className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>{t('copyright')}</span>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
            aria-label="Legal and advertising policy links"
          >
            <Link
              to="/privacy-policy"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('footerPrivacyCookies')}
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('footerTermsShort')}
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              to="/about"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              to="/contact"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('support')}
            </Link>
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('footerAds')}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
