import { useState } from 'react';
import { flushSync } from 'react-dom';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading-csv.json';
import { useAIInsights } from '../../hooks/useAIInsightsMulti';

// ─── Clave de localStorage para perfiles de bancos ───────────────────────────
const PROFILES_KEY = 'budget_import_bank_profiles';

// ─── Diccionario de aliases: campo interno → nombres posibles de columna ────
const COLUMN_ALIASES = {
  fecha: [
    'fecha', 'date', 'fecha transaccion', 'fecha de transaccion',
    'fecha operacion', 'fecha de operacion', 'fecha valor',
    'fecha movimiento', 'fecha de movimiento', 'transaction date',
    'fecha txn', 'fecha de pago', 'posting date', 'fecha contable',
    'fecha proceso', 'fecha efectiva', 'settlement date',
  ],
  descripcion: [
    'descripcion', 'description', 'detalle', 'concepto', 'comercio',
    'narracion', 'narrative', 'memo', 'referencia', 'reference',
    'nombre comercio', 'nombre de comercio', 'beneficiario',
    'transaction description', 'details', 'merchant', 'remarks',
    'detalle de movimiento', 'glosa', 'descripcion de movimiento',
    'concepto del movimiento', 'descripcion del cargo',
  ],
  monto: [
    'monto', 'amount', 'importe', 'valor', 'value', 'total',
    'monto transaccion', 'transaction amount', 'suma', 'monto total',
    'importe transaccion',
  ],
  debito: [
    'debito', 'debit', 'cargo', 'cargos', 'egreso', 'egresos',
    'retiro', 'retiros', 'withdrawal', 'salida', 'salidas',
    'debe', 'debit amount', 'monto debito', 'debitos', 'charges',
    'debito usd', 'importe debito', 'monto cargo', 'debito (usd)',
  ],
  credito: [
    'credito', 'credit', 'abono', 'abonos', 'ingreso en cuenta',
    'deposito', 'depositos', 'deposit', 'haber', 'credit amount',
    'monto credito', 'creditos', 'credits', 'credito usd',
    'importe credito', 'monto abono', 'credito (usd)',
  ],
  tipo: [
    'tipo', 'type', 'tipo movimiento', 'tipo de movimiento',
    'dc', 'd/c', 'debito credito', 'clase', 'tipo transaccion',
  ],
  categoria: [
    'categoria', 'category', 'rubro', 'clasificacion', 'subcategoria',
  ],
};

/** Detecta el separador más probable (coma, punto y coma o tabulador) */
const detectSeparator = (text) => {
  const firstLine = (text.split('\n')[0] || '').substring(0, 1000);
  const semi  = (firstLine.match(/;/g)  || []).length;
  const comma = (firstLine.match(/,/g)  || []).length;
  const tab   = (firstLine.match(/\t/g) || []).length;
  if (semi  > comma && semi  > tab) return ';';
  if (tab   > comma)               return '\t';
  return ',';
};

/** Normaliza un header: minúsculas, sin tildes, sin chars especiales */
const normalizeHeader = (h) =>
  h.toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^\w\s]/g, '')
   .trim();

/**
 * Intenta mapear headers al esquema interno via el diccionario.
 * @returns {Object|null} mapa campo→headerOriginal, o null si no es suficiente
 */
const tryPatternMapping = (normalizedHeaders, rawHeaders) => {
  const map = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = normalizedHeaders.findIndex(h => aliases.includes(h));
    if (idx !== -1) map[field] = rawHeaders[idx];
  }
  const hasFecha = !!map.fecha;
  const hasDesc  = !!map.descripcion;
  const hasMonto = !!map.monto || !!map.debito || !!map.credito;
  return (hasFecha && hasDesc && hasMonto) ? map : null;
};

/** Lee perfil de banco guardado según signature de headers */
const getSavedProfile = (normalizedHeaders) => {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    const key = [...normalizedHeaders].sort().join('|');
    return profiles[key] || null;
  } catch { return null; }
};

