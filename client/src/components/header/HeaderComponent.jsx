import React from "react";
import "./HeaderComponent.css";
import logo from "../../assets/parktunja_logo.png"; 
import { useLocation, useNavigate } from "react-router";

const HeaderComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header-logo">
                <img src={logo} alt="Logo" />
            </div>
            <nav className="header-nav">
                <a href="#about">Sobre nosotros</a>
                <a href="#services">Servicios</a>
                <a href="#contact">Contacto</a>
                <a onClick={() => navigate("/login")} className="login-link">Ingreso</a>
            </nav>
        </header>
    );
};

export default HeaderComponent;
