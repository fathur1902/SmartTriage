import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPasien />} />
        <Route path="/chatbot" element={<ChatbotTriage />} />
        <Route path="/doctors" element={<DaftarDokter />} />
        <Route path="/consultation" element={<Konsultasi />} />
        <Route path="/history" element={<RiwayatKonsultasi />} />
        <Route path="/profile" element={<ProfilePasien />} />
        <Route path="/dokter/dashboard" element={<DashboardDokter />} />
        <Route path="/dokter/pasien-masuk" element={<DaftarPasienMasuk />} />
        <Route path="/dokter/konsultasi" element={<KonsultasiDokter />} />
        <Route path="/dokter/riwayat" element={<RiwayatPasien />} />
        <Route path="/dokter/profile" element={<ProfileDokter />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/buat-akun-dokter" element={<BuatAkunDokter />} />
        <Route path="/admin/kelola-pasien" element={<KelolaAkunPasien />} />
        <Route path="/admin/kelola-dokter" element={<KelolaAkunDokter />} />
        <Route path="/admin/profile" element={<ProfilAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
