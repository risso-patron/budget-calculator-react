import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
// import { loadStripe } from '@stripe/stripe-js';

// STRIPE DESACTIVADO TEMPORALMENTE - Activa cuando tengas tu clave
// const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || null
// const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null
const stripePromise = null; // Desactivado hasta configurar Stripe;

/**
 * Componente de Pricing - Muestra los planes disponibles
 */
export const PricingPlans = ({ onClose }) => {
  const { subscription, updateSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      period: 'Para siempre',
      description: 'Ideal para empezar a gestionar tus finanzas',
      features: [
        'Transacciones ilimitadas',
        'Gráficos básicos',
        'Hasta 3 metas financieras',
        'Dark mode',
        'Gamificación básica',
      ],
      limitations: [
        'Sin export CSV/PDF',
        'Sin análisis con IA',
        'Sin gráficos avanzados',
        'Sin tarjetas de crédito',
      ],
      color: 'gray',
      popular: false,
    },
    {
      id: 'pro',
      name: 'PRO',
      price: billingCycle === 'monthly' ? 4.99 : 49,
      period: billingCycle === 'monthly' ? 'por mes' : 'por año',
      description: 'Para usuarios que quieren el máximo control',
      features: [
        'Todo de Gratuito +',
        '📥 Export ilimitado (CSV + PDF)',
        '🤖 Análisis con IA de Claude',
        '📊 4 tipos de gráficos avanzados',
        '💳 Gestión de tarjetas de crédito',
        '🎯 Metas financieras ilimitadas',
        '🔮 Predicciones de gastos',
        '🏷️ Categorización automática con IA',
        '🚨 Alertas inteligentes',
        '⚡ Soporte prioritario',
      ],
      limitations: [],
      color: 'purple',
      popular: true,
      savings: billingCycle === 'yearly' ? 'Ahorra $10.88 (17%)' : null,
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 79,
      period: 'pago único',
      description: 'Acceso de por vida sin suscripciones',
      features: [
        'Todo de PRO +',
        '♾️ Acceso de por vida',
        '🆕 Futuras actualizaciones incluidas',
        '❌ Sin renovaciones',
        '🏆 Badge especial "Lifetime Supporter"',
        '💎 Características exclusivas futuras',
      ],
      limitations: [],
      color: 'gold',
      popular: false,
      badge: 'MEJOR VALOR',
    },
  ];

  // Manejar selección de plan
  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      // Downgrade a plan gratuito
      const confirmed = window.confirm(
        '¿Estás seguro de cambiar al plan gratuito? Perderás acceso a las características premium.'
      );
      if (!confirmed) return;

      await updateSubscription('free');
      if (onClose) onClose();
      return;
    }

    // Verificar si Stripe está configurado
    if (!stripePromise) {
      alert('⚠️ Stripe no está configurado aún. Esta función estará disponible próximamente.\n\nPara configurar Stripe:\n1. Crea una cuenta en stripe.com\n2. Obtén tu clave pública\n3. Agrégala al archivo .env.local');
      return;
    }

    // Redirect a Stripe Checkout para planes de pago
    setLoading(true);
    try {
      const stripe = await stripePromise;
      
      // Llamar a tu backend para crear sesión de checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      const session = await response.json();

      // Redirect a Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan_type || 'free';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-3">Elige tu Plan</h2>
            <p className="text-lg opacity-90">
              Comienza gratis o desbloquea todo el potencial con PRO
            </p>
          </div>

          {/* Toggle de billing cycle para plan PRO */}
          <div className="flex justify-center mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex gap-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Anual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          {plans.map((plan) => {
            // Solo mostrar plan PRO para el ciclo seleccionado
            if (plan.id === 'pro' && billingCycle === 'yearly') {
              plan = { ...plan, id: 'pro_yearly' };
            } else if (plan.id === 'pro' && billingCycle === 'monthly') {
              plan = { ...plan, id: 'pro_monthly' };
            }

            const isCurrentPlan = currentPlan === plan.id;
            const borderColor = plan.color === 'purple' ? 'border-purple-500' : 
                               plan.color === 'gold' ? 'border-yellow-500' : 
                               'border-gray-300 dark:border-gray-700';

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 ${borderColor} 
                  ${plan.popular ? 'shadow-xl scale-105' : 'shadow-lg'}
                  transition-all hover:shadow-2xl`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                    {plan.savings && (
                      <div className="text-green-600 dark:text-green-400 text-sm font-semibold mt-1">
                        {plan.savings}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading || isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all
                      ${isCurrentPlan
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {loading ? 'Procesando...' : isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
                  </button>

                  {/* Features */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="line-through">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>🔒 Pago seguro procesado por Stripe</p>
            <p className="mt-2">💯 Garantía de devolución de 30 días | ❌ Cancela cuando quieras</p>
          </div>
        </div>
      </div>
    </div>
  );
};
