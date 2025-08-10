import { useState, useContext } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import { AuthContext } from "../../context/AuthContext";

const VisitorDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [epass, setEpass] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    try {
      const res = await API.post(
        "/visitor/checkin",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEpass(res.data);
      setCheckedIn(true);
    } catch (err) {
      alert("Check-in failed: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await API.put(
        `/visitor/checkout/${epass?._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Checked out successfully");
      setCheckedIn(false);
      setEpass(null);
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Visitor Dashboard</h2>
        <p className="mb-4">Welcome, {user?.name} 👋</p>

        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Check In
          </button>
        ) : (
          <div className="space-y-4">
            <div className="border p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Your e‑Pass</h3>
              <p><b>ID:</b> {epass._id}</p>
              <p><b>Visitor:</b> {user?.name}</p>
              <p><b>Status:</b> Checked In</p>
              <p><b>QR:</b></p>
              <img
                src={`http://localhost:8000/${epass.qrPath}`}
                alt="QR Code"
                className="w-32 h-32"
              />
              <a
                href={`http://localhost:8000/${epass.pdfPath}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Download PDF e‑Pass
              </a>
            </div>

            <button
              onClick={handleCheckOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Check Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorDashboard;
