// Categorías de gastos
export const EXPENSE_CATEGORIES = [
  { value: 'Vivienda', label: 'Vivienda', icon: '' },
  { value: 'Alimentación', label: 'Alimentación', icon: '' },
  { value: 'Transporte', label: 'Transporte', icon: '' },
  { value: 'Entretenimiento', label: 'Entretenimiento', icon: '' },
  { value: 'Salud', label: 'Salud', icon: '' },
  { value: 'Educación', label: 'Educación', icon: '' },
  { value: 'Servicios', label: 'Servicios', icon: '' },
  { value: 'Otros', label: 'Otros', icon: '' },
];

// Tipos de transacciones
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Filtros disponibles
export const FILTER_OPTIONS = {
  ALL: 'all',
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Keys para localStorage
export const STORAGE_KEYS = {
  INCOMES: 'budget_calculator_incomes',
  EXPENSES: 'budget_calculator_expenses',
  CREDIT_CARDS: 'budget_calculator_credit_cards',
  GOALS: 'budget_calculator_goals',
};

// Mensajes de la aplicación
export const MESSAGES = {
  SUCCESS: {
    INCOME_ADDED: 'Ingreso agregado exitosamente',
    EXPENSE_ADDED: 'Gasto agregado exitosamente',
    ITEM_DELETED: 'Elemento eliminado',
  },
  ERROR: {
    INVALID_AMOUNT: 'Por favor ingresa una cantidad válida mayor a 0',
    INVALID_DESCRIPTION: 'Por favor ingresa una descripción',
    GENERIC: 'Ocurrió un error. Por favor intenta nuevamente',
  },
  CONFIRM: {
    DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
  },
  EMPTY: {
    NO_INCOMES: 'Aún no has agregado ingresos',
    NO_EXPENSES: 'Aún no has agregado gastos',
    NO_TRANSACTIONS: 'Sin transacciones registradas',
    NO_CATEGORIES: 'Sin gastos por categoría',
  },
};
