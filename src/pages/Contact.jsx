import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Mail, MessageCircle, Clock, CheckCircle2, Sparkles,
  Send, MapPin, AlertCircle, HelpCircle, ChevronDown,
  ShieldCheck, Copy, Check, Headphones
} from 'lucide-react';

const TOPICS = [
  'General Inquiry & Feedback',
  'Bug Report / Tool Issue',
  'Feature Request / New Tool Idea',
  'Privacy & Data Protection Question',
  'Advertising & Partnership Inquiry',
  'Other / Miscellaneous',
];

const SUPPORT_FAQS = [
  {
    q: 'Why did my file fail to convert or process?',
    a: 'Common reasons include: (1) The file is password-protected or encrypted (use our Unlock PDF tool first); (2) The file is corrupted or incomplete; (3) The file exceeds browser memory limitations (for files over 100MB, try closing other browser tabs); or (4) An unsupported legacy codec was used. If you continue to experience problems, reach out to us with the file type and error message.'
  },
  {
    q: 'What is the maximum file size supported by PDFora?',
    a: 'For client-side tools (Compress, Merge, Split, Rotate, Sign), the maximum file size is limited only by your device memory (RAM), comfortably handling 100MB+ documents on modern laptops. For tools that utilize server-assisted conversion (like video transcoding), we support files up to 200MB free of charge.'
  },
  {
    q: 'How can I verify that my confidential files are not being uploaded?',
    a: 'You can verify our in-browser architecture directly: Open Developer Tools (press F12 in Chrome, Edge, or Firefox), navigate to the "Network" tab, and process a file using Compress PDF or Merge PDF. You will see that no HTTP POST request containing your file is transmitted over the internet. The processing happens entirely inside your local WebAssembly sandbox.'
  },
  {
    q: 'Does PDFora add watermarks to processed documents?',
    a: 'No. PDFora will never add watermarks, advertisements, or branding stamps to your documents. Your output documents remain 100% clean and professional.'
  },
  {
    q: 'How fast will your team respond to my support message?',
    a: 'Our support team strives to answer all technical bug reports, feedback messages, and inquiries within 24 to 48 business hours. We review every message sent to contact@nimradev.site.'
  }
];

export default function Contact() {
  const [form, setForm]               = useState({ name: '', email: '', topic: '', message: '', _hp: '' });
  const [formLoadTime]                = useState(() => Date.now());
  const [submitted, setSubmitted]     = useState(false);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq]         = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@nimradev.site');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Your name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (!form.topic) e.topic = 'Please select a topic for your message.';
    if (form.message.trim().length < 10) e.message = 'Message must contain at least 10 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          _ts: formLoadTime,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || 'Something went wrong while sending your message. Please email us directly at contact@nimradev.site.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection or send an email directly to contact@nimradev.site.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://pdfora.nimradev.site/contact#contact',
    'name': 'Contact & Support — PDFora',
    'url': 'https://pdfora.nimradev.site/contact',
    'description': 'Contact the PDFora support and engineering team for assistance, technical help, bug reports, and feedback.',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'PDFora',
      'url': 'https://pdfora.nimradev.site',
      'contactPoint': {
        '@type': 'ContactPoint',
        'email': 'contact@nimradev.site',
        'contactType': 'Customer Support',
        'availableLanguage': ['English', 'Urdu', 'Spanish', 'Arabic']
      }
    }
  };

  return (
    <div className="pt-14 pb-20 min-h-screen bg-zinc-50/60 dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>Contact &amp; Support — PDFora | Help Desk &amp; Inquiries</title>
        <meta
          name="description"
          content="Need assistance with PDFora? Contact our support team directly via email or our secure contact form. We respond within 24-48 business hours."
        />
        <link rel="canonical" href="https://pdfora.nimradev.site/contact" />
        <script type="application/ld+json">
          {JSON.stringify(contactSchema)}
        </script>
      </Helmet>

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-zinc-900 dark:text-white" aria-current="page">Contact &amp; Support</span>
        </nav>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Headphones className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Dedicated User Support &amp; Feedback Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            Contact &amp; Support
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Have a question about one of our tools, encountered a conversion issue, or want to suggest a new feature? We are here to help.
          </p>
        </div>
      </section>

      {/* ── Contact Grid: Information + Form ─────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Direct Communication & Trust Badges (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Email Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Direct Support Email</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Send us an email anytime. We monitor this inbox daily.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border border-zinc-200 dark:border-[#2A2E45] flex items-center justify-between">
                <a
                  href="mailto:contact@nimradev.site"
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline truncate"
                >
                  contact@nimradev.site
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded-md text-zinc-400 hover:text-purple-600 transition-colors"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SLA & Operating Hours Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Support SLA &amp; Hours</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Monday – Friday: 9:00 AM – 6:00 PM (UTC)<br />
                  Guaranteed Response: <strong className="text-zinc-900 dark:text-white">Within 24–48 Business Hours</strong>
                </p>
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Your Privacy Matters</span>
              </div>
              <p className="text-xs leading-relaxed text-purple-900/80 dark:text-purple-300/80">
                We never share your email address or support correspondence with advertisers or third parties. Read our <Link to="/privacy-policy" className="underline font-bold">Privacy Policy</Link>.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form (3 Cols) */}
          <div className="lg:col-span-3">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Send Us a Message
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Fill out the form below and our team will get back to you promptly.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-green-900 dark:text-green-200">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. A member of the PDFora support team has received your message and will reply to <span className="font-bold">{form.email}</span> within 24 to 48 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', topic: '', message: '', _hp: '' });
                    }}
                    className="mt-2 px-4 py-2 rounded-lg bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Honeypot field for spam prevention */}
                  <input
                    type="text"
                    name="_hp"
                    value={form._hp}
                    onChange={e => handleChange('_hp', e.target.value)}
                    className="hidden"
                    tabIndex="-1"
                    autoComplete="off"
                  />

                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="e.g. John Doe"
                      className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border ${
                        errors.name ? 'border-red-400 focus:ring-red-400/30' : 'border-zinc-200 dark:border-[#2A2E45] focus:border-purple-600'
                      } text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="e.g. john@example.com"
                      className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border ${
                        errors.email ? 'border-red-400 focus:ring-red-400/30' : 'border-zinc-200 dark:border-[#2A2E45] focus:border-purple-600'
                      } text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
                  </div>

                  {/* Topic Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Reason for Inquiry <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.topic}
                      onChange={e => handleChange('topic', e.target.value)}
                      className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border ${
                        errors.topic ? 'border-red-400 focus:ring-red-400/30' : 'border-zinc-200 dark:border-[#2A2E45] focus:border-purple-600'
                      } text-zinc-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                    >
                      <option value="">-- Please Select an Inquiry Topic --</option>
                      {TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.topic && <p className="text-[11px] text-red-500 font-medium">{errors.topic}</p>}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Message Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      placeholder="Please describe your question, the tool you were using, any error messages you observed, or your feedback..."
                      className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] border ${
                        errors.message ? 'border-red-400 focus:ring-red-400/30' : 'border-zinc-200 dark:border-[#2A2E45] focus:border-purple-600'
                      } text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all resize-y`}
                    />
                    {errors.message && <p className="text-[11px] text-red-500 font-medium">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Transmitting Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Support Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ── Support & Troubleshooting FAQs ───────────────────── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Support &amp; Troubleshooting FAQ
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Quick answers to the most common questions before submitting a ticket
          </p>
        </div>

        <div className="space-y-3">
          {SUPPORT_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-white dark:bg-[#141622] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-[#2A2E45]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
