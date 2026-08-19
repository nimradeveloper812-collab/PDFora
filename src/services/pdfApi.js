import { clientPdfService } from './clientPdfService';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

const safeRequest = async (fetchCall) => {
  let isClientError = false;
  let clientErrorMessage = '';
  try {
    const res = await fetchCall();
    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // Verify response is genuinely a binary PDF / ZIP / Image from backend (not an HTML SPA fallback)
    const isBinary = contentType.includes('application/pdf') ||
                     contentType.includes('application/zip') ||
                     contentType.includes('image/') ||
                     contentType.includes('application/octet-stream');

    if (res.ok && isBinary) {
      return res;
    }

    if (res.status === 400 || res.status === 422) {
      isClientError = true;
      try {
        const errJson = await res.json();
        clientErrorMessage = errJson.error || errJson.message || 'Invalid request.';
      } catch {
        clientErrorMessage = 'Invalid request.';
      }
    } else {
      console.info(`Server returned status ${res.status} with non-binary content-type (${contentType}). Falling back to client-side PDF processing.`);
    }
  } catch (err) {
    console.info('Server unavailable. Processing client-side:', err);
  }

  if (isClientError) {
    throw new Error(clientErrorMessage);
  }
  return null;
};

export const pdfApi = {
  async convertWordToPdf(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/word-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertWordToPdf(file, onProgress);
  },

  async convertExcelToPdf(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/excel-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertExcelToPdf(file, onProgress);
  },

  async convertPowerPointToPdf(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/powerpoint-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertPowerPointToPdf(file, onProgress);
  },

  async convertJpgToPdf(files, onProgress) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/jpg-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertJpgToPdf(files, onProgress);
  },

  async convertPdfToJpg(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/pdf-to-jpg`, { method: 'POST', body: formData }));
    if (res) {
      const contentType = res.headers.get('content-type') || '';
      const isZip = contentType.includes('zip');
      return { blob: await res.blob(), isZip };
    }

    return await clientPdfService.convertPdfToJpg(file, onProgress);
  },

  async mergePdf(files, onProgress) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/merge`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.mergePdf(files, onProgress);
  },

  async compressPdf(file, level = 'recommended', onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/compress`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.compressPdf(file, level, onProgress);
  },

  async splitPdf(file, ranges = 'all', onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ranges', ranges);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/split`, { method: 'POST', body: formData }));
    if (res) {
      const contentType = res.headers.get('content-type') || '';
      const isZip = contentType.includes('zip');
      return { blob: await res.blob(), isZip };
    }

    return await clientPdfService.splitPdf(file, ranges, onProgress);
  },

  async convertPdfToWord(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/pdf-to-word`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertPdfToWord(file, onProgress);
  },

  async convertPdfToExcel(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/pdf-to-excel`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertPdfToExcel(file, onProgress);
  },

  async convertExcelToWord(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/excel-to-word`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertExcelToWord(file, onProgress);
  },

  async convertWordToExcel(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/word-to-excel`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertWordToExcel(file, onProgress);
  }
};
