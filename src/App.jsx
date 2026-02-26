import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS } from './constants/categories';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { TransactionList } from './components/Transactions/TransactionList';
import { BalanceCard } from './components/Dashboard/BalanceCard';
import { CategoryChart } from './components/Dashboard/CategoryChart';
import { Alert } from './components/Shared/Alert';
import { ConfirmDialog } from './components/Shared/ConfirmDialog';
import { ThemeToggle } from './components/Shared/ThemeToggle';
import { ProfileMenu } from './components/Auth/ProfileMenu';
import MigrationDialog from './components/MigrationDialog';
import AuthPage from './pages/AuthPage';
import { hasPendingMigration } from './utils/dataMigration';
import { CreditCardManager } from './components/CreditCard/CreditCardManager';
// Nuevos gráficos avanzados
import { BalanceDonutChart } from './components/Charts/BalanceDonutChart';
import { TrendLineChart } from './components/Charts/TrendLineChart';
import { CategoryBarChart } from './components/Charts/CategoryBarChart';
import { ComparativeChart } from './components/Charts/ComparativeChart';
import { MonthlyCashFlowChart } from './components/Charts/MonthlyCashFlowChart';
import { SpendingByDayChart } from './components/Charts/SpendingByDayChart';
import { TopMerchantsChart } from './components/Charts/TopMerchantsChart';
// COMPONENTES DE IA - HABILITADOS CON GEMINI GRATIS
import { AIInsightsPanel, AIAlerts, PredictiveChart, AIProviderStatus } from './components/AI';
import { useAIInsights } from './hooks/useAIInsightsMulti';
// FEATURES PREMIUM
import { GoalManager } from './features/goals/GoalManager';
import { ExportManager } from './features/export/ExportManager';
import ImportManager from './features/import/ImportManager';
// GAMIFICACIÓN
import { GamificationDashboard, AchievementNotifications } from './features/gamification';
import { useAchievements } from './hooks/gamification/useAchievements';


