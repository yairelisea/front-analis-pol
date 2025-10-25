import { API_BASE, MIN_URLS } from './config';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import FormSection from '@/components/FormSection';
import InstructionsSection from '@/components/InstructionsSection';
import ResultsView from '@/components/ResultsView';

// URL de la API (Netlify / local)

const MIN_REQUIRED = MIN_URLS;

function App() {
  const [view, setView] = useState('form'); // 'form' or 'results'
  const [formData, setFormData] = useState({ name: '', office: '', urls: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState(null); // { politician, results, summary }
  const [urlCount, setUrlCount] = useState(0);
  const { toast } = useToast();
  const resultsRef = useRef(null);

  // --- NUEVO: estado de progreso (objetivo) y utilidad chunk ---
  const [progress, setProgress] = useState({ total: 0, done: 0, percent: 0 });

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
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
      const chunks = chunk(urls, 6); // 6–8 funciona bien en Render
      setProgress({ total: urls.length, done: 0, percent: 0 });

      let aggregate = [];
      for (const part of chunks) {
        const payload = { politician: { name: formData.name.trim(), office: formData.office.trim() || undefined }, urls: part };

        const res = await fetch(`${API_BASE}/analyze-chunk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          const detail = (() => { try { return JSON.parse(txt)?.detail || txt; } catch { return txt || 'Error del servidor'; }})();
          throw new Error(detail);
        }

        const chunkData = await res.json();
        aggregate = aggregate.concat(chunkData.results || []);

        setProgress(prev => {
          const done = Math.min(prev.total, prev.done + part.length);
          const percent = prev.total ? Math.round((done * 100) / prev.total) : 0;
          return { ...prev, done, percent };
        });
      }

      // Calcula summary en el front
      const sentiments = {};
      const stances = {};
      const entities = {};
      for (const r of aggregate) {
        const s = (r.ai?.sentiment || 'neutral').toLowerCase();
        sentiments[s] = (sentiments[s] || 0) + 1;
        const st = (r.ai?.stance || 'none').toLowerCase();
        stances[st] = (stances[st] || 0) + 1;
        for (const e of (r.ai?.entities || [])) {
          if (!e) continue;
          entities[e] = (entities[e] || 0) + 1;
        }
      }
      const total = aggregate.length;
      const predominant = Object.keys(sentiments).sort((a,b)=>(sentiments[b]||0)-(sentiments[a]||0))[0] || 'neutral';
      const top_entities = Object.entries(entities)
        .sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,c])=>`${n} (${c})`);

      const summary = { total, sentiments, predominant, stances, top_entities };
      setData({ politician: { name: formData.name.trim(), office: formData.office.trim() || undefined }, results: aggregate, summary });
      setView('results');

      toast({ title: '¡Análisis completado!', description: `Se analizaron ${aggregate.length} URLs en ${chunks.length} lotes.` });
    } catch (err) {
      console.error('Fetch error:', err);
      toast({ title: 'Error en el análisis', description: err.message || 'No se pudo completar el análisis.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
      setProgress(p => ({ ...p, percent: p.done === p.total ? 100 : p.percent }));
    }
  }, [formData, normalizeUrls, toast]);

  const handleNewAnalysis = () => {
    setView('form');
    setData(null);
    setFormData({ name: '', office: '', urls: '' });
    setUrlCount(0);
    setProgress({ total: 0, done: 0, percent: 0 });
  };

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
        body: JSON.stringify(data) // { politician, results, summary }
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
      toast({ title: 'Error al generar PDF', description: err.message || 'No se pudo crear el archivo.', variant: 'destructive' });
    }
  }, [data, toast]);

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
                    <div className="mt-4">
                      <div className="h-2 w-full bg-gray-200 rounded">
                        <div
                          className="h-2 bg-blue-600 rounded"
                          style={{ width: `${progress.percent}%`, transition: 'width .3s' }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Procesando {progress.done}/{progress.total} ({progress.percent}%)
                      </p>
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