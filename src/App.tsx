import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import MainLayout from './layouts/MainLayout'
import MobileView from './pages/mobile/MobileView'
import DashboardView from './pages/dashboard/DashboardView'
import MapView from './pages/map/MapView'
import MinisterView from './pages/minister/MinisterView'

// Root component that handles auth check
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const { isLoggedIn, loading } = useAuth()

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--leaf-deep)] mx-auto mb-4"></div>
          <p className="text-[var(--bark-soft)] font-mono text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/mobile" element={<MobileView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/minister" element={<MinisterView />} />
        </Route>
      </Route>
      
      {/* Catch all - redirect to login or dashboard */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

export default App
