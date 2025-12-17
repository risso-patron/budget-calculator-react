# 💰 Budget Calculator - Gestión Inteligente de Finanzas Personales

<div align="center">

**Aplicación web moderna para control total de tus finanzas personales con IA**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Ver Demo](#) · [📖 Documentación](./docs) · [🐛 Reportar Bug](https://github.com/risso-patron/budget-calculator-react/issues) · [💡 Solicitar Feature](https://github.com/risso-patron/budget-calculator-react/issues)

</div>

---

## ✨ Features Principales

### 💸 Gestión de Transacciones
- ✅ Registro de ingresos y gastos con categorías personalizadas
- ✅ Filtros avanzados por fecha, categoría y monto
- ✅ Edición y eliminación de transacciones
- ✅ **Importación masiva desde CSV/Excel**
- ✅ **Exportación profesional a PDF y CSV**

### 📊 Análisis y Reportes
- ✅ Dashboard con métricas en tiempo real
- ✅ **4 tipos de gráficos interactivos** (Donut, Línea, Barras, Comparativo)
- ✅ Análisis de tendencias por período
- ✅ Reportes descargables con diseño profesional
- ✅ Estadísticas detalladas por categoría

### 🤖 Inteligencia Artificial
- ✅ **Análisis financiero con Claude AI**
- ✅ Score de salud financiera (0-100)
- ✅ Detección automática de patrones de gasto
- ✅ Recomendaciones personalizadas
- ✅ Predicciones de gastos futuros
- ✅ Alertas inteligentes

### 🎯 Metas Financieras
- ✅ Creación de metas de ahorro personalizadas
- ✅ Seguimiento visual de progreso
- ✅ Proyecciones de cumplimiento
- ✅ Notificaciones de logros

### 💳 Gestión de Tarjetas
- ✅ Múltiples tarjetas de crédito
- ✅ Control de límites de crédito
- ✅ Alertas de vencimiento
- ✅ Cálculo automático de intereses

### 🎮 Gamificación
- ✅ **Sistema de logros** (24 achievements desbloqueables)
- ✅ Niveles y experiencia
- ✅ Rachas de uso consistente
- ✅ Recompensas por metas alcanzadas

### 🔐 Autenticación y Seguridad
- ✅ Login/Registro con Supabase Auth
- ✅ **Datos sincronizados en la nube**
- ✅ Recuperación de contraseña
- ✅ Sesión persistente segura
- ✅ Row Level Security (RLS)

### 🎨 UI/UX Moderna
- ✅ **Dark mode nativo** con transiciones suaves
- ✅ Diseño 100% responsive (móvil, tablet, desktop)
- ✅ **Animaciones optimizadas con WebP**
- ✅ Interfaz intuitiva y accesible
- ✅ PWA instalable en móvil

---

## 🚀 Instalación Rápida

### Requisitos Previos

- Node.js 18+ 
- npm 9+
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/risso-patron/budget-calculator-react.git
cd budget-calculator-react

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev
```

**¡Listo!** La app estará en [http://localhost:3000](http://localhost:3000)

📖 **Guía completa de instalación:** [docs/SETUP.md](./docs/SETUP.md)

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- **React 19.1** - Framework UI
- **Vite 7.1** - Build tool ultra-rápido (Rolldown)
- **TailwindCSS 3.4** - Utility-first CSS
- **Framer Motion 12** - Animaciones fluidas
- **Recharts 3** - Gráficos interactivos

</td>
<td valign="top" width="50%">

### Backend & Servicios
- **Supabase** - BaaS completo
  - PostgreSQL database
  - Auth (Email, OAuth)
  - Real-time subscriptions
  - Row Level Security
- **Anthropic Claude** - IA para análisis
- **Stripe** - Pagos (opcional)

</td>
</tr>
</table>

### Otras Librerías
- **jsPDF** + **jsPDF-AutoTable** - Generación de PDFs
- **PapaParse** - Procesamiento CSV
- **React Confetti** - Celebraciones
- **PropTypes** - Validación de props

---

## 📸 Capturas de Pantalla

### 🖥️ Vista Desktop

**Dashboard Principal**
![Dashboard](https://via.placeholder.com/800x450/667eea/ffffff?text=Dashboard+Principal)

**Análisis con IA**
![AI Analysis](https://via.placeholder.com/800x450/764ba2/ffffff?text=Análisis+con+IA)

### 📱 Vista Móvil

<div align="center">
<img src="https://via.placeholder.com/300x600/667eea/ffffff?text=Móvil+1" width="250" />
<img src="https://via.placeholder.com/300x600/764ba2/ffffff?text=Móvil+2" width="250" />
<img src="https://via.placeholder.com/300x600/2ecc71/ffffff?text=Móvil+3" width="250" />
</div>

### 🌙 Dark Mode

![Dark Mode](https://via.placeholder.com/800x450/1a202c/ffffff?text=Modo+Oscuro)

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 3000)
npm run build            # Build de producción
npm run preview          # Preview del build

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run format           # Formatear con Prettier
npm run type-check       # Verificar tipos TypeScript

# Testing (próximamente)
npm run test             # Ejecutar tests
npm run test:ui          # UI de tests

# Deployment
npm run deploy           # Deploy a GitHub Pages
```

---

## 🗂️ Estructura del Proyecto

```
budget-calculator-react/
├── public/
│   ├── animations/         # Animaciones WebP optimizadas
│   ├── icons/              # Iconos 3D de categorías
│   └── manifest.json       # PWA manifest
│
├── src/
│   ├── components/         # Componentes React
│   │   ├── AI/            # Componentes de IA
│   │   ├── Auth/          # Autenticación
│   │   ├── Charts/        # Gráficos
│   │   ├── Dashboard/     # Dashboard
│   │   ├── Shared/        # Componentes reutilizables
│   │   └── Transactions/  # Transacciones
│   │
│   ├── features/          # Features completas
│   │   ├── export/        # Exportación PDF/CSV
│   │   ├── gamification/  # Sistema de logros
│   │   ├── goals/         # Metas financieras
│   │   └── import/        # Importación CSV
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useTransactions.js
│   │   ├── useAIInsights.js
│   │   └── useLocalStorage.js
│   │
│   ├── contexts/          # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── utils/             # Funciones helper
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── chartHelpers.js
│   │
│   ├── lib/               # Configuración de librerías
│   │   ├── supabase.js
│   │   └── anthropic.js
│   │
│   └── constants/         # Constantes
│       ├── categories.js
│       └── icons.js
│
├── docs/                  # Documentación
│   ├── SETUP.md          # Guía de instalación
│   ├── API.md            # Documentación de APIs
│   ├── CHANGELOG.md      # Historial de cambios
│   └── setup/            # Guías de configuración
│
└── supabase/             # Esquemas de DB
    ├── schema.sql
    └── subscriptions-schema.sql
```

---

## 🎯 Roadmap

### ✅ Completado
- [x] CRUD de transacciones
- [x] Autenticación con Supabase
- [x] Gráficos interactivos
- [x] Exportación PDF/CSV
- [x] Importación CSV
- [x] Sistema de gamificación
- [x] Integración de IA
- [x] Dark mode
- [x] PWA

### 🚧 En Desarrollo
- [ ] Migración completa a TypeScript
- [ ] Tests unitarios y de integración
- [ ] CI/CD con GitHub Actions

### 📅 Próximas Features
- [ ] Presupuestos mensuales
- [ ] Recordatorios de pagos
- [ ] Integración con bancos (Plaid)
- [ ] App móvil nativa (React Native)
- [ ] Modo colaborativo (finanzas familiares)
- [ ] Inversiones y crypto tracking

---

## 🔧 Configuración de Supabase

### 1. Crear Proyecto

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Completa los datos y crea el proyecto

### 2. Configurar Tablas

Ejecuta los scripts SQL en este orden:

```sql
-- 1. Tabla de transacciones
-- Ver: supabase/schema.sql

-- 2. Tabla de suscripciones (opcional)
-- Ver: supabase/subscriptions-schema.sql
```

### 3. Obtener Credenciales

En Settings → API, copia:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon/public key` → `VITE_SUPABASE_ANON_KEY`

📖 **Guía completa:** [docs/API.md](./docs/API.md#supabase)

---

## 🤖 Configuración de IA (Opcional)

Para habilitar análisis con IA:

1. Crea cuenta en [console.anthropic.com](https://console.anthropic.com/)
2. Genera API key
3. Agrégala a `.env`:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-tu_key
   ```

**Nota:** La app funciona sin esto, solo no tendrás features de IA.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 📱 Instalación como PWA

### Android
1. Abre la app en Chrome
2. Menú (⋮) → "Agregar a pantalla de inicio"

### iOS
1. Abre en Safari
2. Compartir (⬆️) → "Agregar a pantalla de inicio"

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva feature
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Cambios en build, configs, etc.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

---

## 👤 Autor

**Jorge Luis Risso Patrón**

- GitHub: [@risso-patron](https://github.com/risso-patron)
- Email: luisrissopa@gmail.com
- LinkedIn: [jorge-luis-risso-patron](https://www.linkedin.com/in/jorge-luis-risso-patron)
- Portfolio: [En construcción]

---

## 🙏 Agradecimientos

- [React](https://react.dev) - Framework UI
- [Supabase](https://supabase.com) - Backend as a Service
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS
- [Recharts](https://recharts.org) - Librería de gráficos
- [Anthropic](https://anthropic.com) - Claude AI
- [Vite](https://vitejs.dev) - Build tool

---

## ⭐ Apoya el Proyecto

Si este proyecto te fue útil, ¡considera darle una estrella en GitHub! ⭐

---

<div align="center">

**Hecho con ❤️ por Jorge Luis Risso Patrón**

[⬆ Volver arriba](#-budget-calculator---gestión-inteligente-de-finanzas-personales)

</div>
