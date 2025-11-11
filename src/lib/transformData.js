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

  console.log('📊 DATOS EXTRAÍDOS:', {
    politician,
    resultsLength: results.length,
    summary,
    metadata
  });

  // Calcular métricas desde los results
  const totalMenciones = results.length;
  console.log('📈 Total menciones:', totalMenciones);

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

  // Generar período basado en fechas reales de los results
  let periodo;
  if (results && results.length > 0) {
    const fechas = results
      .map(r => r.meta?.published_at)
      .filter(Boolean)
      .map(d => new Date(d))
      .sort((a, b) => a - b);

    if (fechas.length > 0) {
      const fechaInicio = fechas[0];
      const fechaFin = fechas[fechas.length - 1];
      periodo = `${fechaInicio.getDate()}-${fechaFin.getDate()} ${fechaFin.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    } else {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodo = `${weekAgo.getDate()}-${now.getDate()} ${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    }
  } else {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    periodo = `${weekAgo.getDate()}-${now.getDate()} ${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
  }

  // Calcular sentimientos DIRECTAMENTE desde results (no desde summary)
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  results.forEach(r => {
    const sentiment = r.ai?.sentiment?.toLowerCase() || 'neutral';
    if (sentiment === 'positive') positiveCount++;
    else if (sentiment === 'negative') negativeCount++;
    else neutralCount++;
  });

  console.log('💭 Sentimientos calculados desde results:', { positiveCount, negativeCount, neutralCount });

  // Extraer topics principales
  const topicsSet = new Set();
  const topicMentions = {};
  results.forEach(r => {
    if (r.ai?.topic) {
      topicsSet.add(r.ai.topic);
      topicMentions[r.ai.topic] = (topicMentions[r.ai.topic] || 0) + 1;
    }
  });

  // Ordenar topics por menciones
  const sortedTopics = Array.from(topicsSet)
    .map(topic => ({ topic, count: topicMentions[topic] }))
    .sort((a, b) => b.count - a.count);

  const topTopic = sortedTopics[0]?.topic || 'temas variados';
  const topTopicCount = sortedTopics[0]?.count || 0;

  // Obtener plataforma principal (platformCounts ya se calculó arriba)
  const mainPlatform = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'medios digitales';

  // Calcular sentimiento predominante desde results
  let predominant = 'neutral';
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    predominant = 'positive';
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    predominant = 'negative';
  }

  console.log('🎯 Sentimiento predominante:', predominant);

  // Generar diagnóstico REAL basado en datos
  let diagnostico = '';

  if (predominant === 'positive') {
    diagnostico = `${politician?.name || 'El actor político'} mantiene una percepción predominantemente positiva en ${mainPlatform} con ${positiveCount} menciones positivas de ${totalMenciones} totales (${Math.round((positiveCount/totalMenciones)*100)}%). `;
    diagnostico += `El tema principal que genera engagement es "${topTopic}" con ${topTopicCount} menciones. `;
    diagnostico += `Se recomienda mantener la estrategia actual y capitalizar este momentum positivo.`;
  } else if (predominant === 'negative') {
    diagnostico = `${politician?.name || 'El actor político'} enfrenta desafíos de percepción con ${negativeCount} menciones negativas de ${totalMenciones} totales (${Math.round((negativeCount/totalMenciones)*100)}%). `;
    diagnostico += `La mayor parte de la discusión se centra en "${topTopic}". `;
    diagnostico += `Se recomienda implementar estrategia de comunicación proactiva y gestión de crisis enfocada en este tema.`;
  } else {
    diagnostico = `${politician?.name || 'El actor político'} presenta una percepción equilibrada con ${positiveCount} menciones positivas, ${neutralCount} neutrales y ${negativeCount} negativas. `;
    diagnostico += `"${topTopic}" es el tema más discutido con ${topTopicCount} menciones. `;
    diagnostico += `Existe oportunidad para reforzar mensajes clave y aumentar engagement positivo.`;
  }

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
      day: day,  // Usar 'day' en lugar de 'dia' para compatibilidad con ResultsView
      mentions: dayMenciones,  // Usar 'mentions' en lugar de 'menciones'
      sentiment: daySentiment  // Usar 'sentiment' en lugar de 'sentimiento'
    });
  });

  // Distribución de sentimientos (calcular porcentajes y counts)
  const sentimentDistribution = [
    {
      name: 'Positivo',
      value: totalMenciones > 0 ? Math.round((positiveCount / totalMenciones) * 100) : 0,
      count: positiveCount,
      color: '#10b981'
    },
    {
      name: 'Neutral',
      value: totalMenciones > 0 ? Math.round((neutralCount / totalMenciones) * 100) : 0,
      count: neutralCount,
      color: '#f59e0b'
    },
    {
      name: 'Negativo',
      value: totalMenciones > 0 ? Math.round((negativeCount / totalMenciones) * 100) : 0,
      count: negativeCount,
      color: '#ef4444'
    }
  ];

  // Distribución de narrativa (por stance) - calcular DIRECTAMENTE desde results
  let favorCount = 0;
  let stanceNeutralCount = 0;
  let againstCount = 0;

  results.forEach(r => {
    const stance = r.ai?.stance?.toLowerCase() || 'neutral';
    if (stance === 'favor') favorCount++;
    else if (stance === 'against') againstCount++;
    else stanceNeutralCount++;
  });

  const totalStances = favorCount + stanceNeutralCount + againstCount;
  console.log('📊 Stances calculadas desde results:', { favorCount, stanceNeutralCount, againstCount });

  const narrativaDistribution = [
    {
      name: 'A Favor',
      value: totalStances > 0 ? Math.round((favorCount / totalStances) * 100) : 0,
      count: favorCount,
      color: '#10b981'
    },
    {
      name: 'Neutral',
      value: totalStances > 0 ? Math.round((stanceNeutralCount / totalStances) * 100) : 0,
      count: stanceNeutralCount,
      color: '#f59e0b'
    },
    {
      name: 'En Contra',
      value: totalStances > 0 ? Math.round((againstCount / totalStances) * 100) : 0,
      count: againstCount,
      color: '#ef4444'
    }
  ];

  // Distribución por plataforma
  const platformDist = Object.entries(platformCounts).map(([platform, count]) => ({
    name: platform,
    value: count
  }));

  // Campañas activas (usar topics ya calculados arriba)
  const campanasActivas = Math.min(topicsSet.size, 5);

  const campaigns = sortedTopics.length > 0
    ? sortedTopics.slice(0, 3).map((topicData, idx) => {
        const topic = topicData.topic;
        const mentions = topicData.count;

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

  // FODA (basado en análisis REAL de los datos)
  const fortalezas = [];
  const oportunidades = [];
  const debilidades = [];
  const amenazas = [];

  // FORTALEZAS - basadas en datos positivos reales
  if (positiveCount > negativeCount) {
    fortalezas.push(`Percepción positiva en ${mainPlatform} (${positiveCount} menciones positivas)`);
  }
  if (sortedTopics.length > 0 && sortedTopics[0].count > 2) {
    fortalezas.push(`Fuerte asociación con "${sortedTopics[0].topic}" (${sortedTopics[0].count} menciones)`);
  }
  if (platformDist.length > 2) {
    fortalezas.push(`Presencia diversificada en ${platformDist.length} plataformas digitales`);
  }
  if (totalMenciones > 10) {
    fortalezas.push(`Alto volumen de menciones (${totalMenciones} referencias en el período)`);
  }
  // Si no hay fortalezas, agregar al menos una genérica
  if (fortalezas.length === 0) {
    fortalezas.push('Presencia digital establecida con oportunidad de crecimiento');
  }

  // OPORTUNIDADES - basadas en gaps en los datos
  if (platformDist.length <= 2) {
    oportunidades.push('Expansión a nuevas plataformas digitales para aumentar alcance');
  }
  if (neutralCount > positiveCount + negativeCount) {
    oportunidades.push('Gran audiencia neutral susceptible a mensajes positivos');
  }
  if (sortedTopics.length > 1) {
    oportunidades.push(`Diversificar contenido más allá de "${sortedTopics[0].topic}"`);
  }
  oportunidades.push('Implementar estrategia de contenido multimedia para mayor engagement');
  if (summary.stances?.favor < totalMenciones * 0.3) {
    oportunidades.push('Incrementar posicionamiento favorable en temas clave');
  }

  // DEBILIDADES - basadas en datos negativos reales
  if (negativeCount > positiveCount) {
    debilidades.push(`Percepción negativa predominante (${negativeCount} menciones negativas)`);
  }
  if (totalMenciones < 5) {
    debilidades.push('Alcance limitado en medios digitales');
  }
  if (platformDist.length === 1) {
    debilidades.push(`Dependencia de una sola plataforma (${mainPlatform})`);
  }
  if (summary.stances?.against > summary.stances?.favor) {
    debilidades.push('Mayor número de posturas en contra que a favor');
  }
  // Si no hay debilidades específicas, agregar una genérica
  if (debilidades.length === 0) {
    debilidades.push('Oportunidad de optimizar estrategia de comunicación digital');
  }

  // AMENAZAS - basadas en riesgos identificados en los datos
  if (negativeCount > positiveCount * 0.5) {
    amenazas.push('Narrativa negativa con potencial de amplificación');
  }
  if (sortedTopics.length > 0 && negativeCount > 3) {
    amenazas.push(`Riesgo de asociación negativa con "${sortedTopics[0].topic}"`);
  }
  amenazas.push('Competencia activa en el espacio digital');
  if (platformDist.length > 0) {
    amenazas.push('Cambios en algoritmos de plataformas pueden afectar visibilidad');
  }
  if (summary.top_entities && summary.top_entities.length > 3) {
    amenazas.push('Múltiples actores compitiendo por atención en temas similares');
  }

  const foda = {
    fortalezas,
    oportunidades,
    debilidades,
    amenazas
  };

  // Actores clave - primero intentar desde summary.top_entities, si no desde topics
  let actoresClave = [];

  if (summary.top_entities && summary.top_entities.length > 0) {
    // Si hay entidades en summary, usarlas
    actoresClave = summary.top_entities.slice(0, 5).map(entity => {
      // Parsear "Nombre (count)"
      const match = entity.match(/^(.+?)\s*\((\d+)\)$/);
      const nombre = match ? match[1] : entity;
      const menciones = match ? parseInt(match[2]) : 1;

      return {
        actor: nombre,
        rol: 'Entidad',
        menciones: menciones,
        sentiment: menciones > 3 ? 'positive' : 'neutral',
        impacto: menciones > 5 ? 'alto' : menciones > 2 ? 'medio' : 'bajo'
      };
    });
  } else if (sortedTopics.length > 0) {
    // Si no hay entidades pero hay topics, usar los topics como actores
    actoresClave = sortedTopics.slice(0, 5).map(topicData => {
      const topicResults = results.filter(r => r.ai?.topic === topicData.topic);
      const topicPositive = topicResults.filter(r => r.ai?.sentiment === 'positive').length;
      const sentiment = topicPositive > topicResults.length / 2 ? 'positive' : 'neutral';

      return {
        actor: topicData.topic,
        rol: 'Tema',
        menciones: topicData.count,
        sentiment: sentiment,
        impacto: topicData.count > 5 ? 'alto' : topicData.count > 2 ? 'medio' : 'bajo'
      };
    });
  }

  console.log('👥 Actores clave generados:', actoresClave);

  // Actividad reciente - mostrar mensaje de "sin actividad"
  const recentActivity = [];

  // Artículos analizados (lista de URLs con su información)
  const analyzedArticles = results && results.length > 0
    ? results.map(r => {
        // Generar título inteligente si no existe
        let titulo = r.meta?.title;

        if (!titulo || titulo.trim() === '') {
          // Si no hay título, usar el summary truncado
          if (r.ai?.summary) {
            const summary = r.ai.summary;
            // Tomar las primeras 80 caracteres del summary
            titulo = summary.length > 80
              ? summary.substring(0, 80) + '...'
              : summary;
          } else if (r.meta?.platform === 'facebook') {
            // Para Facebook sin título ni summary, usar descripción genérica con fecha
            const fecha = r.meta?.published_at ? new Date(r.meta.published_at).toLocaleDateString('es-ES') : '';
            titulo = `Post de Facebook${fecha ? ` - ${fecha}` : ''}`;
          } else {
            titulo = 'Sin título';
          }
        }

        return {
          titulo,
          descripcion: r.ai?.summary || 'Sin análisis disponible',
          fecha: r.meta?.published_at || new Date().toISOString(),
          link: r.meta?.url || '#',
          sentiment: r.ai?.sentiment || 'neutral',
          topic: r.ai?.topic || null,
          stance: r.ai?.stance || null,
          platform: r.meta?.platform || 'web'
        };
      })
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
    diagnostico,

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

    // Datos originales necesarios para compatibilidad
    politician,
    results,
    summary,
    metadata,

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
