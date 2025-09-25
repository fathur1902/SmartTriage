import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder untuk logika login
    console.log("Login attempted with:", { username, password });
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
                type="username"
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
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="masukkan kata sandi Anda"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Ingat Saya
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Lupa Kata Sandi?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Masuk
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
