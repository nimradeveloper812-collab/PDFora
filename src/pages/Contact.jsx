import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Mail, MessageCircle, Clock, CheckCircle2, Sparkles,
  Send, MapPin, AlertCircle
} from 'lucide-react';

const TOPICS = [
  'General Inquiry',
  'Bug Report / Technical Issue',
  'Feature Request',
  'Privacy Concern',
  'Partnership',
  'Other',
];

export default function Contact() {
  const [form, setForm]           = useState({ name: '', email: '', topic: '', message: '', _hp: '' });
  const [formLoadTime]            = useState(() => Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                      e.name    = 'Your name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Please enter a valid email address.';
    if (!form.topic)                                            e.topic   = 'Please select a topic.';
    if (form.message.trim().length < 10)                        e.message = 'Message must be at least 10 characters.';
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

  const inputClasses = (hasError) =>
    `w-full text-sm px-4 py-3 rounded-xl bg-zinc-50 dark:bg-[#1B1E2E] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border ${
      hasError
        ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
        : 'border-zinc-200 dark:border-[#2A2E45] focus:border-purple-600 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-600/20'
    } outline-none transition-all`;

  return (
    <div className="pt-16 min-h-screen bg-zinc-50/50 dark:bg-[#0D0D14] text-zinc-900 dark:text-white font-sans transition-colors">
      <Helmet>
        <title>Contact Support — PDFora | Free Online Document Platform Help</title>
        <meta name="description" content="Contact the PDFora support team. Send us your feedback, feature requests, questions, or bug reports." />
        <link rel="canonical" href="https://pdfora.nimradev.site/contact" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-[#141622] border-b border-zinc-200 dark:border-[#2A2E45] transition-colors">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <MessageCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>We&apos;re here to help</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Contact Support
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            Have a question or feedback? Send us a message below.
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Contact Info */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                  Email Address
                </h4>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">contact@nimradev.site</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Response within 24 hours</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                  Support Hours
                </h4>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Mon – Sat, 9am – 9pm PKT</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
                  Location
                </h4>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Lahore, Pakistan 🇵🇰</p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-sm space-y-4 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Message Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Thank you for reaching out. A support specialist will review your inquiry and get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', topic: '', message: '', _hp: '' });
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141622] border border-zinc-200 dark:border-[#2A2E45] shadow-xs space-y-4">
                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Your Name <span className="text-purple-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="e.g. John Doe"
                      className={inputClasses(!!errors.name)}
                    />
                    {errors.name && <p className="text-[11px] font-semibold text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Email Address <span className="text-purple-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="e.g. john@example.com"
                      className={inputClasses(!!errors.email)}
                    />
                    {errors.email && <p className="text-[11px] font-semibold text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Topic / Category <span className="text-purple-600">*</span>
                  </label>
                  <select
                    name="topic"
                    value={form.topic}
                    onChange={e => handleChange('topic', e.target.value)}
                    className={inputClasses(!!errors.topic)}
                  >
                    <option value="">Select a topic...</option>
                    {TOPICS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.topic && <p className="text-[11px] font-semibold text-red-500">{errors.topic}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Message <span className="text-purple-600">*</span>
                  </label>
                  <textarea
                    rows={5}
                    name="message"
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="Describe your question or feedback in detail..."
                    className={`${inputClasses(!!errors.message)} resize-none`}
                  />
                  {errors.message && <p className="text-[11px] font-semibold text-red-500">{errors.message}</p>}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
