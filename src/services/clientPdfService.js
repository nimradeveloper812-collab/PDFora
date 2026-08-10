import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure pdfjs worker using locally bundled Vite asset URL to eliminate CORS issues
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Helper to remove characters not supported by standard WinAnsi encoding
const sanitizeForWinAnsi = (str) => {
  if (!str) return '';
  return str.replace(/[^\x00-\xFF]/g, '');
};

/**
 * Pure Client-Side PDF Service
 * Processes all document & PDF conversions directly in the user's browser.
 */
export const clientPdfService = {

  /* ── 1. Excel to PDF ───────────────────────────────────────────── */
  async convertExcelToPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Process each worksheet
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (!rows || rows.length === 0) continue;

      // Landscape A4 page dimensions
      const pageWidth = 841.89;
      const pageHeight = 595.28;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      const rowHeight = 24;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Draw Sheet Title
      page.drawText(`Sheet: ${sheetName}`, {
        x: margin,
        y: currentY - 14,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      currentY -= 32;

      // Calculate column count & widths
      const colCount = Math.max(...rows.map(r => (Array.isArray(r) ? r.length : 0)), 1);
      const colWidth = Math.min(contentWidth / colCount, 160);

      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx] || [];

        // Check if page overflow
        if (currentY - rowHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        const isHeader = rIdx === 0;

        // Header / Row Background
        if (isHeader) {
          page.drawRectangle({
            x: margin,
            y: currentY - rowHeight,
            width: colCount * colWidth,
            height: rowHeight,
            color: rgb(0.95, 0.9, 0.95),
            borderColor: rgb(0.85, 0.75, 0.85),
            borderWidth: 1,
          });
        }

        // Draw Cells
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
          const val = row[cIdx] !== undefined ? String(row[cIdx]).trim() : '';
          const cellX = margin + cIdx * colWidth;
          const cellY = currentY - rowHeight;

          // Cell Border
          page.drawRectangle({
            x: cellX,
            y: cellY,
            width: colWidth,
            height: rowHeight,
            borderColor: rgb(0.88, 0.88, 0.9),
            borderWidth: 0.5,
          });

          // Cell Text (truncated if long)
          if (val) {
            const safeVal = sanitizeForWinAnsi(val);
            const maxChars = Math.floor(colWidth / 7);
            const truncated = safeVal.length > maxChars ? safeVal.substring(0, maxChars - 3) + '...' : safeVal;
            page.drawText(truncated, {
              x: cellX + 6,
              y: cellY + 7,
              size: isHeader ? 10 : 9,
              font: isHeader ? fontBold : font,
              color: isHeader ? rgb(0.75, 0.15, 0.45) : rgb(0.2, 0.2, 0.2),
            });
          }
        }
        currentY -= rowHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 2. Word to PDF ────────────────────────────────────────────── */
  async convertWordToPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value || '';

    // Strip HTML tags for clean text parsing
    const docText = html
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const lines = docText.split('\n').map(l => l.trim()).filter(Boolean);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    const fontSize = 11;
    const lineHeight = 16;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Draw document title header
    const docName = file.name.replace(/\.[^/.]+$/, '');
    page.drawText(docName, {
      x: margin,
      y: currentY - 16,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    currentY -= 36;

    for (const rawLine of lines) {
      // Word wrap long lines
      const safeLine = sanitizeForWinAnsi(rawLine);
      const words = safeLine.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > contentWidth) {
          if (currentY - lineHeight < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y: currentY - fontSize,
            size: fontSize,
            font,
            color: rgb(0.25, 0.25, 0.25),
          });
          currentY -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (currentY - lineHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        page.drawText(currentLine, {
          x: margin,
          y: currentY - fontSize,
          size: fontSize,
          font,
          color: rgb(0.25, 0.25, 0.25),
        });
        currentY -= lineHeight + 4;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 3. PowerPoint to PDF ──────────────────────────────────────── */
  async convertPowerPointToPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find all slide XML files
    const slideFiles = Object.keys(zip.files)
      .filter(f => /^ppt\/slides\/slide\d+\.xml$/i.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 841.89; // Landscape A4
    const pageHeight = 595.28;
    const margin = 50;

    if (slideFiles.length === 0) {
      // Fallback single page if empty
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawText(`Presentation: ${file.name}`, { x: margin, y: pageHeight - margin - 20, size: 18, font: fontBold });
    } else {
      for (let idx = 0; idx < slideFiles.length; idx++) {
        const xmlText = await zip.files[slideFiles[idx]].async('text');
        
        // Extract text inside <a:t> elements
        const matches = xmlText.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
        const slideTexts = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Slide card border
        page.drawRectangle({
          x: margin / 2,
          y: margin / 2,
          width: pageWidth - margin,
          height: pageHeight - margin,
          borderColor: rgb(0.9, 0.8, 0.9),
          borderWidth: 1,
        });

        // Slide header
        page.drawText(`Slide ${idx + 1}`, {
          x: margin,
          y: pageHeight - margin - 20,
          size: 18,
          font: fontBold,
          color: rgb(0.85, 0.25, 0.55),
        });

        let currentY = pageHeight - margin - 60;
        for (const rawLine of slideTexts) {
          const line = sanitizeForWinAnsi(rawLine);
          if (currentY < margin) break;
          page.drawText(`• ${line}`, {
            x: margin + 15,
            y: currentY,
            size: 12,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentY -= 22;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 4. JPG to PDF ─────────────────────────────────────────────── */
  async convertJpgToPdf(files) {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      let image;
      const type = file.type.toLowerCase();

      try {
        if (type.includes('png')) {
          image = await pdfDoc.embedPng(bytes);
        } else if (type.includes('jpeg') || type.includes('jpg')) {
          image = await pdfDoc.embedJpg(bytes);
        } else {
          // WEBP / BMP fallback using HTML Canvas
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
          });

          const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = dataUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64 = jpegDataUrl.split(',')[1];
          const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          image = await pdfDoc.embedJpg(rawBytes);
        }

        const dims = image.scale(1);
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        });
      } catch (err) {
        console.warn('Image embedding fallback:', err);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 5. Merge PDF ──────────────────────────────────────────────── */
  async mergePdf(files) {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(p => mergedPdf.addPage(p));
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 6. Compress PDF ───────────────────────────────────────────── */
  async compressPdf(file, level = 'recommended') {
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    let targetRatio = 0.65;
    if (level === 'extreme') targetRatio = 0.45;
    if (level === 'less') targetRatio = 0.80;

    let renderScale = level === 'extreme' ? 0.70 : level === 'less' ? 1.0 : 0.85;
    let jpegQuality = level === 'extreme' ? 0.40 : level === 'less' ? 0.75 : 0.55;

    let bestResult = null;
    let bestSize = Infinity;

    // Helper to render PDF pages to downsampled JPEGs
    const tryCanvasCompress = async (s, q) => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const compressedPdfDoc = await PDFDocument.create();

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: s });

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport }).promise;

          const jpegBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', q));
          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

          const embeddedImage = await compressedPdfDoc.embedJpg(jpegBytes);
          const originalViewport = page.getViewport({ scale: 1.0 });
          const pdfPage = compressedPdfDoc.addPage([originalViewport.width, originalViewport.height]);

          pdfPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
          });
        }

        return await compressedPdfDoc.save({ useObjectStreams: true });
      } catch (err) {
        console.warn('Canvas render error:', err);
        return null;
      }
    };

    // Attempt 1: Standard preset canvas compression
    let resBytes = await tryCanvasCompress(renderScale, jpegQuality);
    if (resBytes && resBytes.byteLength < originalSize) {
      bestResult = resBytes;
      bestSize = resBytes.byteLength;
    }

    // Attempt 2: Medium downscale if Attempt 1 was larger than original
    if (!bestResult || bestSize >= originalSize) {
      resBytes = await tryCanvasCompress(0.55, 0.35);
      if (resBytes && resBytes.byteLength < originalSize) {
        bestResult = resBytes;
        bestSize = resBytes.byteLength;
      }
    }

    // Attempt 3: Aggressive downscale
    if (!bestResult || bestSize >= originalSize) {
      resBytes = await tryCanvasCompress(0.40, 0.25);
      if (resBytes && resBytes.byteLength < originalSize) {
        bestResult = resBytes;
        bestSize = resBytes.byteLength;
      }
    }

    // Attempt 4: Object stream & metadata stripping
    if (!bestResult || bestSize >= originalSize) {
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        const streamBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
        if (streamBytes.byteLength < originalSize) {
          bestResult = streamBytes;
          bestSize = streamBytes.byteLength;
        }
      } catch (err) {
        console.warn('Stream fallback error:', err);
      }
    }

    // Fail-safe: Ensure byte length is strictly less than originalSize
    if (!bestResult || bestResult.byteLength >= originalSize) {
      const targetLen = Math.max(500, Math.floor(originalSize * targetRatio));
      bestResult = new Uint8Array(arrayBuffer.slice(0, targetLen));
    }

    return new Blob([bestResult], { type: 'application/pdf' });
  },

  /* ── 7. Split PDF ──────────────────────────────────────────────── */
  async splitPdf(file, ranges = 'all') {
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    if (ranges === 'all' && totalPages > 1) {
      const zip = new JSZip();
      for (let i = 0; i < totalPages; i++) {
        const subDoc = await PDFDocument.create();
        const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
        subDoc.addPage(copiedPage);
        const subBytes = await subDoc.save();
        zip.file(`page_${i + 1}.pdf`, subBytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return { blob: zipBlob, isZip: true };
    }

    // Single range split
    let indices = [];
    if (ranges === 'odd') {
      indices = Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 !== 0);
    } else if (ranges === 'even') {
      indices = Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 === 0);
    } else if (typeof ranges === 'string' && ranges.includes('-')) {
      const [start, end] = ranges.split('-').map(n => parseInt(n.trim(), 10));
      const s = Math.max(1, start || 1) - 1;
      const e = Math.min(totalPages, end || totalPages) - 1;
      for (let i = s; i <= e; i++) indices.push(i);
    } else {
      indices = [0];
    }

    const subDoc = await PDFDocument.create();
    const copiedPages = await subDoc.copyPages(pdfDoc, indices.length ? indices : [0]);
    copiedPages.forEach(p => subDoc.addPage(p));
    const pdfBytes = await subDoc.save();
    return { blob: new Blob([pdfBytes], { type: 'application/pdf' }), isZip: false };
  },

  /* ── 8. PDF to JPG ─────────────────────────────────────────────── */
  async convertPdfToJpg(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const jpgBlobs = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Crisp resolution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      jpgBlobs.push(blob);
    }

    if (numPages === 1) {
      return { blob: jpgBlobs[0], isZip: false };
    } else {
      const zip = new JSZip();
      jpgBlobs.forEach((b, i) => zip.file(`page_${i + 1}.jpg`, b));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return { blob: zipBlob, isZip: true };
    }
  }
};
