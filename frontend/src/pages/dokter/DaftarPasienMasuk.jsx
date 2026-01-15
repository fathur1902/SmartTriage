import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const DaftarPasienMasuk = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const navigate = useNavigate();
  const socketRef = useRef();

  const fetchPatients = useCallback(async () => {
    const token = localStorage.getItem("dokterToken");
    if (!token) {
      setError("Silakan login sebagai dokter.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/dokter/pasien-masuk?status=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPatients(data.data || []);
      } else {
        setError(data.message || "Gagal memuat pasien");
      }
    } catch (err) {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BASE_URL);
    socketRef.current.on("update_patient_queue", () => {
      console.log("Ada pasien baru! Refresh data...");
      fetchPatients();
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [fetchPatients]);

  const handleStartConsultation = async (triageId, patientId, patientName) => {
    const token = localStorage.getItem("dokterToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dokter/start-consultation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ triageId, patientId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate(
          `/dokter/konsultasi?consultationId=${
            data.consultationId
          }&patientName=${encodeURIComponent(patientName)}`
        );
      } else {
        alert(data.message || "Gagal memulai konsultasi");
      }
    } catch (err) {
      console.error("Gagal memulai konsultasi", err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "Emergency")
      return "bg-red-100 text-red-700 border border-red-200";
    if (priority === "Darurat")
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    return "bg-green-100 text-green-700 border border-green-200";
  };

  if (loading && patients.length === 0)
    return <div className="p-8 text-center pt-24">Memuat pasien...</div>;
  if (error)
    return <div className="p-8 text-red-600 text-center pt-24">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />

        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Daftar Pasien Masuk
            </h2>
          </div>

          <div className="flex overflow-x-auto whitespace-nowrap space-x-4 md:space-x-6 mb-6 border-b border-gray-200 pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3 px-4 font-medium text-sm md:text-base transition-colors ${
                activeTab === "pending"
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Antrean Masuk
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-3 px-4 font-medium text-sm md:text-base transition-colors ${
                activeTab === "completed"
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pasien Masuk Konsultasi
            </button>
          </div>

          <div className="space-y-4">
            {patients.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm md:text-base">
                  {activeTab === "pending"
                    ? "Tidak ada antrean pasien saat ini."
                    : "Belum ada riwayat pasien selesai."}
                </p>
              </div>
            ) : (
              patients.map((p, index) => (
                <Card key={p.id || index} className="w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center justify-between md:justify-start gap-2 mb-3">
                        <h3 className="font-bold text-base md:text-lg text-gray-800">
                          {p.patient_name}
                        </h3>
                        <span
                          className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                            p.priority
                          )}`}
                        >
                          {p.priority}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0">
                        <div className="flex flex-row gap-2 items-start">
                          <span className="font-medium min-w-[80px] text-gray-500 shrink-0">
                            Keluhan:
                          </span>
                          <span className="text-gray-800 font-medium break-words">
                            {p.symptom}
                          </span>
                        </div>

                        <div className="flex flex-row gap-2 items-start">
                          <span className="font-medium min-w-[80px] text-gray-500 shrink-0">
                            Keparahan:
                          </span>
                          <span>{p.severity}</span>
                        </div>

                        <div className="flex flex-row gap-2 items-start">
                          <span className="font-medium min-w-[80px] text-gray-500 shrink-0">
                            Durasi:
                          </span>
                          <span>{p.duration}</span>
                        </div>

                        <div className="text-xs text-gray-400 mt-2 border-t pt-2 md:border-0 md:pt-0">
                          Masuk:{" "}
                          {new Date(p.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto mt-2 md:mt-0">
                      {activeTab === "pending" ? (
                        <Button
                          onClick={() =>
                            handleStartConsultation(
                              p.id,
                              p.patient_id,
                              p.patient_name
                            )
                          }
                          variant="primary"
                          size="sm"
                          className="w-full md:w-auto justify-center"
                        >
                          Mulai Konsultasi
                        </Button>
                      ) : (
                        <div className="w-full md:w-auto text-center md:text-right">
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full font-medium border border-gray-200 w-full md:w-auto">
                            Selesai
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DaftarPasienMasuk;
