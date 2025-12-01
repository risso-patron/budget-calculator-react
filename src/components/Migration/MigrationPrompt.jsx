import { useState, useEffect } from 'react'
import { migrationUtils } from '../../utils/migrationUtils'
import { useAuth } from '../contexts/AuthContext'
import { Alert } from '../components/Shared/Alert'

export const MigrationPrompt = ({ onComplete }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [transactionCount, setTransactionCount] = useState(0)

  useEffect(() => {
    const count = migrationUtils.getLocalData().length
    setTransactionCount(count)
  }, [])

  const handleMigrate = async () => {
    setLoading(true)
    setError('')

    const result = await migrationUtils.migrateToSupabase(user.id)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 2000)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const handleSkip = () => {
    migrationUtils.markAsMigrated()
    onComplete()
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Migración completada
            </h2>
            <p className="text-gray-600">
              Tus datos se sincronizaron correctamente
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Migrar tus datos
          </h2>
          <p className="text-gray-600">
            Detectamos {transactionCount} transacción{transactionCount !== 1 ? 'es' : ''} en tu dispositivo.
            ¿Deseas sincronizarlas con la nube?
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-4" />
        )}

        <div className="space-y-3">
          <button
            onClick={handleMigrate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Migrando...' : 'Sí, migrar datos'}
          </button>
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Empezar desde cero
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Tus datos locales se mantendrán como respaldo
        </p>
      </div>
    </div>
  )
}
