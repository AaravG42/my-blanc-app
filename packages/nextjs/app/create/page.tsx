"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress, parseEther } from "viem";
import { useAccount } from "wagmi";
import { QRCodeGenerator } from "~~/components/QRCodeGenerator";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useIPFSUpload } from "~~/hooks/useIPFSUpload";
import { mockSessionStore } from "~~/utils/mockSessionStore";

export default function CreatePage() {
  const router = useRouter();
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [enablePayment, setEnablePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "BlancPosts" });
  const { writeContractAsync: writePaymentAsync } = useScaffoldWriteContract({ contractName: "BlancPayments" });
  const { uploadToIPFS } = useIPFSUpload();

  const generateSessionId = async () => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);
    if (address) {
      await mockSessionStore.createSession(id, address);
      console.log("Generated session:", id);
    }
    return id;
  };

  useEffect(() => {
    if (showQRCode && sessionId) {
      // Subscribe to session updates
      const unsubscribe = mockSessionStore.subscribe(sessionId, sessionData => {
        console.log("Session updated:", sessionData);
        setParticipants(sessionData.participants);
      });

      // Polling is handled automatically by the store

      return () => {
        unsubscribe();
      };
    }
  }, [showQRCode, sessionId]);

  // Polling is handled automatically by the store

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addParticipant = async () => {
    if (newParticipant && !participants.includes(newParticipant)) {
      setNewParticipant("");
      if (sessionId) {
        await mockSessionStore.addParticipant(sessionId, newParticipant);
      }
    }
  };

  const removeParticipant = (address: string) => {
    // In mock implementation, we'll just update local state
    // In real app, this would update the backend/smart contract
    const updated = participants.filter(p => p !== address);
    setParticipants(updated);
  };

  const handleCreatePost = async () => {
    if (!selectedFile) {
      alert("Please select an image or video");
      return;
    }

    try {
      setIsUploading(true);

      const ipfsHash = await uploadToIPFS(selectedFile);

      if (!ipfsHash) {
        throw new Error("Failed to upload to IPFS");
      }

      if (enablePayment && paymentAmount && participants.length > 0) {
        const percentagePerPerson = Math.floor(10000 / participants.length);
        const percentages = participants.map(() => BigInt(percentagePerPerson));

        await writePaymentAsync({
          functionName: "createPaymentSplit",
          args: [BigInt(1), participants as `0x${string}`[], percentages],
          value: parseEther(paymentAmount),
        });
      }

      const tx = await writeContractAsync({
        functionName: "createPost",
        args: [participants as `0x${string}`[], ipfsHash, caption, isPublic],
      });

      alert("Post created successfully!");
      router.push("/feed");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-base-200">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
              ← Back
            </button>
            <h1 className="text-xl font-bold">Create Post</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-2xl">
        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-base-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg mb-2">Tap to select media</p>
            <p className="text-sm text-base-content/60">Photo or video</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
              >
                ✕
              </button>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Caption:</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24 resize-none"
                    placeholder="Write something..."
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                  />
                </div>

                <div className="divider my-2"></div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Tag Participants:</span>
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <AddressInput
                        value={newParticipant}
                        onChange={setNewParticipant}
                        placeholder="+ Add by address"
                      />
                      <button className="btn btn-primary btn-sm" onClick={addParticipant}>
                        Add
                      </button>
                    </div>
                    <button
                      className="btn btn-outline btn-sm w-full"
                      onClick={() => {
                        if (!showQRCode) {
                          generateSessionId();
                        }
                        setShowQRCode(!showQRCode);
                      }}
                    >
                      📱 {showQRCode ? "Hide QR Code" : "Generate QR Code for Tagging"}
                    </button>
                    {showQRCode && sessionId && (
                      <div className="mt-4 p-4 bg-white rounded-lg flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm font-semibold text-gray-700">
                            QR Code Active - Others can scan to join
                          </p>
                        </div>
                        <QRCodeGenerator interactionId={sessionId} size={200} />
                        <p className="text-xs text-gray-500 mt-2 text-center">Participants: {participants.length}</p>
                        <p className="text-xs text-gray-400 mt-1 text-center font-mono">QR: {sessionId}</p>
                        {participants.length > 0 && (
                          <div className="mt-3 w-full">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Scanned:</p>
                            <div className="space-y-1">
                              {participants.map(p => (
                                <div
                                  key={p}
                                  className="text-xs bg-success/20 text-success px-2 py-1 rounded flex items-center gap-2"
                                >
                                  ✓ {p.slice(0, 6)}...{p.slice(-4)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {participants.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {participants.map(p => (
                        <div key={p} className="badge badge-lg badge-primary gap-2 py-3">
                          @{p.slice(0, 4)}...{p.slice(-4)}
                          <button onClick={() => removeParticipant(p)} className="hover:text-error">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="divider my-2"></div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <span className="label-text font-semibold">Privacy:</span>
                    <select
                      className="select select-bordered select-sm"
                      value={isPublic ? "public" : "private"}
                      onChange={e => setIsPublic(e.target.value === "public")}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </label>
                </div>

                {participants.length > 0 && (
                  <>
                    <div className="divider my-2"></div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-4">
                        <span className="label-text font-semibold">Payment Split:</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={enablePayment}
                          onChange={e => setEnablePayment(e.target.checked)}
                        />
                        <span className="label-text text-xs">{enablePayment ? "Enabled" : "Disabled"}</span>
                      </label>
                    </div>

                    {enablePayment && (
                      <div className="form-control bg-base-200 p-4 rounded-lg">
                        <label className="label">
                          <span className="label-text font-semibold">Total Amount (ETH)</span>
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.1"
                          className="input input-bordered"
                          value={paymentAmount}
                          onChange={e => setPaymentAmount(e.target.value)}
                        />
                        <label className="label">
                          <span className="label-text-alt text-info">
                            💡 Split equally among {participants.length} participant{participants.length > 1 ? "s" : ""}
                          </span>
                        </label>
                      </div>
                    )}
                  </>
                )}

                <div className="divider my-2"></div>

                <button
                  className={`btn btn-primary btn-lg w-full ${isUploading ? "loading" : ""}`}
                  onClick={handleCreatePost}
                  disabled={isUploading}
                >
                  {isUploading ? "Creating Post..." : "Create Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
