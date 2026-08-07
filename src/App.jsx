import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import AllTools from './pages/AllTools';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import WordToPdf from './pages/tools/WordToPdf';
import ExcelToPdf from './pages/tools/ExcelToPdf';
import PowerPointToPdf from './pages/tools/PowerPointToPdf';
import JpgToPdf from './pages/tools/JpgToPdf';
import PdfToJpg from './pages/tools/PdfToJpg';
import MergePdf from './pages/tools/MergePdf';
import CompressPdf from './pages/tools/CompressPdf';
import SplitPdf from './pages/tools/SplitPdf';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-center px-4" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -5%, #FCE7F3 0%, #FFFFFF 70%)' }}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-8xl font-black leading-none select-none" style={{ color: '#F1D5E3', letterSpacing: '-0.05em' }} aria-hidden="true">
          404
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: '#FCE7F3' }}>
          <svg className="w-8 h-8" style={{ color: '#E85D9E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold" style={{ color: '#18181B', letterSpacing: '-0.025em' }}>Page Not Found</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#71717A' }}>The page you're looking for doesn't exist or may have been moved.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </a>
          <a href="/tools" className="btn-secondary" style={{ textDecoration: 'none' }}>Browse Tools</a>
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<AllTools />} />
          <Route path="/tools/word-to-pdf" element={<WordToPdf />} />
          <Route path="/tools/excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="/tools/powerpoint-to-pdf" element={<PowerPointToPdf />} />
          <Route path="/tools/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="/tools/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/tools/merge-pdf" element={<MergePdf />} />
          <Route path="/tools/compress-pdf" element={<CompressPdf />} />
          <Route path="/tools/split-pdf" element={<SplitPdf />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </HelmetProvider>
  );
}
