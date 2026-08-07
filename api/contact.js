import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, topic, message } = req.body || {};

    if (!name || !email || !topic || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const data = await resend.emails.send({
      from: 'PDFora Support <contact@nimradev.site>',
      to: ['contact@nimradev.site'],
      replyTo: email,
      subject: `[PDFora Support] ${topic} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #18181B; border: 1px solid #F1D5E3; border-radius: 16px;">
          <h2 style="color: #E85D9E; margin-top: 0; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px;">
            📩 New Contact Form Message
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 130px; color: #52525B;">Sender Name:</td>
              <td style="padding: 8px 0; color: #18181B;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525B;">Sender Email:</td>
              <td style="padding: 8px 0; color: #E85D9E;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #52525B;">Category:</td>
              <td style="padding: 8px 0; color: #18181B;">${topic}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #F1D5E3; margin: 16px 0;" />
          <h4 style="color: #3F3F46; margin-bottom: 8px;">Message Content:</h4>
          <div style="background: #FFF7FB; padding: 16px; border-radius: 12px; border: 1px solid #F1D5E3; font-size: 14px; white-space: pre-wrap; color: #18181B;">
            ${message}
          </div>
          <p style="font-size: 11px; color: #A1A1AA; margin-top: 20px; text-align: center;">
            Sent automatically from PDFora Contact Form (nimradev.site)
          </p>
        </div>
      `,
    });

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Failed to send email via Resend' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Resend API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
