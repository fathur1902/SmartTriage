import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";

const KelolaAkunPasien = () => {
  const patients = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Aktif" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Aktif" },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      status: "Diblokir",
    },
  ];

  const handleResetPassword = (id) => {
    console.log("Reset password untuk pasien ID:", id);
  };

  const handleBlock = (id) => {
    console.log("Blokir pasien ID:", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Kelola Akun Pasien
          </h2>
          <div className="space-y-4">
            {patients.map((patient) => (
              <Card key={patient.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === "Aktif"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleResetPassword(patient.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Reset Password
                    </Button>
                    <Button
                      onClick={() => handleBlock(patient.id)}
                      variant="primary"
                      size="sm"
                    >
                      Blokir Akun
                    </Button>
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

export default KelolaAkunPasien;
