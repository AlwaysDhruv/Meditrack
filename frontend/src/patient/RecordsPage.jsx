import { useEffect, useState } from "react"
import API from "../api"
import "./patient.css"

export default function RecordsPage() {
  const [records, setRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    notes: "",
    prescriptions: "",
    bp: "",
    pulse: "",
    temp: ""
  })

  useEffect(() => {
    loadRecords()
  }, [])

  function loadRecords() {
    const user = JSON.parse(localStorage.getItem("meditrack_user"))
    API.get(`/records/patient/${user.id}`).then(res => setRecords(res.data.records))
  }

  /* ------------------ OPEN MODAL ------------------ */
  function openCreate() {
    setIsEdit(false)
    setEditingId(null)
    setForm({ notes: "", prescriptions: "", bp: "", pulse: "", temp: "" })
    setShowModal(true)
  }

  function openEdit(rec) {
    setIsEdit(true)
    setEditingId(rec._id)

    setForm({
      notes: rec.notes || "",
      prescriptions: rec.prescriptions?.join(", ") || "",
      bp: rec.vitals?.bp || "",
      pulse: rec.vitals?.pulse || "",
      temp: rec.vitals?.temp || ""
    })

    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  /* ------------------ SAVE RECORD ------------------ */
  async function saveRecord(e) {
    e.preventDefault()

    const user = JSON.parse(localStorage.getItem("meditrack_user"))

    const body = {
      patientId: user.id,
      notes: form.notes,
      prescriptions: form.prescriptions.split(",").map(i => i.trim()),
      vitals: { bp: form.bp, pulse: form.pulse, temp: form.temp }
    }

    if (isEdit) {
      await API.put(`/records/${editingId}`, body)
      alert("Record updated successfully!")
    } else {
      await API.post(`/records`, body)
      alert("Record added successfully!")
    }

    closeModal()
    loadRecords()
  }

  /* ------------------ DELETE RECORD ------------------ */
  async function deleteRecord(id) {
    if (!confirm("Are you sure you want to delete this record?")) return

    await API.delete(`/records/${id}`)
    loadRecords()
    alert("Record deleted.")
  }

  return (
    <div className="page">

      <div className="page-header">
        <h1>Health Records</h1>
        <button className="book-btn" onClick={openCreate}>
          + Add New Record
        </button>
      </div>

      <div className="records-list">
        {records.map(rec => (
          <div className="record-card" key={rec._id}>

            <div className="record-header">
              <h3>Record • {new Date(rec.createdAt).toLocaleDateString()}</h3>

              <div className="record-actions">
                <button className="edit-btn" onClick={() => openEdit(rec)}>Edit</button>
                <button className="delete-btn" onClick={() => deleteRecord(rec._id)}>Delete</button>
              </div>
            </div>

            <p><strong>Doctor:</strong> {rec.doctor ? rec.doctor.name : "Self / Patient"}</p>
            {rec.notes && <p><strong>Notes:</strong> {rec.notes}</p>}
            {rec.prescriptions?.length > 0 && (
              <p><strong>Prescriptions:</strong> {rec.prescriptions.join(", ")}</p>
            )}

            {rec.vitals && (
              <div className="vitals-box">
                {rec.vitals.bp && <p>BP: {rec.vitals.bp}</p>}
                {rec.vitals.pulse && <p>Pulse: {rec.vitals.pulse}</p>}
                {rec.vitals.temp && <p>Temp: {rec.vitals.temp}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ------ Modal for Add/Edit ------ */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box large">

            <h2>{isEdit ? "Edit Record" : "Add Health Record"}</h2>

            <form onSubmit={saveRecord}>

              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                required
              />

              <label>Prescriptions (comma separated)</label>
              <input
                value={form.prescriptions}
                onChange={e => setForm({ ...form, prescriptions: e.target.value })}
              />

              <label>Vitals</label>
              <div className="vitals-grid">
                <input
                  placeholder="BP"
                  value={form.bp}
                  onChange={e => setForm({ ...form, bp: e.target.value })}
                />
                <input
                  placeholder="Pulse"
                  value={form.pulse}
                  onChange={e => setForm({ ...form, pulse: e.target.value })}
                />
                <input
                  placeholder="Temp"
                  value={form.temp}
                  onChange={e => setForm({ ...form, temp: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn">
                  {isEdit ? "Update" : "Save Record"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
