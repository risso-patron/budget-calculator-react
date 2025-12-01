# 🚀 CHECKLIST DE PRE-DEPLOYMENT

## ✅ CONFIGURACIÓN INICIAL

### Variables de Entorno
- [ ] Copiar `.env.example` a `.env.local`
- [ ] Configurar `VITE_SUPABASE_URL` con tu proyecto Supabase
- [ ] Configurar `VITE_SUPABASE_ANON_KEY` con tu anon key
- [ ] Verificar que `.env.local` está en `.gitignore`

### Netlify/Vercel Dashboard
- [ ] Crear cuenta en Netlify o Vercel
- [ ] Conectar repositorio de GitHub
- [ ] Configurar variables de entorno en el dashboard
- [ ] Configurar dominio personalizado (opcional)

---

## 🔒 SEGURIDAD

- [ ] No hay API keys hardcodeadas en el código
- [ ] `.env.local` está en `.gitignore`
- [ ] Headers de seguridad configurados (netlify.toml)
- [ ] Content Security Policy (CSP) configurado
- [ ] HTTPS habilitado (automático en Netlify/Vercel)
- [ ] Supabase RLS (Row Level Security) activado

---

## ⚡ PERFORMANCE

### Build
- [ ] `npm run build` ejecuta sin errores
- [ ] Bundle size < 1MB (verificar con `du -sh dist/`)
- [ ] Code splitting activado (chunks separados)
- [ ] Tree shaking funcionando
- [ ] Minificación activada
- [ ] Source maps generados

### Assets
- [ ] Imágenes optimizadas (WebP cuando sea posible)
- [ ] Favicon en múltiples resoluciones
- [ ] Manifest.json para PWA
- [ ] Service Worker configurado (opcional)

### Runtime
- [ ] Sin console.errors en navegador
- [ ] Sin memory leaks (verificar con Chrome DevTools)
- [ ] Lazy loading de componentes pesados
- [ ] Debounce en inputs de búsqueda
- [ ] Virtual scrolling en listas largas (si aplica)

---

## 🎨 UI/UX

- [ ] Responsive en móvil (320px+)
- [ ] Responsive en tablet (768px+)
- [ ] Responsive en desktop (1024px+)
- [ ] Dark mode funciona correctamente
- [ ] Loading states en todas las acciones async
- [ ] Error states con mensajes claros
- [ ] Empty states informativos
- [ ] Animaciones suaves (sin jank)
- [ ] Formularios validan correctamente
- [ ] Feedback visual en interacciones

---

## 🧪 TESTING FUNCIONAL

### Autenticación
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Logout funciona
- [ ] Recuperación de contraseña funciona
- [ ] Sesión persiste al recargar

### Transacciones
- [ ] Agregar ingreso funciona
- [ ] Agregar gasto funciona
- [ ] Editar transacción funciona
- [ ] Eliminar transacción funciona
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda funciona
- [ ] Paginación funciona (si aplica)

### Importación CSV
- [ ] Importación funciona con columnas ordenadas
- [ ] Importación funciona con columnas desordenadas
- [ ] Validación detecta errores
- [ ] Preview muestra datos correctos
- [ ] Importación masiva completa exitosamente

### Metas y Tarjetas
- [ ] Crear meta funciona
- [ ] Editar meta funciona
- [ ] Eliminar meta funciona
- [ ] Progreso de metas se actualiza
- [ ] Crear tarjeta funciona
- [ ] Editar tarjeta funciona
- [ ] Eliminar tarjeta funciona

### Gamificación
- [ ] Logros se desbloquean correctamente
- [ ] Niveles suben al acumular puntos
- [ ] Rachas se calculan correctamente
- [ ] Dashboard de gamificación muestra datos

### Reportes
- [ ] Exportación PDF funciona
- [ ] Exportación CSV funciona
- [ ] Gráficos se renderizan correctamente
- [ ] Datos en gráficos son precisos

---

## 📊 ANALYTICS Y MONITOREO

- [ ] Google Analytics configurado (opcional)
- [ ] Eventos personalizados funcionando
- [ ] Sentry configurado para error tracking (opcional)
- [ ] Web Vitals monitoreados

---

## 🌐 SEO Y METADATA

- [ ] Title tag optimizado
- [ ] Meta description presente
- [ ] Open Graph tags configurados
- [ ] Twitter Card tags configurados
- [ ] Favicon visible
- [ ] robots.txt presente (si aplica)
- [ ] sitemap.xml generado (si aplica)
- [ ] Schema.org structured data presente

---

## 🔗 LINKS Y NAVEGACIÓN

- [ ] Todos los links internos funcionan
- [ ] Links externos abren en nueva pestaña
- [ ] Navegación entre secciones suave
- [ ] Breadcrumbs correctos (si aplica)
- [ ] 404 page personalizada (opcional)

---

## 📱 PWA (Opcional)

- [ ] Manifest.json configurado
- [ ] Service Worker registrado
- [ ] App instalable en móvil
- [ ] Funciona offline (datos básicos)
- [ ] Notificaciones push configuradas (opcional)

---

## 🚦 LIGHTHOUSE SCORES

Ejecutar en modo incógnito: https://pagespeed.web.dev/

### Targets Mínimos:
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### Web Vitals:
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

---

## 📝 DOCUMENTACIÓN

- [ ] README.md actualizado con screenshots
- [ ] Instrucciones de instalación claras
- [ ] Link a demo live incluido
- [ ] Changelog actualizado
- [ ] Licencia definida
- [ ] Contributing guidelines (opcional)

---

## 🔄 CI/CD

- [ ] GitHub Actions configurado
- [ ] Build automático en push a main
- [ ] Tests pasan en CI (si aplica)
- [ ] Deploy automático configurado
- [ ] Notificaciones de deploy funcionando

---

## 🚨 PRUEBAS EN DIFERENTES NAVEGADORES

- [ ] Chrome (último)
- [ ] Firefox (último)
- [ ] Safari (último)
- [ ] Edge (último)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

---

## 📋 FINAL CHECKS

- [ ] Commit final descriptivo
- [ ] Tag de versión creado (v1.0.0)
- [ ] Branch main protegido
- [ ] Colaboradores invitados (si aplica)
- [ ] Dominio personalizado configurado (si aplica)

---

## 🎉 POST-DEPLOYMENT

- [ ] Verificar app en producción
- [ ] Probar funcionalidad end-to-end en producción
- [ ] Verificar analytics funcionando
- [ ] Compartir en redes sociales
- [ ] Agregar a portfolio personal
- [ ] Solicitar feedback de usuarios

---

## 🐛 TROUBLESHOOTING COMÚN

### Build falla en producción pero funciona local
- Verificar variables de entorno en Netlify/Vercel
- Revisar logs de build completos
- Verificar versión de Node.js

### App se ve rota en producción
- Verificar rutas de assets (deben ser relativas)
- Verificar que index.html tiene `<base href="/" />`
- Revisar console del navegador

### Supabase no conecta
- Verificar variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
- Verificar que están en Netlify Environment Variables
- Verificar CORS en Supabase dashboard

### Performance bajo
- Analizar bundle size: `npx vite-bundle-visualizer`
- Verificar chunks en dist/assets/
- Optimizar imágenes grandes

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0
