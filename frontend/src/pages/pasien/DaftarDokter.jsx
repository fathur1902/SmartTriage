import { useState, useEffect } from "react";
import SidebarPasien from "../../components/SidebarPasien";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const DaftarDokter = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const fetchDoctors = () => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/pasien/doctors`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("pasienToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setDoctors(data.data);
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  };

  useEffect(() => {
    fetchDoctors();
    const intervalId = setInterval(() => {
      fetchDoctors();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarPasien />
        <main className="flex-1 ml-7 p-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Daftar Dokter
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold">
                      {doctor.name ? doctor.name.charAt(0) : "D"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.spesialis}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        doctor.status === "online"
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {doctor.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    navigate("/chatbot", {
                      state: { doctorId: doctor.id },
                    })
                  }
                  variant={doctor.status === "online" ? "primary" : "secondary"}
                  className="w-full"
                  disabled={doctor.status !== "online"}
                >
                  {doctor.status === "online" ? "Konsultasi" : "Offline"}
                </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DaftarDokter;
