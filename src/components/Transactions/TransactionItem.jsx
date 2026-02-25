import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { EditTransactionModal } from './EditTransactionModal';

/**
 * Componente TransactionItem - Item individual con edición
 */
export const TransactionItem = ({ transaction, type, onRemove, onEdit, index }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncome = type === 'income';
  const category = EXPENSE_CATEGORIES.find(cat => cat.value === transaction.category);
  const icon = isIncome ? '💰' : (category?.icon || '💳');

  const handleDelete = async () => {
    setIsDeleting(true);
    // Animación de salida antes de eliminar
    setTimeout(() => {
      onRemove();
    }, 300);
  };

  const handleEdit = (id, updates) => {
    onEdit(id, updates);
    setShowEditModal(false);
  };

  return (
    <>
      <div 
        className={`
          group p-4 rounded-lg border-2 transition-all duration-300
          ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          ${isIncome 
            ? 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30' 
            : 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/30'
          }
          hover:shadow-md hover:scale-102
        `}
        style={{ 
          animationDelay: `${index * 50}ms`,
          animation: 'fadeInSlide 0.3s ease-out forwards'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Icono y contenido */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 dark:text-white truncate" title={transaction.description}>
                {transaction.description}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                <time dateTime={transaction.date}>
                  📅 {formatDate(transaction.date)}
                </time>
                {!isIncome && transaction.category && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span className="px-2 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded-full">
                      {transaction.category}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Monto y acciones */}
          <div className="flex flex-col items-end gap-2">
            <div 
              className={`text-lg font-bold ${
                isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                aria-label={`Editar ${isIncome ? 'ingreso' : 'gasto'}`}
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                aria-label={`Eliminar ${isIncome ? 'ingreso' : 'gasto'}`}
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <EditTransactionModal
          transaction={transaction}
          type={type}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
    </>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    category: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  index: PropTypes.number,
};
