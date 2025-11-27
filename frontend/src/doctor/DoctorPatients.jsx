import { useEffect, useState } from "react";
import axios from "axios";
import "./doctor.css";
import "../patient/patient.css";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [openPatient, setOpenPatient] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("meditrack_token");

  /* ============================================================
     LOAD ALL PATIENTS WHO HAVE VISITED THIS DOCTOR
  ============================================================ */
  async function loadPatients() {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/doctor/patient-records",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPatients(res.data.patients);
    } catch (err) {
      console.error(err);
      alert("Failed to load patients.");
    }
  }

  /* ============================================================
     LOAD RECORDS FOR ONE PATIENT
  ============================================================ */
  async function loadPatientRecords(patientId) {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/doctor/patient-records/${patientId}/records`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecords(res.data.records);
    } catch (err) {
      console.error(err);
      alert("Failed to load patient records.");
    }
  }

  /* ============================================================
     DOWNLOAD PDF
  ============================================================ */
  function downloadPDF(patientId, recordId) {
    const token = localStorage.getItem("meditrack_token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    const url = `http://localhost:5000/api/doctor/patient-records/${patientId}/record/${recordId}/pdf?token=${token}`;

    window.open(url, "_blank");
  }

  useEffect(() => {
    loadPatients();
  }, []);

  /* ============================================================
     SEARCH FILTER
  ============================================================ */
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <h1>My Patients</h1>
      <p>View patient details, medical history & download health records.</p>

      {/* SEARCH */}
      <input
        placeholder="Search patient..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="patients-list">

        {filtered.length === 0 && (
          <p className="empty">No patients found.</p>
        )}

        {filtered.map((p) => (
          <div key={p._id} className="patient-card">

            {/* HEADER */}
            <div className="patient-header">
              <div>
                <h3>{p.name}</h3>
                <p><b>Email:</b> {p.email}</p>
                <p><b>Joined:</b> {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>

              <button
                className="profile-btn"
                onClick={() => setProfileModal(p)}
              >
                View Profile
              </button>
            </div>

            {/* RECORDS TOGGLE */}
            <button
              className="details-btn"
              onClick={() => {
                if (openPatient === p._id) {
                  setOpenPatient(null);
                } else {
                  setOpenPatient(p._id);
                  loadPatientRecords(p._id);
                }
              }}
            >
              {openPatient === p._id ? "Hide Records" : "Show Records"}
            </button>

            {/* RECORDS LIST */}
            {openPatient === p._id && (
              <div className="records-list" style={{ marginTop: "15px" }}>
                <h4>Health Records</h4>

                {records.length === 0 && <p className="empty">No health records.</p>}

                {records.map((rec) => (
                  <div key={rec._id} className="record-card">
                    <h3>Doctor Notes</h3>

                    {/* DESCRIPTION / NOTES */}
                    <p><b>Description:</b> {rec.notes || "No notes available"}</p>

                    {/* VITALS */}
                    <div className="vitals-box">
                      <div className="vitals-grid">
                        <p>BP: {rec.vitals?.bp || "N/A"}</p>
                        <p>Pulse: {rec.vitals?.pulse || "N/A"}</p>
                        <p>Temp: {rec.vitals?.temp || "N/A"}</p>
                      </div>
                    </div>

                    {/* DATE */}
                    <p style={{ marginTop: "10px" }}>
                      <b>Date:</b> {new Date(rec.createdAt).toLocaleString()}
                    </p>

                    {/* PDF BUTTON */}
                    <button
                      className="pdf-btn"
                      onClick={() => downloadPDF(p._id, rec._id)}
                    >
                      📄 Download PDF
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* PROFILE MODAL */}
      {profileModal && (
        <div className="modal-overlay">
          <div className="profile-modal">

            <h2>{profileModal.name}</h2>
            <p><b>Email:</b> {profileModal.email}</p>
            <p><b>Joined:</b> {new Date(profileModal.createdAt).toLocaleString()}</p>

            <button
              className="close-profile"
              onClick={() => setProfileModal(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
