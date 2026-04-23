import { motion } from 'framer-motion';
import type { ChannelBarProps } from '../../types';

const LEVEL_CONFIG = {
  low: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.25)', label: 'LOW' },
  moderate: { color: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.25)', label: 'MODERATE' },
  high: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', label: 'HIGH' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', label: 'CRITICAL' },
};

export default function ChannelBar({ label, value, level, icon, animate = true }: ChannelBarProps) {
  const cfg = LEVEL_CONFIG[level];

  return (
    <div style={{
      padding: '1rem',
      borderRadius: '0.875rem',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: cfg.color,
            fontFamily: 'Outfit, sans-serif',
          }}>
            {cfg.label}
          </span>
          <span style={{ fontWeight: 800, color: cfg.color, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
            {Math.round(value)}
          </span>
        </div>
      </div>

      {/* Progress bar track */}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          style={{
            background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
          }}
        />
      </div>
    </div>
  );
}
