# 🔐 GitHub Secrets Configuration

Para que los GitHub Actions funcionen correctamente, necesitas configurar estos secrets:

## 📍 Cómo agregar Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada uno de los secrets siguientes

---

## 🔑 Secrets Requeridos

### Para CI/CD Básico

```
VITE_SUPABASE_URL
Valor: https://tu-proyecto.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Para Deployment en Netlify

```
NETLIFY_AUTH_TOKEN
Cómo obtenerlo:
1. Ve a https://app.netlify.com/user/applications
2. Click en "New access token"
3. Copia el token generado
```

```
NETLIFY_SITE_ID
Cómo obtenerlo:
1. Ve a tu sitio en Netlify
2. Settings → General → Site details
3. Copia el "Site ID"
```

### Para Features Opcionales (IA, Stripe)

```
VITE_ANTHROPIC_API_KEY
Valor: sk-ant-api03-tu_key_aquí
```

```
VITE_STRIPE_PUBLIC_KEY
Valor: pk_test_tu_key_aquí
```

```
CODECOV_TOKEN (Opcional - para reportes de coverage)
Obtener en: https://codecov.io/
```

---

## ✅ Verificación

Después de configurar los secrets:

1. Haz un commit y push
2. Ve a la pestaña **Actions** en GitHub
3. Verifica que los workflows se ejecuten correctamente

---

## 🚨 Importante

- **NUNCA** commitees secrets directamente en el código
- Los secrets son encriptados y solo accesibles por GitHub Actions
- Puedes actualizar secrets en cualquier momento sin afectar el código

---

## 📚 Más información

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Netlify Deploy with GitHub Actions](https://github.com/nwtgck/actions-netlify)
