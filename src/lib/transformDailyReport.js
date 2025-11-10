// src/lib/transformDailyReport.js

/**
 * Transforma los datos de /daily-summary al formato esperado por DailyReport
 * @param {Object} summaryData - Datos del endpoint /daily-summary
 * @param {string} actorName - Nombre del político
 * @returns {Object} Datos en formato reporte diario
 */
export function transformDailySummaryToReport(summaryData, actorName) {
  console.log('🔄 Transformando daily summary:', summaryData);

  if (!summaryData) {
    console.warn('⚠️ No hay summaryData para transformar');
    return null;
  }

  const {
    total = 0,
    sentiments = {},
    predominant = 'neutral',
    stances = {},
    top_entities = [],
    short_text = '',
    results = []
  } = summaryData;

  // Generar resumen diario express
  const sentimentMap = {
    positive: 'positivo',
    neutral: 'equilibrado',
    negative: 'negativo'
  };

  const positiveCount = sentiments.positive || 0;
  const neutralCount = sentiments.neutral || 0;
  const negativeCount = sentiments.negative || 0;

  const resumen_diario_express = short_text ||
    `Durante el día de hoy, ${actorName} ha sido mencionado en ${total} publicaciones digitales. ` +
    `El análisis de sentimiento muestra una percepción ${sentimentMap[predominant] || 'equilibrada'} ` +
    `con ${positiveCount} menciones positivas, ${neutralCount} neutrales y ${negativeCount} negativas. ` +
    (top_entities.length > 0
      ? `Las entidades más mencionadas en relación con ${actorName} incluyen: ${top_entities.slice(0, 3).join(', ')}. `
      : '') +
    `Este análisis proporciona una visión general de la percepción pública actual.`;

  // Generar registro de evidencia
  // Como no tenemos los posts individuales en el summary, creamos entradas basadas en las entidades
  const registro_de_evidencia = [];

  if (results && results.length > 0) {
    // Si hay results en el summary
    results.forEach((result, idx) => {
      registro_de_evidencia.push({
        titulo: result.meta?.title || `Mención ${idx + 1}`,
        descripcion: result.ai?.summary || 'Sin resumen disponible',
        fecha: result.meta?.published_at || new Date().toISOString().split('T')[0],
        link: result.meta?.url || '#',
        sentiment: result.ai?.sentiment || 'neutral',
        topic: result.ai?.topic || null,
        stance: result.ai?.stance || null,
        platform: result.meta?.platform || 'web'
      });
    });
  } else {
    // Si no hay results, crear entradas genéricas basadas en las menciones
    const today = new Date().toISOString().split('T')[0];

    if (positiveCount > 0) {
      registro_de_evidencia.push({
        descripcion: `${positiveCount} menciones con sentimiento positivo sobre ${actorName}`,
        fecha: today,
        link: '#'
      });
    }

    if (neutralCount > 0) {
      registro_de_evidencia.push({
        descripcion: `${neutralCount} menciones neutrales sobre ${actorName}`,
        fecha: today,
        link: '#'
      });
    }

    if (negativeCount > 0) {
      registro_de_evidencia.push({
        descripcion: `${negativeCount} menciones con sentimiento negativo sobre ${actorName}`,
        fecha: today,
        link: '#'
      });
    }

    // Agregar entidades como evidencia si no hay otros datos
    if (registro_de_evidencia.length === 0 && top_entities.length > 0) {
      top_entities.slice(0, 5).forEach(entity => {
        registro_de_evidencia.push({
          descripcion: `Mención relacionada con: ${entity}`,
          fecha: today,
          link: '#'
        });
      });
    }
  }

  // Si aún no hay registro de evidencia, crear uno por defecto
  if (registro_de_evidencia.length === 0) {
    registro_de_evidencia.push({
      descripcion: `Análisis de ${total} menciones sobre ${actorName}`,
      fecha: new Date().toISOString().split('T')[0],
      link: '#'
    });
  }

  const transformed = {
    resumen_diario_express,
    registro_de_evidencia,
    _original: summaryData // Mantener datos originales
  };

  console.log('✅ Daily summary transformado:', transformed);
  return transformed;
}
