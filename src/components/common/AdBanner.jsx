import React, { useEffect, useRef } from 'react';

/**
 * Responsive Google AdSense Banner Component
 * Ensures zero console errors during AdSense review, zero Cumulative Layout Shift (CLS),
 * and clean fallback presentation until real ad units are activated.
 */
export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style = {}
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  // A valid Google AdSense slot is a distinct numeric ID of 10 digits that is not a demo placeholder
  const isRealAdSlot = slot && slot !== '1234567890' && slot !== '7890123456' && slot !== '4567890123' && /^\d{9,12}$/.test(slot);

  useEffect(() => {
    // Only attempt ad push if a genuine ad slot is configured and not already pushed
    if (!isRealAdSlot || pushedRef.current) return;

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.debug('AdSense notice:', err);
    }
  }, [isRealAdSlot]);

  return (
    <aside
      aria-label="Advertisement"
      className={`ad-wrapper my-6 flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
      style={{ minHeight: '90px', ...style }}
    >
      <span
        className="text-[10px] uppercase font-semibold tracking-wider mb-1.5 select-none"
        style={{ color: '#94A3B8' }}
        aria-hidden="true"
      >
        Advertisement
      </span>

      <div
        ref={adRef}
        className="w-full flex justify-center items-center rounded-2xl overflow-hidden p-2 transition-all"
        style={{
          background: '#F8FAFC',
          border: '1px dashed #BFDBFE',
          minHeight: '90px',
        }}
      >
        {isRealAdSlot ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', ...style }}
            data-ad-client="ca-pub-4933513982054789"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        ) : (
          <div className="text-center py-4 px-3 select-none">
            <p className="text-xs font-semibold" style={{ color: '#64748B' }}>
              PDFora — 100% Free & Secure Online PDF Tools
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
              Convert, merge, compress, and edit documents privately in your browser.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
