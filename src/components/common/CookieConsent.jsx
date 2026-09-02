import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie, X, Check, Lock } from 'lucide-react';

const STORAGE_KEY = 'pdfora_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    // Check if consent has already been given
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Display banner after a short delay for smooth page entrance
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted (e.g. private mode)
      setVisible(false);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: true,
          advertising: true,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.debug('Cookie consent storage error:', err);
    }
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: false,
          advertising: false,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.debug('Cookie consent storage error:', err);
    }
    setVisible(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: analyticsEnabled,
          advertising: adsEnabled,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.debug('Cookie consent storage error:', err);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Data Privacy Consent"
      role="region"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div
        className="max-w-4xl mx-auto rounded-3xl p-5 sm:p-6 pointer-events-auto transition-all duration-300"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #BFDBFE',
          boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.2), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {!showPreferences ? (
          /* ── Main Compact Consent Notice ── */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#DBEAFE', color: '#3B82F6' }}
                aria-hidden="true"
              >
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold" style={{ color: '#18181B' }}>
                    Cookie &amp; Privacy Preferences
                  </h3>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                  >
                    <Lock className="w-2.5 h-2.5" /> 100% In-Browser Privacy
                  </span>
                </div>
                <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#64748B' }}>
                  We use strictly necessary cookies to process PDF operations in your browser and standard advertising cookies (Google AdSense) to keep PDFora free. We never inspect or store your documents. Learn more in our{' '}
                  <Link to="/privacy-policy" className="font-semibold underline hover:text-blue-600" style={{ color: '#3B82F6' }}>
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all"
                style={{ color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                Customize
              </button>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                style={{ color: '#1E293B', background: '#EFF6FF', border: '1px solid #BFDBFE' }}
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all shadow-sm active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* ── Granular Preferences Modal ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h3 className="text-sm font-bold" style={{ color: '#18181B' }}>
                  Custom Privacy Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close custom preferences"
              >
                <X className="w-4 h-4" style={{ color: '#64748B' }} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Essential Cookies */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold" style={{ color: '#18181B' }}>Essential Sandbox</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Always Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Required for client-side document conversions, memory management, and security headers.
                </p>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-2xl bg-white border border-blue-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="toggle-analytics" className="text-xs font-bold cursor-pointer" style={{ color: '#18181B' }}>
                    Anonymous Analytics
                  </label>
                  <input
                    id="toggle-analytics"
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={e => setAnalyticsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Helps us detect client errors and measure conversion speed without collecting personal information.
                </p>
              </div>

              {/* Advertising */}
              <div className="p-3.5 rounded-2xl bg-white border border-blue-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="toggle-ads" className="text-xs font-bold cursor-pointer" style={{ color: '#18181B' }}>
                    Google AdSense
                  </label>
                  <input
                    id="toggle-ads"
                    type="checkbox"
                    checked={adsEnabled}
                    onChange={e => setAdsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Displays non-intrusive ads that fund our free service via Google certified advertising partners.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3" style={{ borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="text-xs font-bold px-5 py-2 rounded-xl text-white flex items-center gap-1.5"
                style={{ background: '#2563EB' }}
              >
                <Check className="w-3.5 h-3.5" /> Save Choices
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
