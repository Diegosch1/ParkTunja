import { BrowserRouter, Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/login/LoginPage";

const App = () => {
  return (
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
      </Routes>
    </BrowserRouter>
  );
}

export default App
