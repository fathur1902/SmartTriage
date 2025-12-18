// src/pages/dokter/KonsultasiDokter.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ChatBubble from "../../components/ChatBubble";

const KonsultasiDokter = () => {
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId");
  const [patientName, setPatientName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!consultationId) return;
    const fetchConsultation = async () => {
      const token = localStorage.getItem("dokterToken");
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/dokter/konsultasi?consultationId=${consultationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) {
          setPatientName(data.data.patientName);
          setMessages([{ text: data.data.initialMessage, isUser: true }]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [consultationId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem("dokterToken");
    await fetch(`${import.meta.env.VITE_BASE_URL}/api/dokter/konsultasi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ consultationId, message: input }),
    });
    setMessages((prev) => [...prev, { text: input, isUser: false }]);
    setInput("");
  };

  const saveDiagnosis = async () => {
    const token = localStorage.getItem("dokterToken");
    await fetch(`${import.meta.env.VITE_BASE_URL}/api/dokter/konsultasi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ consultationId, diagnosis }),
    });
    alert("Diagnosis tersimpan!");
  };

  if (loading)
    return <div className="p-8 text-center">Memuat konsultasi...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 ml-7 p-20">
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Konsultasi dengan {patientName}
            </h2>
            <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-white">
              {messages.map((m, i) => (
                <ChatBubble key={i} message={m.text} isUser={m.isUser} />
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex space-x-4 mb-4"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Balas pasien..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <Button type="submit" variant="primary">
                Kirim
              </Button>
            </form>
            <div className="space-y-4">
              <h3 className="font-semibold">Diagnosis Awal & Saran</h3>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Masukkan diagnosis dan saran..."
                className="w-full h-24 px-3 py-2 border rounded-md"
              />
              <Button onClick={saveDiagnosis} variant="primary">
                Simpan Diagnosis
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default KonsultasiDokter;
