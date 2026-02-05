import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ChatRoom = ({
  consultationId,
  senderRole,
  initialStatus = "active",
  partnerName,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSessionEnded, setIsSessionEnded] = useState(
    initialStatus === "done"
  );

  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endpoint = senderRole === "dokter" ? "dokter" : "pasien";
        const tokenKey =
          senderRole === "dokter" ? "dokterToken" : "pasienToken";

        const res = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/${endpoint}/chat/${consultationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
            },
          }
        );
        const data = await res.json();
        if (data.data) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error("Gagal load history chat:", err);
      }
    };

    if (consultationId) {
      fetchHistory();
    }
  }, [consultationId, senderRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BASE_URL);

    if (consultationId) {
      socketRef.current.emit("join_room", String(consultationId));
    }

    socketRef.current.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });
    socketRef.current.on("session_ended", () => {
      setIsSessionEnded(true);

      if (senderRole === "pasien") {
        Swal.fire({
          icon: "success",
          title: "Konsultasi Selesai",
          text: "Dokter telah mengakhiri sesi. Terima kasih telah berkonsultasi.",
          confirmButtonText: "Kembali ke Menu Utama",
          confirmButtonColor: "#0d9488",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/dashboard");
          }
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [consultationId, senderRole]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && !isSessionEnded) {
      const messageData = {
        consultationId,
        message: input,
        senderRole,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      socketRef.current.emit("send_message", messageData);
      setInput("");
    }
  };

  const handleEndSession = async () => {
    const result = await Swal.fire({
      title: "Akhiri Konsultasi?",
      text: "Berikan Saran/Catatan untuk pasien (Opsional)",
      input: "textarea",
      inputPlaceholder: "Tulis saran atau catatan di sini...",
      inputAttributes: {
        "aria-label": "Tulis saran atau catatan di sini",
      },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Kirim & Akhiri",
      cancelButtonText: "Batal",
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      const summaryNotes = result.value;
      try {
        await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/dokter/end-consultation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("dokterToken")}`,
            },
            body: JSON.stringify({ consultationId, summary: summaryNotes }),
          }
        );

        socketRef.current.emit("end_session", consultationId);
        setIsSessionEnded(true);
        Swal.fire({
          title: "Selesai!",
          text: "Kembali ke antrean pasien?",
          icon: "success",
          confirmButtonText: "Ya",
          confirmButtonColor: "#0d9488",
        }).then(() => {
          navigate("/dokter/pasien-masuk");
        });
      } catch (error) {
        console.error("Gagal mengakhiri sesi:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border overflow-hidden">
      <div
        className={`p-3 md:p-4 rounded-t-lg font-bold flex justify-between items-center ${
          isSessionEnded ? "bg-gray-600" : "bg-teal-600"
        } text-white transition-colors duration-300 flex-shrink-0`}
      >
        <span className="truncate pr-2 text-sm md:text-base">
          {isSessionEnded
            ? "Riwayat Chat (Selesai)"
            : `${
                partnerName ? partnerName + " - " : ""
              }Live Chat #${consultationId}`}
        </span>
        {senderRole === "dokter" && !isSessionEnded && (
          <button
            onClick={handleEndSession}
            className="bg-red-500 hover:bg-red-600 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded border border-red-700 shadow whitespace-nowrap flex-shrink-0"
          >
            Akhiri Sesi
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 md:p-4 space-y-3 bg-gray-50">
        {messages.map((msg, index) => {
          const roleToCheck = msg.sender_role || msg.senderRole;
          const isMe = roleToCheck === senderRole;

          if (roleToCheck === "system") {
            return (
              <div key={index} className="flex justify-center my-4 w-full px-4">
                <div className="bg-orange-50 border border-orange-200 text-gray-700 text-[10px] md:text-xs p-3 md:p-4 rounded-lg shadow-sm max-w-[90%] md:max-w-md w-full">
                  <div
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    className="text-left font-mono leading-relaxed"
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 md:p-3 rounded-lg max-w-[80%] md:max-w-md text-xs md:text-sm ${
                  isMe
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "bg-white border text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="break-words">{msg.message}</p>
                <span
                  className={`text-[10px] block text-right mt-1 ${
                    isMe ? "text-teal-200" : "text-gray-400"
                  }`}
                >
                  {msg.time ||
                    new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
            </div>
          );
        })}
        {isSessionEnded && (
          <div className="flex justify-center my-4 opacity-75">
            <span className="bg-gray-300 text-gray-700 text-[10px] md:text-xs px-3 py-1 rounded-full font-semibold">
              ⛔ Sesi Konsultasi Telah Ditutup
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-2 md:p-4 border-t bg-white flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSessionEnded}
          placeholder={
            isSessionEnded ? "Sesi selesai (Read Only)" : "Ketik pesan..."
          }
          className={`flex-1 px-3 py-2 md:px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-sm md:text-base ${
            isSessionEnded
              ? "bg-gray-100 cursor-not-allowed text-gray-500"
              : "bg-white"
          }`}
        />
        <button
          type="submit"
          disabled={isSessionEnded}
          className={`p-2 md:p-3 rounded-full text-white transition-all flex-shrink-0 ${
            isSessionEnded
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700"
          }`}
        >
          <FiSend className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
