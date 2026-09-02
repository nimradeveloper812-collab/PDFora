import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect & How We Use It',
    content: `PDFora is built with a privacy-by-design architecture that prioritizes user anonymity and data minimization.

**Files You Upload:** When you use PDFora tools that require server-side processing, the files you upload are transmitted securely over HTTPS. These files are used solely to perform the requested operation (e.g., conversion, compression). We do not read, inspect, analyze, or share the contents of your files. For tools that run entirely in your browser (client-side tools), your files never reach our servers at all — they stay on your device throughout the entire process.

**Usage Analytics:** We may collect non-personally identifiable, aggregate data such as browser type, operating system, pages visited, and tool usage frequency. This data is collected only to improve platform stability and performance — no individual profiling or persistent tracking is performed.

**Support Inquiries:** If you contact us via our contact form, we collect your name, email address, and message solely to resolve your inquiry. We never sell or share contact details with advertisers or third parties.`,
  },
  {
    title: '2. File Retention & Deletion Policy',
    content: `This is one of our most important commitments to you:

• Files uploaded to PDFora's servers for processing are **automatically and permanently deleted** immediately after your file processing session ends — typically within minutes of completion.
• We do not store backup copies of your uploaded or processed files.
• We do not keep, archive, or log the contents of your documents at any point.
• Tools that process files **locally in your browser** (client-side tools) never transmit your files to our servers at all — your data stays entirely on your device throughout the process.

You retain 100% control, ownership, and privacy over your files at all times.`,
  },
  {
    title: '3. Cookies & Advertising Technologies',
    content: `PDFora uses cookies and browser storage technologies to maintain platform features and sustain our free service:

**Strictly Necessary Cookies:** Local browser storage used to remember interface preferences, such as selected settings or theme preferences. These are essential for the platform to function.

**Analytics Cookies:** We use anonymized analytics tools to understand how users interact with our platform. No personally identifiable information is collected.

**Google AdSense & Advertising Cookies:** PDFora displays advertisements served by **Google AdSense** to keep the platform 100% free. Google and its certified advertising partners use cookies (including the DoubleClick cookie) to serve relevant ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to PDFora and other websites on the Internet.

**Managing Your Ad Preferences:**
You can manage or disable personalized advertising at any time:
• Google Ad Settings: https://www.google.com/settings/ads
• Google Privacy Policy: https://policies.google.com/technologies/ads
• Digital Advertising Alliance Opt-Out: https://www.aboutads.info/choices
• Network Advertising Initiative Opt-Out: https://optout.networkadvertising.org/

Note that opting out of personalized ads does not remove ads from the site — it means ads may be less relevant to your interests.`,
  },
  {
    title: '4. Security Standards',
    content: `We protect your data using industry-standard security protocols:

• TLS 1.3 / HTTPS encryption across all website assets and file transfers
• Hardened HTTP security response headers and Content Security Policy
• Sandboxed client-side execution isolating file processing from external network requests
• Strict sanitization of all contact form submissions
• Regular security reviews and infrastructure audits

If you discover a security vulnerability or concern, please report it to our team at contact@nimradev.site.`,
  },
  {
    title: '5. Third-Party Service Providers',
    content: `PDFora partners with trusted technology providers to support our free platform. Each is governed by their own privacy policies:

• **Google AdSense:** Provides advertising inventory subject to Google's Privacy Policy and Publisher Policies. Google may use cookies to deliver personalized ads.
• **Google Analytics:** Provides anonymized, aggregate usage statistics to help us improve the platform.
• **Cloud Hosting & CDN:** High-performance infrastructure for fast, reliable content delivery worldwide.
• **Resend Email API:** Securely routes customer support messages without storing user files.

We do not sell, rent, or trade your personal information with any third party for marketing purposes.`,
  },
  {
    title: '6. Children\'s Privacy',
    content: `PDFora is not directed at children under the age of 13. We do not knowingly collect or solicit personal information from children. If you believe a child has submitted personal information through our platform, please contact us immediately at contact@nimradev.site so we can take appropriate action and remove that information.`,
  },
  {
    title: '7. Your Rights (GDPR & CCPA/CPRA)',
    content: `Regardless of your location, we afford all users comprehensive privacy rights:

• **Right to Access:** Inquire about any personal data handled during support communications.
• **Right to Erasure:** Request immediate removal of support correspondence and any associated data.
• **Right to Opt-Out:** Reject non-essential cookies and personalized ad targeting at any time.
• **Right to Non-Discrimination:** Equal access to all free tools regardless of your privacy choices.

To exercise any of these rights, email us at contact@nimradev.site. We respond within 24–48 business hours.`,
  },
  {
    title: '8. Updates to This Policy',
    content: `We may update this Privacy Policy periodically to reflect technological enhancements, new tools, or regulatory requirements. Material updates will be reflected in the "Last Updated" timestamp at the top of this document. We encourage you to review this policy periodically. Continued use of PDFora after any changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: '9. Contact Us',
    content: `For any questions, concerns, or requests regarding this Privacy Policy or our data protection practices, please contact us:

• **Email:** contact@nimradev.site
• **Platform:** PDFora — pdfora.nimradev.site
• **Response SLA:** 24–48 business hours`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="pt-16 pb-20 min-h-screen bg-white dark:bg-[#0D0D14] text-zinc-900 dark:text-white transition-colors">
      <Helmet>
        <title>Privacy Policy — PDFora | Secure &amp; In-Browser PDF Suite</title>
        <meta name="description" content="Read the PDFora Privacy Policy. Learn how our in-browser client-side engine ensures 100% private file processing with zero server file storage." />
        <link rel="canonical" href="https://pdfora.nimradev.site/privacy-policy" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pdfora.nimradev.site/privacy-policy" />
        <meta property="og:title" content="Privacy Policy — PDFora" />
        <meta property="og:description" content="Read the PDFora Privacy Policy. Learn how our in-browser engine ensures 100% private file processing with zero server file storage." />
        <meta property="og:image" content="https://pdfora.nimradev.site/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://pdfora.nimradev.site/privacy-policy" />
        <meta name="twitter:title" content="Privacy Policy — PDFora" />
        <meta name="twitter:description" content="Read the PDFora Privacy Policy. Learn how our in-browser engine ensures 100% private file processing." />
        <meta name="twitter:image" content="https://pdfora.nimradev.site/og-image.jpg" />
      </Helmet>

      {/* Hero */}
      <section
        className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-[#F8FAFC] dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] transition-colors"
        aria-labelledby="privacy-heading"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1
            id="privacy-heading"
            className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white font-heading"
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Last Updated: <strong className="text-zinc-700 dark:text-zinc-200">August 25, 2026</strong>
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto text-zinc-600 dark:text-zinc-300 font-sans">
            At PDFora, your privacy is foundational. We process your documents locally in your browser
            so your confidential files never touch our servers.
          </p>
        </div>
      </section>

      {/* Summary Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div
          className="rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center bg-zinc-50 dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45]"
        >
          {[{ val: '0 Bytes', lbl: 'Server file storage' }, { val: 'In-Browser', lbl: 'Client-side processing' }, { val: '100% Free', lbl: 'No account required' }].map(({ val, lbl }) => (
            <div key={lbl} className="space-y-1">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-heading">{val}</div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-sans">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Sections */}
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
              {section.content.split('\n\n').map((para, i) => {
                // Render each paragraph, converting **bold**, URLs, and newlines
                const renderInline = (text) =>
                  text.split(/(https?:\/\/[^\s,]+|\*\*.*?\*\*)/g).map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={pIdx} className="text-zinc-900 dark:text-white font-bold">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    // Render https:// URLs as real clickable links
                    if (part.startsWith('http')) {
                      return (
                        <a
                          key={pIdx}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 dark:text-purple-400 underline underline-offset-2 hover:text-purple-700 dark:hover:text-purple-300 break-all"
                        >
                          {part}
                        </a>
                      );
                    }
                    return part;
                  });

                return (
                  <p key={i} className="whitespace-pre-line">
                    {renderInline(para)}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
