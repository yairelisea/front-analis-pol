// src/components/PDFDownloadButton.jsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { downloadPDF } from '../lib/pdfDownloader';

/**
 * Componente reutilizable para descargar PDFs
 *
 * @example
 * // Smart Report PDF
 * <PDFDownloadButton
 *   endpoint="/smart-report-pdf"
 *   payload={reportData}
 *   filename="reporte_semanal.pdf"
 *   label="Descargar Reporte Semanal"
 * />
 *
 * @example
 * // Daily Summary PDF
 * <PDFDownloadButton
 *   endpoint="/daily-summary-pdf"
 *   payload={{ q: "Juan Pérez" }}
 *   filename="reporte_diario.pdf"
 *   method="GET"
 *   label="Descargar Reporte Diario"
 * />
 */
const PDFDownloadButton = ({
  endpoint,
  payload,
  filename = 'reporte.pdf',
  method = 'POST',
  label = 'Descargar PDF',
  variant = 'default',
  size = 'default',
  icon: CustomIcon = Download,
  className = '',
  disabled = false,
  onSuccess = null,
  onError = null
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!payload && method === 'POST') {
      toast({
        title: 'Error',
        description: 'No hay datos para generar el PDF.',
        variant: 'destructive'
      });
      return;
    }

    setIsDownloading(true);

    try {
      await downloadPDF({
        endpoint,
        payload,
        filename,
        method,
        onProgress: (message) => {
          toast({
            title: 'Generando PDF...',
            description: message
          });
        },
        onSuccess: (blob) => {
          toast({
            title: '¡Éxito!',
            description: 'El PDF se ha descargado correctamente.'
          });
          if (onSuccess) onSuccess(blob);
        },
        onError: (errorMessage) => {
          toast({
            title: 'Error al generar PDF',
            description: errorMessage,
            variant: 'destructive'
          });
          if (onError) onError(errorMessage);
        }
      });
    } catch (error) {
      // El error ya fue manejado en onError
      console.error('PDF download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      variant={variant}
      size={size}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <CustomIcon className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
};

export default PDFDownloadButton;
