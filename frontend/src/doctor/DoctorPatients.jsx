import { useEffect, useState } from "react";
import axios from "axios";
import "./doctor.css";
import "../patient/patient.css";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [openPatient, setOpenPatient] = useState(null);
  const [search, setSearch] = useState("");

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [recordPatientId, setRecordPatientId] = useState(null);

  const [form, setForm] = useState({
    notes: "",
    prescriptions: "",
    bp: "",
    pulse: "",
    temp: ""
  });

  const token = localStorage.getItem("meditrack_token");

  /* ---------------- LOAD PATIENTS ---------------- */
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

  /* ---------------- LOAD RECORDS ---------------- */
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

  /* ---------------- OPEN ADD RECORD ---------------- */
  function openAddRecord(patientId) {
    setIsEdit(false);
    setEditingId(null);
    setRecordPatientId(patientId);

    setForm({
      notes: "",
      prescriptions: "",
      bp: "",
      pulse: "",
      temp: ""
    });

    setShowModal(true);
  }

  /* ---------------- OPEN EDIT RECORD ---------------- */
  function openEditRecord(rec, patientId) {
    setIsEdit(true);
    setEditingId(rec._id);
    setRecordPatientId(patientId);

    setForm({
      notes: rec.notes || "",
      prescriptions: rec.prescriptions?.join(", ") || "",
      bp: rec.vitals?.bp || "",
      pulse: rec.vitals?.pulse || "",
      temp: rec.vitals?.temp || ""
    });

    setShowModal(true);
  }

  /* ---------------- SAVE RECORD ---------------- */
  async function saveRecord(e) {
    e.preventDefault();

    const data = {
      patientId: recordPatientId,
      notes: form.notes,
      prescriptions: form.prescriptions.split(",").map(p => p.trim()),
      vitals: {
        bp: form.bp,
        pulse: form.pulse,
        temp: form.temp
      }
    };

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:5000/api/records/${editingId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/records`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowModal(false);
      loadPatientRecords(recordPatientId);

    } catch (err) {
      console.error(err);
      alert("Failed to save record.");
    }
  }

  /* ---------------- DELETE RECORD ---------------- */
  async function deleteRecord(id, patientId) {
    if (!confirm("Delete this record?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/records/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadPatientRecords(patientId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
    }
  }

  /* ---------------- TOGGLE PATIENT BLOCK ---------------- */
  function togglePatient(p) {
    if (openPatient === p._id) {
      setOpenPatient(null);
      setRecords([]);
    } else {
      setOpenPatient(p._id);
      loadPatientRecords(p._id);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  /* ---------------- SEARCH ---------------- */
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <h1>My Patients</h1>

      <input
        placeholder="Search patient..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="patients-list">
        {filtered.map((p) => (
          <div key={p._id} className="patient-card">

            {/* PATIENT HEADER */}
            <div className="patient-header">
              <div>
                <h3>{p.name}</h3>
                <p><b>Email:</b> {p.email}</p>
              </div>
            </div>

            {/* ADD RECORD */}
            <button
              className="add-record-btn"
              onClick={() => openAddRecord(p._id)}
            >
              + Add Record
            </button>

            {/* TOGGLE BUTTON */}
            <button
              className="details-btn"
              onClick={() => togglePatient(p)}
            >
              {openPatient === p._id ? "Hide Records" : "Show Records"}
            </button>

            {/* RECORD LIST */}
            {openPatient === p._id && (
              <div className="records-list">

                {records.length === 0 && (
                  <p className="empty">No Records</p>
                )}

                {records.map((rec) => (
                  <div key={rec._id} className="record-card">

                    <h3>Doctor Notes</h3>
                    <p><b>Description:</b> {rec.notes}</p>

                    <div className="vitals-grid">
                      <p>BP: {rec.vitals?.bp}</p>
                      <p>Pulse: {rec.vitals?.pulse}</p>
                      <p>Temp: {rec.vitals?.temp}</p>
                    </div>

                    <p><b>Date:</b> {new Date(rec.createdAt).toLocaleString()}</p>

                    {/* ACTIONS */}
                    <div className="record-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditRecord(rec, p._id)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteRecord(rec._id, p._id)}
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box large">

            <h2>{isEdit ? "Edit Record" : "Add Record"}</h2>

            <form onSubmit={saveRecord}>
              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                required
              />

              <label>Prescriptions (comma separated)</label>
              <input
                value={form.prescriptions}
                onChange={(e) =>
                  setForm({ ...form, prescriptions: e.target.value })
                }
              />

              <div className="vitals-grid">
                <input
                  placeholder="BP"
                  value={form.bp}
                  onChange={(e) => setForm({ ...form, bp: e.target.value })}
                />
                <input
                  placeholder="Pulse"
                  value={form.pulse}
                  onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                />
                <input
                  placeholder="Temp"
                  value={form.temp}
                  onChange={(e) => setForm({ ...form, temp: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  {isEdit ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
