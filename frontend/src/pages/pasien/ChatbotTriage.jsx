import { useState } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import ChatBubble from "../../components/ChatBubble";
import Card from "../../components/Card";
import Button from "../../components/Button";

const ChatbotTriage = () => {
  const [messages, setMessages] = useState([
    {
      text: "Halo! Saya chatbot triage SmartTriage. Ceritakan gejala Anda untuk triase awal.",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      // Placeholder untuk respons AI
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Berdasarkan gejala Anda, ini adalah ringkasan: Tidak darurat, saran konsultasi online.",
            isUser: false,
          },
        ]);
      }, 1000);
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
        </main>
      </div>
    </div>
  );
};

export default ChatbotTriage;
