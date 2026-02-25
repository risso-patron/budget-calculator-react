import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  analyzeFinances, 
  suggestCategory, 
  predictNextMonthExpenses,
  detectAnomalies,
  getProviderStatus,
  getAvailableProviders
} from '../lib/ai-providers'

/**
 * Hook para IA con múltiples proveedores gratuitos
 * Soporta: Gemini, Groq, Claude, Ollama
 * 
 * TODAS LAS OPCIONES GRATUITAS:
 * - Google Gemini: 1500 req/día gratis
 * - Groq: 30 req/min gratis
 * - Ollama: Ilimitado local
 */
export const useAIInsights = (transactions = []) => {
  const { user } = useAuth()
  
  // Estados para análisis financiero
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  
  // Estados para predicciones
  const [predictions, setPredictions] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState(null)
  
  // Estados para alertas
  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsError, setAlertsError] = useState(null)
  
  // Estado para categorización
  const [suggestedCategory, setSuggestedCategory] = useState(null)
  const [categorizing, setCategorizing] = useState(false)

  // Estado de proveedores
  const [providerStatus] = useState(getProviderStatus())
  
  /**
   * Verifica qué proveedores están disponibles
   */
  const checkProviders = useCallback(() => {
    const available = getAvailableProviders()
    console.log('🤖 Proveedores de IA disponibles:', available)
    
    if (available.length === 0) {
      console.warn('⚠️ No hay proveedores de IA configurados')
      console.info('📖 Lee docs/FREE_AI_SETUP.md para configurar opciones gratuitas')
    }
    
    return available
  }, [])

  /**
   * Analiza las finanzas del usuario
   */
  const runAnalysis = useCallback(async (monthlyTotals = null) => {
    if (!user) {
      setAnalysisError('Debes estar autenticado para usar esta función')
      return
    }

    if (!transactions || transactions.length === 0) {
      setAnalysisError('No hay transacciones para analizar')
      return
    }

    // Verificar proveedores disponibles
    const available = checkProviders()
    if (available.length === 0) {
      setAnalysisError('No hay proveedores de IA configurados. Configura Gemini o Groq (100% gratis)')
      return
    }

    try {
      setAnalyzing(true)
      setAnalysisError(null)
      
      console.log('🔄 Analizando', transactions.length, 'transacciones...')
      
      const result = await analyzeFinances(transactions, user.id, monthlyTotals)
      
      console.log('✅ Análisis completado con', result.provider)
      
      setAnalysis(result)
      
      // Guardar timestamp del último análisis
      localStorage.setItem('lastAnalysis', Date.now().toString())
      
      return result
    } catch (error) {
      console.error('❌ Error en análisis:', error)
      setAnalysisError(error.message || 'Error al analizar finanzas')
      return null
    } finally {
      setAnalyzing(false)
    }
  }, [transactions, user, checkProviders])

  /**
   * Sugiere categoría para una transacción
   */
  const getCategorySuggestion = useCallback(async (description) => {
    const available = checkProviders()
    if (available.length === 0) {
      return { category: 'Otros', confidence: 0.5 }
    }

    try {
      setCategorizing(true)
      const result = await suggestCategory(description)
      setSuggestedCategory(result)
      return result
    } catch (error) {
      console.error('Error sugiriendo categoría:', error)
      return { category: 'Otros', confidence: 0.5 }
    } finally {
      setCategorizing(false)
    }
  }, [checkProviders])

  /**
   * Predice gastos del próximo mes
   */
  const runPrediction = useCallback(async () => {
    if (!user) {
      setPredictionError('Debes estar autenticado')
      return
    }

    if (!transactions || transactions.length < 5) {
      setPredictionError('Necesitas al menos 5 transacciones para predicciones')
      return
    }

    const available = checkProviders()
    if (available.length === 0) {
      setPredictionError('No hay proveedores de IA configurados')
      return
    }

    try {
      setPredicting(true)
      setPredictionError(null)
      
      const result = await predictNextMonthExpenses(transactions, user.id)
      setPredictions(result)
      
      return result
    } catch (error) {
      console.error('Error en predicción:', error)
      setPredictionError(error.message)
      return null
    } finally {
      setPredicting(false)
    }
  }, [transactions, user, checkProviders])

  /**
   * Detecta anomalías en transacciones
   */
  const checkAnomalies = useCallback(async () => {
    if (!user) {
      setAlertsError('Debes estar autenticado')
      return
    }

    if (!transactions || transactions.length < 10) {
      setAlertsError('Necesitas al menos 10 transacciones')
      return
    }

    const available = checkProviders()
    if (available.length === 0) {
      setAlertsError('No hay proveedores de IA configurados')
      return
    }

    try {
      setAlertsLoading(true)
      setAlertsError(null)
      
      const result = await detectAnomalies(transactions, user.id)
      setAlerts(result.alertas || [])
      
      return result
    } catch (error) {
      console.error('Error detectando anomalías:', error)
      setAlertsError(error.message)
      return null
    } finally {
      setAlertsLoading(false)
    }
  }, [transactions, user, checkProviders])

  /**
   * Categoriza múltiples transacciones en lote
   * ÚTIL PARA IMPORTACIÓN CSV
   */
  const bulkCategorize = useCallback(async (transactionsArray) => {
    const available = checkProviders()
    if (available.length === 0) {
      console.warn('No hay IA configurada, usando categorías por defecto')
      return transactionsArray.map(t => ({ ...t, category: 'Otros' }))
    }

    console.log('🔄 Categorizando', transactionsArray.length, 'transacciones...')

    const categorized = []
    let successCount = 0
    let errorCount = 0

    for (const transaction of transactionsArray) {
      try {
        const suggestion = await suggestCategory(transaction.description)
        
        categorized.push({
          ...transaction,
          category: suggestion.category,
          aiConfidence: suggestion.confidence,
          aiProvider: suggestion.provider,
        })
        
        successCount++
      } catch (error) {
        categorized.push({
          ...transaction,
          category: 'Otros',
          aiConfidence: 0,
        })
        errorCount++
      }
    }

    console.log(`✅ Categorización completada: ${successCount} exitosas, ${errorCount} errores`)

    return categorized
  }, [checkProviders])

  return {
    // Estados
    analysis,
    analyzing,
    analysisError,
    predictions,
    predicting,
    predictionError,
    alerts,
    alertsLoading,
    alertsError,
    suggestedCategory,
    categorizing,
    providerStatus,
    
    // Funciones
    runAnalysis,
    getCategorySuggestion,
    runPrediction,
    checkAnomalies,
    checkProviders,
    bulkCategorize, // NUEVA: Para importación CSV
  }
}
