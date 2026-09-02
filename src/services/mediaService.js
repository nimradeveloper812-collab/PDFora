/**
 * Media Service - PDFora
 * Handles client-to-backend communication for Video to Audio, Audio Compressor,
 * Image Converter, Video Converter, and Video Compressor.
 */

const API_BASE = typeof window !== 'undefined' ? window.location.origin : '';

export const SUPPORTED_VIDEO_INPUTS = [
  'mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'mpeg', 'mpg', 'm4v', '3gp', 'ogv', 'ts'
];

export const SUPPORTED_AUDIO_INPUTS = [
  'mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac', 'wma', 'aiff', 'opus'
];

export const SUPPORTED_IMAGE_INPUTS = [
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'avif', 'svg', 'ico'
];

export const SUPPORTED_AUDIO_OUTPUTS = [
  { id: 'mp3', label: 'MP3 (MPEG Layer 3)', desc: 'Most widely compatible, ideal for music and podcast playback.' },
  { id: 'wav', label: 'WAV (Uncompressed PCM)', desc: 'Lossless studio standard, perfect for editing and production.' },
  { id: 'm4a', label: 'M4A (AAC Audio)', desc: 'High quality at lower bitrates, optimized for Apple & mobile devices.' },
  { id: 'aac', label: 'AAC (Advanced Audio)', desc: 'Modern audio standard used in streaming and video soundtracks.' },
  { id: 'ogg', label: 'OGG (Vorbis)', desc: 'Open-source lossy audio format with excellent sound fidelity.' },
  { id: 'flac', label: 'FLAC (Lossless Audio)', desc: 'Bit-perfect lossless compression without audio quality degradation.' }
];

export const SUPPORTED_VIDEO_OUTPUTS = [
  { id: 'mp4', label: 'MP4 (H.264 / AAC)', desc: 'Universal video compatibility across all web browsers, phones, and TVs.' },
  { id: 'webm', label: 'WebM (VP9 / Opus)', desc: 'Next-gen royalty-free web standard, ideal for HTML5 websites.' },
  { id: 'mkv', label: 'MKV (Matroska)', desc: 'Flexible container preserving multiple audio tracks and subtitles.' },
  { id: 'mov', label: 'MOV (QuickTime)', desc: 'Apple standard, ideal for Final Cut Pro and macOS/iOS editing.' },
  { id: 'avi', label: 'AVI (Audio Video Interleave)', desc: 'Legacy Windows multimedia container.' },
  { id: 'wmv', label: 'WMV (Windows Media)', desc: 'Microsoft Windows media container.' },
  { id: 'ogv', label: 'OGV (Ogg Video)', desc: 'Open-source Theora/Vorbis multimedia format.' }
];

export const SUPPORTED_IMAGE_OUTPUTS = [
  { id: 'webp', label: 'WebP (Next-Gen)', desc: 'Up to 80% smaller than JPG with full transparency support.' },
  { id: 'png', label: 'PNG (Lossless)', desc: 'Preserves sharp text, graphics, and full alpha transparency.' },
  { id: 'jpg', label: 'JPG / JPEG (Universal)', desc: 'Best for standard photographs and general website usage.' },
  { id: 'avif', label: 'AVIF (High Efficiency)', desc: 'Next-generation image format offering extreme compression.' },
  { id: 'tiff', label: 'TIFF (High Resolution)', desc: 'Lossless format used in high-end publishing and printing.' },
  { id: 'gif', label: 'GIF (Graphics)', desc: 'Universal 8-bit palette format compatible with all viewers.' }
];

/**
 * Format bytes to readable string (e.g. "12.4 MB")
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Extract audio track from video file
 */
export async function extractAudioFromVideo(file, options = {}, onProgress) {
  const { format = 'mp3', bitrate = '192k' } = options;
  onProgress?.(15, 'Uploading video to audio demuxer...');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);
  formData.append('bitrate', bitrate);

  let curProgress = 25;
  const progressTimer = setInterval(() => {
    if (curProgress < 90) {
      curProgress += Math.floor(Math.random() * 9) + 5;
      if (curProgress > 90) curProgress = 90;

      let msg = 'Extracting audio stream with FFmpeg...';
      if (curProgress > 50 && curProgress <= 75) {
        msg = `Encoding ${format.toUpperCase()} audio channels at ${bitrate}...`;
      } else if (curProgress > 75) {
        msg = 'Packaging audio bitstream...';
      }
      onProgress?.(curProgress, msg);
    }
  }, 450);

  try {
    const res = await fetch(`${API_BASE}/api/media/video-to-audio`, {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressTimer);

    if (!res.ok) {
      let errorMsg = 'Failed to extract audio from video.';
      try {
        const json = await res.json();
        if (json.error) errorMsg = json.error;
      } catch {}
      throw new Error(errorMsg);
    }

    onProgress?.(95, 'Finalizing audio file...');
    const blob = await res.blob();
    const outputSize = parseInt(res.headers.get('X-Output-Size') || blob.size, 10);

    onProgress?.(100, 'Audio extraction complete!');
    return {
      blob,
      outputSize,
      format,
    };
  } catch (err) {
    clearInterval(progressTimer);
    throw err;
  }
}

