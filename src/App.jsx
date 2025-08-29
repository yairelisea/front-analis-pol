import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import FormSection from '@/components/FormSection';
import InstructionsSection from '@/components/InstructionsSection';
import ResultsView from '@/components/ResultsView';

// URL de la API (Netlify: define VITE_API_BASE en Environment Variables)
const API_BASE = import.meta.env.VITE_API_BASE || 'https://analisis-pol-b1ap.onrender.com';

function App() {
  const [view, setView] = useState('form'); // 'form' or 'results'
  const [formData, setFormData] = useState({ name: '', office: '', urls: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [urlCount, setUrlCount] = useState(0);
  const { toast } = useToast();
  const resultsRef = useRef(null);

  // Normaliza el textarea a arreglo de URLs con http(s)
  const normalizeUrls = useCallback((text) => {
    return text
      .split(/\n|,|;/)
      .map(u => u.trim())
      .filter(Boolean)
      .map(u => (u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`));
  }, []);

  const handleUrlsChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, urls: value }));
    const urls = normalizeUrls(value);
    setUrlCount(urls.length);
  }, [normalizeUrls]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const urls = normalizeUrls(formData.urls);

    if (!formData.name.trim()) {
      toast({ title: "Error de validación", description: "El nombre del personaje es obligatorio", variant: "destructive" });
      return;
    }
    // ✅ mínimo 25 URLs
    if (urls.length < 25) {
      toast({ title: "URLs insuficientes", description: `Se requieren al menos 25 URLs. Actualmente tienes ${urls.length}.`, variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const payload = { politician: { name: formData.name.trim(), office: formData.office.trim() || undefined }, urls };
      const response = await fetch(`${API_BASE}/analyze-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido del servidor');
        throw new Error(errorText || `Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setView('results');
      toast({ title: "¡Análisis completado!", description: `Se analizaron ${data.results?.length || 0} URLs exitosamente.` });
    } catch (error) {
      console.error('Error en el análisis:', error);
      console.log("API analyze-json →", data);
      console.log("results length:", data?.results?.length);
      toast({ title: "Error en el análisis", description: error.message || "No se pudo completar el análisis.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, normalizeUrls, toast]);

  const handleNewAnalysis = () => {
    setView('form');
    setResults(null);
    setFormData({ name: '', office: '', urls: '' });
    setUrlCount(0);
  };

  // ✅ descarga PDF desde el backend
  const handleDownloadPdf = useCallback(async () => {
    const urls = normalizeUrls(formData.urls);

    if (!formData.name.trim()) {
      toast({ title: "Error de validación", description: "El nombre del personaje es obligatorio", variant: "destructive" });
      return;
    }
    if (urls.length < 25) {
      toast({ title: "URLs insuficientes", description: `Se requieren al menos 25 URLs. Actualmente tienes ${urls.length}.`, variant: "destructive" });
      return;
    }

    try {
      toast({ title: "Generando PDF...", description: "Esto puede tardar unos segundos." });
      const payload = { politician: { name: formData.name.trim(), office: formData.office.trim() || undefined }, urls };
      const res = await fetch(`${API_BASE}/analyze-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Error desconocido del servidor');
        throw new Error(errorText || `Error del servidor: ${res.status}`);
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `percepcion_${formData.name.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(href);
      toast({ title: "¡PDF descargado!", description: "El reporte del análisis se ha guardado." });
    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast({ title: "Error al generar PDF", description: err.message || "No se pudo crear el archivo PDF.", variant: "destructive" });
    }
  }, [formData, normalizeUrls, toast]);

  const getSentimentSummary = useMemo(() => {
    if (!results?.results) return null;
    const sentiments = results.results.reduce((acc, item) => {
      const sentiment = item.ai?.sentiment?.toLowerCase();
      if (sentiment) acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    const total = Object.values(sentiments).reduce((sum, count) => sum + count, 0);
    const predominantEntry = Object.entries(sentiments).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    const predominant = predominantEntry[0];
    return { sentiments, total, predominant };
  }, [results]);

  const getBadgeVariant = useCallback((type, value) => {
    if (type === 'sentiment') {
      switch (value?.toLowerCase()) {
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
        <meta name="description" content="Herramienta avanzada para analizar la percepción digital de figuras políticas a través del análisis de múltiples fuentes web." />
        <meta property="og:title" content="Percepción Digital — Analizador de Percepción Política" />
        <meta property="og:description" content="Herramienta avanzada para analizar la percepción digital de figuras políticas a través del análisis de múltiples fuentes web." />
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
                  />
                  <InstructionsSection />
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ResultsView
                  politicianName={formData.name}
                  results={results}
                  sentimentSummary={getSentimentSummary}
                  getBadgeVariant={getBadgeVariant}
                  formatDate={formatDate}
                  onNewAnalysis={handleNewAnalysis}
                  onDownloadPdf={handleDownloadPdf}   // descarga desde backend
                  resultsRef={resultsRef}              // ref opcional para tu layout
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