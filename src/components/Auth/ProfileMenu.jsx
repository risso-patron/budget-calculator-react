import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const ProfileMenu = ({ onClearAll, transactionCount = 0 }) => {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }

  const handleClear = () => {
    setIsOpen(false)
    onClearAll?.()
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white">
            {user.user_metadata?.full_name || 'Usuario'}
          </p>
          <p className="text-xs text-white/80 truncate max-w-[150px]">
            {user.email}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-white transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                {user.user_metadata?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
            <div className="p-2 space-y-1">
              {onClearAll && transactionCount > 0 && (
                <button
                  onClick={handleClear}
                  className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar transacciones ({transactionCount})
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
