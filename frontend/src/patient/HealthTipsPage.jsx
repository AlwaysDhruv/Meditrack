import { useEffect, useState } from "react";
import API from "../api";
import "./patient.css";

export default function RecordsPage() {
  const [records, setRecords] = useState([]);

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // AI modal
  const [aiModal, setAiModal] = useState(false);
  const [aiResult, setAiResult] = useState("Analyzing...");

  // Chat modal
  const [chatModal, setChatModal] = useState(false);
  const [chatRecord, setChatRecord] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [form, setForm] = useState({
    notes: "",
    prescriptions: "",
    bp: "",
    pulse: "",
    temp: ""
  });

  // Get logged in user
  const user = JSON.parse(localStorage.getItem("meditrack_user"));
  const isPatient = user.role === "patient";

  useEffect(() => {
    loadRecords();
  }, []);

  function loadRecords() {
    API.get(`/records/patient/${user.id}`).then(res =>
      setRecords(res.data.records)
    );
  }

  /* ---------------------------------------------------------
      FORMAT AI OUTPUT
  --------------------------------------------------------- */
  function formatAIText(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");
    let html = "";
    let inList = false;

    lines.forEach(line => {
      if (/^\d+\./.test(line)) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<h3 class="chat-heading">${line}</h3>`;
      } else if (line.startsWith("-") || line.startsWith("•")) {
        if (!inList) {
          html += "<ul class='chat-list'>";
          inList = true;
        }
        html += `<li>${line.replace(/^[-•]\s*/, "")}</li>`;
      } else if (/warning|caution|safety/i.test(line)) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<p class="chat-warning">${line}</p>`;
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<p>${line}</p>`;
      }
    });

    if (inList) html += "</ul>";
    return html;
  }

  /* ---------------------------------------------------------
      ANALYZE RECORD (Ask AI)
  --------------------------------------------------------- */
  async function analyzeRecord(rec) {
    setAiModal(true);
    setAiResult("Analyzing with AI...");

    try {
      const res = await API.post("/record/analyze", { record: rec });
      setAiResult(res.data.analysis);
    } catch (err) {
      console.error(err);
      setAiResult("AI analysis failed.");
    }
  }

  /* ---------------------------------------------------------
      CHAT ABOUT RECORD — Send Message
  --------------------------------------------------------- */
  async function sendChatMessage() {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    try {
      const res = await API.post("/record/analyze", {
        record: chatRecord,
        question: userMsg
      });

      const formatted = formatAIText(res.data.analysis);

      setChatMessages(prev => [...prev, { sender: "ai", html: formatted }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        { sender: "ai", text: "AI is unavailable." }
      ]);
    }
  }

  /* ---------------------------------------------------------
      ADD / EDIT RECORD (ONLY DOCTOR)
  --------------------------------------------------------- */
  function openCreate() {
    if (isPatient) return;  // block patient
    setIsEdit(false);
    setEditingId(null);
    setForm({ notes: "", prescriptions: "", bp: "", pulse: "", temp: "" });
    setShowModal(true);
  }

  function openEdit(rec) {
    if (isPatient) return; // block patient
    setIsEdit(true);
    setEditingId(rec._id);
    setForm({
      notes: rec.notes,
      prescriptions: rec.prescriptions?.join(", ") || "",
      bp: rec.vitals?.bp || "",
      pulse: rec.vitals?.pulse || "",
      temp: rec.vitals?.temp || ""
    });
    setShowModal(true);
  }

  async function deleteRecord(id) {
    if (isPatient) return; // block patient
    if (!confirm("Delete this record?")) return;
    await API.delete(`/records/${id}`);
    loadRecords();
  }

  async function saveRecord(e) {
    e.preventDefault();
    if (isPatient) return; // block patient

    const data = {
      patientId: user.id,
      notes: form.notes,
      prescriptions: form.prescriptions.split(",").map(p => p.trim()),
      vitals: {
        bp: form.bp,
        pulse: form.pulse,
        temp: form.temp
      }
    };

    if (isEdit) {
      await API.put(`/records/${editingId}`, data);
    } else {
      await API.post(`/records`, data);
    }

    setShowModal(false);
    loadRecords();
  }

  return (
    <div className="page">

      <div className="page-header">
        <h1>Health Records</h1>

        {!isPatient && (
          <button className="book-btn" onClick={openCreate}>
            + Add Record
          </button>
        )}
      </div>

      {/* RECORDS LIST */}
      <div className="records-list">
        {records.map(rec => (
          <div className="record-card" key={rec._id}>

            <div className="record-header">
              <h3>{new Date(rec.createdAt).toLocaleDateString()}</h3>

              <div className="record-actions">
                <button className="ai-btn" onClick={() => analyzeRecord(rec)}>
                  Ask AI
                </button>

                <button
                  className="chat-btn"
                  onClick={() => {
                    setChatRecord(rec);
                    setChatMessages([
                      { sender: "ai", text: "Ask me anything about this record!" }
                    ]);
                    setChatModal(true);
                  }}
                >
                  Chat
                </button>

                {!isPatient && (
                  <>
                    <button className="edit-btn" onClick={() => openEdit(rec)}>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={() => deleteRecord(rec._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <p><strong>Doctor:</strong> {rec.doctor ? rec.doctor.name : "Self"}</p>
            <p><strong>Notes:</strong> {rec.notes}</p>

            {rec.prescriptions?.length > 0 && (
              <p><strong>Prescriptions:</strong> {rec.prescriptions.join(", ")}</p>
            )}

            <div className="vitals-box">
              {rec.vitals?.bp && <p>BP: {rec.vitals.bp}</p>}
              {rec.vitals?.pulse && <p>Pulse: {rec.vitals.pulse}</p>}
              {rec.vitals?.temp && <p>Temp: {rec.vitals.temp}</p>}
            </div>

          </div>
        ))}
      </div>

      {/* ----------------------- AI RESULT MODAL ----------------------- */}
      {aiModal && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h2>AI Analysis</h2>

            <div
              className="ai-output"
              dangerouslySetInnerHTML={{ __html: formatAIText(aiResult) }}
            ></div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setAiModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------- CHAT MODAL ----------------------- */}
      {chatModal && (
        <div className="modal-overlay">
          <div className="chat-modal">

            <div className="chat-header">
              <h2>Chat About This Record</h2>
              <button className="close-btn" onClick={() => setChatModal(false)}>✖</button>
            </div>

            <div className="chat-body">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender}`}>
                  {msg.html ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Ask something about this record..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button className="send-btn" onClick={sendChatMessage}>Send</button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------- ADD/EDIT MODAL ----------------------- */}
      {showModal && !isPatient && (
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
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  {isEdit ? "Update" : "Save Record"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
