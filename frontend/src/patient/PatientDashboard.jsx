import { useEffect, useState } from "react"
import API from "../api"
import "./patient.css"

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("meditrack_user"))
    setUser(u)

    loadAppointments(u.id)
    loadRecords(u.id)
  }, [])

  function loadAppointments(id) {
    API.get("/appointments")
      .then(res => {
        const filtered = res.data.appointments.filter(a => a.patient._id === id)
        setAppointments(filtered)
      })
  }

  function loadRecords(id) {
    API.get(`/records/patient/${id}`)
      .then(res => setRecords(res.data.records))
  }

  return (
    <div className="dashboard-page">

      <h1 className="dash-title">Welcome, {user?.name}</h1>
      <p className="dash-subtitle">Your health at a glance</p>

      {/* TOP STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>{appointments.length}</h3>
          <p>Upcoming Appointments</p>
        </div>

        <div className="stat-card">
          <h3>{records.length}</h3>
          <p>Health Records</p>
        </div>

        <div className="stat-card">
          <h3>AI Assistant</h3>
          <p>Health Tips & Chat</p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="actions-row">

          <a href="/patient/appointments" className="action-card">
            <div className="icon">📅</div>
            <h3>Book Appointment</h3>
            <p>Find doctors & schedule visits</p>
          </a>

          <a href="/patient/records" className="action-card">
            <div className="icon">📄</div>
            <h3>Your Records</h3>
            <p>View & manage health records</p>
          </a>

          <a href="/patient/ai-tips" className="action-card">
            <div className="icon">🤖</div>
            <h3>AI Health Chat</h3>
            <p>Get AI-powered guidance</p>
          </a>

        </div>
      </div>

      {/* UPCOMING APPOINTMENTS */}
      <div className="section-block">
        <h2>Upcoming Appointments</h2>

        {appointments.length === 0 && (
          <p className="empty">No upcoming appointments</p>
        )}

        {appointments.map(app => (
          <div className="list-card" key={app._id}>
            <h3>{new Date(app.date).toLocaleString()}</h3>
            <p><strong>Doctor:</strong> {app.doctor?.name}</p>
            <p><strong>Status:</strong> {app.status}</p>
          </div>
        ))}
      </div>

      {/* RECENT RECORDS */}
      <div className="section-block">
        <h2>Recent Health Records</h2>

        {records.length === 0 && (
          <p className="empty">No records added yet</p>
        )}

        {records.slice(0, 3).map(r => (
          <div className="list-card" key={r._id}>
            <h3>{new Date(r.createdAt).toLocaleDateString()}</h3>
            <p><strong>Notes:</strong> {r.notes}</p>
          </div>
        ))}

        <a href="/patient/records" className="view-more">View All Records →</a>
      </div>

    </div>
  )
}
