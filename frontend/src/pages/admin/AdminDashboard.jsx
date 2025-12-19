import { useEffect, useState, useContext } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import { AuthContext } from "../../context/AuthContext";
import {
  PieChart, Pie, Cell,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PreRegistration from "./PreRegistration";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClient = useQueryClient();

  // --------------------- FETCH VISITORS WITH REACT QUERY ---------------------
  const { data: visitors = [], isLoading: visitorsLoading } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      try {
        const res = await API.get("/admin/visitors");
        return res.data || [];
    } catch (err) {
        console.error("Failed to fetch visitors:", err);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Get registrations to show pending pre-registration count in sidebar
  const { data: registrations = [] } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      try {
        const res = await API.get("/visitor/registrations");
        return res.data || [];
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
        return [];
      }
    },
  });

  // Force checkout mutation
  const forceCheckoutMutation = useMutation({
    mutationFn: async (id) => {
      return API.put(`/admin/force-checkout/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["visitors"]);
    },
  });

  const handleForceCheckout = (id) => {
    if (window.confirm("Are you sure you want to force checkout this visitor?")) {
      forceCheckoutMutation.mutate(id);
    }
  };

  // --------------------- FILTER VISITORS ---------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy HH:mm");
    } catch {
      return "—";
    }
  };

  // Determine status from checkInTime and checkOutTime
  const getVisitorStatus = (visitor) => {
    if (!visitor.checkInTime) return "pending";
    if (visitor.checkOutTime) return "checked_out";
    return "checked_in";
  };

  // Filter visitors
  const filteredVisitors = visitors.filter((v) => {
    // Search filter
    const matchesSearch = 
      v.visitor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitor?.phone?.includes(searchTerm);

    // Status filter
    const status = getVisitorStatus(v);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      if (!v.checkInTime) matchesDate = false;
      else {
      const checkIn = new Date(v.checkInTime);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (checkIn < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (checkIn > end) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Check-in Time", "Check-out Time", "Status"];
    const csvData = filteredVisitors.map((v) => [
      v.visitor?.name || "",
      v.visitor?.email || "",
      v.visitor?.phone || "",
      v.checkInTime ? format(new Date(v.checkInTime), "yyyy-MM-dd HH:mm") : "",
      v.checkOutTime ? format(new Date(v.checkOutTime), "yyyy-MM-dd HH:mm") : "",
      getVisitorStatus(v).replace("_", " "),
    ]);
    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitor-records-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("Visitor Records Report", 14, 20);
    
    // Report date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}`, 14, 28);
    
    // Summary
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const totalVisitors = filteredVisitors.length;
    const checkedIn = filteredVisitors.filter(v => getVisitorStatus(v) === "checked_in").length;
    const checkedOut = filteredVisitors.filter(v => getVisitorStatus(v) === "checked_out").length;
    const pending = filteredVisitors.filter(v => getVisitorStatus(v) === "pending").length;
    
    doc.text(`Total Visitors: ${totalVisitors}`, 14, 36);
    doc.text(`Checked In: ${checkedIn} | Checked Out: ${checkedOut} | Pending: ${pending}`, 14, 42);
    
    // Table data
    const tableData = filteredVisitors.map((v) => [
      v.visitor?.name || "N/A",
      v.visitor?.email || "N/A",
      v.visitor?.phone || "N/A",
      v.checkInTime ? format(new Date(v.checkInTime), "MMM dd, yyyy HH:mm") : "N/A",
      v.checkOutTime ? format(new Date(v.checkOutTime), "MMM dd, yyyy HH:mm") : "N/A",
      getVisitorStatus(v).replace("_", " ").toUpperCase(),
    ]);

    // Add table using autoTable
    autoTable(doc, {
      startY: 48,
      head: [["Name", "Email", "Phone", "Check-in Time", "Check-out Time", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { 
        fillColor: [37, 99, 235], 
        textColor: 255, 
        fontStyle: "bold",
        fontSize: 10
      },
      alternateRowStyles: { 
        fillColor: [245, 247, 250] 
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        overflow: "linebreak"
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 30 },
      },
      margin: { top: 48, left: 14, right: 14 },
    });

    // Save PDF
    doc.save(`visitor-records-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  // --------------------- CHART DATA ---------------------
  const computeDailyCounts = (list) => {
    const counts = {};
    (list || []).forEach((v) => {
      if (!v.checkInTime) return;
      const d = new Date(v.checkInTime);
      const key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, value]) => ({
        dateISO: iso,
        label: new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        value,
      }));
  };

  const chartData = computeDailyCounts(visitors);

  const checkedInCount = visitors.filter(v => getVisitorStatus(v) === "checked_in").length;
  const checkedOutCount = visitors.filter(v => getVisitorStatus(v) === "checked_out").length;
  const pendingCount = visitors.filter(v => getVisitorStatus(v) === "pending").length;

  const pieData = [
    { name: "Checked In", value: checkedInCount },
    { name: "Checked Out", value: checkedOutCount },
    { name: "Pending", value: pendingCount },
  ];
  const COLORS = ["#60a5fa", "#f87171", "#fbbf24"];

  // --------------------- EXTRA FEATURES ---------------------
  const DashboardExtras = ({ visitors }) => {
    const recentVisitors = visitors.slice(0, 5);
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-3">Recent Visitors</h3>
          <ul className="space-y-2 text-sm">
            {recentVisitors.map((v) => (
              <li key={v._id} className="flex justify-between border-b pb-1 text-gray-600">
                <span>{v.visitor?.name}</span>
                <span>{v.status === "checkedIn" ? "✅ In" : "❌ Out"}</span>
              </li>
            ))}
            {recentVisitors.length === 0 && <li className="text-gray-400">No recent visitors</li>}
          </ul>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-3">Today’s Visitors</h3>
          <p className="text-3xl font-bold text-blue-600">
            {visitors.filter(v => v.checkInTime && new Date(v.checkInTime).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>
    );
  };


  const ReportsExtras = () => {
    const handlePDF = () => {
      const content = filteredVisitors
        .map((v) => {
          const status = getVisitorStatus(v);
          return `${v.visitor?.name || "N/A"} | ${v.visitor?.email || "N/A"} | ${v.checkInTime ? format(new Date(v.checkInTime), "yyyy-MM-dd HH:mm") : "N/A"} | ${v.checkOutTime ? format(new Date(v.checkOutTime), "yyyy-MM-dd HH:mm") : "N/A"} | ${status}`;
        })
        .join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `visitors_report_${format(new Date(), "yyyy-MM-dd")}.txt`;
      link.click();
    };
    return (
      <button onClick={handlePDF} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium">
        📄 Download Report
      </button>
    );
  };

  const SystemSettings = () => {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState({
      // General Settings
      auto_checkout_hours: "24",
      require_approval: true,
      enable_notifications: true,
      
      // Branding
      organization_name: "VisitorPro",
      welcome_message: "Welcome to our facility",
      
      // Notifications
      email_notifications: true,
      sms_notifications: false,
      admin_notification_email: "",
      
      // Security
      enable_watchlist: true,
      enable_photo_capture: true,
      require_id_verification: true,
      
      // Modules
      enable_pre_registration: true,
      enable_qr_code: true,
      enable_visitor_badge: true,
      
      // Integration
      smtp_enabled: false,
      sms_provider: "none",
    });

    const { data: savedSettings = [] } = useQuery({
      queryKey: ["system-settings"],
      queryFn: async () => {
        try {
          const res = await API.get("/admin/settings");
          return res.data || [];
        } catch (err) {
          console.error("Failed to fetch settings:", err);
          return [];
        }
      },
    });

    useEffect(() => {
      if (savedSettings.length > 0) {
        const settingsObj = {};
        savedSettings.forEach(setting => {
          let value = setting.setting_value;
          if (setting.setting_type === "boolean") {
            value = value === "true" || value === true;
          }
          settingsObj[setting.setting_key] = value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    }, [savedSettings]);

    const saveSettingsMutation = useMutation({
      mutationFn: async (newSettings) => {
        const promises = Object.entries(newSettings).map(async ([key, value]) => {
          const existing = savedSettings.find(s => s.setting_key === key);
          const settingData = {
            setting_key: key,
            setting_value: String(value),
            setting_type: typeof value === "boolean" ? "boolean" : "text",
          };

          if (existing) {
            return API.put(`/admin/settings/${existing._id}`, settingData);
          } else {
            return API.post("/admin/settings", settingData);
          }
        });
        return Promise.all(promises);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["system-settings"]);
      },
    });

    const handleSave = () => {
      saveSettingsMutation.mutate(settings);
    };

    const handleChange = (key, value) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <span className="text-xl">⏰</span>
            <h3 className="text-xl font-bold">General Settings</h3>
          </div>
          <p className="text-gray-600 mb-6">Configure general system behavior</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="auto_checkout" className="block text-sm font-medium text-gray-700">
                Auto Check-out Time (hours)
              </label>
              <input
                id="auto_checkout"
                type="number"
                value={settings.auto_checkout_hours}
                onChange={(e) => handleChange("auto_checkout_hours", e.target.value)}
                placeholder="24"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                Automatically check out visitors after this many hours
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">
                Admin Notification Email
              </label>
              <input
                id="admin_email"
                type="email"
                value={settings.admin_notification_email}
                onChange={(e) => handleChange("admin_notification_email", e.target.value)}
                placeholder="admin@company.com"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                Email for important system notifications
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Require Approval</label>
                <p className="text-sm text-gray-500">All visitor invitations must be approved by admin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_approval}
                  onChange={(e) => handleChange("require_approval", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable Notifications</label>
                <p className="text-sm text-gray-500">Send notifications for visitor activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_notifications}
                  onChange={(e) => handleChange("enable_notifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <span className="text-xl">🎨</span>
            <h3 className="text-xl font-bold">Branding</h3>
          </div>
          <p className="text-gray-600 mb-6">Customize your organization's branding</p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="org_name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                id="org_name"
                value={settings.organization_name}
                onChange={(e) => handleChange("organization_name", e.target.value)}
                placeholder="Your Organization"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="welcome_msg" className="block text-sm font-medium text-gray-700">
                Welcome Message
              </label>
              <textarea
                id="welcome_msg"
                value={settings.welcome_message}
                onChange={(e) => handleChange("welcome_message", e.target.value)}
                placeholder="Welcome to our facility"
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">This message will be displayed to visitors</p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <span className="text-xl">🛡️</span>
            <h3 className="text-xl font-bold">Security Settings</h3>
          </div>
          <p className="text-gray-600 mb-6">Configure security and verification options</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable Watchlist</label>
                <p className="text-sm text-gray-500">Flag visitors on security watchlist</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_watchlist}
                  onChange={(e) => handleChange("enable_watchlist", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo Capture</label>
                <p className="text-sm text-gray-500">Capture visitor photos during check-in</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_photo_capture}
                  onChange={(e) => handleChange("enable_photo_capture", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Verification Required</label>
                <p className="text-sm text-gray-500">Require visitors to provide ID information</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_id_verification}
                  onChange={(e) => handleChange("require_id_verification", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Module Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <span className="text-xl">⚙️</span>
            <h3 className="text-xl font-bold">Module Management</h3>
          </div>
          <p className="text-gray-600 mb-6">Enable or disable system features</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pre-Registration</label>
                <p className="text-sm text-gray-500">Allow hosts to send visitor invitations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_pre_registration}
                  onChange={(e) => handleChange("enable_pre_registration", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">QR Code System</label>
                <p className="text-sm text-gray-500">Generate QR codes for approved visitors</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_qr_code}
                  onChange={(e) => handleChange("enable_qr_code", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visitor Badges</label>
                <p className="text-sm text-gray-500">Print visitor badge numbers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_visitor_badge}
                  onChange={(e) => handleChange("enable_visitor_badge", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <span className="text-xl">🔔</span>
            <h3 className="text-xl font-bold">Notification Settings</h3>
          </div>
          <p className="text-gray-600 mb-6">Configure notification preferences</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleChange("email_notifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-sm text-gray-500">Send notifications via SMS (requires configuration)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sms_notifications}
                  onChange={(e) => handleChange("sms_notifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <span className="text-xl">☁️</span>
            <h3 className="text-xl font-bold">Integration Settings</h3>
          </div>
          <p className="text-gray-600 mb-6">Configure external service integrations</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMTP Email Service</label>
                <p className="text-sm text-gray-500">Enable custom SMTP for email delivery</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smtp_enabled}
                  onChange={(e) => handleChange("smtp_enabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="sms_provider" className="block text-sm font-medium text-gray-700">
                SMS Provider
        </label>
              <select
                id="sms_provider"
                value={settings.sms_provider}
                onChange={(e) => handleChange("sms_provider", e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="twilio">Twilio</option>
                <option value="aws_sns">AWS SNS</option>
                <option value="nexmo">Nexmo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveSettingsMutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span>💾</span>
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {saveSettingsMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✓ Settings saved successfully</p>
          </div>
        )}
      </div>
    );
  };

  // --------------------- RENDER ---------------------
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6 font-bold text-xl border-b">Admin Panel</div>
        <nav className="p-4 space-y-4 text-gray-700">
          { ["dashboard", "visitors", "pre-registration", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition ${activeTab === tab ? "font-semibold text-blue-600 bg-blue-50" : ""}`}
            >
              {tab === "pre-registration" ? (
                <div className="flex justify-between items-center">
                  <span>Pre-Registration</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">{registrations.filter(r => r.status === "pending").length}</span>
                </div>
              ) : (tab.charAt(0).toUpperCase() + tab.slice(1))}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <Navbar />
        <div className="p-6">

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">Overview of system</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <p className="text-gray-600">Total Visitors</p>
                  <h3 className="text-2xl font-bold text-blue-600">{visitors.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <p className="text-gray-600">Checked In</p>
                  <h3 className="text-2xl font-bold text-green-600">{checkedInCount}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <p className="text-gray-600">Checked Out</p>
                  <h3 className="text-2xl font-bold text-red-600">{checkedOutCount}</h3>
                </div>
              </div>
              <DashboardExtras visitors={visitors} />

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <h3 className="font-semibold mb-3">Visitors Trend (Bar)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <ReBarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#2563eb" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <h3 className="font-semibold mb-3">Visitors Trend (Line)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <h3 className="font-semibold mb-3">Visitor Status (Pie)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                  <h3 className="font-semibold mb-3">Visitor Status (Donut)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#82ca9d"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Visitors Tab */}
          {activeTab === "visitors" && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Visitor Records</h2>
                  <p className="text-gray-600 mt-1">View and manage all visitor entries</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={exportToCSV}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <span>📥</span>
                    Export CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <span>📄</span>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Search and Filter Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="search"
                      placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-48"
                  >
                    <option value="all">All Status</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="pending">Pending</option>
                  </select>
              </div>

                {/* Date Filters */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 font-medium">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 font-medium">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSearchTerm("");
                      setStatusFilter("all");
                  }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                >
                    Reset Filters
                </button>
                </div>
              </div>

              {/* Visitor Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                  <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Visitor</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Check-in Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Check-out Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {visitorsLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                          </tr>
                        ))
                      ) : filteredVisitors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-500">
                            No visitors found
                          </td>
                        </tr>
                      ) : (
                        filteredVisitors.map((v) => {
                          const status = getVisitorStatus(v);
                          const statusColors = {
                            checked_in: "bg-green-100 text-green-800 border-green-200",
                            checked_out: "bg-gray-100 text-gray-800 border-gray-200",
                            pending: "bg-orange-100 text-orange-800 border-orange-200",
                          };
                          return (
                            <tr key={v._id} className="border-b hover:bg-gray-50 transition">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{v.visitor?.name || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-gray-900">{v.visitor?.email || "-"}</div>
                                  {v.visitor?.phone && (
                                    <div className="text-gray-500 text-xs mt-1">{v.visitor.phone}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {v.checkInTime ? format(new Date(v.checkInTime), "MMM dd, yyyy HH:mm") : "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {v.checkOutTime ? format(new Date(v.checkOutTime), "MMM dd, yyyy HH:mm") : "-"}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
                                  {status.replace("_", " ").toUpperCase()}
                                </span>
                        </td>
                              <td className="px-6 py-4">
                                {status === "checked_in" && (
                            <button
                              onClick={() => handleForceCheckout(v._id)}
                                    disabled={forceCheckoutMutation.isPending}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                    {forceCheckoutMutation.isPending ? "Processing..." : "Force Checkout"}
                            </button>
                          )}
                        </td>
                      </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </>
          )}

       

          {/* Settings Tab */}
          {activeTab === "pre-registration" && (
            <>
              <PreRegistration />
            </>
          )}

          {activeTab === "settings" && (
            <>
              <h2 className="text-3xl font-bold mb-2">System Settings</h2>
              <p className="text-gray-600 mb-6">Configure system preferences and integrations</p>
              <SystemSettings />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

