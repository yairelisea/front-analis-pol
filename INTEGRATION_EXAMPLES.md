# 🔌 Ejemplos de Integración de PDFs

Este archivo muestra cómo integrar la funcionalidad de PDF en los componentes existentes.

---

## 📊 Integración en ResultsView.jsx

### Opción 1: Usando el Componente PDFDownloadButton (Recomendado)

```jsx
// Agregar import al inicio del archivo
import PDFDownloadButton from '@/components/PDFDownloadButton';

// Dentro del componente WeeklyReport, en la sección de botones (línea ~352-363):

<div className="flex gap-3">
  <Button
    variant="outline"
    size="lg"
    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
    onClick={onNewAnalysis}
  >
    Nuevo Análisis
  </Button>

  <Button
    variant="outline"
    size="lg"
    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
    onClick={handleRefresh}
    disabled={refreshing}
  >
    <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
    Actualizar
  </Button>

  {/* NUEVO: Botón de descarga PDF */}
  <PDFDownloadButton
    endpoint="/smart-report-pdf"
    payload={dashboardData._rawData || dashboardData}
    filename={`reporte_${dashboardData.actor}_${new Date().toISOString().split('T')[0]}.pdf`}
    label="Descargar PDF"
    variant="default"
    size="lg"
    className="bg-brand-green hover:bg-emerald-600 text-white shadow-lg"
  />

  <Button
    size="lg"
    className="bg-brand-green hover:bg-emerald-600 text-white shadow-lg"
    onClick={() => handleNavigate('/user/campaigns/new')}
  >
    <PlusCircle className="h-5 w-5 mr-2" />
    Nueva Campaña
  </Button>
</div>
```

### Opción 2: Usando la Función Directa

```jsx
// Agregar imports al inicio
import { downloadSmartReportPDF } from '../lib/pdfDownloader';
import { Download } from 'lucide-react';

// Agregar función dentro del componente WeeklyReport:
const handleDownloadPDF = async () => {
  try {
    await downloadSmartReportPDF(dashboardData._rawData || dashboardData, {
      onProgress: () => {
        // Ya hay toast automático, pero puedes personalizar
      },
      onSuccess: () => {
        console.log('PDF descargado exitosamente');
      },
      onError: (err) => {
        console.error('Error al descargar PDF:', err);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

// Agregar botón en la sección de botones:
<Button
  size="lg"
  className="bg-white text-emerald-600 hover:bg-gray-50 shadow-lg"
  onClick={handleDownloadPDF}
>
  <Download className="h-5 w-5 mr-2" />
  Descargar PDF
</Button>
```

---

## 📅 Integración en DailyReport.jsx

### Opción 1: Reemplazar Botón Existente con PDFDownloadButton

El componente DailyReport.jsx ya tiene un botón de descarga. Para usar el nuevo componente:

