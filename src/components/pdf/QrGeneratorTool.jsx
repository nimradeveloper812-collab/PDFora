import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import {
  QrCode, Download, Copy, Check, Link, FileText,
  Wifi, User, Mail, Phone, MessageSquare, MessageCircle,
  Palette, FileImage, Layers
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Classic Black', fg: '#000000', bg: '#FFFFFF' },
  { name: 'PDFora Purple', fg: '#6C3FFC', bg: '#FFFFFF' },
  { name: 'Royal Blue', fg: '#2563EB', bg: '#FFFFFF' },
  { name: 'Emerald Green', fg: '#059669', bg: '#FFFFFF' },
  { name: 'Crimson Red', fg: '#DC2626', bg: '#FFFFFF' },
  { name: 'Indigo Night', fg: '#1E1B4B', bg: '#EEF2FF' },
  { name: 'Dark Slate', fg: '#334155', bg: '#F8FAFC' },
  { name: 'Sunset Amber', fg: '#D97706', bg: '#FFFBEB' },
];

export default function QrGeneratorTool() {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms' | 'whatsapp'
  
  // Fields state
  const [url, setUrl] = useState('https://pdfora.nimradev.site');
  const [text, setText] = useState('Welcome to PDFora — Free Online Document Tools');
  
  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA'); // 'WPA' | 'WEP' | 'nopass'
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardFirst, setVcardFirst] = useState('');
  const [vcardLast, setVcardLast] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardWeb, setVcardWeb] = useState('');
  const [vcardAddress, setVcardAddress] = useState('');

  // Email
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone
  const [phoneNumber, setPhoneNumber] = useState('');

  // SMS
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // WhatsApp
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');

  // Styling & Config
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M'); // 'L' | 'M' | 'Q' | 'H'
  const [resolution, setResolution] = useState(512); // 256, 512, 1024, 2048
  const [margin, setMargin] = useState(2); // 0, 1, 2, 4
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const canvasRef = useRef(null);

  // Build payload based on active tab
  const qrPayload = useMemo(() => {
    switch (activeTab) {
      case 'url':
        return url.trim() || 'https://pdfora.nimradev.site';
      case 'text':
        return text.trim() || 'Sample Text';
      case 'wifi': {
        const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption;
        const pass = wifiEncryption === 'nopass' ? '' : wifiPassword;
        return `WIFI:S:${wifiSsid};T:${enc};P:${pass};H:${wifiHidden ? 'true' : 'false'};;`;
      }
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcardLast};${vcardFirst};;;`,
          `FN:${[vcardFirst, vcardLast].filter(Boolean).join(' ')}`,
          vcardCompany ? `ORG:${vcardCompany}` : '',
          vcardTitle ? `TITLE:${vcardTitle}` : '',
          vcardPhone ? `TEL;TYPE=CELL:${vcardPhone}` : '',
          vcardEmail ? `EMAIL:${vcardEmail}` : '',
          vcardWeb ? `URL:${vcardWeb}` : '',
          vcardAddress ? `ADR;TYPE=WORK:;;${vcardAddress};;;;` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      case 'email':
        return `mailto:${emailTo.trim()}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneNumber.trim()}`;
      case 'sms':
        return `smsto:${smsPhone.trim()}:${smsMessage}`;
      case 'whatsapp': {
        const cleanPhone = waPhone.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`;
      }
      default:
        return 'https://pdfora.nimradev.site';
    }
  }, [
    activeTab, url, text, wifiSsid, wifiPassword, wifiEncryption, wifiHidden,
    vcardFirst, vcardLast, vcardPhone, vcardEmail, vcardCompany, vcardTitle, vcardWeb, vcardAddress,
    emailTo, emailSubject, emailBody, phoneNumber, smsPhone, smsMessage, waPhone, waMessage
  ]);

  // Render QR Code onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(
      canvas,
      qrPayload || ' ',
      {
        width: 320,
        margin: Number(margin),
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  }, [qrPayload, fgColor, bgColor, errorCorrectionLevel, margin]);

  // Download High-Res PNG
  const downloadPng = async () => {
    try {
      const exportCanvas = document.createElement('canvas');
      await QRCode.toCanvas(exportCanvas, qrPayload || ' ', {
        width: resolution,
        margin: Number(margin),
        errorCorrectionLevel: errorCorrectionLevel,
        color: { dark: fgColor, light: bgColor },
      });

      const link = document.createElement('a');
      link.download = `qrcode_${activeTab}_${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  // Download Vector SVG
  const downloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(qrPayload || ' ', {
        type: 'svg',
        margin: Number(margin),
        errorCorrectionLevel: errorCorrectionLevel,
        color: { dark: fgColor, light: bgColor },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrcode_${activeTab}_${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  };

  // Download Printable PDF
  const downloadPdf = async () => {
    try {
      const exportCanvas = document.createElement('canvas');
      await QRCode.toCanvas(exportCanvas, qrPayload || ' ', {
        width: 1024,
        margin: Number(margin),
        errorCorrectionLevel: errorCorrectionLevel,
        color: { dark: fgColor, light: bgColor },
      });

      const pngDataUrl = exportCanvas.toDataURL('image/png');
      const pngBase64 = pngDataUrl.split(',')[1];
      const pngBytes = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Portrait
      const embeddedImage = await pdfDoc.embedPng(pngBytes);

      const qrSize = 340;
      const x = (595.28 - qrSize) / 2;
      const y = (841.89 - qrSize) / 2 + 30;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: qrSize,
        height: qrSize,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrcode_${activeTab}_${Date.now()}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  // Copy Image to Clipboard
  const copyImage = async () => {
    try {
      const exportCanvas = document.createElement('canvas');
      await QRCode.toCanvas(exportCanvas, qrPayload || ' ', {
        width: 512,
        margin: Number(margin),
        errorCorrectionLevel: errorCorrectionLevel,
        color: { dark: fgColor, light: bgColor },
      });

      exportCanvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2000);
        }
      });
    } catch (err) {
      console.error('Copy image failed:', err);
    }
  };

  // Copy Raw Text
  const copyRawPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'url', label: 'Link / URL', icon: Link },
    { id: 'text', label: 'Plain Text', icon: FileText },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'vcard', label: 'vCard Contact', icon: User },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Call', icon: Phone },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto font-sans space-y-8 animate-fade-up">
      {/* Studio Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        {/* Navigation Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Body: Form Controls on Left, Live QR on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tab: URL */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Website URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full text-sm px-4 py-3 pl-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-zinc-900 dark:text-white"
                    />
                    <Link className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">Users will be redirected immediately when scanned.</p>
                </div>
              </div>
            )}

            {/* Tab: Text */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Plain Text / Message
                  </label>
                  <textarea
                    rows={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter any text, instructions, or notes here..."
                    className="w-full text-sm px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Tab: Wi-Fi */}
            {activeTab === 'wifi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="e.g. Office_Guest_WiFi"
                      className="w-full text-sm px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Encryption
                    </label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value)}
                      className="w-full text-sm px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>

                {wifiEncryption !== 'nopass' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Wi-Fi Password
                    </label>
                    <input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Enter wireless password"
                      className="w-full text-sm px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Hidden SSID Network</span>
                </label>
              </div>
            )}

            {/* Tab: vCard */}
            {activeTab === 'vcard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={vcardFirst}
                      onChange={(e) => setVcardFirst(e.target.value)}
                      placeholder="John"
                      className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={vcardLast}
                      onChange={(e) => setVcardLast(e.target.value)}
                      placeholder="Doe"
                      className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Company</label>
                    <input
                      type="text"
                      value={vcardCompany}
                      onChange={(e) => setVcardCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Job Title</label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      placeholder="Product Lead"
                      className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={vcardWeb}
                    onChange={(e) => setVcardWeb(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Tab: Email */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Recipient Email</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry / Feedback"
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Body Message</label>
                  <textarea
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Pre-filled email body..."
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Tab: Phone */}
            {activeTab === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number to Call</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full text-sm px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Tab: SMS */}
            {activeTab === 'sms' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">SMS Text Message</label>
                  <textarea
                    rows={3}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Type pre-filled SMS message..."
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Tab: WhatsApp */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    WhatsApp Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="e.g. 15551234567"
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Pre-filled Chat Message</label>
                  <textarea
                    rows={3}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Hello! I would like to inquire about..."
                    className="w-full text-sm px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:border-purple-600 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Customization & Design Section */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Colors & Design Customization</span>
              </div>

              {/* Preset Palettes */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-purple-400 cursor-pointer shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: p.fg }} />
                    <span className="text-zinc-700 dark:text-zinc-300">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Manual Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Dots / Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Error Correction</label>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30% - Best)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Quiet Margin</label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="0">0 (Compact)</option>
                    <option value="1">1 (Tight)</option>
                    <option value="2">2 (Balanced)</option>
                    <option value="4">4 (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Export Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="512">512 px (Web)</option>
                    <option value="1024">1024 px (HD Print)</option>
                    <option value="2048">2048 px (Ultra HD)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Preview & Download Action Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="w-full text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900">
                Live Real-Time Preview
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">Scan directly with any smartphone camera</p>
            </div>

            {/* QR Canvas Preview Frame */}
            <div
              className="relative p-4 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-transform hover:scale-102"
              style={{ backgroundColor: bgColor }}
            >
              <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl" />
            </div>

            {/* Download Buttons Group */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={downloadPng}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG ({resolution}px)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={downloadSvg}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileImage className="w-3.5 h-3.5 text-purple-600" />
                  <span>Vector SVG</span>
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Printable PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={copyImage}
                  className="py-2 px-3 rounded-xl font-semibold text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedImage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={copyRawPayload}
                  className="py-2 px-3 rounded-xl font-semibold text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied Data!' : 'Copy Raw Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
