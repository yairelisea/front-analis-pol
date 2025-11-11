// src/components/AnalysisManager.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Trash2, Calendar, Database, HardDrive, RefreshCw,
  AlertCircle, CheckCircle2, Loader2, ArrowLeft
} from 'lucide-react';
import { getAnalyses, deleteAnalysis } from '../lib/api';
import { getAllPoliticians, deletePolitician } from '../lib/storage';

const AnalysisManager = ({ onBack, onSelectAnalysis }) => {
  const [apiAnalyses, setApiAnalyses] = useState([]);
  const [localAnalyses, setLocalAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAllAnalyses();
  }, []);

  const loadAllAnalyses = async () => {
    setLoading(true);

    // Cargar desde localStorage
    const politicians = getAllPoliticians();
    setLocalAnalyses(politicians);

    // Intentar cargar desde API
    try {
      const analyses = await getAnalyses();
      setApiAnalyses(analyses);
    } catch (error) {
      console.error('Error loading API analyses:', error);
      // No mostrar error si simplemente no existe el endpoint
    }

    setLoading(false);
  };

  const handleDeleteLocal = async (politicianId) => {
    if (!confirm('¿Eliminar este análisis del almacenamiento local?')) {
      return;
    }

    try {
      setDeleting(`local-${politicianId}`);
      deletePolitician(politicianId);
      await loadAllAnalyses();
      toast({
        title: 'Análisis eliminado',
        description: 'El análisis local fue eliminado correctamente.'
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteApi = async (analysisId) => {
    if (!confirm('¿Eliminar este análisis de la base de datos?')) {
      return;
    }

    try {
      setDeleting(`api-${analysisId}`);
      await deleteAnalysis(analysisId);
      await loadAllAnalyses();
      toast({
        title: 'Análisis eliminado',
        description: 'El análisis fue eliminado de la base de datos.'
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  const totalAnalyses = apiAnalyses.length + localAnalyses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gestionar Análisis
                  </h1>
                  <p className="text-gray-600">
                    {totalAnalyses} análisis guardados total
                    ({apiAnalyses.length} en BD, {localAnalyses.length} locales)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={loadAllAnalyses}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onBack}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Análisis desde la API */}
        {apiAnalyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Análisis en Base de Datos
                  </h2>
                  <Badge variant="outline" className="ml-2">
                    {apiAnalyses.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {apiAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 cursor-pointer" onClick={() => onSelectAnalysis && onSelectAnalysis(analysis)}>
                        <h3 className="font-semibold text-gray-900">
                          {analysis.politician?.name || 'Sin nombre'}
                        </h3>
                        {analysis.politician?.office && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {analysis.politician.office}
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(analysis.created_at || analysis.metadata?.analysis_date)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApi(analysis.id)}
                        disabled={deleting === `api-${analysis.id}`}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === `api-${analysis.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Análisis locales */}
        {localAnalyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Análisis Locales (Navegador)
                  </h2>
                  <Badge variant="outline" className="ml-2">
                    {localAnalyses.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {localAnalyses.map((politician) => (
                    <div
                      key={politician.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {politician.name}
                        </h3>
                        {politician.office && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {politician.office}
                          </Badge>
                        )}
                        <div className="flex gap-2 mt-2">
                          {politician.weeklyReport && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              Reporte Semanal
                            </Badge>
                          )}
                          {politician.dailyReport && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              Reporte Diario
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(politician.lastUpdated)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLocal(politician.id)}
                        disabled={deleting === `local-${politician.id}`}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === `local-${politician.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mensaje si no hay análisis */}
        {totalAnalyses === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-16 text-center">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay análisis guardados
                </h3>
                <p className="text-gray-600 mb-6">
                  Genera tu primer análisis para comenzar
                </p>
                <Button
                  onClick={onBack}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Generar Análisis
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalysisManager;
