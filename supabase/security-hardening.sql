-- =====================================================
-- SECURITY HARDENING PATCH (Aplicar en proyectos ya desplegados)
-- =====================================================

-- 1) Suscripciones: bloquear updates directos desde cliente.
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- Mantener solo lectura/insert propias por RLS existente.
-- Cualquier update de plan/estado debe hacerse desde backend seguro.

-- 2) Recomendación opcional: revocar update para rol authenticated (defensa en profundidad)
-- Nota: ejecutar solo si no tienes otras policies de UPDATE necesarias en subscriptions.
REVOKE UPDATE ON public.subscriptions FROM authenticated;
REVOKE UPDATE ON public.subscriptions FROM anon;

-- 3) Endurecer vistas agregadas para que respeten contexto del invocador (PG15+).
-- Si tu instancia es < PG15, este bloque no rompe ejecución.
DO $$
BEGIN
	BEGIN
		EXECUTE 'ALTER VIEW public.monthly_summary SET (security_invoker = true)';
	EXCEPTION WHEN OTHERS THEN
		RAISE NOTICE 'monthly_summary: security_invoker no disponible en esta versión';
	END;

	BEGIN
		EXECUTE 'ALTER VIEW public.user_balance SET (security_invoker = true)';
	EXCEPTION WHEN OTHERS THEN
		RAISE NOTICE 'user_balance: security_invoker no disponible en esta versión';
	END;
END $$;

-- 4) (Opcional) Reducir superficie de acceso a vistas agregadas.
-- Descomenta si NO usas estas vistas directamente desde cliente.
-- REVOKE ALL ON public.monthly_summary FROM anon, authenticated;
-- REVOKE ALL ON public.user_balance FROM anon, authenticated;

DO $$
BEGIN
	IF current_setting('server_version_num')::int >= 150000 THEN
		IF EXISTS (
			SELECT 1 FROM pg_views
			WHERE schemaname = 'public' AND viewname = 'monthly_summary'
		) THEN
			EXECUTE 'ALTER VIEW public.monthly_summary SET (security_invoker = true)';
		END IF;

		IF EXISTS (
			SELECT 1 FROM pg_views
			WHERE schemaname = 'public' AND viewname = 'user_balance'
		) THEN
			EXECUTE 'ALTER VIEW public.user_balance SET (security_invoker = true)';
		END IF;
	ELSE
		RAISE NOTICE 'PostgreSQL < 15: security_invoker no disponible para vistas. Usa RPC con control de acceso.';
	END IF;
END $$;
