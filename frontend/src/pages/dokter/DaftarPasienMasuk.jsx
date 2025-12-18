// src/pages/dokter/DaftarPasienMasuk.jsx
import { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const DaftarPasienMasuk = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
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
    };
    fetchPatients();
  }, [activeTab]);

  const handleStartConsultation = async (triageId) => {
    const token = localStorage.getItem("dokterToken");
    try {
      await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/dokter/triage-complete/${triageId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.href = `/dokter/konsultasi?consultationId=${triageId}`;
    } catch (err) {
      console.error("Gagal memulai konsultasi", err);
      alert("Gagal memperbarui status pasien.");
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "Emergency")
      return "bg-red-100 text-red-700 border border-red-200";
    if (priority === "Darurat")
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    return "bg-green-100 text-green-700 border border-green-200";
  };

  if (loading) return <div className="p-8 text-center">Memuat pasien...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <SidebarDokter />
      <main className="flex-1 w-full p-4 md:p-10 lg:p-20 ml-0 md:ml-0 transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
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

        {/* List Pasien */}
        <div className="space-y-4">
          {patients.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 mx-2">
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
                    <div className="flex flex-wrap items-center justify-between md:justify-start gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        {p.patient_name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                          p.priority
                        )}`}
                      >
                        {p.priority}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex flex-col sm:flex-row sm:gap-1">
                        <span className="font-medium min-w-[80px]">
                          Keluhan:
                        </span>
                        <span className="text-gray-800">{p.symptom}</span>
                      </p>
                      <p className="flex flex-col sm:flex-row sm:gap-1">
                        <span className="font-medium min-w-[80px]">
                          Keparahan:
                        </span>
                        <span>{p.severity}</span>
                      </p>
                      <p className="flex flex-col sm:flex-row sm:gap-1">
                        <span className="font-medium min-w-[80px]">
                          Durasi:
                        </span>
                        <span>{p.duration}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Masuk:{" "}
                        {new Date(p.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    {activeTab === "pending" ? (
                      <Button
                        onClick={() => handleStartConsultation(p.id)}
                        variant="primary"
                        size="sm"
                        className="w-full md:w-auto justify-center"
                      >
                        Mulai Konsultasi
                      </Button>
                    ) : (
                      <div className="w-full md:w-auto text-center md:text-right">
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full font-medium border border-gray-200">
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
  );
};

export default DaftarPasienMasuk;
