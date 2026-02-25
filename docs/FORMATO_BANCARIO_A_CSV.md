# 🏦 Convertir Estado Bancario a CSV

## Tu Excel Original:
```
Fila 1: (vacía)
Fila 2: últimos movimientos
Fila 3: (vacía)
Fila 4: Cuenta:CUENTA DE AHORROS 04-04-98-698887-0
Fila 5-7: (vacías)
Fila 8: Fecha | Referencia | Descripción | Monto | Saldo total
Fila 9+: DATOS
```

## Pasos para Convertir:

### 1️⃣ Limpiar el Excel

1. **Elimina las filas 1 a 7** (títulos y espacios)
2. La fila 8 debe quedar como fila 1
3. Ahora tu Excel empieza con: `Fecha | Referencia | Descripción | Monto | Saldo total`

### 2️⃣ Agregar Columna "tipo"

1. **Inserta una nueva columna A** (click derecho → Insertar)
2. En A1 escribe: `tipo`
3. En A2 escribe esta fórmula:
   ```excel
   =SI(D2>0,"ingreso","gasto")
   ```
4. Arrastra la fórmula hacia abajo para todas las filas

**Explicación**: Si el monto es positivo = ingreso, si es negativo = gasto

### 3️⃣ Agregar Columna "categoria"

1. **Inserta una nueva columna F**
2. En F1 escribe: `categoria`
3. En F2 escribe: `Otros` (o la categoría que corresponda)
4. Arrastra hacia abajo

### 4️⃣ Renombrar Columnas

Tu fila 1 debe quedar así:
```
tipo | Fecha | Referencia | descripcion | monto | categoria | Saldo total
```

Cambia:
- "Descripción" → `descripcion` (sin tilde)
- "Monto" → `monto` (minúscula)

### 5️⃣ Eliminar Columnas Innecesarias

Elimina:
- Columna "Referencia" (no la necesitamos)
- Columna "Saldo total" (no la necesitamos)

**Resultado final:**
```
tipo | fecha | descripcion | monto | categoria
```

### 6️⃣ Limpiar Valores de Monto

Los montos negativos (gastos) en rojo deben quedar como números positivos:
- `($1.25)` → `1.25`
- `($3.45)` → `3.45`

Excel puede tener los valores negativos como `(valor)`. Déjalos así, el importador los convierte automáticamente.

### 7️⃣ Guardar como CSV

1. **Archivo → Guardar como**
2. Tipo: **CSV (delimitado por comas) (*.csv)**
3. Nombre: `transacciones_banco.csv`
4. Click "Guardar"

## Resultado Final

Tu CSV debería verse así:
```csv
tipo,fecha,descripcion,monto,categoria
gasto,24-Feb-26,YAPPY BG DE,2.00,Otros
gasto,24-Feb-26,YAPPY BG A,3.45,Otros
gasto,24-Feb-26,PAGO YAPPY,1.25,Otros
ingreso,24-Feb-26,BANCA MOV,10.00,Otros
```

---

## 🆘 Problemas Comunes

**Q: Los montos negativos aparecen como `($10.00)`**
- A: No problema, el importador los convierte automáticamente a positivos

**Q: Las fechas están en formato `24-Feb-26`**
- A: Funciona, el importador acepta múltiples formatos

**Q: ¿Debo categorizar manualmente?**
- A: No necesariamente, puedes poner "Otros" en todos y luego editar en la app
