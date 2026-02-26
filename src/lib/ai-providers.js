/**
 * Sistema multi-proveedor de IA - TODAS LAS OPCIONES GRATUITAS
 * 
 * PROVEEDORES SOPORTADOS (en orden de prioridad):
 * 1. Google Gemini 1.5 Flash (GRATIS: 1500 req/día)
 * 2. Groq Llama 3.3 70B (GRATIS: 30 req/min)
 * 3. Anthropic Claude (PAGO: $5 crédito inicial)
 * 4. Ollama Local (GRATIS: ilimitado, requiere instalación)
 * 
 * COSTOS:
 * - Gemini: $0 (completamente gratis)
 * - Groq: $0 (completamente gratis)
 * - Anthropic: ~$0.01 por análisis
 * - Ollama: $0 (local, sin límites)
 */

// ====================================
// CONFIGURACIÓN DE PROVEEDORES
// ====================================

const PROVIDERS = {
  GEMINI: {
    name: 'Google Gemini',
    apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
    model: 'gemini-2.0-flash-lite',
    maxTokens: 2000,
    free: true,
    limits: '1500 requests/día',
  },
  GROQ: {
    name: 'Groq',
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 2000,
    free: true,
    limits: '30 requests/minuto',
  },
  ANTHROPIC: {
    name: 'Anthropic Claude',
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    free: false,
    limits: 'Según plan',
  },
  OLLAMA: {
    name: 'Ollama Local',
    apiKey: null, // No requiere API key
    endpoint: 'http://localhost:11434/api/generate',
    model: 'llama3.2:3b',
    maxTokens: 2000,
    free: true,
    limits: 'Ilimitado (local)',
  },
};

// Sistema de caché para reducir llamadas
const responseCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Rate limiting simple
const rateLimits = new Map();
const MAX_REQUESTS_PER_MINUTE = 20;

/**
 * Verifica rate limit
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRequests = rateLimits.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimits.set(userId, recentRequests);
  return true;
};

/**
 * Detecta qué proveedores están configurados
 */
export const getAvailableProviders = () => {
  const available = [];
  
  if (PROVIDERS.GEMINI.apiKey) {
    available.push({ id: 'GEMINI', ...PROVIDERS.GEMINI });
  }
  if (PROVIDERS.GROQ.apiKey) {
    available.push({ id: 'GROQ', ...PROVIDERS.GROQ });
  }
  if (PROVIDERS.ANTHROPIC.apiKey && PROVIDERS.ANTHROPIC.apiKey !== 'your_anthropic_api_key_here') {
    available.push({ id: 'ANTHROPIC', ...PROVIDERS.ANTHROPIC });
  }
  
  // Verificar si Ollama está corriendo localmente
  // (esto se hace con un ping en tiempo real)
  
  return available;
};

/**
 * Llama a Google Gemini
 */
