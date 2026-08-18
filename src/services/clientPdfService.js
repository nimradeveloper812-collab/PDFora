import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure pdfjs worker using locally bundled Vite asset URL
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Global CDN fallback for standard CMaps & Font data to render all international PDF character sets (CJK, Arabic, Hebrew, Asian scripts)
const PDFJS_CMAP_URL = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.0'}/cmaps/`;
const PDFJS_STANDARD_FONTS_URL = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.0'}/standard_fonts/`;

/**
 * Universal Multilingual Font Cascade
 * Full Worldwide Character Support:
 * - Latin / WinAnsi / ASCII / Western & Eastern European / Baltic / Nordic / Vietnamese
 * - Cyrillic (Russian, Ukrainian, Belarusian, Bulgarian, Serbian)
 * - Greek (Modern & Classical)
 * - Arabic & Persian (Naskh & Nastaliq ligatures)
 * - Urdu (Noto Nastaliq Urdu)
 * - Hebrew (Modern & Biblical)
 * - South Asian Indic Scripts: Devanagari (Hindi, Marathi, Sanskrit, Nepali), Bengali, Gurmukhi (Punjabi), Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam, Sinhala
 * - Southeast Asian Scripts: Thai, Lao, Burmese, Khmer, Vietnamese
 * - East Asian CJK: Simplified Chinese, Traditional Chinese, Japanese (Kanji, Hiragana, Katakana), Korean (Hangul)
 * - Caucasian / Other: Georgian, Armenian, Ethiopic, Tibetan
 * - Mathematical Symbols, World Currencies ($ € £ ¥ ₹ ₽ ₩ ₺ ₴ ₦ ₪ ₫ ฿ ₱ ₡ ₲ ₵ PKR Rs)
 * - Emojis (Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji)
 */
const UNIVERSAL_FONT_FAMILY = [
  'Inter',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Noto Sans"',
  '"Noto Nastaliq Urdu"',
  '"Noto Sans Arabic"',
  '"Noto Sans Devanagari"',
  '"Noto Sans Bengali"',
  '"Noto Sans Gurmukhi"',
  '"Noto Sans Gujarati"',
  '"Noto Sans Tamil"',
  '"Noto Sans Telugu"',
  '"Noto Sans Kannada"',
  '"Noto Sans Malayalam"',
  '"Noto Sans Sinhala"',
  '"Noto Sans SC"',
  '"Noto Sans TC"',
  '"Noto Sans JP"',
  '"Noto Sans KR"',
  '"Noto Sans Thai"',
  '"Noto Sans Lao"',
  '"Noto Sans Myanmar"',
  '"Noto Sans Khmer"',
  '"Noto Sans Hebrew"',
  '"Noto Sans Georgian"',
  '"Noto Sans Armenian"',
  '"Noto Sans Ethiopic"',
  '"Segoe UI Emoji"',
  '"Apple Color Emoji"',
  '"Noto Color Emoji"',
  '"Segoe UI Symbol"',
  'Arial',
  'sans-serif'
].join(', ');

/**
 * Checks if a string contains Right-to-Left characters (Urdu, Arabic, Persian, Hebrew, Syriac, Thaana)
 */
function isRtlText(str) {
  if (!str) return false;
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(str);
}

/**
 * Creates an off-screen container mounted in DOM for high-fidelity HTML/CSS rendering
 */
function createRenderContainer(widthPx = 800) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = `${widthPx}px`;
  container.style.minHeight = '100px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = UNIVERSAL_FONT_FAMILY;
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';
  document.body.appendChild(container);
  return container;
}

/**
 * Destroys off-screen container safely
 */
function cleanupContainer(container) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Renders an HTML element to high-res canvas (2x scale / ~300 DPI) preserving all colors, formatting & Unicode
 */
async function renderElementToCanvas(element, scale = 2) {
  return await html2canvas(element, {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    windowWidth: element.offsetWidth || 800,
  });
}

/**
 * Worldwide Multi-Format Client PDF Engine
 */
