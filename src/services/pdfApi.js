const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `Server error (${response.status}). Please try again.`;
    try {
      const clone = response.clone();
      const errorData = await clone.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // JSON parsing failed — keep default message
    }
    throw new Error(errorMessage);
  }
  return response;
};

export const pdfApi = {
  async convertWordToPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/pdf/word-to-pdf`, { method: 'POST', body: formData });
    await handleResponse(res);
    return await res.blob();
  },

  async convertExcelToPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/pdf/excel-to-pdf`, { method: 'POST', body: formData });
    await handleResponse(res);
    return await res.blob();
  },

  async convertPowerPointToPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/pdf/powerpoint-to-pdf`, { method: 'POST', body: formData });
    await handleResponse(res);
    return await res.blob();
  },

  async convertJpgToPdf(files) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`/api/pdf/jpg-to-pdf`, { method: 'POST', body: formData });
    await handleResponse(res);
    return await res.blob();
  },

  async convertPdfToJpg(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/pdf/pdf-to-jpg`, { method: 'POST', body: formData });
    await handleResponse(res);
    const contentType = res.headers.get('content-type') || '';
    const isZip = contentType.includes('zip');
    return { blob: await res.blob(), isZip };
  },

  async mergePdf(files) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`/api/pdf/merge`, { method: 'POST', body: formData });
    await handleResponse(res);
    return await res.blob();
  },

  async compressPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/pdf/compress`, { method: 'POST', body: formData });
    await handleResponse(res);
    return await res.blob();
  },

  async splitPdf(file, ranges = 'all') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ranges', ranges);
    const res = await fetch(`/api/pdf/split`, { method: 'POST', body: formData });
    await handleResponse(res);
    const contentType = res.headers.get('content-type') || '';
    const isZip = contentType.includes('zip');
    return { blob: await res.blob(), isZip };
  }
};
