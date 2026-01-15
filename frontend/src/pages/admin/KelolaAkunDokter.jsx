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
      navigate("/login");
      return;
    }

    fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setDoctors(data.data);
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }, [navigate]);

  const handleToggleStatus = (id) => {
    const token = localStorage.getItem("adminToken");
    Swal.fire({
      title: "Konfirmasi",
      text: "Ubah status akun dokter ini?",
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
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              Swal.fire("Sukses", "Status berhasil diperbarui!", "success");
              setDoctors((prevDoctors) =>
                prevDoctors.map((doctor) =>
                  doctor.id === id
                    ? {
                        ...doctor,
                        account_status:
                          doctor.account_status === "Aktif"
                            ? "Nonaktif"
                            : "Aktif",
                      }
                    : doctor
                )
              );
            } else {
              Swal.fire("Error", "Gagal memperbarui status", "error");
            }
          })
          .catch(() => Swal.fire("Error", "Terjadi kesalahan", "error"));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Daftar Akun Dokter
          </h2>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {doctor.spesialis}
                    </p>
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
                  <div className="w-full sm:w-auto">
                    <Button
                      onClick={() => handleToggleStatus(doctor.id)}
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    >
                      {doctor.account_status === "Aktif"
                        ? "Nonaktifkan"
                        : "Aktifkan"}
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

export default KelolaAkunDokter;
