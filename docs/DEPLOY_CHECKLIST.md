# 📋 Checklist de Preparación para Deploy

## Pre-Deploy

### Código y Configuración
- [x] Versión actualizada a 1.0.0
- [x] Vulnerabilidades npm resueltas
- [x] Build configuration optimizada
- [x] `_redirects` creado para Netlify
- [ ] Build de producción exitoso
- [ ] Preview local funciona (npm run preview)

### Variables de Entorno
- [ ] `.env` configurado localmente
- [ ] Supabase project creado
- [ ] Tablas de Supabase creadas (ejecutar supabase-setup.sql)
- [ ] Variables listas para Netlify:
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] VITE_ANTHROPIC_API_KEY (opcional)

### Git y GitHub
- [ ] Todos los cambios commiteados
- [ ] Push a origin/main exitoso
- [ ] Repo público en GitHub
- [ ] Descripción del repo actualizada
- [ ] Topics agregados (react, vite, supabase, etc.)

---

## Durante Deploy

### Screenshots
- [ ] Servidor dev corriendo (npm run dev)
- [ ] Cuenta de prueba creada
- [ ] 10+ transacciones de ejemplo agregadas
- [ ] Screenshot 1: Dashboard principal
- [ ] Screenshot 2: Gráficos de análisis
- [ ] Screenshot 3: Formulario de transacciones
- [ ] Screenshot 4: Sistema de logros
- [ ] Screenshot 5: Dark mode
- [ ] Screenshot 6: Vista móvil (opcional)
- [ ] Screenshots optimizados (<500KB cada uno)
- [ ] Screenshots guardados en public/screenshots/
- [ ] Commit y push de screenshots

### Netlify
- [ ] Cuenta de Netlify creada
- [ ] Sitio conectado desde GitHub
- [ ] Build settings configurados
- [ ] Variables de entorno agregadas
- [ ] Primer deploy exitoso
- [ ] URL del sitio funcional
- [ ] Nombre del sitio personalizado
- [ ] Badge de status obtenido

---

## Post-Deploy

### README Updates
- [ ] Screenshots placeholders reemplazados por reales
- [ ] Link a demo en vivo agregado
- [ ] Badge de Netlify agregado
- [ ] Sección "Demo" actualizada
- [ ] Commit y push de README actualizado

### Verificación Final
- [ ] Demo público funciona correctamente
- [ ] Login/Registro operacional
- [ ] Agregar transacciones funciona
- [ ] Gráficos se renderizan
- [ ] Dark mode funciona
- [ ] Responsive en móvil
- [ ] Sin errores en consola
- [ ] Datos persisten en Supabase

### GitHub
- [ ] Release v1.0.0 creado
- [ ] Descripción de release completa
- [ ] Repo pineado en perfil
- [ ] About section actualizado con demo URL

---

## Opcional pero Recomendado

### Calidad
- [ ] Tests ejecutados (npm run test)
- [ ] ESLint sin errores (npm run lint)
- [ ] Lighthouse score > 90
- [ ] Performance optimizado

### Documentación
- [ ] CHANGELOG.md actualizado
- [ ] LICENSE agregado
- [ ] Contributing guidelines (si es open source)

### SEO y Social
- [ ] Meta tags verificados
- [ ] Open Graph image creado
- [ ] Twitter card configurado

---

## Comandos de Referencia

```bash
# Build y preview local
npm run build
npm run preview

# Git workflow
git status
git add .
git commit -m "mensaje"
git push origin main

# Netlify CLI (opcional)
netlify login
netlify deploy --prod
netlify open

# Verificación
npm run lint
npm run test
npm audit
```

---

## Tiempo Estimado

- ⏱️ Build inicial: 2-3 minutos
- ⏱️ Tomar screenshots: 15-20 minutos
- ⏱️ Deploy Netlify: 5-10 minutos
- ⏱️ Actualizar README: 10 minutos
- ⏱️ Verificación final: 10 minutos

**Total: ~45-60 minutos**

---

## Recursos

- [Guía de Screenshots](./SCREENSHOTS_GUIDE.md)
- [Guía de Deploy Netlify](./NETLIFY_DEPLOYMENT_GUIDE.md)
- [Configuración de Supabase](./technical/SUPABASE_SETUP_GUIDE.md)

---

**✅ Marca cada item cuando lo completes. Al terminar, tendrás un proyecto 100% deployado y presentable!**
