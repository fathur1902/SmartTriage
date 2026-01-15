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

  const showConfirmAlert = SweetAlert({
    title: "Konfirmasi",
    text: "Simpan perubahan?",
    icon: "question",
    showCancel: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });

  const showSuccessAlert = SweetAlert({
    title: "Sukses",
    text: "Profil diperbarui!",
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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
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
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const updatedData = {};
    if (name.trim() !== "") updatedData.name = name;
    if (username.trim() !== "") updatedData.username = username;
    if (password.trim() !== "") updatedData.password = password;

    if (Object.keys(updatedData).length === 0) {
      showErrorAlert({ text: "Tidak ada perubahan" });
      return;
    }

    showConfirmAlert({
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("adminToken"); 
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
          if (res.ok) {
            showSuccessAlert();
            setEditing(false);
            setPassword("");
          } else {
            showErrorAlert({ text: data.message });
          }
        } catch (error) {
          showErrorAlert({ text: "Terjadi kesalahan" });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Profil Admin
          </h2>
          <Card>
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 pb-4 border-b sm:border-0 border-gray-100">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl text-teal-600 font-bold">A</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-gray-600">{username}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 disabled:bg-gray-50"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 disabled:bg-gray-50"
                  disabled={!editing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 disabled:bg-gray-50"
                  disabled={!editing}
                  placeholder="Masukkan password baru"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => {
                    setEditing(!editing);
                    setPassword("");
                  }}
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto justify-center"
                >
                  {editing ? "Batal" : "Edit"}
                </Button>
                {editing && (
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto justify-center"
                  >
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