/** Guarda perfil de banco para futuros imports */
const saveProfile = (normalizedHeaders, columnMap, profileName) => {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    const key = [...normalizedHeaders].sort().join('|');
    profiles[key] = { columnMap, profileName, savedAt: new Date().toISOString() };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch { /* silencioso */ }
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ImportManager({ onImport, onBulkImport }) {
  const [previewData, setPreviewData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [categorizingProgress, setCategorizingProgress] = useState(null);

  // Estados para detección flexible de formato bancario
  const [rawCSVMeta, setRawCSVMeta] = useState(null); // { lines, separator, rawHeaders, normalizedHeaders }
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [manualMap, setManualMap] = useState({});
  const [saveProfileName, setSaveProfileName] = useState('');
  const [mappingMode, setMappingMode] = useState(null); // 'template'|'profile'|'pattern'|'ai'|'manual'
  const [loadingFile, setLoadingFile] = useState(false);
  
  // Hook de IA para auto-categorización
  const aiInsights = useAIInsights([]);

  // ─── Flujo A→C→B: Patrones → IA → Manual ─────────────────────────────────────

  /** Lógica central de detección: recibe texto crudo y determina qué camino tomar */
  const tryAutoDetect = async (text) => {
    // 1. Limpiar BOM + normalizar saltos de línea
    let clean = text;
    if (clean.charCodeAt(0) === 0xFEFF) clean = clean.slice(1);
    clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const sep   = detectSeparator(clean);
    const allLines = clean.split('\n').filter(l => l.trim());
    if (allLines.length < 2) throw new Error('El archivo debe tener al menos una fila de datos');

    // --- Auto-detectar la fila real de cabeceras ---
    // Algunos extractos bancarios tienen filas de metadatos antes de los headers
    // (nombre del banco, número de cuenta, período, etc.).
    // Buscamos la primera fila que: tenga ≥2 columnas Y al menos una coincida
    // con un alias conocido. Si no encontramos match, usamos la fila 0.
    const allAliases = Object.values(COLUMN_ALIASES).flat();
    let headerIdx = 0;
    for (let i = 0; i < Math.min(allLines.length - 1, 10); i++) {
      const tokens = parseCSVLineFlexible(allLines[i], sep);
      if (tokens.length < 2) continue;
      const normalized = tokens.map(normalizeHeader);
      const hasKnownAlias = normalized.some(h => allAliases.includes(h));
      if (hasKnownAlias) { headerIdx = i; break; }
      // Segunda heurística: fila con ≥3 tokens no numéricos → candidata a header
      const nonNumeric = tokens.filter(t => isNaN(t.replace(/[.,]/g, '')) && t.length > 0);
      if (nonNumeric.length >= 3 && i === 0) headerIdx = 0;
    }

    // Reconstruir lines saltando las filas de metadatos
    const lines = allLines.slice(headerIdx);

    // Parsear primera línea como headers
    // rawHAll: array completo con posiciones originales (incluye columnas vacías del banco)
    // rawH: solo columnas con nombre (para pattern matching, IA y UI)
    // Los índices del columnMap siempre se resuelven contra rawHAll para no desplazar posiciones
    const rawHAll = parseCSVLineFlexible(lines[0], sep);
    const rawH    = rawHAll.filter(h => h.trim() !== '');
    const normH   = rawH.map(normalizeHeader);
    // meta guarda rawHAll para el parser pero rawH para la UI
    const meta  = { lines, separator: sep, rawHeaders: rawH, rawHeadersFull: rawHAll, normalizedHeaders: normH };
    setRawCSVMeta(meta);

    // 2. ¿Es nuestro formato plantilla estándar?
    const stdFields = ['tipo', 'descripcion', 'monto', 'fecha'];
    const isTemplate = stdFields.every(f => normH.includes(f));
    if (isTemplate) {
      const templateMap = {
        tipo: rawH[normH.indexOf('tipo')],
        descripcion: rawH[normH.indexOf('descripcion')],
        monto: rawH[normH.indexOf('monto')],
        fecha: rawH[normH.indexOf('fecha')],
        categoria: normH.includes('categoria') ? rawH[normH.indexOf('categoria')] : undefined,
      };
      const parsed = parseWithColumnMap(lines, sep, rawHAll, templateMap);
      if (parsed.length > 0) {
        setMappingMode('template');
        setPreviewData(parsed);
        return;
      }
      console.warn('⚠️ Plantilla detectada pero 0 filas válidas — continuando...');
    }

    // 3. ¿Hay perfil guardado para este banco?
    const profile = getSavedProfile(normH);
    if (profile) {
      console.log('✅ Perfil bancario guardado encontrado:', profile.profileName);
      const parsed = parseWithColumnMap(lines, sep, rawHAll, profile.columnMap);
      if (parsed.length > 0) {
        setMappingMode('profile');
        setPreviewData(parsed);
        return;
      }
      console.warn('⚠️ Perfil encontrado pero 0 filas válidas — continuando...');
    }

    // 4. OPCIÓN A: Detección por patrones
    const patternMap = tryPatternMapping(normH, rawH);
    if (patternMap) {
      console.log('✅ Columnas detectadas por patrones:', patternMap);
      const parsed = parseWithColumnMap(lines, sep, rawHAll, patternMap);
      if (parsed.length > 0) {
        setMappingMode('pattern');
        setPreviewData(parsed);
        return;
      }
      console.warn('⚠️ Patrones detectados pero 0 filas válidas — continuando...');
    }

    // 5. OPCIÓN C: Detección por IA (si hay API key)
    const providers = aiInsights.checkProviders();
    if (providers.length > 0) {
      try {
        setError('🤖 Analizando formato del archivo con IA...');
        const sampleRows = lines.slice(1, 4).map(l => parseCSVLineFlexible(l, sep));
        const aiMap = await aiInsights.mapImportColumns(rawH, sampleRows);
        setError(null);
        if (aiMap && Object.keys(aiMap).length >= 2) {
          console.log('✅ IA detectó el mapa de columnas:', aiMap);
          const parsed = parseWithColumnMap(lines, sep, rawHAll, aiMap);
          if (parsed.length > 0) {
            setMappingMode('ai');
            setPreviewData(parsed);
            return;
          }
          console.warn('⚠️ IA mapeó columnas pero no hay filas válidas — pasando a manual');
        }
      } catch (aiErr) {
        console.warn('⚠️ IA no pudo mapear:', aiErr.message);
        setError(null);
      }
    }

    // 6. OPCIÓN B: Mapeador manual
    console.log('📋 Mostrando mapeador manual de columnas');
    setMappingMode('manual');
    setManualMap({});
    setShowColumnMapper(true);
  };

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Solo se aceptan archivos .csv o .txt');
      return;
    }

    // flushSync fuerza a React a pintar el spinner de forma síncrona
    // ANTES de que el hilo principal empiece a leer el archivo.
    // Es la única API que garantiza un render real antes de trabajo CPU.
    flushSync(() => {
      setError(null);
      setPreviewData(null);
      setImportStats(null);
      setShowColumnMapper(false);
      setMappingMode(null);
      setRawCSVMeta(null);
      setManualMap({});
      setSaveProfileName('');
      setLoadingFile(true);
    });

    const MIN_SPIN_MS = 900;
    const startTime = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_SPIN_MS - elapsed);
      if (remaining > 0) {
        setTimeout(() => setLoadingFile(false), remaining);
      } else {
        setLoadingFile(false);
      }
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await tryAutoDetect(event.target.result);
      } catch (err) {
        setError(`Error al leer el archivo: ${err.message}`);
      } finally {
        finishLoading();
      }
    };
    reader.onerror = () => {
      finishLoading();
      setError('Error al leer el archivo. Guárdalo como CSV UTF-8.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  /** Aplica el mapa definido manualmente y opcionalmente guarda el perfil del banco */
  const applyManualMap = () => {
    if (!rawCSVMeta) return;
    const { lines, separator, rawHeaders, rawHeadersFull, normalizedHeaders } = rawCSVMeta;
    const fullHeaders = rawHeadersFull || rawHeaders; // compatibilidad hacia atrás
    const hasFecha = !!manualMap.fecha;
    const hasDesc  = !!manualMap.descripcion;
    const hasMonto = !!manualMap.monto || !!manualMap.debito || !!manualMap.credito;
    if (!hasFecha || !hasDesc || !hasMonto) {
      setError('Asigna al menos: Fecha, Descripción y un campo de monto.');
      return;
    }
    if (saveProfileName.trim()) {
      saveProfile(normalizedHeaders, manualMap, saveProfileName.trim());
    }
    try {
      const parsed = parseWithColumnMap(lines, separator, fullHeaders, manualMap);
      if (parsed.length === 0) {
        setError('No se encontraron filas válidas con el mapa aplicado. Verifica que las columnas seleccionadas contengan datos correctos.');
        return;
      }
      setError(null);
      setShowColumnMapper(false);
      setPreviewData(parsed);
    } catch (err) {
      setError(`Error al aplicar el mapa: ${err.message}`);
    }
  };

  // Parsear CSV manualmente (sin dependencias externas)
  const _parseCSV = (text) => {
    // Limpiar BOM (Byte Order Mark) y normalizar el texto
    let cleanText = text;
    
    // Eliminar BOM UTF-8 si existe
    if (cleanText.charCodeAt(0) === 0xFEFF) {
      cleanText = cleanText.slice(1);
    }
    
    // Reemplazar diferentes tipos de saltos de línea
    cleanText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Parser CSV mejorado que maneja comillas
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Comilla escapada ""
            current += '"';
            i++; // Saltar la siguiente comilla
          } else {
            // Toggle estado de comillas
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Fin de campo
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Agregar el último campo
      result.push(current.trim());
      return result;
    };
    
    const lines = cleanText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('El archivo debe tener al menos una fila de datos');
    }

    // Primera línea = headers
    const rawHeaders = parseCSVLine(lines[0]);
    const normalizedHeaders = rawHeaders.map(h => 
      h.toLowerCase()
       .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
       .replace(/[^\w\s]/g, '') // Eliminar caracteres especiales excepto espacios
       .trim()
    );
    
    console.log('Headers detectados:', normalizedHeaders);
    console.log('Headers originales:', rawHeaders);
    
    // Validar headers requeridos (sin tildes para comparación)
    const requiredHeaders = ['tipo', 'descripcion', 'monto', 'fecha'];
    const missingHeaders = requiredHeaders.filter(h => !normalizedHeaders.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Faltan columnas requeridas: ${missingHeaders.join(', ')}. Detectadas: ${normalizedHeaders.join(', ')}`);
    }

    // 🔥 CREAR MAPA DE ÍNDICES POR NOMBRE DE COLUMNA
    const columnIndexMap = {};
    normalizedHeaders.forEach((header, idx) => {
      columnIndexMap[header] = idx;
    });
    
    console.log('Mapa de columnas:', columnIndexMap);

    // Parsear filas
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      // Permitir filas con menos columnas (categoría opcional)
      if (values.length < 4) {
        console.warn(`Fila ${i + 1} omitida: menos de 4 columnas`);
        continue;
      }
      
      // 🔥 MAPEAR VALORES POR NOMBRE DE COLUMNA
      let fecha = (values[columnIndexMap['fecha']] || '').trim();
      
      // Convertir formato Excel (4-Dec-25) a DD/MM/YYYY
      fecha = convertExcelDate(fecha);
      
      // Normalizar formato de fecha: 3/11/2025 → 03/11/2025
      if (fecha.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parts = fecha.split('/');
        fecha = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
      
      // Convertir monto a valor absoluto (siempre positivo)
      let monto = (values[columnIndexMap['monto']] || '').trim();
      const montoNum = parseFloat(monto);
      if (!isNaN(montoNum)) {
        monto = Math.abs(montoNum).toString();
      }
      
      const row = {
        tipo: (values[columnIndexMap['tipo']] || '').toLowerCase().trim(),
        descripcion: (values[columnIndexMap['descripcion']] || '').trim(),
        monto: monto,
        fecha: fecha,
        categoria: columnIndexMap['categoria'] !== undefined ? (values[columnIndexMap['categoria']] || '').trim() : '',
      };

      console.log(`Fila ${i + 1}:`, row);

      // Validar fila
      const validation = validateRow(row);
      if (validation.valid) {
        data.push({ ...row, rowNumber: i + 1 });
      } else {
        console.warn(`Fila ${i + 1} omitida: ${validation.error}`, row);
      }
    }

    return data;
  };

  // Convertir fechas de formato Excel a DD/MM/YYYY
  const convertExcelDate = (dateStr) => {
    // Mapeo de meses abreviados en inglés
    const monthMap = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    // Formato: "4-Dec-25" o "24-Feb-26"
    const excelFormatRegex = /^(\d{1,2})-([a-zA-Z]{3})-(\d{2})$/;
    const match = dateStr.match(excelFormatRegex);
    
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthAbbr = match[2].toLowerCase();
      const yearShort = match[3];
      
      // Convertir año de 2 dígitos a 4 dígitos (asumiendo 2000-2099)
      const year = `20${yearShort}`;
      
      const month = monthMap[monthAbbr];
      if (month) {
        return `${day}/${month}/${year}`;
      }
    }
    
    // Si no es formato Excel, devolver como está
    return dateStr;
  };

  /** Parsea una línea CSV respetando comillas y cualquier separador */
  const parseCSVLineFlexible = (line, separator = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"') {
        if (inQuotes && next === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  /**
   * Parsea el CSV usando un mapa de columnas flexible.
   * Soporta: columna única de monto, columnas separadas débito/crédito,
   * inferencia de tipo por signo del monto, y columna tipo explícita.
   */
  /** Convierte un string numérico bancario a float, manejando formatos locales.
   * Soporta: "1,234.56" / "1.234,56" / "($4.00)" / "$2.00" / "B/.1,234.56" */
  const parseAmount = (raw) => {
    if (!raw) return 0;
    let s = raw.toString().trim();
    // Paréntesis = negativo: ($4.00) → -4.00
    const negative = s.startsWith('(') && s.endsWith(')');
    s = s.replace(/[()]/g, '');
    // Quitar símbolos de moneda: $, €, B/., ₡, £, ¥, etc.
    s = s.replace(/[$€£¥₡]|B\/\./g, '').trim();
    // Detectar separador decimal: si hay coma Y punto, el último es el decimal
    const hasComma = s.includes(',');
    const hasDot   = s.includes('.');
    if (hasComma && hasDot) {
      // e.g. "1,234.56" → punto decimal  |  "1.234,56" → coma decimal
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (hasComma && !hasDot) {
      // "1234,56" → coma decimal  |  "1,234" → coma de miles
      const parts = s.split(',');
      s = parts.length === 2 && parts[1].length <= 2
        ? s.replace(',', '.')   // decimal
        : s.replace(/,/g, ''); // miles
    }
    // Quitar espacios de miles: "1 234 56" → "123456"
    s = s.replace(/\s/g, '');
    const val = parseFloat(s) || 0;
    return negative ? -Math.abs(val) : val;
  };

  const parseWithColumnMap = (lines, separator, rawHeaders, columnMap) => {
    // Construir índice header → posición (búsqueda exacta + fallback insensible a mayúsculas)
    const idx = {};
    rawHeaders.forEach((h, i) => { idx[h] = i; });
    // índice normalizado para cuando la IA devuelve nombres en minúsculas
    const idxLower = {};
    rawHeaders.forEach((h, i) => { idxLower[h.toLowerCase().trim()] = i; });

    const resolveCol = (colName) => {
      if (colName === undefined) return undefined;
      if (idx[colName] !== undefined) return idx[colName];
      return idxLower[colName.toLowerCase().trim()];
    };

    const getVal = (row, field) => {
      const colName = columnMap[field];
      const pos = resolveCol(colName);
      return pos !== undefined ? (row[pos] || '').trim() : '';
    };

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLineFlexible(lines[i], separator);
      if (values.length < 2) continue;

      // — Fecha —
      let fecha = getVal(values, 'fecha');
      fecha = convertExcelDate(fecha);
      if (fecha.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const p = fecha.split('/');
        fecha = `${p[0].padStart(2,'0')}/${p[1].padStart(2,'0')}/${p[2]}`;
      }

      // — Descripción —
      const descripcion = getVal(values, 'descripcion');

      // — Monto y Tipo —
      let monto, tipo;

      if (columnMap.monto) {
        // Columna única de importe
        const raw = parseAmount(getVal(values, 'monto'));
        monto = Math.abs(raw);
        if (columnMap.tipo) {
          const tipoRaw = getVal(values, 'tipo').toLowerCase();
          tipo = /c|ingreso|abono|credito|haber/.test(tipoRaw) ? 'ingreso' : 'gasto';
        } else {
          tipo = raw >= 0 ? 'ingreso' : 'gasto';
        }
      } else {
        // Columnas separadas débito / crédito
        const debitoVal  = Math.abs(parseAmount(getVal(values, 'debito')));
        const creditoVal = Math.abs(parseAmount(getVal(values, 'credito')));
        if (creditoVal > 0) { tipo = 'ingreso'; monto = creditoVal; }
        else                { tipo = 'gasto';   monto = debitoVal; }
      }

      // — Categoría —
      const categoria = getVal(values, 'categoria') || '';

      const row = { tipo, descripcion, monto: monto.toString(), fecha, categoria };
      const validation = validateRow(row);
      if (validation.valid) {
        data.push({ ...row, rowNumber: i + 1 });
      } else if (data.length === 0 && i <= 3) {
        // Log diagnóstico solo para las primeras filas si nada ha pasado aún
        console.warn(`🔍 Fila ${i + 1} rechazada (${validation.error}):`, { row, rawValues: values });
      }
    }

    if (data.length === 0) {
      console.warn('❌ parseWithColumnMap: 0 filas válidas. columnMap usado:', columnMap, '| Headers:', rawHeaders);
    } else {
      console.log(`✅ parseWithColumnMap: ${data.length} filas válidas`);
    }
    return data; // puede retornar [] — el llamador decide si mostrar error o mapper manual
  };

  // Validar una fila individual
  const validateRow = (row) => {
    // Tipo debe ser "ingreso" o "gasto" (ya viene normalizado a minúsculas)
    if (!['ingreso', 'gasto'].includes(row.tipo)) {
      return { valid: false, error: 'Tipo debe ser "ingreso" o "gasto"' };
    }

    // Descripción no vacía
    if (!row.descripcion || row.descripcion.trim() === '') {
      return { valid: false, error: 'Descripción vacía' };
    }

    // Monto debe ser número positivo (ya fue convertido a absoluto en el parseo)
    const amount = parseFloat(row.monto);
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Monto inválido (debe ser un número positivo)' };
    }

    // Fecha debe ser válida (YYYY-MM-DD o DD/MM/YYYY)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(row.fecha)) {
      return { valid: false, error: 'Fecha inválida (usar YYYY-MM-DD o DD/MM/YYYY)' };
    }

    return { valid: true };
  };

  // Ejecutar importación
  const handleImport = async () => {
    if (!previewData || previewData.length === 0) return;

    setImporting(true);
    setError(null);
    setCategorizingProgress(null);

    try {
      console.log('🚀 Preparando', previewData.length, 'transacciones para importación masiva');

      let dataToImport = previewData;

      // ✨ AUTO-CATEGORIZACIÓN CON IA (si está activada)
      if (autoCategorize) {
        console.log('🤖 Auto-categorización activada, analizando transacciones...');
        
        // Filtrar solo gastos sin categoría o con categoría "Otros"
        const needsCategorization = previewData.filter(row => 
          row.tipo.toLowerCase() === 'gasto' && (!row.categoria || row.categoria === 'Otros')
        );

        if (needsCategorization.length > 0) {
          console.log(`🔍 ${needsCategorization.length} transacciones necesitan categorización`);
          
          setCategorizingProgress({
            total: needsCategorization.length,
            current: 0,
            status: 'Categorizando con IA...'
          });

          try {
            // Preparar transacciones para IA
            const transactionsForAI = needsCategorization.map(row => ({
              description: row.descripcion,
              amount: parseFloat(row.monto),
              type: 'expense'
            }));

            // Llamar a IA para categorizar en lote
            const categorized = await aiInsights.bulkCategorize(transactionsForAI);

            // Actualizar previewData con categorías sugeridas
            dataToImport = previewData.map(row => {
              if (row.tipo.toLowerCase() === 'gasto' && (!row.categoria || row.categoria === 'Otros')) {
                const aiResult = categorized.find(c => c.description === row.descripcion);
                if (aiResult && aiResult.category) {
                  console.log(`✨ "${row.descripcion}" → ${aiResult.category} (${Math.round(aiResult.aiConfidence * 100)}% confianza)`);
                  return {
                    ...row,
                    categoria: aiResult.category,
                    aiCategorized: true,
                    aiConfidence: aiResult.aiConfidence
                  };
                }
              }
              return row;
            });

            setCategorizingProgress({
              total: needsCategorization.length,
              current: needsCategorization.length,
              status: '✅ Categorización completada'
            });

            console.log('✅ Auto-categorización completada');
          } catch (aiError) {
            console.warn('⚠️ Error en auto-categorización, continuando sin ella:', aiError);
            setCategorizingProgress(null);
          }
        } else {
          console.log('ℹ️ Todas las transacciones ya tienen categoría');
        }
      }

      // Si existe onBulkImport, usar importación masiva (más rápido)
      if (onBulkImport) {
        // Preparar todas las transacciones en un solo array
        const transactionsToImport = dataToImport.map(row => {
          // Convertir fecha si es DD/MM/YYYY
          let date = row.fecha;
          if (date.includes('/')) {
            const [day, month, year] = date.split('/');
            date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }

          return {
            type: row.tipo.toLowerCase() === 'ingreso' ? 'income' : 'expense',
            description: row.descripcion,
            amount: parseFloat(row.monto),
            date,
            category: row.tipo.toLowerCase() === 'gasto' ? (row.categoria || 'Otros') : undefined,
            aiCategorized: row.aiCategorized || false, // Marcar si fue categorizado por IA
            aiConfidence: row.aiConfidence || 0,
          };
        });

        console.log('📦 Transacciones preparadas:', transactionsToImport.length);
        
        // Llamar a la función de importación masiva
        const result = await onBulkImport(transactionsToImport);
        
        console.log('✅ Resultado de importación:', result);

        setImportStats({
          total: dataToImport.length,
          imported: result.imported || 0,
          errors: result.errors || 0,
          aiCategorized: dataToImport.filter(r => r.aiCategorized).length,
        });
      } else {
        // Fallback: Importación secuencial (para compatibilidad)
        console.warn('⚠️ onBulkImport no disponible, usando importación secuencial');
        
        const stats = {
          total: previewData.length,
          imported: 0,
          errors: 0,
        };

        for (const row of previewData) {
          try {
            // Convertir fecha si es DD/MM/YYYY
            let date = row.fecha;
            if (date.includes('/')) {
              const [day, month, year] = date.split('/');
              date = `${year}-${month}-${day}`;
            }

            // Determinar categoría (solo para gastos)
            const category = row.categoria || 'Otros';

            // Llamar a la función onImport del parent
            if (row.tipo.toLowerCase() === 'ingreso') {
              await onImport('income', {
                description: row.descripcion,
                amount: parseFloat(row.monto),
                date,
              });
            } else {
              await onImport('expense', {
                description: row.descripcion,
                category,
                amount: parseFloat(row.monto),
                date,
              });
            }

            stats.imported++;
          } catch (err) {
            console.error(`Error importando fila ${row.rowNumber}:`, err);
            stats.errors++;
          }
        }

        setImportStats(stats);
      }

      setPreviewData(null);
    } catch (err) {
      console.error('❌ Error durante la importación:', err);
      setError(`Error durante la importación: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Descargar plantilla CSV
  const downloadTemplate = () => {
    const template = `tipo,descripcion,monto,fecha,categoria
ingreso,Salario,2500.00,2025-11-01,
gasto,Supermercado,45.50,2025-11-05,Comida
gasto,Netflix,12.99,2025-11-10,Entretenimiento
ingreso,Freelance,350.00,2025-11-15,
gasto,Gasolina,60.00,2025-11-18,Transporte
gasto,Restaurante,85.25,2025-11-20,Comida
ingreso,Venta producto,120.00,2025-11-22,
gasto,Farmacia,22.50,2025-11-25,Salud
gasto,Gym,40.00,2025-11-28,Ejercicio
gasto,Amazon,75.99,2025-11-30,Compras`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-transacciones.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Importar Transacciones
        </h3>
        <button
          onClick={downloadTemplate}
          className="text-sm px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          Descargar Plantilla CSV
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Formatos de archivo aceptados:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• <strong>Extracto bancario</strong>: sube el CSV directo de tu banco — se detectan las columnas automáticamente</li>
          <li>• <strong>Plantilla propia</strong>: columnas <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">tipo, descripcion, monto, fecha, categoria</code></li>
          <li>• Separador: coma <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">,</code> o punto y coma <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">;</code> (detectados automáticamente)</li>
          <li>• Fecha: YYYY-MM-DD, DD/MM/YYYY o formato Excel (4-Dec-25)</li>
          <li>• <strong>IMPORTANTE</strong>: Guarda como “CSV UTF-8 (delimitado por comas)” desde Excel</li>
        </ul>
      </div>

      {/* Mapeador manual de columnas */}
      {showColumnMapper && rawCSVMeta && (
        <div className="mb-6 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-300 dark:border-amber-700">
          <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-2">
            <span>🗂️</span> Asigna las columnas de tu banco
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">
            No se reconoció el formato automáticamente. Indica a qué campo corresponde cada columna de tu archivo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[{field:'fecha',label:'📅 Fecha',required:true},
              {field:'descripcion',label:'📝 Descripción',required:true},
              {field:'monto',label:'💲 Monto (columna única)',required:false},
              {field:'debito',label:'📤 Débito / Cargo',required:false},
              {field:'credito',label:'📥 Crédito / Abono',required:false},
              {field:'tipo',label:'🔄 Tipo (ing/gasto)',required:false},
              {field:'categoria',label:'🏷️ Categoría',required:false},
            ].map(({field, label, required}) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={manualMap[field] || ''}
                  onChange={e => setManualMap(prev => ({ ...prev, [field]: e.target.value || undefined }))}
                  className="w-full px-3 py-2 text-sm border-2 border-amber-200 dark:border-amber-700 rounded-lg
                    focus:border-amber-500 outline-none dark:bg-gray-700 dark:text-white"
                >
                  <option value="">— No aplicar —</option>
                  {rawCSVMeta.rawHeaders.map((h, hi) => (
                    <option key={`${hi}-${h}`} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-500 mb-3">
            💡 Si tu banco usa columnas separadas de Débito y Crédito, asigna ambas y deja Monto vacío.
          </p>

          {/* Guardar perfil */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
            <span className="text-sm">💾</span>
            <input
              type="text"
              placeholder="Nombre del banco (ej: Banco General) — opcional"
              value={saveProfileName}
              onChange={e => setSaveProfileName(e.target.value)}
              className="flex-1 text-sm px-3 py-1.5 border border-amber-200 dark:border-amber-700 rounded
                outline-none focus:border-amber-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={applyManualMap}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold
                rounded-lg transition-colors"
            >
              Aplicar mapa y previsualizar
            </button>
            <button
              onClick={() => { setShowColumnMapper(false); setError(null); }}
              className="px-4 py-2.5 border-2 border-amber-300 dark:border-amber-700 text-amber-700
                dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Selector de archivo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          1. Seleccionar archivo CSV:
        </label>

        {/* Spinner: reemplaza el input mientras se analiza el archivo */}
        {loadingFile ? (
          <div className="flex items-center gap-4 py-3 px-4 rounded-xl
            bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
            <Lottie
              animationData={loadingAnimation}
              loop
              autoplay
              style={{ width: 64, height: 64, flexShrink: 0 }}
            />
            <div>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Analizando archivo…
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Detectando formato del banco
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="flex-1 text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                dark:file:bg-purple-900/30 dark:file:text-purple-300
                hover:file:bg-purple-100 dark:hover:file:bg-purple-900/50
                file:cursor-pointer cursor-pointer"
            />
            {previewData && previewData.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{previewData.length} transacciones detectadas</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Vista previa */}
      {previewData && previewData.length > 0 && (
        <div className="mb-6 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              2. Vista previa
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* Badge: modo de detección de columnas */}
              {mappingMode === 'template' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                  📋 Plantilla estándar
                </span>
              )}
              {mappingMode === 'profile' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  💾 Perfil guardado
                </span>
              )}
              {mappingMode === 'pattern' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  🎯 Detectado por patrones
                </span>
              )}
              {mappingMode === 'ai' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  🤖 Mapeado por IA
                </span>
              )}
              {mappingMode === 'manual' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  🗂️ Configuración manual
                </span>
              )}
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                {previewData.length} transacciones
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        row.tipo.toLowerCase() === 'ingreso'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {row.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300 font-medium">{row.descripcion}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">${parseFloat(row.monto).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.fecha}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {row.categoria ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{row.categoria}</span>
                          {row.aiCategorized && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold flex items-center gap-1">
                              🤖 IA
                              {row.aiConfidence && (
                                <span className="text-blue-600 dark:text-blue-400">({Math.round(row.aiConfidence)}%)</span>
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.length > 10 && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-3 text-center font-medium">
              ... y {previewData.length - 10} transacciones más (mostrando primeras 10)
            </p>
          )}

          {/* ✨ OPCIÓN DE AUTO-CATEGORIZACIÓN CON IA */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={autoCategorize}
                onChange={(e) => setAutoCategorize(e.target.checked)}
                disabled={importing}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    🤖 Auto-categorizar con IA (Recomendado)
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                    GRATIS
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Las transacciones sin categoría serán analizadas automáticamente usando IA. 
                  Ejemplo: "Super 99" → Comida, "Uber" → Transporte, "Netflix" → Entretenimiento
                </p>
                {categorizingProgress && (
                  <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">{categorizingProgress.status}</span>
                    </div>
                    <div className="bg-blue-200 dark:bg-blue-900/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${(categorizingProgress.current / categorizingProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {categorizingProgress.current} de {categorizingProgress.total} categorizadas
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Botón de importación destacado */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg 
                hover:from-purple-700 hover:to-pink-700 
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl
                flex items-center justify-center gap-3"
            >
              {importing ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Importando {previewData.length} transacciones...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>3. Importar {previewData.length} transacciones al Dashboard</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            
            {/* Información adicional */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Logros se desbloquearán automáticamente</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <span>Estadísticas se actualizarán en tiempo real</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado de importación */}
      {importStats && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500 dark:bg-green-600 rounded-full">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-green-900 dark:text-green-300">
                ¡Importación Completada con Éxito!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Tus transacciones ya están en el dashboard
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{importStats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total procesadas</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{importStats.imported}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Importadas ✓</div>
            </div>
            {importStats.aiCategorized > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{importStats.aiCategorized}</div>
                  <span className="text-lg">🤖</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categorizadas con IA</div>
              </div>
            )}
            {importStats.errors > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{importStats.errors}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Omitidas</div>
              </div>
            )}
          </div>

          {/* Mensaje especial de IA */}
          {importStats.aiCategorized > 0 && (
            <div className="flex items-start gap-2 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700 mb-4">
              <span className="text-2xl flex-shrink-0">✨</span>
              <div className="text-sm">
                <p className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  ¡La IA ha categorizado automáticamente {importStats.aiCategorized} transacciones!
                </p>
                <p className="text-purple-700 dark:text-purple-400">
                  Nuestros modelos de IA analizaron las descripciones de tus transacciones y asignaron categorías inteligentemente.
                  Ejemplos: "Super 99" → Comida, "Uber" → Transporte, "Netflix" → Entretenimiento.
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-2 italic">
                  💡 Revisa las categorías asignadas y ajústalas si es necesario desde tu lista de transacciones.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Próximos pasos:</p>
              <ul className="space-y-1">
                <li>✓ Desplázate hacia arriba para ver tus transacciones</li>
                <li>✓ Revisa el Balance General actualizado</li>
                <li>✓ Verifica los gráficos con tus nuevos datos</li>
                <li>✓ Chequea qué logros desbloqueaste en la sección de Gamificación</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
