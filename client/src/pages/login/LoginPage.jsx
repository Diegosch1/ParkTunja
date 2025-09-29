import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import InputComponent from "../../components/input/InputComponent";
import ButtonComponent from "../../components/button/ButtonComponent";
import logo from "../../assets/parktunja_logo.png";
import logoNegative from "../../assets/parktunja_logo_negative.png";
import "./LoginPage.css";


const LoginPage = () => {

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signIn, isAuthenticated, errors: authErrors } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit((data) => {
    signIn(data);
  });

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
        {
          authErrors.map((error, i) => (
            <p key={i} className='error-text'>
              {error}
            </p>
          ))
        }
        <form onSubmit={onSubmit}>
          <div>
            <InputComponent
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="Ingresa tu correo"
              register={register}
              required={true}
            />
            {errors.email && (
              <p className='error-text'>El correo electrónico es requerido</p>
            )}
          </div>
          <div>
            <InputComponent
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              register={register}
              required={true}
            />
            {errors.password && (
              <p className='error-text'>La contraseña es requerida</p>
            )}
          </div>
          <ButtonComponent text="Ingresar" type="primary" htmlType="submit" />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
