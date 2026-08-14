import { Resend } from 'resend';

// In-memory rate limiting cache for serverless invocation lifetime
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, firstRequest: now };

  // Reset window if expired
  if (now - clientData.firstRequest > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1;
    clientData.firstRequest = now;
    rateLimitMap.set(ip, clientData);
    return true;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  clientData.count += 1;
  rateLimitMap.set(ip, clientData);
  return true;
}

// Clean up stale entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now - data.firstRequest > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(ip);
      }
    }
  }, 15 * 60 * 1000);
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. IP Rate limiting
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown-ip';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Too many messages sent. Please wait a few minutes before trying again.' 
    });
  }

  try {
    const { name, email, topic, message, _hp, _ts } = req.body || {};

    // 2. Anti-spam Honeypot Check (bots fill hidden input fields)
    if (_hp) {
      // Fake success for spambots without actually dispatching
      return res.status(200).json({ success: true, message: 'Message received.' });
    }

    // 3. Form submission speed check (must take at least 2.5 seconds to fill)
    if (_ts && typeof _ts === 'number') {
      const duration = Date.now() - _ts;
      if (duration < 2500) {
        return res.status(400).json({ error: 'Submission rejected. Please fill the form normally.' });
      }
    }

    // 4. Required fields validation
    if (!name || !email || !topic || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 5. Length constraints
    if (name.length > 100 || email.length > 150 || topic.length > 100 || message.length > 5000) {
      return res.status(400).json({ error: 'Input field exceeds maximum allowed length.' });
    }

    // 6. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // 7. Check RESEND_API_KEY environment variable
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured in environment variables.');
      return res.status(503).json({ 
        error: 'Email service is currently offline. Please email support directly at contact@nimradev.site.' 
      });
    }

    const resend = new Resend(apiKey);
    const recipientEmail = process.env.NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL || 'contact@nimradev.site';

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeTopic = escapeHtml(topic.trim());
    const safeMessage = escapeHtml(message.trim());

    const data = await resend.emails.send({
      from: 'PDFora Support <contact@nimradev.site>',
      to: [recipientEmail],
      replyTo: email.trim(),
      subject: `[PDFora Support] ${safeTopic} — from ${safeName}`,
      html: `
        <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181B; border: 1px solid #BFDBFE; border-radius: 16px; background-color: #FFFFFF;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid #DBEAFE; padding-bottom: 12px;">
            <h2 style="color: #1D4ED8; margin: 0; font-size: 20px;">
              📩 New Contact Form Message
            </h2>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 130px; color: #52525B;">Sender Name:</td>
              <td style="padding: 8px 0; color: #18181B; font-weight: 600;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525B;">Sender Email:</td>
              <td style="padding: 8px 0; color: #2563EB;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525B;">Category:</td>
              <td style="padding: 8px 0; color: #18181B;">${safeTopic}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #DBEAFE; margin: 16px 0;" />
          <h4 style="color: #3F3F46; margin-bottom: 8px; font-size: 14px;">Message Content:</h4>
          <div style="background: #EFF6FF; padding: 16px; border-radius: 12px; border: 1px solid #BFDBFE; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #18181B;">
${safeMessage}
          </div>
          <p style="font-size: 11px; color: #A1A1AA; margin-top: 24px; text-align: center;">
            Sent automatically from PDFora Contact Form (nimradev.site) · Client IP: ${ip}
          </p>
        </div>
      `,
    });

    if (data.error) {
      console.error('Resend API Send Error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Failed to send email via Resend' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Resend API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
