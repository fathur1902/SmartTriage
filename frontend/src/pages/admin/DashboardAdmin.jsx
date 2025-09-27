import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    consultations: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token tidak ditemukan");
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
        } else {
          console.warn("Data dashboard tidak ditemukan:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching dashboard stats:", error)
      );
  }, []); // Kosongkan dependency array untuk fetch sekali saat mount

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Dashboard Admin
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Jumlah Pasien", value: stats.patients, icon: "👥" },
              { label: "Jumlah Dokter", value: stats.doctors, icon: "👨‍⚕️" },
              {
                label: "Konsultasi Bulan Ini",
                value: stats.consultations,
                icon: "💬",
              },
            ].map((stat, index) => (
              <Card key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-teal-600">
                      {stat.value}
                    </p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
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
