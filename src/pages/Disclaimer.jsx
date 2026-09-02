import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, FileText, Scale } from 'lucide-react';

const SECTIONS = [
  {
    icon: AlertTriangle,
    title: 'General Disclaimer',
    content: `The information and tools provided on PDFora ("the Website") are for general informational and productivity purposes only. While we strive to keep all tools functioning accurately and all information correct, PDFora makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website, its tools, or any information contained herein.

Any reliance you place on the output of our tools or the information on this website is strictly at your own risk. PDFora shall not be held liable for any loss or damage — including without limitation, indirect or consequential loss or damage — arising from use of this website or its tools.`
  },
  {
    icon: FileText,
    title: 'No Professional Advice',
    content: `The tools and content provided on PDFora are not a substitute for professional legal, financial, medical, or technical advice. PDFora does not provide legal, financial, or professional consulting services of any kind.

If you are dealing with sensitive documents such as contracts, medical records, financial reports, or legal filings, we strongly recommend consulting a licensed professional before relying on any output from this website.`
  },
  {
    icon: ShieldCheck,
    title: 'File Processing & Data Accuracy',
    content: `PDFora processes your files locally in your browser using JavaScript-based engines (pdf-lib, PDF.js, Tesseract.js, docx.js, etc.). While these are well-tested open-source libraries, PDF and document processing is complex and results may vary based on:

• The structure and encoding of the original file
• Fonts, images, and embedded objects in the document
• Browser version and device capabilities
• Password protection or DRM restrictions on the file

We cannot guarantee 100% accuracy for all file types and configurations. Always review the output carefully before using it for any important purpose.`
  },
  {
    icon: Scale,
    title: 'Third-Party Links & Advertising',
    content: `PDFora may display advertisements served by Google AdSense and may contain links to third-party websites. These links are provided for your convenience and do not signify our endorsement of those sites. We have no control over the content and nature of third-party websites and are not responsible for their privacy practices or content.

Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising at: https://www.google.com/settings/ads. For more information, visit Google's Privacy & Terms: https://policies.google.com/privacy.`
  },
  {
    icon: AlertTriangle,
    title: 'Copyright & Intellectual Property',
    content: `PDFora respects intellectual property rights. Users are solely responsible for ensuring they have the legal right to process, convert, or modify any files uploaded to or processed by PDFora tools.

Do not use PDFora to process files you do not own or do not have explicit permission to modify. PDFora is not responsible for any copyright infringement or intellectual property violations committed by users.`
  },
  {
    icon: FileText,
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, PDFora, its owners, directors, employees, and partners shall not be liable for:

• Any direct, indirect, incidental, special, or consequential damages
• Loss of data, revenue, or profits
• Business interruption or downtime
• Any errors or omissions in the content or tools

This limitation of liability applies regardless of whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis.`
  },
  {
    icon: Scale,
    title: 'Changes to This Disclaimer',
    content: `PDFora reserves the right to update or modify this Disclaimer at any time without prior notice. Changes will be posted on this page with an updated effective date. Your continued use of PDFora after any changes constitutes your acceptance of the updated Disclaimer.

This Disclaimer was last updated on September 2, 2026. If you have questions about this Disclaimer, please contact us at our Contact page.`
  }
];

export default function Disclaimer() {
  return (
    <div className="pt-16 pb-16 min-h-screen bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>Disclaimer — PDFora | Terms & Limitations</title>
        <meta name="description" content="Read PDFora's full disclaimer covering file processing accuracy, limitation of liability, third-party advertising, copyright responsibility, and professional advice limitations." />
        <link rel="canonical" href="https://pdfora.nimradev.site/disclaimer" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Hero */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Legal Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
            Disclaimer
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
            Please read this disclaimer carefully before using PDFora and its tools.
          </p>
          <p className="text-xs text-zinc-400">Last updated: September 2, 2026</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 space-y-8">
        {SECTIONS.map(({ icon: Icon, title, content }) => (
          <section key={title} className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line pl-11">
              {content}
            </p>
          </section>
        ))}

        {/* Bottom Links */}
        <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-sm text-zinc-700 dark:text-zinc-300">
          <p className="font-semibold mb-2">Related Policies:</p>
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <Link to="/privacy-policy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>
            <span className="text-zinc-400">•</span>
            <Link to="/terms-of-service" className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</Link>
            <span className="text-zinc-400">•</span>
            <Link to="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
