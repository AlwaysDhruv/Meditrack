import { useEffect, useState } from "react";
import axios from "axios";
import "../patient/patient.css";    // matching UI
import "./doctor.css";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("meditrack_token");
  const user = JSON.parse(localStorage.getItem("meditrack_user"));

  // Protect page if no doctor user
  if (!token || !user || user.role !== "doctor") {
    window.location.href = "/login";
  }

  // Fetch appointments
  const loadAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(res.data.appointments);
    } catch (err) {
      console.error("Doctor appointment fetch failed", err);
      alert("Failed to load appointments.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Update appointment status
  const updateStatus = async (id, status) => {
    try {
      await axios.post(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadAppointments(); // refresh
    } catch (err) {
      console.error("Status update failed", err);
      alert("Could not update appointment status.");
    }
  };

  if (loading) {
    return <p className="loading-text">Loading appointments...</p>;
  }

  return (
    <div className="page">
      <h1 className="page-title">Appointments</h1>
      <p className="page-subtitle">
        Review, accept, reject or mark completed your patient appointment requests.
      </p>

      <div className="appointment-list">
        {appointments.length === 0 && (
          <p className="empty">No appointments found.</p>
        )}

        {appointments.map((a) => (
          <div key={a._id} className="appointment-card doctor-appt-card">

            {/* APPOINTMENT HEADER */}
            <div className="record-header">
              <h3>Patient: {a.patient?.name}</h3>
              <p className={`status ${a.status}`}>{a.status}</p>
            </div>

            {/* DETAILS */}
            <p><b>Email:</b> {a.patient?.email}</p>
            <p><b>Date:</b> {new Date(a.date).toLocaleString()}</p>
            <p><b>Reason:</b> {a.reason}</p>

            {/* ACTION BUTTONS */}
            <div className="record-actions" style={{ marginTop: "12px" }}>

              {a.status === "requested" && (
                <>
                  <button
                    className="edit-btn"
                    onClick={() => updateStatus(a._id, "accepted")}
                  >
                    ✓ Accept
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => updateStatus(a._id, "rejected")}
                  >
                    ✕ Reject
                  </button>
                </>
              )}

              {a.status === "accepted" && (
                <button
                  className="complete-btn"
                  onClick={() => updateStatus(a._id, "completed")}
                >
                  ✔ Mark Completed
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
