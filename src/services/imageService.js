/**
 * PDFora - Image Processing Service
 * Provides client-side deep learning background removal, high-fidelity compression,
 * file validation, and memory-safe Object URL management.
 */

// Memory tracking for created Object URLs to prevent memory leaks
const trackedUrls = new Set();

export function createManagedObjectURL(blob) {
  const url = URL.createObjectURL(blob);
  trackedUrls.add(url);
  return url;
}

export function revokeManagedObjectURL(url) {
  if (url && trackedUrls.has(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    trackedUrls.delete(url);
  }
}

export function cleanupAllManagedObjectURLs() {
  trackedUrls.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  });
  trackedUrls.clear();
}

/**
 * Format bytes into human-readable strings (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validates image file type, size, and decodability.
 */
export async function validateImageFile(file, maxMb = 35) {
  if (!file) {
    throw new Error('No file selected. Please choose an image.');
  }

  // Check file size
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`The image size (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${maxMb} MB.`);
  }

  // Check extension
  const ext = (file.name || '').split('.').pop().toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const isExtValid = validExtensions.includes(ext);

  // Check MIME
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const isMimeValid = validMimes.includes((file.type || '').toLowerCase());

  if (!isExtValid && !isMimeValid) {
    throw new Error('Unsupported format. Please upload a JPG, JPEG, PNG, or WebP image.');
  }

  // Verify file integrity by attempting to decode image dimensions
  return new Promise((resolve, reject) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error('Corrupted or empty image file. Please upload a valid photo.'));
      } else {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          name: file.name,
          type: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          extension: ext
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      reject(new Error('Unable to read this image file. It may be corrupted or in an unsupported format.'));
    };

    img.src = tempUrl;
  });
}

export const getImageMetadata = validateImageFile;

/**
 * Background Removal Service
 * Uses @imgly/background-removal WebAssembly AI segmentation model in-browser.
 */
export async function removeImageBackground(fileOrBlob, onProgress) {
  try {
    if (onProgress) onProgress(10, 'Initializing AI neural network engine...');

    // Dynamically import the background removal library
    const imglyModule = await import('@imgly/background-removal');
    const imglyRemoveBackground = imglyModule.removeBackground || imglyModule.default || imglyModule;

    if (onProgress) onProgress(25, 'Loading fast segmentation model...');

    const config = {
      model: 'isnet_quint8', // 4x smaller 8-bit quantized model for lightning fast download & inference
      output: {
        format: 'image/png',
        quality: 1.0,
      },
      progress: (key, current, total) => {
        if (!onProgress) return;
        
        let pct = 30;
        let label = 'Analyzing image...';

        if (typeof key === 'string') {
          if (key.includes('fetch')) {
            const fraction = total && total > 0 ? current / total : 0.5;
            pct = 30 + Math.min(28, Math.floor(fraction * 28));
            label = 'Downloading AI model weights...';
          } else if (key.includes('init') || key.includes('load')) {
            pct = 60;
            label = 'Preparing ONNX neural pipeline...';
          } else if (key.includes('compute') || key.includes('inference')) {
            const fraction = total && total > 0 ? current / total : 0.5;
            pct = 62 + Math.min(30, Math.floor(fraction * 30));
            label = 'Extracting foreground subject...';
          } else if (key.includes('post')) {
            pct = 94;
            label = 'Refining transparent alpha edges...';
          }
        }
        onProgress(Math.min(98, pct), label);
      }
    };

    if (onProgress) onProgress(45, 'Segmenting foreground subject...');
    const resultBlob = await imglyRemoveBackground(fileOrBlob, config);

    if (onProgress) onProgress(100, 'Background removed successfully!');
    return resultBlob;
  } catch (error) {
    console.error('Background removal failed:', error);
    const msg = error?.message || '';
    if (msg.includes('WebGL') || msg.includes('WASM') || msg.includes('memory')) {
      throw new Error('Your browser ran out of memory while running the AI model. Try with a slightly smaller image.');
    }
    throw new Error('Failed to remove background. Please ensure the image has a clear subject and try again.');
  }
}

