import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `PDFora is designed to minimise data collection. We collect only what is strictly necessary to operate the service.

**Files You Upload:** Documents, images, and PDFs you submit for processing are temporarily stored on our encrypted cloud servers solely for the purpose of completing the requested operation. These files are permanently and automatically deleted within 60 minutes of processing, regardless of whether you download the result.

**Usage Analytics:** We may collect anonymised, aggregated usage statistics (page views, tool usage counts, browser type) using privacy-respecting analytics that do not track individuals, store IP addresses, or build user profiles.

**Contact Form Data:** If you contact us via the support form, we collect your name, email address, and message content to respond to your inquiry. This data is never used for marketing.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use collected data exclusively to:

• Perform the PDF conversion, compression, merge, split, or editing operation you requested
• Respond to support tickets or questions you send us
• Improve our platform performance and tool accuracy
• Detect and prevent abuse or fraudulent usage

We will never sell, rent, trade, or share your personal data or uploaded files with any third party for commercial or advertising purposes.`,
  },
  {
    title: '3. File Storage & Automatic Deletion',
    content: `All files uploaded to PDFora follow a strict data lifecycle policy:

• Files are uploaded over an encrypted TLS 1.3 connection
• Files are stored only in ephemeral, isolated processing sandboxes
• After processing completes, the output file is made available for download
• All input and output files are permanently wiped from our servers within 60 minutes automatically

We do not perform backups of user-uploaded content. Our infrastructure is designed so that no human operator has access to individual files in transit.`,
  },
  {
    title: '4. Cookies & Local Storage',
    content: `PDFora uses minimal cookies and local storage:

• **Strictly Necessary Cookies:** Session identifiers needed to complete file uploads and downloads. These expire when you close your browser.
• **Preference Cookies (Optional):** Remember UI settings such as compression level preferences. You can clear these at any time.
• **Analytics Cookies (Optional):** Anonymised, cookieless analytics to understand aggregate feature usage. We do not use Google Analytics or Meta Pixel.

You can configure or disable optional cookies via your browser settings at any time.`,
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security controls including:

• TLS 1.3 encryption for all data in transit
• AES-256 encryption for files stored temporarily at rest
• Isolated processing containers per conversion job
• Access controls limiting staff access to production systems
• Regular third-party security audits

No system is 100% secure. If you believe you have discovered a security vulnerability, please report it responsibly to security@pdfora.com.`,
  },
  {
    title: '6. Third-Party Services',
    content: `PDFora may use the following categories of trusted third-party services:

• **Cloud Infrastructure Providers:** For file processing compute (subject to GDPR and SOC 2 Type II compliance)
• **Content Delivery Networks (CDN):** To deliver the PDFora web application efficiently

We do not use third-party advertising networks, social login providers, or tracking pixels.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `PDFora is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has submitted personal information to us, please contact us immediately and we will take steps to delete it.`,
  },
  {
    title: '8. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights regarding your data:

• **Access:** Request a copy of personal information we hold about you
• **Deletion:** Request deletion of any personal data we retain
• **Portability:** Receive your data in a machine-readable format
• **Objection:** Object to certain types of data processing
• **Complaints:** Lodge a complaint with your local data protection authority

To exercise any of these rights, contact us at privacy@pdfora.com. We will respond within 30 days.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or service improvements. When we make material changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy regularly.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our team:

• **Email:** privacy@pdfora.com
• **Location:** Lahore, Punjab, Pakistan 🇵🇰
• **Response Time:** Within 24-48 hours`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <Helmet>
        <title>Privacy Policy — PDFora | Free Online PDF Tools Pakistan</title>
        <meta name="description" content="Privacy Policy for PDFora. Learn how your files are encrypted and automatically deleted within 60 minutes." />
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
              {section.content.split('\n\n').map((para, i) => (
                <p key={i}>{para.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
