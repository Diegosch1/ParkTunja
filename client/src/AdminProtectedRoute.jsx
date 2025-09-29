import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from 'react-router';
import LoadingPage from './pages/loading/LoadingPage';

const AdminProtectedRoute = () => {
    const { isAuthenticated, isAdminUser, isLoading, isAdminUserLoading } = useAuth();

    if (isLoading || isAdminUserLoading) return <LoadingPage />;

    if (!isAuthenticated || !isAdminUser) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default AdminProtectedRoute;