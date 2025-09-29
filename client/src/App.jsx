import { BrowserRouter, Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/login/LoginPage";
import { AuthProvider } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext';
import { ParkingProvider } from './context/ParkingContext';
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <UsersProvider>
        <ParkingProvider>

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
            </Route>
          </Routes>
        </BrowserRouter>

        </ParkingProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App