/**
 * Componente principal de la aplicación con autenticación
 */
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [showMigration, setShowMigration] = useState(false);
  const [creditCards, setCreditCards] = useLocalStorage(STORAGE_KEYS.CREDIT_CARDS, []);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, []);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Eliminar',
    variant: 'danger',
    onConfirm: null,
  });

  const closeConfirm = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const openConfirm = useCallback((config) => {
    setConfirmDialog({ isOpen: true, confirmLabel: 'Eliminar', variant: 'danger', ...config });
  }, []);

  const {
    incomes,
    expenses,
    alert,
    addIncome,
    addExpense,
    addBulkTransactions,
    updateIncome,
    updateExpense,
    removeIncome,
    removeExpense,
    showAlert,
    totalIncome,
    totalExpenses,
    balance,
    categoryAnalysis,
    clearAll,
    refreshTransactions,
  } = useTransactions();

  // Hook de gamificación
  const achievements = useAchievements();

  // Combinar todas las transacciones para IA (memoizado — evita objetos nuevos en cada render)
  const allTransactions = useMemo(() => [
    ...incomes.map(income => ({ ...income, type: 'income' })),
    ...expenses.map(expense => ({ ...expense, type: 'expense' }))
  ], [incomes, expenses]);

  // Hook de IA con multi-proveedores (Gemini, Groq, Claude, Ollama)
  const aiInsights = useAIInsights(allTransactions);

  // Funciones para tarjetas de crédito
  const handleAddCard = (card) => {
    setCreditCards([...creditCards, card]);
    showAlert('success', `Tarjeta "${card.name}" agregada exitosamente`);
    return true;
  };

  const handleUpdateDebt = (cardId, newDebt) => {
    setCreditCards(creditCards.map(card =>
      card.id === cardId ? { ...card, debt: newDebt } : card
    ));
  };

  const handleRemoveCard = (cardId) => {
    setCreditCards(creditCards.filter(card => card.id !== cardId));
    showAlert('success', 'Tarjeta eliminada');
  };

  // Funciones para metas financieras
  const handleAddGoal = (goal) => {
    setGoals([...goals, goal]);
    showAlert('success', `Meta "${goal.name}" creada exitosamente`);
    return true;
  };

  const handleUpdateGoalProgress = (goalId, newAmount) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, currentAmount: newAmount } : goal
    ));
  };

  const handleDeleteGoal = (goalId) => {
    openConfirm({
      title: 'Eliminar meta',
      message: '\u00bfEst\u00e1s seguro de eliminar esta meta? Esta acci\u00f3n no se puede deshacer.',
      onConfirm: () => {
        setGoals(goals.filter(goal => goal.id !== goalId));
        showAlert('success', 'Meta eliminada');
        closeConfirm();
      },
    });
  };

  // Wrappers para transacciones que registran en gamificación
  const handleAddIncome = (description, amount, date) => {
    const result = addIncome(description, amount, date);
    if (result) {
      achievements.recordTransaction('income');
    }
    return result;
  };

  const handleAddExpense = (description, category, amount, date) => {
    const result = addExpense(description, category, amount, date);
    if (result) {
      achievements.recordTransaction('expense');
    }
    return result;
  };

  // Handler para importación CSV
  const handleImportTransaction = async (type, data) => {
    try {
      if (type === 'income') {
        const result = handleAddIncome(data.description, data.amount, data.date);
        if (!result) {
          throw new Error('Error al agregar ingreso');
        }
        return result;
      } else {
        const result = handleAddExpense(data.description, data.category, data.amount, data.date);
        if (!result) {
          throw new Error('Error al agregar gasto');
        }
        return result;
      }
    } catch (error) {
      console.error('Error en handleImportTransaction:', error);
      throw error;
    }
  };

  // Handler para importación masiva (bulk)
  const handleBulkImportTransaction = async (transactions) => {
    try {
      console.log('🚀 Iniciando importación masiva:', transactions.length, 'transacciones');
      
      // Usar la función de bulk del hook
      const result = addBulkTransactions(transactions);
      
      console.log('✅ Resultado de importación masiva:', result);
      return result;
    } catch (error) {
      console.error('Error en handleBulkImportTransaction:', error);
      throw error;
    }
  };

  // Handler para limpiar todas las transacciones
  const handleClearAllTransactions = () => {
    openConfirm({
      title: 'Limpiar todas las transacciones',
      message: `\u00bfEst\u00e1s seguro de eliminar las ${incomes.length + expenses.length} transacciones? Esta acci\u00f3n no se puede deshacer.`,
      confirmLabel: 'S\u00ed, eliminar todo',
      onConfirm: () => {
        clearAll();
        closeConfirm();
      },
    });
  };

  // HOOK DE IA - Combinar todas las transacciones
  // TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  /*+
  const allTransactions = useMemo(() => {
    return [
      ...incomes.map(t => ({ ...t, type: 'income' })),
      ...expenses.map(t => ({ ...t, type: 'expense' }))
    ];
  }, [incomes, expenses]);
  */

  // TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  // const aiInsights = useAIInsights(allTransactions, user?.id);

  // ✅ PREPARAR DATOS MENSUALES PARA PREDICCIONES
  /* TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  const monthlyData = useMemo(() => {
    const months = {};
    
    [...incomes, ...expenses].forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income' || incomes.includes(transaction)) {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expense += transaction.amount;
      }
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [incomes, expenses]);
  */

  // Verificar si hay datos pendientes de migración
  useEffect(() => {
    if (user && hasPendingMigration()) {
      setShowMigration(true);
    }
  }, [user]);

  // Sincronizar estadísticas con el sistema de logros
  useEffect(() => {
    const goalsCompleted = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    achievements.updateStats({
      totalIncomes: incomes.length,
      totalExpenses: expenses.length,
      totalGoals: goals.length,
      goalsCompleted,
      currentBalance: balance,
      creditCardsAdded: creditCards.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes.length, expenses.length, goals.length, balance, creditCards.length]);

  // Mostrar página de autenticación si no hay usuario
  if (!user && !authLoading) {
    return <AuthPage />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 md:p-8">
      {/* Diálogo de migración */}
      {showMigration && (
        <MigrationDialog
          onClose={() => setShowMigration(false)}
          onComplete={(count) => {
            showAlert('success', `${count} transacciones migradas exitosamente`);
            setShowMigration(false);
            refreshTransactions();
          }}
        />
      )}

      {/* Alert global */}
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message}
          onClose={() => showAlert(null)}
        />
      )}

      {/* Modal de confirmación global */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={() => confirmDialog.onConfirm?.()}
        onCancel={closeConfirm}
      />

      {/* Notificaciones de logros */}
      <AchievementNotifications
        achievements={achievements.newAchievements}
        onRemove={(index) => achievements.removeNewAchievement(index)}
      />

      {/* Container principal */}
      <div className="max-w-7xl mx-auto">
        {/* Header con Profile Menu */}
        <header className="bg-gradient-dark dark:bg-gray-800 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex-1 text-center">
              <h1 className="text-4xl md:text-5xl font-light mb-3">
                Calculadora de Presupuesto Personal
              </h1>
              <p className="text-lg opacity-90">
                Gestiona tus finanzas personales de manera inteligente con IA
              </p>
            </div>
            <div className="ml-4 flex items-center gap-4">
              {/* Toggle Dark Mode */}
              <ThemeToggle />
              
              {/* ✅ ALERTAS DE IA */}
              {/* TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
              <AIAlerts
                alerts={aiInsights.alerts}
                loading={aiInsights.checkingAnomalies}
                onRefresh={aiInsights.checkAnomalies}
              />
              */}
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main content grid */}
        <div className="space-y-8">
          {/* Card de balance */}
          <BalanceCard
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
            creditCardDebt={creditCards.reduce((sum, card) => sum + card.debt, 0)}
          />

          {/* 🤖 ESTADO DE PROVEEDORES DE IA - MUESTRA GEMINI, GROQ, ETC */}
          <AIProviderStatus />

          {/* ✅ PANEL DE ANÁLISIS FINANCIERO CON IA */}
          <AIInsightsPanel
            analysis={aiInsights.analysis}
            loading={aiInsights.analyzing}
            error={aiInsights.analysisError}
            onAnalyze={() => aiInsights.runAnalysis({ totalIncome, totalExpenses, balance })}
          />

          {/* FORMULARIOS PARA AGREGAR TRANSACCIONES */}
          <TransactionForm
            onAddIncome={handleAddIncome}
            onAddExpense={handleAddExpense}
          />

          {/* LISTAS DE TRANSACCIONES - Justo después de agregar para ver resultados */}
          <TransactionList
            incomes={incomes}
            expenses={expenses}
            onRemoveIncome={(id) => openConfirm({
              title: 'Eliminar ingreso',
              message: '\u00bfEst\u00e1s seguro de que deseas eliminar este ingreso?',
              onConfirm: () => { removeIncome(id); closeConfirm(); },
            })}
            onRemoveExpense={(id) => openConfirm({
              title: 'Eliminar gasto',
              message: '\u00bfEst\u00e1s seguro de que deseas eliminar este gasto?',
              onConfirm: () => { removeExpense(id); closeConfirm(); },
            })}
            onUpdateIncome={updateIncome}
            onUpdateExpense={updateExpense}
          />

          {/* BOTÓN PARA LIMPIAR TODAS LAS TRANSACCIONES */}
          {(incomes.length > 0 || expenses.length > 0) && (
            <div className="flex justify-center">
              <button
                onClick={handleClearAllTransactions}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg 
                  shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 
                  transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                🧹 Limpiar Todas las Transacciones ({incomes.length + expenses.length})
              </button>
            </div>
          )}

          {/* GESTOR DE TARJETAS DE CRÉDITO */}
          <CreditCardManager
            creditCards={creditCards}
            onAddCard={handleAddCard}
            onUpdateDebt={handleUpdateDebt}
            onRemoveCard={handleRemoveCard}
          />

          {/* 🎯 GESTOR DE METAS FINANCIERAS */}
          <GoalManager
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateProgress={handleUpdateGoalProgress}
            onDeleteGoal={handleDeleteGoal}
            currentBalance={balance}
          />

          {/* Sección de Gráficos Avanzados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Dona - Balance General */}
            <BalanceDonutChart
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />

            {/* Gráfico de Categorías Original (mejorado) */}
            <CategoryChart categoryAnalysis={categoryAnalysis} />
          </div>

          {/* Gráfico de Tendencias - Ancho completo */}
          <TrendLineChart
            incomes={incomes}
            expenses={expenses}
          />

          {/* ✅ GRÁFICO DE PREDICCIONES CON IA */}
          {/* TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
          {monthlyData.length >= 2 && (
            <PredictiveChart
              predictions={aiInsights.predictions}
              loading={aiInsights.predicting}
              error={aiInsights.predictionsError}
              onPredict={() => aiInsights.predictExpenses(monthlyData)}
              historicalData={monthlyData}
            />
          )}
          */}

          {/* Gráficos de Barras y Comparativa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 5 Categorías de Gasto */}
            <CategoryBarChart
              categoryAnalysis={categoryAnalysis}
              topN={5}
            />

            {/* Comparativa Mensual */}
            <ComparativeChart
              incomes={incomes}
              expenses={expenses}
            />
          </div>

          {/* Flujo de Caja Mensual - ancho completo */}
          <MonthlyCashFlowChart
            incomes={incomes}
            expenses={expenses}
            months={6}
          />

          {/* Día de la semana + Top Comercios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SpendingByDayChart expenses={expenses} />
            <TopMerchantsChart expenses={expenses} topN={8} />
          </div>

          {/* DASHBOARD DE GAMIFICACIÓN - Al final como recompensa */}
          <GamificationDashboard
            currentLevel={achievements.currentLevel}
            totalPoints={achievements.totalPoints}
            pointsForNext={achievements.pointsForNext}
            levelProgress={achievements.levelProgress}
            currentStreak={achievements.stats.currentStreak}
            longestStreak={achievements.stats.longestStreak}
            unlockedAchievements={achievements.unlockedAchievements}
            isAchievementUnlocked={achievements.isAchievementUnlocked}
          />

          {/* 📥 EXPORTADOR E IMPORTADOR DE DATOS */}
          <ExportManager
            incomes={incomes}
            expenses={expenses}
            categoryAnalysis={categoryAnalysis}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
          />

          {/* 📤 IMPORTADOR CSV - Carga masiva de transacciones */}
          <ImportManager 
            onImport={handleImportTransaction}
            onBulkImport={handleBulkImportTransaction}
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-white/80 text-sm">
          <p>
            © 2025 Budget Calculator | Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/in/jorge-luis-risso-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              R P
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * App wrapper con AuthProvider y ThemeProvider
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
