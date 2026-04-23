import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ScoreGaugeProps } from '../../types';

// ============================================================
// Circular SVG Score Gauge
// ============================================================

const GAUGE_RADIUS = 72;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const LEVEL_COLORS = {
  healthy: '#22c55e',
  'at-risk': '#f97316',
  critical: '#ef4444',
};

const LEVEL_LABELS = {
  healthy: 'HEALTHY',
  'at-risk': 'AT RISK',
  critical: 'CRITICAL',
};

const SIZE_MAP = {
  sm: { viewBox: 180, cx: 90, cy: 90, r: 56, strokeWidth: 8, fontSize: '1.25rem', subFontSize: '0.65rem' },
  md: { viewBox: 200, cx: 100, cy: 100, r: 72, strokeWidth: 10, fontSize: '2rem', subFontSize: '0.75rem' },
  lg: { viewBox: 240, cx: 120, cy: 120, r: 90, strokeWidth: 12, fontSize: '2.5rem', subFontSize: '0.85rem' },
};

export default function ScoreGauge({ score, size = 'md', animated = true, showLabel = true, level }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvedLevel = level ?? (score >= 70 ? 'critical' : score >= 40 ? 'at-risk' : 'healthy');
  const color = LEVEL_COLORS[resolvedLevel];
  const cfg = SIZE_MAP[size];

  // Circumference for this radius
  const r = cfg.r;
  const circumference = 2 * Math.PI * r;

  // Animate score counter
  useEffect(() => {
    if (!animated) { setDisplayScore(score); return; }
    setDisplayScore(0);
    let current = 0;
    const increment = score / 60;
    intervalRef.current = setInterval(() => {
      current = Math.min(current + increment, score);
      setDisplayScore(Math.round(current));
      if (current >= score) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 16);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [score, animated]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        width={cfg.viewBox}
        height={cfg.viewBox}
        viewBox={`0 0 ${cfg.viewBox} ${cfg.viewBox}`}
        style={{ overflow: 'visible' }}
      >
        {/* Definitions */}
        <defs>
          <linearGradient id={`gauge-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={cfg.strokeWidth}
          strokeLinecap="round"
        />

        {/* Background arc glow */}
        <circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={cfg.strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${cfg.cx} ${cfg.cy})`}
          opacity="0.15"
          style={{ transition: animated ? 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
        />

        {/* Main progress arc */}
        <circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={r}
          fill="none"
          stroke={`url(#gauge-grad-${size})`}
          strokeWidth={cfg.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${cfg.cx} ${cfg.cy})`}
          filter="url(#gauge-glow)"
          className="gauge-circle"
          style={{ transition: animated ? 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
        />

        {/* Score text */}
        <text x={cfg.cx} y={cfg.cy - 8} textAnchor="middle" dominantBaseline="middle"
          style={{ fill: 'white', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: cfg.fontSize }}>
          {displayScore}
        </text>
        <text x={cfg.cx} y={cfg.cy + 18} textAnchor="middle" dominantBaseline="middle"
          style={{ fill: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', fontSize: cfg.subFontSize }}>
          / 100
        </text>
      </svg>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: '0.375rem 1.25rem',
            borderRadius: '99px',
            background: `${color}20`,
            border: `1px solid ${color}40`,
            color: color,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.06em',
          }}
        >
          {LEVEL_LABELS[resolvedLevel]}
        </motion.div>
      )}
    </div>
  );
}
