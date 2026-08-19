import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Mail, MessageCircle, Clock, CheckCircle2, Sparkles,
  Send, ChevronDown, MapPin
} from 'lucide-react';

const TOPICS = [
  'General Inquiry',
  'Bug Report / Technical Issue',
  'Feature Request',
  'Privacy Concern',
  'Partnership',
  'Other',
];

function InputField({ id, label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold" style={{ color: '#3F3F46' }}>
        {label}{required && <span className="ml-0.5" style={{ color: '#3B82F6' }} aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] font-semibold" style={{ color: '#EF4444' }} role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  color: '#18181B',
  background: '#FFFFFF',
  border: `1.5px solid ${hasError ? '#FCA5A5' : '#BFDBFE'}`,
  borderRadius: '0.75rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 200ms, box-shadow 200ms',
  boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
});

export default function Contact() {
  const [form, setForm]         = useState({ name: '', email: '', topic: '', message: '', _hp: '' });
  const [formLoadTime]          = useState(() => Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                    e.name    = 'Your name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (!form.topic)                                          e.topic   = 'Please select a topic.';
    if (form.message.trim().length < 20)                      e.message = 'Message must be at least 20 characters.';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
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
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const focusStyle  = e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246,0.10)'; };
  const blurStyle   = e => { e.currentTarget.style.borderColor = errors[e.currentTarget.name] ? '#FCA5A5' : '#BFDBFE'; e.currentTarget.style.boxShadow = 'none'; };

  return (
    <div className="pt-16 pb-20 min-h-screen">
      <Helmet>
        <title>Contact Support — PDFora | Free Online PDF Platform Help</title>
        <meta name="description" content="Contact the PDFora support team. Send us your feedback, feature requests, questions, or bug reports." />
        <link rel="canonical" href="https://pdfora.nimradev.site/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pdfora.nimradev.site/contact" />
        <meta property="og:title" content="Contact Support — PDFora" />
        <meta property="og:description" content="Contact the PDFora support team. Send us your feedback, feature requests, questions, or bug reports." />
        <meta property="og:image" content="https://pdfora.nimradev.site/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://pdfora.nimradev.site/contact" />
        <meta name="twitter:title" content="Contact Support — PDFora" />
        <meta name="twitter:description" content="Contact the PDFora support team. Send us your feedback, feature requests, questions, or bug reports." />
        <meta name="twitter:image" content="https://pdfora.nimradev.site/og-image.jpg" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: 'radial-gradient(ellipse 85% 55% at 50% -5%, #DBEAFE 0%, #FFFFFF 68%)',
          borderBottom: '1px solid #BFDBFE',
        }}
        aria-labelledby="contact-heading"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            We&apos;re here to help
          </div>
          <h1
            id="contact-heading"
            className="text-3xl sm:text-5xl font-black"
            style={{ color: '#18181B', letterSpacing: '-0.035em' }}
          >
            Contact Support
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#52525B' }}>
            Have a question, bug report, or feature request? Send us a message and we'll
            respond within one business day.
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Info ── */}
          <div className="space-y-4" aria-label="Contact information">

            {/* Email */}
            <div
              className="flex items-start gap-4 p-5 rounded-2xl"
              style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                aria-hidden="true"
              >
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#18181B' }}>
                  Email Address
                </h4>
                <p className="text-sm font-semibold" style={{ color: '#3F3F46' }}>contact@nimradev.site</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#A1A1AA' }}>Response within 24 hours</p>
              </div>
            </div>

            {/* Hours */}
            <div
              className="flex items-start gap-4 p-5 rounded-2xl"
              style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                aria-hidden="true"
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#18181B' }}>
                  Support Hours
                </h4>
                <p className="text-sm font-semibold" style={{ color: '#3F3F46' }}>Mon – Sat, 9am – 9pm PKT</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#A1A1AA' }}>Pakistan Standard Time (UTC+5)</p>
              </div>
            </div>

            {/* Location */}
            <div
              className="flex items-start gap-4 p-5 rounded-2xl"
              style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', boxShadow: '0 1px 4px rgba(59, 130, 246,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                aria-hidden="true"
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#18181B' }}>
                  Location
                </h4>
                <p className="text-sm font-semibold" style={{ color: '#3F3F46' }}>Lahore, Punjab, Pakistan 🇵🇰</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#A1A1AA' }}>Serving users nationwide &amp; worldwide</p>
              </div>
            </div>

            {/* FAQ Tip */}
            <div
              className="p-5 rounded-2xl space-y-2"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246,0.25)',
              }}
              aria-label="Tip: check FAQ first"
            >
              <Sparkles className="w-5 h-5 text-white/90" aria-hidden="true" />
              <h4 className="text-sm font-bold text-white">Check the FAQ first!</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Many common questions about conversion, privacy, and file limits are already
                answered on our home page FAQ.
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-2">
            {submitted ? (
              /* Success State */
              <div
                className="rounded-3xl p-10 sm:p-14 text-center space-y-5 animate-scale-in"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 8px 32px rgba(59, 130, 246,0.08)',
                }}
                role="status"
                aria-live="polite"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: '#DBEAFE', border: '1px solid #BFDBFE' }}
                  aria-hidden="true"
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#3B82F6' }} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: '#18181B' }}>
                    Message Sent!
                  </h3>
                  <p className="text-sm leading-relaxed mt-2 max-w-sm mx-auto" style={{ color: '#71717A' }}>
                    Thanks, <strong style={{ color: '#18181B' }}>{form.name}</strong>! We&apos;ve received
                    your message and will reply to{' '}
                    <strong style={{ color: '#18181B' }}>{form.email}</strong> as soon as possible.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', topic: '', message: '' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    color: '#3B82F6',
                    border: '1.5px solid #BFDBFE',
                    background: '#FFFFFF',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#3B82F6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Contact Form */
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-3xl p-6 sm:p-8 space-y-5"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  boxShadow: '0 8px 32px rgba(59, 130, 246,0.07), 0 2px 8px rgba(0,0,0,0.04)',
                }}
                aria-label="Contact support form"
              >
                <div style={{ borderBottom: '1px solid #DBEAFE', paddingBottom: '1rem' }}>
                  <h2 className="text-lg font-bold" style={{ color: '#18181B' }}>
                    Send a Message
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#A1A1AA' }}>
                    Fields marked <span style={{ color: '#3B82F6' }}>*</span> are required.
                  </p>
                </div>

                {/* Honeypot field to block automated spambots */}
                <div style={{ display: 'none', visibility: 'hidden' }} aria-hidden="true">
                  <label htmlFor="website_hp">Leave this field empty</label>
                  <input
                    id="website_hp"
                    type="text"
                    name="_hp"
                    value={form._hp}
                    onChange={e => handleChange('_hp', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {submitError && (
                  <p className="text-[11px] font-semibold" style={{ color: '#EF4444' }} role="alert" aria-live="polite">
                    {submitError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <InputField id="contact-name" label="Full Name" required error={errors.name}>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Ali Khan"
                      value={form.name}
                      autoComplete="name"
                      onChange={e => handleChange('name', e.target.value)}
                      style={inputStyle(!!errors.name)}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                  </InputField>

                  {/* Email */}
                  <InputField id="contact-email" label="Email Address" required error={errors.email}>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="ali@example.com"
                      value={form.email}
                      autoComplete="email"
                      onChange={e => handleChange('email', e.target.value)}
                      style={inputStyle(!!errors.email)}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                    />
                  </InputField>
                </div>

                {/* Topic */}
                <InputField id="contact-topic" label="Support Category" required error={errors.topic}>
                  <div className="relative">
                    <select
                      id="contact-topic"
                      name="topic"
                      value={form.topic}
                      onChange={e => handleChange('topic', e.target.value)}
                      style={{ ...inputStyle(!!errors.topic), appearance: 'none', cursor: 'pointer', paddingRight: '2.5rem' }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                      aria-required="true"
                      aria-invalid={!!errors.topic}
                    >
                      <option value="">Choose a category…</option>
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: '#A1A1AA' }}
                      aria-hidden="true"
                    />
                  </div>
                </InputField>

                {/* Message */}
                <InputField id="contact-message" label="Message" required error={errors.message}>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    placeholder="Describe your question or issue in detail (minimum 20 characters)…"
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    style={{ ...inputStyle(!!errors.message), resize: 'vertical', minHeight: '120px' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                  />
                  <div className="flex justify-end">
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: form.message.length >= 20 ? '#3B82F6' : '#A1A1AA' }}
                      aria-live="polite"
                    >
                      {form.message.length} characters{form.message.length < 20 ? ` (${20 - form.message.length} more needed)` : ''}
                    </span>
                  </div>
                </InputField>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246,0.28)',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246,0.38)'; }}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246,0.28)')}
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>

                <p className="text-[11px] text-center" style={{ color: '#A1A1AA' }}>
                  Your details are kept strictly private and never shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
