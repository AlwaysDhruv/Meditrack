import { useState, useRef, useEffect } from "react";
import API from "../api";
import "./patient.css";

export default function ChatDoctor() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I can help you communicate with your doctor regarding symptoms, appointments, prescriptions, and your medical concerns."
    }
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = input;

    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    try {
      const res = await API.post("/chat-doctor", { message: userMsg });

      setMessages(prev => [
        ...prev,
        { sender: "ai", text: res.data.reply }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "AI is unavailable at the moment." }
      ]);
    }
  }

  return (
    <div className="chat-container">

      {/* HEADER */}
      <div className="chat-header">
        <h3>Doctor(AI) Messaging</h3>
        <p>Your medical assistant</p>
      </div>

      {/* CHAT BODY */}
      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT AREA */}
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="send-btn" onClick={sendMessage}>⮞</button>
      </div>

    </div>
  );
}
