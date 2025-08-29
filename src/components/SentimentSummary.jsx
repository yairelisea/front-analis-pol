import React from 'react';
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function SentimentSummary({ sentimentSummary, getBadgeVariant }) {
  if (!sentimentSummary) return null;

  return (
    <Card className="glass-effect border-gray-200">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Hash className="h-6 w-6 text-[#1acc8d]" />
          Resumen del Análisis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Distribución de Sentimientos</h3>
            <div className="space-y-2">
              {Object.entries(sentimentSummary.sentiments).map(([sentiment, count]) => (
                <div key={sentiment} className="flex justify-between items-center">
                  <Badge variant={getBadgeVariant('sentiment', sentiment)}>
                    {sentiment}
                  </Badge>
                  <span className="text-foreground font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Percepción Predominante</h3>
            <div className="text-center p-4 rounded-lg bg-gray-100/50">
              <Badge
                variant={getBadgeVariant('sentiment', sentimentSummary.predominant)}
                className="text-lg px-4 py-2"
              >
                {sentimentSummary.predominant}
              </Badge>
              <p className="text-gray-600 mt-2 text-sm">
                Basado en {sentimentSummary.total} análisis
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SentimentSummary;