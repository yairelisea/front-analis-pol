# Guía para Generar PDFs desde el Frontend

## 📋 Descripción General

Se han agregado 3 nuevos endpoints para generar PDFs de los reportes. Todos mantienen el mismo formato visual que los reportes existentes.

---

## 🔗 Endpoints Disponibles

### 1. Smart Report PDF
**Endpoint:** `POST /smart-report-pdf` o `POST /api/smart-report-pdf`

**Descripción:** Genera un PDF del reporte inteligente (smart report)

**Uso:**
```javascript
const generateSmartReportPDF = async (reportData) => {
  try {
    const response = await fetch('http://tu-api.com/api/smart-report-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        politician: reportData.politician,
        results: reportData.results,  // o reportData.posts
        summary: reportData.summary
      })
    });

    if (!response.ok) throw new Error('Error generando PDF');

    // Convertir la respuesta a blob
    const blob = await response.blob();

    // Crear URL para descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_report_${reportData.politician.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 2. Daily Summary PDF
**Endpoint:** `POST /daily-summary-pdf` o `POST /api/daily-summary-pdf`

**Descripción:** Genera un PDF del resumen diario

**Uso:**
```javascript
const generateDailySummaryPDF = async (dailyData) => {
  try {
    const response = await fetch('http://tu-api.com/api/daily-summary-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        politician: dailyData.politician,
        results: dailyData.results,  // o dailyData.posts
        summary: dailyData.summary
      })
    });

    if (!response.ok) throw new Error('Error generando PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily_summary_${dailyData.politician.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 3. Weekly Report PDF
**Endpoint:** `POST /weekly-report-pdf` o `POST /api/weekly-report-pdf`

**Descripción:** Genera un PDF del reporte semanal

**Uso:**
```javascript
const generateWeeklyReportPDF = async (weeklyData) => {
  try {
    const response = await fetch('http://tu-api.com/api/weekly-report-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        politician: weeklyData.politician,
        results: weeklyData.results,  // o weeklyData.posts
        summary: weeklyData.summary
      })
    });

    if (!response.ok) throw new Error('Error generando PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weekly_report_${weeklyData.politician.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📦 Estructura del Payload

Todos los endpoints esperan el mismo formato de datos:

```typescript
interface PDFPayload {
  politician: {
    name: string;
    office?: string;
  };
  results: Array<{
    meta: {
      platform: string;
      url: string;
      title?: string;
      description?: string;
      author_name?: string;
      published_at?: string;
      thumbnail_url?: string;
      debug?: string;
    };
    ai: {
      summary: string;
      topic: string;
      subtopics: string[];
      sentiment: 'positive' | 'negative' | 'neutral';
      stance: string;
      entities: string[];
      toxicity: number;
      risk_note?: string;
      opportunities: string[];
    };
  }>;
  summary: {
    short_text: string;
    total_posts?: number;
    sentiment_positive?: number;
    sentiment_negative?: number;
    sentiment_neutral?: number;
    // ... otros campos del summary
  };
}
```

---

## 🎨 Componente React de Ejemplo

Aquí hay un componente completo de React que puedes usar:

```tsx
import React from 'react';

interface ReportData {
  politician: { name: string; office?: string };
  results: any[];
  summary: any;
}

const PDFDownloadButton: React.FC<{
  reportData: ReportData;
  type: 'smart' | 'daily' | 'weekly'
}> = ({ reportData, type }) => {
  const [loading, setLoading] = React.useState(false);

  const endpointMap = {
    smart: '/api/smart-report-pdf',
    daily: '/api/daily-summary-pdf',
    weekly: '/api/weekly-report-pdf'
  };

  const labelMap = {
    smart: 'Smart Report',
    daily: 'Resumen Diario',
    weekly: 'Reporte Semanal'
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}${endpointMap[type]}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            politician: reportData.politician,
            results: reportData.results,
            summary: reportData.summary
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error generando PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${reportData.politician.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadPDF}
      disabled={loading}
      className="pdf-download-btn"
    >
      {loading ? 'Generando...' : `Descargar ${labelMap[type]} (PDF)`}
    </button>
  );
};

export default PDFDownloadButton;
```

---

## 📝 Uso en tu Componente

### Ejemplo 1: En el componente de Smart Report

```tsx
import PDFDownloadButton from './PDFDownloadButton';

