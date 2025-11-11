# 📄 Guía de Generación de PDFs en el Frontend

Esta guía explica cómo usar la funcionalidad de descarga de PDFs en la aplicación.

## 📋 Tabla de Contenidos

1. [Endpoints Disponibles](#endpoints-disponibles)
2. [Utilidades JavaScript](#utilidades-javascript)
3. [Componente React Reutilizable](#componente-react-reutilizable)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Integración en Componentes Existentes](#integración-en-componentes-existentes)
6. [Troubleshooting](#troubleshooting)

---

## 🔌 Endpoints Disponibles

### 1. `/smart-report-pdf` - Reporte Semanal/Smart Report

**Método:** `POST`

**Payload:**
```javascript
{
  politician: {
    name: "Juan Pérez",
    office: "Alcalde"  // Opcional
  },
  results: [
    {
      meta: {
        title: "Título de la publicación",
        url: "https://...",
        published_at: "2025-11-10",
        platform: "web"
      },
      ai: {
        summary: "Resumen de IA...",
        sentiment: "positive",
        topic: "Economía",
        stance: "favor"
      }
    }
    // ... más results
  ],
  summary: {
    total: 10,
    sentiments: { positive: 5, neutral: 3, negative: 2 },
    predominant: "positive",
    stances: { favor: 4, neutral: 3, against: 3 },
    top_entities: ["Entidad 1 (5)", "Entidad 2 (3)"],
    short_text: "Resumen general..."
  },
  metadata: {
    is_cached: false,
    analysis_date: "2025-11-10T12:00:00Z"
  }
}
```

**Respuesta:** Archivo PDF (binary)

---

### 2. `/daily-summary-pdf` - Reporte Diario

**Método:** `GET`

**Query Parameters:**
- `q`: Nombre del político (requerido)

**Ejemplo:**
```
GET /daily-summary-pdf?q=Juan%20Pérez
```

**Respuesta:** Archivo PDF (binary)

---

### 3. `/render-pdf` - Generación Genérica de PDF

**Método:** `POST`

**Payload:**
```javascript
{
  politician: {
    name: "Juan Pérez",
    office: "Alcalde"
  },
  results: [...],
  summary: {...}
}
```

**Respuesta:** Archivo PDF (binary)

---

## 🛠️ Utilidades JavaScript

### Archivo: `src/lib/pdfDownloader.js`

#### Función Principal: `downloadPDF()`

```javascript
import { downloadPDF } from '../lib/pdfDownloader';

await downloadPDF({
  endpoint: '/smart-report-pdf',
  payload: reportData,
  filename: 'reporte.pdf',
  method: 'POST',
  onProgress: (message) => console.log(message),
  onSuccess: (blob) => console.log('PDF descargado', blob),
  onError: (error) => console.error('Error', error)
});
```

#### Funciones Especializadas

**1. Smart Report PDF**
```javascript
import { downloadSmartReportPDF } from '../lib/pdfDownloader';

await downloadSmartReportPDF(reportData, {
  onProgress: (msg) => console.log(msg),
  onSuccess: (blob) => console.log('Éxito'),
  onError: (err) => console.error(err)
});
```

**2. Daily Summary PDF**
```javascript
import { downloadDailySummaryPDF } from '../lib/pdfDownloader';

await downloadDailySummaryPDF('Juan Pérez', {
  onSuccess: () => alert('PDF descargado'),
  onError: (err) => alert(err)
});
```

**3. Generic PDF**
```javascript
import { downloadGenericPDF } from '../lib/pdfDownloader';

await downloadGenericPDF(data, {
  onSuccess: () => console.log('Listo')
});
```

---

## 🧩 Componente React Reutilizable

### Archivo: `src/components/PDFDownloadButton.jsx`

#### Uso Básico

```jsx
import PDFDownloadButton from '@/components/PDFDownloadButton';

function MiComponente() {
  return (
    <PDFDownloadButton
      endpoint="/smart-report-pdf"
      payload={reportData}
      filename="reporte_semanal.pdf"
      label="Descargar Reporte"
    />
  );
}
```

#### Props Disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `endpoint` | `string` | - | Endpoint del backend (requerido) |
| `payload` | `Object` | `null` | Datos a enviar |
| `filename` | `string` | `'reporte.pdf'` | Nombre del archivo |
| `method` | `string` | `'POST'` | Método HTTP |
| `label` | `string` | `'Descargar PDF'` | Texto del botón |
| `variant` | `string` | `'default'` | Variante del botón |
| `size` | `string` | `'default'` | Tamaño del botón |
| `icon` | `Component` | `Download` | Ícono personalizado |
| `className` | `string` | `''` | Clases CSS adicionales |
| `disabled` | `boolean` | `false` | Deshabilitar botón |
| `onSuccess` | `Function` | `null` | Callback de éxito |
| `onError` | `Function` | `null` | Callback de error |

---

## 💡 Ejemplos de Uso

### Ejemplo 1: ResultsView / Dashboard

```jsx
import PDFDownloadButton from '@/components/PDFDownloadButton';
import { Download } from 'lucide-react';

function ResultsView({ reportData }) {
  return (
    <div>
      <h1>Reporte Semanal</h1>

      {/* Botón de descarga */}
      <PDFDownloadButton
        endpoint="/smart-report-pdf"
        payload={reportData}
        filename={`reporte_semanal_${reportData.politician.name}.pdf`}
        label="Descargar PDF"
        variant="default"
        size="lg"
      />

      {/* Contenido del reporte */}
      <div>{/* ... */}</div>
    </div>
  );
}
```

### Ejemplo 2: Daily Report

```jsx
import PDFDownloadButton from '@/components/PDFDownloadButton';

function DailyReport({ actorName }) {
  return (
    <div>
      <h1>Reporte Diario - {actorName}</h1>

      {/* Botón de descarga */}
      <PDFDownloadButton
        endpoint="/daily-summary-pdf"
        payload={{ q: actorName }}
        filename={`reporte_diario_${actorName}.pdf`}
        method="GET"
        label="Descargar Reporte Diario"
        variant="outline"
      />

      {/* Contenido del reporte */}
      <div>{/* ... */}</div>
    </div>
  );
}
```

### Ejemplo 3: Con Callbacks Personalizados

```jsx
import PDFDownloadButton from '@/components/PDFDownloadButton';

function MiComponente() {
  const handleSuccess = (blob) => {
    console.log('PDF generado exitosamente', blob);
    // Enviar analítica, mostrar modal, etc.
  };

  const handleError = (error) => {
    console.error('Error al generar PDF', error);
    // Mostrar mensaje personalizado, reintentar, etc.
  };

  return (
    <PDFDownloadButton
      endpoint="/smart-report-pdf"
      payload={reportData}
      filename="reporte.pdf"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### Ejemplo 4: Función Directa (Sin Componente)

```jsx
import { downloadSmartReportPDF } from '../lib/pdfDownloader';
import { useToast } from '@/components/ui/use-toast';

function MiComponente() {
  const { toast } = useToast();

  const descargarPDF = async () => {
    try {
      await downloadSmartReportPDF(reportData, {
        onProgress: (msg) => toast({ title: 'Procesando...', description: msg }),
        onSuccess: () => toast({ title: '¡Éxito!', description: 'PDF descargado' }),
        onError: (err) => toast({ title: 'Error', description: err, variant: 'destructive' })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={descargarPDF}>
      Descargar PDF
    </button>
  );
}
```

---

## 🔧 Integración en Componentes Existentes

### En `ResultsView.jsx`

```jsx
import PDFDownloadButton from '@/components/PDFDownloadButton';

// Dentro del componente, en la sección de botones:
<div className="flex gap-3">
  <Button variant="outline" onClick={onNewAnalysis}>
    Nuevo Análisis
  </Button>

  {/* Agregar botón de PDF */}
  <PDFDownloadButton
    endpoint="/smart-report-pdf"
    payload={dashboardData._original || dashboardData}
    filename={`reporte_${dashboardData.actor}.pdf`}
    label="Descargar PDF"
  />
</div>
```

### En `DailyReport.jsx`

El componente ya tiene un botón de descarga. Si quieres usar el nuevo componente:

```jsx
import PDFDownloadButton from '@/components/PDFDownloadButton';

// Reemplazar el botón existente con:
<PDFDownloadButton
  endpoint="/daily-summary-pdf"
  payload={{ q: actorName }}
  filename={`reporte_diario_${actorName}.pdf`}
  method="GET"
  label={isDownloading ? 'Generando...' : 'Descargar'}
  variant="default"
  size="sm"
  className="bg-white text-emerald-600 hover:bg-gray-50"
/>
```

---

## 🐛 Troubleshooting

### Problema 1: Error 404 - Endpoint no encontrado

**Síntoma:** `GET /smart-report-pdf 404 (Not Found)`

**Solución:**
- Verifica que el backend esté corriendo
- Confirma que el endpoint existe en el backend
- Revisa la configuración de `API_BASE` en `src/config.js`

### Problema 2: Error CORS

**Síntoma:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solución:**
- Verifica que `API_BASE` apunte al servidor correcto
- Asegúrate de que el backend tenga CORS habilitado
- Confirma que estés usando `API_BASE` en lugar de rutas relativas

### Problema 3: PDF no se descarga

**Síntoma:** No aparece el diálogo de descarga

**Solución:**
```javascript
// Verifica que el blob sea válido
const blob = await response.blob();
console.log('Blob type:', blob.type); // Debe ser 'application/pdf'
console.log('Blob size:', blob.size); // Debe ser > 0
```

### Problema 4: Payload incorrecto

**Síntoma:** `Error 422 - Unprocessable Entity`

**Solución:**
- Verifica que el payload tenga todos los campos requeridos
- Confirma que la estructura coincida con lo esperado por el backend
- Revisa los logs de consola para ver qué datos se están enviando

### Problema 5: Timeout en generación de PDF

**Síntoma:** La petición toma demasiado tiempo y falla

**Solución:**
```javascript
// Aumentar timeout en fetch
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

fetch(url, {
  ...options,
  signal: controller.signal
});
```

---

## 📝 Checklist de Implementación

- [ ] Importar `PDFDownloadButton` en tu componente
- [ ] Definir el `endpoint` correcto
- [ ] Preparar el `payload` con los datos necesarios
- [ ] Configurar el `filename` dinámicamente
- [ ] Agregar callbacks `onSuccess` y `onError` si es necesario
- [ ] Probar la descarga con datos reales
- [ ] Verificar que el PDF se genere correctamente
- [ ] Manejar estados de loading y errores
- [ ] Agregar feedback visual al usuario (toast, spinner, etc.)

---

## 🎯 Próximos Pasos

1. **Implementa el botón en tus componentes** usando `PDFDownloadButton`
2. **Prueba la descarga** con datos reales del backend
3. **Personaliza el diseño** según tu UI/UX
4. **Agrega analíticas** en los callbacks para rastrear descargas
5. **Optimiza el rendimiento** si los PDFs son muy grandes

---

## 📚 Referencias

- Componente: `src/components/PDFDownloadButton.jsx`
- Utilidades: `src/lib/pdfDownloader.js`
- Configuración: `src/config.js`
- Documentación Backend: Consulta la documentación del backend para detalles de los endpoints

---

**¿Necesitas ayuda?** Revisa los ejemplos o consulta la sección de troubleshooting.
