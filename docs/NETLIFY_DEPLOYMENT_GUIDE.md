# 🚀 Guía Rápida de Deploy en Netlify

## Opción A: Deploy desde GitHub (Recomendado)

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de que todo está pusheado
git status
git push origin main
```

### Paso 2: Conectar con Netlify

1. Ve a https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Si es primera vez, autoriza Netlify en GitHub
5. Busca y selecciona `budget-calculator-react`

### Paso 3: Configurar Build Settings

```
Build command: npm run build
Publish directory: dist
Branch to deploy: main
```

### Paso 4: Configurar Variables de Entorno

Antes de deployar, agrega las variables:

1. **Site settings** → **Environment variables** → **Add a variable**

2. Agrega estas 2-3 variables:

```
Variable 1:
Key: VITE_SUPABASE_URL
Value: https://ytuuinqelukfoqyeschn.supabase.co

Variable 2:
Key: VITE_SUPABASE_ANON_KEY
Value: tu_anon_key_de_supabase

Variable 3 (Opcional - solo si tienes):
Key: VITE_ANTHROPIC_API_KEY
Value: tu_api_key_de_anthropic
```

3. Click **"Save"**

### Paso 5: Deploy

1. Click **"Deploy budget-calculator-react"**
2. Espera 2-5 minutos (verás el log en tiempo real)
3. ✅ Cuando veas **"Site is live"**, está listo

### Paso 6: Verificar Deploy

1. Click en la URL generada (ejemplo: `https://luminous-platypus-a1b2c3.netlify.app`)
2. Prueba:
   - [ ] La app carga correctamente
   - [ ] Login/Registro funciona
   - [ ] Puedes agregar transacciones
   - [ ] Los gráficos se muestran
   - [ ] Dark mode funciona

---

## Opción B: Deploy Manual (CLI)

### Instalación

```bash
npm install -g netlify-cli
netlify login
```

### Deploy

```bash
# Build
npm run build

# Deploy a producción
netlify deploy --prod
```

Sigue las instrucciones en pantalla.

---

## Personalizar Dominio

### Cambiar nombre del sitio

1. **Site settings** → **Site details** → **Change site name**
2. Cambia a: `budget-calculator-risso` (o tu preferencia)
3. Tu URL será: `https://budget-calculator-risso.netlify.app`

### Dominio personalizado (opcional)

Si tienes un dominio propio:
1. **Domain management** → **Add custom domain**
2. Sigue las instrucciones de DNS

---

## Solución de Problemas

### Error: "Build failed"

**Causas comunes:**
1. Variables de entorno no configuradas
2. Error en el código (revisa logs)

**Solución:**
```bash
# Verifica build local primero
npm run build

# Si funciona local, revisa variables en Netlify
```

### Error: "Page not found" al navegar

**Causa:** Falta el archivo `_redirects`

**Solución:**
```bash
# Ya lo creamos, verifica que esté en public/_redirects
cat public/_redirects
# Debe decir: /*    /index.html   200
```

### Error: "Supabase connection failed"

**Causa:** Variables de entorno mal configuradas

**Solución:**
1. Verifica que las variables estén bien escritas
2. No debe haber espacios extra
3. Trigger redeploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy**

---

## Actualizar el Deployment

### Auto-deploy (Ya configurado)

Cada vez que hagas `git push origin main`, Netlify desplegará automáticamente.

### Manual redeploy

**Deploys** → **Trigger deploy** → **Deploy site**

---

## Badges de Status

Después de deployar, obtén el badge:

1. **Site settings** → **Status badges**
2. Copia el código Markdown
3. Pégalo en tu README.md:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/TU-ID/deploy-status)](https://app.netlify.com/sites/budget-calculator-risso/deploys)
```

---

## Checklist Post-Deploy

- [ ] Sitio accesible en la URL de Netlify
- [ ] Login/Registro funciona
- [ ] Transacciones se guardan en Supabase
- [ ] Gráficos se renderizan correctamente
- [ ] Dark mode funciona
- [ ] Responsive en móvil
- [ ] Sin errores en la consola del navegador
- [ ] README actualizado con URL del demo
- [ ] Badge de Netlify agregado

---

## URLs Importantes

- **Netlify Dashboard:** https://app.netlify.com/sites/budget-calculator-risso
- **Logs de Deploy:** https://app.netlify.com/sites/budget-calculator-risso/deploys
- **Variables de Entorno:** https://app.netlify.com/sites/budget-calculator-risso/settings/env

---

**🎉 Una vez deployado, tendrás una URL pública que puedes compartir en tu portfolio y GitHub!**
