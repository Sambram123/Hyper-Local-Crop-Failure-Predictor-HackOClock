import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ScoreGauge from './ScoreGauge';
import ChannelBar from './ChannelBar';
import ForecastChart from './ForecastChart';

export default function RiskDashboard() {
  const { state, goToRecommendations, goToInput, resetForm } = useApp();
  const { analysisResult, district, crop, stage } = state;

  if (!analysisResult) return null;

  const { riskScores, weather, ndvi, forecast7Day } = analysisResult;
  const compositeScore = riskScores.composite.score;
  const compositeLevel = riskScores.composite.level;

  // Weather summary quick stats
  const weatherStats = [
    { label: 'Max Temp', value: `${weather.current.temperature.max}°C`, icon: '🌡️', color: '#f97316' },
    { label: 'Humidity', value: `${weather.current.humidity.value}%`, icon: '💧', color: '#38bdf8' },
    { label: 'Rainfall', value: `${weather.current.precipitation.value}mm`, icon: '🌧️', color: '#818cf8' },
    { label: 'Wind', value: `${weather.current.windSpeed.value}km/h`, icon: '🌬️', color: '#94a3b8' },
  ];

  return (
    <div style={{
      minHeight: '100svh',
      background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
      padding: '0 0 6rem',
    }}>
      {/* Top nav bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(2,10,2,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => { resetForm(); goToInput(); }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0',
          }}
        >
          ← New Analysis
        </button>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#4ade80', fontSize: '0.95rem' }}>
          FasalRakshak
        </div>
        <button
          id="go-to-recommendations-btn"
          onClick={goToRecommendations}
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '0.5rem',
            color: '#4ade80',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          💡 Advice →
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Context badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>📍 {district?.name}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{crop?.icon} {crop?.name.en}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{stage?.icon} {stage?.name.en}</span>
        </motion.div>

        {/* === COMPOSITE SCORE CARD === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass"
          style={{ padding: '2rem', marginBottom: '1.25rem', textAlign: 'center' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '1.5rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Composite Risk Score
          </h2>

          <ScoreGauge
            score={compositeScore}
            size="lg"
            animated
            showLabel
            level={compositeLevel}
          />

          <p style={{ marginTop: '1.25rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {compositeLevel === 'healthy' && '✅ Your crop is in good health. Continue current practices.'}
            {compositeLevel === 'at-risk' && '⚠️ Moderate risk detected. Preventive action recommended.'}
            {compositeLevel === 'critical' && '🚨 High risk! Immediate action required to protect your crop.'}
          </p>

          {/* NDVI Badge */}
          {ndvi && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.625rem',
              marginTop: '1rem',
              background: ndvi.status === 'healthy' ? 'rgba(34,197,94,0.1)' : ndvi.status === 'stressed' ? 'rgba(250,204,21,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${ndvi.status === 'healthy' ? 'rgba(34,197,94,0.25)' : ndvi.status === 'stressed' ? 'rgba(250,204,21,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>🛰️ NDVI</span>
              <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'white' }}>
                {ndvi.value.toFixed(2)}
              </span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: ndvi.anomaly < 0 ? '#ef4444' : '#4ade80',
              }}>
                {ndvi.anomaly < 0 ? '↓' : '↑'} {Math.abs(ndvi.anomaly).toFixed(2)}
              </span>
              <span style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                color: ndvi.status === 'healthy' ? '#4ade80' : ndvi.status === 'stressed' ? '#facc15' : '#ef4444',
              }}>
                {ndvi.status}
              </span>
            </div>
          )}
        </motion.div>

        {/* === RISK CHANNELS === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass"
          style={{ padding: '1.5rem', marginBottom: '1.25rem' }}
        >
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            Risk Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ChannelBar
              label="Drought Stress"
              value={riskScores.droughtStress.score}
              level={riskScores.droughtStress.level}
              icon="☀️"
            />
            <ChannelBar
              label="Pest Pressure"
              value={riskScores.pestPressure.score}
              level={riskScores.pestPressure.level}
              icon="🐛"
            />
            <ChannelBar
              label="Nutrient Deficiency"
              value={riskScores.nutrientDeficiency.score}
              level={riskScores.nutrientDeficiency.level}
              icon="🌱"
            />
          </div>
        </motion.div>

        {/* === WEATHER QUICK STATS === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}
        >
          {weatherStats.map(stat => (
            <div
              key={stat.label}
              className="glass"
              style={{ padding: '0.875rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
              <div style={{ fontWeight: 700, color: stat.color, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* === 7-DAY FORECAST === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass"
          style={{ padding: '1.5rem', marginBottom: '1.25rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              7-Day Risk Forecast
            </h3>
            {riskScores.composite.trend && (
              <span style={{
                fontSize: '0.75rem',
                color: riskScores.composite.trend === 'improving' ? '#4ade80' : riskScores.composite.trend === 'stable' ? '#facc15' : '#ef4444',
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
              }}>
                {riskScores.composite.trend === 'improving' ? '↗ Improving' : riskScores.composite.trend === 'stable' ? '→ Stable' : '↘ Declining'}
              </span>
            )}
          </div>
          <ForecastChart data={forecast7Day} height={200} />
        </motion.div>

        {/* === CTA === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: '0.875rem', flexDirection: 'column' }}
        >
          <button
            id="view-recommendations-btn"
            className="btn-primary animate-pulse-glow"
            onClick={goToRecommendations}
            style={{ width: '100%', fontSize: '1.05rem', padding: '1rem' }}
          >
            💡 View Smart Recommendations →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
