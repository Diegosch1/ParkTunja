import { BrowserRouter, Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/login/LoginPage";
import { AuthProvider } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext';
import { ParkingProvider } from './context/ParkingContext';
import { FlatRatesProvider } from './context/FlatRatesContext';
import { VehicleOpsProvider } from './context/VehicleOpsContext';
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from './AdminProtectedRoute';
import AdminPage from './pages/admin/AdminPage';
import ReportsPage from './pages/reports/ReportsPage';

const App = () => {
  return (
    <AuthProvider>
      <UsersProvider>
        <ParkingProvider>
          <FlatRatesProvider>
            <VehicleOpsProvider>

          <BrowserRouter>
            <ToastContainer
              position="bottom-right"
              autoClose={4000}
              className="toast-alert"
              closeButton={false}
              pauseOnHover={false}
            />
            <Routes>
              <Route path='/' element={<LandingPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path='/dashboard' element={<DashboardPage />} />
                <Route path='/reports' element={<ReportsPage />} />
                <Route element={<AdminProtectedRoute />}>
                  <Route path='/admin-panel' element={<AdminPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>

          </VehicleOpsProvider>
          </FlatRatesProvider>
        </ParkingProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App
