import Decimal from 'decimal.js';

// Configuración de precisión
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Convierte string/number a centavos (integer) para evitar errores de punto flotante
 * @param {string|number} amount - Monto a convertir
 * @returns {number} Monto en centavos
 */
export const toCents = (amount) => {
  if (!amount || amount === '') return 0;
  const decimal = new Decimal(amount);
  return decimal.times(100).toNumber();
};

/**
 * Convierte centavos a dólares (float)
 * @param {number} cents - Centavos
 * @returns {number} Dólares con 2 decimales
 */
export const fromCents = (cents) => {
  if (!cents) return 0;
  const decimal = new Decimal(cents);
  return decimal.dividedBy(100).toDecimalPlaces(2).toNumber();
};

/**
 * Suma dos montos con precisión decimal
 * @param {number} a - Primer monto
 * @param {number} b - Segundo monto
 * @returns {number} Suma precisa
 */
export const addAmounts = (a, b) => {
  return new Decimal(a || 0).plus(b || 0).toDecimalPlaces(2).toNumber();
};

/**
 * Resta dos montos con precisión decimal
 * @param {number} a - Minuendo
 * @param {number} b - Sustraendo
 * @returns {number} Diferencia precisa
 */
export const subtractAmounts = (a, b) => {
  return new Decimal(a || 0).minus(b || 0).toDecimalPlaces(2).toNumber();
};

/**
 * Calcula porcentaje con precisión
 * @param {number} partial - Valor parcial
 * @param {number} total - Valor total
 * @returns {number} Porcentaje con 2 decimales
 */
export const calculatePercentage = (partial, total) => {
  if (!total || total === 0) return 0;
  return new Decimal(partial || 0)
    .dividedBy(total)
    .times(100)
    .toDecimalPlaces(2)
    .toNumber();
};

/**
 * Limpia input de moneda (remueve $, comas, etc.)
 * @param {string} value - Valor del input
 * @returns {string} Valor limpio
 */
export const cleanCurrencyInput = (value) => {
  if (!value) return '';
  return value.replace(/[^0-9.]/g, '');
};

/**
 * Valida que un monto sea válido (positivo, 2 decimales max)
 * @param {string|number} amount - Monto a validar
 * @returns {boolean}
 */
export const isValidAmount = (amount) => {
  if (!amount || amount === '') return false;
  const cleaned = cleanCurrencyInput(String(amount));
  const num = parseFloat(cleaned);
  
  if (isNaN(num) || num <= 0) return false;
  
  // Verificar máximo 2 decimales
  const decimalPart = cleaned.split('.')[1];
  if (decimalPart && decimalPart.length > 2) return false;
  
  // Verificar límite realista (999,999.99)
  if (num > 999999.99) return false;
  
  return true;
};
