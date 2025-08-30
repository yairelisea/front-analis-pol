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

  // --- NUEVO: estado y refs para progreso (UI simulada) ---
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  const startFakeProgress = useCallback((urlsLen) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(0);
    const targetSeconds = Math.min(60, Math.max(12, urlsLen * 2)); // 2s por URL hasta 60s
    const stepMs = 300;
    const totalSteps = Math.floor((targetSeconds * 1000) / stepMs);
    const increment = 90 / Math.max(1, totalSteps); // hasta 90%
    progressTimer.current = setInterval(() => {
      setProgress((p) => Math.min(90, p + increment));
    }, stepMs);
  }, []);

  const finishProgress = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setProgress(100);
    setTimeout(() => setProgress(0), 800);
  }, []);

  const resetProgress = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setProgress(0);
  }, []);
  // --- fin progreso ---

  // Normaliza: 1 URL por línea, añade https si falta, ignora líneas con 0 o >1 URLs, elimina duplicados
  // REEMPLAZO: normalizeUrls más permisiva (soporta \n , ;)
  const normalizeUrls = useCallback((text) => {
    if (!text) return [];
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
      startFakeProgress(urls.length);

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
      finishProgress();
    } catch (err) {
      console.error('Error en el análisis:', err);
      toast({ title: 'Error en el análisis', description: err.message || 'No se pudo completar el análisis.', variant: 'destructive' });
      resetProgress();
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, normalizeUrls, toast, startFakeProgress, finishProgress, resetProgress]);

  const handleNewAnalysis = () => {
    setView('form');
    setData(null);
    setFormData({ name: '', office: '', urls: '' });
    setUrlCount(0);
    resetProgress();
  };

  // --- NUEVO: resumen de sentimientos (para mostrar en ResultsView) ---
  const getSentimentSummary = useMemo(() => {
    if (!data?.results) return null;
    const sentiments = data.results.reduce((acc, item) => {
      const s = item.ai?.sentiment?.toLowerCase();
      if (s) acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const total = Object.values(sentiments).reduce((a,b)=>a+b,0);
    const predominant = Object.entries(sentiments).reduce((a,b)=> a[1]>b[1]?a:b, ['',0])[0];
    return { sentiments, total, predominant };
  }, [data]);
  // --- fin resumen ---

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
        {/* NUEVO: meta description */}
        <meta name="description" content="Herramienta para analizar la percepción digital de figuras políticas a partir de URLs públicas." />
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

                  {/* NUEVO: barra de progreso simple */}
                  {isAnalyzing && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Analizando…</span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%`, transition: 'width 300ms ease' }} />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Aproximado: {Math.min(urlCount, Math.max(1, Math.round((progress/100) * urlCount)))} / {urlCount} URLs
                      </div>
                    </div>
                  )}

                  <InstructionsSection minRequired={MIN_REQUIRED} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ResultsView
                  politicianName={data?.politician?.name || formData.name}
                  results={data?.results || []}
                  summary={data?.summary || null}
                  sentimentSummary={getSentimentSummary} // NUEVO prop
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