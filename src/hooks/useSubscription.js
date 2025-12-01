import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Hook para gestionar suscripciones y planes de usuario
 * 
 * PLANES:
 * - free: Gratis (sin export, sin IA)
 * - pro_monthly: $4.99/mes (export + IA)
 * - pro_yearly: $49/año (export + IA, ahorro 17%)
 * - lifetime: $79 pago único (todo de por vida)
 */
export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      // Si no tiene suscripción, crear una FREE por defecto
      if (!data) {
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              plan_type: 'free',
              status: 'active',
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar suscripción del usuario
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [user, loadSubscription]);

  // Verificar si el usuario tiene acceso a una feature
  const hasFeature = (featureName) => {
    if (!subscription) return false;

    const features = {
      free: ['basic_transactions', 'basic_charts', 'dark_mode', 'limited_goals'],
      pro_monthly: ['export_csv', 'export_pdf', 'ai_analysis', 'credit_cards', 'advanced_charts', 'unlimited_goals', 'ai_predictions'],
      pro_yearly: ['export_csv', 'export_pdf', 'ai_analysis', 'credit_cards', 'advanced_charts', 'unlimited_goals', 'ai_predictions'],
      lifetime: ['export_csv', 'export_pdf', 'ai_analysis', 'credit_cards', 'advanced_charts', 'unlimited_goals', 'ai_predictions', 'lifetime_badge'],
    };

    const planFeatures = features[subscription.plan_type] || features.free;
    return planFeatures.includes(featureName);
  };

  // Verificar si tiene plan PRO (mensual, anual o lifetime)
  const isPro = () => {
    if (!subscription) return false;
    return ['pro_monthly', 'pro_yearly', 'lifetime'].includes(subscription.plan_type);
  };

  // Verificar si es lifetime
  const isLifetime = () => {
    return subscription?.plan_type === 'lifetime';
  };

  // Obtener nombre legible del plan
  const getPlanName = () => {
    const planNames = {
      free: 'Plan Gratuito',
      pro_monthly: 'Plan PRO Mensual',
      pro_yearly: 'Plan PRO Anual',
      lifetime: 'Plan Lifetime',
    };
    return planNames[subscription?.plan_type] || 'Plan Gratuito';
  };

  // Obtener precio del plan
  const getPlanPrice = () => {
    const prices = {
      free: 'Gratis',
      pro_monthly: '$4.99/mes',
      pro_yearly: '$49/año',
      lifetime: '$79 único',
    };
    return prices[subscription?.plan_type] || 'Gratis';
  };

  // Actualizar suscripción (después de pago exitoso)
  const updateSubscription = async (newPlanType, stripeData = {}) => {
    try {
      const updateData = {
        plan_type: newPlanType,
        status: 'active',
        updated_at: new Date().toISOString(),
        ...stripeData,
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSubscription(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating subscription:', err);
      return { success: false, error: err.message };
    }
  };

  // Cancelar suscripción
  const cancelSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSubscription(data);
      return { success: true };
    } catch (err) {
      console.error('Error canceling subscription:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    subscription,
    loading,
    error,
    hasFeature,
    isPro,
    isLifetime,
    getPlanName,
    getPlanPrice,
    updateSubscription,
    cancelSubscription,
    reload: loadSubscription,
  };
};
