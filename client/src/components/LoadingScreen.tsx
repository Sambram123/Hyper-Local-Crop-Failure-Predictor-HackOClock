import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const LOADING_MESSAGES = [
  'Fetching satellite imagery...',
  'Processing NDVI data...',
  'Analyzing weather patterns...',
  'Calculating risk scores...',
  'Generating recommendations...',
];

export default function LoadingScreen() {
  const { state } = useApp();

  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
      padding: '2rem',
      textAlign: 'center',
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '2rem' }}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#22c55e',
            borderRightColor: '#22c55e40',
          }}
        />
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '12px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#38bdf8',
            borderLeftColor: '#38bdf840',
          }}
        />
        {/* Inner icon */}
        <div style={{
          position: 'absolute',
          inset: '28px',
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
        }}>
          🛰️
        </div>
      </div>

      <motion.h2
        className="heading-section"
        style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Analyzing Your Crop
      </motion.h2>

      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        {state.district?.name} · {state.crop?.name.en}
      </p>

      {/* Animated steps */}
      <div style={{ width: '100%', maxWidth: '300px' }}>
        {LOADING_MESSAGES.map((msg, i) => (
          <motion.div
            key={msg}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.4 + 0.2 }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', textAlign: 'left' }}>{msg}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: '200px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', marginTop: '1.5rem', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #22c55e, #38bdf8)', borderRadius: '99px' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
