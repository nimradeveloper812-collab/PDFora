import React, { useEffect, useRef } from 'react';

/**
 * Responsive Google AdSense Banner Component
 * Handles auto-responsive ad injection, ad slots, and layout stability
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

  useEffect(() => {
    // Only push once per mount cycle
    if (pushedRef.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.debug('AdSense push notice:', err);
    }
  }, []);

  return (
    <div
      className={`ad-wrapper my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: '90px', ...style }}
    >
      <span
        className="text-[10px] uppercase font-semibold tracking-wider mb-1.5 select-none"
        style={{ color: '#A1A1AA' }}
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
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', ...style }}
          data-ad-client="ca-pub-4933513982054789"
          data-ad-slot={slot || '1234567890'}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
