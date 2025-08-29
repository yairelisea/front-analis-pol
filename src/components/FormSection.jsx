import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function FormSection({ formData, setFormData, handleUrlsChange, handleSubmit, isAnalyzing, urlCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-effect border-gray-200">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#1acc8d]" />
            Configurar Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nombre del personaje *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  required
                  className="bg-gray-100/50 border-gray-300 text-foreground placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="office" className="text-foreground">
                  Cargo/aspiración
                </Label>
                <Input
                  id="office"
                  value={formData.office}
                  onChange={(e) => setFormData(prev => ({ ...prev, office: e.target.value }))}
                  placeholder="Ej: Alcalde, Senador"
                  className="bg-gray-100/50 border-gray-300 text-foreground placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="urls" className="text-foreground">
                  URLs (una por línea) *
                </Label>
                <Badge
                  variant={urlCount >= 35 ? "default" : "destructive"}
                  className={`text-xs ${urlCount >= 35 ? "bg-[#1acc8d] text-white" : ""}`}
                >
                  {urlCount} de 35 mínimo
                </Badge>
              </div>
              <Textarea
                id="urls"
                value={formData.urls}
                onChange={(e) => handleUrlsChange(e.target.value)}
                placeholder="https://ejemplo.com/noticia1&#10;https://ejemplo.com/noticia2&#10;..."
                rows={8}
                required
                className="bg-gray-100/50 border-gray-300 text-foreground placeholder:text-gray-500 font-mono text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isAnalyzing || urlCount < 35}
              className="w-full bg-[#1acc8d] hover:bg-emerald-700 text-white font-semibold py-3 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                'Analizar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FormSection;