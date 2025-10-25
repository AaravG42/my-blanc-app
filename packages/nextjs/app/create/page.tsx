"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { QRCodeGenerator } from "~~/components/QRCodeGenerator";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useIPFSUpload } from "~~/hooks/useIPFSUpload";

export default function CreateInteraction() {
  const { isConnected } = useAccount();
  const { uploadToIPFS, isUploading } = useIPFSUpload();
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "BlancInteractions",
  });

  const { data: interactionCounter, refetch: refetchCounter } = useScaffoldReadContract({
    contractName: "BlancInteractions",
    functionName: "getInteractionCounter",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [pendingInteractionId, setPendingInteractionId] = useState<number | null>(null);
  const [step, setStep] = useState<"upload" | "qr" | "verifying" | "complete">("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCreateInteraction = async () => {
    if (!selectedFile || !caption.trim()) {
      toast.error("Please select a file and enter a caption");
      return;
    }

    try {
      const currentCounter = interactionCounter ? Number(interactionCounter) : 0;

      toast.loading("Uploading to IPFS...");
      const ipfsHashResult = await uploadToIPFS(selectedFile!);

      toast.loading("Creating interaction on blockchain...");

      await writeContractAsync({
        functionName: "createInteraction",
        args: [ipfsHashResult, caption],
      });

      toast.dismiss();
      toast.success("Transaction confirmed!");

      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: newCounterData } = await refetchCounter();
      const newCounter = newCounterData ? Number(newCounterData) : currentCounter + 1;

      if (newCounter > currentCounter) {
        setPendingInteractionId(newCounter);
        setStep("qr");
        toast.success("Interaction created! Show the QR code to verify.");
      } else {
        toast.success("Interaction created! Check your profile to see it.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating interaction:", error);
      toast.error("Failed to create interaction");
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-warning">
          <span>Please connect your wallet to create an interaction</span>
        </div>
      </div>
    );
  }

  if (step === "qr" && pendingInteractionId) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Show QR Code to Verify</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="alert alert-info mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Ask the other person to scan this QR code with their phone</span>
            </div>
            <div className="flex justify-center py-6">
              <QRCodeGenerator interactionId={pendingInteractionId} />
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Waiting for verification...</p>
              <p className="text-xs text-gray-400 mt-2">The interaction will be created on blockchain once verified</p>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setStep("upload");
                  setPendingInteractionId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Interaction Complete! ✅</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="alert alert-success">
              <span>Interaction has been verified and created on the blockchain!</span>
            </div>
            <div className="card-actions justify-end">
              <Link href="/" className="btn btn-primary">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Interaction</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload Photo or Video</h2>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Select File</span>
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />
            {selectedFile && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Caption</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Describe this moment..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={handleCreateInteraction}
              disabled={isUploading || isPending || !selectedFile || !caption.trim()}
            >
              {isUploading ? "Uploading..." : isPending ? "Creating..." : "Create & Generate QR Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