/**
 * Image Compression Service
 * Advanced multi-format compression with quality presets and custom settings.
 */
export async function compressImage(fileOrBlob, options = {}, onProgress) {
  const {
    qualityPreset = 'balanced', // 'high' | 'balanced' | 'max' | 'custom'
    customQuality = 75,         // 10 - 100
    outputFormat = 'original',  // 'original' | 'image/webp' | 'image/jpeg' | 'image/png'
    maxWidth = null,            // optional max width limit
    maxHeight = null,           // optional max height limit
  } = options;

  if (onProgress) onProgress(15, 'Reading image data...');

  const originalSize = fileOrBlob.size;
  const rawType = (fileOrBlob.type || '').toLowerCase();
  const rawName = fileOrBlob.name || 'image';
  const originalExt = rawName.includes('.') ? rawName.split('.').pop().toLowerCase() : 'jpg';

  // Determine quality factor (0.05 to 1.0)
  let qualityFactor = 0.75;
  if (qualityPreset === 'high') qualityFactor = 0.88;
  else if (qualityPreset === 'balanced') qualityFactor = 0.72;
  else if (qualityPreset === 'max') qualityFactor = 0.42;
  else if (qualityPreset === 'custom') qualityFactor = Math.max(0.1, Math.min(1.0, customQuality / 100));

  // Determine target MIME type and extension
  let targetMime = rawType || 'image/jpeg';
  let targetExt = originalExt;

  if (outputFormat === 'image/webp' || outputFormat === 'webp') {
    targetMime = 'image/webp';
    targetExt = 'webp';
  } else if (outputFormat === 'image/jpeg' || outputFormat === 'jpeg' || outputFormat === 'jpg') {
    targetMime = 'image/jpeg';
    targetExt = 'jpg';
  } else if (outputFormat === 'image/png' || outputFormat === 'png') {
    targetMime = 'image/png';
    targetExt = 'png';
  } else {
    // Keep original
    if (originalExt === 'png') {
      targetMime = 'image/png';
      targetExt = 'png';
    } else if (originalExt === 'webp') {
      targetMime = 'image/webp';
      targetExt = 'webp';
    } else {
      targetMime = 'image/jpeg';
      targetExt = 'jpg';
    }
  }

  if (onProgress) onProgress(35, 'Decoding image pixels...');

  // Load image into bitmap/element
  const imgBitmap = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image data for compression.'));
    };
    img.src = url;
  });

  const origWidth = imgBitmap.naturalWidth || imgBitmap.width;
  const origHeight = imgBitmap.naturalHeight || imgBitmap.height;

  // Calculate scaled dimensions if max limits are provided
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (maxWidth && targetWidth > maxWidth) {
    targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
    targetWidth = maxWidth;
  }
  if (maxHeight && targetHeight > maxHeight) {
    targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
    targetHeight = maxHeight;
  }

  if (onProgress) onProgress(60, 'Applying compression optimization...');

  // Create canvas for high-performance resampling
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: targetMime !== 'image/jpeg' });

  if (!ctx) {
    throw new Error('Canvas context initialization failed.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // For JPEG without alpha, draw a clean white background if original had transparent pixels
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);

  if (onProgress) onProgress(80, 'Encoding optimized output...');

  // Export to Blob
  const compressedBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode compressed image.'));
      },
      targetMime,
      targetMime === 'image/png' ? undefined : qualityFactor
    );
  });

  const compressedSize = compressedBlob.size;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : '0.0';

  if (onProgress) onProgress(100, 'Compression completed!');

  // Build appropriate output filename
  const baseName = rawName.replace(/\.[^/.]+$/, '');
  const outFilename = `${baseName}_compressed.${targetExt}`;

  return {
    blob: compressedBlob,
    filename: outFilename,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent: parseFloat(savedPercent),
    originalWidth: origWidth,
    originalHeight: origHeight,
    width: targetWidth,
    height: targetHeight,
    mimeType: targetMime,
    extension: targetExt,
  };
}
