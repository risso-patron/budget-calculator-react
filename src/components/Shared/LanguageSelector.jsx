import { useTranslation } from 'react-i18next'
import { Globe } from '@phosphor-icons/react'

const LANGUAGES = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
]

/**
 * LanguageSelector — cambia idioma de la app.
 * compact=true: pills para sidebar
 * compact=false: con ícono globe y nombre completo
 */
export const LanguageSelector = ({ compact = false }) => {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) || 'es'

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Globe size={13} weight="bold" className="text-slate-500 shrink-0" />
        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-white/5">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              title={lang.label}
              className={[
                'px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all duration-200',
                current === lang.code
                  ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              {lang.short}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <Globe size={18} weight="bold" className="text-slate-600 dark:text-slate-300" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-snug">
          {LANGUAGES.find(l => l.code === current)?.label || 'Español'}
        </p>
        <div className="flex gap-1 mt-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              title={lang.label}
              className={[
                'px-2 py-0.5 rounded-lg text-[10px] font-black transition-all duration-200',
                current === lang.code
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              {lang.short}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
