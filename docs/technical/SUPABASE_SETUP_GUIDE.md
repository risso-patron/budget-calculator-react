# Guía de Configuración de Supabase para Budget Calculator

## Paso 1: Ejecutar el Script SQL

1. Abre tu proyecto en Supabase: https://supabase.com/dashboard/project/sb1-qsvwhqh5
2. Ve a **SQL Editor** en la barra lateral izquierda
3. Haz clic en **New query**
4. Copia y pega todo el contenido de `supabase-setup.sql`
5. Haz clic en **Run** (o presiona Ctrl+Enter)
6. Verifica que aparezca "Success. No rows returned"

## Paso 2: Verificar Tablas Creadas

1. Ve a **Table Editor** en la barra lateral
2. Deberías ver dos tablas:
   - `user_profiles`
   - `transactions`

## Paso 3: Configurar Autenticación

1. Ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura estas opciones:
   - ✅ Enable email confirmations (desactivar para desarrollo)
   - ✅ Enable email autoconfirm (activar para desarrollo)
   - ❌ Enable secure email change
   - ❌ Enable signup (dejar activado)

### Configuración de Email (Opcional - Para Producción)

Para producción, configura un proveedor SMTP:
1. Ve a **Settings** > **Auth** > **SMTP Settings**
2. Configura tu proveedor de email (SendGrid, AWS SES, etc.)

Para desarrollo, Supabase usa su propio servidor de email.

## Paso 4: Obtener Credenciales de API

1. Ve a **Settings** > **API**
2. Copia estos valores:

**Project URL:**
```
https://sb1-qsvwhqh5.supabase.co
```

**anon/public key:**
```
[Copia la clave que empieza con 'eyJ...']
```

## Paso 5: Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto:

```bash
cd c:\Users\luisr\Repo-de-desarrollo\Luisitorisso\budget-calculator-react
copy .env.example .env
```

2. Edita `.env` y reemplaza con tus credenciales:

```env
VITE_SUPABASE_URL=https://sb1-qsvwhqh5.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

3. **IMPORTANTE:** Agrega `.env` a `.gitignore`:

```gitignore
# .gitignore
.env
.env.local
```

## Paso 6: Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

## Paso 7: Verificar Configuración

Después de configurar todo, verifica que:

### Tablas:
- [ ] `user_profiles` existe
- [ ] `transactions` existe
- [ ] RLS está habilitado en ambas tablas

### Políticas RLS:
- [ ] Users can view own profile
- [ ] Users can insert own profile
- [ ] Users can update own profile
- [ ] Users can view own transactions
- [ ] Users can insert own transactions
- [ ] Users can update own transactions
- [ ] Users can delete own transactions

### Índices:
- [ ] idx_transactions_user_id
- [ ] idx_transactions_date
- [ ] idx_transactions_type
- [ ] idx_transactions_user_date

### Triggers:
- [ ] update_user_profiles_updated_at
- [ ] update_transactions_updated_at
- [ ] on_auth_user_created

## Paso 8: Probar Autenticación

Una vez que hayas implementado los componentes de React:

1. **Registro:**
   - Crea una cuenta con email/password
   - Verifica que se cree un registro en `user_profiles`

2. **Login:**
   - Inicia sesión con las credenciales
   - Verifica que obtengas un token de sesión

3. **Transacciones:**
   - Crea una transacción
   - Verifica que aparezca en la tabla `transactions`
   - Verifica que solo veas tus propias transacciones

## Paso 9: Habilitar Realtime (Opcional)

Si quieres sincronización en tiempo real:

1. Ve a **Database** > **Replication**
2. Habilita replicación para `transactions`:
   - Source: `public.transactions`
   - Events: INSERT, UPDATE, DELETE

## Troubleshooting

### Error: "new row violates row-level security policy"

**Solución:** Asegúrate de que las políticas RLS estén configuradas correctamente. Verifica con:

```sql
SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'transactions');
```

### Error: "permission denied for table transactions"

**Solución:** Verifica que RLS esté habilitado:

```sql
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
```

### Las transacciones no se sincronizan en tiempo real

**Solución:** Verifica que Realtime esté habilitado:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
```

## Seguridad

### NO hacer:
- ❌ Commitear el archivo `.env` a Git
- ❌ Exponer el `service_role` key en el cliente
- ❌ Deshabilitar RLS en producción
- ❌ Permitir operaciones sin autenticación

### SÍ hacer:
- ✅ Usar solo el `anon` key en el cliente
- ✅ Mantener RLS siempre habilitado
- ✅ Validar datos en el cliente y servidor
- ✅ Usar HTTPS en producción
- ✅ Configurar rate limiting

## Migración de localStorage

Una vez configurado Supabase, usa la utilidad `migrateFromLocalStorage()` que se encuentra en `src/utils/dataMigration.js` para migrar datos existentes.

## Enlaces Útiles

- Dashboard del proyecto: https://supabase.com/dashboard/project/sb1-qsvwhqh5
- Documentación de Supabase: https://supabase.com/docs
- Documentación de RLS: https://supabase.com/docs/guides/auth/row-level-security
- Cliente JS: https://supabase.com/docs/reference/javascript/introduction
