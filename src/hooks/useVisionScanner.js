import { useState, useCallback } from 'react';
import { EXPENSE_CATEGORIES } from '../constants/categories';

/**
 * Hook useVisionScanner - Maneja OCR e Inteligencia de Extracción
 * Usa un cargador dinámico por Script para evitar errores de Vite mientras se instala.
 */
export const useVisionScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Cargador de Tesseract via CDN (Resiliencia Garantizada)
  const loadTesseract = () => {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) return resolve(window.Tesseract);
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Tesseract.js cargado via CDN');
        resolve(window.Tesseract);
      };
      script.onerror = () => reject(new Error('No se pudo cargar Tesseract desde el CDN'));
      document.head.appendChild(script);
    });
  };

  const parseText = (text) => {
    const lines = text.split('\n').map(l => l.trim().toLowerCase());
    
    // 1. EXTRAER MONTO
    let amount = 0;
    const amountRegex = /(?:total|importe|neto|pagar|sum|amt|[$])\s*[:$]?\s*(\d+[.,]\d{2})/g;
    let match;
    const matches = [];
    while ((match = amountRegex.exec(text.toLowerCase())) !== null) {
      matches.push(parseFloat(match[1].replace(',', '.')));
    }
    
    if (matches.length > 0) {
      amount = Math.max(...matches);
    } else {
      const allNumbers = text.match(/\d+[.,]\d{2}/g) || [];
      const parsedNumbers = allNumbers.map(n => parseFloat(n.replace(',', '.')));
      if (parsedNumbers.length > 0) amount = Math.max(...parsedNumbers);
    }

    // 2. EXTRAER CATEGORÍA
    let detectedCategory = 'Otros';
    const firstLines = lines.slice(0, 10).join(' ');
    
    if (firstLines.match(/restaurante|caf|comida|food|uber eats|pedidos|pizza|burger/)) detectedCategory = 'Alimentación';
    else if (firstLines.match(/supermercado|carrefour|walmart|tienda|market|abarrotes/)) detectedCategory = 'Supermercado';
    else if (firstLines.match(/uber|didi|cabify|taxi|gasolina|repsol|shell|estacion/)) detectedCategory = 'Transporte';
    else if (firstLines.match(/farmacia|doctor|clínica|salud|health|hospital/)) detectedCategory = 'Salud';
    else if (firstLines.match(/amazon|mercadolibre|ebay|shopee|tienda|ropa|zara/)) detectedCategory = 'Compras';
    else if (firstLines.match(/netflix|spotify|cine|teatro|juego|gaming|steam/)) detectedCategory = 'Ocio';

    const validLines = lines.filter(l => l.length > 3 && !l.match(/\d/));
    const description = validLines[0] ? validLines[0].toUpperCase() : 'Gasto Escaneado';

    return {
      amount,
      category: EXPENSE_CATEGORIES.find(c => c.label === detectedCategory)?.value || 'Otros',
      description,
      date: new Date().toISOString().split('T')[0]
    };
  };

  const scanImage = useCallback(async (imageSource) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Cargamos Tesseract desde el CDN para evitar errores de Vite
      const Tesseract = await loadTesseract();
      
      const worker = await Tesseract.createWorker({
        logger: m => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        }
      });

      await worker.loadLanguage('spa+eng');
      await worker.initialize('spa+eng');
      const { data: { text } } = await worker.recognize(imageSource);
      await worker.terminate();

      const result = parseText(text);
      setIsProcessing(false);
      return result;
    } catch (error) {
      console.error('Error en el escaneo OCR:', error);
      setIsProcessing(false);
      throw error;
    }
  }, []);

  return { scanImage, isProcessing, progress };
};
