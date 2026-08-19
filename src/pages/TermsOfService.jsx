import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Sparkles } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the PDFora platform (pdfora.nimradev.site) and its document utilities, you confirm that you are at least 13 years of age and that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please discontinue use of PDFora immediately.

PDFora reserves the right to update these Terms periodically. Continued use of the platform following published modifications constitutes acceptance of the revised Terms.`,
  },
  {
    title: '2. Description of Service',
    content: `PDFora provides a suite of fast, in-browser document transformation tools including:

• Converting Word (.docx, .doc), Excel (.xlsx, .xls), and PowerPoint (.pptx, .ppt) files to PDF
• Converting images (JPG, PNG, WEBP, BMP) to PDF documents
• Extracting and converting PDF pages to JPG images
• Merging multiple PDF files into a single unified document
• Compressing PDF files with adjustable optimization levels
• Splitting PDF documents into individual pages or custom ranges

The service is provided on an "as is" and "as available" basis without charging subscription fees or requiring user account registrations.`,
  },
  {
    title: '3. Acceptable Use & Conduct',
    content: `You agree to use PDFora solely for legitimate and lawful purposes. You must not:

• Process files containing malware, viruses, trojans, or malicious payloads
• Process documents that infringe copyright, trademarks, or intellectual property of third parties
• Attempt to reverse-engineer, decompile, or overload PDFora's web infrastructure through automated denial-of-service or scraping attacks
• Use the service in any manner that violates applicable local, national, or international regulations

PDFora reserves the right to restrict access to users or automated systems violating these principles.`,
  },
  {
    title: '4. User File Ownership & Sandbox Processing',
    content: `You retain 100% ownership and all intellectual property rights to any files you process through PDFora.

**Zero Server File Retention:** Files are processed locally within your browser sandbox. PDFora does not claim any ownership, licence, or copyright over your documents and does not store or copy your files on remote servers.

The PDFora brand name, software code, visual design, and trademarks remain the exclusive intellectual property of PDFora.`,
  },
  {
    title: '5. Free Platform & Usage Guidelines',
    content: `PDFora is provided free of charge supported by contextual advertising. To maintain high performance for all users, reasonable browser resource limits apply:

• Recommended single file size: Up to 50 MB
• Maximum batch size: Up to 10–20 files per session (tool specific)
• Scripted or automated bulk overloading is strictly prohibited without prior written authorisation`,
  },
  {
    title: '6. Disclaimer of Warranties',
    content: `PDFora is provided "as is" without warranty of any kind, whether express, statutory, or implied. While our WebAssembly and rendering engines aim for maximum conversion fidelity, PDFora does not warrant that:

• The service will be 100% error-free or uninterrupted across all complex document layouts
• Complex proprietary fonts or macros will render identically in all non-standard document versions
• The service will meet specific commercial or regulatory archiving requirements

Users are advised to retain backup copies of their original source files.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, PDFora and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service, including data loss or document formatting variations.

Our aggregate liability for any dispute shall not exceed $50.00 USD.`,
  },
  {
    title: '8. Third-Party Links & Advertising',
    content: `PDFora contains advertisements served by Google AdSense and may display links to third-party resources. PDFora does not endorse and is not responsible for the products, services, or privacy practices of external third-party advertisers.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms shall be interpreted and governed in accordance with universally recognized commercial laws and international web standards. Any legal inquiry should be directed to our legal department at contact@nimradev.site.`,
  },
  {
    title: '10. Contact Information',
    content: `For questions or clarifications regarding these Terms of Service, contact our team:

• **Email:** contact@nimradev.site
• **Platform:** PDFora Global Legal & Support
• **Response Window:** 24–48 hours`,
  },
];

export default function TermsOfService() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <Helmet>
        <title>Terms of Service — PDFora | Free Online PDF Suite</title>
        <meta name="description" content="Review the Terms of Service for PDFora. Free, secure, and in-browser online PDF conversion and management utilities." />
        <link rel="canonical" href="https://pdfora.nimradev.site/terms-of-service" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pdfora.nimradev.site/terms-of-service" />
        <meta property="og:title" content="Terms of Service — PDFora" />
        <meta property="og:description" content="Review the Terms of Service for PDFora. Free, secure, and in-browser online PDF conversion and management utilities." />
        <meta property="og:image" content="https://pdfora.nimradev.site/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://pdfora.nimradev.site/terms-of-service" />
        <meta name="twitter:title" content="Terms of Service — PDFora" />
        <meta name="twitter:description" content="Review the Terms of Service for PDFora." />
        <meta name="twitter:image" content="https://pdfora.nimradev.site/og-image.jpg" />
      </Helmet>

      {/* Hero */}
      <section
        className="py-12 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'radial-gradient(ellipse 85% 55% at 50% -5%, #DBEAFE 0%, #FFFFFF 68%)',
          borderBottom: '1px solid #BFDBFE',
        }}
        aria-labelledby="tos-heading"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Legal Agreement</span>
          </div>
          <h1
            id="tos-heading"
            className="text-3xl sm:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: '#71717A' }}>
            Last Updated: <strong style={{ color: '#3F3F46' }}>August 17, 2026</strong>
            &nbsp;&middot;&nbsp; Effective immediately
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#52525B' }}>
            Please read these Terms carefully before using PDFora. They govern your access
            and use of all our free PDF tools and services.
          </p>
        </div>
      </section>

      {/* Quick Summary Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#3B82F6' }} aria-hidden="true" />
          <div>
            <p className="text-sm font-bold" style={{ color: '#18181B' }}>Plain English Summary</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#52525B' }}>
              PDFora is 100% free to use. You own your files. Documents are processed privately in your browser memory without server storage.
              Use the platform fairly and responsibly. Questions? Contact{' '}
              <a href="mailto:contact@nimradev.site" style={{ color: '#3B82F6' }}>contact@nimradev.site</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
        {SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 sm:p-7"
            style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)' }}
          >
            <h2
              className="text-base sm:text-lg font-extrabold mb-4 flex items-start gap-2"
              style={{ color: '#18181B' }}
            >
              <span className="shrink-0" style={{ color: '#3B82F6' }}>{section.title.split('.')[0]}.</span>
              <span>{section.title.split('. ').slice(1).join('. ')}</span>
            </h2>
            <div className="text-sm leading-relaxed space-y-3" style={{ color: '#52525B' }}>
              {section.content.split('\n\n').map((para, i) => (
                <p key={i} className="whitespace-pre-line">{para.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
