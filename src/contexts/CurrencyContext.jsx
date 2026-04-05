import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CurrencyContext = createContext(null);

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'Dólar Americano',   flag: '🇺🇸' },
  { code: 'PAB', symbol: 'B/.', name: 'Balboa Panameño',   flag: '🇵🇦' },
  { code: 'EUR', symbol: '€',   name: 'Euro',              flag: '🇪🇺' },
  { code: 'MXN', symbol: '$',   name: 'Peso Mexicano',     flag: '🇲🇽' },
  { code: 'COP', symbol: '$',   name: 'Peso Colombiano',   flag: '🇨🇴' },
  { code: 'ARS', symbol: '$',   name: 'Peso Argentino',    flag: '🇦🇷' },
  { code: 'BRL', symbol: 'R$',  name: 'Real Brasileño',    flag: '🇧🇷' },
  { code: 'PEN', symbol: 'S/.', name: 'Sol Peruano',       flag: '🇵🇪' },
  { code: 'CLP', symbol: '$',   name: 'Peso Chileno',      flag: '🇨🇱' },
  { code: 'GBP', symbol: '£',   name: 'Libra Esterlina',   flag: '🇬🇧' },
];

// Tasas de respaldo (USD como base) actualizadas aproximadamente
const FALLBACK_RATES = {
  USD: 1, PAB: 1, EUR: 0.92, MXN: 17.5, COP: 4100,
  ARS: 920, BRL: 5.0, PEN: 3.75, CLP: 960, GBP: 0.79,
};

const RATES_CACHE_KEY = 'budget_currency_rates';
const RATES_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

/**
 * CurrencyProvider – envuelve la app y provee conversión de moneda en tiempo real.
 * Usa la API gratuita frankfurter.app (sin llave requerida).
 *
 * Las transacciones se almacenan en su moneda base (USD por defecto);
 * este contexto sólo controla cómo se MUESTRAN los montos.
 */
export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage('budget_display_currency', 'USD');
  const [currencyFreq, setCurrencyFreq] = useLocalStorage('budget_currency_freq', { 'USD': 1 });
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(false);

  /**
   * Obtiene la divisa de uso más frecuente por este usuario.
   */
  const getSmartDefaultCurrency = useCallback(() => {
    let topCode = 'USD';
    let max = 0;
    Object.entries(currencyFreq).forEach(([code, count]) => {
      if (count > max) {
        max = count;
        topCode = code;
      }
    });
    // Validar si existe en los soportados
    return SUPPORTED_CURRENCIES.find(c => c.code === topCode) ? topCode : 'USD';
  }, [currencyFreq]);

  /**
   * Registra estadísticamente cuando un usuario usa una moneda al guardar.
   */
  const recordCurrencyUsage = useCallback((code) => {
    setCurrencyFreq(prev => ({
      ...prev,
      [code]: (prev[code] || 0) + 1
    }));
  }, [setCurrencyFreq]);


  const fetchRates = useCallback(async () => {
    // Revisar caché para evitar llamadas excesivas
    try {
      const cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < RATES_CACHE_TTL) {
        setRates(cached.data);
        return;
      }
    } catch { /* caché inválida */ }

    setRatesLoading(true);
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const newRates = { USD: 1, PAB: 1, ...data.rates };
      setRates(newRates);
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: newRates }));
    } catch {
      // Mantener las tasas de respaldo ya cargadas
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  /**
   * Conversor Absoluto: Convierte un monto de CUALQUIER moneda origen a otra destino.
   * Resuelve el salto triangular: (Monto / TasaOrigen) * TasaDestino
   */
  const convertCurrency = useCallback((amount, fromCode = 'USD', toCode = selectedCurrency) => {
    const rateFrom = rates[fromCode] || 1;
    const rateTo = rates[toCode] || 1;
    // Si ambas son iguales, retorna directo
    if (fromCode === toCode) return Number(amount);
    
    // Primero pasamos de fromCode -> USD base (dividiendo por su tasa frente al dólar)
    const amountInUSD = amount / rateFrom;
    // Luego de USD base -> toCode (multiplicando por la tasa del destino)
    return amountInUSD * rateTo;
  }, [rates, selectedCurrency]);

  /**
   * Compatibilidad hacia atrás: Convierte de USD a la seleccionada.
   */
  const convertFromUSD = useCallback(
    (amountUSD, toCurrency = selectedCurrency) => convertCurrency(amountUSD, 'USD', toCurrency),
    [convertCurrency, selectedCurrency]
  );

  /**
   * Formatea un monto USD al string con símbolo de la moneda seleccionada.
   * @param {number} amountUSD
   * @param {string} [currency]
   */
  const formatAmount = useCallback(
    (amountUSD, currency = selectedCurrency) => {
      const converted = convertFromUSD(amountUSD, currency);
      try {
        return new Intl.NumberFormat('es-419', {
          style: 'currency',
          currency: currency === 'PAB' ? 'USD' : currency, // PAB no es reconocida por Intl
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(converted).replace('US$', 'B/.');
      } catch {
        const sym = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
        return `${sym}${converted.toFixed(2)}`;
      }
    },
    [convertFromUSD, selectedCurrency]
  );

  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) ?? SUPPORTED_CURRENCIES[0];

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        rates,
        ratesLoading,
        convertFromUSD,
        convertCurrency, // Novedad Multi-moneda
        formatAmount,
        currencyInfo,
        currencies: SUPPORTED_CURRENCIES,
        getSmartDefaultCurrency, // Predictivo
        recordCurrencyUsage, // Predictivo
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency debe usarse dentro de CurrencyProvider');
  return ctx;
};
