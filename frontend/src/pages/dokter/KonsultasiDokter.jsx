import { useState } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import ChatBubble from "../../components/ChatBubble";
import Card from "../../components/Card";
import Button from "../../components/Button";

const KonsultasiDokter = () => {
  const [messages, setMessages] = useState([
    {
      text: "Halo, saya John Doe. Saya mengalami demam dan batuk.",
      isUser: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: false }]);
      setInput("");
    }
  };

  const handleSaveDiagnosis = () => {
    console.log("Diagnosis saved:", diagnosis);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1  ml-7 p-20">
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Konsultasi dengan John Doe
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
            <form onSubmit={handleSendMessage} className="flex space-x-4 mb-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Balas pasien..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500"
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
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
              />
              <Button onClick={handleSaveDiagnosis} variant="primary">
                Simpan Diagnosis
              </Button>
            </div>
          </Card>
        </main>
      </div>
      i
    </div>
  );
};

export default KonsultasiDokter;
