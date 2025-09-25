import { useState } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";

const DaftarDokter = () => {
  const doctors = [
    { id: 1, name: "Dr. Anna Doe", specialty: "Umum", status: "online" },
    {
      id: 2,
      name: "Dr. John Smith",
      specialty: "Penyakit Dalam",
      status: "offline",
    },
    { id: 3, name: "Dr. Lisa Wong", specialty: "Anak", status: "online" },
    { id: 4, name: "Dr. Mike Johnson", specialty: "Bedah", status: "online" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1  ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Daftar Dokter
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold">D</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        doctor.status === "online"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {doctor.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => (window.location.href = "/consultation")}
                  variant="primary"
                  className="w-full"
                >
                  Konsultasi
                </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DaftarDokter;
