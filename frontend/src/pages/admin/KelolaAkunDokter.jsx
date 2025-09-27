import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";
import SweetAlert from "../../components/SweetAlert"; // Impor SweetAlert
import { useNavigate } from "react-router-dom";

const KelolaAkunDokter = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  // Inisialisasi SweetAlert
  const showSuccessAlert = SweetAlert({
    title: "Sukses",
    text: "Status akun dokter diperbarui!",
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

  // Ambil daftar dokter dari API
  useEffect(() => {
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token tidak ditemukan");
      navigate("/login");
      return;
    }

    fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/doctors/${id}/toggle`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Toggle response:", data);
        if (data.message) {
          showSuccessAlert();
          // Perbarui daftar dokter setelah toggle
          setDoctors((prevDoctors) =>
            prevDoctors.map((doctor) =>
              doctor.id === id
                ? {
                    ...doctor,
                    status: doctor.status === "Aktif" ? "Nonaktif" : "Aktif",
                  }
                : doctor
            )
          );
        } else {
          showErrorAlert({ text: "Gagal memperbarui status" });
        }
      })
      .catch((error) => {
        console.error("Error toggling status:", error);
        showErrorAlert({ text: "Terjadi kesalahan saat memperbarui status" });
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
