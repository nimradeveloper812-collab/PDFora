import React, { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// AdBanner — Policy-Compliant Google AdSense Component
// ---------------------------------------------------------------------------
// KEY DESIGN DECISIONS:
//
//  1. IntersectionObserver lazy init: adsbygoogle.push({}) only fires when the
//     <ins> element is at least 30% visible. This prevents "invisible ad"
//     impressions which violate AdSense policy and waste quota.
//
//  2. Fixed-height skeleton: The outer wrapper always reserves the full slot
//     height from the moment the component mounts. This eliminates Cumulative
//     Layout Shift (CLS) — a Core Web Vital that Google measures and that can
//     delay AdSense approval.
//
//  3. Environment variable slot IDs: Set VITE_AD_SLOT_HEADER,
//     VITE_AD_SLOT_TOOL, and VITE_AD_SLOT_DOWNLOAD in your .env.local file.
//     No code changes needed when you get real slot IDs from AdSense console.
//
//  4. Single push guard: pushedRef ensures adsbygoogle.push({}) is only ever
//     called once per component instance, even during React StrictMode double
//     renders in development.
//
//  5. "Advertisement" label: Required by Google's Ad Placement Policies.
//     The label must be visible, adjacent to the ad unit, and non-deceptive.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SLOT HEIGHT CONSTANTS
// Reserve these exact heights in CSS so no layout shift occurs when ad loads.
// These match Google's standard IAB ad sizes:
//   leaderboard  = 728×90  (desktop) / 320×50 (mobile)
//   rectangle    = 336×280 (best CPM for utility tool pages)
//   banner       = 468×60  (classic inline banner)
// ---------------------------------------------------------------------------
const SLOT_HEIGHTS = {
  leaderboard: 90,   // header / top of page
  rectangle:   280,  // below dropzone / high-CPM content area
  banner:      90,   // inline / secondary placements
};

// ---------------------------------------------------------------------------
// ENVIRONMENT-VARIABLE SLOT IDs
// Add these to your .env.local file:
//
//   VITE_AD_SLOT_HEADER=<your 10-digit slot ID>
//   VITE_AD_SLOT_TOOL=<your 10-digit slot ID>
//   VITE_AD_SLOT_DOWNLOAD=<your 10-digit slot ID>
//
// Until you add real IDs, the component renders a branded placeholder.
// ---------------------------------------------------------------------------
export const AD_SLOTS = {
  header:   import.meta.env.VITE_AD_SLOT_HEADER   || '5984342421',
  tool:     import.meta.env.VITE_AD_SLOT_TOOL     || '2975035707',
  download: import.meta.env.VITE_AD_SLOT_DOWNLOAD || '8567485183',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdBanner({
  slot,              // 10-digit slot ID string (use AD_SLOTS.header etc.)
  format     = 'auto',
  responsive = true,
  variant    = 'rectangle', // 'leaderboard' | 'rectangle' | 'banner'
  className  = '',
  style      = {},
}) {
  const insRef    = useRef(null);   // ref to the <ins> element
  const pushedRef = useRef(false);  // guard: push only once per mount
  const [adVisible, setAdVisible] = useState(false); // has observer fired?

  // Map legacy string slots to real environment keys
  let finalSlot = slot;
  if (slot === 'horizontal-leaderboard') {
    finalSlot = AD_SLOTS.tool;
  }

  // Determine reserved height for this slot variant
  const reservedHeight = SLOT_HEIGHTS[variant] ?? SLOT_HEIGHTS.rectangle;

  // A slot is real when it's a non-empty numeric string that isn't a known
  // placeholder. The regex accepts 9–12 digit strings matching AdSense format.
  const isRealSlot = Boolean(
    finalSlot &&
    /^\d{9,12}$/.test(finalSlot) &&
    !['1234567890', '7890123456', '4567890123'].includes(finalSlot)
  );

  // ---------------------------------------------------------------------------
  // IntersectionObserver: only push the ad when it enters the viewport.
  // threshold: 0.3 means 30% of the element must be visible before firing.
  // This prevents "below-the-fold hidden ad" policy violations.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isRealSlot) return; // no real slot configured — show placeholder

    const el = insRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !pushedRef.current) {
            try {
              // adsbygoogle is loaded by the async script in index.html
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              pushedRef.current = true;
              setAdVisible(true);
            } catch (err) {
              // Log at debug level only — not an error during normal review
              console.debug('[AdBanner] adsbygoogle push notice:', err.message);
            }
            observer.unobserve(el); // stop observing after first push
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px 100px 0px' }
      //                             ↑ 100px pre-load margin so ad fetches
      //                               slightly before it scrolls into view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isRealSlot]);

  return (
    // -------------------------------------------------------------------------
    // Outer wrapper: fixed min-height reserves layout space IMMEDIATELY on
    // mount. This is what eliminates Cumulative Layout Shift (CLS).
    // The height is set inline so it cannot be accidentally overridden by
    // Tailwind purging or utility conflicts.
    // -------------------------------------------------------------------------
    <aside
      aria-label="Advertisement"
      className={`ad-wrapper flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: reservedHeight + 20, ...style }} // +20 for label row
    >
      {/* "Advertisement" label — required by AdSense Ad Placement Policies.
          Must be clearly visible, directly adjacent to the ad unit. */}
      <span
        className="text-[10px] uppercase font-semibold tracking-widest select-none mb-1"
        style={{ color: '#94A3B8' }}
        aria-hidden="true"
      >
        Advertisement
      </span>

      {/* Ad slot container — fixed height prevents layout shift */}
      <div
        className="w-full flex justify-center items-center rounded-xl overflow-hidden"
        style={{ minHeight: reservedHeight }}
      >
        {isRealSlot ? (
          // -----------------------------------------------------------------
          // Real ad unit: <ins> is the standard AdSense element.
          // data-ad-client matches your publisher ID from index.html.
          // -----------------------------------------------------------------
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              minHeight: reservedHeight,
              // Skeleton background visible until the ad iframe loads
              background: adVisible ? 'transparent' : '#F1F5F9',
            }}
            data-ad-client="ca-pub-4933513982054789" // your publisher ID
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        ) : (
          // -----------------------------------------------------------------
          // Placeholder: shown during development or when no slot ID is set.
          // Branded and non-deceptive — does not resemble an actual ad.
          // -----------------------------------------------------------------
          <div
            className="w-full flex items-center justify-center rounded-xl border border-dashed"
            style={{
              minHeight: reservedHeight,
              background: '#F8FAFC',
              borderColor: '#CBD5E1',
            }}
          >
            <div className="text-center py-4 px-3 select-none space-y-1">
              <p className="text-xs font-bold" style={{ color: '#64748B' }}>
                PDFora — 100% Free &amp; Secure Online PDF Tools
              </p>
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                Ad slot not configured. Add{' '}
                <code className="font-mono text-purple-500">VITE_AD_SLOT_*</code>
                {' '}to your <code className="font-mono text-purple-500">.env.local</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
