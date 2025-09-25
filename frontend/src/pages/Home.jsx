import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faRobot,
  faBook,
  faUserMd,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faTwitter,
  faFacebookF,
} from "@fortawesome/free-brands-svg-icons";
import ArticleCard from "../components/ArticlesCard";
import dummyArticles from "../data/artikel";

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState(null);
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector("header");
      const registerBtn = document.querySelector(".register-btn");
      const navLinks = document.querySelectorAll("nav a");
      const logo = document.querySelector("nav .text-2xl");
      const mobileToggleBtn = document.querySelector(".md\\:hidden button");
      const navUl = document.querySelector("nav ul");

      const scrolled = window.scrollY > 100;

      if (scrolled) {
        navbar.classList.add(
          "bg-white",
          "bg-opacity-90",
          "shadow-md",
          "text-teal-600"
        );
        navbar.classList.remove("bg-transparent", "text-white");

        // register btn jadi hijau teks
        if (registerBtn) {
          registerBtn.classList.remove("text-white");
          registerBtn.classList.add(
            "text-teal-600",
            "border",
            "border-teal-600"
          );
        }

        // ubah semua link di nav jadi warna teal (kontras di navbar putih)
        navLinks.forEach((link) => {
          link.classList.remove("text-white");
          link.classList.add("text-teal-600", "hover:text-teal-800");
        });

        // logo jadi teal
        if (logo) {
          logo.classList.remove("text-white");
          logo.classList.add("text-teal-600");
        }

        // hamburger icon (mobile) juga jadi teal agar konsisten
        if (mobileToggleBtn) {
          mobileToggleBtn.classList.remove("text-white");
          mobileToggleBtn.classList.add("text-teal-600");
        }

        // jika mobile menu sedang memakai bg-teal-600 (overlay terbuka), ubah overlay jadi putih sementara
        if (navUl && navUl.classList.contains("bg-teal-600")) {
          navUl.classList.remove("bg-teal-600");
          navUl.classList.add("bg-white");
          // ubah link di overlay jadi teal (supaya terbaca di bg putih)
          navUl.querySelectorAll("a").forEach((a) => {
            a.classList.remove("text-white");
            a.classList.add("text-teal-600");
          });
        }
      } else {
        // navbar kembali transparan
        navbar.classList.add("bg-transparent", "text-white");
        navbar.classList.remove(
          "bg-white",
          "bg-opacity-90",
          "shadow-md",
          "text-teal-600"
        );

        // register btn kembali putih
        if (registerBtn) {
          registerBtn.classList.add("text-white");
          registerBtn.classList.remove(
            "text-teal-600",
            "border",
            "border-teal-600"
          );
        }

        // link nav kembali putih
        navLinks.forEach((link) => {
          link.classList.add("text-white");
          link.classList.remove("text-teal-600", "hover:text-teal-800");
        });

        // logo kembali putih
        if (logo) {
          logo.classList.add("text-white");
          logo.classList.remove("text-teal-600");
        }

        // hamburger icon kembali putih
        if (mobileToggleBtn) {
          mobileToggleBtn.classList.add("text-white");
          mobileToggleBtn.classList.remove("text-teal-600");
        }

        // jika overlay sebelumnya kita ubah jadi putih, kembalikan ke bg-teal-600 saat tidak scrolled
        if (navUl && navUl.classList.contains("bg-white")) {
          // hanya revert jika overlay memang sebelumnya dimaksudkan sebagai teal
          // (cek agar tidak mengubah tampilan desktop yang seharusnya tidak punya bg-teal-600)
          if (!navUl.classList.contains("md:flex")) {
            // hanya untuk mobile overlay
            navUl.classList.remove("bg-white");
            navUl.classList.add("bg-teal-600");
            navUl.querySelectorAll("a").forEach((a) => {
              a.classList.remove("text-teal-600");
              a.classList.add("text-white");
            });
          } else {
            // jika ini bukan overlay mobile (desktop), biarkan
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // panggil sekali saat mount supaya state awal sinkron
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header dengan Navbar Responsif */}
      <motion.header
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="fixed w-full top-0 z-50 bg-transparent backdrop-blur-md text-white transition-all duration-300"
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <a href="#">
            <div className="text-2xl font-bold drop-shadow-md">SmartTriage</div>
          </a>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none hover:bg-teal-600/50 rounded p-1 transition"
            >
              {isMenuOpen ? (
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
              ) : (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
          <ul
            className={`md:flex space-x-8 ${
              isMenuOpen
                ? "flex flex-col absolute top-16 left-0 w-full max-h-screen overflow-y-auto bg-teal-600 bg-opacity-95 shadow-lg py-4 md:static md:w-auto md:bg-transparent md:shadow-none"
                : "hidden md:flex"
            }`}
          >
            <li>
              <a
                href="#layanan"
                className="block py-2 px-4 hover:text-teal-200 md:hover:text-teal-200 drop-shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Layanan
              </a>
            </li>
            <li>
              <a
                href="#tentang"
                className="block py-2 px-4 hover:text-teal-200 md:hover:text-teal-200 drop-shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang Kami
              </a>
            </li>
            <li>
              <a
                href="#dokter"
                className="block py-2 px-4 hover:text-teal-200 md:hover:text-teal-200 drop-shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dokter
              </a>
            </li>
            <li>
              <a
                href="#artikel"
                className="block py-2 px-4 hover:text-teal-200 md:hover:text-teal-200 drop-shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Artikel
              </a>
            </li>
          </ul>
          <div className="flex items-center space-x-3">
            <a href="/login">
              <button className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition border-1 drop-shadow-md">
                Masuk
              </button>
            </a>
            <a href="/register">
              <button className="register-btn bg-transparent text-white px-4 py-2 rounded-md hover:bg-teal-800 transition border-1 drop-shadow-md">
                Daftar
              </button>
            </a>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section dengan Gelombang */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-teal-500 to-teal-600 text-white py-64 px-4 overflow-hidden pt-52"
      >
        <div className="absolute inset-0">
          <img
            src="images/dokter.jpeg"
            alt="Hero Image"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 opacity-70"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            className="w-full h-57"
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 L0,80 Q360,60 720,80 Q1080,100 1440,80 L1440,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10">
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left mb-8 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Konsultasi Kesehatan Pintar dengan SmartTriage
            </h1>
            <p className="text-xl opacity-90 px-4 lg:px-0">
              Dapatkan triase otomatis melalui chatbot kami untuk diagnosis awal
              yang cepat dan akurat. Mulai konsultasi online sekarang!
            </p>
            <a href="/login">
              <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mx-auto lg:mx-0">
                Konsultasi Sekarang
              </button>
            </a>
          </div>
        </div>
      </motion.section>

      {/* Layanan Kami Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        id="layanan"
        className="py-32 px-4 bg-gray-50 mt-16"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            Layanan Kami
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-8 h-8 text-teal-600"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Telekonsultasi Online
              </h3>
              <p className="text-gray-600">
                Konsultasi langsung dengan dokter melalui video call, kapan saja
                dan di mana saja.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faRobot}
                  className="w-8 h-8 text-teal-600"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Chatbot Triage Otomatis
              </h3>
              <p className="text-gray-600">
                AI pintar yang menilai gejala Anda secara instan untuk triase
                medis awal.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faBook}
                  className="w-8 h-8 text-teal-600"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Artikel Kesehatan</h3>
              <p className="text-gray-600">
                Baca tips dan informasi kesehatan terpercaya dari para ahli
                kami.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tentang Kami Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        id="tentang"
        className="py-32 px-4"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src="images/dokter.jpeg" alt="" />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Tentang Kami</h2>
            <p className="text-gray-600 leading-relaxed">
              SmartTriage adalah platform telekonsultasi online inovatif yang
              dirancang untuk memberikan solusi kesehatan yang cepat dan
              efisien. Dengan fitur chatbot triage otomatis, kami menyaring
              gejala pasien secara awal untuk menentukan tingkat urgensi,
              memastikan mereka mendapatkan perhatian yang tepat dari dokter
              kami. Selain itu, SmartTriage menyediakan berbagai artikel
              kesehatan terpercaya untuk meningkatkan kesadaran dan edukasi
              masyarakat, menjadikan kami mitra tepercaya dalam menjaga
              kesehatan Anda kapan saja, di mana saja.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Dokter Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        id="dokter"
        className="py-32 px-4 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            Dokter Kami
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Dr. Anna Doe", specialty: "Umum" },
              { name: "Dr. John Smith", specialty: "Penyakit Dalam" },
              { name: "Dr. Lisa Wong", specialty: "Anak" },
              { name: "Dr. Mike Johnson", specialty: "Bedah" },
            ].map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUserMd}
                    className="w-24 h-24 text-gray-400"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{doc.name}</h3>
                <p className="text-gray-600 mb-4">{doc.specialty}</p>
                <button className="text-teal-600 hover:underline">
                  Lihat Profil
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Artikel Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        id="artikel"
        className="py-32 px-4"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            Artikel Kesehatan
          </h2>
          <div className="relative">
            <div
              className="flex overflow-x-auto space-x-8 scrollbar-hide pb-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {dummyArticles.map((article, index) => (
                <ArticleCard
                  key={index}
                  title={article.title}
                  excerpt={article.excerpt}
                  imageUrl={article.imageUrl}
                  onClick={() => setSelectedArticle(article)}
                />
              ))}
            </div>
            <button
              onClick={() => {
                const container = document.querySelector(
                  "#artikel .overflow-x-auto"
                );
                container.scrollLeft -= 320;
              }}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full"
            >
              ←
            </button>
            <button
              onClick={() => {
                const container = document.querySelector(
                  "#artikel .overflow-x-auto"
                );
                container.scrollLeft += 320;
              }}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full"
            >
              →
            </button>
          </div>
        </div>

        {/* Popup untuk detail artikel */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-teal-600 flex items-center justify-center z-50 scrollbar-hidden">
            <div className="bg-white p-8 rounded-lg max-w-6xl w-11/12 h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-6 text-white hover:text-gray-700 text-4xl"
              >
                x
              </button>
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className="text-2xl font-semibold mb-4">
                {selectedArticle.title}
              </h3>
              <div className="text-gray-600 mb-4">
                {(() => {
                  const lines = selectedArticle.content.split("\n");
                  const sections = [];
                  let currentSection = null;
                  let hasNumberedSections = false;

                  lines.forEach((line) => {
                    if (/^\d+\./.test(line.trim())) {
                      hasNumberedSections = true;
                      if (currentSection) {
                        sections.push(currentSection);
                      }
                      const [number, ...rest] = line.trim().split(" ");
                      currentSection = {
                        number,
                        title: rest.join(" "),
                        content: [],
                      };
                    } else if (line.trim()) {
                      if (currentSection) {
                        currentSection.content.push(line.trim());
                      } else {
                        // Jika tidak ada section bernomor, simpan sebagai paragraf biasa
                        sections.push({ content: [line.trim()] });
                      }
                    }
                  });

                  if (currentSection) sections.push(currentSection);

                  // Render berdasarkan apakah ada section bernomor
                  if (hasNumberedSections) {
                    return sections.map((sec, idx) => (
                      <div key={idx} className="mb-4">
                        {sec.number && (
                          <strong>
                            {sec.number} {sec.title}
                          </strong>
                        )}
                        <p className="ml-4 whitespace-pre-line">
                          {sec.content.join("\n")}
                        </p>
                      </div>
                    ));
                  } else {
                    return sections.map((sec, idx) => (
                      <p key={idx} className="whitespace-pre-line">
                        {sec.content.join("\n")}
                      </p>
                    ));
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-800 text-white py-16 px-4"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold text-teal-400 mb-4">
              SmartTriage
            </div>
            <p className="text-gray-300">
              Visi kami menyediakan layanan kesehatan inovatif melalui teknologi
              AI.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Tentang</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#layanan" className="hover:text-teal-400">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#dokter" className="hover:text-teal-400">
                  Dokter
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Tentang Kesehatan</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#artikel" className="hover:text-teal-400">
                  Artikel Kesehatan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Sosial</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-teal-400">
                  <FontAwesomeIcon
                    icon={faInstagram}
                    className="w-5 h-5 mr-2"
                  />{" "}
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400">
                  <FontAwesomeIcon
                    icon={faFacebookF}
                    className="w-5 h-5 mr-2"
                  />{" "}
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>
            &copy; 2025 SmartTriage. All rights reserved. |{" "}
            <a href="#" className="hover:text-teal-400">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-teal-400">
              Terms & Conditions
            </a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default Home;
