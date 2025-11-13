import { API_BASE, MIN_URLS } from './config';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import FormSection from '@/components/FormSection';
import InstructionsSection from '@/components/InstructionsSection';
import ResultsView from '@/components/ResultsView';
import DailyReport from '@/components/DailyReport';
import ReportsLayout from '@/components/ReportsLayout';
import AnalysisManager from '@/components/AnalysisManager';
import { getAnalyses, getAnalysisById } from './lib/api';
import { transformSmartReportToDashboard } from './lib/transformData';
import { saveWeeklyReport, saveDailyReport, getAllPoliticians, setCurrentPolitician, migrateOldReports } from './lib/storage';

// URL de la API (Netlify / local)

const MIN_REQUIRED = MIN_URLS;

function App() {
  const [view, setView] = useState('form'); // 'form', 'results', 'dailyReport', or 'reports'
  const [formData, setFormData] = useState({ name: '', office: '', urls: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState(null); // { politician, results, summary, metadata }
  const [analyses, setAnalyses] = useState([]); // List of available analyses
  const [urlCount, setUrlCount] = useState(0);
  const [analyzedUrls, setAnalyzedUrls] = useState([]); // URLs del último análisis
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0); // Para forzar recarga de ReportsLayout
  const { toast } = useToast();
  const resultsRef = useRef(null);

  // Estado de progreso
  const [progress, setProgress] = useState({ total: 0, done: 0, percent: 0 });

  const handleAnalysisSelection = useCallback(async (id) => {
    try {
      const analysisData = await getAnalysisById(id);
      const dashboardData = transformSmartReportToDashboard(analysisData);
      setData({
        ...dashboardData,
        _original: analysisData,
      });
      setAnalyzedUrls(analysisData.urls || []);
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast({
        title: 'Error al cargar el análisis',
        description: `No se pudo cargar el análisis seleccionado.`,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Cargar análisis desde la API o localStorage al montar
  useEffect(() => {
    const loadInitialData = async () => {
      // Primero migrar reportes antiguos si existen
      migrateOldReports();

      // Luego verificar si hay datos en localStorage
      const politicians = getAllPoliticians();

      // Luego intentar cargar desde la API
      try {
        const analysesList = await getAnalyses();
        setAnalyses(analysesList);

        if (analysesList.length > 0) {
          // Si hay análisis en la API, cargar el primero
          await handleAnalysisSelection(analysesList[0].id);
          setView('results');
        } else if (politicians.length > 0) {
          // Si no hay en la API pero sí en localStorage, usar ReportsLayout
          setView('reports');
        } else {
          // Si no hay datos, mostrar formulario
          setView('form');
        }
      } catch (error) {
        console.error('Error loading analyses from API:', error);

        // Si falla la API pero hay datos en localStorage, usar ReportsLayout
        if (politicians.length > 0) {
          setView('reports');
        } else {
          // Si no hay datos en ningún lado, mostrar formulario
          setView('form');
        }
      }
    };

    loadInitialData();
  }, [handleAnalysisSelection]);

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
    setProgress({ total: urls.length, done: 0, percent: 0 });

    try {
      const payload = {
        politician: {
          name: formData.name.trim(),
          office: formData.office.trim() || undefined
        },
        urls: urls
      };

      // Simulación de progreso (el backend procesa en background)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 95) return prev; // No llegar a 100% hasta recibir respuesta
          return {
            ...prev,
            percent: Math.min(95, prev.percent + 5)
          };
        });
      }, 2000);

      const res = await fetch(`${API_BASE}/smart-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        const detail = (() => {
          try {
            return JSON.parse(txt)?.detail || txt;
          } catch {
            return txt || 'Error del servidor';
          }
        })();
        throw new Error(detail);
      }

      const responseData = await res.json();
      console.log('📥 Response from /smart-report:', responseData);

      // Transformar datos de smart-report al formato dashboard
      const dashboardData = transformSmartReportToDashboard(responseData);
      console.log('🎨 Dashboard data after transformation:', dashboardData);

      // Guardar tanto los datos transformados como los originales
      const fullData = {
        ...dashboardData,
        _original: responseData, // Mantener referencia a datos originales
        urls: urls // Agregar URLs analizadas
      };

      setData(fullData);
      setAnalyzedUrls(urls); // Guardar URLs para posibles re-cargas
      setProgress({ total: urls.length, done: urls.length, percent: 100 });

      // Guardar el reporte semanal en localStorage
      saveWeeklyReport(formData.name.trim(), fullData);
      console.log('💾 Reporte semanal guardado en localStorage');

      setView('results');

      // Verificar si es análisis nuevo o recuperado de BD
      const isCached = responseData.metadata?.is_cached || false;
      const message = isCached
        ? 'Reporte recuperado de la base de datos y guardado localmente'
        : `Se analizaron ${urls.length} URLs exitosamente y se guardó el reporte`;

      toast({
        title: isCached ? '✅ Reporte encontrado!' : '¡Análisis completado!',
        description: message
      });
    } catch (err) {
      console.error('Fetch error:', err);
      toast({
        title: 'Error en el análisis',
        description: err.message || 'No se pudo completar el análisis.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, normalizeUrls, toast]);

  const handleNewAnalysis = () => {
    setView('form');
    setData(null);
    setFormData({ name: '', office: '', urls: '' });
    setUrlCount(0);
    setProgress({ total: 0, done: 0, percent: 0 });
  };

  const handleShowDailyReport = () => {
    setView('dailyReport');
  };

  const handleShowReports = () => {
    setView('manage'); // Mostrar gestor de análisis
  };

  const handleSelectFromManager = async (analysis) => {
    // Si es análisis de API (tiene campo 'politician')
    if (analysis.politician && analysis.id) {
      await handleAnalysisSelection(analysis.id);
      setView('results');
    } else {
      // Si es análisis local (de localStorage) - tiene formato de politician directamente
      // Establecer como político actual antes de cambiar la vista
      setCurrentPolitician(analysis.id);
      // Incrementar refreshKey para forzar recarga del ReportsLayout
      setReportsRefreshKey(prev => prev + 1);
      setView('reports');
    }
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 no-print">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">Percepción Digital</h1>
            <p className="text-xl text-gray-700">Analizador simple</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {view === 'manage' ? (
              <motion.div key="manage-analyses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <AnalysisManager
                  onBack={handleNewAnalysis}
                  onSelectAnalysis={handleSelectFromManager}
                />
              </motion.div>
            ) : view === 'reports' ? (
              <motion.div key="reports-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <ReportsLayout
                  onNewAnalysis={handleNewAnalysis}
                  onDownloadPdf={handleDownloadPdf}
                  formatDate={formatDate}
                  getBadgeVariant={getBadgeVariant}
                  refreshKey={reportsRefreshKey}
                />
              </motion.div>
            ) : view === 'form' ? (
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
                    onShowDailyReport={handleShowDailyReport}
                    onShowReports={handleShowReports}
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
            ) : view === 'dailyReport' ? (
              <motion.div key="daily-report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <DailyReport
                  actorName={formData.name}
                  onBack={handleNewAnalysis}
                />
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ResultsView
                  politicianName={data?.politician?.name || formData.name}
                  politicianOffice={data?.politician?.office || formData.office}
                  urls={analyzedUrls}
                  results={data?.results || []}
                  summary={data?.summary || null}
                  reportData={data} // Pasar todos los datos del reporte
                  sentimentSummary={getSentimentSummary} // NUEVO prop
                  getBadgeVariant={getBadgeVariant}
                  formatDate={formatDate}
                  onNewAnalysis={handleNewAnalysis}
                  onDownloadPdf={handleDownloadPdf}
                  resultsRef={resultsRef}
                  analyses={analyses}
                  onAnalysisSelect={handleAnalysisSelection}
                  selectedAnalysisId={data?._original?.id}
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