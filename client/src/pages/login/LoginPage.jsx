import React from "react";
import InputComponent from "../../components/input/InputComponent";
import ButtonComponent from "../../components/button/ButtonComponent";
import logo from "../../assets/parktunja_logo.png";
import logoNegative from "../../assets/parktunja_logo_negative.png";
import "./LoginPage.css";
import { useNavigate } from "react-router";


const LoginPage = () => {

  const navigate = useNavigate();

  return (
    <div className="login-page">
      <picture className="logo-login" onClick={() => navigate("/")}>
        <source srcSet={logo} media="(max-width: 768px)" />
        <img
          src={logoNegative}
          alt="Parktunja logo"
        />
      </picture>
      <div className="login-image"></div>
      <div className="login-form">
        <h2>Iniciar sesión</h2>
        <form>
          <InputComponent
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="Ingresa tu correo"
          />
          <InputComponent
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
          />
          <ButtonComponent text="Ingresar" type="primary" />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
