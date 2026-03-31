/**
 * normalizationEngine.js
 * Motor de estandarización de datos financieros.
 * Convierte fechas, montos y textos de formatos bancarios a estándares ISO/Number.
 */

/** Limpia espacios y normaliza texto */
export const cleanText = (val) => 
  (val || '').toString().trim().replace(/\s+/g, ' ');

/** Convierte fechas (Excel, DD/MM, MM/DD, ISO) a YYYY-MM-DD */
export const normalizeDate = (dateStr) => {
  if (!dateStr) return null;
  let s = dateStr.trim();
  
  // 1. Manejo de formato Excel (ej: 4-Dec-25)
  const monthMap = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  const excelMatch = s.match(/^(\d{1,2})-([a-zA-Z]{3})-(\d{2,4})$/);
  if (excelMatch) {
    const d = excelMatch[1].padStart(2, '0');
    const m = monthMap[excelMatch[2].toLowerCase()];
    const y = excelMatch[3].length === 2 ? `20${excelMatch[3]}` : excelMatch[3];
    if (m) return `${y}-${m}-${d}`;
  }

  // 2. Formato DD/MM/YYYY o MM/DD/YYYY
  const slashMatch = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    let d = slashMatch[1].padStart(2, '0');
    let m = slashMatch[2].padStart(2, '0');
    let y = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    
    // Heurística simple: si d > 12, d es el día
    if (parseInt(d) > 12) return `${y}-${m}-${d}`;
    // Por defecto asume DD/MM/YYYY (común en LATAM/EU)
    return `${y}-${m}-${d}`;
  }

  // 3. Ya es ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);

  return null;
};

/** Convierte importes monetarios a float (maneja $1.234,56 o 1,234.56) */
export const normalizeAmount = (raw) => {
  if (raw === undefined || raw === null || raw === '') return 0;
  let s = raw.toString().trim();
  
  const isNegative = s.startsWith('(') && s.endsWith(')') || s.startsWith('-');
  s = s.replace(/[()\- $€£¥]|B\/\./g, '');

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = s.split(',');
    s = (parts.length === 2 && parts[1].length <= 2) ? s.replace(',', '.') : s.replace(/,/g, '');
  }

  const val = parseFloat(s) || 0;
  return isNegative ? -Math.abs(val) : val;
};

/** 
 * Procesa las filas crudas y retorna objetos normalizados
 */
export const normalizeRows = (rows, headerIdx, mapping) => {
  const result = [];
  // Empezamos después del header
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const values = rows[i]; // Ya parseadas por parseCSVLineFlexible en ImportManager
    if (!values || values.length < 2) continue;

    const rawDate = values[mapping.date];
    const rawAmount = values[mapping.amount];
    const rawDesc = values[mapping.description];

    const date = normalizeDate(rawDate);
    const amount = normalizeAmount(rawAmount);
    const description = cleanText(rawDesc);

    if (date && description) {
      result.push({ date, amount, description });
    }
  }
  return result;
};
