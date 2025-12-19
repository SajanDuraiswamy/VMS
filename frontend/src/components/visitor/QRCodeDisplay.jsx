import { QRCodeSVG } from "qrcode.react";
import { Download, Calendar, User, Mail, Phone, Building2, Clock } from "lucide-react";
import { format } from "date-fns";

const QRCodeDisplay = ({ code, visitData }) => {
  const handleDownload = () => {
    const svg = document.getElementById("qrcode-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-${code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 shadow-xl p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your QR Code</h3>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
              <QRCodeSVG
                id="qrcode-svg"
                value={code}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 mt-4 font-mono font-bold">{code}</p>
            <button
              onClick={handleDownload}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        </div>

        {/* Visit Details Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Details</h3>
          <div className="space-y-3">
            {visitData?.visitor_name && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Visitor Name</p>
                  <p className="font-semibold text-gray-900">{visitData.visitor_name}</p>
                </div>
              </div>
            )}
            
            {visitData?.visitor_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{visitData.visitor_email}</p>
                </div>
              </div>
            )}
            
            {visitData?.visitor_mobile && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="font-semibold text-gray-900">{visitData.visitor_mobile}</p>
                </div>
              </div>
            )}
            
            {visitData?.scheduled_date_time && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(visitData.scheduled_date_time), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
            )}
            
            {visitData?.whom_to_meet && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Meeting With</p>
                  <p className="font-semibold text-gray-900">{visitData.whom_to_meet}</p>
                </div>
              </div>
            )}
            
            {visitData?.purpose && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Purpose</p>
                  <p className="font-semibold text-gray-900 capitalize">{visitData.purpose.replace("_", " ")}</p>
                </div>
              </div>
            )}
            
            {visitData?.expected_duration_minutes && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Expected Duration</p>
                  <p className="font-semibold text-gray-900">{visitData.expected_duration_minutes} minutes</p>
                </div>
              </div>
            )}
            
            {visitData?.status && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  visitData.status === "approved" ? "bg-green-100 text-green-800" :
                  visitData.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  visitData.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {visitData.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;





