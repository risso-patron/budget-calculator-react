/**
 * Cliente de Anthropic Claude AI para análisis financiero
 * 
 * CARACTERÍSTICAS:
 * - Análisis financiero inteligente
 * - Categorización automática de transacciones
 * - Predicción de gastos futuros
 * - Generación de reportes en lenguaje natural
 * - Sistema de caché para optimizar costos
 * - Rate limiting por usuario
 * 
 * COSTOS APROXIMADOS (Claude Sonnet 4):
 * - Input: $3 por millón de tokens
 * - Output: $15 por millón de tokens
 * - Análisis promedio: ~500 tokens = $0.01
 */

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514' // Último modelo disponible

// Sistema de caché simple (en producción usar Redis o similar)
const responseCache = new Map()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutos

// Rate limiting por usuario (máximo 10 requests por minuto)
const rateLimits = new Map()
const MAX_REQUESTS_PER_MINUTE = 10

/**
 * Verifica si el usuario ha excedido el límite de requests
 */
const checkRateLimit = (userId) => {
  const now = Date.now()
  const userRequests = rateLimits.get(userId) || []
  
  // Filtrar requests del último minuto
  const recentRequests = userRequests.filter(time => now - time < 60000)
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false // Límite excedido
  }
  
  // Agregar este request
  recentRequests.push(now)
  rateLimits.set(userId, recentRequests)
  return true
}

/**
 * Cliente genérico para llamar a Claude API
 */
const callClaude = async (messages, maxTokens = 2000, useCache = true) => {
  if (!API_KEY || API_KEY === 'your_anthropic_api_key_here') {
    console.warn('⚠️ API Key de Anthropic no configurada. Las funciones de IA no estarán disponibles.')
    return { error: 'API Key no configurada' }
  }

  // Generar clave de caché basada en el contenido del mensaje
  const cacheKey = useCache ? JSON.stringify(messages) : null
  
  // Verificar caché
  if (useCache && cacheKey) {
    const cached = responseCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Respuesta obtenida desde caché')
      return cached.data
    }
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error al llamar a Claude API')
    }

    const data = await response.json()
    
    // Guardar en caché
    if (useCache && cacheKey) {
      responseCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
    }

    return data
  } catch (error) {
    console.error('Error en llamada a Claude:', error)
    throw error
  }
}

/**
 * Construye el prompt para análisis financiero
 */
const buildAnalysisPrompt = (transactions, monthlyTotals) => {
  // Limitar transacciones para no exceder límite de tokens
  const recentTransactions = transactions.slice(0, 50) // Últimas 50 transacciones
  
  return `Eres un asesor financiero experto. Analiza estas transacciones financieras y proporciona:

1. **Resumen Ejecutivo**: Situación financiera actual en 2-3 oraciones
2. **Patrones de Gasto**: Identifica 3 patrones específicos (ej: "Gastas más en fines de semana")
3. **Recomendaciones**: 3 acciones concretas y accionables
4. **Score de Salud Financiera**: Número del 0-100 con justificación breve

**Transacciones recientes (últimas ${recentTransactions.length}):**
${JSON.stringify(recentTransactions, null, 2)}

${monthlyTotals ? `**Totales mensuales:**
${JSON.stringify(monthlyTotals, null, 2)}` : ''}

**Contexto:**
- Usuario ubicado en Panamá
- Moneda: USD
- Fecha de análisis: ${new Date().toLocaleDateString('es-PA')}

**IMPORTANTE:** 
- Responde en español de Panamá
- Sé específico con números y porcentajes
- Usa un tono profesional pero amigable
- Formato: JSON con esta estructura exacta:
{
  "resumen": "...",
  "patrones": ["patrón 1", "patrón 2", "patrón 3"],
  "recomendaciones": ["rec 1", "rec 2", "rec 3"],
  "score": 75,
  "scoreJustificacion": "..."
}`
}

/**
 * 1. ANÁLISIS FINANCIERO INTELIGENTE
 * Analiza transacciones y proporciona insights
 */
export const analyzeFinances = async (transactions, userId, monthlyTotals = null) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Has excedido el límite de análisis. Espera 1 minuto e intenta nuevamente.')
  }

  if (!transactions || transactions.length === 0) {
    throw new Error('No hay transacciones para analizar')
  }

  const prompt = buildAnalysisPrompt(transactions, monthlyTotals)
  
  const response = await callClaude([
    {
      role: 'user',
      content: prompt
    }
  ], 2000)

  // Extraer el contenido de texto
  const textContent = response.content.find(c => c.type === 'text')?.text || ''
  
  // Intentar parsear como JSON
  try {
    // Buscar el JSON en la respuesta (puede estar rodeado de markdown)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      return {
        ...analysis,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        estimatedCost: (response.usage.input_tokens * 3 / 1000000) + (response.usage.output_tokens * 15 / 1000000)
      }
    }
  } catch (e) {
    console.error('Error al parsear respuesta:', e)
  }

  // Si no se puede parsear, retornar estructura por defecto
  return {
    resumen: textContent.split('\n')[0],
    patrones: [],
    recomendaciones: [],
    score: 50,
    scoreJustificacion: 'No se pudo analizar completamente',
    rawResponse: textContent
  }
}

/**
 * 2. CATEGORIZACIÓN AUTOMÁTICA
 * Sugiere categoría basándose en la descripción
 */
