import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; 
import { signOut } from "firebase/auth";
import "./navbar.css";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // logout user
      navigate("/login");   // redirect ไปหน้า login
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          DASHBOARD
        </Link>
        <Link
          to="/management"
          className={location.pathname === "/management" ? "active" : ""}
        >
          MANAGEMENT
        </Link>
        <Link
          to="/history"
          className={location.pathname === "/history" ? "active" : ""}
        >
          HISTORY
        </Link>
        <Link
          to="/setting"
          className={location.pathname === "/setting" ? "active" : ""}
        >
          SETTING
        </Link>
        <Link
          to="/chart"
          className={location.pathname === "/chart" ? "active" : ""}
        >
          CHART
        </Link>
        <Link
          to="/add_admin"
          className={location.pathname === "/add_admin" ? "active" : ""}
        >
          ADMIN
        </Link>
      </div>
      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          LOG OUT
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
