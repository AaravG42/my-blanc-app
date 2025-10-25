"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export const QRScanner = ({ onScanSuccess, onError }: QRScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current?.clear();
          })
          .catch(err => {
            console.error("Error stopping scanner:", err);
          });
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("scanner");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        decodedText => {
          onScanSuccess(decodedText);
        },
        () => {},
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start scanner";
      onError?.(errorMsg);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="scanner" ref={scannerRef} className="w-full max-w-md" />
      <div className="flex gap-2">
        {!isScanning ? (
          <button className="btn btn-primary" onClick={startScanning}>
            Start Scanner
          </button>
        ) : (
          <button className="btn btn-error" onClick={stopScanning}>
            Stop Scanner
          </button>
        )}
      </div>
    </div>
  );
};
