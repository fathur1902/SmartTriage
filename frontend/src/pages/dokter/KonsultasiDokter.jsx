import { useSearchParams } from "react-router-dom";
import SidebarDokter from "../../components/SidebarDokter";
import ChatRoom from "../../components/ChatRoom";

const KonsultasiDokter = () => {
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId");
  const namaPasien = searchParams.get("patientName");

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SidebarDokter />
      <main className="flex-1 w-full ml-0 md:ml-7 flex flex-col h-full transition-all duration-300">
        <div className="px-4 pt-24 pb-2 md:px-10 md:pt-10 md:pb-4 lg:px-20 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Ruang Konsultasi
          </h2>
        </div>
        <div className="flex-1 px-4 pb-4 md:px-10 md:pb-10 lg:px-20 min-h-0">
          {consultationId ? (
            <div className="h-full">
              <ChatRoom
                consultationId={consultationId}
                senderRole="dokter"
                partnerName={namaPasien}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center bg-white rounded-lg shadow border border-gray-200 text-center p-6">
              <p className="text-gray-500">Tidak ada sesi konsultasi aktif.</p>
              <div className="mt-4">
                <a
                  href="/dokter/pasien-masuk"
                  className="text-teal-600 font-bold hover:underline"
                >
                  Lihat Daftar Pasien Masuk
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default KonsultasiDokter;