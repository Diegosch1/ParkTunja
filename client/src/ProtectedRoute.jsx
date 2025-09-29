import { useAuth } from './context/AuthContext'
import { Navigate, Outlet } from 'react-router';
import LoadingPage from './pages/loading/LoadingPage';

const ProtectedRoute = () => {

    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingPage />;

    if (!isAuthenticated) return <Navigate to={"/"} replace />
    return (
        <Outlet />
    )
}

export default ProtectedRoute