import { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Swal from "sweetalert2";

const ProfileDokter = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [spesialis, setSpesialis] = useState("");
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
          body: JSON.stringify({ name, spesialis }),
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
      } else {
        Swal.fire("Gagal", data.message || "Gagal update profil", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan koneksi", "error");
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat profil...</div>;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Profil Dokter
          </h2>
          <Card>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-teal-600">
                    {name ? name.charAt(0).toUpperCase() : "D"}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-gray-600">{spesialis}</p>
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
                  disabled={!editing}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-teal-500"
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
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-teal-500"
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
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfileDokter;
