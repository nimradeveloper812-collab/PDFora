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

const RotatePdf = lazy(() => import('./pages/tools/RotatePdf'));
const WatermarkPdf = lazy(() => import('./pages/tools/WatermarkPdf'));
const AddPageNumbersPdf = lazy(() => import('./pages/tools/AddPageNumbersPdf'));
const ProtectPdf = lazy(() => import('./pages/tools/ProtectPdf'));
const UnlockPdf = lazy(() => import('./pages/tools/UnlockPdf'));
const CropPdf = lazy(() => import('./pages/tools/CropPdf'));

const RepairPdf = lazy(() => import('./pages/tools/RepairPdf'));
const RemovePagesPdf = lazy(() => import('./pages/tools/RemovePagesPdf'));
const ScanToPdf = lazy(() => import('./pages/tools/ScanToPdf'));
const PdfToPowerpoint = lazy(() => import('./pages/tools/PdfToPowerpoint'));
const HtmlToPdf = lazy(() => import('./pages/tools/HtmlToPdf'));
const PdfToPdfA = lazy(() => import('./pages/tools/PdfToPdfA'));
const SignPdf = lazy(() => import('./pages/tools/SignPdf'));
const RedactPdf = lazy(() => import('./pages/tools/RedactPdf'));
const EditPdf = lazy(() => import('./pages/tools/EditPdf'));
const ComparePdf = lazy(() => import('./pages/tools/ComparePdf'));
const PdfForms = lazy(() => import('./pages/tools/PdfForms'));

const JsonToCsv = lazy(() => import('./pages/tools/JsonToCsv'));
const Base64ToPdf = lazy(() => import('./pages/tools/Base64ToPdf'));

const PdfToText = lazy(() => import('./pages/tools/PdfToText'));
const CompressToKb = lazy(() => import('./pages/tools/CompressToKb'));
const ChangeBackground = lazy(() => import('./pages/tools/ChangeBackground'));
const ResizeImage = lazy(() => import('./pages/tools/ResizeImage'));
const CropImage = lazy(() => import('./pages/tools/CropImage'));
const PngToSvg = lazy(() => import('./pages/tools/PngToSvg'));
const JsonFormatter = lazy(() => import('./pages/tools/JsonFormatter'));
const QrGenerator = lazy(() => import('./pages/tools/QrGenerator'));

