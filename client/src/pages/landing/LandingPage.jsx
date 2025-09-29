import React from "react";
import HeaderComponent from "../../components/header/HeaderComponent";
import ButtonComponent from "../../components/button/ButtonComponent";
import imagoLogo from "../../assets/parktunja_imagologo.png";
import carConnection from "../../assets/icon_car_connection.png";
import parkedCar from "../../assets/icon_parked_car.png";
import scheduleCar from "../../assets/icon_schedule_car.png";
import userManagement from "../../assets/icon_user_management.png";
import disponibilityImage from "../../assets/disponibility_section_image.png";
import { FaInstagram, FaLinkedin } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";

import "./LandingPage.css";

const LandingPage = () => {
    return (
        <div>
            <HeaderComponent />

            {/* Hero */}
            <section id="hero" className="main-section">
                <div className="section-image"></div>
                <div className="section-content">
                    <h1>Control en tiempo real para tus estacionamientos</h1>
                    <p>Una plataforma integral para administradores y controladores de
                        parqueaderos
                    </p>
                </div>
            </section>

            {/* Servicios */}
            <section id="services" className="section-services">
                <h2>Nuestros servicios</h2>
                <div className="services-content">
                    <div className="service-card">
                        <img src={parkedCar} alt="service-card images" />
                        <div className="service-info">
                            <h4>Gestión de parqueaderos</h4>
                            <small>Registra, edita y administra la información de tus estacionamientos.</small>
                        </div>
                    </div>
                    <div className="service-card">
                        <img src={carConnection} alt="service card images" />
                        <div className="service-info">
                            <h4>Control de accesos</h4>
                            <small>Registra entradas y salidas, y visualiza espacios en tiempo real.</small>
                        </div>
                    </div>
                    <div className="service-card">
                        <img src={scheduleCar} alt="service card images" />
                        <div className="service-info">
                            <h4>Horarios y tarifas</h4>
                            <small>Configura franjas de apertura y precios personalizados.</small>
                        </div>
                    </div>
                    <div className="service-card">
                        <img src={userManagement} alt="service card images" />
                        <div className="service-info">
                            <h4>Usuarios y roles</h4>
                            <small>Crea y gestiona controladores con permisos específicos.</small>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section-disponibility">
                <h2>Disponibilidad en tiempo real</h2>
                <img src={disponibilityImage} alt="disponibility image" />
            </section>

            {/* Contacto */}
            <section id="contact" className="section-contact">
                <div className="section-image">
                    <img src={imagoLogo} alt="Contacto" />
                </div>
                <div className="contact-content">
                    <h4>Contáctanos</h4>
                    <p>Estamos listos para ayudarte en la gestión de tus estacionamientos.</p>
                </div>
                <div className="social-links">
                    <a href="https://www.instagram.com/parktunja/" target="_blank" rel="noopener noreferrer">
                        <FaInstagram size={30}/>
                    </a>
                    <a href="https://www.facebook.com/parktunja/" target="_blank" rel="noopener noreferrer">
                        <FaFacebookSquare size={30}/>
                    </a>
                    <a href="https://www.linkedin.com/in/parktunja/" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin size={30}/>
                    </a>

                </div>
            </section>

            <footer className="footer">
                <p>© 2025 ParkTunja. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
