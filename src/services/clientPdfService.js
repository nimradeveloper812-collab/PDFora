import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure pdfjs worker using locally bundled Vite asset URL to eliminate CORS issues
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Helper to remove characters if we are using the fallback WinAnsi encoding
const sanitizeText = (str, usingCustomFont) => {
  if (!str) return '';
  if (usingCustomFont) return str;
  return str.replace(/[^\x00-\xFF]/g, '');
};

// Helper to init PDFDocument with custom Unicode font
const createPdfDocWithCustomFont = async () => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  let customFont = null;
  let font = null;
  let fontBold = null;

  try {
    const fontRes = await fetch('/fonts/NotoSans-Regular.ttf');
    if (fontRes.ok) {
      const fontBytes = await fontRes.arrayBuffer();
      customFont = await pdfDoc.embedFont(fontBytes);
      font = customFont;
      fontBold = customFont;
    } else {
      throw new Error('Font file not found');
    }
  } catch (err) {
    console.warn("Failed to load NotoSans font, using standard Helvetica fallback:", err);
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  return { pdfDoc, font, fontBold, hasCustomFont: !!customFont };
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
    
    let fullHtml = `
      <style>
        body { font-family: "Noto Sans", "Helvetica Neue", Helvetica, sans-serif; padding: 20px; color: #222; }
        h2 { color: #444; margin-top: 20px; border-bottom: 2px solid #ccc; padding-bottom: 5px; font-size: 18px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; font-size: 12px; }
        th, td { border: 1px solid #aaa; padding: 6px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
      </style>
      <div>
    `;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const htmlTable = XLSX.utils.sheet_to_html(sheet);
      
      fullHtml += `<h2>Sheet: ${sheetName}</h2>`;
      fullHtml += htmlTable;
      fullHtml += `<div class="html2pdf__page-break"></div>`;
    }
    fullHtml += `</div>`;

    const container = document.createElement('div');
    container.innerHTML = fullHtml;
    
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1122px'; // Approximate A4 Landscape width
    document.body.appendChild(container);

    const opt = {
      margin:       [15, 15, 15, 15],
      filename:     file.name.replace(/\.[^/.]+$/, '') + '.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      return pdfBlob;
    } finally {
      document.body.removeChild(container);
    }
  },

  /* ── 2. Word to PDF ────────────────────────────────────────────── */
  async convertWordToPdf(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'doc') {
      throw new Error('Older .doc formats are not supported for local client-side conversion. Please convert your file to .docx or ensure the server is online.');
    }
    const arrayBuffer = await file.arrayBuffer();
    // mammoth extracts HTML with basic styling, images (base64), and tables
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value || '';

    if (!html) {
      // Fallback empty pdf
      const { pdfDoc, font, hasCustomFont } = await createPdfDocWithCustomFont();
      const page = pdfDoc.addPage([595.28, 841.89]);
      
      const safeText = sanitizeText("Empty Document", hasCustomFont);
      page.drawText(safeText, {
        x: 50,
        y: 800,
        size: 14,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    }

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.innerHTML = html;
    
    // Add default Word-like styling so the HTML looks like a document
    container.style.padding = '40px';
    container.style.fontFamily = '"Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.6';
    container.style.color = '#111';
    container.style.backgroundColor = '#fff';
    container.style.width = '794px'; // Approximate A4 width in pixels at 96 DPI
    
    // Styling for HTML elements generated by mammoth
    const styleNode = document.createElement('style');
    styleNode.innerHTML = `
      table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
      td, th { border: 1px solid #ccc; padding: 6px; }
      img { max-width: 100%; height: auto; }
      h1, h2, h3, h4 { color: #000; margin-top: 1em; margin-bottom: 0.5em; }
      p { margin-bottom: 1em; }
      ul, ol { margin-bottom: 1em; padding-left: 20px; }
    `;
    container.appendChild(styleNode);

    // We must append to body for html2canvas to render it correctly
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const opt = {
      margin:       [15, 15, 15, 15], // Top, Left, Bottom, Right (mm)
      filename:     file.name.replace(/\.[^/.]+$/, '') + '.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      return pdfBlob;
    } finally {
      // Always cleanup DOM
      document.body.removeChild(container);
    }
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

    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = '"Noto Sans", "Helvetica Neue", Helvetica, sans-serif';
    container.style.color = '#111';
    container.style.width = '1122px'; // Landscape A4 width
    
    // Global styles for slides
    const styleNode = document.createElement('style');
    styleNode.innerHTML = `
      .slide-card {
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 30px;
        background-color: #fff;
        page-break-inside: avoid;
      }
      .slide-card h3 { color: #9d316e; margin-top: 0; font-size: 22px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      .slide-card ul { padding-left: 20px; font-size: 16px; line-height: 1.6; }
      .slide-card img { max-width: 100%; max-height: 400px; margin-top: 15px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: block; }
    `;
    container.appendChild(styleNode);

    if (slideFiles.length === 0) {
      container.innerHTML += `<div class="slide-card"><h3>Presentation: ${file.name}</h3><p>No slides found.</p></div>`;
    } else {
      for (let idx = 0; idx < slideFiles.length; idx++) {
        const slideFileName = slideFiles[idx];
        const xmlText = await zip.files[slideFileName].async('text');
        
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide-card';
        slideDiv.innerHTML = `<h3>Slide ${idx + 1}</h3>`;

        // Extract Text
        const matches = xmlText.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
        const slideTexts = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
        
        if (slideTexts.length > 0) {
          const ul = document.createElement('ul');
          slideTexts.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            ul.appendChild(li);
          });
          slideDiv.appendChild(ul);
        }

        // Extract Images
        // Find corresponding relationships file: ppt/slides/_rels/slideN.xml.rels
        const slideBaseName = slideFileName.split('/').pop();
        const relPath = `ppt/slides/_rels/${slideBaseName}.rels`;
        
        if (zip.files[relPath]) {
          try {
            const relXml = await zip.files[relPath].async('text');
            // Regex to find image relationships
            const relMatches = [...relXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/gi)];
            
            for (const match of relMatches) {
              const relId = match[1];
              let target = match[2]; // e.g. ../media/image1.jpeg
              
              // Only include if the slide XML actually uses this relId (e.g., <a:blip r:embed="rId2")
              if (xmlText.includes(`r:embed="${relId}"`)) {
                // Resolve relative target to absolute zip path
                let mediaPath = target;
                if (target.startsWith('../')) {
                  mediaPath = target.replace('../', 'ppt/');
                }
                
                if (zip.files[mediaPath]) {
                  const imgBase64 = await zip.files[mediaPath].async('base64');
                  const ext = mediaPath.split('.').pop().toLowerCase();
                  let mime = 'image/jpeg';
                  if (ext === 'png') mime = 'image/png';
                  else if (ext === 'gif') mime = 'image/gif';
                  else if (ext === 'svg') mime = 'image/svg+xml';
                  
                  const img = document.createElement('img');
                  img.src = `data:${mime};base64,${imgBase64}`;
                  slideDiv.appendChild(img);
                }
              }
            }
          } catch (err) {
            console.warn(`Could not extract images for Slide ${idx + 1}`, err);
          }
        }
        
        container.appendChild(slideDiv);
      }
    }

    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const opt = {
      margin:       [15, 15, 15, 15],
      filename:     file.name.replace(/\.[^/.]+$/, '') + '.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      return pdfBlob;
    } finally {
      document.body.removeChild(container);
    }
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

    // Fail-safe: If no compression was achieved, return the original file
    if (!bestResult || bestResult.byteLength >= originalSize) {
      return file;
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
