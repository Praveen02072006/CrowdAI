import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import VehicleDetail from './pages/VehicleDetail';
import RouteDetail from './pages/RouteDetail';
import Recommendations from './pages/Recommendations';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import SimulatorPage from './pages/SimulatorPage';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminAI from './pages/AdminAI';
import PrivacyPage from './pages/PrivacyPage';
import TechnologyPage from './pages/TechnologyPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading CrowdSense AI...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/technology" element={<TechnologyPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Passenger */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/vehicle/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
          <Route path="/route/:id" element={<ProtectedRoute><RouteDetail /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Simulator - accessible to all authenticated + public for demo */}
          <Route path="/simulator" element={<SimulatorPage />} />

          {/* Operator */}
          <Route path="/operator" element={<ProtectedRoute roles={['OPERATOR', 'ADMIN']}><OperatorDashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/ai" element={<ProtectedRoute roles={['ADMIN']}><AdminAI /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
