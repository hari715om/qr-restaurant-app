import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { ClipLoader } from "react-spinners";

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setLoading(true);
          setError("");
          setTimeout(() => {
            onScan(result.data);
            setLoading(false);
          }, 1000);
        },
        {
          onDecodeError: () => {
            setError("Unable to read QR code. Ensure it's well-lit and centered.");
          },
          highlightScanRegion: true,
        }
      );

      qrScanner.start();
      setScanner(qrScanner);

      return () => qrScanner.stop();
    }
  }, [onScan]);

  const retryScan = () => {
    setError("");
    setLoading(false);
    scanner?.start();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">Scan the QR code on your table to view the menu</h2>

      {/* Camera Feed */}
      <video ref={videoRef} className="border-2 border-gray-400 rounded-lg w-72 h-72 mb-4"></video>

      {/* Loading State */}
      {loading && <ClipLoader size={30} color={"#2563EB"} />}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-red-500">
          <p>{error}</p>
          <button
            onClick={retryScan}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
