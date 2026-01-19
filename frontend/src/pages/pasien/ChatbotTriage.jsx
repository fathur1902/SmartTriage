import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import ChatBubble from "../../components/ChatBubble";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ChatbotTriage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showTriageResult, setShowTriageResult] = useState(false);
  const [triageResult, setTriageResult] = useState("");
  const [popupTitle, setPopupTitle] = useState("Hasil Triase Anda");
  const [isWaitingForDoctor, setIsWaitingForDoctor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const resetChatSession = () => {
    setMessages([
      {
        text: "Halo! Saya SmartTriage chatbot. Ceritakan gejala Anda untuk triase awal.",
        isUser: false,
      },
    ]);
    setInput("");
    setShowTriageResult(false);
  };

  useEffect(() => {
    let intervalId;

    if (isWaitingForDoctor) {
      Swal.fire({
        title: "Menunggu Dokter...",
        text: "Mohon tetap di halaman ini. Dokter sedang dikabari.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/pasien/check-active-consultation?t=${Date.now()}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
              },
            },
          );
          const data = await res.json();
          if (data && data.found === true) {
            clearInterval(intervalId);
            Swal.fire({
              title: "Dokter Telah Menerima!",
              text: `Dokter ${data.doctorName} siap berkonsultasi. Mulai sesi sekarang?`,
              icon: "success",
              showCancelButton: true,
              confirmButtonText: "Ya, Mulai Chat",
              cancelButtonText: "Nanti Saja",
              confirmButtonColor: "#0d9488",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/consultation");
              } else {
                setIsWaitingForDoctor(false);
              }
            });
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => {
      clearInterval(intervalId);
      if (isWaitingForDoctor) Swal.close();
    };
  }, [isWaitingForDoctor, navigate]);
  useEffect(() => {
    if (messages.length === 0) {
      resetChatSession();
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

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
        },
      );

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();
      const reply = data.reply || "Maaf, tidak ada respons dari server.";
      const intent = data.intent || "";

      setMessages((prev) => [...prev, { text: reply, isUser: false }]);

      if (intent.trim() === "Duration Input") {
        if (reply.includes("PERINGATAN KEAMANAN")) {
          setPopupTitle("BAHAYA / EMERGENCY");
        } else {
          setPopupTitle("Hasil Triase Anda");
        }
        setTriageResult(reply);
        setShowTriageResult(true);
      } else if (
        intent.trim() === "Default Fallback Intent" &&
        (reply.includes("segera hubungi dokter") ||
          reply.includes("kesulitan memahami"))
      ) {
        setPopupTitle("Pengalihan ke Dokter");
        setTriageResult(reply);
        setShowTriageResult(true);
      }
    } catch (error) {
      console.error("💥 Error from chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Terjadi kesalahan koneksi, coba lagi nanti.", isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />

        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <Card>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Chatbot Triage Otomatis
            </h2>

            <div className="h-[60vh] md:h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-white">
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  message={msg.text}
                  isUser={msg.isUser}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-gray-200 text-gray-500 px-4 py-3 rounded-lg rounded-tl-none text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex space-x-2 md:space-x-4"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik gejala Anda..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 text-sm md:text-base"
              />
              <Button
                type="submit"
                variant="primary"
                className={`whitespace-nowrap ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "..." : "Kirim"}
              </Button>
            </form>
          </Card>
          {showTriageResult && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-md text-center mx-auto">
                <h3
                  className={`text-lg md:text-xl font-bold mb-4 ${
                    popupTitle.includes("BAHAYA") || popupTitle.includes("Maaf")
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {popupTitle}
                </h3>

                <div className="text-gray-600 mb-6 text-left bg-gray-50 p-4 rounded-lg text-sm md:text-base overflow-y-auto max-h-[60vh]">
                  <p className="whitespace-pre-line">
                    {triageResult.replace(/\*\*/g, "")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4">
                  {!triageResult.includes("PERINGATAN KEAMANAN") && (
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setShowTriageResult(false);
                        setIsWaitingForDoctor(true);
                        resetChatSession();
                      }}
                    >
                      {triageResult.includes("kesulitan memahami")
                        ? "Hubungkan ke Dokter"
                        : "Konsultasi ke Dokter"}
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setShowTriageResult(false);
                    }}
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
