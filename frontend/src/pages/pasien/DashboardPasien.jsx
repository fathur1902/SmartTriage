import { useState } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";

const DashbordPasien = () => {
  const recentConsultations = [
    {
      id: 1,
      date: "2025-09-17",
      doctor: "Dr. Anna Doe",
      summary: "Konsultasi umum - Saran istirahat dan minum obat",
    },
    {
      id: 2,
      date: "2025-09-15",
      doctor: "Dr. John Smith",
      summary: "Triase chatbot - Tidak darurat",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          {/* Ringkasan Data */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ringkasan Data
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-teal-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-teal-600">5</p>
                <p className="text-gray-600">Konsultasi Selesai</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">2</p>
                <p className="text-gray-600">Riwayat Chatbot</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-600">Online</p>
                <p className="text-gray-600">Status Dokter</p>
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/chatbot")}
              variant="primary"
            >
              Akses Cepat ke Chatbot
            </Button>
          </Card>

          {/* Riwayat Konsultasi Singkat */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Riwayat Konsultasi Singkat
            </h2>
            <div className="space-y-4">
              {recentConsultations.map((consult) => (
                <div
                  key={consult.id}
                  className="flex justify-between items-center p-4 border rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{consult.doctor}</p>
                    <p className="text-sm text-gray-600">{consult.date}</p>
                  </div>
                  <p className="text-sm text-gray-800">{consult.summary}</p>
                </div>
              ))}
            </div>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/history")}
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

export default DashbordPasien;
