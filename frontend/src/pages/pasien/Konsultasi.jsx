import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import ChatBubble from "../../components/ChatBubble";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const Konsultasi = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil riwayat konsultasi saat komponen dimuat
    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const recent = data.data
            .filter((item) => item.type === "Text")
            .slice(-2); // Ambil 2 terakhir
          setMessages(
            recent.map((item) => ({
              text: item.summary,
              isUser: item.doctor === null, // Asumsi jika doctor null, pesan dari pasien
            }))
          );
        }
      })
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessage = { text: input, isUser: true };
      setMessages([...messages, newMessage]);
      fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/consultation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
        },
        body: JSON.stringify({ message: input }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                {
                  text: "Terima kasih atas penjelasannya. Saya sarankan istirahat dan minum obat.",
                  isUser: false,
                },
              ]);
            }, 1000);
          }
        })
        .catch((error) => console.error("Error sending message:", error));
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Konsultasi dengan Dr. Anna Doe
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
                placeholder="Ketik pesan Anda..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500"
              />
              <Button type="submit" variant="primary">
                Kirim
              </Button>
            </form>
            <Button
              className="mt-4"
              onClick={() => alert("Video call dimulai")}
              variant="secondary"
            >
              Mulai Video Call
            </Button>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Konsultasi;
