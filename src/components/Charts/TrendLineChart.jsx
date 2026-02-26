import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { transformToLineData, CustomTooltip, hasChartData } from '../../utils/chartHelpers';

const toISODate = (d) => d.toISOString().split('T')[0];
const daysAgo   = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toISODate(d); };

const PRESETS = [
  { label: '7d',  days: 7   },
  { label: '30d', days: 30  },
  { label: '90d', days: 90  },
  { label: '6m',  days: 180 },
  { label: '1a',  days: 365 },
];

/**
 * Gráfico de Líneas — Tendencia con selector de rango de fechas
 */
export const TrendLineChart = ({ incomes, expenses }) => {
  const [fromDate, setFromDate] = useState(() => daysAgo(30));
  const [toDate,   setToDate]   = useState(() => toISODate(new Date()));

  const data    = transformToLineData(incomes, expenses, fromDate, toDate);
  const isEmpty = !hasChartData(incomes, expenses);
  const noDataInRange = !isEmpty && data.every(d => d.ingresos === 0 && d.gastos === 0);

  // Densidad de ticks en XAxis según tamaño del rango
  const tickInterval = data.length <= 14 ? 0
    : data.length <= 60  ? Math.floor(data.length / 10)
    : Math.floor(data.length / 8);

  const applyPreset = (days) => {
    setToDate(toISODate(new Date()));
    setFromDate(daysAgo(days));
  };

  const today = toISODate(new Date());
  const activePreset = toDate === today
    ? PRESETS.find(p => fromDate === daysAgo(p.days))?.label
    : null;

  return (
    <ChartContainer
      title="Tendencia"
      icon="📈"
      isEmpty={isEmpty}
      emptyMessage="Agrega transacciones para ver la tendencia"
      height="h-auto"
    >
      {/* ── Controles de rango ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        {/* Presets rápidos */}
        <div className="flex gap-1">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activePreset === p.label
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Pickers personalizados */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500">Desde</span>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={e => setFromDate(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">Hasta</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={toISODate(new Date())}
            onChange={e => setToDate(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          />
        </div>
      </div>

      {/* ── Gráfico ── */}
      {noDataInRange ? (
        <div className="h-56 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-sm font-medium">Sin transacciones en este período</p>
          <p className="text-xs mt-1 text-gray-300 dark:text-gray-700">Prueba con un rango diferente</p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '12px' }}
                formatter={renderLegendText}
              />
              <Line
                type="monotone"
                dataKey="ingresosAcum"
                stroke="#00b894"
                strokeWidth={2.5}
                dot={data.length <= 60 ? { fill: '#00b894', r: 3 } : false}
                activeDot={{ r: 5 }}
                name="Ingresos"
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="gastosAcum"
                stroke="#ff7675"
                strokeWidth={2.5}
                dot={data.length <= 60 ? { fill: '#ff7675', r: 3 } : false}
                activeDot={{ r: 5 }}
                name="Gastos"
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartContainer>
  );
};

const renderLegendText = (value) => (
  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value} Acumulados</span>
);

TrendLineChart.propTypes = {
  incomes:  PropTypes.array.isRequired,
  expenses: PropTypes.array.isRequired,
};
