import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import SweetAlert from "../../components/SweetAlert"; 

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const navigate = useNavigate();

  // Alert konfigurasi
  const showSuccessAlert = SweetAlert({
    title: "Sukses",
    text: "Profil berhasil diperbarui!",
    icon: "success",
    showCancel: false,
    confirmButtonText: "OK",
    onConfirm: () => {},
  });

  const showErrorAlert = SweetAlert({
    title: "Gagal",
    text: "Terjadi kesalahan saat memperbarui profil.",
    icon: "error",
    showCancel: false,
    confirmButtonText: "OK",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setName(data.data.name || ""); // Gunakan default kosong jika tidak ada
          setUsername(data.data.username || ""); // Gunakan default kosong jika tidak ada
        }
      })
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  const handleSave = () => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
      },
      body: JSON.stringify({ name, username, password }), // Sertakan password
    })
      .then((res) => res.json())
      .then((data) => {
        setEditing(false);
        setPassword(""); // Reset password setelah simpan
        if (data.message === "Profil berhasil diperbarui") {
          showSuccessAlert();
        } else {
          showErrorAlert();
        }
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        showErrorAlert();
      });
  };

  const handleChangePassword = () => {
    setEditing(true); // Aktifkan mode edit untuk mengisi password
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Profil Pasien
          </h2>
          <Card>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-teal-600">J</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
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
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
                  placeholder="Masukkan password baru jika ingin mengubah"
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="secondary"
                >
                  {editing ? "Batal" : "Edit"}
                </Button>
                {editing && (
                  <Button onClick={handleSave} variant="primary">
                    Simpan
                  </Button>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                variant="secondary"
                className="w-full"
              >
                Ganti Password
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;
