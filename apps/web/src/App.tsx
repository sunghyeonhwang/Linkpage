import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import LinksPage from './pages/dashboard/LinksPage';
import AppearancePage from './pages/dashboard/AppearancePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import PublicProfilePage from './pages/public/PublicProfilePage';
import LandingPage from './pages/public/LandingPage';
import NotFoundPage from './pages/public/NotFoundPage';
import AuthLayout from './components/templates/AuthLayout';
import DashboardLayout from './components/templates/DashboardLayout';
import { AuthGuard, GuestGuard } from './components/organisms/AuthGuard';
import Spinner from './components/atoms/Spinner';
import { useAuthStore } from './stores/authStore';

function LandingRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            background: '#1F2937',
            color: '#F9FAFB',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Auth */}
        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>
        </Route>

        {/* Dashboard */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/links" element={<LinksPage />} />
            <Route path="/dashboard/appearance" element={<AppearancePage />} />
            <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Public */}
        <Route path="/p/:slug" element={<PublicProfilePage />} />

        {/* Redirects */}
        <Route path="/" element={<LandingRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
