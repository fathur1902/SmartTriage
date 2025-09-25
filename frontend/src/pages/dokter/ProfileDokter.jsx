import { useState } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const ProfileDokter = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Dr. Anna Doe");
  const [specialty, setSpecialty] = useState("Umum");
  const [schedule, setSchedule] = useState("Senin - Jumat, 08:00 - 17:00");

  const handleSave = () => {
    setEditing(false);
    console.log("Profile updated:", { name, specialty, schedule });
  };

  const handleChangePassword = () => {
    alert("Fitur ganti password dibuka");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1  ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Profil Dokter
          </h2>
          <Card>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-teal-600">A</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-gray-600">{specialty}</p>
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
                  Spesialis
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jadwal Praktik
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
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

export default ProfileDokter;
