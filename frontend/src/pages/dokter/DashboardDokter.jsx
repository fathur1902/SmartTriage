import { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { FiUsers, FiCheckCircle, FiClock } from "react-icons/fi";

const DashboardDokter = () => {
  const [stats, setStats] = useState({
    todayPatients: 0,
    completedConsultations: 0,
    pendingQueue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    const token = localStorage.getItem("dokterToken");
    if (!token) {
      setError("Silakan login sebagai dokter.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dokter/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setStats(data.data);
      } else {
        console.error("Gagal refresh data:", data.message);
      }
    } catch (err) {
      console.error("Koneksi gagal saat refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(() => {
      fetchStats();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading)
    return <div className="p-8 text-center pt-24">Memuat Dashboard...</div>;
  if (error)
    return <div className="p-8 text-red-600 text-center pt-24">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Dashboard Dokter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-teal-600">
                    {stats.todayPatients}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Pasien Masuk Hari Ini
                  </p>
                </div>
                <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                  <FiUsers className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">
                    {stats.completedConsultations}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Konsultasi Selesai
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FiCheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </Card>
            <Card className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-orange-500">
                    {stats.pendingQueue}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Antrean Menunggu</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full text-orange-500">
                  <FiClock className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Button
              onClick={() => (window.location.href = "/dokter/pasien-masuk")}
              variant="primary"
              className="w-full md:w-auto justify-center"
            >
              Lihat Daftar Pasien Masuk →
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardDokter;
