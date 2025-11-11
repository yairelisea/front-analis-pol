// src/lib/pdfDownloader.js

import { API_BASE } from '../config';

/**
 * Descarga un PDF desde el backend
 * @param {string} endpoint - Endpoint del backend (ej: '/smart-report-pdf', '/daily-summary-pdf')
 * @param {Object} payload - Datos a enviar (objeto JSON o query params)
 * @param {string} filename - Nombre del archivo a descargar
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Blob>} - Blob del PDF descargado
 */
export async function downloadPDF({
  endpoint,
  payload = null,
  filename = 'reporte.pdf',
  method = 'POST',
  onProgress = null,
  onError = null,
  onSuccess = null
}) {
  try {
    // Notificar inicio
    if (onProgress) onProgress('Generando PDF...');

    let url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {}
    };

    // Si es GET, agregar query params
    if (method === 'GET' && payload) {
      const params = new URLSearchParams(payload);
      url = `${url}?${params.toString()}`;
    }

    // Si es POST, agregar body
    if (method === 'POST' && payload) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Error al generar el PDF';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const blob = await response.blob();

    // Descargar automáticamente
    const urlObject = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObject;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlObject);

    // Notificar éxito
    if (onSuccess) onSuccess(blob);

    return blob;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    if (onError) onError(error.message);
    throw error;
  }
}

/**
 * Descarga PDF del Smart Report (Weekly Report)
 * @param {Object} reportData - Datos del reporte (politician, results, summary, metadata)
 * @param {Function} callbacks - Callbacks para progreso, éxito y error
 */
export async function downloadSmartReportPDF(reportData, callbacks = {}) {
  const filename = `reporte_semanal_${(reportData.politician?.name || reportData.actor || 'actor').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  return downloadPDF({
    endpoint: '/smart-report-pdf',
    payload: reportData,
    filename,
    method: 'POST',
    ...callbacks
  });
}

/**
 * Descarga PDF del Daily Summary
 * @param {string} actorName - Nombre del político/actor
 * @param {Function} callbacks - Callbacks para progreso, éxito y error
 */
export async function downloadDailySummaryPDF(actorName, callbacks = {}) {
  const filename = `reporte_diario_${actorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  return downloadPDF({
    endpoint: '/daily-summary-pdf',
    payload: { q: actorName },
    filename,
    method: 'GET',
    ...callbacks
  });
}

/**
 * Descarga PDF genérico (render-pdf)
 * @param {Object} data - Datos completos del reporte
 * @param {Function} callbacks - Callbacks para progreso, éxito y error
 */
export async function downloadGenericPDF(data, callbacks = {}) {
  const filename = `percepcion_${(data.politician?.name || data.actor || 'reporte').replace(/\s+/g, '_')}.pdf`;

  return downloadPDF({
    endpoint: '/render-pdf',
    payload: data,
    filename,
    method: 'POST',
    ...callbacks
  });
}
