import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `PDFora is designed to minimise data collection. We collect only what is strictly necessary to operate the service.

**Files You Upload:** Documents, images, and PDFs you submit for processing are processed in isolated sessions (either client-side in your browser or on encrypted cloud servers) solely for the purpose of completing the requested operation. Any server-processed files are permanently and automatically deleted within 60 minutes of processing, regardless of whether you download the result.

**Usage Analytics:** We may collect anonymised, aggregated usage statistics (page views, tool usage counts, browser type) using privacy-respecting analytics that do not track individuals, store personally identifiable information, or build individual user profiles.

**Contact Form Data:** If you contact us via the support form, we collect your name, email address, and message content to respond to your inquiry. This data is never sold or used for unsolicited marketing.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use collected data exclusively to:

• Perform the PDF conversion, compression, merge, split, or editing operation you requested
• Respond to support tickets or questions you send us
• Improve our platform performance and tool accuracy
• Detect and prevent abuse or fraudulent usage

We will never sell, rent, trade, or share your uploaded documents or private file contents with any third party for commercial or advertising purposes.`,
  },
  {
    title: '3. File Storage & Automatic Deletion',
    content: `All files handled on PDFora follow a strict data lifecycle policy:

• Client-side operations process your documents directly inside your browser sandbox with zero network transmission where supported
• Server-assisted conversions upload over an encrypted TLS 1.3 connection to ephemeral processing containers
• Output files are made available for download directly to your device
• All server-cached input and output files are permanently wiped from our systems within 60 minutes automatically

We do not perform backups of user-uploaded document contents. Our infrastructure is engineered so that no human operator accesses your files in transit.`,
  },
  {
    title: '4. Cookies & Advertising Technologies',
    content: `PDFora uses cookies and similar storage technologies to ensure website functionality and support our free service:

• **Strictly Necessary Cookies:** Session identifiers required to process file uploads, tool workflows, and download handling.
• **Preference Cookies:** Store user settings such as compression level choices or layout preferences.
• **Google AdSense & Third-Party Cookies:** We use Google AdSense to serve advertisements when you visit our website. Google and its advertising partners use cookies (such as the DoubleClick cookie) to serve ads based on your prior visits to PDFora and other sites across the internet.

**Opting Out of Personalized Advertising:**
You can opt out of personalized advertising by visiting Google's Ads Settings (www.google.com/settings/ads). Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting www.aboutads.info or your browser cookie management preferences.`,
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security controls including:

• TLS 1.3 encryption for all data in transit
• Ephemeral in-memory storage for document conversion pipelines
• Isolated processing containers per conversion job
• Strict access controls preventing unauthorized access to production systems
• Periodic vulnerability audits and dependency patching

If you believe you have discovered a security issue, please report it responsibly to contact@nimradev.site.`,
  },
  {
    title: '6. Third-Party Services & Advertising Partners',
    content: `To provide and sustain our free platform, PDFora partners with select trusted third-party providers:

• **Google AdSense:** Provides contextual and personalized advertisements that keep PDFora 100% free for all users. Google's privacy policy governs their collection and use of advertising data.
• **Cloud Infrastructure & Hosting Providers:** Deliver high-speed CDN assets, compute infrastructure, and serverless routing (subject to strict data protection standards).
• **Email Service Providers (Resend):** Securely deliver support inquiries submitted through our contact form.

We do not sell user document data to data brokers, analytics brokers, or marketing networks.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `PDFora is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has submitted personal information to us, please contact us immediately and we will take immediate steps to delete it.`,
  },
  {
    title: '8. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights regarding your data:

• **Access & Transparency:** Request information regarding data we process
• **Deletion:** Request immediate deletion of any submitted contact information
• **Objection & Opt-Out:** Manage cookie preferences and personalized advertising opt-outs at any time
• **Inquiries:** Contact our data privacy representative with questions or concerns

To exercise any of these rights, contact us at contact@nimradev.site. We will respond promptly within 24-48 business hours.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy periodically to reflect changes in our legal obligations, features, or advertising partnerships. When we update this policy, we will update the "Last Updated" date at the top of this page.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions, concerns, or feedback regarding this Privacy Policy, please contact our team:

• **Email:** contact@nimradev.site
• **Location:** Lahore, Punjab, Pakistan 🇵🇰
• **Response Time:** Within 24-48 business hours`,
  },
];

export default function PrivacyPolicy() {
  const location = useLocation();
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <Helmet>
        <title>Privacy Policy — PDFora | Free Online PDF Tools Pakistan</title>
        <meta name="description" content="Privacy Policy for PDFora. Learn how your files are encrypted and automatically deleted within 60 minutes." />
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
            <span>Your Privacy Matters</span>
          </div>
          <h1
            id="privacy-heading"
            className="text-3xl sm:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: '#71717A' }}>
            Last Updated: <strong style={{ color: '#3F3F46' }}>July 31, 2026</strong>
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#52525B' }}>
            At PDFora, your privacy is foundational — not an afterthought. This policy explains
            exactly what data we handle and how we protect it.
          </p>
        </div>
      </section>

      {/* Summary Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div
          className="rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          {[{ val: '60 min', lbl: 'Auto file deletion' }, { val: 'TLS 1.3', lbl: 'Encrypted in transit' }, { val: 'Zero', lbl: 'Data sold or shared' }].map(({ val, lbl }) => (
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
