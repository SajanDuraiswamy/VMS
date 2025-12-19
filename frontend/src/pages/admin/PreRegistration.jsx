import React, { useState } from "react";
import API from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Use simple HTML + Tailwind for layout to match AdminDashboard
import { Check, X, QrCode, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import QRCodeDialog from "../../components/invitations/QRCodeDialog";

export default function PreRegistration() {
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
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

  // Show pending registrations for admin approval (includes walk_in and pre_registered)
  const pendingRegistrations = invitations.filter((i) => i.status === "pending");

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      return API.put(`/visitor/registration/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["registrations"]);
      queryClient.invalidateQueries(["visitors"]);
    },
  });

  const handleApprove = async (registration) => {
    try {
      await updateStatus.mutateAsync({ id: registration._id, status: "approved" });
      // Optionally send email / generate QR code on the server side if implemented
      console.log("Registration approved");
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  const handleReject = async (registration) => {
    try {
      await updateStatus.mutateAsync({ id: registration._id, status: "rejected" });
      console.log("Registration rejected");
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  const statusColors = {
    pending: "bg-orange-100 text-orange-800 border-orange-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Registration</h1>
          <p className="text-gray-600 mt-1">Manage visitor pre-registrations and approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-white rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{pendingRegistrations.length}</p>
                </div>
                <Clock className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </div>
          </div>

          <div className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{invitations.filter(i => i.status === "approved").length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          <div className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-white rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{invitations.filter(i => i.status === "rejected").length}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        <div className="shadow-lg border-0 bg-white rounded-2xl">
          <div className="border-b bg-white p-6 rounded-t-2xl">
            <h3 className="text-lg font-semibold">Pending Registrations</h3>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Visitor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Host</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Visit Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Purpose</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div></td>
                          <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                        </tr>
                      ))
                    ) : pendingRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">No pending registrations yet</td>
                      </tr>
                    ) : (
                    pendingRegistrations.map((inv) => {
                      const StatusIcon = statusIcons[inv.status];
                      return (
                        <tr key={inv._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{inv.visitor_name}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div>{inv.visitor_mobile || inv.visitor_phone || "-"}</div>
                              {inv.visitor_email && <div className="text-gray-500 text-xs">{inv.visitor_email}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{inv.host_email}</td>
                          <td className="px-6 py-4">{inv.scheduled_date_time ? format(new Date(inv.scheduled_date_time), "MMM dd, yyyy") : "-"}</td>
                          <td className="px-6 py-4 capitalize">{inv.purpose?.replace(/_/g, " ")}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[inv.status] || "bg-gray-100 text-gray-800"}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {inv.status === "pending" && (
                                <>
                                  <button onClick={() => handleApprove(inv)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                                    <Check className="w-3 h-3 mr-1 inline-block" /> Approve
                                  </button>
                                  <button onClick={() => handleReject(inv)} className="border border-red-600 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                                    <X className="w-3 h-3 mr-1 inline-block" /> Reject
                                  </button>
                                </>
                              )}

                              {inv.status === "approved" && inv.invite_code && (
                                <button onClick={() => { setSelectedInvitation(inv); setShowQRCode(true); }} className="border text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                  <QrCode className="w-3 h-3 mr-1 inline-block" /> QR Code
                                </button>
                              )}
                              {inv.status === "approved" && inv.epass_pdf && (
                                <a href={`http://localhost:8000/tmp/${inv.epass_pdf}`} target="_blank" rel="noreferrer" className="border text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                  E-Pass
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showQRCode && selectedInvitation && (
        <QRCodeDialog
          code={selectedInvitation.invite_code}
          visitData={selectedInvitation}
          open={showQRCode}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
}
