import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";
import SweetAlert from "../../components/SweetAlert"; // Impor SweetAlert
import { useNavigate } from "react-router-dom";

const KelolaAkunPasien = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  // Inisialisasi SweetAlert
  const showSuccessAlert = SweetAlert({
    title: "Sukses",
    text: "Status akun pasien diperbarui!",
    icon: "success",
    showCancel: false,
    confirmButtonText: "OK",
  });

  const showErrorAlert = SweetAlert({
    title: "Error",
    icon: "error",
    showCancel: false,
    confirmButtonText: "OK",
  });

  // Ambil daftar pasien dari API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token tidak ditemukan");
      navigate("/login");
      return;
    }

    fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/patients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.data) setPatients(data.data);
        else console.warn("Data pasien tidak ditemukan:", data);
      })
      .catch((error) => console.error("Error fetching patients:", error));
  }, [navigate]);

  const handleBlock = (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token tidak ditemukan");
      navigate("/login");
      return;
    }

    SweetAlert({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin memblokir akun pasien ini?",
      icon: "warning",
      showCancel: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/admin/patients/${id}/toggle`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then((data) => {
            console.log("Toggle response:", data);
            if (data.message) {
              showSuccessAlert();
              // Perbarui daftar pasien setelah toggle
              setPatients((prevPatients) =>
                prevPatients.map((patient) =>
                  patient.id === id
                    ? {
                        ...patient,
                        status:
                          patient.status === "Aktif" ? "Diblokir" : "Aktif",
                      }
                    : patient
                )
              );
            } else {
              showErrorAlert({ text: "Gagal memperbarui status" });
            }
          })
          .catch((error) => {
            console.error("Error toggling status:", error);
            showErrorAlert({
              text: "Terjadi kesalahan saat memperbarui status",
            });
          });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Daftar Akun Pasien
          </h2>
          <div className="space-y-4">
            {patients.map((patient) => (
              <Card key={patient.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.username}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === "Aktif"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {patient.status || "Aktif"}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleBlock(patient.id)}
                      variant="primary"
                      size="sm"
                    >
                      {patient.status === "Aktif"
                        ? "Blokir Akun"
                        : "Aktifkan Akun"}
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
