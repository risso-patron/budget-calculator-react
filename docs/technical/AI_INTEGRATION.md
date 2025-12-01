# 🤖 Integración de IA con Claude - Calculadora de Presupuesto

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración Inicial](#configuración-inicial)
3. [Características y Funcionalidades](#características-y-funcionalidades)
4. [Arquitectura Técnica](#arquitectura-técnica)
5. [Componentes Disponibles](#componentes-disponibles)
6. [Guía de Uso](#guía-de-uso)
7. [Costos y Optimización](#costos-y-optimización)
8. [Ejemplos de Implementación](#ejemplos-de-implementación)
9. [Solución de Problemas](#solución-de-problemas)

---

## 📊 Resumen Ejecutivo

Esta integración transforma tu calculadora de presupuesto en una herramienta financiera inteligente usando **Claude Sonnet 4** de Anthropic. Proporciona análisis profundo, predicciones precisas y recomendaciones personalizadas para ayudar a los usuarios a tomar mejores decisiones financieras.

### ¿Qué puede hacer la IA?

- ✅ **Analizar** situación financiera completa con score de salud (0-100)
- ✅ **Identificar** patrones de gasto automáticamente
- ✅ **Categorizar** transacciones inteligentemente
- ✅ **Predecir** gastos futuros con confianza estadística
- ✅ **Alertar** sobre gastos inusuales o tendencias preocupantes
- ✅ **Recomendar** acciones específicas y accionables

---

## ⚙️ Configuración Inicial

### 1. Obtener API Key de Anthropic

1. Ve a [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Crea una cuenta o inicia sesión
3. Haz clic en "Create Key"
4. Copia la API Key (comienza con `sk-ant-api03-...`)

### 2. Configurar Variables de Entorno

Edita tu archivo `.env` y agrega:

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-aqui
```

⚠️ **IMPORTANTE**: 
- Nunca compartas tu API Key
- No la subas a GitHub
- Está incluida en `.gitignore` por seguridad

### 3. Verificar Instalación

```bash
npm run dev
```

La app debería iniciar sin errores. Si ves un mensaje sobre API Key no configurada, revisa que el `.env` esté en la raíz del proyecto.

---

## 🎯 Características y Funcionalidades

### 1. Análisis Financiero Inteligente

**Qué hace:**
- Analiza todas tus transacciones
- Calcula un score de salud financiera (0-100)
- Identifica 3 patrones específicos de gasto
- Proporciona 3 recomendaciones accionables
- Genera resumen ejecutivo

**Cuándo usarlo:**
- Al final del mes para revisar finanzas
- Antes de tomar decisiones financieras importantes
- Cuando notes cambios en tus gastos

**Costo estimado:** ~$0.01 por análisis

### 2. Categorización Automática

**Qué hace:**
- Sugiere categoría basándose en la descripción
- Muestra nivel de confianza (alta/media/baja)
- Permite override manual

**Ejemplos:**
- "Uber a la oficina" → Transporte (confianza: alta)
- "Pizza Hut" → Alimentación (confianza: alta)
- "Netflix mensual" → Entretenimiento (confianza: alta)

**Costo estimado:** ~$0.0001 por sugerencia

### 3. Predicción de Gastos Futuros

**Qué hace:**
- Predice gasto del próximo mes por categoría
- Calcula total estimado
- Proporciona rango de confianza (±15%)
- Identifica advertencias (ej: "gastos en alza")

**Requisitos:**
- Mínimo 2 meses de transacciones
- Mejora con más datos históricos

**Costo estimado:** ~$0.008 por predicción

### 4. Alertas Inteligentes

**Qué hace:**
- Detecta gastos inusuales
- Identifica categorías con tendencia alta
- Sugiere acciones correctivas
- Se ejecuta automáticamente cada 7 días

**Tipos de alertas:**
- 🔴 Alta severidad: Gasto significativamente mayor a lo normal
- 🟡 Media severidad: Tendencia al alza en categoría
- 🔵 Baja severidad: Categoría nueva detectada

**Costo estimado:** ~$0.005 por análisis de anomalías

---

## 🏗️ Arquitectura Técnica

### Estructura de Archivos

```
src/
├── lib/
│   └── anthropic.js          # Cliente API y funciones core
├── hooks/
│   └── useAIInsights.js      # Hook personalizado para IA
├── components/
│   └── AI/
│       ├── AIInsightsPanel.jsx        # Panel de análisis
│       ├── SmartCategorySelector.jsx  # Categorizador
│       ├── PredictiveChart.jsx        # Gráfico predictivo
│       ├── AIAlerts.jsx               # Sistema de alertas
│       └── index.js                   # Exports
```

### Flujo de Datos

```
Usuario → Componente UI
    ↓
useAIInsights Hook
    ↓
lib/anthropic.js (Cliente API)
    ↓
Claude API (Anthropic)
    ↓
Respuesta procesada → Estado
    ↓
UI actualizada
```

### Sistema de Caché

Para optimizar costos, las respuestas se cachean por 15 minutos:

```javascript
// Automático en todas las funciones
const cached = responseCache.get(cacheKey)
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return cached.data // Sin llamar a API
}
```

### Rate Limiting

Límite: **10 requests por minuto por usuario**

```javascript
if (!checkRateLimit(userId)) {
  throw new Error('Límite excedido. Espera 1 minuto.')
}
```

---

## 🧩 Componentes Disponibles

### AIInsightsPanel

**Props:**
```typescript
{
  analysis: {
    resumen: string
    patrones: string[]
    recomendaciones: string[]
    score: number
    scoreJustificacion: string
    tokensUsed?: number
    estimatedCost?: number
  }
  analyzing: boolean
  error: string | null
  onAnalyze: (monthlyTotals?) => void
  monthlyTotals?: object
}
```

**Ejemplo de uso:**
```jsx
import { AIInsightsPanel } from './components/AI'
import { useAIInsights } from './hooks/useAIInsights'

function Dashboard() {
  const { analysis, analyzing, analysisError, runAnalysis } = useAIInsights(transactions)
  
  return (
    <AIInsightsPanel
      analysis={analysis}
      analyzing={analyzing}
      error={analysisError}
      onAnalyze={runAnalysis}
    />
  )
}
```

### SmartCategorySelector

**Props:**
```typescript
{
  description: string
  selectedCategory: string
  categories: string[]
  onCategoryChange: (category: string) => void
  onGetSuggestion: (desc: string, cats: string[]) => void
  suggestedCategory: {
    category: string
    confidence: 'alta' | 'media' | 'baja'
  } | null
  loading: boolean
}
```

**Ejemplo de uso:**
```jsx
import { SmartCategorySelector } from './components/AI'
import { useAIInsights } from './hooks/useAIInsights'

function TransactionForm() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const { suggestedCategory, categorizing, getCategorySuggestion } = useAIInsights()
  
  return (
    <SmartCategorySelector
      description={description}
      selectedCategory={category}
      categories={EXPENSE_CATEGORIES}
      onCategoryChange={setCategory}
      onGetSuggestion={getCategorySuggestion}
      suggestedCategory={suggestedCategory}
      loading={categorizing}
    />
  )
}
```

### PredictiveChart

**Props:**
```typescript
{
  historicalData: Array<{
    month: string
    total: number
  }>
  predictions: {
    predicciones: {
      [categoria: string]: {
        monto: number
        confianza: 'alta' | 'media' | 'baja'
        razon: string
      }
    }
    totalEstimado: number
    advertencias: string[]
  } | null
  loading: boolean
}
```

**Ejemplo de uso:**
```jsx
import { PredictiveChart } from './components/AI'
import { useAIInsights } from './hooks/useAIInsights'

function Analytics() {
  const { predictions, predicting, predictExpenses } = useAIInsights(transactions)
  
  useEffect(() => {
    if (monthlyData.length >= 2) {
      predictExpenses(monthlyData)
    }
  }, [monthlyData])
  
  return (
    <PredictiveChart
      historicalData={monthlyData}
      predictions={predictions}
      loading={predicting}
    />
  )
}
```

### AIAlerts

**Props:**
```typescript
{
  alerts: Array<{
    tipo: 'gasto_inusual' | 'tendencia_alta' | 'categoria_nueva'
    categoria: string
    mensaje: string
    severidad: 'alta' | 'media' | 'baja'
    accionSugerida?: string
  }>
  loading: boolean
  onRefresh: () => void
  onDismiss?: (index: number) => void
}
```

**Ejemplo de uso:**
```jsx
import { AIAlerts } from './components/AI'
import { useAIInsights } from './hooks/useAIInsights'

function Navbar() {
  const { alerts, alertsLoading, checkAnomalies } = useAIInsights(transactions)
  
  return (
    <AIAlerts
      alerts={alerts}
      loading={alertsLoading}
      onRefresh={checkAnomalies}
    />
  )
}
```

---

## 📖 Guía de Uso

### Caso 1: Agregar Análisis al Dashboard

```jsx
// En tu App.jsx o Dashboard.jsx
import { useSupabaseTransactions } from './hooks/useSupabaseTransactions'
import { useAIInsights } from './hooks/useAIInsights'
import { AIInsightsPanel } from './components/AI'

function App() {
  const { transactions } = useSupabaseTransactions()
  const { analysis, analyzing, analysisError, runAnalysis } = useAIInsights(transactions)
  
  return (
    <div className="container mx-auto p-6">
      {/* Otros componentes */}
      
      <div className="mt-8">
        <AIInsightsPanel
          analysis={analysis}
          analyzing={analyzing}
          error={analysisError}
          onAnalyze={runAnalysis}
        />
      </div>
    </div>
  )
}
```

### Caso 2: Integrar Categorización en Formulario

```jsx
// En TransactionForm.jsx
import { useAIInsights } from '../../hooks/useAIInsights'
import { SmartCategorySelector } from '../AI'

export const TransactionForm = ({ onAddExpense }) => {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  
  const { suggestedCategory, categorizing, getCategorySuggestion } = useAIInsights()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onAddExpense({
      description,
      category,
      amount: parseFloat(amount)
    })
    // Reset form
    setDescription('')
    setCategory('')
    setAmount('')
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
      />
      
      <SmartCategorySelector
        description={description}
        selectedCategory={category}
        categories={EXPENSE_CATEGORIES.map(c => c.value)}
        onCategoryChange={setCategory}
        onGetSuggestion={getCategorySuggestion}
        suggestedCategory={suggestedCategory}
        loading={categorizing}
      />
      
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Cantidad"
      />
      
      <button type="submit">Agregar Gasto</button>
    </form>
  )
}
```

### Caso 3: Agregar Alertas al Navbar

```jsx
// En Navbar.jsx
import { useAIInsights } from '../hooks/useAIInsights'
import { AIAlerts } from './AI'

export const Navbar = ({ transactions }) => {
  const { alerts, alertsLoading, checkAnomalies } = useAIInsights(transactions)
  
  return (
    <nav className="bg-white shadow">
      <div className="flex items-center justify-between p-4">
        <h1>Mi Presupuesto</h1>
        
        <div className="flex items-center gap-4">
          {/* Otros botones */}
          
          <AIAlerts
            alerts={alerts}
            loading={alertsLoading}
            onRefresh={checkAnomalies}
          />
        </div>
      </div>
    </nav>
  )
}
```

---

## 💰 Costos y Optimización

### Tabla de Costos (Claude Sonnet 4)

| Función | Tokens Promedio | Costo por Uso | Usos/Mes Estimados | Costo Mensual |
|---------|-----------------|---------------|---------------------|---------------|
| Análisis Financiero | ~500 | $0.010 | 4 | $0.040 |
| Categorización | ~50 | $0.0001 | 30 | $0.003 |
| Predicción Gastos | ~400 | $0.008 | 1 | $0.008 |
| Alertas Semanales | ~300 | $0.005 | 4 | $0.020 |
| **TOTAL MENSUAL** | - | - | - | **~$0.071** |

### Estrategias de Optimización

#### 1. Sistema de Caché
```javascript
// Respuestas similares se reutilizan por 15 minutos
// Ahorro: ~70% en requests repetidas
```

#### 2. Limitar Transacciones Enviadas
```javascript
// Solo enviar últimas 50 transacciones para análisis
const recentTransactions = transactions.slice(0, 50)
```

#### 3. Rate Limiting
```javascript
// Máximo 10 requests por minuto
// Previene uso excesivo accidental
```

#### 4. Deshabilitar IA Opcional
```javascript
// Agregar toggle en configuración
const [aiEnabled, setAiEnabled] = useState(true)

if (!aiEnabled) {
  return <RegularCategorySelector />
}
```

#### 5. Análisis Programados
```javascript
// Ejecutar análisis solo cada 7 días automáticamente
// Usuario puede forzar actualización manual
```

---

## 🔧 Solución de Problemas

### Error: "API Key no configurada"

**Causa:** Variable de entorno no cargada

**Solución:**
1. Verifica que `.env` existe en la raíz
2. Contiene: `VITE_ANTHROPIC_API_KEY=sk-ant-...`
3. Reinicia el servidor: `npm run dev`

### Error: "Rate limit exceeded"

**Causa:** Más de 10 requests en 1 minuto

**Solución:**
- Espera 1 minuto
- Verifica que no hay llamadas en loop
- Revisa `useEffect` dependencies

### Error: "Invalid API Key"

**Causa:** API Key incorrecta o expirada

**Solución:**
1. Ve a [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Verifica que la key está activa
3. Crea una nueva si es necesario
4. Actualiza `.env`

### La categorización no funciona

**Causa:** Descripción muy corta o caché

**Solución:**
- Escribe al menos 3 caracteres
- Espera 800ms (debounce automático)
- Limpia caché: `clearCache()` en consola

### Predicciones no aparecen

**Causa:** Datos insuficientes

**Solución:**
- Necesitas mínimo 2 meses de transacciones
- Agrega más transacciones históricas
- Verifica que `monthlyData` tiene formato correcto

---

## 📊 Ejemplos de Respuestas de Claude

### Análisis Financiero

```json
{
  "resumen": "Tu situación financiera es estable con un balance positivo de $450. Tus gastos principales están en Alimentación (35%) y Transporte (25%).",
  "patrones": [
    "Gastas significativamente más en fines de semana, especialmente en Entretenimiento",
    "Tus compras de supermercado ocurren principalmente los jueves",
    "Has reducido gastos en Transporte en un 15% comparado al mes anterior"
  ],
  "recomendaciones": [
    "Establece un presupuesto semanal de $100 para fines de semana y monitorea cumplimiento",
    "Considera meal prep para reducir gastos de alimentación en $80-100 mensuales",
    "Aprovecha la reducción en Transporte para aumentar ahorros en $50/mes"
  ],
  "score": 72,
  "scoreJustificacion": "Buena gestión general con balance positivo y control de gastos principales. Hay oportunidad de mejorar en gastos discrecionales de fin de semana."
}
```

### Predicción de Gastos

```json
{
  "predicciones": {
    "Alimentación": {
      "monto": 450,
      "confianza": "alta",
      "razon": "Promedio estable en últimos 3 meses ($440-$460)"
    },
    "Transporte": {
      "monto": 180,
      "confianza": "media",
      "razon": "Ligera tendencia a la baja, precio de combustible variable"
    },
    "Entretenimiento": {
      "monto": 250,
      "confianza": "media",
      "razon": "Aumentó 20% en último mes, puede ser temporal"
    }
  },
  "totalEstimado": 1450,
  "advertencias": [
    "Observa aumento en Entretenimiento, puede afectar capacidad de ahorro",
    "Transporte muestra variabilidad, considera transporte público"
  ]
}
```

### Alertas de Anomalías

```json
{
  "alertas": [
    {
      "tipo": "gasto_inusual",
      "categoria": "Entretenimiento",
      "mensaje": "Gasto de $350 el 15/10, 140% mayor al promedio mensual de $145",
      "severidad": "alta",
      "accionSugerida": "Revisa este gasto y considera si se alinea con tus objetivos financieros. Si es ocasional, ajusta presupuesto del próximo mes."
    },
    {
      "tipo": "tendencia_alta",
      "categoria": "Alimentación",
      "mensaje": "Gastos en Alimentación aumentaron 18% en últimas 2 semanas",
      "severidad": "media",
      "accionSugerida": "Revisa restaurantes vs cocinar en casa. Considera meal prep los domingos para reducir gastos de semana."
    }
  ]
}
```

---

## 🚀 Roadmap de Mejoras

### Fase 2 (Futuro)

- [ ] Exportar análisis a PDF
- [ ] Comparativa mes a mes automática
- [ ] Metas financieras con seguimiento IA
- [ ] Insights personalizados basados en perfil
- [ ] Integración con calendario (gastos recurrentes)
- [ ] Alertas por email/push
- [ ] Dashboard ejecutivo generado por IA

### Fase 3 (Ideas)

- [ ] Chatbot financiero conversacional
- [ ] Consejos de inversión básicos
- [ ] Análisis de oportunidades de ahorro
- [ ] Comparación con promedios regionales
- [ ] Recomendaciones de productos financieros

---

## 📞 Soporte

### Recursos Adicionales

- **Documentación Claude:** [docs.anthropic.com](https://docs.anthropic.com)
- **API Reference:** [docs.anthropic.com/en/api](https://docs.anthropic.com/en/api)
- **Pricing:** [anthropic.com/pricing](https://www.anthropic.com/pricing)
- **Status Page:** [status.anthropic.com](https://status.anthropic.com)

### Contacto del Proyecto

- **Desarrollador:** Jorge Luis Risso Patrón
- **GitHub:** [@Luisitorisso](https://github.com/Luisitorisso)
- **Email:** luisrissopa@gmail.com

---

## ⚖️ Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

## 🙏 Agradecimientos

- **Anthropic** por Claude API
- **Recharts** por visualizaciones
- **Tailwind CSS** por diseño
- **Supabase** por backend

---

**Última actualización:** Noviembre 2025  
**Versión de Claude:** Sonnet 4 (claude-sonnet-4-20250514)  
**Versión del documento:** 1.0
