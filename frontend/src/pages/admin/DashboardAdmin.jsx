import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";

const DashboardAdmin = () => {
  const stats = [
    { label: "Jumlah Pasien", value: "150", icon: "👥" },
    { label: "Jumlah Dokter", value: "25", icon: "👨‍⚕️" },
    { label: "Konsultasi Bulan Ini", value: "300", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Dashboard Admin
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
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
