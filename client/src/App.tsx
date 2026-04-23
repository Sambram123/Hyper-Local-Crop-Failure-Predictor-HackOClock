import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import HeroSection from './components/Hero/HeroSection';
import InputWizard from './components/InputWizard/InputWizard';
import RiskDashboard from './components/RiskDashboard/RiskDashboard';
import RecommendationsPanel from './components/RecommendationsPanel/RecommendationsPanel';
import LoadingScreen from './components/LoadingScreen';
import './index.css';

// ============================================================
// Page transition variants
// ============================================================

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

// ============================================================
// Inner App (has access to context)
// ============================================================

function AppContent() {
  const { state } = useApp();
  const { currentView } = state;

  // Prevent body scroll on hero (Three.js handles scroll)
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => { document.body.style.overscrollBehavior = 'auto'; };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {currentView === 'hero' && (
        <motion.div
          key="hero"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <HeroSection />
        </motion.div>
      )}

      {currentView === 'input' && (
        <motion.div
          key="input"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <InputWizard />
        </motion.div>
      )}

      {currentView === 'loading' && (
        <motion.div
          key="loading"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <LoadingScreen />
        </motion.div>
      )}

      {currentView === 'dashboard' && (
        <motion.div
          key="dashboard"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <RiskDashboard />
        </motion.div>
      )}

      {currentView === 'recommendations' && (
        <motion.div
          key="recommendations"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <RecommendationsPanel />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Root App with providers
// ============================================================

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
