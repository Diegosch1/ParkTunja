import React from 'react'
import "./ResponsiveNavComponent.css"
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router';
import logo from '../../assets/parktunja_logo.png';

const ResponsiveNavComponent = () => {
    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();


    return (
        <div className='responsive-nav-container'>
            <img src={logo} alt="Parktunja logo" className='logo' />

            <div className="links-container">
                <div
                    className={`link-container ${location.pathname === "/dashboard" ? "active" : ""}`}
                    onClick={() => navigate("/dashboard")}
                >
                    <p>Dashboard</p>
                </div>
                {user.role === "admin" && (
                    <div
                        className={`link-container ${location.pathname === "/admin-panel" ? "active" : ""}`}
                        onClick={() => navigate("/admin-panel")}
                    >
                        <p>Usuarios</p>
                    </div>
                )}
                <div
                    className={`link-container ${location.pathname === "/reports" ? "active" : ""}`}
                    onClick={() => navigate("/reports")}
                >
                    <p>Reportes</p>
                </div>

            </div>
        </div>
    )
}

export default ResponsiveNavComponent