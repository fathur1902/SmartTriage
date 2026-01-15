import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ChatRoom from "../../components/ChatRoom";
import { useNavigate } from "react-router-dom";

const RiwayatKonsultasi = () => {
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.data || []);
      })
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Riwayat Konsultasi
          </h2>

          {selectedChatId ? (
            <Card>
              <button
                onClick={() => setSelectedChatId(null)}
                className="mb-4 text-teal-600 hover:underline flex items-center gap-1 text-sm md:text-base"
              >
                &larr; Kembali ke Daftar
              </button>
              <div className="bg-gray-100 p-2 text-center text-xs text-gray-500 mb-2 rounded">
                Arsip Chat (Read Only)
              </div>
              <div className="h-[65vh] md:h-auto overflow-hidden">
                <ChatRoom
                  consultationId={selectedChatId}
                  senderRole="pasien"
                  initialStatus="done"
                />
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm p-6">
                  <p className="italic">Belum ada riwayat konsultasi.</p>
                </div>
              )}
              {history.map((item) => (
                <Card key={item.id}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
                    <div className="w-full md:w-3/4">
                      <h3 className="font-semibold text-base md:text-lg text-teal-700">
                        Berkonsultasi dengan {item.doctor || "Dokter Umum"}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mb-3">
                        {new Date(item.consultation_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>

                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                          <span className="font-bold block md:inline md:mr-1">
                            Keluhan:
                          </span>{" "}
                          {item.symptom || "-"}
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border-l-4 border-teal-500">
                          <span className="font-bold block md:inline md:mr-1">
                            Saran Dokter:
                          </span>{" "}
                          <span className="italic">
                            {item.summary || "Tidak ada catatan khusus."}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-auto mt-2 md:mt-0 md:pl-4">
                      <Button
                        onClick={() => setSelectedChatId(item.id)}
                        variant="secondary"
                        size="sm"
                        className="w-full md:w-auto whitespace-nowrap"
                      >
                        Lihat Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RiwayatKonsultasi;
