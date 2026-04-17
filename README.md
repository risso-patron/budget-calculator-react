<div align="center">

# Saldo

**Tu app de finanzas personales con IA**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase&logoColor=white&style=flat-square)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify&logoColor=white&style=flat-square)](https://budget-calculator-rp.netlify.app)
[![Tests](https://img.shields.io/badge/Tests-96%2F96%20passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://github.com/risso-patron/Saldo)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?logo=pwa&logoColor=white&style=flat-square)](#pwa)
[![i18n](https://img.shields.io/badge/i18n-ES%20%7C%20EN%20%7C%20FR-blue?style=flat-square)](#internacionalización)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[🌐 Demo en Vivo](https://budget-calculator-rp.netlify.app) · [🐛 Reportar Bug](https://github.com/risso-patron/Saldo/issues) · [✨ Solicitar Feature](https://github.com/risso-patron/Saldo/issues)

</div>

</div>

---

## ¿Qué es Saldo?

Saldo es una aplicación web de finanzas personales construida como SaaS. Pensada para quienes quieren entender a dónde va su dinero cada mes sin depender de hojas de cálculo.

Registra ingresos y gastos manualmente o importa directo desde tu extracto bancario (CSV / TXT). La IA categoriza automáticamente. El dashboard muestra el saldo real del mes, tendencias y hábitos.

> *"La construí porque yo también quería entender a dónde iba mi plata cada mes."*

---

## Funcionalidades

### Registro y gestión
- Ingreso manual de gastos e ingresos con categorías
- Edición de cualquier transacción con tap directo en la lista
- Eliminación individual y selección múltiple con acción masiva
- Filtros por mes, año, categoría y búsqueda por texto

### Importación bancaria
- Importa extractos CSV o TXT directamente desde el banco
- Detección automática de columnas (fecha, descripción, monto, débito/crédito)
- Soporte para formatos Banco General Panamá y bancos con separador `;` o `,`
- Categorización automática con IA tras el import
- Perfiles guardados por banco para reimportaciones futuras

### Dashboard e insights
- Saldo del mes: ingresos vs. egresos en tiempo real
- Mayor categoría de gasto con porcentaje sobre el total
- Tendencia mensual (% de mejora o empeoramiento vs. mes anterior)
- Racha de días con registros consecutivos

### Planificación
- Presupuesto global mensual con barra de progreso
- Metas de ahorro con proyección de cumplimiento
- Tarjetas de crédito con deuda y fecha de cierre

### Gamificación
- 24 logros desbloqueables por uso consistente
- Puntos y niveles
- Habits diarios y seguimiento de rachas

### Multi-moneda
- Registro en moneda original de cada transacción (150+ divisas)
- Conversión automática a moneda base en el dashboard
- Visualización dual: monto original + equivalencia

### IA integrada
- Categorización automática de transacciones importadas
- Chat con asistente financiero contextual
- Soporte multi-proveedor: Gemini, Groq, Claude, Ollama (local)

---

## Tech Stack

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TailwindCSS 3, Framer Motion, Recharts |
| **Auth / DB** | Supabase (PostgreSQL, Auth, RLS, Realtime) |
| **Hosting** | Netlify (CDN + Serverless Functions para proxies de IA) |
| **Build** | Vite 5, ESLint, Vitest 4 |
| **Pagos** | Stripe (suscripciones) |
| **Utilidades** | Decimal.js, PapaParse, jsPDF, Lottie, i18next |

---

## PWA

Saldo es una Progressive Web App instalable:

- Funciona **sin conexión** — la app se sirve desde cache cuando no hay red
- Página de fallback offline personalizada en caso de fallo total de red
- Instalable en iOS, Android y escritorio directamente desde el navegador
- Service Worker con estrategia cache-first para assets estáticos

---

## Internacionalización

La interfaz está disponible en **3 idiomas**:

| Código | Idioma |
| :--- | :--- |
| `ES` | Español (predeterminado) |
| `EN` | English |
| `FR` | Français |

El selector de idioma detecta automáticamente la preferencia del navegador al primer uso.

---

## Instalación local

**Requisitos:** Node.js 18+, npm 9+, cuenta Supabase (free tier).

```bash
# 1. Clonar
git clone https://github.com/risso-patron/Saldo.git
cd Saldo

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales
```

**.env mínimo:**
```env
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

```bash
# 4. Levantar en desarrollo
npm run dev
# → http://localhost:5173
```

> La IA es opcional. Sin API keys la app funciona en modo local con todas las funciones excepto categorización automática y chat.

---

## Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo (localhost:5173) |
| `npm run build` | Build de producción optimizado |
| `npm run preview` | Preview del build en local |
| `npm run test` | Tests unitarios con Vitest (96 tests) |
| `npm run test:coverage` | Tests + reporte de cobertura |
| `npm run lint` | Linter ESLint |
| `npm run type-check` | Validación de tipos TypeScript |

---

## Tests

El proyecto tiene **96 tests unitarios** cubriendo:

| Suite | Tests | Cobertura |
| :--- | :---: | :--- |
| `validators.test.js` | 43 | Validación de inputs y reglas de negocio |
| `sanitize.test.js` | 25 | Sanitización de datos y prevención XSS |
| `formatters.test.js` | 11 | Formateo de fechas, monedas y números |
| `calculations.test.js` | 4 | Cálculos financieros con precisión decimal |
| `aiProxy.security.test.js` | 3 | Seguridad del proxy de IA |
| `csvSecurity.test.js` | 3 | Seguridad en importación de archivos |
| `useSubscription.security.test.jsx` | 1 | Hook de suscripciones Stripe |
| `Button.test.jsx` | 5 | Componente Button (renderizado y variantes) |

```bash
npm run test
# → Test Files: 9 passed (9)
# → Tests:      96 passed (96)
```

---

## Seguridad

Auditado en **abril 2026**:
- Sin credenciales ni datos sensibles en código fuente o historial Git
- API keys de IA gestionadas vía variables de entorno en Netlify (nunca en el bundle cliente)
- Rate limiting y validación de origen en todas las Netlify Functions
- RLS (Row Level Security) activo en todas las tablas de Supabase
- Datos bancarios del usuario procesados en el dispositivo — no se envían al servidor

---

## Contribución

1. Revisa los [Issues abiertos](https://github.com/risso-patron/Saldo/issues)
2. Haz fork del repositorio y crea una rama descriptiva
3. Abre un [Pull Request](https://github.com/risso-patron/Saldo/pulls) con descripción clara del cambio

---

<div align="center">

Desarrollado por **[Jorge Luis Risso Patrón](https://github.com/risso-patron)** · Panamá 🇵🇦

[↑ Volver arriba](#saldo)

</div>

