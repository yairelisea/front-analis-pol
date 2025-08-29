import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import FormSection from '@/components/FormSection';
import InstructionsSection from '@/components/InstructionsSection';
import ResultsView from '@/components/ResultsView';

// URL de la API (Netlify / local)
const API_BASE = import.meta.env.VITE_API_BASE || 'https://analisis-pol-b1ap.onrender.com';
const MIN_REQUIRED = 25;

function App() {
  const [view, setView] = useState('form'); // 'form' or 'results'
  const [formData, setFormData] = useState({ name: '', office: '', urls: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState(null); // { politician, results, summary }
  const [urlCount, setUrlCount] = useState(0);
  const { toast } = useToast();
  const resultsRef = useRef(null);

  // Normaliza: 1 URL por línea, añade https si falta, ignora líneas con 0 o >1 URLs, elimina duplicados
  const normalizeUrls = useCallback((text) => {
    if (!text) return [];
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const urls = [];
    for (const ln of lines) {
      const hits = ln.match(/https?:\/\/\S+|(?:www\.)\S+/g) || [];
      if (hits.length === 1) {
        let u = hits[0];
        if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
        urls.push(u);
      }
      // si hits.length === 0 o >1 => ignorar línea
    }
    return Array.from(new Set(urls));
  }, []);

  const handleUrlsChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, urls: value }));
    const urls = normalizeUrls(value);
    setUrlCount(urls.length);
  }, [normalizeUrls]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    const urls = normalizeUrls(formData.urls);

    if (!formData.name.trim()) {
      toast({ title: 'Error de validación', description: 'El nombre del personaje es obligatorio', variant: 'destructive' });
      return;
    }
    if (urls.length < MIN_REQUIRED) {
      toast({ title: 'URLs insuficientes', description: `Se requieren al menos ${MIN_REQUIRED} URLs. Actualmente tienes ${urls.length}.`, variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    setData(null);

    try {
      const payload = { politician: { name: formData.name.trim(), office: formData.office.trim() || undefined }, urls };

      const response = await fetch(`${API_BASE}/analyze-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Error desconocido del servidor');
        throw new Error(errText || `Error del servidor: ${response.status}`);
      }

      const json = await response.json();
      // json expected: { politician, results, summary }
      console.log('analyze-json →', json);
      setData(json);
      setView('results');
      toast({ title: '¡Análisis completado!', description: `Se analizaron ${json.results?.length || 0} publicaciones.` });
    } catch (err) {
      console.error('Error en el análisis:', err);
      toast({ title: 'Error en el análisis', description: err.message || 'No se pudo completar el análisis.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, normalizeUrls, toast]);

  const handleNewAnalysis = () => {
    setView('form');
    setData(null);
    setFormData({ name: '', office: '', urls: '' });
    setUrlCount(0);
  };

  // descarga PDF (backend genera y devuelve blob)
  const handleDownloadPdf = useCallback(async () => {
    const urls = normalizeUrls(formData.urls);
    const politicianName = (data?.politician?.name || formData.name || '').trim();

    if (!politicianName) {
      toast({ title: 'Error de validación', description: 'El nombre del personaje es obligatorio', variant: 'destructive' });
      return;
    }
    if (urls.length < MIN_REQUIRED) {
      toast({ title: 'URLs insuficientes', description: `Se requieren al menos ${MIN_REQUIRED} URLs. Actualmente tienes ${urls.length}.`, variant: 'destructive' });
      return;
    }

    try {
      toast({ title: 'Generando PDF...', description: 'Esto puede tardar unos segundos.' });
      const payload = { politician: { name: politicianName, office: formData.office.trim() || undefined }, urls };
      const res = await fetch(`${API_BASE}/analyze-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Error desconocido del servidor');
        throw new Error(errText || `Error del servidor: ${res.status}`);
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      const safeName = politicianName.replace(/\s+/g, '_') || 'reporte';
      a.download = `percepcion_${safeName}.pdf`;
      a.click();
      URL.revokeObjectURL(href);
      toast({ title: '¡PDF descargado!', description: 'El reporte del análisis se ha guardado.' });
    } catch (err) {
      console.error('Error al generar PDF:', err);
      toast({ title: 'Error al generar PDF', description: err.message || 'No se pudo crear el archivo PDF.', variant: 'destructive' });
    }
  }, [formData, normalizeUrls, data, toast]);

  const getBadgeVariant = useCallback((type, value) => {
    if (type === 'sentiment') {
      switch ((value || '').toLowerCase()) {
        case 'positive': return 'positive';
        case 'negative': return 'destructive';
        case 'neutral': return 'secondary';
        default: return 'secondary';
      }
    }
    return 'default';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Percepción Digital — Analizador de Percepción Política</title>
      </Helmet>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">Percepción Digital</h1>
            <p className="text-xl text-gray-700">Analizador simple</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {view === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-8">
                  <FormSection
                    formData={formData}
                    setFormData={setFormData}
                    handleUrlsChange={handleUrlsChange}
                    handleSubmit={handleSubmit}
                    isAnalyzing={isAnalyzing}
                    urlCount={urlCount}
                    minRequired={MIN_REQUIRED}
                  />
                  <InstructionsSection minRequired={MIN_REQUIRED} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ResultsView
                  politicianName={data?.politician?.name || formData.name}
                  results={data?.results || []}
                  summary={data?.summary || null}
                  getBadgeVariant={getBadgeVariant}
                  formatDate={formatDate}
                  onNewAnalysis={handleNewAnalysis}
                  onDownloadPdf={handleDownloadPdf}
                  resultsRef={resultsRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Toaster />
    </>
  );
}

export default App;