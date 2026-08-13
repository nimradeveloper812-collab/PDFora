import { clientPdfService } from './clientPdfService';

const API_BASE = import.meta.env.VITE_API_URL || '';

const safeRequest = async (fetchCall) => {
  let isClientError = false;
  let clientErrorMessage = '';
  try {
    const res = await fetchCall();
    if (res.ok) {
      return res;
    }
    if (res.status === 400 || res.status === 422) {
      isClientError = true;
      try {
        const errJson = await res.json();
        clientErrorMessage = errJson.error || errJson.message || 'Invalid request.';
      } catch (e) {
        clientErrorMessage = 'Invalid request.';
      }
    } else {
      console.info(`Server returned status ${res.status}. Falling back to client-side PDF processing.`);
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
  async convertWordToPdf(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/word-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertWordToPdf(file);
  },

  async convertExcelToPdf(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/excel-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertExcelToPdf(file);
  },

  async convertPowerPointToPdf(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/powerpoint-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertPowerPointToPdf(file);
  },

  async convertJpgToPdf(files) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/jpg-to-pdf`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.convertJpgToPdf(files);
  },

  async convertPdfToJpg(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/pdf-to-jpg`, { method: 'POST', body: formData }));
    if (res) {
      const contentType = res.headers.get('content-type') || '';
      const isZip = contentType.includes('zip');
      return { blob: await res.blob(), isZip };
    }

    return await clientPdfService.convertPdfToJpg(file);
  },

  async mergePdf(files) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/merge`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.mergePdf(files);
  },

  async compressPdf(file, level = 'recommended') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/compress`, { method: 'POST', body: formData }));
    if (res) return await res.blob();

    return await clientPdfService.compressPdf(file, level);
  },

  async splitPdf(file, ranges = 'all') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ranges', ranges);

    const res = await safeRequest(() => fetch(`${API_BASE}/api/pdf/split`, { method: 'POST', body: formData }));
    if (res) {
      const contentType = res.headers.get('content-type') || '';
      const isZip = contentType.includes('zip');
      return { blob: await res.blob(), isZip };
    }

    return await clientPdfService.splitPdf(file, ranges);
  }
};
