import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const RiwayatKonsultasi = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setHistory(data.data);
      })
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Riwayat Konsultasi
          </h2>
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {item.doctor || "Tidak ada dokter"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(item.consultation_date).toLocaleDateString()} -{" "}
                      {item.type}
                    </p>
                    <p className="text-gray-800 mt-2">{item.summary}</p>
                  </div>
                  <Button
                    onClick={() => alert("Detail dibuka")}
                    variant="secondary"
                    size="sm"
                  >
                    Detail
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RiwayatKonsultasi;
