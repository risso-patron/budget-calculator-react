import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../Shared/Card';
import { TransactionItem } from './TransactionItem';
import { MESSAGES, EXPENSE_CATEGORIES } from '../../constants/categories';

/**
 * Barra de filtros y búsqueda
 */
const FilterBar = ({ onSearch, onCategoryFilter, onSort, selectedCategory, showCategory = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 mb-4">
      {/* Búsqueda */}
      <div className="relative">
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por descripción..."
          className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all dark:bg-gray-700 dark:text-white"
          aria-label="Buscar transacciones"
        />
        <svg 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {showCategory && (
          <select
            onChange={(e) => onCategoryFilter(e.target.value)}
            value={selectedCategory}
            className="px-3 py-1.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 outline-none dark:bg-gray-700 dark:text-white"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        )}

        <select
          onChange={(e) => onSort(e.target.value)}
          className="px-3 py-1.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 outline-none dark:bg-gray-700 dark:text-white"
          aria-label="Ordenar transacciones"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="amount-desc">Mayor monto</option>
          <option value="amount-asc">Menor monto</option>
        </select>
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onCategoryFilter: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  showCategory: PropTypes.bool,
};

/**
 * Componente TransactionList - Lista con filtros y búsqueda
 */
export const TransactionList = ({ 
  incomes, 
  expenses, 
  onRemoveIncome, 
  onRemoveExpense,
  onUpdateIncome,
  onUpdateExpense,
}) => {
  const [showIncomes, setShowIncomes] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  
  // Estados de filtros
  const [incomeSearch, setIncomeSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [incomeSortBy, setIncomeSortBy] = useState('newest');
  const [expenseSortBy, setExpenseSortBy] = useState('newest');

  // Filtrar y ordenar ingresos
  const filteredIncomes = incomes
    .filter(income => 
      income.description.toLowerCase().includes(incomeSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (incomeSortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (incomeSortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (incomeSortBy === 'amount-desc') return b.amount - a.amount;
      if (incomeSortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  // Filtrar y ordenar gastos
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(expenseSearch.toLowerCase());
      const matchesCategory = !categoryFilter || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (expenseSortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (expenseSortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (expenseSortBy === 'amount-desc') return b.amount - a.amount;
      if (expenseSortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  const hasIncomes = incomes.length > 0;
  const hasExpenses = expenses.length > 0;
  const hasFilteredIncomes = filteredIncomes.length > 0;
  const hasFilteredExpenses = filteredExpenses.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lista de Ingresos */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            💰 Ingresos
            {hasIncomes && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredIncomes.length}/{incomes.length})
              </span>
            )}
          </h3>
          {hasIncomes && (
            <button
              onClick={() => setShowIncomes(!showIncomes)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              aria-expanded={showIncomes}
            >
              {showIncomes ? '▼ Ocultar' : '▶ Mostrar'}
            </button>
          )}
        </div>

        {showIncomes && hasIncomes && (
          <FilterBar
            onSearch={setIncomeSearch}
            onCategoryFilter={() => {}}
            onSort={setIncomeSortBy}
            selectedCategory=""
            showCategory={false}
          />
        )}
        
        {showIncomes && (
          <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
            {!hasIncomes ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">💸</p>
                <p>{MESSAGES.EMPTY.NO_INCOMES}</p>
              </div>
            ) : !hasFilteredIncomes ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">🔍</p>
                <p>No se encontraron ingresos con esos filtros</p>
                <button
                  onClick={() => setIncomeSearch('')}
                  className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncomes.map((income, index) => (
                  <TransactionItem
                    key={income.id}
                    transaction={income}
                    type="income"
                    onRemove={() => onRemoveIncome(income.id)}
                    onEdit={onUpdateIncome}
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
            💳 Gastos
            {hasExpenses && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredExpenses.length}/{expenses.length})
              </span>
            )}
          </h3>
          {hasExpenses && (
            <button
              onClick={() => setShowExpenses(!showExpenses)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              aria-expanded={showExpenses}
            >
              {showExpenses ? '▼ Ocultar' : '▶ Mostrar'}
            </button>
          )}
        </div>

        {showExpenses && hasExpenses && (
          <FilterBar
            onSearch={setExpenseSearch}
            onCategoryFilter={setCategoryFilter}
            onSort={setExpenseSortBy}
            selectedCategory={categoryFilter}
            showCategory={true}
          />
        )}
        
        {showExpenses && (
          <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
            {!hasExpenses ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">🛒</p>
                <p>{MESSAGES.EMPTY.NO_EXPENSES}</p>
              </div>
            ) : !hasFilteredExpenses ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">🔍</p>
                <p>No se encontraron gastos con esos filtros</p>
                <button
                  onClick={() => {
                    setExpenseSearch('');
                    setCategoryFilter('');
                  }}
                  className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <TransactionItem
                    key={expense.id}
                    transaction={expense}
                    type="expense"
                    onRemove={() => onRemoveExpense(expense.id)}
                    onEdit={onUpdateExpense}
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
  incomes: PropTypes.array.isRequired,
  expenses: PropTypes.array.isRequired,
  onRemoveIncome: PropTypes.func.isRequired,
  onRemoveExpense: PropTypes.func.isRequired,
  onUpdateIncome: PropTypes.func.isRequired,
  onUpdateExpense: PropTypes.func.isRequired,
};
