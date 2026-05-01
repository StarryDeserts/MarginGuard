import { AnimatePresence } from 'motion/react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { PageTransition } from './components/motion/PageTransition'
import { Dashboard } from './routes/Dashboard'
import { Demo } from './routes/Demo'
import { Landing } from './routes/Landing'
import { RescueSimulator } from './routes/RescueSimulator'
import { Settings } from './routes/Settings'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/rescue"
          element={
            <PageTransition>
              <RescueSimulator />
            </PageTransition>
          }
        />
        <Route
          path="/demo"
          element={
            <PageTransition>
              <Demo />
            </PageTransition>
          }
        />
        <Route
          path="/settings"
          element={
            <PageTransition>
              <Settings />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
