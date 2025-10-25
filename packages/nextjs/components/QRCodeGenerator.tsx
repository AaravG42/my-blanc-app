"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeGeneratorProps {
  interactionId: number;
  size?: number;
}

export const QRCodeGenerator = ({ interactionId, size = 256 }: QRCodeGeneratorProps) => {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrData = `${appUrl}/verify?id=${interactionId}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG value={qrData} size={size} />
      <div className="text-center">
        <p className="text-sm text-gray-600">Scan this QR code to verify</p>
        <p className="text-xs text-gray-400 mt-1">Interaction ID: {interactionId}</p>
      </div>
    </div>
  );
};
