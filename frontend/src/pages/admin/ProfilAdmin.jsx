import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import Card from "../../components/Card";
import Button from "../../components/Button";

const ProfilAdmin = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@example.com");

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    console.log("Profil admin disimpan:", { name, email });
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
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-teal-600">A</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-gray-600">{email}</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500"
                  disabled={!editing}
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
