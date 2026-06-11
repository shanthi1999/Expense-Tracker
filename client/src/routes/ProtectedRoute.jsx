import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/common/LoadingSpinner';

/** Redirects unauthenticated users to login; preserves intended destination. */
export function ProtectedRoute() {
    const { isAuthenticated, status } = useAuth();
    const location = useLocation();

    if (status === 'loading' && !isAuthenticated) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

/** Redirects authenticated users away from auth pages. */
export function GuestRoute() {
    const { isAuthenticated, status } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    if (status === 'loading') {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    return <Outlet />;
}
