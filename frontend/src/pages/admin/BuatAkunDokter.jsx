import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";
import SweetAlert from "../../components/SweetAlert";
import { useNavigate } from "react-router-dom";

const BuatAkunDokter = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [spesialis, setSpesialis] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const showSuccessAlert = SweetAlert({
    title: "Sukses",
    text: "Akun dokter berhasil dibuat!",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const doctorData = { name, username, spesialis, password };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/admin/doctors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(doctorData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccessAlert();
        setName("");
        setUsername("");
        setSpesialis("");
        setPassword("");
      } else {
        showErrorAlert({ text: data.message || "Gagal membuat akun dokter" });
      }
    } catch (error) {
      showErrorAlert({ text: "Terjadi kesalahan saat membuat akun dokter" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Buat Akun Dokter
          </h2>
          <Card>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  placeholder="Masukkan nama dokter"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  placeholder="Masukkan username dokter"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spesialis
                </label>
                <input
                  type="text"
                  value={spesialis}
                  onChange={(e) => setSpesialis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  placeholder="Masukkan spesialisasi (misalnya Umum)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Awal
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  placeholder="Buat password awal"
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="w-full mt-4">
                Buat Akun
              </Button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default BuatAkunDokter;
