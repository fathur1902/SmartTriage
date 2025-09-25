import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";

const KelolaAkunDokter = () => {
  const doctors = [
    { id: 1, name: "Dr. Anna Doe", specialty: "Umum", status: "Aktif" },
    {
      id: 2,
      name: "Dr. John Smith",
      specialty: "Penyakit Dalam",
      status: "Nonaktif",
    },
    { id: 3, name: "Dr. Lisa Wong", specialty: "Anak", status: "Aktif" },
  ];

  const handleToggleStatus = (id) => {
    console.log("Toggle status dokter ID:", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Kelola Akun Dokter
          </h2>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        doctor.status === "Aktif"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleToggleStatus(doctor.id)}
                    variant="primary"
                    size="sm"
                  >
                    {doctor.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
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

export default KelolaAkunDokter;
