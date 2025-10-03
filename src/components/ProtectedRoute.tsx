import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authUtils, AuthState } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = authUtils.loadAuthState();
    setAuthState(auth);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse-glow">
          <div className="w-16 h-16 bg-primary rounded-full animate-bounce-light"></div>
        </div>
      </div>
    );
  }

  if (!authState?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && authState.user?.role !== requiredRole) {
    return <Navigate to={authState.user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;