import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";
import "../patient/patient.css";

export default function MailPatient() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("meditrack_token");

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor/patient-records", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPatients(res.data.patients);

    } catch (err) {
      console.error(err);
      alert("Failed to load patients");
    }
  }

  async function sendMail(e) {
    e.preventDefault();

    if (!patientId) {
      alert("Select a patient to send mail.");
      return;
    }

    try {
      await API.post("/doctor/mail/send", {
        patientId,
        subject,
        message
      });

      alert("Mail sent to patient successfully!");

      setPatientId("");
      setSubject("");
      setMessage("");

    } catch (err) {
      console.error(err);
      alert("Failed to send mail.");
    }
  }

  return (
    <div className="mail-page">
      <div className="mail-box">

        <h1>Mail Patient</h1>
        <p className="subtitle">Send a secure message to your patient</p>

        <form onSubmit={sendMail}>

          <label>Select Patient</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">-- Choose Patient --</option>

            {patients.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.email})
              </option>
            ))}

          </select>

          <label>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Enter mail subject"
            required
          />

          <label>Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message here..."
            required
          ></textarea>

          <button type="submit" className="send-btn-mail">
            Send Mail
          </button>

        </form>
      </div>
    </div>
  );
}
