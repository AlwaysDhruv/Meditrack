import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "../patient/patient.css";   // uses SAME UI
import "./doctor.css";            // enhances doctor-specific look

export default function DoctorLayout() {

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("meditrack_user");
    window.location.href = "/login";
  }

  return (
    <div className="doctor-layout">

      {/* SIDEBAR */}
      <div className="doctor-sidebar">

        <h2 className="doctor-logo">MediTrack</h2>

        {/* MENU ITEMS */}
        <Link to="/doctor/dashboard" className="doctor-link">
          🏥 Dashboard
        </Link>

        <Link to="/doctor/appointments" className="doctor-link">
          📅 Appointments
        </Link>

        <Link to="/doctor/patients" className="doctor-link">
          🧑‍⚕️ Patients
        </Link>
        
        <div className="doctor-divider"></div>

        <Link to="/doctor/mail" className="doctor-link blue">
          📧 Mail
        </Link>

        {/* LOGOUT */}
        <div className="doctor-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

      </div>

      {/* PAGE CONTENT */}
      <div className="doctor-content">
        <Outlet />
      </div>

    </div>
  );
}
