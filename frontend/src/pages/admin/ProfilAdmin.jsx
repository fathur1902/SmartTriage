import { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";
import SweetAlert from "../../components/SweetAlert";
import { useNavigate } from "react-router-dom";

const ProfilAdmin = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Admin User");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ==== ALERT HELPERS ====
  const showConfirmAlert = SweetAlert({
    title: "Konfirmasi",
    text: "Apakah Anda yakin ingin menyimpan perubahan?",
    icon: "question",
    showCancel: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });

  const showSuccessAlert = SweetAlert({
    title: "Sukses",
    text: "Profil admin berhasil diperbarui!",
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

  // Ambil data profile admin saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setName(data.data.name);
          setUsername(data.data.username);
        }
      })
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  // Simpan perubahan profil (konfirmasi SweetAlert baru muncul di sini)
  const handleSave = (e) => {
    e.preventDefault();

    const updatedData = {};
    if (name.trim() !== "") updatedData.name = name;
    if (username.trim() !== "") updatedData.username = username;
    if (password.trim() !== "") updatedData.password = password;

    if (Object.keys(updatedData).length === 0) {
      showErrorAlert({ text: "Tidak ada perubahan untuk disimpan" });
      return;
    }

    // Tampilkan konfirmasi sebelum simpan
    showConfirmAlert({
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/admin/profile`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updatedData),
            }
          );

          const data = await res.json();

          if (data.message === "Profil admin berhasil diperbarui") {
            showSuccessAlert();
            setEditing(false);
            setPassword(""); // reset password field
          } else {
            showErrorAlert({
              text: data.message || "Gagal menyimpan profil",
            });
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          showErrorAlert({ text: "Terjadi kesalahan saat menyimpan profil" });
        }
      },
    });
  };

  const handleEditToggle = () => {
    if (editing) {
      // Kalau lagi edit → klik tombol jadi batal
      setEditing(false);
      setPassword("");
    } else {
      // Klik edit pertama kali → langsung aktifkan input (tanpa alert)
      setEditing(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Profil Admin
          </h2>
          <Card>
            <form className="space-y-6" onSubmit={handleSave}>
              {/* Avatar + info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-teal-600">A</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-gray-600">{username}</p>
                </div>
              </div>

              {/* Input Nama */}
              <div>
                <label
                  htmlFor="admin-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
                />
              </div>

              {/* Input Username */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
                />
              </div>

              {/* Input Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
                  placeholder="Masukkan password baru"
                />
              </div>

              {/* Tombol */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleEditToggle}
                  type="button"
                  variant="secondary"
                >
                  {editing ? "Batal" : "Edit"}
                </Button>
                {editing && (
                  <Button type="submit" variant="primary">
                    Simpan
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfilAdmin;
