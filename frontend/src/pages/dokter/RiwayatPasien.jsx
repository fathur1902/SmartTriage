import { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const RiwayatPasien = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [chatLogs, setChatLogs] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("dokterToken");
      if (!token) {
        setError("Silakan login sebagai dokter.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/dokter/riwayat-pasien`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) setPatients(data.data || []);
        else setError(data.message);
      } catch (err) {
        setError("Koneksi gagal");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const handleShowDetail = (consultation) => {
    setSelectedConsultation(consultation);
    setChatLogs([]);
    setShowChat(false);
  };

  const handleCloseDetail = () => {
    setSelectedConsultation(null);
    setChatLogs([]);
    setShowChat(false);
  };

  const fetchChatLogs = async (consultationId) => {
    if (showChat) {
      setShowChat(false);
      return;
    }

    setLoadingChat(true);
    setShowChat(true);
    const token = localStorage.getItem("dokterToken");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dokter/chat/${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.data) {
        setChatLogs(data.data);
      }
    } catch (err) {
      console.error("Gagal load chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center pt-24">Memuat riwayat...</div>;
  if (error)
    return <div className="p-8 text-red-600 text-center pt-24">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Riwayat Pasien
          </h2>
          {patients.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Belum ada riwayat.</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {patients.map((p) => (
                <Card key={p.patientId} className="overflow-hidden">
                  <div
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 cursor-pointer"
                    onClick={() => toggleExpand(p.patientId)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-teal-700 text-lg">
                        Nama Pasien: {p.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {p.totalConsultations} konsultasi • Terakhir:{" "}
                        {p.latestDate}
                      </p>
                    </div>
                    <span className="text-teal-600 text-sm font-medium self-end sm:self-center">
                      {expanded === p.patientId ? "Tutup" : "Lihat Detail"}
                    </span>
                  </div>

                  {expanded === p.patientId && (
                    <div className="border-t pt-3 mt-3 space-y-3 bg-gray-50 -mx-6 px-6 pb-2">
                      {p.consultations.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-white rounded-lg shadow-sm text-sm border border-gray-100 gap-3"
                        >
                          <div className="w-full">
                            <p className="font-medium text-teal-800 mb-1">
                              {c.date}
                            </p>
                            <p className="text-gray-600 line-clamp-2 md:line-clamp-1">
                              {c.summary}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleShowDetail(c)}
                            className="w-full md:w-auto text-center justify-center whitespace-nowrap"
                          >
                            Detail
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      {selectedConsultation && (
        <div className="fixed bg-black bg-opacity-50 inset-0 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                Detail Konsultasi
              </h3>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold block text-teal-700 mb-1">
                      Tanggal:
                    </span>
                    <p className="bg-gray-50 p-2 rounded border border-gray-200">
                      {selectedConsultation.date}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold block text-teal-700 mb-1">
                      Status:
                    </span>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {selectedConsultation.status || "Selesai"}
                    </span>
                  </div>
                </div>

                {selectedConsultation.symptom && (
                  <div>
                    <span className="font-semibold block text-teal-700 mb-1">
                      Gejala Awal:
                    </span>
                    <p className="bg-orange-50 p-3 rounded border border-orange-100 text-gray-800">
                      {selectedConsultation.symptom}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-semibold block text-teal-700 mb-1">
                    Ringkasan Medis:
                  </span>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-1 whitespace-pre-line min-h-[80px]">
                    {selectedConsultation.summary ||
                      "Tidak ada catatan detail."}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 justify-center"
                  onClick={() => fetchChatLogs(selectedConsultation.id)}
                >
                  {showChat
                    ? "Tutup Riwayat Chat"
                    : "Lihat Riwayat Chat Lengkap"}
                </Button>
              </div>

              {showChat && (
                <div className="bg-gray-100 p-3 md:p-4 rounded-lg border h-64 overflow-y-auto space-y-3">
                  {loadingChat ? (
                    <p className="text-center text-gray-500 text-sm py-10">
                      Memuat percakapan...
                    </p>
                  ) : chatLogs.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-10">
                      Tidak ada percakapan tersimpan.
                    </p>
                  ) : (
                    chatLogs.map((msg, idx) => {
                      const isDokter = msg.sender_role === "dokter";
                      const isSystem = msg.sender_role === "system";

                      if (isSystem)
                        return (
                          <div key={idx} className="flex justify-center">
                            <span className="text-[10px] md:text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 text-center">
                              {msg.message}
                            </span>
                          </div>
                        );

                      return (
                        <div
                          key={idx}
                          className={`flex ${
                            isDokter ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[70%] p-2 rounded-lg text-xs md:text-sm ${
                              isDokter
                                ? "bg-teal-600 text-white rounded-br-none"
                                : "bg-white border rounded-bl-none"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <span
                              className={`block text-[10px] text-right mt-1 ${
                                isDokter ? "text-teal-200" : "text-gray-400"
                              }`}
                            >
                              {msg.time || "00:00"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <div className="p-4 md:p-6 border-t bg-gray-50 rounded-b-lg flex justify-end">
              <Button
                onClick={handleCloseDetail}
                variant="primary"
                className="w-full md:w-auto justify-center"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatPasien;
