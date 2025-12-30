# Configuración de Google OAuth en Supabase

Esta guía explica cómo habilitar la autenticación con Google en tu proyecto.

## Pasos para configurar Google OAuth

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs y servicios" > "Credenciales"
4. Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"

#### Configurar la pantalla de consentimiento OAuth:
- Tipo de usuario: Externo
- Nombre de la aplicación: `Budget Calculator`
- Correo electrónico de asistencia: tu email
- Logotipo de la aplicación: (opcional)
- Dominios autorizados: tu dominio si lo tienes

#### Crear credenciales OAuth 2.0:
- Tipo de aplicación: **Aplicación web**
- Nombre: `Budget Calculator Web`
- URIs de redireccionamiento autorizados:
  ```
  https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
  ```
  
  Ejemplo:
  ```
  https://abcdefghijklmno.supabase.co/auth/v1/callback
  ```

5. Guarda el **Client ID** y **Client Secret** que se generan

### 2. Configurar Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a "Authentication" > "Providers"
4. Busca "Google" en la lista
5. Habilita el provider
6. Ingresa el **Client ID** y **Client Secret** de Google
7. Haz clic en "Save"

### 3. Configurar URLs de redirección locales (Desarrollo)

Para desarrollo local, agrega también esta URL en Google Cloud Console:

```
http://localhost:54321/auth/v1/callback
```

Y en tu archivo `.env.local`:

```env
# URLs de redirección
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key
```

### 4. Probar la integración

1. Inicia tu aplicación: `npm run dev`
2. Ve a la página de login
3. Haz clic en "Continuar con Google"
4. Deberías ver la pantalla de consentimiento de Google
5. Después de autorizar, serás redirigido a la app con sesión iniciada

## Verificar usuarios en Supabase

Los usuarios que se registren con Google aparecerán en:
- Supabase Dashboard > Authentication > Users
- Tendrán el campo `provider` = `google`
- Su email será el email de Google
- El `user_metadata` incluirá:
  - `full_name`: Nombre de Google
  - `avatar_url`: Foto de perfil de Google

## Estructura de datos del usuario

Cuando un usuario se autentica con Google, recibes:

```javascript
{
  id: "uuid-del-usuario",
  email: "usuario@gmail.com",
  user_metadata: {
    full_name: "Nombre Completo",
    avatar_url: "https://...",
    picture: "https://...",
    email_verified: true,
    provider_id: "id-de-google"
  },
  app_metadata: {
    provider: "google",
    providers: ["google"]
  }
}
```

## Manejo de errores comunes

### Error: "redirect_uri_mismatch"
- **Causa**: La URL de redirección no coincide
- **Solución**: Verifica que la URL en Google Cloud Console sea exactamente igual a la de Supabase

### Error: "unauthorized_client"
- **Causa**: Client ID o Secret incorrectos
- **Solución**: Verifica que copiaste correctamente las credenciales

### Error: "access_denied"
- **Causa**: Usuario canceló el login o no dio permisos
- **Solución**: Normal, el usuario rechazó la autenticación

## Configuración de producción

Cuando despliegues a producción (Netlify, Vercel, etc.):

1. Agrega la URL de producción en Google Cloud Console:
   ```
   https://tu-app.netlify.app
   https://tu-app.vercel.app
   ```

2. Actualiza las URLs de redirección:
   ```
   https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
   ```

3. Configura las variables de entorno en tu plataforma de hosting

## Seguridad

- ✅ Nunca expongas el Client Secret en el código frontend
- ✅ Supabase maneja el Client Secret de forma segura en el backend
- ✅ Los tokens de acceso se almacenan automáticamente en localStorage
- ✅ Las sesiones expiran automáticamente según la configuración de Supabase

## Recursos adicionales

- [Documentación oficial de Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## Código implementado

El botón de Google ya está integrado en:
- `LoginForm.jsx` - Página de inicio de sesión
- `RegisterForm.jsx` - Página de registro
- `LandingPage.jsx` - Landing page principal
- `AuthContext.jsx` - Función `signInWithGoogle()`
- `GoogleAuthButton.jsx` - Componente reutilizable

## Personalización

Para cambiar el estilo del botón, edita:
`src/components/Auth/GoogleAuthButton.jsx`

```jsx
className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg..."
```
