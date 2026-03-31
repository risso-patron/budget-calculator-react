/**
 * aiService.js
 * Capa de servicio para abstraer las llamadas a proveedores de IA.
 * Utiliza la infraestructura existente de ai-providers.js.
 */

import { bulkCategorizeTransactions } from '../lib/ai-providers';

/**
 * Categoriza descripciones en lote usando IA (Gemini/Groq/Claude)
 * @param {string[]} descriptions Lista de descripciones de transacciones
 * @returns {Promise<Array>} [{ description, category, aiConfidence }]
 */
export const categorizeWithAI = async (descriptions) => {
  if (!descriptions || descriptions.length === 0) return [];
  
  try {
    console.log(`🤖 AI Service: Solicitando categorización para ${descriptions.length} descripciones...`);
    
    // Utilizamos la función existente que ya maneja batches de 80 internamente
    // y tiene fallback automático a múltiples proveedores.
    const results = await bulkCategorizeTransactions(descriptions);
    
    return results;
  } catch (error) {
    console.error('❌ AI Service Error:', error);
    // Retornamos fallback para no bloquear el flujo
    return descriptions.map(desc => ({
      description: desc,
      category: 'Otros',
      aiConfidence: 0
    }));
  }
};
