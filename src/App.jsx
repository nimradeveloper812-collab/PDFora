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
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<AllTools />} />
            <Route path="/all-tools" element={<Navigate to="/tools" replace />} />
            <Route path="/tools/word-to-pdf" element={<WordToPdf />} />
            <Route path="/tools/excel-to-pdf" element={<ExcelToPdf />} />
            <Route path="/tools/powerpoint-to-pdf" element={<PowerPointToPdf />} />
            <Route path="/tools/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/tools/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/tools/merge-pdf" element={<MergePdf />} />
            <Route path="/tools/compress-pdf" element={<CompressPdf />} />
            <Route path="/tools/split-pdf" element={<SplitPdf />} />
            <Route path="/pdf-to-word" element={<PdfToWord />} />
            <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
            <Route path="/pdf-to-excel" element={<PdfToExcel />} />
            <Route path="/tools/pdf-to-excel" element={<PdfToExcel />} />
            <Route path="/excel-to-word" element={<ExcelToWord />} />
            <Route path="/tools/excel-to-word" element={<ExcelToWord />} />
            <Route path="/word-to-excel" element={<WordToExcel />} />
            <Route path="/tools/word-to-excel" element={<WordToExcel />} />
            <Route path="/image-background-remover" element={<ImageBackgroundRemover />} />
            <Route path="/tools/image-background-remover" element={<ImageBackgroundRemover />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/tools/image-compressor" element={<ImageCompressor />} />
            <Route path="/video-to-audio" element={<VideoToAudio />} />
            <Route path="/tools/video-to-audio" element={<VideoToAudio />} />
            <Route path="/audio-compressor" element={<AudioCompressor />} />
            <Route path="/tools/audio-compressor" element={<AudioCompressor />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/tools/image-converter" element={<ImageConverter />} />
            <Route path="/video-converter" element={<VideoConverter />} />
            <Route path="/tools/video-converter" element={<VideoConverter />} />
            <Route path="/video-compressor" element={<VideoCompressor />} />
            <Route path="/tools/video-compressor" element={<VideoCompressor />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
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
