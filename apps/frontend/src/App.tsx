import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NewWidget from './pages/NewWidget';
import WidgetDetail from './pages/WidgetDetail';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useUser();
  if (loading) return <div className="flex items-center justify-center h-screen text-sm text-gray-400">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.email !== (window as any).__SUPERADMIN_EMAIL__) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-subtle">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useUser();

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/widgets/new" element={<PrivateRoute><AppLayout><NewWidget /></AppLayout></PrivateRoute>} />
      <Route path="/widgets/:id" element={<PrivateRoute><AppLayout><WidgetDetail /></AppLayout></PrivateRoute>} />
      <Route path="/billing" element={<PrivateRoute><AppLayout><Billing /></AppLayout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute adminOnly><AppLayout><Admin /></AppLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