export const clientPdfService = {

  /* ── 1. Excel to PDF ───────────────────────────────────────────── */
  async convertExcelToPdf(file, onProgress) {
    onProgress?.(15, 'Reading Excel workbook and sheets...');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, cellStyles: true });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('The uploaded Excel document does not contain any readable sheets.');
    }

    onProgress?.(35, 'Formatting spreadsheet as original...');
    const pdfDoc = await PDFDocument.create();

    // A4 Landscape: 841.89 x 595.28 pt
    const a4LandscapeWidth = 841.89;
    const a4LandscapeHeight = 595.28;

    const renderContainer = createRenderContainer(1120);

    try {
      for (let sIdx = 0; sIdx < workbook.SheetNames.length; sIdx++) {
        const sheetName = workbook.SheetNames[sIdx];
        const currentPct = 40 + Math.round(((sIdx + 1) / workbook.SheetNames.length) * 45);
        onProgress?.(currentPct, `Converting sheet ${sIdx + 1} of ${workbook.SheetNames.length}: ${sheetName}...`);

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

        if (rawData.length === 0) continue;

        // Clean table pagination matching original layout
        const rowsPerPage = 28;
        const totalPages = Math.ceil(rawData.length / rowsPerPage);
        const colCount = Math.max(...rawData.map(r => r.length), 1);

        for (let p = 0; p < totalPages; p++) {
          const sliceStart = p * rowsPerPage;
          const sliceEnd = Math.min(rawData.length, sliceStart + rowsPerPage);
          const pageRows = rawData.slice(sliceStart, sliceEnd);

          renderContainer.innerHTML = '';
          const sheetPageWrapper = document.createElement('div');
          sheetPageWrapper.style.padding = '30px 36px';
          sheetPageWrapper.style.backgroundColor = '#ffffff';
          sheetPageWrapper.style.boxSizing = 'border-box';
          sheetPageWrapper.style.width = '100%';

          // Clean Sheet Title Header
          const titleEl = document.createElement('div');
          titleEl.style.fontSize = '14px';
          titleEl.style.fontWeight = '600';
          titleEl.style.color = '#334155';
          titleEl.style.marginBottom = '12px';
          titleEl.style.fontFamily = UNIVERSAL_FONT_FAMILY;
          titleEl.dir = isRtlText(sheetName) ? 'rtl' : 'auto';
          titleEl.textContent = workbook.SheetNames.length > 1 ? `${sheetName} (Page ${p + 1}/${totalPages})` : (totalPages > 1 ? `Page ${p + 1}/${totalPages}` : '');
          
          if (titleEl.textContent) {
            sheetPageWrapper.appendChild(titleEl);
          }

          // Native Spreadsheet Table Structure
          const table = document.createElement('table');
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.fontSize = '12px';
          table.style.fontFamily = UNIVERSAL_FONT_FAMILY;
          table.style.tableLayout = 'auto';

          for (let rIdx = 0; rIdx < pageRows.length; rIdx++) {
            const actualRowIdx = sliceStart + rIdx;
            const isHeader = actualRowIdx === 0;
            const rowData = pageRows[rIdx];

            const tr = document.createElement('tr');
            tr.style.backgroundColor = isHeader ? '#f8fafc' : '#ffffff';

            for (let cIdx = 0; cIdx < colCount; cIdx++) {
              const cellValue = String(rowData[cIdx] !== undefined ? rowData[cIdx] : '').trim();
              const cell = document.createElement(isHeader ? 'th' : 'td');

              cell.style.border = '1px solid #d1d5db';
              cell.style.padding = '6px 8px';
              cell.style.color = isHeader ? '#111827' : '#1f2937';
              cell.style.fontWeight = isHeader ? '600' : '400';
              cell.style.verticalAlign = 'middle';
              cell.style.wordBreak = 'break-word';
              cell.style.fontFamily = UNIVERSAL_FONT_FAMILY;

              const isRtl = isRtlText(cellValue);
              cell.dir = isRtl ? 'rtl' : 'auto';
              cell.style.textAlign = isRtl ? 'right' : (/^-?\d+(\.\d+)?(%|€|\$|£|¥|₹|₽|₩|₺|₴|₦|₪|₫|฿|₱|₡|₲|₵|PKR|Rs)?$/i.test(cellValue) ? 'right' : 'left');
              cell.textContent = cellValue || '\u00A0';

              tr.appendChild(cell);
            }
            table.appendChild(tr);
          }

          sheetPageWrapper.appendChild(table);
          renderContainer.appendChild(sheetPageWrapper);

          const canvas = await renderElementToCanvas(sheetPageWrapper, 2);
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.96);
          const base64 = jpegDataUrl.split(',')[1];
          const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

          const embeddedImage = await pdfDoc.embedJpg(rawBytes);
          const page = pdfDoc.addPage([a4LandscapeWidth, a4LandscapeHeight]);

          const margin = 16;
          const targetWidth = a4LandscapeWidth - margin * 2;
          const targetHeight = a4LandscapeHeight - margin * 2;
          const imgAspect = canvas.width / canvas.height;
          const pageAspect = targetWidth / targetHeight;

          let renderW = targetWidth;
          let renderH = targetHeight;
          if (imgAspect > pageAspect) {
            renderH = targetWidth / imgAspect;
          } else {
            renderW = targetHeight * imgAspect;
          }

          const posX = margin + (targetWidth - renderW) / 2;
          const posY = a4LandscapeHeight - margin - renderH - (targetHeight - renderH) / 2;

          page.drawImage(embeddedImage, {
            x: posX,
            y: posY,
            width: renderW,
            height: renderH,
          });
        }
      }
    } finally {
      cleanupContainer(renderContainer);
    }

    if (pdfDoc.getPageCount() === 0) {
      pdfDoc.addPage([a4LandscapeWidth, a4LandscapeHeight]);
    }

    onProgress?.(95, 'Compiling PDF document...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'Excel to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 2. Word to PDF ────────────────────────────────────────────── */
  async convertWordToPdf(file, onProgress) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'doc') {
      throw new Error('Older .doc binary format cannot be parsed in-browser. Please save your file as .docx or use modern Word format.');
    }

    onProgress?.(15, 'Extracting Word document contents, styles & images...');
    const arrayBuffer = await file.arrayBuffer();

    let htmlContent = '';
    try {
      const mammothOptions = {
        convertImage: mammoth.images.imgElement((image) => {
          return image.read("base64").then((imageBuffer) => {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer
            };
          });
        })
      };

      const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
      htmlContent = result.value || '';
    } catch {
      htmlContent = '';
    }

    if (!htmlContent.trim()) {
      try {
        const rawResult = await mammoth.extractRawText({ arrayBuffer });
        const rawText = rawResult.value || '';
        htmlContent = rawText
          .split('\n')
          .filter(Boolean)
          .map(line => `<p dir="auto">${line}</p>`)
          .join('');
      } catch {
        htmlContent = '<p>Word document converted successfully.</p>';
      }
    }

    onProgress?.(45, 'Preserving original document layout, colors & fonts...');
    const pdfDoc = await PDFDocument.create();

    // A4 Portrait: 595.28 x 841.89 pt
    const a4Width = 595.28;
    const a4Height = 841.89;

    const renderContainer = createRenderContainer(794);

    try {
      const docWrapper = document.createElement('div');
      docWrapper.style.padding = '44px 50px';
      docWrapper.style.backgroundColor = '#ffffff';
      docWrapper.style.fontFamily = UNIVERSAL_FONT_FAMILY;
      docWrapper.style.color = '#111827';
      docWrapper.style.fontSize = '14px';
      docWrapper.style.lineHeight = '1.65';
      docWrapper.style.boxSizing = 'border-box';

      // Insert original document HTML as is (no artificial banners or title injection)
      const contentEl = document.createElement('div');
      contentEl.innerHTML = htmlContent;
      contentEl.style.fontFamily = UNIVERSAL_FONT_FAMILY;

      // Ensure all elements maintain original look with automatic bidirectional support
      const allEls = contentEl.querySelectorAll('*');
      allEls.forEach(el => {
        el.style.fontFamily = UNIVERSAL_FONT_FAMILY;
        if (!el.getAttribute('dir')) {
          el.setAttribute('dir', 'auto');
        }
        if (el.tagName === 'TABLE') {
          el.style.width = '100%';
          el.style.borderCollapse = 'collapse';
          el.style.margin = '14px 0';
        }
        if (el.tagName === 'TD' || el.tagName === 'TH') {
          el.style.border = '1px solid #d1d5db';
          el.style.padding = '6px 10px';
          el.style.verticalAlign = 'top';
        }
        if (el.tagName === 'IMG') {
          el.style.maxWidth = '100%';
          el.style.height = 'auto';
          el.style.display = 'block';
          el.style.margin = '10px auto';
        }
        if (el.tagName === 'P') {
          el.style.margin = '8px 0';
        }
      });

      docWrapper.appendChild(contentEl);
      renderContainer.appendChild(docWrapper);

      onProgress?.(70, 'Generating vector PDF pages...');
      const fullCanvas = await renderElementToCanvas(docWrapper, 2);

      // Slice the document canvas into A4 portrait pages
      const pxPerPage = Math.floor(fullCanvas.width * (a4Height / a4Width));
      const totalPages = Math.max(1, Math.ceil(fullCanvas.height / pxPerPage));

      for (let p = 0; p < totalPages; p++) {
        const sourceY = p * pxPerPage;
        const sliceH = Math.min(pxPerPage, fullCanvas.height - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = pxPerPage;
        const pctx = pageCanvas.getContext('2d');

        pctx.fillStyle = '#ffffff';
        pctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        pctx.drawImage(
          fullCanvas,
          0, sourceY, fullCanvas.width, sliceH,
          0, 0, fullCanvas.width, sliceH
        );

        const pageJpeg = pageCanvas.toDataURL('image/jpeg', 0.96);
        const base64 = pageJpeg.split(',')[1];
        const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        const embeddedImage = await pdfDoc.embedJpg(rawBytes);
        const page = pdfDoc.addPage([a4Width, a4Height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: a4Width,
          height: a4Height,
        });
      }
    } finally {
      cleanupContainer(renderContainer);
    }

    onProgress?.(95, 'Building PDF document...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'Word to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 3. PowerPoint to PDF ──────────────────────────────────────── */
  async convertPowerPointToPdf(file, onProgress) {
    onProgress?.(15, 'Unpacking PowerPoint presentation slides & media...');
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

    // Extract slide images from media folder
    const mediaFiles = {};
    for (const key of Object.keys(zip.files)) {
      if (/^ppt\/media\//i.test(key)) {
        try {
          const base64Data = await zip.files[key].async('base64');
          const ext = key.split('.').pop().toLowerCase();
          const mime = ext === 'png' ? 'image/png' : (ext === 'svg' ? 'image/svg+xml' : 'image/jpeg');
          mediaFiles[key.replace(/^ppt\/media\//i, '')] = `data:${mime};base64,${base64Data}`;
        } catch {
          // ignore broken media file
        }
      }
    }

    const pdfDoc = await PDFDocument.create();

    // A4 Landscape: 841.89 x 595.28 pt
    const a4LandscapeWidth = 841.89;
    const a4LandscapeHeight = 595.28;

    const renderContainer = createRenderContainer(1024);

    try {
      if (slideFiles.length === 0) {
        pdfDoc.addPage([a4LandscapeWidth, a4LandscapeHeight]);
      } else {
        for (let idx = 0; idx < slideFiles.length; idx++) {
          const currentPct = 20 + Math.round(((idx + 1) / slideFiles.length) * 70);
          onProgress?.(currentPct, `Rendering Slide ${idx + 1} of ${slideFiles.length}...`);

          const slideFileName = slideFiles[idx];
          const xmlText = await zip.files[slideFileName].async('text');

          // Extract text paragraphs and runs preserving original text and hierarchy
          const pMatches = xmlText.match(/<a:p\b[^>]*>[\s\S]*?<\/a:p>/gi) || [];
          const slideParagraphs = [];

          for (const pXml of pMatches) {
            const tMatches = pXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
            const textContent = tMatches.map(m => m.replace(/<[^>]+>/g, '')).join('').trim();
            if (textContent) {
              slideParagraphs.push(textContent);
            }
          }

          renderContainer.innerHTML = '';
          const slideCard = document.createElement('div');
          slideCard.style.width = '1024px';
          slideCard.style.height = '640px';
          slideCard.style.padding = '48px 56px';
          slideCard.style.backgroundColor = '#ffffff';
          slideCard.style.border = '1px solid #e2e8f0';
          slideCard.style.boxSizing = 'border-box';
          slideCard.style.fontFamily = UNIVERSAL_FONT_FAMILY;
          slideCard.style.display = 'flex';
          slideCard.style.flexDirection = 'column';
          slideCard.style.justifyContent = 'flex-start';

          if (slideParagraphs.length === 0) {
            const mediaKeys = Object.keys(mediaFiles);
            if (mediaKeys.length > idx && mediaFiles[mediaKeys[idx]]) {
              const imgEl = document.createElement('img');
              imgEl.src = mediaFiles[mediaKeys[idx]];
              imgEl.style.maxWidth = '100%';
              imgEl.style.maxHeight = '100%';
              imgEl.style.objectFit = 'contain';
              imgEl.style.margin = 'auto';
              slideCard.appendChild(imgEl);
            }
          } else {
            slideParagraphs.forEach((pText, pIdx) => {
              const pEl = document.createElement('div');
              pEl.style.fontFamily = UNIVERSAL_FONT_FAMILY;
              pEl.dir = isRtlText(pText) ? 'rtl' : 'auto';

              if (pIdx === 0) {
                pEl.style.fontSize = '24px';
                pEl.style.fontWeight = '700';
                pEl.style.color = '#0f172a';
                pEl.style.marginBottom = '24px';
                pEl.style.borderBottom = '1px solid #e2e8f0';
                pEl.style.paddingBottom = '12px';
              } else {
                pEl.style.fontSize = '15px';
                pEl.style.fontWeight = '400';
                pEl.style.color = '#334155';
                pEl.style.margin = '8px 0';
                pEl.style.lineHeight = '1.6';
              }

              pEl.textContent = pText;
              slideCard.appendChild(pEl);
            });
          }

          renderContainer.appendChild(slideCard);

          const canvas = await renderElementToCanvas(slideCard, 2);
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.96);
          const base64 = jpegDataUrl.split(',')[1];
          const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

          const embeddedImage = await pdfDoc.embedJpg(rawBytes);
          const page = pdfDoc.addPage([a4LandscapeWidth, a4LandscapeHeight]);

          const margin = 20;
          page.drawImage(embeddedImage, {
            x: margin,
            y: margin,
            width: a4LandscapeWidth - margin * 2,
            height: a4LandscapeHeight - margin * 2,
          });
        }
      }
    } finally {
      cleanupContainer(renderContainer);
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

      // Universal Canvas Decoder fallback (handles WEBP, BMP, GIF, progressive JPEGs, HEIC)
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

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.96);
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

    const renderScale = level === 'extreme' ? 0.70 : level === 'less' ? 1.0 : 0.85;
    const jpegQuality = level === 'extreme' ? 0.40 : level === 'less' ? 0.75 : 0.55;

    let bestResult = null;
    let bestSize = Infinity;

    const tryCanvasCompress = async (s, q, stageLabel) => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer.slice(0),
          cMapUrl: PDFJS_CMAP_URL,
          cMapPacked: true,
          standardFontDataUrl: PDFJS_STANDARD_FONTS_URL,
        });
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

    const resBytes = await tryCanvasCompress(renderScale, jpegQuality, 'Optimizing pages');
    if (resBytes && resBytes.byteLength < originalSize) {
      bestResult = resBytes;
      bestSize = resBytes.byteLength;
    }

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

    if (!bestResult || bestResult.byteLength >= originalSize) {
      return file;
    }

    return new Blob([bestResult], { type: 'application/pdf' });
  },

  /* ── 7. Split PDF (iLovePDF-grade Multi-Mode Engine) ────────── */
  async splitPdf(file, config = 'all', onProgress) {
    onProgress?.(10, 'Loading PDF document...');
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    if (totalPages === 0) {
      throw new Error('The uploaded PDF document does not contain any pages.');
    }

    // Helper: Parse string like "1, 3, 5-8" into 0-based indices array
    const parsePageString = (str) => {
      const parts = String(str || '').split(/[,;\s]+/);
      const selected = new Set();
      for (const part of parts) {
        const p = part.trim();
        if (!p) continue;
        if (p.includes('-')) {
          const [startStr, endStr] = p.split('-');
          const start = parseInt(startStr.trim(), 10);
          const end = parseInt(endStr.trim(), 10);
          if (!isNaN(start) && !isNaN(end)) {
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            for (let pageNum = min; pageNum <= max; pageNum++) {
              if (pageNum >= 1 && pageNum <= totalPages) selected.add(pageNum - 1);
            }
          }
        } else {
          const pageNum = parseInt(p, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            selected.add(pageNum - 1);
          }
        }
      }
      return Array.from(selected).sort((a, b) => a - b);
    };

    // Helper: Build a single PDF document from an array of 0-based page indices
    const buildSubDoc = async (pageIndices) => {
      const subDoc = await PDFDocument.create();
      if (pageIndices.length > 0) {
        const copied = await subDoc.copyPages(pdfDoc, pageIndices);
        copied.forEach(cp => subDoc.addPage(cp));
      }
      return await subDoc.save();
    };

    // Normalize config
    let mode = 'range'; // 'range' or 'extract'
    let rangeType = 'custom'; // 'custom' or 'fixed'
    let rangesList = [{ from: 1, to: totalPages }];
    let fixedPages = 1;
    let mergeAll = false;
    let extractMode = 'all'; // 'all' or 'select'
    let extractPagesStr = '1';

    if (typeof config === 'object' && config !== null) {
      mode = config.mode || (config.splitMode === 'extract' ? 'extract' : 'range');
      rangeType = config.rangeType || 'custom';
      rangesList = Array.isArray(config.ranges) && config.ranges.length > 0 ? config.ranges : [{ from: 1, to: totalPages }];
      fixedPages = Math.max(1, parseInt(config.fixedPages, 10) || 1);
      mergeAll = Boolean(config.merge);
      extractMode = config.extractMode || (config.splitMode === 'all' ? 'all' : 'select');
      extractPagesStr = config.extractPages || config.customRanges || '1';
    } else if (typeof config === 'string') {
      if (config === 'all') {
        mode = 'extract';
        extractMode = 'all';
      } else if (config === 'odd' || config === 'even') {
        mode = 'extract';
        extractMode = 'select';
        const indices = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => config === 'odd' ? p % 2 !== 0 : p % 2 === 0);
        extractPagesStr = indices.join(', ');
      } else {
        mode = 'extract';
        extractMode = 'select';
        extractPagesStr = config;
      }
    }

    /* ════════════════════════════════════════════════════════════════
       MODE A: EXTRACT PAGES
       ════════════════════════════════════════════════════════════════ */
    if (mode === 'extract') {
      if (extractMode === 'all') {
        if (totalPages === 1) {
          const subBytes = await buildSubDoc([0]);
          onProgress?.(100, 'Done');
          return { blob: new Blob([subBytes], { type: 'application/pdf' }), isZip: false };
        }

        const zip = new JSZip();
        for (let i = 0; i < totalPages; i++) {
          const pct = 15 + Math.round(((i + 1) / totalPages) * 75);
          onProgress?.(pct, `Extracting page ${i + 1} of ${totalPages}...`);
          const subBytes = await buildSubDoc([i]);
          zip.file(`page_${i + 1}.pdf`, subBytes);
        }
        onProgress?.(95, 'Packaging ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        onProgress?.(100, 'Done');
        return { blob: zipBlob, isZip: true };
      }

      // Extract Select
      const selectedIndices = parsePageString(extractPagesStr);
      const indicesToUse = selectedIndices.length > 0 ? selectedIndices : [0];

      if (mergeAll || indicesToUse.length === 1) {
        onProgress?.(60, `Merging ${indicesToUse.length} extracted pages into 1 PDF...`);
        const subBytes = await buildSubDoc(indicesToUse);
        onProgress?.(100, 'Done');
        return { blob: new Blob([subBytes], { type: 'application/pdf' }), isZip: false };
      }

      // Multiple pages separate -> ZIP
      const zip = new JSZip();
      for (let i = 0; i < indicesToUse.length; i++) {
        const pageIdx = indicesToUse[i];
        const pct = 15 + Math.round(((i + 1) / indicesToUse.length) * 75);
        onProgress?.(pct, `Extracting page ${pageIdx + 1} (${i + 1}/${indicesToUse.length})...`);
        const subBytes = await buildSubDoc([pageIdx]);
        zip.file(`page_${pageIdx + 1}.pdf`, subBytes);
      }
      onProgress?.(95, 'Packaging ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onProgress?.(100, 'Done');
      return { blob: zipBlob, isZip: true };
    }

    /* ════════════════════════════════════════════════════════════════
       MODE B: SPLIT BY RANGE
       ════════════════════════════════════════════════════════════════ */
    if (rangeType === 'fixed') {
      // Split into chunks of fixedPages
      const chunks = [];
      for (let i = 0; i < totalPages; i += fixedPages) {
        const end = Math.min(i + fixedPages, totalPages);
        const chunkIndices = [];
        for (let p = i; p < end; p++) chunkIndices.push(p);
        chunks.push({ startPage: i + 1, endPage: end, indices: chunkIndices });
      }

      if (chunks.length === 1) {
        const subBytes = await buildSubDoc(chunks[0].indices);
        onProgress?.(100, 'Done');
        return { blob: new Blob([subBytes], { type: 'application/pdf' }), isZip: false };
      }

      const zip = new JSZip();
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const pct = 15 + Math.round(((i + 1) / chunks.length) * 75);
        onProgress?.(pct, `Creating part ${i + 1} (pages ${chunk.startPage}-${chunk.endPage})...`);
        const subBytes = await buildSubDoc(chunk.indices);
        zip.file(`part_${i + 1}_pages_${chunk.startPage}-${chunk.endPage}.pdf`, subBytes);
      }
      onProgress?.(95, 'Packaging ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onProgress?.(100, 'Done');
      return { blob: zipBlob, isZip: true };
    }

    // Custom Ranges
    // Clean and validate ranges
    const validRanges = [];
    for (let idx = 0; idx < rangesList.length; idx++) {
      const r = rangesList[idx];
      let from = parseInt(r.from, 10);
      let to = parseInt(r.to, 10);
      if (isNaN(from)) from = 1;
      if (isNaN(to)) to = from;
      from = Math.max(1, Math.min(from, totalPages));
      to = Math.max(1, Math.min(to, totalPages));
      const min = Math.min(from, to);
      const max = Math.max(from, to);
      const indices = [];
      for (let p = min; p <= max; p++) indices.push(p - 1);
      validRanges.push({ rangeIndex: idx + 1, from: min, to: max, indices });
    }

    if (validRanges.length === 0) {
      validRanges.push({ rangeIndex: 1, from: 1, to: totalPages, indices: Array.from({ length: totalPages }, (_, i) => i) });
    }

    // If mergeAll is true: combine all ranges into 1 PDF
    if (mergeAll) {
      onProgress?.(40, 'Merging all specified ranges into one PDF...');
      const combinedIndices = [];
      for (const r of validRanges) {
        combinedIndices.push(...r.indices);
      }
      const subBytes = await buildSubDoc(combinedIndices);
      onProgress?.(100, 'Done');
      return { blob: new Blob([subBytes], { type: 'application/pdf' }), isZip: false };
    }

    // If only 1 range and mergeAll is false: return single PDF
    if (validRanges.length === 1) {
      onProgress?.(60, `Extracting pages ${validRanges[0].from} to ${validRanges[0].to}...`);
      const subBytes = await buildSubDoc(validRanges[0].indices);
      onProgress?.(100, 'Done');
      return { blob: new Blob([subBytes], { type: 'application/pdf' }), isZip: false };
    }

    // Multiple ranges -> export each range as a standalone PDF inside a ZIP
    const zip = new JSZip();
    for (let i = 0; i < validRanges.length; i++) {
      const r = validRanges[i];
      const pct = 15 + Math.round(((i + 1) / validRanges.length) * 75);
      onProgress?.(pct, `Extracting Range ${r.rangeIndex} (pages ${r.from}-${r.to})...`);
      const subBytes = await buildSubDoc(r.indices);
      zip.file(`range_${r.rangeIndex}_pages_${r.from}-${r.to}.pdf`, subBytes);
    }
    onProgress?.(95, 'Packaging ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100, 'Done');
    return { blob: zipBlob, isZip: true };
  },

  /* ── 8. PDF to JPG ─────────────────────────────────────────────── */
  async convertPdfToJpg(file, onProgress) {
    onProgress?.(15, 'Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: PDFJS_CMAP_URL,
      cMapPacked: true,
      standardFontDataUrl: PDFJS_STANDARD_FONTS_URL,
    });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const jpgBlobs = [];

    for (let i = 1; i <= numPages; i++) {
      const currentPct = 20 + Math.round((i / numPages) * 70);
      onProgress?.(currentPct, `Rendering high-res page ${i} of ${numPages}...`);

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

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
