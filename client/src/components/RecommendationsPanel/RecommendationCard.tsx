import type { RecommendationCardProps } from '../../types';

const TYPE_CONFIG = {
  irrigation: { icon: '💧', color: '#38bdf8', label: 'Irrigation' },
  fertilizer: { icon: '🌱', color: '#22c55e', label: 'Fertilizer' },
  pest_control: { icon: '🐛', color: '#a78bfa', label: 'Pest Control' },
  nutrient: { icon: '⚗️', color: '#facc15', label: 'Nutrients' },
  general: { icon: '📋', color: '#94a3b8', label: 'General' },
};

const PRIORITY_CONFIG = {
  high: { label: 'URGENT', className: 'badge-urgent' },
  medium: { label: 'SOON', className: 'badge-soon' },
  low: { label: 'LATER', className: 'badge-later' },
};

export default function RecommendationCard({ recommendation: rec, language }: RecommendationCardProps) {
  const typeCfg = TYPE_CONFIG[rec.type];
  const priorityCfg = PRIORITY_CONFIG[rec.priority];

  return (
    <div className="rec-card">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Type icon */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '0.75rem',
            background: `${typeCfg.color}18`,
            border: `1px solid ${typeCfg.color}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}>
            {typeCfg.icon}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: typeCfg.color, fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
              {typeCfg.label.toUpperCase()}
            </div>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'white', lineHeight: 1.3 }}>
              {rec.title[language]}
            </h4>
          </div>
        </div>

        {/* Priority badge */}
        <span className={`badge ${priorityCfg.className}`} style={{ flexShrink: 0 }}>
          {priorityCfg.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '0.875rem' }}>
        {rec.description[language]}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {rec.quantity && (
          <span style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.55)',
          }}>
            📦 {rec.quantity}
          </span>
        )}
        {rec.timing && (
          <span style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.55)',
          }}>
            ⏰ {rec.timing}
          </span>
        )}
        {rec.estimatedCost !== undefined && rec.estimatedCost > 0 && (
          <span style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '0.5rem',
            background: 'rgba(250,204,21,0.08)',
            border: '1px solid rgba(250,204,21,0.2)',
            fontSize: '0.78rem',
            color: '#fde047',
          }}>
            ₹{rec.estimatedCost} {rec.estimatedCostUnit}
          </span>
        )}
      </div>
    </div>
  );
}
