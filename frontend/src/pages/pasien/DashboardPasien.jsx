import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const DashboardPasien = () => {
  const [dashboardData, setDashboardData] = useState({
    completedConsultations: 0,
    chatbotHistory: 0,
    doctorStatus: "Memuat...",
  });
  const navigate = useNavigate();
  const fetchDashboardData = () => {
    const token = localStorage.getItem("pasienToken");
    if (!token) return;

    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setDashboardData(data.data);
      })
      .catch((error) => console.error("Error fetching dashboard:", error));
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ringkasan Data
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-teal-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-teal-600">
                  {dashboardData.completedConsultations}
                </p>
                <p className="text-gray-600">Konsultasi Selesai</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData.chatbotHistory}
                </p>
                <p className="text-gray-600">Riwayat Chatbot</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-green-600">
                  {dashboardData.doctorStatus}
                </p>
                <p className="text-gray-600">Ketersediaan</p>
              </div>
            </div>

            <Button
              className="mt-4"
              onClick={() => navigate("/chatbot")}
              variant="primary"
            >
              Akses Cepat ke Chatbot
            </Button>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Riwayat Konsultasi Singkat
            </h2>
            <div className="space-y-4">
              {/* Placeholder, bisa diambil dari history endpoint nanti */}
              <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold">Dr. Anna Doe</p>
                  <p className="text-sm text-gray-600">2025-09-17</p>
                </div>
                <p className="text-sm text-gray-800">
                  Konsultasi umum - Saran istirahat
                </p>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold">Chatbot Triage</p>
                  <p className="text-sm text-gray-600">2025-09-15</p>
                </div>
                <p className="text-sm text-gray-800">
                  Triase awal - Tidak darurat
                </p>
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => navigate("/history")}
              variant="secondary"
            >
              Lihat Semua Riwayat
            </Button>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DashboardPasien;