```jsx
// Agregar import al inicio
import PDFDownloadButton from '@/components/PDFDownloadButton';

// REEMPLAZAR el botón existente (línea ~324-332):
// Busca este código:
<Button
  size="sm"
  className="bg-white text-emerald-600 hover:bg-gray-50 shadow-lg font-semibold"
  onClick={handleDownload}
  disabled={isDownloading}
>
  <Download className="h-4 w-4 mr-2" />
  {isDownloading ? 'Generando...' : 'Descargar'}
</Button>

// REEMPLAZAR con:
<PDFDownloadButton
  endpoint="/daily-summary-pdf"
  payload={{ q: actorName }}
  filename={`reporte_diario_${actorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
  method="GET"
  label="Descargar"
  variant="default"
  size="sm"
  className="bg-white text-emerald-600 hover:bg-gray-50 shadow-lg font-semibold"
/>

// OPCIONAL: Puedes eliminar la función handleDownload existente y el estado isDownloading
// ya que PDFDownloadButton los maneja internamente
```

### Opción 2: Mantener la Implementación Actual

Si prefieres mantener la lógica existente, puedes simplemente importar y usar `downloadDailySummaryPDF` para simplificar el código:

```jsx
// Agregar import al inicio
import { downloadDailySummaryPDF } from '../lib/pdfDownloader';

// REEMPLAZAR la función handleDownload existente (línea ~245-279):
const handleDownload = async () => {
  if (!reportData) {
    toast({ title: 'Error', description: 'No hay datos para descargar.', variant: 'destructive' });
    return;
  }

  setIsDownloading(true);

  try {
    await downloadDailySummaryPDF(actorName, {
      onProgress: (msg) => toast({ title: 'Generando PDF...', description: msg }),
      onSuccess: () => toast({ title: '¡Éxito!', description: 'El PDF del reporte ha sido descargado.' }),
      onError: (err) => toast({ title: 'Error al descargar', description: err, variant: 'destructive' })
    });
  } catch (error) {
    console.error('Error downloading daily report PDF:', error);
  } finally {
    setIsDownloading(false);
  }
};
```

---

## 🎯 Integración en App.jsx

El componente App.jsx ya tiene `handleDownloadPdf`. Puedes simplificarlo:

### Antes (código actual):

```jsx
const handleDownloadPdf = useCallback(async () => {
  if (!data?.results?.length) {
    toast({ title: 'Nada que exportar', description: 'Aún no hay resultados.', variant: 'destructive' });
    return;
  }
  try {
    toast({ title: 'Generando PDF...', description: 'Esto puede tardar unos segundos.' });
    const res = await fetch(`${API_BASE}/render-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `percepcion_${(data.politician?.name || 'reporte').replace(/\s+/g,'_')}.pdf`;
    a.click();
    URL.revokeObjectURL(href);
    toast({ title: '¡PDF listo!', description: 'Se descargó el reporte.' });
  } catch (err) {
    toast({ title: 'Error al generar PDF', description: err.message, variant: 'destructive' });
  }
}, [data, toast]);
```

### Después (usando la utilidad):

```jsx
// Agregar import al inicio
import { downloadGenericPDF } from './lib/pdfDownloader';

const handleDownloadPdf = useCallback(async () => {
  if (!data?.results?.length) {
    toast({ title: 'Nada que exportar', description: 'Aún no hay resultados.', variant: 'destructive' });
    return;
  }

  try {
    await downloadGenericPDF(data, {
      onProgress: (msg) => toast({ title: 'Generando PDF...', description: msg }),
      onSuccess: () => toast({ title: '¡PDF listo!', description: 'Se descargó el reporte.' }),
      onError: (err) => toast({ title: 'Error al generar PDF', description: err, variant: 'destructive' })
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
}, [data, toast]);
```

---

## 📝 Resumen de Cambios

### Archivos a Modificar (Opcional):

1. **ResultsView.jsx** - Agregar botón de PDF
2. **DailyReport.jsx** - Opcionalmente reemplazar con PDFDownloadButton
3. **App.jsx** - Opcionalmente simplificar con downloadGenericPDF

### Imports Necesarios:

```jsx
// Para usar el componente
import PDFDownloadButton from '@/components/PDFDownloadButton';

// Para usar las funciones directamente
import {
  downloadPDF,
  downloadSmartReportPDF,
  downloadDailySummaryPDF,
  downloadGenericPDF
} from '../lib/pdfDownloader';
```

---

## 🚀 Próximos Pasos

1. ✅ Archivos creados:
   - `src/lib/pdfDownloader.js`
   - `src/components/PDFDownloadButton.jsx`
   - `FRONTEND_PDF_GUIDE.md`

2. 🔄 Opcional - Integrar en componentes existentes:
   - ResultsView.jsx (agregar botón)
   - DailyReport.jsx (simplificar código existente)
   - App.jsx (simplificar código existente)

3. 🧪 Probar:
   - Descargar PDF desde ResultsView
   - Descargar PDF desde DailyReport
   - Verificar que los archivos se descarguen correctamente

---

**Nota:** Todos los cambios son opcionales. Los componentes existentes seguirán funcionando. Los nuevos archivos están disponibles para cuando quieras usarlos o simplificar el código existente.
