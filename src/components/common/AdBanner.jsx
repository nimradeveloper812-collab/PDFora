import React, { useEffect, useRef } from 'react';

/** Named ad slot IDs — update with your real AdSense slot IDs from adsense.google.com */
export const AD_SLOTS = {
  HOME_HORIZONTAL:    '2947093463',
  TOOL_BELOW_CONTENT: '4990802870',
  DOWNLOAD_AREA:      '4990802870', // Reused for download success screen
  ABOVE_FOOTER:       '2500370909',
};

/**
 * Google AdSense Ad Unit Component
 * Renders a responsive AdSense ad block safely.
 *
 * Usage:
 *   <AdBanner slot={AD_SLOTS.HOME_HORIZONTAL} format="horizontal" />
 *   <AdBanner slot={AD_SLOTS.TOOL_BELOW_HEADER} format="auto" />
 */
export default function AdBanner({
  slot,
  format = 'auto',
  style = {},
  className = '',
  responsive = true,
}) {
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    if (!insRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.warn('AdSense push error:', err);
    }
  }, []);

  return (
    <div
      className={`adsense-wrapper ${className}`}
      style={{ overflow: 'hidden', textAlign: 'center', minHeight: '90px' }}
      aria-label="Advertisement"
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-4933513982054789"
        data-ad-slot={slot || ''}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
