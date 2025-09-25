import { useState } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const DaftarPasienMasuk = () => {
  const patients = [
    { id: 1, name: "John Doe", symptoms: "Demam dan batuk", triage: "Sedang" },
    {
      id: 2,
      name: "Jane Smith",
      symptoms: "Sakit kepala dan mual",
      triage: "Rendah",
    },
    { id: 3, name: "Bob Johnson", symptoms: "Nyeri dada", triage: "Tinggi" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Daftar Pasien Masuk (Hasil Triage)
          </h2>
          <div className="space-y-4">
            {patients.map((patient) => (
              <Card key={patient.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-gray-600">
                      Gejala: {patient.symptoms}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        patient.triage === "Tinggi"
                          ? "bg-red-100 text-red-600"
                          : patient.triage === "Sedang"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      Prioritas: {patient.triage}
                    </span>
                  </div>
                  <Button
                    onClick={() =>
                      (window.location.href = `/dokter/konsultasi?patient=${patient.id}`)
                    }
                    variant="primary"
                    size="sm"
                  >
                    Mulai Konsultasi
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

export default DaftarPasienMasuk;
