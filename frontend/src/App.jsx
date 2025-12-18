import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPasien from "./pages/pasien/DashboardPasien";
import ChatbotTriage from "./pages/pasien/ChatbotTriage";
import DaftarDokter from "./pages/pasien/DaftarDokter";
import Konsultasi from "./pages/pasien/Konsultasi";
import RiwayatKonsultasi from "./pages/pasien/RiwayatKonsultasi";
import ProfilePasien from "./pages/pasien/ProfilPasien";
import DashboardDokter from "./pages/dokter/DashboardDokter";
import DaftarPasienMasuk from "./pages/dokter/DaftarPasienMasuk";
import KonsultasiDokter from "./pages/dokter/KonsultasiDokter";
import RiwayatPasien from "./pages/dokter/RiwayatPasien";
import ProfileDokter from "./pages/dokter/ProfileDokter";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import BuatAkunDokter from "./pages/admin/BuatAkunDokter";
import KelolaAkunPasien from "./pages/admin/KelolaAkunPasien";
import KelolaAkunDokter from "./pages/admin/KelolaAkunDokter";
import ProfilAdmin from "./pages/admin/ProfilAdmin";

// Ini import style ya brotherrrrrr
import "./App.css";

function App() {
  // Fungsi untuk mendapatkan token berdasarkan role
  const getToken = (role) => {
    const tokenKey = `${role}Token`;
    return localStorage.getItem(tokenKey);
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Rute untuk Pasien */}
        <Route
          path="/dashboard"
          element={
            getToken("pasien") ? <DashboardPasien /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/chatbot"
          element={
            getToken("pasien") ? <ChatbotTriage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/doctors"
          element={
            getToken("pasien") ? <DaftarDokter /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/consultation"
          element={
            getToken("pasien") ? <Konsultasi /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/history"
          element={
            getToken("pasien") ? (
              <RiwayatKonsultasi />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            getToken("pasien") ? <ProfilePasien /> : <Navigate to="/login" />
          }
        />
        {/* Rute untuk Dokter */}
        <Route
          path="/dokter/dashboard"
          element={
            getToken("dokter") ? <DashboardDokter /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dokter/pasien-masuk"
          element={
            getToken("dokter") ? (
              <DaftarPasienMasuk />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/dokter/konsultasi"
          element={
            getToken("dokter") ? <KonsultasiDokter /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dokter/riwayat"
          element={
            getToken("dokter") ? <RiwayatPasien /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dokter/profile"
          element={
            getToken("dokter") ? <ProfileDokter /> : <Navigate to="/login" />
          }
        />
        {/* Rute untuk Admin */}
        <Route
          path="/admin/dashboard"
          element={
            getToken("admin") ? <DashboardAdmin /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/buat-akun-dokter"
          element={
            getToken("admin") ? <BuatAkunDokter /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/kelola-pasien"
          element={
            getToken("admin") ? <KelolaAkunPasien /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/kelola-dokter"
          element={
            getToken("admin") ? <KelolaAkunDokter /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/profile"
          element={
            getToken("admin") ? <ProfilAdmin /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
