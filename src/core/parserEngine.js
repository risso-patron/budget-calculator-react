/**
 * parserEngine.js
 * Motor de procesamiento básico de archivos de texto (CSV/TXT).
 * Encargado de: limpieza, detección de separadores y tokenización.
 */

/** Detecta el separador más probable (coma, punto y coma o tabulador) */
export const detectSeparator = (text) => {
  const firstLine = (text.split('\n')[0] || '').substring(0, 1000);
  const semi  = (firstLine.match(/;/g)  || []).length;
  const comma = (firstLine.match(/,/g)  || []).length;
  const tab   = (firstLine.match(/\t/g) || []).length;
  if (semi  > comma && semi  > tab) return ';';
  if (tab   > comma)               return '\t';
  return ',';
};

/** Parsea una línea CSV respetando comillas y el separador dado */
export const parseCSVLineFlexible = (line, separator = ',') => {
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
 * Limpia y procesa el texto crudo del archivo 
 * Retorna { rows, separator }
 */
export const parseRawText = (text) => {
  let clean = text;
  
  // 1. Limpiar BOM (Byte Order Mark)
  if (clean.charCodeAt(0) === 0xFEFF) clean = clean.slice(1);
  
  // 2. Normalizar saltos de línea (Windows/Mac/Linux)
  clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const separator = detectSeparator(clean);
  
  // 3. Dividir en filas (filtrando vacías)
  const rows = clean.split('\n').filter(l => l.trim().length > 0);
  
  if (rows.length < 2) {
    throw new Error('El archivo debe tener al menos una fila de datos');
  }

  return { rows, separator };
};
