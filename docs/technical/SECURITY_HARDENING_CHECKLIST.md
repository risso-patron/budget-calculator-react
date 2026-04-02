# Security Hardening Checklist

## 1) Variables en Netlify (obligatorio)
Configura en Site Settings -> Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GROQ_API_KEY`
- `ANTHROPIC_API_KEY`
- `ALLOWED_ORIGINS` (ejemplo: `https://budget-calculator.netlify.app,https://www.budget-calculator.netlify.app`)

Notas:
- No uses prefijo `VITE_` para secretos de backend.
- Si falta `SUPABASE_SERVICE_ROLE_KEY`, `subscription-manage` debe fallar con 500 (esperado, no seguro operar asi).

## 2) SQL de hardening en Supabase (obligatorio)
Ejecuta:

- `supabase/security-hardening.sql`

Validaciones esperadas:
- No existe policy `Users can update own subscription` en `public.subscriptions`.
- El rol `authenticated` no puede hacer `UPDATE` directo de `subscriptions`.

## 3) Validacion de ai-proxy (obligatorio)
### 3.1 Sin token
Request `POST /.netlify/functions/ai-proxy` sin `Authorization`.

Esperado:
- `401`
- body con error generico (`No autorizado`).

### 3.2 Con token valido
Request con `Authorization: Bearer <jwt_supabase>`.

Esperado:
- `200` (o `503` si proveedor externo cae)
- Nunca exponer detalles internos de proveedores.

### 3.3 Origen no permitido
Con `ALLOWED_ORIGINS` configurado, probar `Origin` fuera de lista.

Esperado:
- `403`.

## 4) Validacion de suscripciones (obligatorio)
### 4.1 Upgrade desde cliente
Intentar `updateSubscription('pro_monthly')` desde UI/console.

Esperado:
- rechazo con mensaje de backend seguro.

### 4.2 Downgrade desde cliente
Ejecutar `updateSubscription('free')`.

Esperado:
- success via `/.netlify/functions/subscription-manage`.

### 4.3 Cancelacion de renovacion
Ejecutar `cancelSubscription()`.

Esperado:
- `cancel_at_period_end = true`.

## 5) Validacion CSV injection (obligatorio)
Crear transaccion con descripcion:
- `=HYPERLINK("http://attacker", "click")`

Exportar CSV y abrir en Excel/Sheets.

Esperado:
- celda tratada como texto, no formula.

## 6) Pruebas automatizadas locales
Ejecutar:

```bash
npm run test -- --run src/__tests__/aiProxy.security.test.js src/__tests__/useSubscription.security.test.jsx src/__tests__/csvSecurity.test.js
```

Esperado:
- Todos los tests en verde.
