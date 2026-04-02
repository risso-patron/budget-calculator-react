/* eslint-env node */
/* global process */

/**
 * Netlify Function: AI Proxy
 *
 * SEGURIDAD:
 * - Las API keys NUNCA llegan al navegador (están solo en variables de entorno del servidor)
 * - Rate limiting server-side (no salteable desde el cliente)
 * - Validación y sanitización del input antes de enviarlo a la IA
 *
 * Variables de entorno requeridas en Netlify Dashboard:
 * GOOGLE_GEMINI_API_KEY=...
 * GROQ_API_KEY=...
 * ANTHROPIC_API_KEY=...
 * (Sin prefijo VITE_ → no se incluyen en el bundle del cliente)
 */

import { createClient } from '@supabase/supabase-js';

// Rate limiting en memoria (se resetea por instancia de función)
// En producción seria Redis u otro store persistente
const rateLimits = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minuto

/**
 * Verifica rate limit por IP
 */
function checkRateLimit(identityKey) {
  const now = Date.now();
  const requests = rateLimits.get(identityKey) || [];
  const recent = requests.filter(t => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  recent.push(now);
  rateLimits.set(identityKey, recent);
  return true;
}

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin) {
  const allowed = getAllowedOrigins();
  if (!origin || allowed.length === 0) return true;
  return allowed.includes(origin);
}

async function authenticateRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('missing_auth');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) throw new Error('missing_auth');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('supabase_not_configured');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user?.id) {
    throw new Error('invalid_auth');
  }

  return data.user;
}

/**
 * Sanitiza el input para prevenir prompt injection
 */
function sanitizePrompt(text) {
  if (typeof text !== 'string') return '';
  return text
    .slice(0, 5000) // Limitar longitud
    .replace(/<[^>]*>/g, '') // Eliminar HTML tags
    .replace(/[^\w\s.,;:!?()$%@#\-+=/\\áéíóúñüÁÉÍÓÚÑÜ]/gi, ' ') // Solo caracteres seguros
    .trim();
}

/**
 * Llama a Google Gemini
 */
async function callGemini(prompt) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini no configurado');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Llama a Groq
 */
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq no configurado');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Llama a Anthropic Claude
 */
async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic no configurado');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

/**
 * Handler principal de la Netlify Function
 */
export const handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const origin = event.headers.origin || event.headers.Origin;
  if (!isOriginAllowed(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Origen no permitido' }),
    };
  }

  let user;
  try {
    user = await authenticateRequest(event);
  } catch (authError) {
    const statusCode = authError.message === 'supabase_not_configured' ? 500 : 401;
    const message = authError.message === 'supabase_not_configured'
      ? 'Servicio temporalmente no disponible'
      : 'No autorizado';

    return {
      statusCode,
      body: JSON.stringify({ error: message }),
    };
  }

  // Obtener IP del cliente para rate limiting
  const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rateLimitKey = `${user.id}:${clientIp}`;

  // Verificar rate limit
  if (!checkRateLimit(rateLimitKey)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Demasiadas solicitudes. Espera 1 minuto.' }),
    };
  }

  // Parsear y validar el body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { prompt, provider = 'auto' } = body;

  if (!prompt || typeof prompt !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'El campo "prompt" es requerido' }) };
  }

  if (!['auto', 'gemini', 'groq', 'anthropic'].includes(provider)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Proveedor inválido' }) };
  }

  // Sanitizar el prompt antes de enviarlo a la IA
  const safePrompt = sanitizePrompt(prompt);
  if (!safePrompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Prompt inválido después de sanitización' }) };
  }

  // Intentar proveedores en orden de prioridad
  const providerOrder = provider === 'auto'
    ? ['gemini', 'groq', 'anthropic']
    : [provider];

  let lastError = null;

  for (const p of providerOrder) {
    try {
      let result;
      if (p === 'gemini') result = await callGemini(safePrompt);
      else if (p === 'groq') result = await callGroq(safePrompt);
      else if (p === 'anthropic') result = await callAnthropic(safePrompt);
      else continue;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, provider: p }),
      };
    } catch (error) {
      lastError = error.message;
      // Continuar con el siguiente proveedor
    }
  }

  console.error('[ai-proxy] providers_failed', {
    userId: user.id,
    provider,
    error: lastError,
  });

  return {
    statusCode: 503,
    body: JSON.stringify({ error: 'No se pudo procesar la solicitud de IA en este momento.' }),
  };
};

// Exportes internos solo para pruebas de seguridad.
export const __private = {
  checkRateLimit,
  sanitizePrompt,
  isOriginAllowed,
  clearRateLimits: () => rateLimits.clear(),
};
