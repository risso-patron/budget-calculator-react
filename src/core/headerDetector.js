/**
 * headerDetector.js
 * Motor especializado en identificar la fila de cabeceras real en un extracto bancario.
 * Capacidad de saltar metadatos de bancos (logo, cuenta, período, etc.).
 */

import { parseCSVLineFlexible } from './parserEngine';

/** Normaliza un header para comparación robusta */
export const normalizeHeader = (h) =>
  h.toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^\w\s]/g, '')
   .trim();

/** 
 * Detecta el índice de la fila header (0-indexed)
 * @param {string[]} rows Filas de texto crudo
 * @param {string} separator Separador (coma, punto y coma, tab)
 * @param {string[]} aliases Lista de palabras clave conocidas (fecha, monto, etc.)
 */
export const findHeaderIndex = (rows, separator, aliases) => {
  let headerIdx = 0;
  
  // Escaneamos las primeras 10 líneas (límite de seguridad para extractos estándar)
  for (let i = 0; i < Math.min(rows.length - 1, 10); i++) {
    const tokens = parseCSVLineFlexible(rows[i], separator);
    
    // Heurística 1: Al menos dos tokens y uno coincide con alias conocidos
    if (tokens.length >= 2) {
      const normalized = tokens.map(normalizeHeader);
      const hasKnownAlias = normalized.some(h => aliases.includes(h));
      if (hasKnownAlias) {
        headerIdx = i;
        break;
      }
    }

    // Heurística 2: Si es la fila 0 y tiene al menos 3 campos no numéricos largos
    if (i === 0) {
      const nonNumeric = tokens.filter(t => isNaN(t.replace(/[.,]/g, '')) && t.length > 0);
      if (nonNumeric.length >= 3) {
        headerIdx = 0;
      }
    }
  }

  return headerIdx;
};
