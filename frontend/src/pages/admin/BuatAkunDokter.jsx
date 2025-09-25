import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";

const BuatAkunDokter = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Akun dokter dibuat:", { name, email, specialty, password });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarAdmin />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Buat Akun Dokter
          </h2>
          <Card>
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  placeholder="Masukkan email dokter"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spesialisasi
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
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
              <Button type="submit" variant="primary" className="w-full">
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
