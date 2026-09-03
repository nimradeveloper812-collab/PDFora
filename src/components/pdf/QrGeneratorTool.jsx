import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { PDFDocument } from 'pdf-lib';
import {
  QrCode, Download, Copy, Check, Link, FileText,
  Wifi, User, Mail, Phone, MessageSquare, MessageCircle,
  Palette, FileImage, Layers, Upload, X, RefreshCw,
  Globe, MapPin, ShoppingBag, Star, Video, AtSign,
  Users, Hash, Code, Play
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_STYLES = [
  { id: 'square',        label: 'Square'         },
  { id: 'dots',          label: 'Dots'           },
  { id: 'rounded',       label: 'Rounded'        },
  { id: 'classy',        label: 'Classy'         },
  { id: 'classy-rounded',label: 'Classy Round'   },
  { id: 'extra-rounded', label: 'Extra Rounded'  },
];

const CORNER_SQUARE_STYLES = [
  { id: 'square',  label: 'Square'  },
  { id: 'dot',     label: 'Dot'     },
  { id: 'extra-rounded', label: 'Rounded' },
];

const CORNER_DOT_STYLES = [
  { id: 'square', label: 'Square' },
  { id: 'dot',    label: 'Dot'    },
];

const PRESET_COLORS = [
  { name: 'Classic',   fg: '#000000', bg: '#FFFFFF' },
  { name: 'Purple',    fg: '#6C3FFC', bg: '#FFFFFF' },
  { name: 'Royal Blue',fg: '#2563EB', bg: '#FFFFFF' },
  { name: 'Emerald',   fg: '#059669', bg: '#FFFFFF' },
  { name: 'Navy',      fg: '#1E3A8A', bg: '#FFFFFF' },
  { name: 'Midnight',  fg: '#1E1B4B', bg: '#EEF2FF' },
  { name: 'Slate',     fg: '#334155', bg: '#F8FAFC' },
  { name: 'Amber',     fg: '#D97706', bg: '#FFFBEB' },
];

const FRAME_STYLES = [
  { id: 'none',    label: 'No Frame'     },
  { id: 'simple',  label: 'Simple Box'   },
  { id: 'rounded', label: 'Rounded Box'  },
  { id: 'bottom',  label: 'Bottom Label' },
  { id: 'top',     label: 'Top Label'    },
];

const CTA_PRESETS = [
  'Scan Me', 'Scan to Visit', 'Scan for Menu',
  'Scan to Connect', 'Get Directions', 'Watch Video',
  'Scan to Save', 'Follow Us', 'View Profile',
];

const QR_TABS = [
  { id: 'url',       label: 'Website URL',    icon: Link          },
  { id: 'text',      label: 'Plain Text',     icon: FileText      },
  { id: 'wifi',      label: 'Wi-Fi',          icon: Wifi          },
  { id: 'vcard',     label: 'vCard Contact',  icon: User          },
  { id: 'email',     label: 'Email',          icon: Mail          },
  { id: 'phone',     label: 'Phone Call',     icon: Phone         },
  { id: 'sms',       label: 'SMS',            icon: MessageSquare },
  { id: 'whatsapp',  label: 'WhatsApp',       icon: MessageCircle },
  { id: 'location',  label: 'Location',       icon: MapPin        },
  { id: 'youtube',   label: 'YouTube',        icon: Play          },
  { id: 'instagram', label: 'Instagram',      icon: AtSign        },
  { id: 'facebook',  label: 'Facebook',       icon: Users         },
  { id: 'linkedin',  label: 'LinkedIn',       icon: Globe         },
  { id: 'twitter',   label: 'X / Twitter',    icon: Hash          },
  { id: 'appstore',  label: 'App Store',      icon: ShoppingBag   },
  { id: 'review',    label: 'Google Review',  icon: Star          },
  { id: 'github',    label: 'GitHub',         icon: Code          },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPayload(tab, fields) {
  const f = fields;
  switch (tab) {
    case 'url':       return f.url.trim() || 'https://pdfora.nimradev.site';
    case 'text':      return f.text.trim() || 'Sample Text';
    case 'wifi': {
      const enc  = f.wifiEncryption === 'nopass' ? 'nopass' : f.wifiEncryption;
      const pass = f.wifiEncryption === 'nopass' ? '' : f.wifiPassword;
      return `WIFI:S:${f.wifiSsid};T:${enc};P:${pass};H:${f.wifiHidden ? 'true' : 'false'};;`;
    }
    case 'vcard':
      return [
        'BEGIN:VCARD', 'VERSION:3.0',
        `N:${f.vcardLast};${f.vcardFirst};;;`,
        `FN:${[f.vcardFirst, f.vcardLast].filter(Boolean).join(' ')}`,
        f.vcardCompany ? `ORG:${f.vcardCompany}` : '',
        f.vcardTitle   ? `TITLE:${f.vcardTitle}` : '',
        f.vcardPhone   ? `TEL;TYPE=CELL:${f.vcardPhone}` : '',
        f.vcardEmail   ? `EMAIL:${f.vcardEmail}` : '',
        f.vcardWeb     ? `URL:${f.vcardWeb}` : '',
        f.vcardAddress ? `ADR;TYPE=WORK:;;${f.vcardAddress};;;;` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    case 'email':
      return `mailto:${f.emailTo.trim()}?subject=${encodeURIComponent(f.emailSubject)}&body=${encodeURIComponent(f.emailBody)}`;
    case 'phone':     return `tel:${f.phoneNumber.trim()}`;
    case 'sms':       return `smsto:${f.smsPhone.trim()}:${f.smsMessage}`;
    case 'whatsapp':  return `https://wa.me/${f.waPhone.replace(/[^0-9]/g, '')}${f.waMessage ? `?text=${encodeURIComponent(f.waMessage)}` : ''}`;
    case 'location':  return `https://maps.google.com/?q=${encodeURIComponent(f.locationQuery)}`;
    case 'youtube':   return f.youtubeUrl.trim() || 'https://youtube.com';
    case 'instagram': return `https://instagram.com/${f.instagramHandle.replace('@', '')}`;
    case 'facebook':  return f.facebookUrl.trim() || 'https://facebook.com';
    case 'linkedin':  return f.linkedinUrl.trim() || 'https://linkedin.com';
    case 'twitter':   return `https://x.com/${f.twitterHandle.replace('@', '')}`;
    case 'appstore':  return f.appstoreUrl.trim() || 'https://apps.apple.com';
    case 'review':    return f.reviewUrl.trim() || 'https://g.page/r/';
    case 'github':    return `https://github.com/${f.githubHandle.replace('@', '')}`;
    default:          return 'https://pdfora.nimradev.site';
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QrGeneratorTool() {
  // Tab
  const [activeTab, setActiveTab] = useState('url');
  // Field values
  const [fields, setFields] = useState({
    url: 'https://pdfora.nimradev.site',
    text: 'Welcome to PDFora — Free Online Document Tools',
    wifiSsid: '', wifiPassword: '', wifiEncryption: 'WPA', wifiHidden: false,
    vcardFirst: '', vcardLast: '', vcardPhone: '', vcardEmail: '',
    vcardCompany: '', vcardTitle: '', vcardWeb: '', vcardAddress: '',
    emailTo: '', emailSubject: '', emailBody: '',
    phoneNumber: '', smsPhone: '', smsMessage: '',
    waPhone: '', waMessage: '',
    locationQuery: '',
    youtubeUrl: '', instagramHandle: '', facebookUrl: '',
    linkedinUrl: '', twitterHandle: '', appstoreUrl: '',
    reviewUrl: '', githubHandle: '',
  });

  // Design
  const [fgColor, setFgColor]               = useState('#000000');
  const [bgColor, setBgColor]               = useState('#FFFFFF');
  const [dotStyle, setDotStyle]             = useState('square');
  const [cornerSquareStyle, setCornerSquareStyle] = useState('square');
  const [cornerDotStyle, setCornerDotStyle] = useState('square');
  const [errorLevel, setErrorLevel]         = useState('M');
  const [margin, setMargin]                 = useState(2);
  const [logoDataUrl, setLogoDataUrl]       = useState(null);
  const [logoSize, setLogoSize]             = useState(0.25);

  // Frame
  const [frameStyle, setFrameStyle] = useState('none');
  const [ctaText, setCtaText]       = useState('Scan Me');
  const [frameColor, setFrameColor] = useState('#6C3FFC');

  // Export
  const [resolution, setResolution] = useState(1024);

  // UI state
  const [copied, setCopied]             = useState(false);
  const [copiedImg, setCopiedImg]       = useState(false);
  const [activeSection, setActiveSection] = useState('content'); // 'content' | 'design' | 'frame'

  const previewRef  = useRef(null);
  const qrStyling   = useRef(null);
  const logoInputRef = useRef(null);

  const setField = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

  const payload = buildPayload(activeTab, fields);

  // ── Init QRCodeStyling ──────────────────────────────────────────────────────
  useEffect(() => {
    qrStyling.current = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'canvas',
      data: payload,
      margin: Number(margin),
      qrOptions: { errorCorrectionLevel: errorLevel },
      dotsOptions: { type: dotStyle, color: fgColor },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornerSquareStyle, color: fgColor },
      cornersDotOptions:    { type: cornerDotStyle,    color: fgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: logoSize },
      image: logoDataUrl || undefined,
    });

    if (previewRef.current) {
      previewRef.current.innerHTML = '';
      qrStyling.current.append(previewRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update QR options whenever inputs change ────────────────────────────────
  useEffect(() => {
    if (!qrStyling.current) return;
    qrStyling.current.update({
      data: payload || ' ',
      margin: Number(margin),
      qrOptions: { errorCorrectionLevel: errorLevel },
      dotsOptions: { type: dotStyle, color: fgColor },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornerSquareStyle, color: fgColor },
      cornersDotOptions:    { type: cornerDotStyle,    color: fgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: logoSize },
      image: logoDataUrl || undefined,
    });
  }, [payload, margin, errorLevel, dotStyle, fgColor, bgColor,
      cornerSquareStyle, cornerDotStyle, logoDataUrl, logoSize]);

  // ── Logo upload ─────────────────────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Download helpers ────────────────────────────────────────────────────────
  const getHighResQR = useCallback(() => {
    return new QRCodeStyling({
      width: resolution, height: resolution,
      type: 'canvas',
      data: payload || ' ',
      margin: Number(margin),
      qrOptions: { errorCorrectionLevel: errorLevel },
      dotsOptions: { type: dotStyle, color: fgColor },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornerSquareStyle, color: fgColor },
      cornersDotOptions:    { type: cornerDotStyle,    color: fgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: logoSize },
      image: logoDataUrl || undefined,
    });
  }, [payload, margin, errorLevel, dotStyle, fgColor, bgColor,
      cornerSquareStyle, cornerDotStyle, logoDataUrl, logoSize, resolution]);

  const drawFrame = async (canvas) => {
    if (frameStyle === 'none') return canvas;
    const frameCanvas = document.createElement('canvas');
    const pad = Math.round(resolution * 0.08);
    const ctaHeight = Math.round(resolution * 0.14);
    const totalW = resolution + pad * 2;
    const totalH = frameStyle === 'bottom'
      ? resolution + pad + ctaHeight + pad
      : frameStyle === 'top'
        ? resolution + ctaHeight + pad + pad
        : resolution + pad * 2;
    frameCanvas.width  = totalW;
    frameCanvas.height = totalH;
    const ctx = frameCanvas.getContext('2d');

    // Frame background
    ctx.fillStyle = frameColor;
    const radius = frameStyle === 'rounded' ? 24 : 0;
    if (radius) {
      ctx.beginPath();
      ctx.roundRect(0, 0, totalW, totalH, radius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, totalW, totalH);
    }

    // White inner area
    ctx.fillStyle = bgColor;
    if (radius) {
      ctx.beginPath();
      ctx.roundRect(pad, frameStyle === 'top' ? ctaHeight : pad, resolution, resolution, radius / 2);
      ctx.fill();
    } else {
      ctx.fillRect(pad, frameStyle === 'top' ? ctaHeight : pad, resolution, resolution);
    }

    // Draw QR on frame
    ctx.drawImage(canvas, pad, frameStyle === 'top' ? ctaHeight : pad);

    // CTA text
    if (ctaText) {
      ctx.fillStyle = '#FFFFFF';
      const fontSize = Math.round(resolution * 0.045);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      const textY = frameStyle === 'top'
        ? ctaHeight / 2 + fontSize / 3
        : resolution + pad + ctaHeight / 2 + fontSize / 3;
      ctx.fillText(ctaText, totalW / 2, textY);
    }

    return frameCanvas;
  };

  const downloadPng = async () => {
    try {
      const hrQR = getHighResQR();
      const blob = await hrQR.getRawData('png');
      const bitmap = await createImageBitmap(blob);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width  = bitmap.width;
      tempCanvas.height = bitmap.height;
      tempCanvas.getContext('2d').drawImage(bitmap, 0, 0);
      const framedCanvas = await drawFrame(tempCanvas);
      const link = document.createElement('a');
      link.download = `qrcode_${activeTab}_${Date.now()}.png`;
      link.href = framedCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  const downloadSvg = async () => {
    try {
      const hrQR = getHighResQR();
      await hrQR.download({ name: `qrcode_${activeTab}_${Date.now()}`, extension: 'svg' });
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  };

  const downloadPdf = async () => {
    try {
      const hrQR = getHighResQR();
      const blob = await hrQR.getRawData('png');
      const arrayBuffer = await blob.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const page   = pdfDoc.addPage([595.28, 841.89]);
      const img    = await pdfDoc.embedPng(new Uint8Array(arrayBuffer));
      const qrSize = 340;
      page.drawImage(img, {
        x: (595.28 - qrSize) / 2,
        y: (841.89 - qrSize) / 2 + 30,
        width: qrSize, height: qrSize,
      });
      const pdfBytes = await pdfDoc.save();
      const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.download = `qrcode_${activeTab}_${Date.now()}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const copyImage = async () => {
    try {
      const hrQR = getHighResQR();
      const blob = await hrQR.getRawData('png');
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
        setCopiedImg(true);
        setTimeout(() => setCopiedImg(false), 2000);
      }
    } catch (err) {
      console.error('Copy image failed:', err);
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Field renderers ─────────────────────────────────────────────────────────

  const inputCls = 'w-full text-sm px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-500 dark:focus:border-purple-400 outline-none text-zinc-900 dark:text-white transition-colors';
  const labelCls = 'block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1';

  const renderTabFields = () => {
    switch (activeTab) {
      case 'url':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Website URL</label>
              <input type="url" value={fields.url} onChange={e => setField('url', e.target.value)}
                placeholder="https://yourwebsite.com" className={inputCls} />
              <p className="text-[11px] text-zinc-500 mt-1">Users will be redirected immediately when scanned.</p>
            </div>
          </div>
        );
      case 'text':
        return (
          <div>
            <label className={labelCls}>Plain Text / Message</label>
            <textarea rows={5} value={fields.text} onChange={e => setField('text', e.target.value)}
              placeholder="Enter any text, instructions, or notes here..."
              className={`${inputCls} resize-none`} />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Network Name (SSID)</label>
                <input type="text" value={fields.wifiSsid} onChange={e => setField('wifiSsid', e.target.value)}
                  placeholder="Office_Guest_WiFi" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Encryption</label>
                <select value={fields.wifiEncryption} onChange={e => setField('wifiEncryption', e.target.value)}
                  className={inputCls}>
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open)</option>
                </select>
              </div>
            </div>
            {fields.wifiEncryption !== 'nopass' && (
              <div>
                <label className={labelCls}>Wi-Fi Password</label>
                <input type="password" value={fields.wifiPassword} onChange={e => setField('wifiPassword', e.target.value)}
                  placeholder="Enter wireless password" className={inputCls} />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fields.wifiHidden} onChange={e => setField('wifiHidden', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Hidden SSID Network</span>
            </label>
          </div>
        );
      case 'vcard':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>First Name</label><input type="text" value={fields.vcardFirst} onChange={e => setField('vcardFirst', e.target.value)} placeholder="John" className={inputCls} /></div>
              <div><label className={labelCls}>Last Name</label><input type="text" value={fields.vcardLast} onChange={e => setField('vcardLast', e.target.value)} placeholder="Doe" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Phone</label><input type="tel" value={fields.vcardPhone} onChange={e => setField('vcardPhone', e.target.value)} placeholder="+1 555 000 0000" className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={fields.vcardEmail} onChange={e => setField('vcardEmail', e.target.value)} placeholder="john@company.com" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Company</label><input type="text" value={fields.vcardCompany} onChange={e => setField('vcardCompany', e.target.value)} placeholder="Acme Corp" className={inputCls} /></div>
              <div><label className={labelCls}>Job Title</label><input type="text" value={fields.vcardTitle} onChange={e => setField('vcardTitle', e.target.value)} placeholder="Product Lead" className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Website</label><input type="url" value={fields.vcardWeb} onChange={e => setField('vcardWeb', e.target.value)} placeholder="https://company.com" className={inputCls} /></div>
            <div><label className={labelCls}>Address</label><input type="text" value={fields.vcardAddress} onChange={e => setField('vcardAddress', e.target.value)} placeholder="123 Main St, City, Country" className={inputCls} /></div>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-3">
            <div><label className={labelCls}>Recipient Email</label><input type="email" value={fields.emailTo} onChange={e => setField('emailTo', e.target.value)} placeholder="hello@example.com" className={inputCls} /></div>
            <div><label className={labelCls}>Subject</label><input type="text" value={fields.emailSubject} onChange={e => setField('emailSubject', e.target.value)} placeholder="Inquiry / Feedback" className={inputCls} /></div>
            <div><label className={labelCls}>Body Message</label><textarea rows={3} value={fields.emailBody} onChange={e => setField('emailBody', e.target.value)} placeholder="Pre-filled email body..." className={`${inputCls} resize-none`} /></div>
          </div>
        );
      case 'phone':
        return (
          <div><label className={labelCls}>Phone Number to Call</label><input type="tel" value={fields.phoneNumber} onChange={e => setField('phoneNumber', e.target.value)} placeholder="+1 (555) 123-4567" className={inputCls} /></div>
        );
      case 'sms':
        return (
          <div className="space-y-3">
            <div><label className={labelCls}>Phone Number</label><input type="tel" value={fields.smsPhone} onChange={e => setField('smsPhone', e.target.value)} placeholder="+1 555 123 4567" className={inputCls} /></div>
            <div><label className={labelCls}>SMS Message</label><textarea rows={3} value={fields.smsMessage} onChange={e => setField('smsMessage', e.target.value)} placeholder="Type pre-filled SMS message..." className={`${inputCls} resize-none`} /></div>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="space-y-3">
            <div><label className={labelCls}>WhatsApp Number (with country code)</label><input type="tel" value={fields.waPhone} onChange={e => setField('waPhone', e.target.value)} placeholder="15551234567" className={inputCls} /></div>
            <div><label className={labelCls}>Pre-filled Message</label><textarea rows={3} value={fields.waMessage} onChange={e => setField('waMessage', e.target.value)} placeholder="Hello! I'd like to inquire about..." className={`${inputCls} resize-none`} /></div>
          </div>
        );
      case 'location':
        return (
          <div>
            <label className={labelCls}>Address / Location</label>
            <input type="text" value={fields.locationQuery} onChange={e => setField('locationQuery', e.target.value)} placeholder="Eiffel Tower, Paris, France" className={inputCls} />
            <p className="text-[11px] text-zinc-500 mt-1">Opens in Google Maps when scanned.</p>
          </div>
        );
      case 'youtube':
        return (
          <div>
            <label className={labelCls}>YouTube Video / Channel URL</label>
            <input type="url" value={fields.youtubeUrl} onChange={e => setField('youtubeUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
          </div>
        );
      case 'instagram':
        return (
          <div>
            <label className={labelCls}>Instagram Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">@</span>
              <input type="text" value={fields.instagramHandle} onChange={e => setField('instagramHandle', e.target.value)} placeholder="yourusername" className={`${inputCls} pl-8`} />
            </div>
          </div>
        );
      case 'facebook':
        return (
          <div>
            <label className={labelCls}>Facebook Page / Profile URL</label>
            <input type="url" value={fields.facebookUrl} onChange={e => setField('facebookUrl', e.target.value)} placeholder="https://facebook.com/yourpage" className={inputCls} />
          </div>
        );
      case 'linkedin':
        return (
          <div>
            <label className={labelCls}>LinkedIn Profile / Company URL</label>
            <input type="url" value={fields.linkedinUrl} onChange={e => setField('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className={inputCls} />
          </div>
        );
      case 'twitter':
        return (
          <div>
            <label className={labelCls}>X / Twitter Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">@</span>
              <input type="text" value={fields.twitterHandle} onChange={e => setField('twitterHandle', e.target.value)} placeholder="yourusername" className={`${inputCls} pl-8`} />
            </div>
          </div>
        );
      case 'appstore':
        return (
          <div>
            <label className={labelCls}>App Store / Play Store URL</label>
            <input type="url" value={fields.appstoreUrl} onChange={e => setField('appstoreUrl', e.target.value)} placeholder="https://apps.apple.com/app/..." className={inputCls} />
          </div>
        );
      case 'review':
        return (
          <div>
            <label className={labelCls}>Google Review Link</label>
            <input type="url" value={fields.reviewUrl} onChange={e => setField('reviewUrl', e.target.value)} placeholder="https://g.page/r/..." className={inputCls} />
            <p className="text-[11px] text-zinc-500 mt-1">Get your review link from your Google Business Profile.</p>
          </div>
        );
      case 'github':
        return (
          <div>
            <label className={labelCls}>GitHub Username or Repo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">@</span>
              <input type="text" value={fields.githubHandle} onChange={e => setField('githubHandle', e.target.value)} placeholder="octocat" className={`${inputCls} pl-8`} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-7xl mx-auto font-sans space-y-0">
      {/* ── Main Studio Card ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">

        {/* ── QR Type Tabs (horizontal scroll) ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 no-scrollbar">
          {QR_TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Studio Body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">

          {/* ── Left Panel: Section Switcher + Content ── */}
          <div className="lg:col-span-7 flex flex-col border-r border-zinc-200 dark:border-zinc-800">

            {/* Section Pills */}
            <div className="flex items-center gap-1 p-4 pb-0">
              {[
                { id: 'content', label: 'Content'  },
                { id: 'design',  label: 'Design'   },
                { id: 'frame',   label: 'Frame'    },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeSection === s.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto">

              {/* ── CONTENT SECTION ── */}
              {activeSection === 'content' && renderTabFields()}

              {/* ── DESIGN SECTION ── */}
              {activeSection === 'design' && (
                <div className="space-y-6">

                  {/* Preset Colors */}
                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Color Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-purple-400 cursor-pointer shadow-xs transition-colors"
                        >
                          <span className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: p.fg }} />
                          <span className="text-zinc-700 dark:text-zinc-300">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">Dots / Foreground</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent" />
                        <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent" />
                        <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Dot Style */}
                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Dot / Module Shape</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DOT_STYLES.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setDotStyle(s.id)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            dotStyle === s.id
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-purple-400'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner (Eye) Styles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Corner Square Style</p>
                      <div className="space-y-1.5">
                        {CORNER_SQUARE_STYLES.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setCornerSquareStyle(s.id)}
                            className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-left ${
                              cornerSquareStyle === s.id
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-purple-400'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Corner Dot Style</p>
                      <div className="space-y-1.5">
                        {CORNER_DOT_STYLES.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setCornerDotStyle(s.id)}
                            className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-left ${
                              cornerDotStyle === s.id
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-purple-400'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Logo / Image in Center</p>
                    {logoDataUrl ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                        <img src={logoDataUrl} alt="Logo preview" className="w-10 h-10 rounded-lg object-contain border border-zinc-200 dark:border-zinc-700 bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Logo uploaded</p>
                          <input
                            type="range" min="0.1" max="0.4" step="0.05"
                            value={logoSize}
                            onChange={e => setLogoSize(Number(e.target.value))}
                            className="w-full mt-1 accent-purple-600"
                          />
                          <p className="text-[10px] text-zinc-500">Size: {Math.round(logoSize * 100)}%</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLogoDataUrl(null)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo (PNG, SVG, JPG)
                      </button>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>

                  {/* Advanced */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Error Correction</label>
                      <select value={errorLevel} onChange={e => setErrorLevel(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none">
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Quiet Margin</label>
                      <select value={margin} onChange={e => setMargin(Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none">
                        <option value="0">0 – Compact</option>
                        <option value="1">1 – Tight</option>
                        <option value="2">2 – Balanced</option>
                        <option value="4">4 – Standard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Export Size</label>
                      <select value={resolution} onChange={e => setResolution(Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none">
                        <option value="512">512 px – Web</option>
                        <option value="1024">1024 px – HD Print</option>
                        <option value="2048">2048 px – Ultra HD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FRAME SECTION ── */}
              {activeSection === 'frame' && (
                <div className="space-y-5">
                  {/* Frame Style */}
                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Frame Style</p>
                    <div className="grid grid-cols-3 gap-2">
                      {FRAME_STYLES.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFrameStyle(s.id)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            frameStyle === s.id
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-purple-400'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {frameStyle !== 'none' && (
                    <>
                      {/* Frame Color */}
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">Frame Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={frameColor} onChange={e => setFrameColor(e.target.value)}
                            className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent" />
                          <input type="text" value={frameColor} onChange={e => setFrameColor(e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono outline-none" />
                        </div>
                      </div>

                      {/* CTA Text */}
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">Call-to-Action Text</label>
                        <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)}
                          placeholder="e.g. Scan Me"
                          className="w-full text-sm px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-500 outline-none text-zinc-900 dark:text-white transition-colors" />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {CTA_PRESETS.map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCtaText(p)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors ${
                                ctaText === p
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-purple-300'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Frame Preview Hint */}
                      <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                        <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                          💡 Frame is applied when downloading PNG. The live preview shows the QR code without frame for clarity.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel: Live Preview + Downloads ── */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-950/40 space-y-5">

            {/* Label */}
            <div className="w-full text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900">
                Live Preview
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Updates instantly as you type</p>
            </div>

            {/* QR Preview */}
            <div
              className="relative rounded-3xl p-4 shadow-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-all"
              style={{ backgroundColor: bgColor }}
            >
              <div ref={previewRef} className="max-w-full" />
            </div>

            {/* Frame preview badge */}
            {frameStyle !== 'none' && (
              <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                <span>🖼</span>
                <span>Frame: {FRAME_STYLES.find(s => s.id === frameStyle)?.label} — "{ctaText}"</span>
              </div>
            )}

            {/* Download Buttons */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={downloadPng}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG ({resolution}px)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={downloadSvg}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <FileImage className="w-3.5 h-3.5 text-purple-600" />
                  <span>Vector SVG</span>
                </button>
                <button type="button" onClick={downloadPdf}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Printable PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={copyImage}
                  className="py-2 px-3 rounded-xl font-semibold text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  {copiedImg ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedImg ? 'Image Copied!' : 'Copy Image'}</span>
                </button>
                <button type="button" onClick={copyPayload}
                  className="py-2 px-3 rounded-xl font-semibold text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Data'}</span>
                </button>
              </div>
            </div>

            {/* Payload preview */}
            <div className="w-full">
              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">QR Data Preview</p>
              <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 break-all bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 max-h-14 overflow-hidden line-clamp-3">
                {payload}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
