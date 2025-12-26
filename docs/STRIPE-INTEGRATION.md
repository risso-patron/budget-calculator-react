# 💳 Guía de Integración de Stripe

Esta guía te explica cómo integrar Stripe para procesar pagos de suscripciones en tu Budget Calculator.

---

## 📋 PASOS PREVIOS

### 1. Crear tabla en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/subscriptions-schema.sql`
4. Ejecuta el script
5. Verifica que la tabla `subscriptions` se haya creado correctamente

### 2. Crear cuenta en Stripe

1. Regístrate en [Stripe](https://stripe.com)
2. Completa la verificación de tu cuenta
3. Ve a **Developers → API keys**
4. Copia tus claves:
   - **Publishable key** (comienza con `pk_`)
   - **Secret key** (comienza con `sk_`)

---

## 🔑 CONFIGURACIÓN DE VARIABLES DE ENTORNO

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# Anthropic (ya lo tienes)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-yb3rEkP...

# Stripe - Frontend (Publishable Key)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Stripe - Backend (Secret Key) - NO USAR EN FRONTEND
# Esta va en tu función de Netlify/Vercel/backend
STRIPE_SECRET_KEY=sk_test_...
```

⚠️ **IMPORTANTE**: 
- La `VITE_STRIPE_PUBLIC_KEY` es segura en el frontend
- La `STRIPE_SECRET_KEY` NUNCA debe exponerse en el frontend
- Agregar `.env.local` a `.gitignore`

---

## 📦 INSTALACIÓN DE DEPENDENCIAS

```bash
npm install @stripe/stripe-js
```

Para el backend (Netlify Functions o Vercel):
```bash
npm install stripe
```

---

## 🎨 CREAR PRODUCTOS Y PRECIOS EN STRIPE

### Opción 1: Desde el Dashboard (Recomendado)

1. Ve a **Products** en tu Stripe Dashboard
2. Click en **+ Add product**

#### Producto 1: Budget Calculator PRO - Mensual
- **Name**: Budget Calculator PRO - Mensual
- **Description**: Acceso completo con export, IA y gráficos avanzados
- **Pricing**: $4.99 USD
- **Billing**: Recurring - Monthly
- **Copy el Price ID**: Algo como `price_1A2B3C4D5E6F7G8H`

#### Producto 2: Budget Calculator PRO - Anual
- **Name**: Budget Calculator PRO - Anual
- **Description**: Acceso completo - Ahorra 17%
- **Pricing**: $49 USD
- **Billing**: Recurring - Yearly
- **Copy el Price ID**: `price_...`

#### Producto 3: Budget Calculator Lifetime
- **Name**: Budget Calculator Lifetime
- **Description**: Acceso de por vida sin renovaciones
- **Pricing**: $79 USD
- **Billing**: One time
- **Copy el Price ID**: `price_...`

### Opción 2: Con el API de Stripe (Avanzado)

```javascript
// Desde el backend con stripe SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear producto
const product = await stripe.products.create({
  name: 'Budget Calculator PRO',
  description: 'Acceso completo con export, IA y gráficos avanzados',
});

// Crear precio mensual
const priceMonthly = await stripe.prices.create({
  product: product.id,
  unit_amount: 499, // $4.99 en centavos
  currency: 'usd',
  recurring: { interval: 'month' },
});
```

---

## 🔧 CREAR NETLIFY/VERCEL FUNCTION PARA CHECKOUT

### Si usas Netlify:

Crea `netlify/functions/create-checkout-session.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { planId, billingCycle } = JSON.parse(event.body);
    
    // Mapear plan a price_id de Stripe
    const priceIds = {
      pro_monthly: 'price_TU_ID_MENSUAL',
      pro_yearly: 'price_TU_ID_ANUAL',
      lifetime: 'price_TU_ID_LIFETIME',
    };

    const priceId = billingCycle === 'yearly' ? priceIds.pro_yearly : 
                    planId === 'lifetime' ? priceIds.lifetime :
                    priceIds.pro_monthly;

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: planId === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/?cancelled=true`,
      metadata: {
        planId,
        userId: event.headers['x-user-id'], // Pasar desde el frontend
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### Si usas Vercel:

Crea `api/create-checkout-session.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, billingCycle } = req.body;
    
    // Mapear plan a price_id de Stripe
    const priceIds = {
      pro_monthly: 'price_TU_ID_MENSUAL',
      pro_yearly: 'price_TU_ID_ANUAL',
      lifetime: 'price_TU_ID_LIFETIME',
    };

    const priceId = billingCycle === 'yearly' ? priceIds.pro_yearly : 
                    planId === 'lifetime' ? priceIds.lifetime :
                    priceIds.pro_monthly;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: planId === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?cancelled=true`,
      metadata: {
        planId,
        userId: req.headers['x-user-id'],
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🎯 ACTUALIZAR COMPONENTE DE PRICING

El componente `PricingPlans.jsx` ya está creado, pero necesitas:

1. **Actualizar la URL del endpoint** en línea 71:
```javascript
const response = await fetch('/api/create-checkout-session', {
  // Cambiar a:
  // Netlify: '/.netlify/functions/create-checkout-session'
  // Vercel: '/api/create-checkout-session'
```

2. **Pasar el user ID** en el request:
```javascript
const { user } = useAuth(); // Del AuthContext

const response = await fetch('/.netlify/functions/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': user.id, // ID del usuario
  },
  body: JSON.stringify({
    planId,
    billingCycle,
  }),
});
```

---

## 🔔 WEBHOOKS DE STRIPE

Los webhooks notifican cuando un pago se completa o falla.

### 1. Crear función de webhook

`netlify/functions/stripe-webhook.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key para operaciones admin
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Manejar diferentes eventos
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeEvent.data.object);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(stripeEvent.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(stripeEvent.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(stripeEvent.data.object);
      break;
  }

  return { statusCode: 200, body: 'Webhook received' };
};

