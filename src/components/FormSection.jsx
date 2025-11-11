import React from 'react';
import { FileText, FolderOpen } from 'lucide-react';

export default function FormSection({
  formData,
  setFormData,
  handleUrlsChange,
  handleSubmit,
  isAnalyzing,
  urlCount,
  minRequired,
  onShowDailyReport,
  onShowReports
}) {
  const onNameChange = (e) => setFormData(prev => ({ ...prev, name: e.target.value }));
  const onOfficeChange = (e) => setFormData(prev => ({ ...prev, office: e.target.value }));
  const onUrlsChange = (e) => handleUrlsChange(e.target.value);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre (requerido)</label>
          <input
            required
            value={formData.name}
            onChange={onNameChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cargo / Aspira a (opcional)</label>
          <input
            value={formData.office}
            onChange={onOfficeChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Ej: Diputado nacional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Detectadas</label>
          <div className="mt-1 text-sm text-gray-600">{urlCount} URLs</div>
          <div className="mt-2 text-xs text-gray-500">Se requieren mínimo {minRequired} URLs para analizar.</div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URLs (1 por línea)</label>
        <textarea
          value={formData.urls}
          onChange={onUrlsChange}
          rows={8}
          className="mt-1 block w-full border rounded px-3 py-2 font-mono text-sm"
          placeholder={
`Ejemplos:
https://www.tiktok.com/@usuario/video/...
https://www.instagram.com/p/...
https://x.com/usuario/status/...
https://medio.com/articulo...`
          }
        />
        <div className="text-xs text-gray-500 mt-1">
          Pega una URL por línea. Si falta https:// se añadirá automáticamente. Se ignorarán líneas vacías o con más de una URL.
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="submit"
          disabled={isAnalyzing}
          className="px-4 py-2 bg-[#1acc8d] text-white rounded disabled:opacity-60 font-semibold hover:bg-[#15b37d] transition-colors"
        >
          {isAnalyzing ? 'Generando análisis...' : 'Generar análisis'}
        </button>
        <button
          type="button"
          onClick={onShowDailyReport}
          disabled={isAnalyzing || !formData.name.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generar Reporte Diario
        </button>

        {onShowReports && (
          <button
            type="button"
            onClick={onShowReports}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-60 font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Ver Reportes Guardados
          </button>
        )}

        <button
          type="button"
          onClick={() => { setFormData({ name: '', office: '', urls: '' }); handleUrlsChange(''); }}
          className="px-3 py-2 border rounded hover:bg-gray-50 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}