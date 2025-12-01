import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../Shared/Card';
import { TransactionItem } from './TransactionItem';
import { MESSAGES } from '../../constants/categories';

/**
 * Componente TransactionList - Lista de transacciones (ingresos y gastos)
 */
export const TransactionList = ({ 
  incomes, 
  expenses, 
  onRemoveIncome, 
  onRemoveExpense 
}) => {
  const [showIncomes, setShowIncomes] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  
  const hasIncomes = incomes.length > 0;
  const hasExpenses = expenses.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lista de Ingresos */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            💰 Lista de Ingresos
            {hasIncomes && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({incomes.length})
              </span>
            )}
          </h3>
          {hasIncomes && (
            <button
              onClick={() => setShowIncomes(!showIncomes)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showIncomes ? '▼ Ocultar' : '▶ Mostrar'}
            </button>
          )}
        </div>
        
        {showIncomes && (
          <div className="flex-1 max-h-96 overflow-y-auto custom-scrollbar">
            {!hasIncomes ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">💸</p>
                <p>{MESSAGES.EMPTY.NO_INCOMES}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomes.map((income, index) => (
                  <TransactionItem
                    key={income.id}
                    transaction={income}
                    type="income"
                    onRemove={() => onRemoveIncome(income.id)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Lista de Gastos */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            💳 Lista de Gastos
            {hasExpenses && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({expenses.length})
              </span>
            )}
          </h3>
          {hasExpenses && (
            <button
              onClick={() => setShowExpenses(!showExpenses)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showExpenses ? '▼ Ocultar' : '▶ Mostrar'}
            </button>
          )}
        </div>
        
        {showExpenses && (
          <div className="flex-1 max-h-96 overflow-y-auto custom-scrollbar">
            {!hasExpenses ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🛒</p>
                <p>{MESSAGES.EMPTY.NO_EXPENSES}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense, index) => (
                  <TransactionItem
                    key={expense.id}
                    transaction={expense}
                    type="expense"
                    onRemove={() => onRemoveExpense(expense.id)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

TransactionList.propTypes = {
  incomes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  onRemoveIncome: PropTypes.func.isRequired,
  onRemoveExpense: PropTypes.func.isRequired,
};
