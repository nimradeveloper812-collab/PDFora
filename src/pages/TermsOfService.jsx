import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Sparkles } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the PDFora platform (pdfora.nimradev.site) and its tools, you confirm that you are at least 13 years of age and that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree with any part of these Terms, please discontinue use of PDFora immediately.

PDFora reserves the right to update these Terms at any time. Continued use of the platform following published modifications constitutes your acceptance of the revised Terms. We will update the "Last Updated" date at the top of this page to reflect any changes.`,
  },
  {
    title: '2. Description of Service',
    content: `PDFora provides a comprehensive suite of free, browser-based tools for file conversion, compression, editing, and management, including:

• Converting Word (.docx, .doc), Excel (.xlsx, .xls), and PowerPoint (.pptx, .ppt) files to PDF
• Converting images (JPG, PNG, WEBP, HEIC, BMP, TIFF, SVG) to and from PDF
• Merging, splitting, compressing, rotating, watermarking, and editing PDF files
• Image editing tools: background removal, resizing, cropping, format conversion
• Video and audio conversion and compression tools
• Developer utilities: JSON formatter, QR code generator, Base64 converter

The service is provided on an "as is" and "as available" basis, free of charge and without requiring user account registration.`,
  },
  {
    title: '3. Acceptable Use & Conduct',
    content: `You agree to use PDFora solely for legitimate and lawful purposes. You must NOT use PDFora to:

• Upload, process, or distribute files containing malware, viruses, trojans, or any malicious code
• Process documents that infringe copyright, trademarks, patents, or other intellectual property rights of third parties
• Distribute, share, or process any illegal, harmful, obscene, defamatory, or abusive content
• Attempt to reverse-engineer, decompile, hack, or disrupt PDFora's infrastructure through automated attacks or scraping
• Use automated bots or scripts to make excessive requests that overload or abuse our platform
• Violate any applicable local, national, or international regulations or laws

PDFora reserves the right to restrict or terminate access for any user or system found violating these principles, without prior notice.`,
  },
  {
    title: '4. User File Ownership & Intellectual Property',
    content: `**Your Files:** You retain 100% ownership and all intellectual property rights to any files you upload or process through PDFora. By uploading files, you grant PDFora a temporary, limited license to process those files solely for the purpose of delivering the requested service. This license expires immediately when processing is complete and files are deleted.

**PDFora's IP:** The PDFora brand name, logo, software code, visual design, and trademarks are the exclusive intellectual property of PDFora. You may not reproduce, copy, modify, or distribute any part of our platform without explicit written permission.

**Zero Server File Retention:** Uploaded files are automatically deleted from our servers immediately after processing. PDFora does not claim any ownership or copyright over your documents.`,
  },
  {
    title: '5. Free Platform & Fair Usage Guidelines',
    content: `PDFora is provided completely free of charge, supported by contextual advertising. To maintain high performance and reliability for all users, the following fair usage guidelines apply:

• Recommended maximum single file size: Up to 50 MB
• Maximum batch size: Up to 10–20 files per session (varies by tool)
• Scripted, automated, or programmatic bulk processing is strictly prohibited without prior written authorization
• Attempting to circumvent file size or rate limits through any technical means is not permitted

These guidelines ensure a fast, reliable experience for all users of our free platform.`,
  },
  {
    title: '6. Disclaimer of Warranties',
    content: `PDFora is provided "as is" and "as available" without warranty of any kind, whether express, statutory, or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

While our processing engines aim for maximum conversion fidelity, PDFora does not warrant that:

• The service will be 100% error-free or uninterrupted at all times
• Complex proprietary fonts, macros, or embedded media will render identically in all document versions
• The service will meet specific commercial, legal, or regulatory archiving requirements
• Results will always match the quality of dedicated desktop software for complex layouts

**We strongly recommend keeping backup copies of all important files before uploading them to any online service, including PDFora.**`,
  },
  {
    title: '7. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, PDFora and its operators shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages resulting from:

• Your use of or inability to use the service
• Any errors or interruptions in service
• Data loss or document formatting variations during processing
• Unauthorized access to or alteration of your transmissions or data

Our aggregate liability for any dispute arising from use of PDFora shall not exceed $50.00 USD. Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so these limitations may not apply to you.`,
  },
  {
    title: '8. Third-Party Links & Advertising',
    content: `PDFora displays interest-based advertisements served by **Google AdSense** and may contain links to third-party websites and resources. PDFora does not endorse and is not responsible for the content, products, services, or privacy practices of any external advertiser or linked website.

**Interest-Based Advertising:** Google AdSense may use cookies and anonymous identifiers to serve ads based on your prior visits to PDFora and other websites. You can opt out of interest-based advertising by visiting https://www.google.com/settings/ads or https://www.aboutads.info/choices.

**Opting Out:** Opting out means you will continue to see ads, but they may not be tailored to your specific interests.`,
  },
  {
    title: '9. Governing Law & Dispute Resolution',
    content: `These Terms shall be interpreted and governed in accordance with universally recognized commercial and internet law principles. Any legal inquiry or dispute arising from your use of PDFora should first be directed to our support team at contact@nimradev.site for good-faith resolution.

We are committed to resolving any concerns or complaints promptly and fairly.`,
  },
  {
    title: '10. Contact Information',
    content: `For questions, clarifications, or concerns regarding these Terms of Service, please contact our team:

• **Email:** contact@nimradev.site
• **Platform:** PDFora — pdfora.nimradev.site
• **Response Window:** 24–48 business hours

By using PDFora, you acknowledge that you have read, understood, and agree to these Terms of Service.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="pt-16 pb-20 min-h-screen bg-white dark:bg-[#0D0D14] text-zinc-900 dark:text-white transition-colors">
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
        className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-[#F8FAFC] dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] transition-colors"
        aria-labelledby="tos-heading"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>Legal Agreement</span>
          </div>
          <h1
            id="tos-heading"
            className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white font-heading"
          >
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Last Updated: <strong className="text-zinc-700 dark:text-zinc-200">August 25, 2026</strong>
            &nbsp;&middot;&nbsp; Effective immediately
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto text-zinc-600 dark:text-zinc-300 font-sans">
            Please read these Terms carefully before using PDFora. They govern your access
            and use of all our free PDF tools and services.
          </p>
        </div>
      </section>

      {/* Quick Summary Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div
          className="rounded-2xl p-5 flex items-start gap-3 bg-zinc-50 dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45]"
        >
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white font-heading">Plain English Summary</p>
            <p className="text-xs mt-1 leading-relaxed text-zinc-600 dark:text-zinc-300 font-sans">
              PDFora is 100% free to use. You own your files. Documents are processed privately in your browser memory without server storage.
              Use the platform fairly and responsibly. Questions? Contact{' '}
              <a href="mailto:contact@nimradev.site" className="text-purple-600 dark:text-purple-400 underline">contact@nimradev.site</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
        {SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs"
          >
            <h2
              className="text-base sm:text-lg font-extrabold mb-4 flex items-start gap-2 text-zinc-900 dark:text-white font-heading"
            >
              <span className="shrink-0 text-purple-600 dark:text-purple-400">{section.title.split('.')[0]}.</span>
              <span>{section.title.split('. ').slice(1).join('. ')}</span>
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-zinc-600 dark:text-zinc-300 font-sans">
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
