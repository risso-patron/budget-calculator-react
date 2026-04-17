/* eslint-env node */
/* global process */

/**
 * Netlify Function: stripe-webhook
 *
 * Recibe eventos de Stripe y actualiza la tabla `subscriptions` en Supabase.
 * Este es el único lugar donde se actualizan planes de pago (no el cliente).
 *
 * Eventos manejados:
 *   checkout.session.completed       → Pago exitoso: activar plan
 *   customer.subscription.updated    → Renovación / cambio de ciclo
 *   customer.subscription.deleted    → Cancelación: bajar a free
 *   invoice.payment_failed           → Pago rechazado: marcar past_due
 *
 * Env vars necesarias:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   (Signing secret del endpoint en Stripe Dashboard)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Configurar en Stripe Dashboard:
 *   https://dashboard.stripe.com/webhooks → Add endpoint
 *   URL: https://<tu-dominio>.netlify.app/.netlify/functions/stripe-webhook
 *   Eventos a escuchar:
 *     - checkout.session.completed
 *     - customer.subscription.updated
 *     - customer.subscription.deleted
 *     - invoice.payment_failed
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error('[stripe-webhook] Variables de entorno faltantes');
    return { statusCode: 500, body: 'Missing configuration' };
  }

  const stripe = new Stripe(stripeSecretKey);

  // Verificar firma del webhook — previene eventos falsificados
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['stripe-signature'],
      webhookSecret
    );
  } catch (err) {
    console.error('[stripe-webhook] Firma inválida:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    switch (stripeEvent.type) {

      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const { userId, planType } = session.metadata || {};

        if (!userId || !planType) {
          console.error('[stripe-webhook] Metadata faltante en sesión', session.id);
          break;
        }

        const updatePayload = {
          plan_type: planType,
          status: 'active',
          stripe_customer_id: session.customer,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        };

        // Para suscripciones recurrentes guardar período y ID de Stripe
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          updatePayload.stripe_subscription_id = sub.id;
          updatePayload.stripe_price_id = sub.items.data[0]?.price?.id || null;
          updatePayload.current_period_start = new Date(sub.current_period_start * 1000).toISOString();
          updatePayload.current_period_end = new Date(sub.current_period_end * 1000).toISOString();
          updatePayload.cancel_at_period_end = sub.cancel_at_period_end;
        }

        const { error } = await adminClient
          .from('subscriptions')
          .update(updatePayload)
          .eq('user_id', userId);

        if (error) throw error;

        console.log(`[stripe-webhook] Plan activado: userId=${userId} plan=${planType}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = stripeEvent.data.object;

        const { data: row } = await adminClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', sub.customer)
          .single();

        if (row) {
          await adminClient
            .from('subscriptions')
            .update({
              status: sub.status,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: sub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', row.user_id);

          console.log(`[stripe-webhook] Suscripción actualizada: userId=${row.user_id} status=${sub.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object;

        const { data: row } = await adminClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', sub.customer)
          .single();

        if (row) {
          await adminClient
            .from('subscriptions')
            .update({
              plan_type: 'free',
              status: 'active',
              stripe_subscription_id: null,
              stripe_price_id: null,
              current_period_end: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', row.user_id);

          console.log(`[stripe-webhook] Suscripción cancelada → free: userId=${row.user_id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;

        const { data: row } = await adminClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (row) {
          await adminClient
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', row.user_id);

          console.log(`[stripe-webhook] Pago fallido: userId=${row.user_id}`);
        }
        break;
      }

      default:
        // Evento no manejado — ignorar
        break;
    }
  } catch (error) {
    console.error('[stripe-webhook] Error interno:', error.message);
    return { statusCode: 500, body: 'Internal error' };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
