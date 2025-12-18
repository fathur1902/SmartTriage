import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FiHome,
  FiCpu,
  FiUsers,
  FiMessageCircle,
  FiClipboard,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const PatientSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Pasien");
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil profil saat komponen dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("pasienToken");
      if (!token) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/pasien/profile`,
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
      localStorage.removeItem("pasienToken");
      navigate("/");
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* TOMBOL TOGGLE (HAMBURGER) - Selalu muncul di Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all"
        aria-label="Menu"
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
            <h2 className="text-2xl font-bold text-teal-600">Menu Pasien</h2>
            <p className="text-l text-gray-500 mt-1 font-bold">
              Halo, {userName}
            </p>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiHome className="text-xl" /> <span>Dashboard</span>
          </Link>
          <Link
            to="/chatbot"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiCpu className="text-xl" /> <span>Chatbot Triage</span>
          </Link>
          <Link
            to="/doctors"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiUsers className="text-xl" /> <span>Daftar Dokter</span>
          </Link>
          <Link
            to="/consultation"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiMessageCircle className="text-xl" /> <span>Konsultasi</span>
          </Link>
          <Link
            to="/history"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 text-teal-700 transition-colors"
          >
            <FiClipboard className="text-xl" /> <span>Riwayat Konsultasi</span>
          </Link>
          <Link
            to="/profile"
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
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default PatientSidebar;