const PngToPdf = lazy(() => import('./pages/tools/PngToPdf'));
const PdfToPng = lazy(() => import('./pages/tools/PdfToPng'));
const HeicToPng = lazy(() => import('./pages/tools/HeicToPng'));
const WebpToPng = lazy(() => import('./pages/tools/WebpToPng'));
const SvgToPng = lazy(() => import('./pages/tools/SvgToPng'));
const HeicToJpg = lazy(() => import('./pages/tools/HeicToJpg'));
const BmpToJpg = lazy(() => import('./pages/tools/BmpToJpg'));
const TiffToJpg = lazy(() => import('./pages/tools/TiffToJpg'));
const JfifToJpeg = lazy(() => import('./pages/tools/JfifToJpeg'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div 
        className="w-10 h-10 rounded-full border-3 border-zinc-200 animate-spin" 
        style={{ borderTopColor: '#6C3FFC' }} 
      />
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
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
            <Route path="/rotate-pdf" element={<RotatePdf />} />
            <Route path="/watermark-pdf" element={<WatermarkPdf />} />
            <Route path="/add-page-numbers-pdf" element={<AddPageNumbersPdf />} />
            <Route path="/protect-pdf" element={<ProtectPdf />} />
            <Route path="/unlock-pdf" element={<UnlockPdf />} />
            <Route path="/crop-pdf" element={<CropPdf />} />
            <Route path="/repair-pdf" element={<RepairPdf />} />
            <Route path="/remove-pages-pdf" element={<RemovePagesPdf />} />
            <Route path="/remove-pages" element={<Navigate to="/remove-pages-pdf" replace />} />
            <Route path="/scan-to-pdf" element={<ScanToPdf />} />
            <Route path="/pdf-to-powerpoint" element={<PdfToPowerpoint />} />
            <Route path="/html-to-pdf" element={<HtmlToPdf />} />
            <Route path="/pdf-to-pdfa" element={<PdfToPdfA />} />
            <Route path="/sign-pdf" element={<SignPdf />} />
            <Route path="/redact-pdf" element={<RedactPdf />} />
            <Route path="/edit-pdf" element={<EditPdf />} />
            <Route path="/compare-pdf" element={<ComparePdf />} />
            <Route path="/pdf-forms" element={<PdfForms />} />
            <Route path="/json-to-csv" element={<JsonToCsv />} />
            <Route path="/base64-to-pdf" element={<Base64ToPdf />} />

            <Route path="/pdf-to-text" element={<PdfToText />} />
            <Route path="/compress-to-kb" element={<CompressToKb />} />
            <Route path="/change-background" element={<ChangeBackground />} />
            <Route path="/resize-image" element={<ResizeImage />} />
            <Route path="/crop-image" element={<CropImage />} />
            <Route path="/png-to-svg" element={<PngToSvg />} />
            <Route path="/json-formatter" element={<JsonFormatter />} />
            <Route path="/qr-generator" element={<QrGenerator />} />

            <Route path="/png-to-pdf" element={<PngToPdf />} />
            <Route path="/pdf-to-png" element={<PdfToPng />} />
            <Route path="/heic-to-png" element={<HeicToPng />} />
            <Route path="/webp-to-png" element={<WebpToPng />} />
            <Route path="/svg-to-png" element={<SvgToPng />} />
            <Route path="/heic-to-jpg" element={<HeicToJpg />} />
            <Route path="/bmp-to-jpg" element={<BmpToJpg />} />
            <Route path="/tiff-to-jpg" element={<TiffToJpg />} />
            <Route path="/jfif-to-jpeg" element={<JfifToJpeg />} />
            <Route path="/image-background-remover" element={<ImageBackgroundRemover />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/pdf-to-word" element={<PdfToWord />} />
            <Route path="/pdf-to-excel" element={<PdfToExcel />} />
            <Route path="/excel-to-word" element={<ExcelToWord />} />
            <Route path="/word-to-excel" element={<WordToExcel />} />
            <Route path="/video-to-audio" element={<VideoToAudio />} />
            <Route path="/audio-compressor" element={<AudioCompressor />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/jpg-to-png" element={<ImageConverter defaultFormat="png" />} />
            <Route path="/png-to-jpg" element={<ImageConverter defaultFormat="jpg" />} />
            <Route path="/webp-to-jpg" element={<ImageConverter defaultFormat="jpg" />} />
            <Route path="/jpg-to-webp" element={<ImageConverter defaultFormat="webp" />} />
            <Route path="/png-to-webp" element={<ImageConverter defaultFormat="webp" />} />
            <Route path="/webp-to-png" element={<ImageConverter defaultFormat="png" />} />
            <Route path="/heic-to-jpg" element={<ImageConverter defaultFormat="jpg" />} />
            <Route path="/heic-to-png" element={<ImageConverter defaultFormat="png" />} />
            <Route path="/svg-to-png" element={<ImageConverter defaultFormat="png" />} />
            <Route path="/avif-to-jpg" element={<ImageConverter defaultFormat="jpg" />} />
            <Route path="/avif-to-png" element={<ImageConverter defaultFormat="png" />} />
            <Route path="/gif-to-png" element={<ImageConverter defaultFormat="png" />} />
            <Route path="/bmp-to-jpg" element={<ImageConverter defaultFormat="jpg" />} />
            <Route path="/tiff-to-jpg" element={<ImageConverter defaultFormat="jpg" />} />

            <Route path="/video-converter" element={<VideoConverter />} />
            <Route path="/mp4-to-mp3" element={<VideoToAudio />} />
            <Route path="/mp4-to-gif" element={<VideoConverter defaultFormat="gif" />} />
            <Route path="/mov-to-mp4" element={<VideoConverter defaultFormat="mp4" />} />
            <Route path="/webm-to-mp4" element={<VideoConverter defaultFormat="mp4" />} />
            <Route path="/avi-to-mp4" element={<VideoConverter defaultFormat="mp4" />} />
            <Route path="/mkv-to-mp4" element={<VideoConverter defaultFormat="mp4" />} />
            <Route path="/mp4-to-webm" element={<VideoConverter defaultFormat="webm" />} />
            <Route path="/mp4-to-mov" element={<VideoConverter defaultFormat="mov" />} />
            <Route path="/mp4-to-avi" element={<VideoConverter defaultFormat="avi" />} />
            <Route path="/mute-video" element={<VideoToAudio />} />
            <Route path="/video-compressor" element={<VideoCompressor />} />

            {/* Redirects */}
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

            <Route path="/compress-image" element={<Navigate to="/image-compressor" replace />} />
            <Route path="/remove-bg" element={<Navigate to="/image-background-remover" replace />} />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />

            {/* Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* 404 */}
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
