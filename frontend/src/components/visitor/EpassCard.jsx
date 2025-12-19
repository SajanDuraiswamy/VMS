import React from "react";
import { QRCodeSVG } from "qrcode.react";

const EpassCard = ({ registration }) => {
  if (!registration) return null;
  const { visitor_name, visitor_email, visitor_mobile, epass_id, epass_pdf } = registration;
  const epassId = epass_id || registration._id;
  const link = `${window.location.origin}/epass/${epassId}`;

  return (
    <div className="bg-white rounded-2xl w-[360px] h-[520px] shadow-lg mx-auto border border-gray-200 printable-epass">
      <div className="p-6 flex flex-col items-center h-full">
        <div className="flex justify-center mb-2">
          <QRCodeSVG value={link} size={160} level="H" includeMargin />
        </div>

        <div className="mt-2 text-center font-semibold">St.Joseph's Group of Institutions</div>

        <div className="mt-2 text-center font-mono text-sm tracking-wide">EPASS ID: <strong>{epassId}</strong></div>

        <div className="mt-4 text-sm text-center w-full">
          <div className="text-xs text-gray-500">Name :</div>
          <div className="font-medium">{visitor_name}</div>
          <div className="text-xs text-gray-500 mt-2">Email Id :</div>
          <div className="font-medium break-words max-w-[300px] mx-auto">{visitor_email}</div>
          <div className="text-xs text-gray-500 mt-2">Phone :</div>
          <div className="font-medium">{visitor_mobile}</div>
        </div>

        <div className="mt-6 flex gap-3 justify-center w-full">
          {epass_pdf && (
            <a className="bg-blue-600 text-white px-4 py-2 rounded" href={`http://localhost:8000/tmp/${epass_pdf}`} target="_blank" rel="noreferrer">Download E-pass</a>
          )}
          <button onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded">Print</button>
        </div>

        {/* logo was moved above QR; keep this element removed */}
      </div>
    </div>
  );
};

export default EpassCard;
