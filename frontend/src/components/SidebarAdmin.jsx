import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const SidebarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      navigate("/");
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-teal-600 text-white rounded-lg focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      <aside
        className={`w-64 bg-gray-100 h-screen p-4 fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:z-auto`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 text-teal-600 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <nav className="space-y-6 pt-12 md:pt-4">
          <h2 className="text-xl font-bold text-teal-600 mb-4">Menu Admin</h2>
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3 p-2 rounded hover:bg-teal-100 text-teal-600"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/buat-akun-dokter"
            className="flex items-center space-x-3 p-2 rounded hover:bg-teal-100 text-teal-600"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">👨‍⚕️</span>
            <span>Buat Akun Dokter</span>
          </Link>
          <Link
            to="/admin/kelola-pasien"
            className="flex items-center space-x-3 p-2 rounded hover:bg-teal-100 text-teal-600"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">👥</span>
            <span>Kelola Akun Pasien</span>
          </Link>
          <Link
            to="/admin/kelola-dokter"
            className="flex items-center space-x-3 p-2 rounded hover:bg-teal-100 text-teal-600"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">👨‍⚕️</span>
            <span>Kelola Akun Dokter</span>
          </Link>
          <Link
            to="/admin/profile"
            className="flex items-center space-x-3 p-2 rounded hover:bg-teal-100 text-teal-600"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">👤</span>
            <span>Profil</span>
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-3 p-2 rounded hover:bg-red-100 text-red-600 mt-4"
          >
            <span className="text-xl">🚪</span>
            <span>Keluar</span>
          </button>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default SidebarAdmin;
