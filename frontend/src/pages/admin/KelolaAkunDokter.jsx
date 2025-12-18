import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Swal from "sweetalert2"; 
import { useNavigate } from "react-router-dom";

const KelolaAkunDokter = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.error("Token tidak ditemukan");
      navigate("/login");
      return;
    }

    fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.data) setDoctors(data.data);
        else console.warn("Data dokter tidak ditemukan:", data);
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }, [navigate]);

  const handleToggleStatus = (id) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      console.error("Token tidak ditemukan");
      navigate("/login");
      return;
    }
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin mengubah status akun dokter ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/admin/doctors/${id}/toggle`,
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
              // Tampilkan Sukses
              Swal.fire({
                title: "Sukses",
                text: "Status akun dokter berhasil diperbarui!",
                icon: "success",
              });

              // Update State Lokal
              setDoctors((prevDoctors) =>
                prevDoctors.map((doctor) =>
                  doctor.id === id
                    ? {
                        ...doctor,
                        account_status:
                          doctor.account_status === "Aktif"
                            ? "Nonaktif"
                            : "Aktif",
                        status:
                          doctor.account_status === "Aktif"
                            ? "offline"
                            : doctor.status,
                      }
                    : doctor
                )
              );
            } else {
              Swal.fire("Error", "Gagal memperbarui status", "error");
            }
          })
          .catch((error) => {
            console.error("Error toggling status:", error);
            Swal.fire(
              "Error",
              "Terjadi kesalahan saat memperbarui status",
              "error"
            );
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
            Daftar Dokter
          </h2>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.spesialis}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        doctor.account_status === "Aktif"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {doctor.account_status}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleToggleStatus(doctor.id)}
                    variant="primary"
                    size="sm"
                  >
                    {doctor.account_status === "Aktif"
                      ? "Nonaktifkan"
                      : "Aktifkan"}
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
