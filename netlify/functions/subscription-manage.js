/* eslint-env node */
/* global process */

/**
 * Netlify Function: subscription-manage
 *
 * Seguridad:
 * - Requiere JWT válido de Supabase
 * - No permite upgrades de plan desde cliente
 * - Usa service role solo en backend para mutaciones controladas
 */

import { createClient } from '@supabase/supabase-js';

async function authenticateUser(event, supabaseUrl, supabaseAnonKey) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('missing_auth');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) throw new Error('missing_auth');

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data?.user?.id) {
    throw new Error('invalid_auth');
  }

  return data.user;
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Servicio temporalmente no disponible' }),
    };
  }

  let user;
  try {
    user = await authenticateUser(event, supabaseUrl, supabaseAnonKey);
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { action } = body;
  if (!action || typeof action !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Acción inválida' }) };
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    let updatePayload;

    if (action === 'downgrade_to_free') {
      updatePayload = {
        plan_type: 'free',
        status: 'active',
        cancel_at_period_end: false,
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      };
    } else if (action === 'cancel_at_period_end') {
      updatePayload = {
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      };
    } else {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Acción no permitida desde cliente' }),
      };
    }

    const { data, error } = await adminClient
      .from('subscriptions')
      .update(updatePayload)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, subscription: data }),
    };
  } catch (error) {
    console.error('[subscription-manage] error', {
      userId: user.id,
      action,
      error: error.message,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudo actualizar la suscripción' }),
    };
  }
};
