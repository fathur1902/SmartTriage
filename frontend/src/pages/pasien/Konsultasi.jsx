import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import ChatRoom from "../../components/ChatRoom";

const Konsultasi = () => {
  const [consultationData, setConsultationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/pasien/check-active-consultation?t=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
            },
          }
        );
        const data = await res.json();

        if (data && data.found) {
          setConsultationData(data);
        } else {
          setConsultationData(null);
        }
      } catch (err) {
        console.error("Gagal load konsultasi:", err);
        setConsultationData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SidebarPasien />
      <main className="flex-1 w-full ml-0 md:ml-7 flex flex-col h-full transition-all duration-300">
        <div className="px-4 pt-24 pb-2 md:px-10 md:pt-10 md:pb-4 lg:px-20 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Ruang Konsultasi
          </h2>
        </div>
        <div className="flex-1 px-4 pb-4 md:px-10 md:pb-10 lg:px-20 min-h-0">
          {loading ? (
            <div className="h-full flex flex-col justify-center items-center bg-white rounded-lg shadow border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
              <span className="ml-3 text-gray-600 mt-4">
                Memuat ruang chat...
              </span>
            </div>
          ) : consultationData ? (
            <div className="h-full">
              <ChatRoom
                consultationId={consultationData.consultationId}
                senderRole="pasien"
                initialStatus={consultationData.status}
                partnerName={consultationData.doctorName}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center bg-white rounded-lg shadow border border-gray-200 text-center p-6">
              <p className="text-gray-500">Tidak ada sesi konsultasi aktif.</p>
              <div className="mt-4">
                <a
                  href="/chatbot"
                  className="text-teal-600 font-bold hover:underline"
                >
                  Mulai Triase Baru
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Konsultasi;
