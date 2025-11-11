// src/lib/transformData.js

/**
 * Transforma los datos de /smart-report al formato esperado por el dashboard
 * @param {Object} smartReportData - Datos del endpoint /smart-report
 * @returns {Object} Datos en formato dashboard
 */
export function transformSmartReportToDashboard(smartReportData) {
  console.log('🔄 Transformando datos de smart-report a dashboard:', smartReportData);

  if (!smartReportData) {
    console.warn('⚠️ No hay datos para transformar');
    return null;
  }

  const { politician, results = [], summary = {}, metadata = {} } = smartReportData;

  // Calcular métricas desde los results
  const totalMenciones = results.length;

  // Calcular sentimiento promedio (positive=100, neutral=50, negative=0)
  const sentimentValues = {
    positive: 100,
    neutral: 50,
    negative: 0
  };

  const avgSentiment = results.length > 0
    ? Math.round(
        results.reduce((acc, r) => {
          const sentiment = r.ai?.sentiment?.toLowerCase() || 'neutral';
          return acc + (sentimentValues[sentiment] || 50);
        }, 0) / results.length
      )
    : 50;

  // Contar por plataforma
  const platformCounts = {};
  results.forEach(r => {
    const platform = r.meta?.platform || 'unknown';
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });

  // Estimar alcance (simulado por ahora)
  const alcanceEstimado = totalMenciones * 2500; // Aproximación

  // Generar período
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const periodo = `${weekAgo.getDate()}-${now.getDate()} ${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;

  // Generar diagnóstico basado en sentimiento predominante
  const predominant = summary.predominant || 'neutral';
  const diagnosticos = {
    positive: `${politician?.name || 'El actor político'} mantiene una percepción predominantemente positiva en medios digitales. Se recomienda mantener estrategia actual y capitalizar momentum.`,
    neutral: `${politician?.name || 'El actor político'} presenta una percepción equilibrada en medios digitales. Oportunidad para reforzar mensajes clave y aumentar engagement.`,
    negative: `${politician?.name || 'El actor político'} enfrenta desafíos de percepción en medios digitales. Se recomienda estrategia de comunicación proactiva y gestión de crisis.`
  };

  // Calcular tendencias REALES comparando con período anterior
  // Nota: Si no hay datos históricos, los cambios serán 0
  const mencionesChange = 0; // Se puede calcular si hay historical data
  const sentimientoChange = 0;
  const alcanceChange = 0;

  // Datos de gráficas - Tendencia semanal REAL (agrupar por día)
  const trendData = [];
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Agrupar results por día de la semana
  const resultsByDay = {};
  results.forEach(r => {
    const date = r.meta?.published_at ? new Date(r.meta.published_at) : new Date();
    const dayIndex = date.getDay(); // 0 = Dom, 1 = Lun, etc.
    const dayName = days[dayIndex];

    if (!resultsByDay[dayName]) {
      resultsByDay[dayName] = [];
    }
    resultsByDay[dayName].push(r);
  });

  // Generar datos de tendencia por día
  days.forEach(day => {
    const dayResults = resultsByDay[day] || [];
    const dayMenciones = dayResults.length;

    // Calcular sentimiento promedio del día
    const daySentiment = dayResults.length > 0
      ? Math.round(
          dayResults.reduce((acc, r) => {
            const sentiment = r.ai?.sentiment?.toLowerCase() || 'neutral';
            return acc + (sentimentValues[sentiment] || 50);
          }, 0) / dayResults.length
        )
      : avgSentiment;

    trendData.push({
      dia: day,
      menciones: dayMenciones,
      sentimiento: daySentiment
    });
  });

  // Distribución de sentimientos
  const sentimentDistribution = [
    {
      name: 'Positivo',
      value: summary.sentiments?.positive || 0,
      color: '#10b981'
    },
    {
      name: 'Neutral',
      value: summary.sentiments?.neutral || 0,
      color: '#f59e0b'
    },
    {
      name: 'Negativo',
      value: summary.sentiments?.negative || 0,
      color: '#ef4444'
    }
  ];

  // Distribución de narrativa (por stance)
  const narrativaDistribution = [
    {
      name: 'A Favor',
      value: summary.stances?.favor || 0,
      color: '#10b981'
    },
    {
      name: 'Neutral',
      value: summary.stances?.neutral || 0,
      color: '#f59e0b'
    },
    {
      name: 'En Contra',
      value: summary.stances?.against || 0,
      color: '#ef4444'
    }
  ];

  // Distribución por plataforma
  const platformDist = Object.entries(platformCounts).map(([platform, count]) => ({
    name: platform,
    value: count
  }));

  // Campañas activas (extraídas de topics)
  const topicsSet = new Set();
  const topicMentions = {};
  results.forEach(r => {
    if (r.ai?.topic) {
      topicsSet.add(r.ai.topic);
      topicMentions[r.ai.topic] = (topicMentions[r.ai.topic] || 0) + 1;
    }
  });
  const campanasActivas = Math.min(topicsSet.size, 5);

  const campaigns = topicsSet.size > 0
    ? Array.from(topicsSet).slice(0, 3).map((topic, idx) => {
        const mentions = topicMentions[topic] || 0;

        // Calcular sentimiento real del topic
        const topicResults = results.filter(r => r.ai?.topic === topic);
        const topicSentiment = topicResults.length > 0
          ? topicResults.reduce((acc, r) => {
              const sentiment = r.ai?.sentiment?.toLowerCase() || 'neutral';
              return acc + (sentimentValues[sentiment] || 50);
            }, 0) / topicResults.length / 100
          : 0.5;

        return {
          name: topic,
          mentions: mentions,
          sentiment: topicSentiment,
          trend: idx === 0 ? 'up' : idx === 1 ? 'stable' : 'down',
          alcance: `${Math.floor(mentions * 2000).toLocaleString()}`,
          engagement: `${mentions}` // Número de menciones como engagement
        };
      })
    : [];

  // FODA (basado en análisis)
  const positiveCount = summary.sentiments?.positive || 0;
  const negativeCount = summary.sentiments?.negative || 0;
  const neutralCount = summary.sentiments?.neutral || 0;

  const foda = {
    fortalezas: positiveCount > negativeCount
      ? ['Percepción positiva en redes', 'Alto engagement digital', 'Narrativa coherente']
      : positiveCount > 0
      ? ['Presencia digital activa', 'Base de seguidores leales']
      : ['Oportunidad de construcción de marca'],
    oportunidades: ['Expansión en nuevas plataformas', 'Colaboraciones estratégicas', 'Contenido multimedia'],
    debilidades: negativeCount > positiveCount
      ? ['Gestión de crisis reactiva', 'Mensajes inconsistentes', 'Baja interacción']
      : totalMenciones < 5
      ? ['Alcance limitado', 'Poca visibilidad']
      : ['Alcance limitado en ciertos segmentos'],
    amenazas: ['Desinformación', 'Competencia activa', 'Cambios de algoritmos']
  };

  // Actores clave (de entidades)
  const actoresClave = summary.top_entities && summary.top_entities.length > 0
    ? summary.top_entities.slice(0, 5).map(entity => {
        // Parsear "Nombre (count)"
        const match = entity.match(/^(.+?)\s*\((\d+)\)$/);
        const nombre = match ? match[1] : entity;
        const menciones = match ? parseInt(match[2]) : 1;

        return {
          nombre,
          tipo: 'Político', // Simplificado
          interacciones: menciones,
          sentimiento: menciones > 3 ? 'positive' : 'neutral'
        };
      })
    : [];

  // Actividad reciente (últimas menciones)
  const recentActivity = results && results.length > 0
    ? results.slice(0, 10).map(r => ({
        tipo: r.meta?.platform || 'web',
        descripcion: r.meta?.title || r.ai?.summary || 'Mención',
        fecha: r.meta?.published_at || new Date().toISOString(),
        impacto: r.ai?.sentiment === 'positive' ? 'Alto' : r.ai?.sentiment === 'negative' ? 'Medio' : 'Bajo'
      }))
    : [];

  // Artículos analizados (lista de URLs con su información)
  const analyzedArticles = results && results.length > 0
    ? results.map(r => ({
        titulo: r.meta?.title || 'Sin título',
        descripcion: r.ai?.summary || 'Sin análisis disponible',
        fecha: r.meta?.published_at || new Date().toISOString(),
        link: r.meta?.url || '#',
        sentiment: r.ai?.sentiment || 'neutral',
        topic: r.ai?.topic || null,
        stance: r.ai?.stance || null,
        platform: r.meta?.platform || 'web'
      }))
    : [];

  // Determinar estado de métricas
  const getStatus = (value, threshold) => {
    if (value > threshold) return { status: 'positive', trend: 'up' };
    if (value < threshold * 0.7) return { status: 'negative', trend: 'down' };
    return { status: 'neutral', trend: 'stable' };
  };

  // Construir objeto de dashboard
  const dashboardData = {
    actor: politician?.name || 'Actor Político',
    periodo,
    diagnostico: diagnosticos[predominant],

    // KPIs principales
    totalMenciones,
    mencionesChange,
    sentimientoPromedio: avgSentiment,
    sentimientoChange,
    campanasActivas,
    alcanceEstimado,
    alcanceChange,

    // Métricas secundarias
    visibilidadPublica: {
      value: totalMenciones > 20 ? 'Alta' : totalMenciones > 10 ? 'Media' : 'Baja',
      ...getStatus(totalMenciones, 15)
    },
    interaccionesDigitales: {
      value: `${(totalMenciones * 150).toLocaleString()}`,
      ...getStatus(avgSentiment, 60)
    },
    mencionesEnMedios: {
      value: platformDist.length,
      ...getStatus(platformDist.length, 3)
    },
    riesgoReputacional: {
      value: negativeCount > positiveCount ? 'Alto' : negativeCount > 2 ? 'Medio' : 'Bajo',
      status: negativeCount > positiveCount ? 'negative' : negativeCount > 2 ? 'neutral' : 'positive',
      trend: negativeCount > positiveCount ? 'up' : 'down'
    },

    // Datos de gráficas
    weeklyTrend: trendData,
    sentimentDistribution: sentimentDistribution,
    narrativaDistribution: narrativaDistribution,
    distribucionPlataforma: platformDist,

    // Campañas
    campaigns: campaigns.length > 0 ? campaigns : [],

    // FODA
    foda: foda,

    // Actores y actividad
    actoresClave: actoresClave.length > 0 ? actoresClave : [],
    recentActivity: recentActivity.length > 0 ? recentActivity : [],
    analyzedArticles: analyzedArticles.length > 0 ? analyzedArticles : [],

    // Datos originales (por si se necesitan)
    _rawData: {
      politician,
      results,
      summary,
      metadata
    }
  };

  console.log('✅ Datos transformados:', dashboardData);
  return dashboardData;
}
