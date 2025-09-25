import { useState } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";

const RiwayatKonsultasi = () => {
  const history = [
    {
      id: 1,
      date: "2025-09-17",
      doctor: "Dr. Anna Doe",
      summary: "Konsultasi umum - Saran istirahat dan obat",
      type: "Text",
    },
    {
      id: 2,
      date: "2025-09-15",
      doctor: "Chatbot Triage",
      summary: "Triase awal - Tidak darurat",
      type: "Chatbot",
    },
    {
      id: 3,
      date: "2025-09-10",
      doctor: "Dr. John Smith",
      summary: "Konsultasi bedah - Jadwal operasi",
      type: "Video",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1  ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Riwayat Konsultasi
          </h2>
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.doctor}</h3>
                    <p className="text-sm text-gray-600">
                      {item.date} - {item.type}
                    </p>
                    <p className="text-gray-800 mt-2">{item.summary}</p>
                  </div>
                  <Button
                    onClick={() => alert("Detail dibuka")}
                    variant="secondary"
                    size="sm"
                  >
                    Detail
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

export default RiwayatKonsultasi;
