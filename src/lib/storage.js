// src/lib/storage.js

/**
 * Sistema de almacenamiento local para reportes políticos
 */

const STORAGE_KEY = 'political_reports';
const MAX_POLITICIANS = 10; // Máximo de políticos almacenados

/**
 * Estructura de datos:
 * {
 *   politicians: [
 *     {
 *       id: "juan-perez",
 *       name: "Juan Pérez",
 *       office: "Alcalde",
 *       lastUpdated: "2025-11-10T12:00:00Z",
 *       weeklyReport: { ... },  // Datos del reporte semanal
 *       dailyReport: { ... }     // Datos del reporte diario
 *     }
 *   ],
 *   currentPolitician: "juan-perez"
 * }
 */

/**
 * Genera un ID único a partir del nombre
 */
function generateId(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Obtiene todos los datos del storage
 */
export function getStorageData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        politicians: [],
        currentPolitician: null
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {
      politicians: [],
      currentPolitician: null
    };
  }
}

/**
 * Guarda todos los datos en storage
 */
export function setStorageData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

/**
 * Obtiene la lista de todos los políticos
 */
export function getAllPoliticians() {
  const data = getStorageData();
  return data.politicians || [];
}

/**
 * Obtiene un político por ID
 */
export function getPoliticianById(id) {
  const data = getStorageData();
  return data.politicians.find(p => p.id === id);
}

/**
 * Obtiene un político por nombre
 */
export function getPoliticianByName(name) {
  const id = generateId(name);
  return getPoliticianById(id);
}

/**
 * Guarda o actualiza un político
 */
export function savePolitician(politicianData) {
  const data = getStorageData();
  const id = generateId(politicianData.name);

  const politician = {
    id,
    name: politicianData.name,
    office: politicianData.office || '',
    lastUpdated: new Date().toISOString(),
    weeklyReport: politicianData.weeklyReport || null,
    dailyReport: politicianData.dailyReport || null
  };

  // Buscar si ya existe
  const existingIndex = data.politicians.findIndex(p => p.id === id);

  if (existingIndex >= 0) {
    // Actualizar existente
    data.politicians[existingIndex] = {
      ...data.politicians[existingIndex],
      ...politician
    };
  } else {
    // Agregar nuevo
    data.politicians.unshift(politician);

    // Limitar cantidad de políticos
    if (data.politicians.length > MAX_POLITICIANS) {
      data.politicians = data.politicians.slice(0, MAX_POLITICIANS);
    }
  }

  setStorageData(data);
  return politician;
}

/**
 * Guarda el reporte semanal de un político
 */
export function saveWeeklyReport(politicianName, reportData) {
  const politician = getPoliticianByName(politicianName) || {
    name: politicianName,
    office: reportData.politician?.office || ''
  };

  return savePolitician({
    ...politician,
    weeklyReport: reportData
  });
}

/**
 * Guarda el reporte diario de un político
 */
export function saveDailyReport(politicianName, reportData) {
  const politician = getPoliticianByName(politicianName) || {
    name: politicianName
  };

  return savePolitician({
    ...politician,
    dailyReport: reportData
  });
}

/**
 * Obtiene el político actualmente seleccionado
 */
export function getCurrentPolitician() {
  const data = getStorageData();
  if (!data.currentPolitician) return null;
  return getPoliticianById(data.currentPolitician);
}

/**
 * Establece el político actual
 */
export function setCurrentPolitician(politicianId) {
  const data = getStorageData();
  data.currentPolitician = politicianId;
  setStorageData(data);
}

/**
 * Elimina un político
 */
export function deletePolitician(politicianId) {
  const data = getStorageData();
  data.politicians = data.politicians.filter(p => p.id !== politicianId);

  // Si el político eliminado era el actual, limpiar
  if (data.currentPolitician === politicianId) {
    data.currentPolitician = data.politicians.length > 0 ? data.politicians[0].id : null;
  }

  setStorageData(data);
}

/**
 * Limpia todos los datos
 */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Todos los datos de localStorage han sido eliminados');
}

/**
 * Migrar reportes antiguos a nueva estructura
 */
export function migrateOldReports() {
  const data = getStorageData();
  let migrated = false;

  data.politicians = data.politicians.map(politician => {
    if (politician.weeklyReport) {
      // Verificar si el reporte tiene la estructura antigua
      const report = politician.weeklyReport;

      // Si weeklyTrend tiene 'dia' en lugar de 'day', necesita migración
      if (report.weeklyTrend && report.weeklyTrend.length > 0 && 'dia' in report.weeklyTrend[0]) {
        console.log(`🔄 Migrando reporte de ${politician.name}...`);

        // Convertir weeklyTrend
        report.weeklyTrend = report.weeklyTrend.map(d => ({
          day: d.dia,
          mentions: d.menciones,
          sentiment: d.sentimiento
        }));

        migrated = true;
      }
    }
    return politician;
  });

  if (migrated) {
    setStorageData(data);
    console.log('✅ Migración completada');
  } else {
    console.log('ℹ️ No se encontraron reportes que necesiten migración');
  }

  return migrated;
}
