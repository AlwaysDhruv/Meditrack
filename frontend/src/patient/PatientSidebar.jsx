import { Link } from "react-router-dom";
import "./patient.css";

export default function PatientLayout({ children }) {

  function handleLogout() {
    localStorage.removeItem("meditrack_token")
    localStorage.removeItem("meditrack_user")
    localStorage.removeItem("reset_email")
  
    sessionStorage.clear()
    localStorage.clear()
  
    window.location.href = "/login"
  }

  return (
    <div className="patient-layout">

      {/* SIDEBAR */}
      <div className="sidebar">

        <h2 className="side-logo">MediTrack</h2>

        <Link to="/patient/dashboard" className="side-link">🏠 Dashboard</Link>
        <Link to="/patient/appointments" className="side-link">📅 Appointments</Link>
        <Link to="/patient/records" className="side-link">📄 Health Records</Link>
        <Link to="/patient/ai-tips" className="side-link">🤖 AI Health Tips</Link>

        <div className="side-divider"></div>

        {/* NEW BUTTONS */}
        <Link to="/patient/chat-doctor" className="side-link green">
          💬 Chat AI
        </Link>

        <Link to="/patient/mail-doctor" className="side-link blue">
          📨 Mail Doctor
        </Link>

        {/* LOGOUT SECTION */}
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="patient-content">{children}</div>

    </div>
  );
}
