// src/components/ReportsLayout.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, FileText, ArrowLeft, RefreshCw
} from 'lucide-react';
import PoliticianSelector from './PoliticianSelector';
import ResultsView from './ResultsView';
import DailyReport from './DailyReport';
import {
  getCurrentPolitician,
  getPoliticianById,
  saveWeeklyReport,
  saveDailyReport,
  getAllPoliticians
} from '../lib/storage';

const ReportsLayout = ({
  onNewAnalysis,
  onDownloadPdf,
  formatDate,
  getBadgeVariant,
  refreshKey // Nueva prop para forzar recarga
}) => {
  const [currentPolitician, setCurrentPolitician] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' o 'daily'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar político actual al montar y cuando cambie refreshKey
  useEffect(() => {
    const politician = getCurrentPolitician();
    if (politician) {
      setCurrentPolitician(politician);
      // Determinar tab por defecto según qué reportes tenga
      if (politician.weeklyReport) {
        setActiveTab('weekly');
      } else if (politician.dailyReport) {
        setActiveTab('daily');
      }
    }
  }, [refreshKey]); // Recargar cuando cambie refreshKey

  const handleSelectPolitician = (politician) => {
    setCurrentPolitician(politician);

    // Auto-seleccionar tab según disponibilidad
    if (politician.weeklyReport) {
      setActiveTab('weekly');
    } else if (politician.dailyReport) {
      setActiveTab('daily');
    } else {
      setActiveTab('weekly');
    }
  };

  const handleRefresh = async () => {
    if (!currentPolitician) return;

    setIsRefreshing(true);
    // Simular refresh
    setTimeout(() => {
      setIsRefreshing(false);
      // Recargar datos del storage
      const politicians = getAllPoliticians();
      const updated = politicians.find(p => p.id === currentPolitician.id);
      if (updated) {
        setCurrentPolitician(updated);
      }
    }, 1000);
  };

  // Si no hay político seleccionado, mostrar mensaje
  if (!currentPolitician) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <PoliticianSelector
              currentId={null}
              onSelect={handleSelectPolitician}
              onNewAnalysis={onNewAnalysis}
            />
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-16 text-center">
              <BarChart3 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No hay político seleccionado
              </h2>
              <p className="text-gray-600 mb-6">
                Selecciona un político de la lista o genera un nuevo análisis
              </p>
              <Button
                onClick={onNewAnalysis}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                Generar Nuevo Análisis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasWeeklyReport = currentPolitician.weeklyReport !== null;
  const hasDailyReport = currentPolitician.dailyReport !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Selector de Político */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="no-print"
        >
          <PoliticianSelector
            currentId={currentPolitician.id}
            onSelect={handleSelectPolitician}
            onNewAnalysis={onNewAnalysis}
          />
        </motion.div>

        {/* Tabs de Reportes */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="no-print"
        >
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant={activeTab === 'weekly' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('weekly')}
                    disabled={!hasWeeklyReport}
                    className={`flex-1 sm:flex-initial ${activeTab === 'weekly' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Semanal</span>
                    {!hasWeeklyReport && (
                      <Badge variant="secondary" className="ml-2 text-xs hidden sm:inline-flex">
                        No disponible
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant={activeTab === 'daily' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('daily')}
                    disabled={!hasDailyReport}
                    className={`flex-1 sm:flex-initial ${activeTab === 'daily' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">Diario</span>
                    {!hasDailyReport && (
                      <Badge variant="secondary" className="ml-2 text-xs hidden sm:inline-flex">
                        No disponible
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 w-full sm:w-auto justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenido de los Reportes */}
        <AnimatePresence mode="wait">
          {activeTab === 'weekly' && hasWeeklyReport && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsView
                politicianName={currentPolitician.name}
                politicianOffice={currentPolitician.office}
                urls={currentPolitician.weeklyReport?.urls || []}
                results={currentPolitician.weeklyReport?.results || []}
                summary={currentPolitician.weeklyReport?.summary || null}
                reportData={currentPolitician.weeklyReport}
                sentimentSummary={null}
                getBadgeVariant={getBadgeVariant}
                formatDate={formatDate}
                onNewAnalysis={onNewAnalysis}
                onDownloadPdf={onDownloadPdf}
              />
            </motion.div>
          )}

          {activeTab === 'daily' && hasDailyReport && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyReport
                actorName={currentPolitician.name}
                onBack={onNewAnalysis}
              />
            </motion.div>
          )}

          {/* Mensaje si no hay reporte */}
          {((activeTab === 'weekly' && !hasWeeklyReport) ||
            (activeTab === 'daily' && !hasDailyReport)) && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-16 text-center">
                  {activeTab === 'weekly' ? (
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  ) : (
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {activeTab === 'weekly'
                      ? 'Reporte Semanal no disponible'
                      : 'Reporte Diario no disponible'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No se ha generado este tipo de reporte para {currentPolitician.name}
                  </p>
                  <Button
                    onClick={onNewAnalysis}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Generar Análisis
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportsLayout;
