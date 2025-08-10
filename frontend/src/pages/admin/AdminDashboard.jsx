import { useEffect, useState, useContext } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import { AuthContext } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);

  const fetchVisitors = async () => {
    try {
      const res = await API.get("/admin/visitors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVisitors(res.data);
    } catch (err) {
      alert("Failed to fetch visitors: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleForceCheckout = async (id) => {
    try {
      await API.put(`/admin/force-checkout/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Visitor force checked out");
      fetchVisitors(); // refresh list
    } catch (err) {
      alert("Force checkout failed: " + (err.response?.data?.msg || err.message));
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <p className="mb-4">Manage all visitors</p>

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Check In</th>
              <th className="border p-2">Check Out</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v._id} className="text-center">
                <td className="border p-2">{v.visitor?.name}</td>
                <td className="border p-2">{v.visitor?.email}</td>
                <td className="border p-2">{v.checkInTime}</td>
                <td className="border p-2">
                  {v.checkOutTime || "—"}
                </td>
                <td className="border p-2">
                  {v.status === "checkedIn" ? "✅ In" : "❌ Out"}
                </td>
                <td className="border p-2">
                  {v.status === "checkedIn" && (
                    <button
                      onClick={() => handleForceCheckout(v._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Force Checkout
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