async function handleCheckoutCompleted(session) {
  const { metadata, customer, subscription } = session;
  const { userId, planId } = metadata;

  // Actualizar suscripción en Supabase
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan_type: planId,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: planId === 'lifetime' ? null : calculatePeriodEnd(planId),
    });

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const { customer, status, current_period_end } = subscription;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
    })
    .eq('stripe_customer_id', customer);

  if (error) {
    console.error('Error updating subscription status:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const { customer } = subscription;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan_type: 'free',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customer);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }
}

async function handlePaymentFailed(invoice) {
  const { customer } = invoice;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_customer_id', customer);

  if (error) {
    console.error('Error updating payment status:', error);
  }
}

function calculatePeriodEnd(planId) {
  const now = new Date();
  if (planId === 'pro_monthly') {
    now.setMonth(now.getMonth() + 1);
  } else if (planId === 'pro_yearly') {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now.toISOString();
}
```

### 2. Configurar webhook en Stripe

1. Ve a **Developers → Webhooks** en Stripe Dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://tudominio.netlify.app/.netlify/functions/stripe-webhook`
4. **Events to send**: Selecciona:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. **Add endpoint**
6. Copia el **Signing secret** (comienza con `whsec_`)
7. Agrégalo a tus variables de entorno: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## ✅ PÁGINA DE ÉXITO

Crea `src/pages/SuccessPage.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import Confetti from 'react-confetti';

export const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadSubscription } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Reload subscription para actualizar el estado
    loadSubscription();
    
    // Detener confetti después de 5 segundos
    setTimeout(() => setShowConfetti(false), 5000);
    
    // Redirect a home después de 3 segundos
    setTimeout(() => navigate('/'), 3000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      {showConfetti && <Confetti />}
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          ¡Bienvenido a PRO!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu suscripción se ha activado correctamente. Ahora tienes acceso a todas las funciones premium.
        </p>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            ✨ Ahora puedes:
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>📥 Exportar a CSV y PDF ilimitado</li>
            <li>🤖 Análisis con IA de Claude</li>
            <li>📊 Gráficos avanzados</li>
            <li>💳 Gestión de tarjetas de crédito</li>
            <li>🔮 Predicciones de gastos</li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirigiendo al dashboard...
        </p>
      </div>
    </div>
  );
};
```

---

## 🧪 TESTING

### Modo Test de Stripe

Stripe te da tarjetas de prueba:

**Tarjeta que funciona:**
- Número: `4242 4242 4242 4242`
- Fecha: Cualquier fecha futura
- CVC: Cualquier 3 dígitos
- ZIP: Cualquier código

**Tarjeta que falla:**
- Número: `4000 0000 0000 0002`

**Testing 3D Secure:**
- Número: `4000 0025 0000 3155`

### Checklist de Testing

- [ ] Plan Free → Export CSV muestra modal de upgrade
- [ ] Plan Free → Export PDF muestra modal de upgrade
- [ ] Click en "Actualizar" abre PricingPlans
- [ ] Toggle Mensual/Anual cambia precios
- [ ] Click en plan redirige a Stripe Checkout
- [ ] Pago exitoso redirige a /success
- [ ] Página /success muestra confetti
- [ ] Subscription se actualiza en Supabase
- [ ] Export CSV funciona después de pagar
- [ ] Export PDF funciona después de pagar

---

## 🚀 DEPLOYMENT

### Variables de entorno en Netlify:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ANTHROPIC_API_KEY=...
VITE_STRIPE_PUBLIC_KEY=pk_live_... (cambiar a live en producción)

# Backend/Functions
STRIPE_SECRET_KEY=sk_live_... (cambiar a live en producción)
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=... (para webhooks)
```

### Cambiar a modo LIVE:

1. En Stripe Dashboard, activa tu cuenta
2. Ve a **Developers → API keys** y copia las claves **live**
3. Recrea los productos en modo LIVE
4. Actualiza las variables de entorno con las claves live
5. Actualiza el webhook endpoint en Stripe
6. Re-deploy tu app

---

## 📊 MONITOREO

- **Stripe Dashboard**: Ve pagos, suscripciones activas, revenue
- **Supabase Dashboard**: Verifica que las suscripciones se actualicen
- **Webhooks logs**: Ve si los webhooks se reciben correctamente
- **Sentry/Analytics**: Trackea errores en checkout

---

## ❓ FAQ

**¿Qué pasa si un pago falla?**
El webhook `invoice.payment_failed` marca el status como `past_due` y Stripe enviará emails automáticos.

**¿Cómo cancelar una suscripción?**
Stripe maneja esto automáticamente. El webhook `customer.subscription.deleted` downgradea al plan free.

**¿Lifetime es una suscripción o pago único?**
Pago único. En Stripe usas `mode: 'payment'` en vez de `mode: 'subscription'`.

**¿Puedo ofrecer trial gratuito?**
Sí, en Stripe Checkout agrega `subscription_data: { trial_period_days: 14 }`.

**¿Cómo hago refunds?**
Desde Stripe Dashboard → Payments → Click en pago → Refund.

---

## 📚 RECURSOS

- [Stripe Docs - Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Docs - Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

**Creado por:** Jorge Luis Risso Patrón (@risso-patron)
**Versión:** 1.0
**Última actualización:** Octubre 2025

