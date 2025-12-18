// src/pages/dokter/RiwayatPasien.jsx
import { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import Card from "../../components/Card";
import Button from "../../components/Button";

const RiwayatPasien = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("dokterToken");
      if (!token) {
        setError("Silakan login sebagai dokter.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/dokter/riwayat-pasien`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setPatients(data.data || []);
        } else {
          setError(data.message || "Gagal memuat riwayat");
        }
      } catch (err) {
        setError("Koneksi gagal");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) return <div className="p-8 text-center">Memuat riwayat...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarDokter />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Riwayat Pasien yang Pernah Berkonsultasi
          </h2>
          {patients.length === 0 ? (
            <p className="text-center text-gray-500">Belum ada riwayat.</p>
          ) : (
            <div className="space-y-6">
              {patients.map((p) => (
                <Card key={p.patientId}>
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpand(p.patientId)}
                  >
                    <div>
                      <h3 className="font-semibold text-teal-700">
                        {p.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {p.totalConsultations} konsultasi • Terakhir:{" "}
                        {p.latestDate}
                      </p>
                    </div>
                    <span className="text-teal-600">
                      {expanded === p.patientId ? "Collapse" : "Expand"}
                    </span>
                  </div>
                  {expanded === p.patientId && (
                    <div className="border-t px-4 py-3 space-y-3 bg-gray-50">
                      {p.consultations.map((c) => (
                        <div
                          key={c.id}
                          className="flex justify-between items-start p-3 bg-white rounded-lg shadow-sm text-sm"
                        >
                          <div>
                            <p className="font-medium">{c.date}</p>
                            <p className="text-gray-600 mt-1">{c.summary}</p>
                          </div>
                          <Button variant="secondary" size="sm">
                            Detail
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RiwayatPasien;
