// src/components/PoliticianSelector.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users, Plus, ChevronDown, Calendar, Trash2,
  FileText, BarChart3, Search, X
} from 'lucide-react';
import { getAllPoliticians, deletePolitician, setCurrentPolitician } from '../lib/storage';

const PoliticianSelector = ({ currentId, onSelect, onNewAnalysis }) => {
  const [politicians, setPoliticians] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar políticos del storage
  useEffect(() => {
    loadPoliticians();
  }, []);

  const loadPoliticians = () => {
    const data = getAllPoliticians();
    setPoliticians(data);
  };

  const handleSelect = (politician) => {
    setCurrentPolitician(politician.id);
    onSelect(politician);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleDelete = (e, politicianId) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este político?')) {
      deletePolitician(politicianId);
      loadPoliticians();

      // Si se eliminó el actual, seleccionar otro
      if (politicianId === currentId && politicians.length > 1) {
        const remaining = politicians.filter(p => p.id !== politicianId);
        if (remaining.length > 0) {
          handleSelect(remaining[0]);
        }
      }
    }
  };

  const currentPolitician = politicians.find(p => p.id === currentId);

  const filteredPoliticians = politicians.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.office && p.office.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Botón Selector */}
      <Card
        className="cursor-pointer hover:shadow-md transition-all border-2 border-emerald-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>

              {currentPolitician ? (
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{currentPolitician.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {currentPolitician.office && (
                      <Badge variant="outline" className="text-xs">
                        {currentPolitician.office}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(currentPolitician.lastUpdated)}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Seleccionar político</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {politicians.length} guardados
                  </p>
                </div>
              )}
            </div>

            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card className="shadow-2xl border-2 border-gray-200">
              <CardContent className="p-0">
                {/* Header con búsqueda */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar político..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de políticos */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredPoliticians.length > 0 ? (
                    filteredPoliticians.map((politician) => (
                      <div
                        key={politician.id}
                        onClick={() => handleSelect(politician)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                          politician.id === currentId ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {politician.name}
                            </h4>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {politician.office && (
                                <Badge variant="outline" className="text-xs">
                                  {politician.office}
                                </Badge>
                              )}

                              {politician.weeklyReport && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Semanal
                                </Badge>
                              )}

                              {politician.dailyReport && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Diario
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
                            onClick={(e) => handleDelete(e, politician.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No se encontraron políticos</p>
                    </div>
                  )}
                </div>

                {/* Footer con botón nuevo análisis */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onNewAnalysis();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Análisis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default PoliticianSelector;
