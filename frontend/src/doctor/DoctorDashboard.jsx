import { useEffect, useState } from "react";
import axios from "axios";
import "./doctor.css";

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    pendingRequests: 0,
    upcoming: []
  });

  const token = localStorage.getItem("meditrack_token");

  // Load dashboard data
  async function loadDashboard() {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard data.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="doctor-dashboard">

      <h1 className="doc-title">Welcome, Doctor 👨‍⚕️</h1>
      <p className="doc-subtitle">Your daily overview and schedule insights.</p>

      {/* STATS */}
      <div className="doc-stats-row">

        <div className="doc-stat-card">
          <h3>{stats.todaysAppointments}</h3>
          <p>Today's Appointments</p>
        </div>

        <div className="doc-stat-card">
          <h3>{stats.totalPatients}</h3>
          <p>Total Patients</p>
        </div>

        <div className="doc-stat-card">
          <h3>{stats.pendingRequests}</h3>
          <p>Pending Requests</p>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="doc-section">
        <h2 className="doc-section-title">Quick Actions</h2>

        <div className="doc-actions-row">

          <a href="/doctor/appointments" className="doc-action-card">
            <div className="icon">📅</div>
            <h3>Manage Appointments</h3>
            <p>Accept or reject patient requests</p>
          </a>

          <a href="/doctor/patients" className="doc-action-card">
            <div className="icon">🧑‍⚕️</div>
            <h3>View Patient Records</h3>
            <p>Check medical history and reports</p>
          </a>

          <a href="/doctor/messages" className="doc-action-card">
            <div className="icon">💬</div>
            <h3>Messages</h3>
            <p>Chat or reply to patient queries</p>
          </a>

        </div>
      </div>

      {/* UPCOMING LIST */}
      <div className="doc-section">
        <h2 className="doc-section-title">Upcoming Appointments</h2>

        <div className="doc-list-card">
          {stats.upcoming.length === 0 && <p>No upcoming appointments.</p>}

          {stats.upcoming.map((u) => (
            <p key={u._id}>
              • {new Date(u.date).toLocaleString()} – {u.patient?.name}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
}
