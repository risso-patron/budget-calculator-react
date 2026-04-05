import { motion, AnimatePresence } from 'framer-motion';
import { Robot } from '@phosphor-icons/react';

/**
 * Botón Flotante Global (FAB) para acceso rápido al Asistente IA.
 * En móvil se eleva por encima de la BottomNav (bottom-28).
 */
export const FloatingChatButton = ({ onClick, isOpen }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-28 lg:bottom-8 right-5 z-[150] w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-[0_8px_24px_rgba(99,102,241,0.5)] flex items-center justify-center"
      aria-label="Asistente IA"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-black leading-none"
          >
            ×
          </motion.span>
        ) : (
          <motion.div
            key="robot"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Robot size={26} weight="fill" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing ring — solo cuando está cerrado */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400 animate-ping opacity-25 pointer-events-none" />
      )}
    </motion.button>
  );
};
