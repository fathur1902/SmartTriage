import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FiHome,
  FiUserPlus,
  FiMessageSquare,
  FiClipboard,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const DokterSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Dokter");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("dokterToken");
      if (!token) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/dokter/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok && data.data) setUserName(data.data.name);
      } catch (error) {
        console.error("Gagal load profil:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("dokterToken");
      if (token) {
        try {
          await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/auth/dokter/logout`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (e) {
          console.error("Logout API error", e);
        }
      }
      localStorage.removeItem("dokterToken");
      navigate("/login");
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:shadow-none`}
      >
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <span className="font-bold text-gray-700">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-red-500"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-4 overflow-y-auto h-full pb-20">
          <div className="mb-6 px-2">
            <h2 className="text-2xl font-bold text-teal-600">Menu Dokter</h2>
            <p className="text-l text-gray-500 mt-1 font-bold">
              Halo, {userName}
            </p>
          </div>

          <Link
            to="/dokter/dashboard"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiHome className="text-xl" /> <span>Dashboard</span>
          </Link>
          <Link
            to="/dokter/pasien-masuk"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiUserPlus className="text-xl" /> <span>Pasien Masuk</span>
          </Link>
          <Link
            to="/dokter/konsultasi"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiMessageSquare className="text-xl" /> <span>Konsultasi</span>
          </Link>
          <Link
            to="/dokter/riwayat"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiClipboard className="text-xl" /> <span>Riwayat Pasien</span>
          </Link>
          <Link
            to="/dokter/profile"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiUser className="text-xl" /> <span>Profil</span>
          </Link>

          <div className="pt-4 border-t mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <FiLogOut className="text-xl" /> <span>Keluar</span>
            </button>
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default DokterSidebar;
