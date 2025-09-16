import React from "react";
import landingPageBg from "../../assets/landing_page_background.jpeg";
import HeaderComponent from "../../components/header/HeaderComponent";
import ButtonComponent from "../../components/button/ButtonComponent";
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
                        <img src="https://picsum.photos/200/150" alt="service card images" />
                        <div className="service-info">
                            <h4>Gestión de parqueaderos</h4>
                            <small>Registra, edita y administra la información de tus estacionamientos.</small>
                        </div>
                    </div>
                    <div className="service-card">
                        <img src="https://picsum.photos/200/150" alt="service card images" />
                        <div className="service-info">
                            <h4>Control de accesos</h4>
                            <small>Registra entradas y salidas, y visualiza espacios en tiempo real.</small>
                        </div>
                    </div>
                    <div className="service-card">
                        <img src="https://picsum.photos/200/150" alt="service card images" />
                        <div className="service-info">
                            <h4>Horarios y tarifas</h4>
                            <small>Configura franjas de apertura y precios personalizados.</small>
                        </div>
                    </div>
                    <div className="service-card">
                        <img src="https://picsum.photos/200/150" alt="service card images" />
                        <div className="service-info">
                            <h4>Usuarios y roles</h4>
                            <small>Crea y gestiona controladores con permisos específicos.</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section id="contact" className="section contact">
                <div className="section-content">
                    <h2>Contáctanos</h2>
                    <p>
                        Estamos listos para ayudarte en la gestión de tus estacionamientos.
                    </p>
                    <ButtonComponent text="Enviar mensaje" type="primary" />
                </div>
                <div className="section-image">
                    <img src="/assets/contact-image.png" alt="Contacto" />
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2025 ParkTunja. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
