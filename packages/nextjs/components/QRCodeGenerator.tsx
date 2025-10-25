"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeGeneratorProps {
  interactionId: number | string;
  size?: number;
}

export const QRCodeGenerator = ({ interactionId, size = 256 }: QRCodeGeneratorProps) => {
  const isAddress = typeof interactionId === "string" && interactionId.startsWith("0x");
  const isSession = typeof interactionId === "string" && interactionId.startsWith("session_");
  const isPostId =
    typeof interactionId === "number" || (typeof interactionId === "string" && /^\d+$/.test(interactionId));

  let qrData: string;
  if (isAddress) {
    qrData = interactionId;
  } else if (isSession) {
    qrData = interactionId;
  } else if (isPostId) {
    qrData = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?id=${interactionId}`;
  } else {
    qrData = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?id=${interactionId}`;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG value={qrData} size={size} />
      {isPostId && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Scan this QR code to verify</p>
          <p className="text-xs text-gray-400 mt-1">Post ID: {interactionId}</p>
        </div>
      )}
      {isSession && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Scan this QR code to join</p>
          <p className="text-xs text-gray-400 mt-1">Session: {interactionId}</p>
        </div>
      )}
    </div>
  );
};
