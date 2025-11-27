import { useEffect, useState } from "react";
import API from "../api";
import "./patient.css";

export default function MailDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMail(e) {
    e.preventDefault();

    if (!doctorId) {
      alert("Select a doctor to send mail.");
      return;
    }

    try {
      await API.post("/mail/send", {
        doctorId,
        subject,
        message
      });

      alert("Mail sent to doctor successfully!");

      setDoctorId("");
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

        <h1>Mail Doctor</h1>
        <p className="subtitle">Send a secure message to your doctor</p>

        <form onSubmit={sendMail}>

          <label>Select Doctor</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
          >
            <option value="">-- Choose Doctor --</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.name} ({doc.specialization || "General"})
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

          <button type="submit" className="send-btn-mail">Send Mail</button>

        </form>
      </div>
    </div>
  );
}
