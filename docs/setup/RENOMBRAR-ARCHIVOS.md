# 📋 GUÍA DE RENOMBRADO - TUS ARCHIVOS WebP

## 🎯 RENOMBRAR Y MOVER (Copy-Paste estos comandos)

Abrí **cmd** o **PowerShell** y ejecutá:

```cmd
cd C:\Users\luisr\Downloads

REM Renombrar archivos
ren "money-1.webp" "money-rain.webp"
ren "flame-fire.webp" "fire.webp"
ren "gold-coin.webp" "coins.webp"
ren "tv.webp" "entertainment.webp"
ren "pink-car.webp" "transport.webp"
ren "money.webp" "income.webp"

REM Mover todos a la carpeta del proyecto
move *.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
```

---

## 📊 MAPEO DE ARCHIVOS

### ✅ Archivos que YA tienen nombre correcto:
- `donut.webp` → ✅ Perfecto (Categoría Alimentación)
- `house.webp` → ✅ Perfecto (Categoría Vivienda)
- `Rocket.webp` → ⚠️ Renombrar a minúscula: `rocket.webp`
- `Homer.webp` → ⚠️ Opcional (no lo usamos aún)

### 🔄 Archivos a renombrar:
- `money-1.webp` → **money-rain.webp** (Lluvia de dinero - Balance positivo)
- `flame-fire.webp` → **fire.webp** (Fuego racha)
- `gold-coin.webp` → **coins.webp** (Monedas ingresos)
- `tv.webp` → **entertainment.webp** (Categoría Entretenimiento)
- `pink-car.webp` → **transport.webp** (Categoría Transporte)
- `money.webp` → **income.webp** (Icono general de ingresos)

---

## ⚡ COMANDOS RÁPIDOS (Windows)

### OPCIÓN 1: Renombrar manualmente
1. Abrir carpeta: `C:\Users\luisr\Downloads`
2. Click derecho en cada archivo → Renombrar
3. Cambiar según tabla arriba

### OPCIÓN 2: Comando automático (RECOMENDADO)
Copiar y pegar esto en **cmd**:

```cmd
cd C:\Users\luisr\Downloads
ren "money-1.webp" "money-rain.webp"
ren "flame-fire.webp" "fire.webp"
ren "gold-coin.webp" "coins.webp"
ren "Rocket.webp" "rocket.webp"
move donut.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move house.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move money-rain.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move pink-car.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move tv.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move flame-fire.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move gold-coin.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move rocket.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move money.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
move Homer.webp "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations\"
```

---

## 🎯 ARCHIVOS FINALES (Lo que necesitamos)

### Archivos esenciales para la app:
```
public/animations/
  ├── donut.webp           ✅ (Categoría Alimentación)
  ├── house.webp           ✅ (Categoría Vivienda)
  ├── fire.webp            🔄 (de flame-fire.webp)
  ├── coins.webp           🔄 (de gold-coin.webp)
  ├── money-rain.webp      🔄 (de money-1.webp)
  ├── rocket.webp          🔄 (de Rocket.webp)
  ├── transport.webp       🔄 (de pink-car.webp)
  ├── entertainment.webp   🔄 (de tv.webp)
  ├── income.webp          🔄 (de money.webp)
  └── homer.webp           ✅ (Bonus - Homer con dinero)
```

---

## ✅ VERIFICACIÓN

Después de mover, verificá que estén en la carpeta:

```cmd
dir "C:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations"
```

Deberías ver:
- donut.webp
- house.webp
- fire.webp
- coins.webp
- money-rain.webp
- rocket.webp
- Y los demás...

---

## 🚀 ¿TODO LISTO?

Una vez movidos los archivos, ejecutá:

```cmd
npm run dev
```

Y te muestro cómo integrarlos en los componentes! 🎨
