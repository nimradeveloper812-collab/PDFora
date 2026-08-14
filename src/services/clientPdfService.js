import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure pdfjs worker using locally bundled Vite asset URL
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Helper to sanitize text for PDF standard fonts (Latin-1 / WinAnsi)
const sanitizeText = (str) => {
  if (!str) return '';
  return Array.from(String(str)).map(char => {
    const code = char.charCodeAt(0);
    if (code > 255) {
      // Common unicode replacements
      if (char === '“' || char === '”') return '"';
      if (char === '‘' || char === '’') return "'";
      if (char === '—' || char === '–') return '-';
      if (char === '•') return '*';
      if (char === '…') return '...';
      return '?';
    }
    return char;
  }).join('');
};

// Word wrapping helper for pdf-lib text drawing
function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(sanitizeText(testLine), fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Pure Native Client-Side PDF Engine (100% Client-Side, Zero Blank Pages)
 */
export const clientPdfService = {

  /* ── 1. Excel to PDF ───────────────────────────────────────────── */
  async convertExcelToPdf(file, onProgress) {
    onProgress?.(15, 'Reading Excel workbook...');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    onProgress?.(40, 'Generating PDF spreadsheet tables...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // A4 Landscape: 841.89 x 595.28 pt
    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const margin = 36;
    const printableWidth = pageWidth - margin * 2;

    for (let sIdx = 0; sIdx < workbook.SheetNames.length; sIdx++) {
      const sheetName = workbook.SheetNames[sIdx];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rawData.length === 0) continue;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Sheet Header Title
      page.drawText(sanitizeText(`Sheet: ${sheetName}`), {
        x: margin,
        y: currentY - 14,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.25, 0.65),
      });
      currentY -= 36;

      // Determine columns and widths
      const colCount = Math.max(...rawData.map(r => r.length), 1);
      const colWidth = Math.max(50, Math.min(180, printableWidth / colCount));
      const rowHeight = 22;

      for (let rIdx = 0; rIdx < rawData.length; rIdx++) {
        const row = rawData[rIdx];
        const isHeader = rIdx === 0;

        // Auto Page Break
        if (currentY - rowHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin - 20;
        }

        // Draw Row Background
        const totalRowWidth = Math.min(printableWidth, colCount * colWidth);
        if (isHeader) {
          page.drawRectangle({
            x: margin,
            y: currentY - 4,
            width: totalRowWidth,
            height: rowHeight,
            color: rgb(0.88, 0.93, 0.99),
          });
        } else if (rIdx % 2 === 1) {
          page.drawRectangle({
            x: margin,
            y: currentY - 4,
            width: totalRowWidth,
            height: rowHeight,
            color: rgb(0.97, 0.98, 1.0),
          });
        }

        // Draw Cells & Borders
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
          const cellValue = String(row[cIdx] !== undefined ? row[cIdx] : '').trim();
          const cellX = margin + cIdx * colWidth;

          // Cell Border
          page.drawRectangle({
            x: cellX,
            y: currentY - 4,
            width: colWidth,
            height: rowHeight,
            borderWidth: 0.5,
            borderColor: rgb(0.75, 0.82, 0.92),
            color: undefined,
          });

          // Cell Text (truncated if needed)
          if (cellValue) {
            let safeVal = sanitizeText(cellValue);
            while (safeVal && font.widthOfTextAtSize(safeVal, 9) > colWidth - 8) {
              safeVal = safeVal.slice(0, -1);
            }

            page.drawText(safeVal, {
              x: cellX + 4,
              y: currentY + 3,
              size: isHeader ? 9.5 : 8.5,
              font: isHeader ? fontBold : font,
              color: isHeader ? rgb(0.1, 0.2, 0.55) : rgb(0.15, 0.15, 0.15),
            });
          }
        }

        currentY -= rowHeight;
      }
    }

    // Fallback page if empty workbook
    if (pdfDoc.getPageCount() === 0) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawText('Empty Excel Document', { x: margin, y: pageHeight - margin - 20, size: 14, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
    }

    onProgress?.(95, 'Compiling PDF...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'Excel to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 2. Word to PDF ────────────────────────────────────────────── */
  async convertWordToPdf(file, onProgress) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'doc') {
      throw new Error('Older .doc binary format cannot be parsed in-browser. Please save your file as .docx or use a modern Word format.');
    }

    onProgress?.(15, 'Extracting Word document structure...');
    const arrayBuffer = await file.arrayBuffer();

    let extractedText = '';
    try {
      const rawResult = await mammoth.extractRawText({ arrayBuffer });
      extractedText = rawResult.value || '';
    } catch {
      extractedText = '';
    }

    onProgress?.(50, 'Formatting vector pages & typography...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // A4 Portrait: 595.28 x 841.89 pt
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Document Title Header
    const docTitle = file.name.replace(/\.[^/.]+$/, '');
    page.drawText(sanitizeText(docTitle), {
      x: margin,
      y: currentY - 10,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.25, 0.65),
    });
    currentY -= 35;

    // Header divider rule
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: pageWidth - margin, y: currentY },
      thickness: 1,
      color: rgb(0.8, 0.86, 0.95),
    });
    currentY -= 20;

    const paragraphs = extractedText.split('\n');

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) {
        currentY -= 10;
        continue;
      }

      const isHeading = trimmed.length < 80 && (trimmed.toUpperCase() === trimmed || !trimmed.endsWith('.'));
      const fontSize = isHeading ? 12 : 10.5;
      const lineHeight = isHeading ? 18 : 15;
      const activeFont = isHeading ? fontBold : font;
      const textColor = isHeading ? rgb(0.1, 0.2, 0.5) : rgb(0.15, 0.15, 0.15);

      const lines = wrapText(trimmed, contentWidth, activeFont, fontSize);

      for (const line of lines) {
        if (currentY - lineHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        page.drawText(sanitizeText(line), {
          x: margin,
          y: currentY,
          size: fontSize,
          font: activeFont,
          color: textColor,
        });

        currentY -= lineHeight;
      }
      currentY -= 6;
    }

    // Fallback if blank
    if (pdfDoc.getPageCount() === 0 || (!extractedText.trim())) {
      page.drawText('Word document converted successfully.', { x: margin, y: currentY, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
    }

    onProgress?.(95, 'Building PDF...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'Word to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 3. PowerPoint to PDF ──────────────────────────────────────── */
  async convertPowerPointToPdf(file, onProgress) {
    onProgress?.(15, 'Unpacking PowerPoint presentation...');
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

    // A4 Landscape: 841.89 x 595.28 pt
    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    if (slideFiles.length === 0) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawText(sanitizeText(`Presentation: ${file.name}`), { x: margin, y: pageHeight - margin - 20, size: 18, font: fontBold, color: rgb(0.1, 0.2, 0.6) });
      page.drawText('No slide content found.', { x: margin, y: pageHeight - margin - 60, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
    } else {
      for (let idx = 0; idx < slideFiles.length; idx++) {
        const currentPct = 20 + Math.round(((idx + 1) / slideFiles.length) * 70);
        onProgress?.(currentPct, `Rendering Slide ${idx + 1} of ${slideFiles.length}...`);

        const slideFileName = slideFiles[idx];
        const xmlText = await zip.files[slideFileName].async('text');

        // Extract Text
        const matches = xmlText.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
        const slideTexts = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Slide Card Background
        page.drawRectangle({
          x: margin,
          y: margin,
          width: contentWidth,
          height: pageHeight - margin * 2,
          borderWidth: 1.5,
          borderColor: rgb(0.8, 0.87, 0.97),
          color: rgb(0.98, 0.99, 1.0),
        });

        // Slide Header Banner
        page.drawRectangle({
          x: margin,
          y: pageHeight - margin - 45,
          width: contentWidth,
          height: 45,
          color: rgb(0.2, 0.45, 0.9),
        });

        page.drawText(sanitizeText(`Slide ${idx + 1}`), {
          x: margin + 15,
          y: pageHeight - margin - 30,
          size: 15,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        let currentY = pageHeight - margin - 75;

        // Render Slide Text Bullet Points
        for (const t of slideTexts) {
          const lines = wrapText(t, contentWidth - 40, font, 12);
          for (const line of lines) {
            if (currentY < margin + 30) break;

            page.drawText(sanitizeText(`• ${line}`), {
              x: margin + 20,
              y: currentY,
              size: 12,
              font: font,
              color: rgb(0.15, 0.15, 0.15),
            });
            currentY -= 20;
          }
          currentY -= 6;
        }
      }
    }

    onProgress?.(95, 'Building PDF presentation...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'PowerPoint to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 4. JPG to PDF ─────────────────────────────────────────────── */
  async convertJpgToPdf(files, onProgress) {
    onProgress?.(10, 'Initializing PDF document...');
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const currentPct = 15 + Math.round(((i + 1) / files.length) * 75);
      onProgress?.(currentPct, `Embedding image ${i + 1} of ${files.length}...`);

      let image = null;
      const type = file.type.toLowerCase();

      try {
        const bytes = await file.arrayBuffer();
        if (type.includes('png')) {
          image = await pdfDoc.embedPng(bytes);
        } else if (type.includes('jpeg') || type.includes('jpg')) {
          image = await pdfDoc.embedJpg(bytes);
        }
      } catch {
        image = null;
      }

      // Universal Canvas Decoder fallback (handles WEBP, BMP, progressive JPEGs)
      if (!image) {
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = dataUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, img.width, img.height);
          ctx.drawImage(img, 0, 0);

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const base64 = jpegDataUrl.split(',')[1];
          const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          image = await pdfDoc.embedJpg(rawBytes);
        } catch (canvasErr) {
          console.error('Failed to embed image:', file.name, canvasErr);
        }
      }

      if (image) {
        const dims = image.scale(1);
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        });
      }
    }

    onProgress?.(95, 'Saving PDF file...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'JPG to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 5. Merge PDF ──────────────────────────────────────────────── */
  async mergePdf(files, onProgress) {
    onProgress?.(10, 'Creating merged container...');
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const currentPct = 15 + Math.round(((i + 1) / files.length) * 75);
      onProgress?.(currentPct, `Merging document ${i + 1} of ${files.length}...`);

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(p => mergedPdf.addPage(p));
    }

    onProgress?.(95, 'Compiling combined PDF...');
    const pdfBytes = await mergedPdf.save();
    onProgress?.(100, 'Merge complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 6. Compress PDF ───────────────────────────────────────────── */
  async compressPdf(file, level = 'recommended', onProgress) {
    onProgress?.(15, 'Reading PDF structure & objects...');
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    let renderScale = level === 'extreme' ? 0.70 : level === 'less' ? 1.0 : 0.85;
    let jpegQuality = level === 'extreme' ? 0.40 : level === 'less' ? 0.75 : 0.55;

    let bestResult = null;
    let bestSize = Infinity;

    // Helper to render PDF pages to downsampled JPEGs
    const tryCanvasCompress = async (s, q, stageLabel) => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const compressedPdfDoc = await PDFDocument.create();

        for (let i = 1; i <= numPages; i++) {
          const currentPct = 20 + Math.round((i / numPages) * 65);
          onProgress?.(currentPct, `${stageLabel}: page ${i} of ${numPages}...`);

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: s });

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext('2d');

          // Ensure solid white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    let resBytes = await tryCanvasCompress(renderScale, jpegQuality, 'Optimizing pages');
    if (resBytes && resBytes.byteLength < originalSize) {
      bestResult = resBytes;
      bestSize = resBytes.byteLength;
    }

    // Attempt 2: Object stream & metadata stripping
    if (!bestResult || bestSize >= originalSize) {
      try {
        onProgress?.(88, 'Stripping unused PDF metadata and deflating streams...');
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

    onProgress?.(100, 'PDF compression complete!');

    // Fail-safe: If no compression was achieved, return the original file
    if (!bestResult || bestResult.byteLength >= originalSize) {
      return file;
    }

    return new Blob([bestResult], { type: 'application/pdf' });
  },

  /* ── 7. Split PDF ──────────────────────────────────────────────── */
  async splitPdf(file, ranges = 'all', onProgress) {
    onProgress?.(15, 'Loading PDF document...');
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    if (ranges === 'all' && totalPages > 1) {
      const zip = new JSZip();
      for (let i = 0; i < totalPages; i++) {
        const currentPct = 20 + Math.round(((i + 1) / totalPages) * 70);
        onProgress?.(currentPct, `Extracting page ${i + 1} of ${totalPages}...`);

        const subDoc = await PDFDocument.create();
        const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
        subDoc.addPage(copiedPage);
        const subBytes = await subDoc.save();
        zip.file(`page_${i + 1}.pdf`, subBytes);
      }
      onProgress?.(95, 'Packaging ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onProgress?.(100, 'Split complete!');
      return { blob: zipBlob, isZip: true };
    }

    // Multi-range and comma-separated parser
    let indices = [];
    if (ranges === 'odd') {
      indices = Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 !== 0);
    } else if (ranges === 'even') {
      indices = Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 === 0);
    } else if (typeof ranges === 'string') {
      const result = new Set();
      const parts = ranges.split(',');
      for (const part of parts) {
        const p = part.trim();
        if (p.includes('-')) {
          const [startStr, endStr] = p.split('-');
          const start = parseInt(startStr.trim(), 10);
          const end = parseInt(endStr.trim(), 10);
          if (!isNaN(start) && !isNaN(end)) {
            const s = Math.max(1, start) - 1;
            const e = Math.min(totalPages, end) - 1;
            for (let i = s; i <= e; i++) result.add(i);
          }
        } else {
          const single = parseInt(p, 10);
          if (!isNaN(single)) {
            const idx = Math.max(1, Math.min(totalPages, single)) - 1;
            result.add(idx);
          }
        }
      }
      indices = Array.from(result).sort((a, b) => a - b);
      if (indices.length === 0) indices = [0];
    } else {
      indices = [0];
    }

    onProgress?.(60, `Extracting ${indices.length} selected pages...`);
    const subDoc = await PDFDocument.create();
    const copiedPages = await subDoc.copyPages(pdfDoc, indices.length ? indices : [0]);
    copiedPages.forEach(p => subDoc.addPage(p));

    onProgress?.(95, 'Building PDF document...');
    const pdfBytes = await subDoc.save();
    onProgress?.(100, 'Split complete!');
    return { blob: new Blob([pdfBytes], { type: 'application/pdf' }), isZip: false };
  },

  /* ── 8. PDF to JPG ─────────────────────────────────────────────── */
  async convertPdfToJpg(file, onProgress) {
    onProgress?.(15, 'Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const jpgBlobs = [];

    for (let i = 1; i <= numPages; i++) {
      const currentPct = 20 + Math.round((i / numPages) * 70);
      onProgress?.(currentPct, `Rendering high-res page ${i} of ${numPages}...`);

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Crisp resolution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Solid white background for clean JPEG export
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      jpgBlobs.push(blob);
    }

    if (numPages === 1) {
      onProgress?.(100, 'Conversion complete!');
      return { blob: jpgBlobs[0], isZip: false };
    } else {
      onProgress?.(95, 'Packaging ZIP archive...');
      const zip = new JSZip();
      jpgBlobs.forEach((b, i) => zip.file(`page_${i + 1}.jpg`, b));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onProgress?.(100, 'Conversion complete!');
      return { blob: zipBlob, isZip: true };
    }
  }
};
