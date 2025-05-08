// App.js
import React, { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [fileName, setFileName] = useState(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef(null);

  const BASE_URL = "https://document-voice-backend.onrender.com";

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${BASE_URL}/upload/`, formData);
      alert("✅ PDF uploaded.");
    } catch {
      alert("❌ Upload failed.");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const newChat = [...chat, { sender: "user", text: question }];
    setChat(newChat);
    setQuestion("");

    try {
      const res = await axios.post(`${BASE_URL}/ask/`, {
        question: question,
      });

      const answer = res.data.answer;
      setChat((prev) => [...prev, { sender: "ai", text: answer }]);

      const ttsForm = new FormData();
      ttsForm.append("question", answer);
      const ttsRes = await fetch(`${BASE_URL}/tts/`, {
        method: "POST",
        body: ttsForm,
      });

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error(err);
      alert("❌ Question failed.");
    }
  };

  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return alert("Browser doesn't support voice recognition.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => setQuestion(e.results[0][0].transcript || "");

    recognition.start();
  };

  return (
    <div className="screen-center">
      <div className="app">
        <header>
          <div className="logo-header">
            <img src="/logo.png" alt="App Logo" className="logo" />
            <h1>VocaLens</h1>
          </div>
          {fileName && <p className="filename">📄 {fileName}</p>}
        </header>

        <main>
          <div className="chat">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`bubble ${msg.sender === "user" ? "user" : "ai"}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-row">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question..."
            />
            <button onClick={handleAsk}>Send</button>
            <button onClick={handleVoice}>{listening ? "🎙️" : "🎤"}</button>
            <button onClick={() => fileInputRef.current.click()}>➕</button>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleUpload}
            />
          </div>
        </main>

        <footer>
          <p>We Techceed</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