const callGemini = async (prompt, maxTokens = 2000) => {
  const apiKey = PROVIDERS.GEMINI.apiKey;
  if (!apiKey) throw new Error('API Key de Gemini no configurada');

  const url = `${PROVIDERS.GEMINI.endpoint}?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en Gemini API');
  }

  const data = await response.json();
  const text = data.candidates[0]?.content?.parts[0]?.text;
  
  if (!text) throw new Error('Respuesta vacía de Gemini');

  return {
    content: text,
    provider: 'gemini',
    model: PROVIDERS.GEMINI.model,
  };
};

/**
 * Llama a Groq
 */
const callGroq = async (prompt, maxTokens = 2000) => {
  const apiKey = PROVIDERS.GROQ.apiKey;
  if (!apiKey) throw new Error('API Key de Groq no configurada');

  const response = await fetch(PROVIDERS.GROQ.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: PROVIDERS.GROQ.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: maxTokens,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en Groq API');
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;
  
  if (!text) throw new Error('Respuesta vacía de Groq');

  return {
    content: text,
    provider: 'groq',
    model: PROVIDERS.GROQ.model,
  };
};

/**
 * Llama a Claude (Anthropic)
 */
const callClaude = async (prompt, maxTokens = 2000) => {
  const apiKey = PROVIDERS.ANTHROPIC.apiKey;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    throw new Error('API Key de Claude no configurada');
  }

  const response = await fetch(PROVIDERS.ANTHROPIC.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: PROVIDERS.ANTHROPIC.model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en Claude API');
  }

  const data = await response.json();
  const text = data.content[0]?.text;
  
  if (!text) throw new Error('Respuesta vacía de Claude');

  return {
    content: text,
    provider: 'claude',
    model: PROVIDERS.ANTHROPIC.model,
  };
};

/**
 * Llama a Ollama (local)
 */
const callOllama = async (prompt, maxTokens = 2000) => {
  try {
    const response = await fetch(PROVIDERS.OLLAMA.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PROVIDERS.OLLAMA.model,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Ollama no está corriendo o no responde');
    }

    const data = await response.json();
    
    if (!data.response) throw new Error('Respuesta vacía de Ollama');

    return { content: data.response, provider: 'ollama', model: PROVIDERS.OLLAMA.model };
  } catch {
    throw new Error('Ollama no disponible. ¿Está corriendo? (ollama serve)');
  }
};

/**
 * Llamada inteligente con fallback automático
 * Intenta proveedores en orden hasta que uno responda
 */
export const callAI = async (prompt, maxTokens = 2000, useCache = true) => {
  // Verificar caché
  const cacheKey = useCache ? `${prompt.substring(0, 100)}_${maxTokens}` : null;
  
  if (useCache && cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Respuesta desde caché');
      return cached.data;
    }
  }

  // Orden de prioridad (gratis primero)
  const providers = [
    { name: 'Gemini', fn: callGemini, enabled: !!PROVIDERS.GEMINI.apiKey },
    { name: 'Groq', fn: callGroq, enabled: !!PROVIDERS.GROQ.apiKey },
    { name: 'Claude', fn: callClaude, enabled: !!PROVIDERS.ANTHROPIC.apiKey && PROVIDERS.ANTHROPIC.apiKey !== 'your_anthropic_api_key_here' },
    { name: 'Ollama', fn: callOllama, enabled: true }, // Siempre intentar si los otros fallan
  ];

  const errors = [];

  // Intentar cada proveedor habilitado
  for (const provider of providers.filter(p => p.enabled)) {
    try {
      console.log(`🔄 Intentando con ${provider.name}...`);
      const result = await provider.fn(prompt, maxTokens);
      
      console.log(`✅ Respuesta exitosa de ${provider.name}`);
      
      // Guardar en caché
      if (useCache && cacheKey) {
        responseCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      console.warn(`⚠️ ${provider.name} falló:`, error.message);
      errors.push({ provider: provider.name, error: error.message });
      continue; // Intentar siguiente proveedor
    }
  }

  // Si llegamos aquí, todos fallaron
  const errorMsg = errors.map(e => `${e.provider}: ${e.error}`).join('\n');
  throw new Error(`❌ Todos los proveedores de IA fallaron:\n${errorMsg}`);
};

/**
 * Construye prompt para análisis financiero
 */
const buildAnalysisPrompt = (transactions, monthlyTotals) => {
  const recentTransactions = transactions.slice(0, 50);
  
  return `Eres un asesor financiero experto. Analiza estas transacciones y proporciona:

1. **Resumen Ejecutivo**: Situación financiera en 2-3 oraciones
2. **Patrones**: 3 patrones específicos de gasto
3. **Recomendaciones**: 3 acciones concretas
4. **Score**: Número del 0-100 con justificación

**Transacciones (últimas ${recentTransactions.length}):**
${JSON.stringify(recentTransactions, null, 2)}

${monthlyTotals ? `**Totales:** ${JSON.stringify(monthlyTotals, null, 2)}` : ''}

**RESPONDE EN JSON:**
{
  "resumen": "...",
  "patrones": ["...", "...", "..."],
  "recomendaciones": ["...", "...", "..."],
  "score": 75,
  "scoreJustificacion": "..."
}`;
};

/**
 * ANÁLISIS FINANCIERO INTELIGENTE
 */
export const analyzeFinances = async (transactions, userId, monthlyTotals = null) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Límite de requests alcanzado. Espera 1 minuto.');
  }

  const prompt = buildAnalysisPrompt(transactions, monthlyTotals);
  const result = await callAI(prompt, 2000, true);
  
  try {
    // Extraer JSON de la respuesta
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Respuesta no contiene JSON válido');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      ...analysis,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error parseando respuesta:', error);
    throw new Error('La IA devolvió un formato inválido');
  }
};

/**
 * CATEGORIZACIÓN AUTOMÁTICA
 */
export const suggestCategory = async (description) => {
  const prompt = `Categoriza esta transacción en español:
"${description}"

Categorías válidas: Comida, Transporte, Entretenimiento, Salud, Educación, Vivienda, Servicios, Otros

Responde en JSON:
{
  "categoria": "...",
  "confianza": 0.95
}`;

  const result = await callAI(prompt, 200, true);
  
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch[0]);
    
    return {
      category: data.categoria,
      confidence: data.confianza,
      provider: result.provider,
    };
  } catch (error) {
    return {
      category: 'Otros',
      confidence: 0.5,
      error: error.message,
    };
  }
};

/**
 * PREDICCIÓN DE GASTOS
 */
export const predictNextMonthExpenses = async (transactions, userId) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Límite de requests alcanzado');
  }

  const prompt = `Analiza estas transacciones y predice los gastos del próximo mes por categoría:

${JSON.stringify(transactions.slice(0, 100), null, 2)}

Responde en JSON:
{
  "predicciones": {
    "Comida": 450,
    "Transporte": 200,
    ...
  },
  "total": 1200,
  "confianza": 0.85
}`;

  const result = await callAI(prompt, 1500, true);
  
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Error parseando predicciones');
  }
};

/**
 * DETECCIÓN DE ANOMALÍAS
 */
export const detectAnomalies = async (transactions, userId) => {
  if (!checkRateLimit(userId)) {
    throw new Error('Límite de requests alcanzado');
  }

  const prompt = `Detecta gastos anómalos o inusuales en estas transacciones:

${JSON.stringify(transactions.slice(0, 50), null, 2)}

Responde en JSON:
{
  "alertas": [
    {
      "tipo": "gasto_alto",
      "descripcion": "Gasto inusualmente alto en...",
      "transaccion": {...},
      "severidad": "alta"
    }
  ]
}`;

  const result = await callAI(prompt, 1500, true);
  
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { alertas: [] };
  }
};

/**
 * MAPEO INTELIGENTE DE COLUMNAS CSV BANCARIAS
 * Envía los headers + filas de muestra a la IA y devuelve el mapa de columnas.
 * Sin caché — cada archivo es único.
 */
export const mapCSVColumns = async (headers, sampleRows) => {
  const prompt = `Eres un experto en extractos bancarios latinoamericanos. Mapea las columnas de este CSV al esquema interno.

Headers detectados: ${JSON.stringify(headers)}
Filas de muestra:
${sampleRows.slice(0, 3).map((row, i) => `Fila ${i + 1}: ${JSON.stringify(row)}`).join('\n')}

Esquema interno:
- fecha: columna con la fecha de la transacción
- descripcion: nombre del comercio o descripción del movimiento
- monto: columna de importe si hay UNA sola columna numérica
- debito: columna de débitos/cargos/retiros (si hay columnas separadas D/C)
- credito: columna de créditos/abonos/depósitos (si hay columnas separadas D/C)
- tipo: columna que indica explícitamente si es ingreso o gasto (omitir si no existe)
- categoria: columna de categoría (omitir si no existe)

REGLAS:
1. Si hay columnas separadas de débito y crédito → usa "debito" y "credito", NO "monto"
2. Si hay una sola columna de importe → usa "monto"
3. Usa el nombre EXACTO de la columna original tal como aparece en los headers
4. Pon null para los campos que no puedas identificar con certeza

Responde SOLO JSON sin explicaciones:
{
  "fecha": "...",
  "descripcion": "...",
  "monto": null,
  "debito": "...",
  "credito": "...",
  "tipo": null,
  "categoria": null
}`;

  const result = await callAI(prompt, 600, false);

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Sin JSON en respuesta');

    const raw = JSON.parse(jsonMatch[0]);
    // Limpiar nulls y strings "null"
    const cleaned = {};
    for (const [key, val] of Object.entries(raw)) {
      if (val && val !== 'null' && val !== 'None' && val !== '') {
        cleaned[key] = val;
      }
    }
    return { columnMap: cleaned, provider: result.provider };
  } catch {
    throw new Error('La IA no pudo determinar el mapeo de columnas');
  }
};

/**
 * ESTADO DE LOS PROVEEDORES
 */
export const getProviderStatus = () => {
  return {
    gemini: {
      configured: !!PROVIDERS.GEMINI.apiKey,
      free: true,
      priority: 1,
    },
    groq: {
      configured: !!PROVIDERS.GROQ.apiKey,
      free: true,
      priority: 2,
    },
    claude: {
      configured: !!PROVIDERS.ANTHROPIC.apiKey && PROVIDERS.ANTHROPIC.apiKey !== 'your_anthropic_api_key_here',
      free: false,
      priority: 3,
    },
    ollama: {
      configured: true,
      free: true,
      priority: 4,
      requiresInstall: true,
    },
  };
};
