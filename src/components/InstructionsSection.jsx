import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function InstructionsSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-effect border-gray-200">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            Instrucciones de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 space-y-3">
          <p>
            <strong className="text-foreground">1.</strong> Ingresa el nombre del personaje político que deseas analizar.
          </p>
          <p>
            <strong className="text-foreground">2.</strong> Opcionalmente, especifica su cargo o aspiración política.
          </p>
          <p>
            <strong className="text-foreground">3.</strong> Pega al menos 25 URLs de noticias, artículos o contenido web relacionado (una por línea).
          </p>
          <p>
            <strong className="text-foreground">4.</strong> Haz clic en "Analizar" y espera los resultados del análisis de percepción digital.
          </p>
          <div className="mt-4 p-3 bg-[#1acc8d]/10 rounded-lg border border-[#1acc8d]/20">
            <p className="text-emerald-700 text-sm">
              <strong>Tip:</strong> Para mejores resultados, incluye URLs de diferentes fuentes y fechas variadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default InstructionsSection;