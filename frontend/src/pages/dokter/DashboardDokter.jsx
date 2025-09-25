import { useState } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const DashboardDokter = () => {
  const stats = [
    { label: "Pasien Masuk Hari Ini", value: "12", icon: "👥" },
    { label: "Konsultasi Selesai", value: "45", icon: "✅" },
    { label: "Rata-rata Durasi", value: "15 min", icon: "⏱️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Dashboard Dokter
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
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
          <Button
            onClick={() => (window.location.href = "/dokter/pasien-masuk")}
            variant="primary"
            className="w-full max-w-md"
          >
            Lihat Pasien Masuk
          </Button>
        </main>
      </div>
    </div>
  );
};

export default DashboardDokter;
