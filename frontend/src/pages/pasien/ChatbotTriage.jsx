import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import ChatBubble from "../../components/ChatBubble";
import Card from "../../components/Card";
import Button from "../../components/Button";

const ChatbotTriage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showTriageResult, setShowTriageResult] = useState(false);
  const [triageResult, setTriageResult] = useState("");
  const [popupTitle, setPopupTitle] = useState("Hasil Triase Anda");

  useEffect(() => {
    // Pesan awal
    setMessages([
      {
        text: "Halo! Saya SmartTriage chatbot. Ceritakan gejala Anda untuk triase awal.",
        isUser: false,
      },
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    const currentInput = input;
    setInput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/chatbot/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
          },
          body: JSON.stringify({ message: currentInput }),
        }
      );

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();
      const reply = data.reply || "Maaf, tidak ada respons dari server.";
      const intent = data.intent || "";

      // Tampilkan balasan bot di chat
      setMessages((prev) => [...prev, { text: reply, isUser: false }]);

      // ============================================================
      // LOGIKA POPUP HASIL
      // ============================================================

      // KONDISI 1: Triase Selesai (Sukses)
      if (intent.trim() === "Duration Input") {
        // Cek apakah ini Emergency (Ada kata Peringatan)
        if (reply.includes("PERINGATAN KEAMANAN")) {
          setPopupTitle("BAHAYA / EMERGENCY");
        } else {
          setPopupTitle("Hasil Triase Anda");
        }
        setTriageResult(reply);
        setShowTriageResult(true);
      }

      // KONDISI 2: Fallback Limit Tercapai (Gagal 3x)
      else if (
        intent.trim() === "Default Fallback Intent" &&
        reply.includes("segera hubungi dokter")
      ) {
        setPopupTitle("Mohon Maaf");
        setTriageResult(reply);
        setShowTriageResult(true);
      }
    } catch (error) {
      console.error("💥 Error from chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Terjadi kesalahan koneksi, coba lagi nanti.", isUser: false },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Chatbot Triage Otomatis
            </h2>
            <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-white">
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  message={msg.text}
                  isUser={msg.isUser}
                />
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik gejala Anda..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500"
              />
              <Button type="submit" variant="primary">
                Kirim
              </Button>
            </form>
          </Card>

          {/* 🧠 POPUP HASIL TRIASE / PERINGATAN */}
          {showTriageResult && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-[450px] text-center">
                {/* Judul Dinamis (Merah jika Bahaya) */}
                <h3
                  className={`text-xl font-bold mb-4 ${
                    popupTitle === "BAHAYA / EMERGENCY" ||
                    popupTitle === "Mohon Maaf"
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {popupTitle}
                </h3>

                <p className="text-gray-600 mb-6 whitespace-pre-line text-left bg-gray-50 p-4 rounded-lg">
                  {triageResult.replace(/\*\*/g, "")}{" "}
                  {/* Hapus formatting bold markdown */}
                </p>

                <div className="flex justify-center space-x-4">
                  {/* LOGIKA SAFETY TOMBOL:
                    Hanya tampilkan tombol "Konsultasi" jika TIDAK ada peringatan keamanan.
                  */}
                  {!triageResult.includes("PERINGATAN KEAMANAN") &&
                    !triageResult.includes("kesulitan memahami") && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowTriageResult(false);
                          window.location.href = "/consultation"; // Lanjut ke dokter
                        }}
                      >
                        Konsultasi ke Dokter
                      </Button>
                    )}

                  {/* Tombol Tutup selalu ada */}
                  <Button
                    variant="secondary"
                    onClick={() => setShowTriageResult(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatbotTriage;
