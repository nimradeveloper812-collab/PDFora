import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information We Collect & In-Browser Processing',
    content: `PDFora is built with a privacy-by-design architecture that prioritises user anonymity and data minimisation.

**Zero Server Document Storage:** Your documents, spreadsheets, images, and PDF files are processed directly inside your web browser memory sandbox using client-side WebAssembly and JavaScript engines. Your private document contents are not uploaded to, inspected by, or stored on our servers.

**Zero Account Footprint:** You can use all PDF conversion, compression, merging, and splitting utilities without registering, creating a profile, or submitting an email address.

**Anonymous Usage Analytics:** We may collect aggregate, privacy-respecting technical signals (such as browser type, tool usage frequency, and anonymised page views) to maintain platform stability and improve tool speed. No individual profiling or persistent tracking is performed.

**Support Inquiries:** If you contact our team via the contact form, we collect your name, email address, and message solely to resolve your support inquiry. We never sell or share contact details with marketers.`,
  },
  {
    title: '2. How We Use Information',
    content: `Any technical data collected is used strictly to:

• Provide and maintain free in-browser PDF utilities
• Detect, prevent, and mitigate security threats or abuse
• Respond to technical questions, bug reports, and user feedback
• Ensure optimal rendering performance across devices and operating systems

We will never monetize, sell, lease, or license user files, metadata, or contact information to third parties or advertising brokers.`,
  },
  {
    title: '3. Data Lifecycle & Zero File Persistence',
    content: `Because PDFora operates natively in your browser sandbox:

• File transformations happen locally in temporary browser memory
• When you close the browser tab or refresh the page, local memory is instantly cleared by your operating system
• No human operator or automated scraper can view or access your file contents
• We do not keep, archive, or back up user documents

You retain 100% control, ownership, and privacy over your files at all times.`,
  },
  {
    title: '4. Cookies & Advertising Technologies',
    content: `PDFora uses standard cookies and browser storage technologies to maintain platform features and sustain our free service:

• **Strictly Necessary Storage:** Local browser storage to remember interface preferences (such as selected conversion settings or theme preferences).
• **Google AdSense & Third-Party Cookies:** We display advertisements served by Google AdSense to keep PDFora 100% free. Google and its certified advertising partners use cookies (including the DoubleClick cookie) to serve relevant ads based on prior visits to this and other websites.

**Managing Your Ad Preferences & Opting Out:**
You can manage or disable personalized advertising by visiting Google Ad Settings (www.google.com/settings/ads) or through the Digital Advertising Alliance opt-out portal (www.aboutads.info/choices). You can also configure your browser to block third-party cookies at any time.`,
  },
  {
    title: '5. Security Standards',
    content: `We protect your session using industry-standard protocols:

• TLS 1.3 encryption across all website assets
• Hardened Content Security and HTTP response headers
• Sandboxed client-side memory execution isolating processing from external network requests
• Strict sanitization of contact submissions

If you discover a vulnerability or security concern, please report it to our engineering team at contact@nimradev.site.`,
  },
  {
    title: '6. Third-Party Service Providers',
    content: `PDFora partners with trusted technology providers to support our free platform:

• **Google AdSense:** Provides advertising inventory subject to Google's strict Privacy Policy and Publisher Policies.
• **Cloud Infrastructure:** High-performance static content delivery network (CDN) ensuring fast asset caching worldwide.
• **Resend Email API:** Securely routes customer support messages without storing user files.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `PDFora does not knowingly collect or solicit personal data from children under the age of 13. If you believe a child has provided us with personal information, please contact us immediately so we can remove it.`,
  },
  {
    title: '8. Global Privacy Rights (GDPR & CCPA/CPRA)',
    content: `Regardless of your location, we afford all users maximum privacy rights:

• **Right to Access:** Inquire about any data handled during support communications
• **Right to Erasure:** Request immediate removal of support correspondence
• **Right to Opt-Out:** Reject non-essential cookies and personalized ad targeting
• **Non-Discrimination:** Equal access to all free PDF tools regardless of privacy choices

To exercise any privacy rights, email contact@nimradev.site. We respond within 24 to 48 business hours.`,
  },
  {
    title: '9. Updates to This Policy',
    content: `We may update this Privacy Policy periodically to reflect technological enhancements or regulatory requirements. Material updates will be reflected in the "Last Updated" timestamp at the top of this document.`,
  },
  {
    title: '10. Contact Us',
    content: `For inquiries regarding this Privacy Policy or data protection practices, contact us at:

• **Email:** contact@nimradev.site
• **Platform:** PDFora Global Operations
• **Support SLA:** 24–48 hours`,
  },
];

export default function PrivacyPolicy() {
  const location = useLocation();
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <Helmet>
        <title>Privacy Policy — PDFora | Secure & In-Browser PDF Suite</title>
        <meta name="description" content="Read the PDFora Privacy Policy. Learn how our in-browser client-side engine ensures 100% private file processing with zero server file storage." />
        <link rel="canonical" href={`https://pdfora.nimradev.site${location.pathname}`} />
      </Helmet>

      {/* Hero */}
      <section
        className="py-12 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'radial-gradient(ellipse 85% 55% at 50% -5%, #DBEAFE 0%, #FFFFFF 68%)',
          borderBottom: '1px solid #BFDBFE',
        }}
        aria-labelledby="privacy-heading"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1
            id="privacy-heading"
            className="text-3xl sm:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: '#71717A' }}>
            Last Updated: <strong style={{ color: '#3F3F46' }}>August 17, 2026</strong>
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#52525B' }}>
            At PDFora, your privacy is foundational. We process your documents locally in your browser
            so your confidential files never touch our servers.
          </p>
        </div>
      </section>

      {/* Summary Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div
          className="rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          {[{ val: '0 Bytes', lbl: 'Server file storage' }, { val: 'In-Browser', lbl: 'Client-side processing' }, { val: '100% Free', lbl: 'No account required' }].map(({ val, lbl }) => (
            <div key={lbl} className="space-y-1">
              <div className="text-2xl font-black" style={{ color: '#3B82F6' }}>{val}</div>
              <div className="text-xs font-medium" style={{ color: '#52525B' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Sections */}
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
              {section.content.split('\n\n').map((para, i) => {
                const formatted = para.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} style={{ color: '#18181B' }}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
                return <p key={i} className="whitespace-pre-line">{formatted}</p>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
