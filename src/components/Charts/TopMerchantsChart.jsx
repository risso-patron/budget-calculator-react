import PropTypes from 'prop-types';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { transformToTopMerchants } from '../../utils/chartHelpers';
import { formatCurrency } from '../../utils/formatters';

const MERCHANT_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#ffecd2', '#a18cd1', '#fda085',
];

const MerchantTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm max-w-xs">
      <p
        className="font-bold text-gray-800 dark:text-white mb-1 truncate"
        title={d.nombre}
      >
        {d.nombre}
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        Total: <span className="font-semibold text-purple-500">{formatCurrency(d.monto)}</span>
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
        {d.count} transaccion{d.count !== 1 ? 'es' : ''} · prom. {formatCurrency(d.monto / d.count)}
      </p>
    </div>
  );
};

/**
 * Top comercios / descripciones por gasto total — barras horizontales
 */
export const TopMerchantsChart = ({ expenses, topN = 8 }) => {
  const data = transformToTopMerchants(expenses, topN);
  const isEmpty = !expenses || expenses.length === 0;

  // Truncar nombres largos para el eje Y
  const truncate = (str, max = 20) =>
    str && str.length > max ? `${str.slice(0, max)}…` : str;

  const displayData = data.map(d => ({ ...d, nombreCorto: truncate(d.nombre) }));

  return (
    <ChartContainer
      title={`Top ${topN} Comercios / Descripciones`}
      icon="🏪"
      isEmpty={isEmpty}
      emptyMessage="Agrega gastos para ver los principales comercios"
      height="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nombreCorto"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip content={<MerchantTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar dataKey="monto" name="Total gastado" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {displayData.map((_, index) => (
              <Cell key={index} fill={MERCHANT_COLORS[index % MERCHANT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

TopMerchantsChart.propTypes = {
  expenses: PropTypes.array.isRequired,
  topN:     PropTypes.number,
};
