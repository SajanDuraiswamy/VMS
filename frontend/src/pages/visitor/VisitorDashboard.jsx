import { useState, useContext } from "react";
import API from "../../api/axios";
<<<<<<< HEAD
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
=======
import { AuthContext } from "../../context/AuthContext";
import PhotoCapture from "../../components/visitor/PhotoCapture";
import EpassCard from "../../components/visitor/EpassCard";
import { Users, GraduationCap, BookOpen, Building2 } from "lucide-react";

// Sidebar menu items
const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "walkin", label: "Walk-in Registration" },
  { id: "checkin", label: "Check-In" },
  { id: "checkout", label: "Check-Out" },
  { id: "checkinvite", label: "Check Invite" },
];

const VisitorDashboard = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [epass, setEpass] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const [walkinForm, setWalkinForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    purpose: "",
    whom_to_meet: "",
    photo_url: null,
  });

  // Check invite states
  const [inviteCodeSearch, setInviteCodeSearch] = useState("");
  const [searchedRegistration, setSearchedRegistration] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const handleWalkinChange = (field, value) => {
    setWalkinForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinForm.full_name || !walkinForm.mobile || !walkinForm.purpose || !walkinForm.whom_to_meet) {
      alert("Please fill all fields");
      return;
    }
    try {
      await API.post("/visitor/register", { ...walkinForm, visit_type: "walk_in" });
      alert("Walk-in Registration Successful!");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await API.post("/visitor/checkin", {}, { headers: { Authorization: `Bearer ${token}` } });
      setEpass(res.data.log);
      setCheckedIn(true);
      alert("Checked In Successfully!");
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
    } catch (err) {
      alert("Check-in failed: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleCheckOut = async () => {
    try {
<<<<<<< HEAD
      const res = await API.put(
        `/visitor/checkout/${epass?._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Checked out successfully");
=======
      await API.put(`/visitor/checkout/${epass?._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Checked Out Successfully!");
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
      setCheckedIn(false);
      setEpass(null);
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.msg || err.message));
    }
  };

<<<<<<< HEAD
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
=======
  const handleSearchInvite = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchedRegistration(null);
    setSearchError(null);
    if (!inviteCodeSearch) return setSearchError("Please enter an invite code");
    try {
      const res = await API.get(`/visitor/registration/${inviteCodeSearch}`);
      setSearchedRegistration(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.msg || err.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof auth?.logout === "function") {
        await auth.logout();
        window.location.href = "/login";
        return;
      }
      if (token) {
        try {
          await API.post("/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {}
      }
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } catch (err) {}
      window.location.href = "/login";
    } catch (err) {
      alert("Logout failed: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">Visitor Panel</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Signed in as</p>
          <p className="font-medium">{user?.name || "Guest"}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <div className="flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`text-left px-4 py-2 mb-2 rounded transition w-full ${
                activeMenu === item.id ? "bg-indigo-600 text-white" : "hover:bg-indigo-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Welcome, {user?.name} 👋</h2>
        </div>

        {/* Dashboard */}
        {activeMenu === "dashboard" && (
          <div className="w-full h-screen">
            <iframe
              src="https://stjosephs.ac.in"
              title="St. Joseph’s College Website"
              className="w-full h-full"
              style={{ border: "none" }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        )}

        {/* Walk-in Registration */}
        {activeMenu === "walkin" && (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Walk-in Registration</h3>
            <form className="space-y-4" onSubmit={handleWalkinSubmit}>
              <input type="text" placeholder="Full Name" className="w-full border px-4 py-2 rounded"
                value={walkinForm.full_name} onChange={(e) => handleWalkinChange("full_name", e.target.value)} />
              <input type="tel" placeholder="Mobile Number" className="w-full border px-4 py-2 rounded"
                value={walkinForm.mobile} onChange={(e) => handleWalkinChange("mobile", e.target.value)} />
              <input type="email" placeholder="Email" className="w-full border px-4 py-2 rounded"
                value={walkinForm.email} onChange={(e) => handleWalkinChange("email", e.target.value)} />
              <select className="w-full border px-4 py-2 rounded" value={walkinForm.purpose}
                onChange={(e) => handleWalkinChange("purpose", e.target.value)}>
                <option value="">Purpose of Visit</option>
                <option>Seminar</option>
                <option>Project</option>
                <option>Placement</option>
                <option>Admission</option>
                <option>Other</option>
              </select>
              <input type="text" placeholder="Whom to Meet" className="w-full border px-4 py-2 rounded"
                value={walkinForm.whom_to_meet} onChange={(e) => handleWalkinChange("whom_to_meet", e.target.value)} />
              <PhotoCapture
                onPhotoCapture={(url) => handleWalkinChange("photo_url", url)}
                existingPhoto={walkinForm.photo_url}
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                Submit Registration
              </button>
            </form>
          </div>
        )}

        {/* Check-in */}
{activeMenu === "checkin" && (
  <div className="max-w-sm bg-white p-4 rounded-xl shadow-lg">
    {!checkedIn ? (
      <button
        onClick={handleCheckIn}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Check In
      </button>
      ) : (
      <div className="border rounded p-4 text-center space-y-4">
        <h3 className="text-xl font-semibold">Your E-Pass ✅</h3>
        {epass && <EpassCard registration={{ epass_id: epass.epassId, visitor_name: user?.name, visitor_email: user?.email, visitor_mobile: user?.phone, epass_pdf: `${epass.epassId}.pdf` }} />}
      </div>
    )}
  </div>
)}


        {/* Check-out */}
        {activeMenu === "checkout" && checkedIn && (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-lg mt-4">
            <button onClick={handleCheckOut} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
              Check Out
            </button>
          </div>
        )}
<<<<<<< HEAD
      </div>
=======
        {activeMenu === "checkout" && !checkedIn && (
          <p className="mt-4 text-gray-600">You are not checked in currently.</p>
        )}
                {/* Check Invite */}
                {activeMenu === "checkinvite" && (
                  <div className="max-w-xl bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Check Your Invite</h3>
                    <form className="flex gap-3" onSubmit={handleSearchInvite}>
                      <input
                        type="text"
                        placeholder="Enter Invite Code"
                        value={inviteCodeSearch}
                        onChange={(e) => setInviteCodeSearch(e.target.value)}
                        className="flex-1 border px-4 py-2 rounded"
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Check</button>
                    </form>
                    {searchError && <p className="text-red-600 mt-4">{searchError}</p>}
                    {searchedRegistration && (
                      <div className="mt-4">
                        {searchedRegistration.status === "approved" ? (
                          <EpassCard registration={searchedRegistration} />
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="font-medium">Invite Status: {searchedRegistration.status}</div>
                            {searchedRegistration.status === "pending" && (
                              <div className="text-sm text-gray-600 mt-2">Your invite is pending approval. Please check back later.</div>
                            )}
                            {searchedRegistration.status === "rejected" && (
                              <div className="text-sm text-red-600 mt-2">Your invite has been rejected. Contact the host for more details.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
      </main>
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
    </div>
  );
};

export default VisitorDashboard;
