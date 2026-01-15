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
    recentHistory: [],
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
        if (data.data) {
          setDashboardData(data.data);
        }
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

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Helper function untuk warna status (tidak diubah logikanya)
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "done":
        return "text-blue-600 bg-blue-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar tetap ada, asumsi sidebar responsif/hidden handled di komponennya atau layout utama */}
        <SidebarPasien />

        {/* PERUBAHAN 1: Responsive Padding & Margin 
            - p-4 di mobile, p-10 di tablet, p-20 di desktop
            - ml-0 di mobile (full width), md:ml-7 di desktop (offset sidebar)
            - w-full agar tidak overflow
        */}
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 md:p-10 lg:p-20 pt-20 transition-all duration-300">
          <Card className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Ringkasan Data
            </h2>

            {/* PERUBAHAN 2: Responsive Grid
                - grid-cols-1 (1 kolom) di mobile
                - sm:grid-cols-2 (2 kolom) di tablet kecil
                - md:grid-cols-3 (3 kolom) di tablet/desktop 
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-teal-100 p-4 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-teal-600">
                  {dashboardData.completedConsultations}
                </p>
                <p className="text-sm md:text-base text-gray-600">
                  Konsultasi Selesai
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                  {dashboardData.chatbotHistory}
                </p>
                <p className="text-sm md:text-base text-gray-600">
                  Riwayat Chatbot
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg flex flex-col justify-center items-center sm:col-span-2 md:col-span-1">
                <p className="text-lg md:text-xl font-bold text-green-600">
                  {dashboardData.doctorStatus}
                </p>
                <p className="text-sm md:text-base text-gray-600">
                  Ketersediaan
                </p>
              </div>
            </div>

            <Button
              className="mt-4 w-full md:w-auto"
              onClick={() => navigate("/chatbot")}
              variant="primary"
            >
              Akses Cepat ke Chatbot
            </Button>
          </Card>

          <Card>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Riwayat Konsultasi Singkat
            </h2>
            <div className="space-y-4">
              {dashboardData.recentHistory &&
              dashboardData.recentHistory.length > 0 ? (
                dashboardData.recentHistory.map((item, index) => (
                  <div
                    key={index}
                    // PERUBAHAN 3: Flex Column di Mobile, Row di Desktop
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors gap-3 md:gap-0"
                  >
                    <div className="w-full md:w-auto">
                      <p className="font-semibold text-gray-800">
                        {item.doctor_name || "Menunggu Dokter..."}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.consultation_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    {/* PERUBAHAN 4: Text Alignment & Spacing */}
                    <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0">
                      <p className="text-sm text-gray-800 mb-1 font-medium">
                        <span className="md:hidden font-bold">Keluhan: </span>
                        {item.symptom
                          ? `Keluhan: ${item.symptom}`
                          : "Konsultasi Umum"}
                      </p>
                      <p className="text-sm text-gray-800 mb-2 font-medium">
                        <span className="md:hidden font-bold">Saran: </span>
                        {item.summary ? `Saran: ${item.summary}` : "Saran: -"}
                      </p>

                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                          item.status === "active"
                            ? "text-green-600 bg-green-100"
                            : item.status === "done"
                            ? "text-blue-600 bg-blue-100"
                            : "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {item.status === "active"
                          ? "Berlangsung"
                          : item.status === "done"
                          ? "Selesai"
                          : item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Belum ada riwayat konsultasi.
                </div>
              )}
            </div>
            <Button
              className="mt-4 w-full md:w-auto"
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
