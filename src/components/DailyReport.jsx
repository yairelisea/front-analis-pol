import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator.jsx';
import { useToast } from '@/components/ui/use-toast';
import {
  Newspaper, Calendar, ArrowLeft, Download, Share2, BarChart3,
  TrendingUp, TrendingDown, Minus, Eye, MessageCircle, Heart,
  Sparkles, Tag, ExternalLink, Smile, Frown, ThumbsUp, ThumbsDown, AlertCircle, Printer
} from 'lucide-react';
import { API_BASE } from '../config';
import { transformDailySummaryToReport } from '../lib/transformDailyReport';

// Componente KPI simplificado para reporte diario
const DailyKPI = ({ title, value, change, trend, icon: Icon }) => {
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-amber-600';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card className="relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-gray-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 ${trendColor} border border-gray-200`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
};

// Componente de Noticia Individual
const NewsCard = ({ noticia }) => {
  const [expanded, setExpanded] = useState(false);

  // Colores según sentimiento
  const sentimentConfig = {
    positive: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: Smile,
      label: 'Positivo'
    },
    neutral: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: Minus,
      label: 'Neutral'
    },
    negative: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: Frown,
      label: 'Negativo'
    }
  };

  const stanceConfig = {
    favor: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'A favor', icon: ThumbsUp },
    against: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'En contra', icon: ThumbsDown },
    neutral: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Neutral', icon: Minus }
  };

  const sentiment = noticia.sentiment || 'neutral';
  const sentStyle = sentimentConfig[sentiment] || sentimentConfig.neutral;
  const SentimentIcon = sentStyle.icon;

  const stance = noticia.stance || 'neutral';
  const stanceStyle = stanceConfig[stance] || stanceConfig.neutral;
  const StanceIcon = stanceStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
              {noticia.titulo || noticia.title || 'Sin título'}
            </h3>
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{noticia.fecha || 'Fecha no disponible'}</span>
              </div>
              {noticia.platform && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {noticia.platform}
                  </Badge>
                </>
              )}
            </div>

            {/* Badges de Sentiment y Stance */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${sentStyle.bg} ${sentStyle.text} border ${sentStyle.border}`}>
                <SentimentIcon className="h-3 w-3 mr-1" />
                {sentStyle.label}
              </Badge>

              {noticia.stance && noticia.stance !== 'neutral' && (
                <Badge className={`${stanceStyle.bg} ${stanceStyle.text}`}>
                  <StanceIcon className="h-3 w-3 mr-1" />
                  {stanceStyle.label}
                </Badge>
              )}

              {noticia.topic && (
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {noticia.topic}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600 hover:bg-emerald-50 flex-shrink-0"
            onClick={() => window.open(noticia.link, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Análisis de IA */}
        <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-lg p-3 mb-3 border border-emerald-100">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-700">Análisis IA</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {noticia.descripcion || 'Sin análisis disponible'}
          </p>
        </div>

        <Separator className="my-3 bg-gray-200" />

        {/* Link de la fuente */}
        <div className="mt-3">
          <a
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Ver fuente completa
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// Componente Principal - Reporte Diario
const DailyReport = ({ actorName, onBack }) => {
  console.log('🎬 DailyReport component mounted/rendered with actorName:', actorName);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 DailyReport useEffect - actorName:', actorName);

    if (!actorName) {
      console.log('❌ No actorName provided');
      setLoading(false);
      setError("No se ha proporcionado un nombre de actor.");
      return;
    }

    const fetchReport = async () => {
      console.log('📡 Fetching daily report for:', actorName);
      setLoading(true);
      setError(null);

      try {
        const url = `${API_BASE}/daily-summary?q=${encodeURIComponent(actorName)}`;
        console.log('🌐 Calling URL:', url);

        const response = await fetch(url);
        console.log('📥 Response status:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Data received:', data);
        console.log('📋 Data keys:', data ? Object.keys(data) : 'No data');
        console.log('📊 Full data structure:', JSON.stringify(data, null, 2));

        // Verificar si hay error en la respuesta
        if (data.error) {
          throw new Error(data.error);
        }

        // Transformar datos si vienen en formato summary
        let transformedData = data;
        if (!data.resumen_diario_express && (data.total !== undefined || data.sentiments)) {
          console.log('🔄 Detectado formato summary, transformando...');
          transformedData = transformDailySummaryToReport(data, actorName);
        }

        console.log('📝 resumen_diario_express:', transformedData.resumen_diario_express);
        console.log('📰 registro_de_evidencia:', transformedData.registro_de_evidencia);

        setReportData(transformedData);
      } catch (err) {
        console.error('❌ Error fetching daily report:', err);
        setError(err.message);
      } finally {
        console.log('🏁 Fetch completed');
        setLoading(false);
      }
    };

    fetchReport();
  }, [actorName]);

  const handleDownload = async () => {
    if (!reportData) {
      toast({ title: 'Error', description: 'No hay datos para descargar.', variant: 'destructive' });
      return;
    }

    setIsDownloading(true);
    toast({ title: 'Generando PDF...', description: 'El reporte diario se está creando.' });

    try {
      const response = await fetch(`${API_BASE}/daily-summary-pdf?q=${encodeURIComponent(actorName)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido al generar el PDF.' }));
        throw new Error(errorData.error);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_diario_${actorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: '¡Éxito!', description: 'El PDF del reporte ha sido descargado.' });
    } catch (err) {
      console.error('Error downloading daily report PDF:', err);
      toast({ title: 'Error al descargar', description: err.message, variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    // Lógica para compartir (puede ser un modal con un link, etc.)
    toast({ title: 'Función no implementada', description: 'La opción de compartir aún no está disponible.' });
  };

  const handlePrint = () => {
    window.print();
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte diario para {actorName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error al cargar el reporte</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    console.log('⚠️ No reportData available');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No hay datos disponibles.</p>
      </div>
    );
  }

  console.log('🎨 Rendering with reportData:', reportData);
  console.log('📋 ReportData keys:', Object.keys(reportData));

  const { resumen_diario_express, registro_de_evidencia } = reportData;

  console.log('📝 Destructured resumen_diario_express:', resumen_diario_express);
  console.log('📰 Destructured registro_de_evidencia:', registro_de_evidencia);

  if (!resumen_diario_express && !registro_de_evidencia) {
    console.log('⚠️ Campos requeridos no encontrados en reportData');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Estructura de datos inesperada</h3>
            <p className="text-gray-600 mb-4">
              El reporte diario no tiene el formato esperado.
            </p>
            <details className="text-left text-xs">
              <summary className="cursor-pointer text-blue-600">Ver datos recibidos</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    );
  }
  const fechaActual = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-2xl border-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMTUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

            <CardContent className="p-4 md:p-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 no-print">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 -ml-2"
                      onClick={onBack}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Newspaper className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-sm px-3 py-1 backdrop-blur-sm">
                      Reporte Diario
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white drop-shadow-sm">{actorName}</h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="h-4 w-4" />
                    <p className="text-base">{fechaActual}</p>
                  </div>
                </div>
                <div className="flex gap-2 no-print">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white text-emerald-600 hover:bg-gray-50 shadow-lg font-semibold"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Generando...' : 'Descargar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resumen del Día */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-md border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xl font-bold text-gray-900">Resumen del Día</h2>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                      IA
                    </Badge>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {resumen_diario_express || 'No hay resumen disponible para hoy.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notas Analizadas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
                Notas Analizadas
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {registro_de_evidencia?.length || 0} publicaciones analizadas por IA
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {registro_de_evidencia && registro_de_evidencia.length > 0 ? (
              registro_de_evidencia.map((noticia, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                >
                  <NewsCard noticia={noticia} />
                </motion.div>
              ))
            ) : (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron noticias para hoy.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DailyReport;