export const suggestCategory = async (description, availableCategories) => {
  if (!description || description.trim().length < 3) {
    return null
  }

  const prompt = `Descripción de transacción: "${description}"

Categorías disponibles:
${availableCategories.join(', ')}

**Tarea:** Determina la categoría más apropiada.

**Responde SOLO con el nombre exacto de la categoría, sin explicaciones, sin comillas, sin puntuación.**

Ejemplos:
- "Uber a la oficina" → Transporte
- "Pizza Hut" → Alimentación
- "Netflix" → Entretenimiento
- "Alquiler mes mayo" → Vivienda`

  const response = await callClaude([
    {
      role: 'user',
      content: prompt
    }
  ], 50, false) // No cachear, cada descripción es única

  const textContent = response.content.find(c => c.type === 'text')?.text || ''
  const category = textContent.trim()

  // Verificar que la categoría esté en la lista disponible
  if (availableCategories.includes(category)) {
    return {
      category,
      confidence: 'alta' // Claude es muy preciso en esta tarea
    }
  }

  // Si no coincide exactamente, buscar coincidencia parcial
  const match = availableCategories.find(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  )

  return match ? { category: match, confidence: 'media' } : null
}

/**
 * 3. PREDICCIÓN DE GASTOS FUTUROS
 * Predice gastos del próximo mes por categoría
 */
export const predictNextMonthExpenses = async (monthlyData, userId) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Has excedido el límite de análisis. Espera 1 minuto.')
  }

  const prompt = `Analiza este historial de gastos mensuales y predice el gasto probable del próximo mes para cada categoría.

**Historial (últimos 3 meses):**
${JSON.stringify(monthlyData, null, 2)}

**Tarea:** 
Predice el monto para cada categoría del próximo mes basándote en:
- Tendencias observadas
- Estacionalidad
- Patrones de crecimiento/reducción

**Formato de respuesta JSON exacto:**
{
  "predicciones": {
    "Alimentación": { "monto": 450, "confianza": "alta", "razon": "Promedio estable" },
    "Transporte": { "monto": 200, "confianza": "media", "razon": "Ligera tendencia al alza" }
  },
  "totalEstimado": 1500,
  "advertencias": ["Observa aumento en entretenimiento", "..."]
}

Niveles de confianza: "alta", "media", "baja"`

  const response = await callClaude([
    {
      role: 'user',
      content: prompt
    }
  ], 1500)

  const textContent = response.content.find(c => c.type === 'text')?.text || ''
  
  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Error al parsear predicción:', e)
  }

  return { predicciones: {}, totalEstimado: 0, advertencias: [] }
}

/**
 * 4. GENERACIÓN DE REPORTES
 * Crea reportes en lenguaje natural
 */
export const generateReport = async (transactions, period, userId) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Has excedido el límite de análisis. Espera 1 minuto.')
  }

  const prompt = `Genera un reporte financiero ${period} basado en estas transacciones:

${JSON.stringify(transactions.slice(0, 100), null, 2)}

**Tono:** Profesional pero amigable, como un asesor financiero personal

**Estructura del reporte:**
1. Introducción (saludo personalizado)
2. Highlights del período (2-3 logros o puntos positivos)
3. Áreas de mejora (2-3 aspectos a trabajar)
4. Comparativa con período anterior (si aplica)
5. Consejos accionables
6. Cierre motivacional

**Formato:** Texto natural en español de Panamá, usa emojis apropiados, máximo 400 palabras.`

  const response = await callClaude([
    {
      role: 'user',
      content: prompt
    }
  ], 2000)

  const textContent = response.content.find(c => c.type === 'text')?.text || ''
  return {
    report: textContent,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens
  }
}

/**
 * 5. DETECCIÓN DE GASTOS INUSUALES
 * Identifica transacciones fuera de lo común
 */
export const detectAnomalies = async (transactions, userId) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Has excedido el límite de análisis. Espera 1 minuto.')
  }

  // Agrupar por categoría y calcular estadísticas
  const categoryStats = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      if (!acc[t.category]) {
        acc[t.category] = []
      }
      acc[t.category].push(t.amount)
    }
    return acc
  }, {})

  const prompt = `Analiza estas estadísticas de gasto por categoría e identifica anomalías:

${JSON.stringify(categoryStats, null, 2)}

**Tarea:**
Identifica gastos inusuales (significativamente mayores al promedio) y categorías donde se está gastando más de lo normal.

**Responde en formato JSON:**
{
  "alertas": [
    {
      "tipo": "gasto_inusual" | "tendencia_alta" | "categoria_nueva",
      "categoria": "...",
      "mensaje": "...",
      "severidad": "alta" | "media" | "baja",
      "accionSugerida": "..."
    }
  ]
}`

  const response = await callClaude([
    {
      role: 'user',
      content: prompt
    }
  ], 1000)

  const textContent = response.content.find(c => c.type === 'text')?.text || ''
  
  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Error al parsear anomalías:', e)
  }

  return { alertas: [] }
}

/**
 * Limpia el caché (útil para testing o cuando se necesite)
 */
export const clearCache = () => {
  responseCache.clear()
  console.log('✅ Caché de Claude limpiado')
}

/**
 * Obtiene estadísticas de uso
 */
export const getUsageStats = () => {
  return {
    cachedResponses: responseCache.size,
    rateLimitUsers: rateLimits.size
  }
}
