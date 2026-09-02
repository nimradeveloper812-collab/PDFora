/**
 * Google Analytics 4 (GA4) Event Dispatcher for PDFora
 * Respects User Privacy & Cookie Consent Settings
 */

const STORAGE_KEY = 'pdfora_cookie_consent';

function isAnalyticsAllowed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true; // Default to standard until configured
    const parsed = JSON.parse(raw);
    return parsed.analytics !== false;
  } catch {
    return true;
  }
}

export function trackEvent(eventName, eventParams = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!isAnalyticsAllowed()) return;

  try {
    window.gtag('event', eventName, {
      platform: 'PDFora_Web',
      timestamp: new Date().toISOString(),
      ...eventParams,
    });
  } catch (err) {
    console.debug('GA4 Event Error:', err);
  }
}

export const analytics = {
  // Page / Tool View
  trackToolView(toolId, toolName) {
    trackEvent('tool_view', {
      tool_id: toolId,
      tool_name: toolName,
    });
  },

  // File Upload
  trackFileUpload(toolId, fileCount, totalSizeBytes) {
    trackEvent('file_upload', {
      tool_id: toolId,
      file_count: fileCount,
      total_size_kb: Math.round((totalSizeBytes || 0) / 1024),
    });
  },

  // Conversion Started
  trackConversionStart(toolId, options = {}) {
    trackEvent('conversion_start', {
      tool_id: toolId,
      ...options,
    });
  },

  // Conversion Completed
  trackConversionSuccess(toolId, durationMs, resultSizeBytes) {
    trackEvent('conversion_success', {
      tool_id: toolId,
      duration_ms: Math.round(durationMs || 0),
      result_size_kb: Math.round((resultSizeBytes || 0) / 1024),
    });
  },

  // Result Downloaded
  trackDownload(toolId, filename) {
    trackEvent('download_click', {
      tool_id: toolId,
      filename: filename || 'document',
    });
  },

  // Tool Error
  trackError(toolId, errorMsg) {
    trackEvent('tool_error', {
      tool_id: toolId,
      error_message: String(errorMsg).slice(0, 100),
    });
  },
};
