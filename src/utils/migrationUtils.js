import { supabase } from '../lib/supabase'
import { STORAGE_KEYS, TRANSACTION_TYPES } from '../constants/categories'
import { getLocalTransactionsSnapshot, hasMigrated } from './dataMigration'

const MIGRATION_STATUS_KEY = 'budget-calculator-migrated'
const BACKUP_KEY = 'budgetCalculator_backup'
const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const persistTransactionsLocally = (transactions) => {
  if (!canUseStorage()) return
  const incomes = transactions.filter(
    tx => (tx.type || TRANSACTION_TYPES.INCOME) === TRANSACTION_TYPES.INCOME
  )
  const expenses = transactions.filter(
    tx => (tx.type || TRANSACTION_TYPES.EXPENSE) === TRANSACTION_TYPES.EXPENSE
  )

  window.localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes))
  window.localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
}

export const migrationUtils = {
  hasLocalData() {
    return getLocalTransactionsSnapshot().length > 0
  },

  getLocalData() {
    return getLocalTransactionsSnapshot()
  },

  isMigrated() {
    return hasMigrated()
  },

  markAsMigrated(status = 'true') {
    if (!canUseStorage()) return
    window.localStorage.setItem(MIGRATION_STATUS_KEY, status)
  },

  async migrateToSupabase(userId) {
    if (!userId) {
      throw new Error('Se requiere un ID de usuario')
    }

    if (this.isMigrated()) {
      return { success: true, message: 'Ya se migr�� previamente', count: 0 }
    }

    const localTransactions = this.getLocalData()

    if (localTransactions.length === 0) {
      this.markAsMigrated('true')
      return { success: true, message: 'No hay datos para migrar', count: 0 }
    }

    try {
      const validTransactions = localTransactions
        .map(tx => ({
          ...tx,
          amount: parseFloat(tx.amount),
          description: (tx.description || '').trim(),
        }))
        .filter(tx => tx.description && !Number.isNaN(tx.amount))

      if (validTransactions.length === 0) {
        this.markAsMigrated('true')
        return { success: true, message: 'No hay datos para migrar', count: 0 }
      }

      const batchSize = 50
      let successCount = 0

      for (let i = 0; i < validTransactions.length; i += batchSize) {
        const batch = validTransactions.slice(i, i + batchSize).map(t => ({
          user_id: userId,
          description: t.description,
          amount: t.amount,
          category: t.category || null,
          type: t.type || (t.category ? TRANSACTION_TYPES.EXPENSE : TRANSACTION_TYPES.INCOME),
          date: t.date || new Date().toISOString().split('T')[0],
        }))

        const { error } = await supabase
          .from('transactions')
          .insert(batch)

        if (error) throw error
        successCount += batch.length
      }

      this.markAsMigrated('true')

      if (canUseStorage()) {
        window.localStorage.setItem(BACKUP_KEY, JSON.stringify(validTransactions))
      }

      return {
        success: true,
        message: `Se migraron ${successCount} transacciones exitosamente`,
        count: successCount
      }
    } catch (error) {
      console.error('Error al migrar datos:', error)
      return {
        success: false,
        message: error.message,
        count: 0
      }
    }
  },

  clearLocalData() {
    if (!canUseStorage()) return
    window.localStorage.removeItem(STORAGE_KEYS.INCOMES)
    window.localStorage.removeItem(STORAGE_KEYS.EXPENSES)
    window.localStorage.removeItem(MIGRATION_STATUS_KEY)
  },

  async restoreFromBackup() {
    if (!canUseStorage()) return false
    const backup = window.localStorage.getItem(BACKUP_KEY)
    if (!backup) return false

    try {
      const transactions = JSON.parse(backup)
      persistTransactionsLocally(transactions)
      window.localStorage.removeItem(MIGRATION_STATUS_KEY)
      return true
    } catch (error) {
      console.error('Error al restaurar backup:', error)
      return false
    }
  }
}
