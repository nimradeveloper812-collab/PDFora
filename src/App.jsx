import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CookieConsent from './components/common/CookieConsent';

const Home = lazy(() => import('./pages/Home'));
const AllTools = lazy(() => import('./pages/AllTools'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

const WordToPdf = lazy(() => import('./pages/tools/WordToPdf'));
const ExcelToPdf = lazy(() => import('./pages/tools/ExcelToPdf'));
const PowerPointToPdf = lazy(() => import('./pages/tools/PowerPointToPdf'));
const JpgToPdf = lazy(() => import('./pages/tools/JpgToPdf'));
const PdfToJpg = lazy(() => import('./pages/tools/PdfToJpg'));
const MergePdf = lazy(() => import('./pages/tools/MergePdf'));
const CompressPdf = lazy(() => import('./pages/tools/CompressPdf'));
const SplitPdf = lazy(() => import('./pages/tools/SplitPdf'));
const ImageBackgroundRemover = lazy(() => import('./pages/tools/ImageBackgroundRemover'));
const ImageCompressor = lazy(() => import('./pages/tools/ImageCompressor'));
const PdfToWord = lazy(() => import('./pages/tools/PdfToWord'));
const PdfToExcel = lazy(() => import('./pages/tools/PdfToExcel'));
const ExcelToWord = lazy(() => import('./pages/tools/ExcelToWord'));
const WordToExcel = lazy(() => import('./pages/tools/WordToExcel'));
const VideoToAudio = lazy(() => import('./pages/tools/VideoToAudio'));
const AudioCompressor = lazy(() => import('./pages/tools/AudioCompressor'));
const ImageConverter = lazy(() => import('./pages/tools/ImageConverter'));
const VideoConverter = lazy(() => import('./pages/tools/VideoConverter'));
const VideoCompressor = lazy(() => import('./pages/tools/VideoCompressor'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div 
        className="w-10 h-10 rounded-full border-3 border-zinc-200 animate-spin" 
        style={{ borderTopColor: '#3B82F6' }} 
      />
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Core Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<AllTools />} />
            <Route path="/all-tools" element={<Navigate to="/tools" replace />} />
            
            {/* 19 Primary Tool Routes (Clean Canonical URLs) */}
            <Route path="/word-to-pdf" element={<WordToPdf />} />
            <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
            <Route path="/powerpoint-to-pdf" element={<PowerPointToPdf />} />
            <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/merge-pdf" element={<MergePdf />} />
            <Route path="/compress-pdf" element={<CompressPdf />} />
            <Route path="/split-pdf" element={<SplitPdf />} />
            <Route path="/image-background-remover" element={<ImageBackgroundRemover />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/pdf-to-word" element={<PdfToWord />} />
            <Route path="/pdf-to-excel" element={<PdfToExcel />} />
            <Route path="/excel-to-word" element={<ExcelToWord />} />
            <Route path="/word-to-excel" element={<WordToExcel />} />
            <Route path="/video-to-audio" element={<VideoToAudio />} />
            <Route path="/audio-compressor" element={<AudioCompressor />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/video-converter" element={<VideoConverter />} />
            <Route path="/video-compressor" element={<VideoCompressor />} />

            {/* Permanent Redirects for legacy /tools/:slug routes to prevent duplicate indexation */}
            <Route path="/tools/word-to-pdf" element={<Navigate to="/word-to-pdf" replace />} />
            <Route path="/tools/excel-to-pdf" element={<Navigate to="/excel-to-pdf" replace />} />
            <Route path="/tools/powerpoint-to-pdf" element={<Navigate to="/powerpoint-to-pdf" replace />} />
            <Route path="/tools/jpg-to-pdf" element={<Navigate to="/jpg-to-pdf" replace />} />
            <Route path="/tools/pdf-to-jpg" element={<Navigate to="/pdf-to-jpg" replace />} />
            <Route path="/tools/merge-pdf" element={<Navigate to="/merge-pdf" replace />} />
            <Route path="/tools/compress-pdf" element={<Navigate to="/compress-pdf" replace />} />
            <Route path="/tools/split-pdf" element={<Navigate to="/split-pdf" replace />} />
            <Route path="/tools/image-background-remover" element={<Navigate to="/image-background-remover" replace />} />
            <Route path="/tools/image-compressor" element={<Navigate to="/image-compressor" replace />} />
            <Route path="/tools/pdf-to-word" element={<Navigate to="/pdf-to-word" replace />} />
            <Route path="/tools/pdf-to-excel" element={<Navigate to="/pdf-to-excel" replace />} />
            <Route path="/tools/excel-to-word" element={<Navigate to="/excel-to-word" replace />} />
            <Route path="/tools/word-to-excel" element={<Navigate to="/word-to-excel" replace />} />
            <Route path="/tools/video-to-audio" element={<Navigate to="/video-to-audio" replace />} />
            <Route path="/tools/audio-compressor" element={<Navigate to="/audio-compressor" replace />} />
            <Route path="/tools/image-converter" element={<Navigate to="/image-converter" replace />} />
            <Route path="/tools/video-converter" element={<Navigate to="/video-converter" replace />} />
            <Route path="/tools/video-compressor" element={<Navigate to="/video-compressor" replace />} />

            {/* Common Alias Redirects */}
            <Route path="/compress-image" element={<Navigate to="/image-compressor" replace />} />
            <Route path="/remove-bg" element={<Navigate to="/image-background-remover" replace />} />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />

            {/* Informational Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieConsent />
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
