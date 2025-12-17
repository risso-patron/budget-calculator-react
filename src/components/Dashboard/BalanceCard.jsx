import PropTypes from 'prop-types';
import { Card } from '../Shared/Card';
import { formatCurrency } from '../../utils/formatters';
import { MoneyRainWebP, HomerMoneyWebP, WebPWithGlow } from '../Shared/WebPAnimation';

/**
 * Componente BalanceCard - Muestra el balance con indicador visual
 */
export const BalanceCard = ({ totalIncome, totalExpenses, balance, creditCardDebt = 0 }) => {
  // Calcular gastos totales incluyendo deudas de tarjetas
  const totalExpensesWithDebt = totalExpenses + creditCardDebt;
  const realBalance = totalIncome - totalExpensesWithDebt;
  
  // Calcular porcentaje para la barra de progreso
  const percentage = totalIncome > 0 ? Math.max(0, (realBalance / totalIncome) * 100) : 0;
  const isPositive = realBalance >= 0;

  return (
    <Card className="bg-gradient-dark text-white col-span-full relative overflow-hidden">
      {/* Animación de fondo si balance muy positivo */}
      {realBalance > 1000 && (
        <div className="absolute top-4 right-4 opacity-30 pointer-events-none">
          <MoneyRainWebP size="xl" />
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        {realBalance > 500 ? (
          <span className="text-3xl">💰</span>
          // <WebPWithGlow src="/animations/Homer.webp" alt="Homer" size="sm" glowColor="yellow" />
        ) : realBalance > 0 ? (
          <span className="text-2xl">💰</span>
        ) : (
          <span className="text-2xl">😅</span>
        )}
        <h2 className="text-xl font-medium opacity-90">Resumen Financiero</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ingresos */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-transform hover:scale-105">
          <div className="text-sm opacity-80 mb-2">Total Ingresos</div>
          <div className="text-3xl font-bold">{formatCurrency(totalIncome)}</div>
        </div>

        {/* Total Gastos */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-transform hover:scale-105">
          <div className="text-sm opacity-80 mb-2">Total Gastos</div>
          <div className="text-3xl font-bold">{formatCurrency(totalExpensesWithDebt)}</div>
          {creditCardDebt > 0 && (
            <div className="text-xs opacity-70 mt-1">
              Gastos: {formatCurrency(totalExpenses)} + Tarjetas: {formatCurrency(creditCardDebt)}
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-transform hover:scale-105">
          <div className="text-sm opacity-80 mb-2">Balance</div>
          <div className={`text-3xl font-bold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {formatCurrency(realBalance)}
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-3 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isPositive ? 'bg-gradient-success' : 'bg-gradient-danger'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

BalanceCard.propTypes = {
  totalIncome: PropTypes.number.isRequired,
  totalExpenses: PropTypes.number.isRequired,
  balance: PropTypes.number.isRequired,
  creditCardDebt: PropTypes.number,
};
