import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Sparkles } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the PDFora website (pdfora.com) and its services, you confirm that you are at least 13 years of age and that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please discontinue your use of PDFora immediately.

PDFora reserves the right to update these Terms at any time. Continued use of the service after changes constitutes your acceptance of the updated Terms.`,
  },
  {
    title: '2. Description of Service',
    content: `PDFora provides a free, browser-based platform for PDF document processing including, but not limited to:

• Converting office documents (Word, Excel, PowerPoint) to PDF format
• Converting images (JPG, PNG, WEBP) to PDF format
• Converting PDFs to image formats (JPG, PNG)
• Merging multiple PDF documents into one
• Compressing PDF files to reduce file size
• Splitting PDF documents into separate pages or ranges

The service is provided on an "as is" and "as available" basis. PDFora does not guarantee uninterrupted or error-free operation.`,
  },
  {
    title: '3. Acceptable Use Policy',
    content: `You agree to use PDFora only for lawful purposes. You must not:

• Upload files containing malware, viruses, or malicious code
• Process documents that infringe the intellectual property rights of others
• Use PDFora to process files containing child sexual abuse material (CSAM) or illegal content
• Attempt to reverse-engineer, scrape, or overload our infrastructure through automated bots or scripts
• Misrepresent your identity or impersonate any person or organisation
• Use the service in any way that violates applicable local, national, or international laws

PDFora reserves the right to terminate access for users found in violation of this policy without notice.`,
  },
  {
    title: '4. User Content & Intellectual Property',
    content: `You retain full ownership of any files you upload to PDFora. By uploading files, you grant PDFora a limited, non-exclusive, royalty-free licence solely to process and return the converted output to you.

PDFora does not claim any ownership of your documents. The PDFora name, logo, design, and software are the intellectual property of PDFora and may not be used without explicit written permission.`,
  },
  {
    title: '5. Free Service & Fair Use',
    content: `PDFora is provided free of charge. To maintain fair access for all users, we apply reasonable usage limits including:

• Maximum file size: 50 MB per file
• Maximum batch size varies per tool (see individual tool pages)
• Automated or scripted bulk processing is prohibited without prior written consent

PDFora may introduce optional paid tiers in the future for enhanced limits. Free tier availability is not guaranteed in perpetuity.`,
  },
  {
    title: '6. Disclaimer of Warranties',
    content: `PDFora is provided "as is" without any warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

PDFora does not warrant that:
• The service will be available at all times or without interruption
• Conversion outputs will be 100% identical to inputs in all edge cases
• The service is free from bugs, errors, or security vulnerabilities

You use the service at your own risk. Always retain your original source files.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `To the fullest extent permitted by law, PDFora, its team members, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to:

• Loss of data or documents
• Business interruption
• Loss of revenue or profits
• Inaccuracies in conversion output

Our total cumulative liability for any claim shall not exceed PKR 10,000 or the total amount paid by you (if any) in the prior 12 months.`,
  },
  {
    title: '8. Third-Party Links',
    content: `PDFora may contain links to third-party websites for reference. We are not responsible for the content, privacy policies, or practices of any third-party sites. We encourage you to review the privacy policies of any external sites you visit.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Lahore, Pakistan.`,
  },
  {
    title: '10. Contact',
    content: `For questions about these Terms of Service, please contact us:

• **Email:** legal@pdfora.com
• **Location:** PDFora Operations, Lahore, Punjab, Pakistan 🇵🇰
• **Response Time:** Within 5 business days`,
  },
];

export default function TermsOfService() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <Helmet>
        <title>Terms of Service — PDFora | Free Online PDF Tools Pakistan</title>
        <meta name="description" content="Terms of Service for PDFora, Pakistan's free online PDF platform." />
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
            Last Updated: <strong style={{ color: '#3F3F46' }}>July 31, 2026</strong>
            &nbsp;&middot;&nbsp; Effective immediately
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#52525B' }}>
            Please read these Terms carefully before using PDFora. They govern your access
            and use of all our PDF tools and services.
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
              PDFora is free to use. You own your files. Don't upload illegal content.
              We can't guarantee 100% uptime. We auto-delete your files within 1 hour.
              Use the service fairly. Questions? Email{' '}
              <a href="mailto:legal@pdfora.com" style={{ color: '#3B82F6' }}>legal@pdfora.com</a>.
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