const SmartReportComponent = () => {
  const [reportData, setReportData] = useState(null);

  // ... tu lógica para obtener el reporte

  return (
    <div>
      {reportData && (
        <>
          {/* Tu contenido del reporte */}
          <div className="report-content">
            {/* ... */}
          </div>

          {/* Botón de descarga PDF */}
          <PDFDownloadButton
            reportData={reportData}
            type="smart"
          />
        </>
      )}
    </div>
  );
};
```

### Ejemplo 2: En el componente de Daily Summary

```tsx
const DailySummaryComponent = () => {
  const [dailyData, setDailyData] = useState(null);

  // ... tu lógica para obtener el resumen diario

  return (
    <div>
      {dailyData && (
        <>
          <div className="summary-content">
            {/* ... */}
          </div>

          <PDFDownloadButton
            reportData={dailyData}
            type="daily"
          />
        </>
      )}
    </div>
  );
};
```

---

## ⚡ Función Utilitaria Reutilizable

Si prefieres una función más simple:

```javascript
/**
 * Descarga un PDF desde el backend
 * @param {string} endpoint - Uno de: 'smart-report-pdf', 'daily-summary-pdf', 'weekly-report-pdf'
 * @param {object} data - Objeto con politician, results y summary
 * @param {string} filename - Nombre del archivo a descargar
 */
export const downloadReportPDF = async (endpoint, data, filename) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return { success: false, error };
  }
};

// Uso:
// await downloadReportPDF('smart-report-pdf', reportData, 'mi_reporte.pdf');
```

---

## 🚀 Integración Rápida

Si ya tienes los datos del reporte en tu componente, simplemente:

1. **Importa el fetch del navegador** (ya disponible)
2. **Agrega un botón** con onClick
3. **Llama al endpoint** con los datos que ya tienes
4. **Descarga el PDF** automáticamente

```jsx
<button onClick={() => {
  fetch('/api/smart-report-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(myReportData)
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte.pdf';
    a.click();
  });
}}>
  Descargar PDF
</button>
```

---

## ✅ Checklist de Implementación

- [ ] Verificar que tienes los datos completos (politician, results, summary)
- [ ] Configurar la URL base de tu API (`process.env.REACT_APP_API_URL`)
- [ ] Agregar botón de descarga en tu componente
- [ ] Probar la descarga del PDF
- [ ] Manejar estados de loading y errores
- [ ] Verificar que el nombre del archivo es correcto
- [ ] (Opcional) Agregar validación antes de generar el PDF

---

## 🎯 Notas Importantes

1. **Los PDFs mantienen el mismo formato visual** que los reportes existentes
2. **Acepta tanto `results` como `posts`** en el payload (son intercambiables)
3. **Los endpoints tienen prefijos** `/api/` para compatibilidad con el frontend
4. **El PDF se descarga automáticamente** con el nombre apropiado
5. **No necesitas configurar nada adicional** en el backend, está listo para usar

---

## 🆘 Troubleshooting

### Error: CORS
Si ves errores de CORS, verifica que tu backend tiene configurado CORS correctamente. El backend ya tiene CORS habilitado.

### Error: 400 Bad Request
Verifica que estás enviando todos los campos requeridos: `politician`, `results`, y `summary`.

### PDF vacío
Asegúrate de que `results` no esté vacío y tenga la estructura correcta.

### No se descarga el PDF
Verifica que el `Content-Type` de la respuesta sea `application/pdf` y que el status sea 200.

---

## 📞 Endpoints Relacionados

Para obtener los datos necesarios para generar el PDF:

- `POST /api/smart-report` → Obtener datos del smart report
- `GET /api/daily-summary?q=nombre` → Obtener datos del resumen diario
- `GET /api/weekly-report?q=nombre` → Obtener datos del reporte semanal

Ejemplo de flujo completo:

```javascript
// 1. Obtener los datos
const response = await fetch('/api/smart-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ politician, urls, force_new })
});
const reportData = await response.json();

// 2. Generar PDF con esos datos
const pdfResponse = await fetch('/api/smart-report-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportData)
});
const blob = await pdfResponse.blob();
// ... descargar
```
