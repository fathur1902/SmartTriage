import { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Swal from "sweetalert2";

const ProfileDokter = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [spesialis, setSpesialis] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("dokterToken");
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/dokter/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok && data.data) {
          setName(data.data.name);
          setSpesialis(data.data.spesialis || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("dokterToken");
    Swal.showLoading();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dokter/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, spesialis, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Profil berhasil diperbarui!",
          timer: 1500,
          showConfirmButton: false,
        });
        setEditing(false);
        setPassword("");
      } else {
        Swal.fire("Gagal", data.message || "Gagal update profil", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan koneksi", "error");
    }
  };

  if (loading)
    return <div className="p-8 text-center pt-24">Memuat profil...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 w-full ml-0 md:ml-7 p-4 pt-20 md:p-10 lg:p-20 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Profil Dokter
          </h2>

          <Card>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 pb-4 border-b border-gray-100 sm:border-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl md:text-4xl text-teal-600 font-bold">
                    {name ? name.charAt(0).toUpperCase() : "D"}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                    {name}
                  </h3>
                  <p className="text-gray-600">{spesialis}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editing}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-teal-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
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
                    disabled={!editing}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-teal-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                  />
                </div>

                {editing && (
                  <div className="pt-4 border-t border-gray-100 mt-4 animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru{" "}
                      <span className="text-gray-400 font-normal">
                        (Opsional)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Isi jika ingin mengganti password"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-teal-500 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Kosongkan jika tidak ingin mengubah password.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    setEditing(!editing);
                    setPassword("");
                  }}
                  variant="secondary"
                  className="w-full sm:w-auto justify-center"
                >
                  {editing ? "Batal" : "Edit Profil"}
                </Button>

                {editing && (
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    className="w-full sm:w-auto justify-center"
                  >
                    Simpan Perubahan
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfileDokter;
