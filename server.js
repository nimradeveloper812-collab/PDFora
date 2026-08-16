import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security & CORS Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Contact Us Form API (Resend)
app.post('/api/contact', async (req, res) => {
  const { name, email, topic, message, _hp, _ts } = req.body || {};

  // Honeypot anti-spam check
  if (_hp) {
    return res.status(200).json({ success: true, message: 'Received' });
  }

  // Submission time check
  if (_ts && typeof _ts === 'number' && Date.now() - _ts < 2000) {
    return res.status(400).json({ error: 'Please submit the form normally.' });
  }

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured in environment variables.');
    return res.status(503).json({ error: 'Email service is currently not configured.' });
  }

  try {
    const resend = new Resend(apiKey);
    const recipient = process.env.TO_EMAIL || 'nimra.developer.8122005@gmail.com';

    const cleanName = String(name).slice(0, 100);
    const cleanEmail = String(email).slice(0, 150);
    const cleanTopic = String(topic).slice(0, 100);
    const cleanMsg = String(message).slice(0, 5000);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb; margin-top: 0;">📩 New Contact Message - PDFora</h2>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
        <p><strong>Topic:</strong> ${cleanTopic}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Message:</strong></p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1; white-space: pre-wrap; line-height: 1.6;">
${cleanMsg}
        </div>
      </div>
    `;

    const sendResult = await resend.emails.send({
      from: 'PDFora Support <contact@nimradev.site>',
      to: [recipient],
      replyTo: cleanEmail,
      subject: `[PDFora Contact] ${cleanTopic} — ${cleanName}`,
      html: emailHtml,
    });

    if (sendResult.error) {
      console.error('Resend error:', sendResult.error);
      return res.status(500).json({ error: sendResult.error.message });
    }

    return res.json({ success: true, id: sendResult.data?.id });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// Serve static frontend assets from dist folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, { maxAge: '1d' }));

// Fallback to index.html for React Router SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PDFora server is running on http://0.0.0.0:${PORT}`);
});
