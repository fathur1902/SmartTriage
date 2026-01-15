import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const { value: formValues } = await Swal.fire({
      title: "Reset Kata Sandi",
      html: `
        <div class="text-left space-y-3">
  <div>
    <label class="block text-sm text-gray-600 mb-1">Username Anda</label>
    <input
      id="swal-username"
      class="swal2-input w-full"
      placeholder="Masukkan username"
    >
  </div>

  <div>
    <label class="block text-sm text-gray-600 mb-1">Kata Sandi Baru</label>
    <input
      id="swal-new-pass"
      type="password"
      class="swal2-input w-full"
      placeholder="Password baru"
    >
  </div>

  <div>
    <label class="block text-sm text-gray-600 mb-1">Konfirmasi Sandi</label>
    <input
      id="swal-confirm-pass"
      type="password"
      class="swal2-input w-full"
      placeholder="Ulangi password baru"
    >
  </div>
</div>

      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Ubah Password",
      confirmButtonColor: "#0d9488",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const username = document.getElementById("swal-username").value;
        const newPassword = document.getElementById("swal-new-pass").value;
        const confirmPassword =
          document.getElementById("swal-confirm-pass").value;

        if (!username || !newPassword || !confirmPassword) {
          Swal.showValidationMessage("Semua kolom harus diisi");
        } else if (newPassword !== confirmPassword) {
          Swal.showValidationMessage("Konfirmasi password tidak cocok");
        }

        return { username, newPassword, confirmPassword };
      },
    });
    if (formValues) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/reset-password`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire("Berhasil!", data.message, "success");
        } else {
          Swal.fire("Gagal", data.message, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghubungi server", "error");
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.role === "admin") {
          localStorage.setItem("adminToken", data.token);
        } else if (data.role === "pasien") {
          localStorage.setItem("pasienToken", data.token);
        } else if (data.role === "dokter") {
          localStorage.setItem("dokterToken", data.token);
        }
        Swal.fire({
          title: "Login Berhasil",
          text: "Selamat datang kembali!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = data.user.redirectTo;
        });
      } else {
        Swal.fire({
          title: "Gagal Masuk",
          text: data.message || "Username atau password salah",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan koneksi server",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-teal-600">
            Selamat Datang Kembali
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Masuk ke akun Anda untuk melanjutkan konsultasi
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="masukkan username Anda"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Kata Sandi
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 pr-10"
                  placeholder="masukkan kata sandi Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                onClick={handleForgotPassword}
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Lupa Kata Sandi?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                loading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-medium text-teal-600 hover:text-teal-500"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
