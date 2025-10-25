"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { QRScanner } from "~~/components/QRScanner";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { mockSessionStore } from "~~/utils/mockSessionStore";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const initialId = searchParams?.get("id");

  const [scannedData, setScannedData] = useState<string | null>(initialId);
  const [scannedType, setScannedType] = useState<"post" | "session" | null>(
    initialId?.startsWith("session_") ? "session" : initialId ? "post" : null,
  );
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "BlancPosts",
  });

  const { data: post } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getPost",
    args: scannedData && scannedType === "post" ? [BigInt(scannedData)] : undefined,
  });

  useEffect(() => {
    if (initialId) {
      console.log("Initial ID from URL:", initialId);
      if (initialId.startsWith("session_")) {
        console.log("Auto-joining session from URL");
        handleSessionJoin(initialId);
      } else if (initialId.startsWith("0x")) {
        console.log("Auto-joining with address from URL");
        handleSessionJoin(initialId);
      }
    }
  }, [initialId]);

  const handleScanSuccess = (data: string) => {
    console.log("Scanned data:", data);

    if (data.startsWith("session_")) {
      console.log("Detected session ID");
      setScannedData(data);
      setScannedType("session");
      setError("");
      handleSessionJoin(data);
    } else if (data.startsWith("0x")) {
      console.log("Detected address");
      // Handle direct address scan (for adding as participant)
      setScannedData(data);
      setScannedType("session");
      setError("");
      handleSessionJoin(data); // Treat address as a participant to add
    } else {
      try {
        const url = new URL(data);
        const id = url.searchParams.get("id");
        console.log("URL detected, id:", id);
        if (id) {
          if (id.startsWith("session_")) {
            console.log("Session ID from URL");
            setScannedData(id);
            setScannedType("session");
            setError("");
            handleSessionJoin(id);
          } else {
            console.log("Post ID detected");
            setScannedData(id);
            setScannedType("post");
            setError("");
          }
        } else {
          setError("Invalid QR code");
        }
      } catch {
        setError("Invalid QR code format");
      }
    }
  };

  const handleSessionJoin = async (scannedData: string) => {
    console.log("Joining with scanned data:", scannedData, "user address:", address);

    // For testing: generate a temporary address if wallet not connected
    let participantAddress = address;
    if (!participantAddress) {
      // Generate a temporary address for testing
      participantAddress = `0x${Math.random().toString(16).substring(2, 42).padEnd(40, "0")}`;
      console.log("Generated temporary address for testing:", participantAddress);
    }

    if (scannedData.startsWith("session_")) {
      // Scanned a session ID - add current user to that session
      const session = await mockSessionStore.getSession(scannedData);
      console.log("Found session:", session);

      if (!session) {
        setError("Session not found or expired");
        return;
      }

      const success = await mockSessionStore.addParticipant(scannedData, participantAddress);
      if (success) {
        console.log("Successfully joined session");
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/feed");
        }, 2000);
      } else {
        setError("You've already joined this session");
      }
    } else if (scannedData.startsWith("0x")) {
      // This would be for scanning someone's profile QR
      // Not implemented in current flow
      setError("Profile scanning not implemented yet");
    } else {
      setError("Invalid QR code format");
    }
  };

  const handleVerify = async () => {
    if (!scannedData) return;

    try {
      setIsVerifying(true);
      await writeContractAsync({
        functionName: "verifyPost",
        args: [BigInt(scannedData)],
      });
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/feed");
      }, 2000);
    } catch (error) {
      console.error("Error verifying:", error);
      setError("Failed to verify post. Make sure you're a participant.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="card-title text-success">{scannedType === "session" ? "Joined!" : "Verified!"}</h2>
            <p>
              {scannedData?.startsWith("session_")
                ? "You've joined the post creation"
                : scannedData?.startsWith("0x")
                  ? "Address added as participant"
                  : "Post verified successfully"}
            </p>
            <p className="text-sm text-base-content/60">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-base-200">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
              ← Back
            </button>
            <h1 className="text-xl font-bold">Verify Post</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        {!scannedData || scannedType === "session" ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Scan QR Code</h2>
              <p className="text-sm text-base-content/70 mb-4">Scan to join a post creation or verify a post</p>
              <QRScanner onScanSuccess={handleScanSuccess} onError={setError} />
              {error && (
                <div className="alert alert-error mt-4">
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        ) : scannedType === "post" ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Confirm Verification</h2>
              {post && (
                <div className="space-y-4">
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-base-200">
                    <img
                      src={
                        post[3].startsWith("ipfs://")
                          ? post[3].replace("ipfs://", "https://ipfs.io/ipfs/")
                          : `https://ipfs.io/ipfs/${post[3]}`
                      }
                      alt="Post preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = "/placeholder-image.png";
                      }}
                    />
                  </div>
                  <p className="text-sm">{post[4]}</p>
                  <div className="text-xs text-base-content/60">
                    <p>Post ID: {scannedData}</p>
                    <p>Creator: {post[1].slice(0, 10)}...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-ghost" onClick={() => setScannedData(null)}>
                  Cancel
                </button>
                <button
                  className={`btn btn-primary ${isVerifying ? "loading" : ""}`}
                  onClick={handleVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify Post"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
