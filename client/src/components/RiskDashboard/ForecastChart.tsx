import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ForecastChartProps } from '../../types';

// ============================================================
// Custom Tooltip
// ============================================================

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,20,10,0.95)',
      border: '1px solid rgba(34,197,94,0.25)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
            {entry.name}:
          </span>
          <span style={{ fontWeight: 700, color: 'white', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
            {Math.round(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Forecast Chart
// ============================================================

export default function ForecastChart({ data, height = 220 }: ForecastChartProps) {
  const formatted = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    drought: Math.round(d.droughtRisk),
    pest: Math.round(d.pestRisk),
    nutrient: Math.round(d.nutrientRisk),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'Outfit, sans-serif', paddingTop: '1rem' }}
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="drought"
          name="Drought Risk"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#f97316', strokeWidth: 0 }}
          animationDuration={1500}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey="pest"
          name="Pest Risk"
          stroke="#a78bfa"
          strokeWidth={2.5}
          dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }}
          animationDuration={1500}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey="nutrient"
          name="Nutrient Risk"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
