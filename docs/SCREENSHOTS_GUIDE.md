# 📸 Guía para Tomar Screenshots

## Preparación

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Abre el navegador en:** http://localhost:5173

3. **Registra una cuenta de prueba:**
   - Email: demo@example.com
   - Password: Demo123456

---

## Screenshots a Tomar

### 1. Dashboard Principal (`dashboard.png`)

**Pasos:**
1. Agrega al menos 10 transacciones variadas:
   - 5-6 gastos (diferentes categorías: Comida, Transporte, Entretenimiento, Hogar)
   - 4-5 ingresos (Salario, Freelance, Inversiones)
   - Usa montos realistas: $50-$500

2. **Captura:** Pantalla completa del dashboard mostrando:
   - Balance total
   - Tarjetas de resumen
   - Lista de transacciones recientes
   - Preview de gráficos

**Dimensiones recomendadas:** 1920x1080 (Full HD)

---

### 2. Gráficos de Análisis (`charts.png`)

**Pasos:**
1. Scroll down a la sección de gráficos
2. Asegúrate de que todos los gráficos sean visibles:
   - Donut Chart (balance por categorías)
   - Line Chart (tendencias temporales)
   - Bar Chart (gastos por categoría)
   - Comparative Chart (ingresos vs gastos)

**Captura:** Sección completa de gráficos

**Dimensiones:** 1920x1080

---

### 3. Formulario de Transacciones (`transaction-form.png`)

**Pasos:**
1. Click en "Nueva Transacción" o botón de agregar
2. Llena el formulario (NO envíes):
   - Tipo: Gasto
   - Categoría: Comida
   - Descripción: "Compra en supermercado"
   - Monto: $125.50
   - Fecha: Hoy

**Captura:** Modal/formulario completo visible

**Dimensiones:** 1920x1080 (el fondo borroso añade contexto)

---

### 4. Sistema de Logros (`achievements.png`)

**Pasos:**
1. Scroll a la sección de gamificación/logros
2. Verifica que se muestren:
   - Barra de progreso de nivel
   - Logros desbloqueados
   - Logros bloqueados (con candado)
   - Sistema de puntos/experiencia

**Captura:** Panel completo de achievements

**Dimensiones:** 1920x1080

---

### 5. Dark Mode (`dark-mode.png`)

**Pasos:**
1. Click en el botón de cambio de tema (🌙/☀️)
2. Activa el modo oscuro
3. Verifica que el dashboard se vea bien en dark mode

**Captura:** Dashboard principal en modo oscuro

**Dimensiones:** 1920x1080

---

### 6. Vista Móvil (`mobile.png`) - OPCIONAL

**Pasos:**
1. Presiona F12 (DevTools)
2. Click en "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Selecciona dispositivo: iPhone 12 Pro (390x844)
4. Captura la vista móvil del dashboard

**Dimensiones:** 390x844 (móvil vertical)

---

### 7. Panel de IA (`ai-insights.png`) - SI TIENES API KEY

**Pasos:**
1. Configura tu API key de Anthropic en `.env`
2. Click en "Análisis con IA" o botón similar
3. Espera a que se generen los insights

**Captura:** Panel de análisis de IA con recomendaciones

---

## Herramientas Recomendadas

### Windows
- **Snipping Tool** (Win + Shift + S)
- **ShareX** (más potente, gratuito)
- **Lightshot**

### Navegador
- **Extensión Full Page Screen Capture**
- **DevTools Screenshot** (Ctrl+Shift+P → "Capture screenshot")

---

## Optimización de Imágenes

### Después de capturar:

1. **Redimensionar si es necesario:**
   ```bash
   # Con ImageMagick (si lo tienes instalado)
   magick mogrify -resize 1920x1080 *.png
   ```

2. **Comprimir (recomendado):**
   - Online: https://tinypng.com
   - Arrastra las 6 imágenes
   - Descarga comprimidas
   - Guarda en `public/screenshots/`

3. **Nombres finales:**
   ```
   public/screenshots/
   ├── dashboard.png
   ├── charts.png
   ├── transaction-form.png
   ├── achievements.png
   ├── dark-mode.png
   └── mobile.png (opcional)
   ```

---

## Commit Final

```bash
git add public/screenshots/*.png
git commit -m "docs: Agregar screenshots reales de la aplicación"
git push
```

---

## Checklist de Calidad

- [ ] Todas las imágenes son claras y nítidas
- [ ] No hay información personal visible
- [ ] Los datos de prueba se ven profesionales
- [ ] Dark mode se ve bien contrastado
- [ ] Vista móvil es legible
- [ ] Tamaño total de imágenes < 5MB
- [ ] Todas están en formato PNG
- [ ] Nombres de archivo correctos (sin espacios)

---

**🎯 Resultado esperado:** 5-6 screenshots profesionales que demuestren la funcionalidad completa de la app.
