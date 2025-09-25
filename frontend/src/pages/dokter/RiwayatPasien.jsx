import { useState } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const RiwayatPasien = () => {
  const history = [
    {
      id: 1,
      patient: "John Doe",
      date: "2025-09-17",
      summary: "Konsultasi umum - Saran istirahat",
    },
    {
      id: 2,
      patient: "Jane Smith",
      date: "2025-09-15",
      summary: "Triase chatbot - Tidak darurat",
    },
    {
      id: 3,
      patient: "Bob Johnson",
      date: "2025-09-10",
      summary: "Konsultasi bedah - Jadwal operasi",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1  ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Riwayat Pasien / Konsultasi
          </h2>
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.patient}</h3>
                    <p className="text-sm text-gray-600">{item.date}</p>
                    <p className="text-gray-800 mt-2">{item.summary}</p>
                  </div>
                  <Button
                    onClick={() => alert("Detail riwayat dibuka")}
                    variant="secondary"
                    size="sm"
                  >
                    Lihat Detail
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RiwayatPasien;
