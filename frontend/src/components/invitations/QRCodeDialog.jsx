import React from "react";
import QRCodeDisplay from "../visitor/QRCodeDisplay";

const QRCodeDialog = ({ open, onClose, code, visitData }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl p-4 shadow-lg max-w-3xl w-full z-10">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>
        <div className="mt-2">
          <QRCodeDisplay code={code} visitData={visitData} />
        </div>
      </div>
    </div>
  );
};

export default QRCodeDialog;
