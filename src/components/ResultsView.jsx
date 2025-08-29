
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SentimentSummary from '@/components/SentimentSummary';
import ResultCard from '@/components/ResultCard';

const ResultsView = ({
  politicianName,
  results,
  sentimentSummary,
  getBadgeVariant,
  formatDate,
  onNewAnalysis,
  onDownloadPdf,
  resultsRef
}) => {
  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <Card className="glass-effect border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-foreground">
              Análisis para: <span className="text-[#1acc8d]">{politicianName}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onNewAnalysis} variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                <FilePlus className="mr-2 h-4 w-4" />
                Nuevo Análisis
              </Button>
              <Button onClick={scrollToResults}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Resultados
              </Button>
              <Button onClick={onDownloadPdf} className="bg-[#1acc8d] hover:bg-emerald-700">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div ref={resultsRef} className="space-y-6">
        <SentimentSummary
          sentimentSummary={sentimentSummary}
          getBadgeVariant={getBadgeVariant}
        />
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Resultados Detallados</h2>
          <div className="grid gap-4">
            {results.results?.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                index={index}
                formatDate={formatDate}
                getBadgeVariant={getBadgeVariant}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;