/**
 * Compress audio file
 */
export async function compressAudio(file, options = {}, onProgress) {
  const { preset = 'balanced', bitrate, format = 'mp3' } = options;
  onProgress?.(15, 'Uploading audio file...');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('preset', preset);
  if (bitrate) formData.append('bitrate', bitrate);
  formData.append('format', format);

  onProgress?.(50, 'Compressing audio stream...');

  const res = await fetch(`${API_BASE}/api/media/compress-audio`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = 'Failed to compress audio file.';
    try {
      const json = await res.json();
      if (json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }

  onProgress?.(90, 'Packaging compressed audio...');
  const blob = await res.blob();
  const originalSize = parseInt(res.headers.get('X-Original-Size') || file.size, 10);
  const compressedSize = parseInt(res.headers.get('X-Compressed-Size') || blob.size, 10);
  const savedPercent = res.headers.get('X-Saved-Percent') || 
    (originalSize > 0 ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1) : '0.0');

  onProgress?.(100, 'Audio compression complete!');
  return {
    blob,
    originalSize,
    compressedSize,
    savedPercent,
    format,
  };
}

/**
 * Convert image between formats
 */
export async function convertImage(file, options = {}, onProgress) {
  const { format = 'webp', quality = 80, lossless = false } = options;
  onProgress?.(20, 'Reading image file...');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);
  formData.append('quality', quality);
  formData.append('lossless', lossless ? 'true' : 'false');

  onProgress?.(50, `Converting image to ${format.toUpperCase()}...`);

  const res = await fetch(`${API_BASE}/api/media/convert-image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = 'Failed to convert image format.';
    try {
      const json = await res.json();
      if (json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }

  onProgress?.(90, 'Preparing converted image...');
  const blob = await res.blob();
  const outputSize = parseInt(res.headers.get('X-Output-Size') || blob.size, 10);

  onProgress?.(100, 'Image conversion complete!');
  return {
    blob,
    outputSize,
    format,
  };
}

/**
 * Convert video between formats
 */
export async function convertVideo(file, options = {}, onProgress) {
  const { format = 'mp4', resolution = 'original', quality = 'balanced' } = options;
  onProgress?.(15, 'Uploading video to conversion engine...');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);
  formData.append('resolution', resolution);
  formData.append('quality', quality);

  onProgress?.(45, `Transcoding video to ${format.toUpperCase()}...`);

  const res = await fetch(`${API_BASE}/api/media/convert-video`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = 'Failed to convert video format.';
    try {
      const json = await res.json();
      if (json.error) errorMsg = json.error;
    } catch {}
    throw new Error(errorMsg);
  }

  onProgress?.(90, 'Finalizing video stream...');
  const blob = await res.blob();
  const outputSize = parseInt(res.headers.get('X-Output-Size') || blob.size, 10);

  onProgress?.(100, 'Video conversion complete!');
  return {
    blob,
    outputSize,
    format,
  };
}

/**
 * Compress video file
 */
export async function compressVideo(file, options = {}, onProgress) {
  const { preset = 'balanced', resolution = 'original' } = options;
  onProgress?.(15, 'Uploading video to processing engine...');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('preset', preset);
  formData.append('resolution', resolution);

  let curProgress = 25;
  const progressTimer = setInterval(() => {
    if (curProgress < 90) {
      curProgress += Math.floor(Math.random() * 8) + 4;
      if (curProgress > 90) curProgress = 90;

      let msg = 'Compressing video stream with H.264 & AAC...';
      if (curProgress > 45 && curProgress <= 70) {
        msg = 'Encoding video frames at high speed...';
      } else if (curProgress > 70) {
        msg = 'Optimizing bitrates & container metadata...';
      }
      onProgress?.(curProgress, msg);
    }
  }, 600);

  try {
    const res = await fetch(`${API_BASE}/api/media/compress-video`, {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressTimer);

    if (!res.ok) {
      let errorMsg = 'Failed to compress video file.';
      try {
        const json = await res.json();
        if (json.error) errorMsg = json.error;
      } catch {}
      throw new Error(errorMsg);
    }

    onProgress?.(95, 'Finalizing output video...');
    const blob = await res.blob();
    const originalSize = parseInt(res.headers.get('X-Original-Size') || file.size, 10);
    const compressedSize = parseInt(res.headers.get('X-Compressed-Size') || blob.size, 10);
    const savedPercent = res.headers.get('X-Saved-Percent') || 
      (originalSize > 0 ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1) : '0.0');

    onProgress?.(100, 'Video compression complete!');
    return {
      blob,
      originalSize,
      compressedSize,
      savedPercent,
      format: 'mp4',
    };
  } catch (err) {
    clearInterval(progressTimer);
    throw err;
  }
}
