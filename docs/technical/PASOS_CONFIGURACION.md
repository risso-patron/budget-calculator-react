# Pasos para Configurar Supabase

## PASO 1: Ejecutar el Script SQL en Supabase

1. **Abre tu proyecto en Supabase:**
   - Ve a: https://supabase.com/dashboard/project/sb1-qsvwhqh5

2. **Abre el SQL Editor:**
   - En la barra lateral izquierda, haz clic en "SQL Editor"

3. **Crea una nueva consulta:**
   - Haz clic en "+ New query"

4. **Copia y pega el script:**
   - Abre el archivo `supabase-setup.sql`
   - Copia todo el contenido
   - Pégalo en el editor SQL de Supabase

5. **Ejecuta el script:**
   - Haz clic en "Run" o presiona `Ctrl+Enter`
   - Deberías ver: "Success. No rows returned"

6. **Verifica las tablas:**
   - Ve a "Table Editor" en la barra lateral
   - Deberías ver dos tablas:
     - `user_profiles`
     - `transactions`

## PASO 2: Obtener las Credenciales de API

1. **Ve a Project Settings:**
   - Haz clic en el ícono de configuración (⚙️) en la parte inferior de la barra lateral
   - O ve directamente a: https://supabase.com/dashboard/project/sb1-qsvwhqh5/settings/api

2. **Copia la Project URL:**
   ```
   https://sb1-qsvwhqh5.supabase.co
   ```

3. **Copia la anon/public key:**
   - Busca la sección "Project API keys"
   - Copia el valor de "anon" "public"
   - Es una clave larga que empieza con `eyJ...`

## PASO 3: Crear el Archivo .env

1. **En VS Code, crea un archivo `.env` en la raíz del proyecto:**
   ```
   c:\Users\luisr\Repo-de-desarrollo\Luisitorisso\budget-calculator-react\.env
   ```

2. **Agrega este contenido (reemplaza con tus credenciales reales):**
   ```env
   VITE_SUPABASE_URL=https://sb1-qsvwhqh5.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TU_CLAVE_COMPLETA_AQUI
   ```

3. **Guarda el archivo** (Ctrl+S)

## PASO 4: Verificar que .env NO se suba a Git

1. **Abre el archivo `.gitignore`**

2. **Verifica que contenga:**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **Si no está, agrégalo**

## PASO 5: Configurar Autenticación en Supabase

1. **Ve a Authentication > Providers:**
   - https://supabase.com/dashboard/project/sb1-qsvwhqh5/auth/providers

2. **Configura Email Auth:**
   - Asegúrate de que "Email" esté habilitado (✅)
   
3. **Para DESARROLLO, configura:**
   - ❌ Confirm email (deshabilitado)
   - ✅ Enable email autoconfirm (habilitado)
   
4. **Para PRODUCCIÓN, configura:**
   - ✅ Confirm email (habilitado)
   - ❌ Enable email autoconfirm (deshabilitado)
   - Configura SMTP Settings con tu proveedor de email

## PASO 6: Probar la Configuración

1. **Asegúrate de que npm install haya terminado:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abre el navegador:**
   ```
   http://localhost:5173
   ```

4. **Prueba el registro:**
   - Crea una cuenta nueva
   - Verifica que NO te pida confirmar email (en desarrollo)
   - Deberías poder iniciar sesión inmediatamente

5. **Verifica en Supabase:**
   - Ve a Authentication > Users
   - Deberías ver tu usuario recién creado
   - Ve a Table Editor > user_profiles
   - Deberías ver un registro con tu email

## PASO 7: Migración de Datos (Si tienes datos en localStorage)

1. **Inicia sesión en la app**

2. **Debería aparecer automáticamente un diálogo de migración**

3. **Haz clic en "Migrar Ahora"**

4. **Verifica en Table Editor > transactions:**
   - Deberías ver tus transacciones migradas

## Troubleshooting

### Error: "Faltan las variables de entorno de Supabase"

**Solución:**
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Verifica que las variables empiecen con `VITE_`
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Invalid API key"

**Solución:**
- Verifica que copiaste la clave `anon` completa
- Asegúrate de que no haya espacios al inicio o final
- La clave debe empezar con `eyJ`

### Error: "new row violates row-level security policy"

**Solución:**
- Ejecuta nuevamente el script SQL completo
- Verifica que las políticas RLS estén creadas:
  ```sql
  SELECT * FROM pg_policies 
  WHERE tablename IN ('user_profiles', 'transactions');
  ```

### No puedo crear transacciones

**Solución:**
- Verifica que estés autenticado
- Verifica que la política "Users can insert own transactions" exista
- Comprueba en la consola del navegador si hay errores

### Los datos no se sincronizan en tiempo real

**Solución:**
- Verifica que ejecutaste esta línea en el script SQL:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  ```

## Siguientes Pasos

Una vez que todo esté configurado:

1. [ ] Ejecutar script SQL en Supabase
2. [ ] Copiar credenciales de API
3. [ ] Crear archivo `.env` con credenciales
4. [ ] Configurar autenticación (deshabilitar confirm email para desarrollo)
5. [ ] Instalar dependencias (`npm install`)
6. [ ] Iniciar servidor (`npm run dev`)
7. [ ] Probar registro/login
8. [ ] Migrar datos de localStorage
9. [ ] Hacer commit y push a GitHub
10. [ ] Configurar variables de entorno en Netlify/Vercel para producción

## Variables de Entorno en Producción

Cuando despliegues a producción (Netlify, Vercel, etc.):

1. **Ve a tu dashboard de hosting**
2. **Agrega las variables de entorno:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Reconstruye la aplicación**

**Netlify:**
- Site settings > Build & deploy > Environment > Environment variables

**Vercel:**
- Project Settings > Environment Variables
