import React from "react";
import QRScanner from "../components/QRScanner";

const ScanQRPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      <QRScanner />
    </div>
  );
};

export default ScanQRPage;
