import { useState, useEffect } from 'react';
import { getAvailableProviders, getProviderStatus } from '../../lib/ai-providers';

/**
 * Panel de configuración de proveedores de IA
 * Muestra qué proveedores están configurados y listos
 */
export default function AIProviderStatus() {
  const [providers, setProviders] = useState([]);
  const [status, setStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const available = getAvailableProviders();
    const providerStatus = getProviderStatus();
    
    setProviders(available);
    setStatus(providerStatus);
  }, []);

  if (!status) return null;

  const configuredCount = providers.length;
  const hasAnyProvider = configuredCount > 0;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🤖 Inteligencia Artificial
            {hasAnyProvider && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                {configuredCount} activo{configuredCount > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {hasAnyProvider 
              ? 'Proveedores configurados y listos para usar'
              : 'Configura al menos un proveedor para activar features de IA'}
          </p>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
        >
          {showDetails ? 'Ocultar' : 'Ver detalles'}
        </button>
      </div>

      {/* Estado de proveedores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Google Gemini */}
        <div className={`p-3 rounded-lg border-2 ${
          status.gemini.configured 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">✨</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Gemini</span>
          </div>
          <span className={`text-xs ${
            status.gemini.configured 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {status.gemini.configured ? '✅ Activo' : '⚪ No configurado'}
          </span>
          {status.gemini.configured && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">🎁 Gratis</p>
          )}
        </div>

        {/* Groq */}
        <div className={`p-3 rounded-lg border-2 ${
          status.groq.configured 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Groq</span>
          </div>
          <span className={`text-xs ${
            status.groq.configured 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {status.groq.configured ? '✅ Activo' : '⚪ No configurado'}
          </span>
          {status.groq.configured && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">🎁 Gratis</p>
          )}
        </div>

        {/* Claude */}
        <div className={`p-3 rounded-lg border-2 ${
          status.claude.configured 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧠</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Claude</span>
          </div>
          <span className={`text-xs ${
            status.claude.configured 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {status.claude.configured ? '✅ Activo' : '⚪ No configurado'}
          </span>
          {status.claude.configured && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">💰 Pago</p>
          )}
        </div>

        {/* Ollama */}
        <div className={`p-3 rounded-lg border-2 ${
          status.ollama.configured 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏠</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Ollama</span>
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            🔧 Requiere instalación
          </span>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">🎁 Gratis</p>
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
            📖 Cómo configurar proveedores gratuitos:
          </h4>
          
          <div className="space-y-3 text-sm">
            {/* Gemini */}
            {!status.gemini.configured && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  ✨ Google Gemini (Recomendado)
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  🎁 Gratis: 1,500 requests/día
                </p>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Ve a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">Google AI Studio</a></li>
                  <li>Haz clic en "Get API Key"</li>
                  <li>Copia la key (empieza con AIza...)</li>
                  <li>Agrégala al archivo .env: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VITE_GOOGLE_GEMINI_API_KEY=...</code></li>
                  <li>Reinicia el servidor: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            )}

            {/* Groq */}
            {!status.groq.configured && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  ⚡ Groq (Más rápida)
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  🎁 Gratis: 30 requests/minuto
                </p>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Ve a <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">Groq Console</a></li>
                  <li>Crea cuenta (sin tarjeta)</li>
                  <li>Crea API Key</li>
                  <li>Agrégala al .env: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VITE_GROQ_API_KEY=...</code></li>
                  <li>Reinicia el servidor</li>
                </ol>
              </div>
            )}

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                💡 <strong>Tip:</strong> Puedes configurar múltiples proveedores. El sistema usa fallback automático si uno falla.
              </p>
            </div>

            <div className="text-center">
              <a 
                href="/docs/FREE_AI_SETUP.md" 
                target="_blank"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-medium underline"
              >
                📖 Ver guía completa de configuración
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Features disponibles cuando hay IA */}
      {hasAnyProvider && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
            ✨ Features activadas:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Análisis financiero inteligente</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Categorización automática</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Predicción de gastos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Detección de anomalías</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
