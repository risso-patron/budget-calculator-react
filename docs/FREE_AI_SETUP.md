# 🎁 Configuración de IA GRATUITA para Budget Calculator

## 🚀 Tu situación: **3 opciones 100% gratis** sin tarjeta de crédito

---

## ⭐ OPCIÓN 1: Google Gemini (RECOMENDADA)

### Por qué elegir Gemini:
- ✅ **Completamente gratis** (sin tarjeta)
- ✅ **1,500 requests por día** (suficiente para uso personal)
- ✅ Buena calidad de análisis financiero
- ✅ Respuesta en 1-3 segundos
- ✅ Activación en 2 minutos

### Cómo obtener tu API Key:

#### Paso 1: Crear cuenta Google (si no tienes)
1. Ve a [accounts.google.com](https://accounts.google.com)
2. Crea una cuenta Gmail gratuita

#### Paso 2: Obtener API Key
1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Haz clic en **"Get API Key"**
3. Selecciona **"Create API key in new project"**
4. Copia la API Key (empieza con `AIza...`)

#### Paso 3: Configurar en Budget Calculator
1. Abre el archivo `.env` en la raíz del proyecto
2. Agrega esta línea:
   ```bash
   VITE_GOOGLE_GEMINI_API_KEY=AIzaSy...tu-clave-aqui
   ```
3. Guarda el archivo
4. Reinicia el servidor: `npm run dev`

### Límites:
- 🔢 **1,500 requests por día** (gratis para siempre)
- 🔢 **60 requests por minuto**
- 💰 **$0 de costo**

---

## ⚡ OPCIÓN 2: Groq (MÁS RÁPIDA)

### Por qué elegir Groq:
- ✅ **Completamente gratis** (sin tarjeta)
- ✅ **Ultra rápido** (hasta 10x más rápido que GPT-4)
- ✅ Buena calidad con modelo Llama 3.3 70B
- ⚠️ Límite: 30 requests por minuto (suficiente para uso personal)

### Cómo obtener tu API Key:

#### Paso 1: Crear cuenta
1. Ve a [console.groq.com](https://console.groq.com)
2. Haz clic en **"Sign Up"**
3. Regístrate con Google, GitHub o email
4. **NO requiere tarjeta de crédito**

#### Paso 2: Obtener API Key
1. Ve a [API Keys](https://console.groq.com/keys)
2. Haz clic en **"Create API Key"**
3. Dale un nombre: "Budget Calculator"
4. Copia la API Key (empieza con `gsk_...`)

#### Paso 3: Configurar
1. Abre `.env`
2. Agrega:
   ```bash
   VITE_GROQ_API_KEY=gsk_...tu-clave-aqui
   ```
3. Reinicia el servidor

### Límites:
- 🔢 **30 requests por minuto** (gratis)
- 🔢 **14,400 requests por día**
- 💰 **$0 de costo**
- ⚡ **Ultrarrápido**: 250-500 tokens/segundo

---

## 🏠 OPCIÓN 3: Ollama (LOCAL, SIN INTERNET)

### Por qué elegir Ollama:
- ✅ **100% gratis** y **sin límites**
- ✅ **Privacidad total**: Todo corre en tu PC
- ✅ Sin necesidad de API Keys ni Internet
- ⚠️ Requiere descargar modelo (~4GB)
- ⚠️ Requiere PC decente (8GB RAM mínimo)

### Cómo instalar:

#### Paso 1: Descargar Ollama
1. Ve a [ollama.com/download](https://ollama.com/download)
2. Descarga para Windows
3. Instala el ejecutable

#### Paso 2: Descargar modelo
Abre PowerShell o CMD y ejecuta:
```bash
ollama pull llama3.2:3b
```

Esto descarga un modelo de 3.2B parámetros (~2GB). Opciones:
- `llama3.2:1b` - Más rápido, menos preciso (1.3GB)
- `llama3.2:3b` - Balance perfecto (2GB)
- `llama3.3:70b` - Mejor calidad, más lento (40GB)

#### Paso 3: Iniciar servidor
```bash
ollama serve
```

Deja esta terminal abierta mientras uses Budget Calculator.

#### Paso 4: Configurar
NO necesitas agregar nada al `.env`. Ollama se detecta automáticamente cuando está corriendo.

### Límites:
- 🔢 **Sin límites** (todo local)
- 💰 **$0 de costo**
- 🔒 **Privacidad total**

---

## 📊 Comparación de opciones:

| Feature | Gemini | Groq | Ollama |
|---------|--------|------|--------|
| **Costo** | Gratis | Gratis | Gratis |
| **Tarjeta requerida** | ❌ No | ❌ No | ❌ No |
| **Límite diario** | 1,500 | 14,400 | ∞ |
| **Velocidad** | 3s | 0.5s | 2-5s |
| **Calidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Requiere Internet** | ✅ Sí | ✅ Sí | ❌ No |
| **Requiere instalación** | ❌ No | ❌ No | ✅ Sí |
| **Requiere RAM** | - | - | 8GB+ |

---

## 🎯 Recomendación según tu caso:

### Si tienes Internet estable:
**👉 Usa Gemini** (1,500 req/día es más que suficiente)

### Si necesitas velocidad:
**👉 Usa Groq** (ultrarrápido, 30 req/min)

### Si valoras privacidad o no tienes Internet:
**👉 Usa Ollama** (todo local, sin límites)

### 🔥 BONUS: Usa TODAS a la vez
El sistema está configurado para usar **fallback automático**:
1. Intenta Gemini primero
2. Si falla, usa Groq
3. Si falla, usa Ollama
4. Si tienes Claude después, se agrega automáticamente

---

## 🚀 Activación rápida (5 minutos):

### Opción Express: Solo Gemini

```bash
# 1. Ve a https://aistudio.google.com/apikey
# 2. Copia tu API Key
# 3. Pega en .env:

echo "VITE_GOOGLE_GEMINI_API_KEY=AIzaSy...tu-clave" >> .env

# 4. Reinicia
npm run dev
```

### Opción Completa: Gemini + Groq

```bash
# 1. Obtén ambas keys (5 minutos):
#    - Gemini: https://aistudio.google.com/apikey
#    - Groq: https://console.groq.com/keys

# 2. Agrega ambas al .env:
VITE_GOOGLE_GEMINI_API_KEY=AIzaSy...
VITE_GROQ_API_KEY=gsk_...

# 3. Reinicia
npm run dev
```

---

## 📖 Verificar que funciona:

1. Abre Budget Calculator
2. Agrega algunas transacciones
3. Busca el botón **"Analizar con IA"** o **"Obtener Insights"**
4. Haz clic y espera 1-3 segundos
5. Deberías ver:
   ```
   ✅ Respuesta exitosa de Gemini
   
   📊 Score de salud financiera: 78/100
   
   🔍 Patrones detectados:
   - Gastas más en fines de semana
   - Tus gastos de comida aumentaron 23%
   - Tienes gastos recurrentes no categorizados
   
   💡 Recomendaciones:
   - Reduce gastos de entretenimiento en $50/mes
   - Categoriza tus gastos recurrentes
   - Considera crear un fondo de emergencia
   ```

---

## ❓ Solución de problemas:

### Error: "API Key no configurada"
- ✅ Verifica que el `.env` esté en la **raíz** del proyecto
- ✅ Verifica que la variable empiece con `VITE_`
- ✅ Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

### Error: "Límite de requests alcanzado"
- ✅ Espera 1 minuto (rate limiting)
- ✅ Si usas Gemini: espera al día siguiente (1,500/día)
- ✅ Cambia a otro proveedor (Groq o Ollama)

### Error: "Ollama no disponible"
- ✅ Verifica que Ollama esté instalado: `ollama --version`
- ✅ Inicia el servidor: `ollama serve`
- ✅ Verifica que el modelo esté descargado: `ollama list`

---

## 💰 ¿Y si después consigo dinero?

Cuando tus finanzas mejoren, puedes agregar **Anthropic Claude**:
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea cuenta ($5 de crédito inicial)
3. Agrega al `.env`:
   ```bash
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

El sistema automáticamente usará Claude cuando esté disponible.

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas configurando:
1. Revisa que el archivo `.env` esté en la raíz
2. Verifica que las variables empiecen con `VITE_`
3. Reinicia el servidor después de editar `.env`
4. Abre la consola (F12) y busca mensajes de error

---

## 🎉 ¡Listo!

Ahora tienes **IA gratuita** para:
- ✅ Analizar tus finanzas
- ✅ Categorizar transacciones automáticamente
- ✅ Predecir gastos futuros
- ✅ Detectar anomalías
- ✅ Obtener recomendaciones personalizadas

**Todo sin pagar un centavo** 🎁
