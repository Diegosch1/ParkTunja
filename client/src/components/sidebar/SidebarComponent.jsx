import "./SidebarComponent.css";
import { useAuth } from "../../context/AuthContext";
import { RiLogoutBoxFill } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import logo from "../../assets/parktunja_logo.png";
import { useLocation, useNavigate } from "react-router";

const SidebarComponent = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logOut();
    };

    return (
        <div className="sidebar-container">
            <nav className="nav-links">
                <div className="leftbar-logo" onClick={() => { navigate("/dashboard") }}>
                    <img src={logo} alt="Parktunja logo" />
                </div>

                <div
                    className={`sidebar-button ${location.pathname === "/dashboard" ? "active" : ""} first-element`}
                    onClick={() => navigate("/dashboard")}
                >
                    <IoHome size={"1.5rem"} />
                    <p>Dashboard</p>
                </div>

                {user.role === "admin" && (
                    <div
                        className={`sidebar-button ${location.pathname === "/admin-panel" ? "active" : ""}`}
                        onClick={() => navigate("/admin-panel")}
                    >
                        <FaUsersCog size={"1.5rem"} />
                        <p>Usuarios</p>
                    </div>
                )}

                <div
                    className={`sidebar-button ${location.pathname === "/reports" ? "active" : ""}`}
                    onClick={() => navigate("/reports")}
                >
                    <FaChartLine size={"1.5rem"} />
                    <p>Reportes</p>
                </div>
            </nav>
            <div className="sidebar-button log-out" onClick={() => handleLogout()}>
                <RiLogoutBoxFill size={"1.5rem"} />
                <p>Cerrar sesión</p>
            </div>
        </div>
    );
};

export default SidebarComponent;