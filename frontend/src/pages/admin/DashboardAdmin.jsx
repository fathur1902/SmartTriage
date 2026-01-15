import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import { FiUsers, FiActivity, FiMessageSquare } from "react-icons/fi";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    consultations: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setStats({
            patients: data.data.activePatients,
            doctors: data.data.activeDoctors,
            consultations: data.data.monthlyConsultations,
          });
        }
      })
      .catch((error) => console.error("Error fetching stats:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading)
    return <div className="p-8 text-center pt-24">Memuat data admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Dashboard Admin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[
              {
                label: "Total Pasien Aktif",
                value: stats.patients,
                icon: <FiUsers className="w-6 h-6" />,
                color: "text-blue-600",
                bg: "bg-blue-100",
              },
              {
                label: "Total Dokter Terdaftar",
                value: stats.doctors,
                icon: <FiActivity className="w-6 h-6" />,
                color: "text-teal-600",
                bg: "bg-teal-100",
              },
              {
                label: "Konsultasi Bulan Ini",
                value: stats.consultations,
                icon: <FiMessageSquare className="w-6 h-6" />,
                color: "text-purple-600",
                bg: "bg-purple-100",
              },
            ].map((stat, index) => (
              <Card key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-3xl md:text-4xl font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
