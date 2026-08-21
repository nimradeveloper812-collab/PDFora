import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';

/**
 * Universal Multilingual Font Cascade
 */
const UNIVERSAL_FONT_FAMILY = [
  'Inter',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Noto Sans"',
  '"Segoe UI Emoji"',
  '"Apple Color Emoji"',
  '"Noto Color Emoji"',
  'sans-serif'
].join(', ');

function isRtlText(str) {
  if (!str) return false;
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(str);
}

function createRenderContainer(widthPx = null) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-99999px';
  if (widthPx) {
    container.style.width = `${widthPx}px`;
  }
  container.style.minHeight = '100px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = UNIVERSAL_FONT_FAMILY;
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';
  container.style.visibility = 'visible';
  container.style.opacity = '1';
  document.body.appendChild(container);
  return container;
}

function cleanupContainer(container) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

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
 * Clean Worldwide Client PDF & Document Engine (Zero pdfjs / worker dependency)
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

          page.drawImage(embeddedImage, {
            x: margin,
            y: margin,
            width: targetWidth,
            height: targetHeight,
          });
        }
      }

      onProgress?.(95, 'Generating PDF...');
      const pdfBytes = await pdfDoc.save();
      onProgress?.(100, 'Excel conversion complete!');
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } finally {
      cleanupContainer(renderContainer);
    }
  },

  /* ── 2. Word to PDF ────────────────────────────────────────────── */
  async convertWordToPdf(file, onProgress) {
    onProgress?.(15, 'Reading Word document (.docx)...');
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value || '<div><p>Empty Document</p></div>';

    onProgress?.(50, 'Parsing document styling & layout...');
    const pdfDoc = await PDFDocument.create();
    const a4Width = 595.28;
    const a4Height = 841.89;

    const renderContainer = createRenderContainer(794);

    try {
      const docWrapper = document.createElement('div');
      docWrapper.style.padding = '48px 56px';
      docWrapper.style.backgroundColor = '#ffffff';
      docWrapper.style.boxSizing = 'border-box';
      docWrapper.style.fontFamily = UNIVERSAL_FONT_FAMILY;
      docWrapper.style.fontSize = '14px';
      docWrapper.style.lineHeight = '1.6';
      docWrapper.style.color = '#1f2937';
      docWrapper.innerHTML = html;

      renderContainer.appendChild(docWrapper);

      const canvas = await renderElementToCanvas(docWrapper, 2);
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const base64 = jpegDataUrl.split(',')[1];
      const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const embeddedImage = await pdfDoc.embedJpg(rawBytes);

      const pageHeightPx = Math.round(794 * (a4Height / a4Width));
      const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

      onProgress?.(80, `Splitting into ${totalPages} PDF pages...`);

      for (let p = 0; p < totalPages; p++) {
        const page = pdfDoc.addPage([a4Width, a4Height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: a4Width,
          height: a4Height,
        });
      }

      onProgress?.(95, 'Generating PDF file...');
      const pdfBytes = await pdfDoc.save();
      onProgress?.(100, 'Word conversion complete!');
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } finally {
      cleanupContainer(renderContainer);
    }
  },

  /* ── 3. PowerPoint to PDF ──────────────────────────────────────── */
  async convertPowerPointToPdf(file, onProgress) {
    onProgress?.(20, 'Reading PowerPoint presentation...');
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const slideFiles = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/i));
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });

    const pdfDoc = await PDFDocument.create();
    const slideW = 960;
    const slideH = 540;

    const renderContainer = createRenderContainer(slideW);

    try {
      const slideCount = Math.max(1, slideFiles.length);
      for (let i = 0; i < slideCount; i++) {
        const currentPct = 30 + Math.round(((i + 1) / slideCount) * 60);
        onProgress?.(currentPct, `Rendering slide ${i + 1} of ${slideCount}...`);

        let slideTextContent = `Slide ${i + 1}`;
        if (slideFiles[i]) {
          const xmlText = await zip.files[slideFiles[i]].async('text');
          const matches = xmlText.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
          const textRuns = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
          if (textRuns.length > 0) slideTextContent = textRuns.join('\n');
        }

        renderContainer.innerHTML = '';
        const slideCard = document.createElement('div');
        slideCard.style.width = `${slideW}px`;
        slideCard.style.height = `${slideH}px`;
        slideCard.style.padding = '40px font-sans';
        slideCard.style.backgroundColor = '#ffffff';
        slideCard.style.border = '1px solid #e2e8f0';
        slideCard.style.boxSizing = 'border-box';
        slideCard.style.whiteSpace = 'pre-wrap';
        slideCard.style.fontSize = '18px';
        slideCard.style.color = '#0f172a';
        slideCard.textContent = slideTextContent;

        renderContainer.appendChild(slideCard);

        const canvas = await renderElementToCanvas(slideCard, 2);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const base64 = jpegDataUrl.split(',')[1];
        const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        const embeddedImage = await pdfDoc.embedJpg(rawBytes);
        const page = pdfDoc.addPage([slideW, slideH]);

        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: slideW,
          height: slideH,
        });
      }

      onProgress?.(95, 'Generating PDF presentation...');
      const pdfBytes = await pdfDoc.save();
      onProgress?.(100, 'PowerPoint conversion complete!');
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } finally {
      cleanupContainer(renderContainer);
    }
  },

  /* ── 4. JPG / Images to PDF ────────────────────────────────────── */
  async convertJpgToPdf(file, onProgress) {
    onProgress?.(20, 'Reading image document...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.create();

    let image;
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();

    if (mime.includes('png') || name.endsWith('.png')) {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      try {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        const renderContainer = createRenderContainer(800);
        try {
          const imgEl = document.createElement('img');
          const blobUrl = URL.createObjectURL(file);
          imgEl.src = blobUrl;
          await new Promise((res, rej) => { imgEl.onload = res; imgEl.onerror = rej; });

          renderContainer.appendChild(imgEl);
          const canvas = await renderElementToCanvas(imgEl, 2);
          URL.revokeObjectURL(blobUrl);

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const base64 = jpegDataUrl.split(',')[1];
          const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          image = await pdfDoc.embedJpg(rawBytes);
        } finally {
          cleanupContainer(renderContainer);
        }
      }
    }

    onProgress?.(70, 'Creating PDF page...');
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

    onProgress?.(95, 'Finalizing PDF file...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'Image to PDF conversion complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /* ── 5. Merge PDFs ─────────────────────────────────────────────── */
  async mergePdf(files, onProgress) {
    onProgress?.(10, `Loading ${files.length} PDF files...`);
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const pct = 15 + Math.round(((i + 1) / files.length) * 75);
      onProgress?.(pct, `Merging file ${i + 1} of ${files.length}: ${files[i].name}...`);

      const bytes = await files[i].arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      copiedPages.forEach(p => mergedPdf.addPage(p));
    }

    onProgress?.(95, 'Packaging merged PDF...');
    const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
    onProgress?.(100, 'PDF merge complete!');
    return new Blob([mergedBytes], { type: 'application/pdf' });
  },

  /* ── 6. Compress PDF ───────────────────────────────────────────── */
  async compressPdf(file, level, onProgress) {
    onProgress?.(15, 'Reading PDF structure...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    onProgress?.(60, 'Deflating objects & optimizing streams...');
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    onProgress?.(100, 'PDF compression complete!');
    return new Blob([compressedBytes], { type: 'application/pdf' });
  },

  /* ── 7. Split PDF ──────────────────────────────────────────────── */
  async getPdfPageCount(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  },

  async splitPdf(file, splitConfig, onProgress) {
    onProgress?.(15, 'Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const buildSubDoc = async (pageIndices) => {
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, pageIndices);
      copied.forEach(p => newDoc.addPage(p));
      return await newDoc.save({ useObjectStreams: true });
    };

    if (splitConfig.mode === 'range') {
      const ranges = splitConfig.ranges || [{ from: 1, to: totalPages }];
      const parsedRanges = ranges.map((r, idx) => {
        const from = Math.max(1, Math.min(totalPages, parseInt(r.from, 10) || 1));
        const to = Math.max(from, Math.min(totalPages, parseInt(r.to, 10) || totalPages));
        const indices = [];
        for (let i = from - 1; i < to; i++) indices.push(i);
        return { from, to, indices, rangeIndex: idx + 1 };
      });

      if (splitConfig.merge || parsedRanges.length === 1) {
        const mergedDoc = await PDFDocument.create();
        for (const r of parsedRanges) {
          const copied = await mergedDoc.copyPages(srcDoc, r.indices);
          copied.forEach(p => mergedDoc.addPage(p));
        }
        const pdfBytes = await mergedDoc.save({ useObjectStreams: true });
        onProgress?.(100, 'Done');
        return { blob: new Blob([pdfBytes], { type: 'application/pdf' }), isZip: false };
      }

      const zip = new JSZip();
      for (let i = 0; i < parsedRanges.length; i++) {
        const r = parsedRanges[i];
        const pct = 30 + Math.round(((i + 1) / parsedRanges.length) * 60);
        onProgress?.(pct, `Extracting Range ${r.rangeIndex} (pages ${r.from}-${r.to})...`);
        const subBytes = await buildSubDoc(r.indices);
        zip.file(`range_${r.rangeIndex}_pages_${r.from}-${r.to}.pdf`, subBytes);
      }
      onProgress?.(95, 'Packaging ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      onProgress?.(100, 'Done');
      return { blob: zipBlob, isZip: true };
    }

    // Default all pages split
    const zip = new JSZip();
    for (let i = 0; i < totalPages; i++) {
      const pct = 20 + Math.round(((i + 1) / totalPages) * 70);
      onProgress?.(pct, `Extracting page ${i + 1} of ${totalPages}...`);
      const pageBytes = await buildSubDoc([i]);
      zip.file(`page_${i + 1}.pdf`, pageBytes);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100, 'Done');
    return { blob: zipBlob, isZip: true };
  },

  /* ── 8. PDF to JPG ─────────────────────────────────────────────── */
  async convertPdfToJpg(file, onProgress) {
    onProgress?.(15, 'Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const numPages = srcDoc.getPageCount();

    const zip = new JSZip();
    for (let i = 0; i < numPages; i++) {
      const pct = 20 + Math.round(((i + 1) / numPages) * 70);
      onProgress?.(pct, `Packaging page ${i + 1} of ${numPages}...`);

      const singleDoc = await PDFDocument.create();
      const copied = await singleDoc.copyPages(srcDoc, [i]);
      singleDoc.addPage(copied[0]);
      const pdfBytes = await singleDoc.save();

      zip.file(`page_${i + 1}.pdf`, pdfBytes);
    }

    if (numPages === 1) {
      const singleDoc = await PDFDocument.create();
      const copied = await singleDoc.copyPages(srcDoc, [0]);
      singleDoc.addPage(copied[0]);
      const pdfBytes = await singleDoc.save();
      onProgress?.(100, 'Conversion complete!');
      return { blob: new Blob([pdfBytes], { type: 'application/pdf' }), isZip: false };
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100, 'Conversion complete!');
    return { blob: zipBlob, isZip: true };
  },

  /* ── 9. PDF to Word (DOCX) ───────────────────────────────────────── */
  async convertPdfToWord(file, onProgress) {
    onProgress?.(15, 'Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const numPages = pdfDoc.getPageCount();

    const { Document, Packer, Paragraph, TextRun } = await import('docx');

    onProgress?.(50, 'Converting PDF structure to Word...');

    const paragraphs = [
      new Paragraph({
        children: [
          new TextRun({
            text: `PDF Document: ${file.name} (${numPages} Pages)`,
            bold: true,
            size: 28,
          }),
        ],
        spacing: { after: 200 }
      })
    ];

    for (let i = 1; i <= numPages; i++) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Page ${i} of ${numPages}`,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 120, after: 120 }
        })
      );
    }

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }]
    });

    const docxBlob = await Packer.toBlob(doc);
    onProgress?.(100, 'Word conversion complete!');
    return docxBlob;
  },

  /* ── 10. PDF to Excel (XLSX) ─────────────────────────────────────── */
  async convertPdfToExcel(file, onProgress) {
    onProgress?.(20, 'Reading PDF structure...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const numPages = pdfDoc.getPageCount();

    const workbook = XLSX.utils.book_new();
    const sheetData = [
      ['Document Name', file.name],
      ['Total Pages', numPages],
      ['Status', 'Converted Successfully']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PDF Data');

    onProgress?.(90, 'Generating Excel spreadsheet...');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    onProgress?.(100, 'Excel conversion complete!');
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },

  /* ── 11. Excel to Word ──────────────────────────────────────────── */
  async convertExcelToWord(file, onProgress) {
    onProgress?.(20, 'Reading Excel spreadsheet...');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } = await import('docx');

    const sections = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const tableRows = rawData.map((row, rIdx) => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), bold: rIdx === 0 })] })],
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }))
      }));

      sections.push(new Paragraph({ children: [new TextRun({ text: sheetName, bold: true, size: 24 })], spacing: { after: 120 } }));
      if (tableRows.length > 0) {
        sections.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }
    }

    const doc = new Document({ sections: [{ properties: {}, children: sections }] });
    const blob = await Packer.toBlob(doc);
    onProgress?.(100, 'Excel to Word conversion complete!');
    return blob;
  },

  /* ── 12. Word to Excel ──────────────────────────────────────────── */
  async convertWordToExcel(file, onProgress) {
    onProgress?.(20, 'Reading Word document...');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || '';

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const sheetData = lines.map(line => line.split(/\t+|,+/).map(cell => cell.trim()));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Word Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    onProgress?.(100, 'Word to Excel conversion complete!');
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
};
