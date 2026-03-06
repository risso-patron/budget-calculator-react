import { useState, useMemo } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { EXPENSE_CATEGORIES } from '../../constants/categories'
import { motion, AnimatePresence } from 'framer-motion'

const BUDGETS_KEY = 'budget_calculator_budgets'

/**
 * BudgetManager — Presupuestos por categoría con barras de progreso
 * Inspirado en MonAi: "Pon límites. Mantente al día."
 */
export function BudgetManager({ expenses }) {
  const [budgets, setBudgets] = useLocalStorage(BUDGETS_KEY, {})
  const [editingCategory, setEditingCategory] = useState(null)
  const [inputValue, setInputValue] = useState('')

  // Gastos del mes actual por categoría
  const currentMonthSpending = useMemo(() => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const result = {}

    expenses.forEach(exp => {
      if (!exp.date || !exp.category) return
      if (!exp.date.startsWith(yearMonth)) return
      result[exp.category] = (result[exp.category] || 0) + exp.amount
    })

    return result
  }, [expenses])

  // Categorías con presupuesto asignado + las que tienen gastos este mes
  const activeCategories = useMemo(() => {
    const cats = new Set([
      ...Object.keys(budgets),
      ...Object.keys(currentMonthSpending),
    ])
    return EXPENSE_CATEGORIES.filter(c => cats.has(c.value))
  }, [budgets, currentMonthSpending])

  const handleSaveBudget = (category) => {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val <= 0) return
    setBudgets(prev => ({ ...prev, [category]: val }))
    setEditingCategory(null)
    setInputValue('')
  }

  const handleRemoveBudget = (category) => {
    setBudgets(prev => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }

  const startEdit = (category) => {
    setEditingCategory(category)
    setInputValue(budgets[category]?.toString() || '')
  }

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getTextColor = (pct) => {
    if (pct >= 100) return 'text-red-400'
    if (pct >= 80) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount || 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🎯 Presupuestos por Categoría
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleString('es-PA', { month: 'long', year: 'numeric' })} — Límites de gasto mensuales
          </p>
        </div>
      </div>

      {/* Lista de categorías activas */}
      {activeCategories.length > 0 && (
        <div className="space-y-4 mb-6">
          {activeCategories.map(cat => {
            const spent = currentMonthSpending[cat.value] || 0
            const limit = budgets[cat.value]
            const pct = limit ? Math.min((spent / limit) * 100, 100) : null
            const isEditing = editingCategory === cat.value

            return (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
              >
                {/* Fila superior: categoría + montos */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-3">
                    {limit ? (
                      <span className={`text-sm font-semibold ${getTextColor(pct)}`}>
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">{formatCurrency(spent)} gastado</span>
                    )}
                    <button
                      onClick={() => startEdit(cat.value)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                    >
                      {limit ? 'Editar' : 'Fijar límite'}
                    </button>
                    {limit && (
                      <button
                        onClick={() => handleRemoveBudget(cat.value)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                {limit && pct !== null && (
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`h-2.5 rounded-full ${getBarColor(pct)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                )}

                {/* Mensaje si supera el límite */}
                {pct >= 100 && (
                  <p className="text-xs text-red-400 mt-1 font-medium">
                    ⚠️ Límite superado en {formatCurrency(spent - limit)}
                  </p>
                )}

                {/* Input edición en línea */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-2"
                    >
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveBudget(cat.value) }}
                        placeholder="Límite mensual ($)"
                        autoFocus
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => handleSaveBudget(cat.value)}
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 text-gray-700 dark:text-white text-sm rounded-lg"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Selector para agregar nuevas categorías sin gastos */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wide">
          Fijar límite para otra categoría
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.filter(c => !activeCategories.find(a => a.value === c.value)).map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setEditingCategory(cat.value)
                setInputValue('')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-300 
                text-sm rounded-lg transition-colors"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
          {/* Formulario inline para categorías fuera de la lista activa */}
          <AnimatePresence>
            {editingCategory && !activeCategories.find(c => c.value === editingCategory) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full mt-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 flex gap-2 items-center"
              >
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                  {EXPENSE_CATEGORIES.find(c => c.value === editingCategory)?.icon} {editingCategory}:
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveBudget(editingCategory) }}
                  placeholder="Límite mensual ($)"
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={() => handleSaveBudget(editingCategory)}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 text-gray-700 dark:text-white text-sm rounded-lg"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Estado vacío */}
      {activeCategories.length === 0 && (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-sm">Aún no tienes límites configurados.</p>
          <p className="text-xs mt-1">Selecciona una categoría arriba para comenzar.</p>
        </div>
      )}
    </div>
  )
}
