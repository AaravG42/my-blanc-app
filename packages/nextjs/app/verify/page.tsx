"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { QRScanner } from "~~/components/QRScanner";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function VerifyInteraction() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "BlancInteractions",
  });

  const [interactionId, setInteractionId] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const idFromQuery = searchParams?.get("id");

  useEffect(() => {
    if (idFromQuery) {
      setInteractionId(parseInt(idFromQuery));
    }
  }, [idFromQuery]);

  const { data: interaction } = useScaffoldReadContract({
    contractName: "BlancInteractions",
    functionName: "getInteraction",
    args: interactionId ? [BigInt(interactionId)] : undefined,
  });

  const handleScanSuccess = (decodedText: string) => {
    const url = new URL(decodedText);
    const id = url.searchParams.get("id");
    if (id) {
      setInteractionId(parseInt(id));
      setShowScanner(false);
    }
  };

  const handleVerify = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!interactionId) {
      toast.error("Invalid interaction ID");
      return;
    }

    try {
      toast.loading("Verifying interaction...");
      await writeContractAsync({
        functionName: "verifyInteraction",
        args: [BigInt(interactionId)],
      });

      toast.success("Interaction verified successfully!");
      router.push(`/interaction/${interactionId}`);
    } catch (error) {
      console.error("Error verifying interaction:", error);
      toast.error("Failed to verify interaction");
    }
  };

  if (!interaction) {
    return (
      <div className="container mx-auto p-4">
        {!interactionId ? (
          <div>
            <h1 className="text-3xl font-bold mb-6">Verify Interaction</h1>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <p className="mb-4">Scan a QR code to verify an interaction</p>
                {showScanner ? (
                  <QRScanner onScanSuccess={handleScanSuccess} />
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
                    Start Scanner
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-error">
            <span>Interaction not found</span>
          </div>
        )}
      </div>
    );
  }

  const [id, initiator, , , caption, timestamp, verified] = interaction as any;

  if (verified) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Interaction Already Verified</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="alert alert-success">
              <span>This interaction has already been verified</span>
            </div>
            <div className="card-actions">
              <Link href={`/interaction/${id}`} className="btn btn-primary">
                View Interaction
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (initiator && (initiator as string).toLowerCase() === address?.toLowerCase()) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Cannot Verify</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="alert alert-warning">
              <span>You cannot verify your own interaction</span>
            </div>
            <div className="card-actions">
              <Link href={`/interaction/${id}`} className="btn btn-primary">
                View Interaction
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Verify Interaction</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Verify this interaction?</h2>
          <div className="divider"></div>

          <div className="space-y-3">
            <div>
              <span className="font-semibold">Initiator:</span>
              <Address address={initiator as string} />
            </div>
            <div>
              <span className="font-semibold">Caption:</span>
              <p>{caption as string}</p>
            </div>
            <div>
              <span className="font-semibold">Date:</span>
              <p>{new Date(Number(timestamp) * 1000).toLocaleString()}</p>
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <Link href="/" className="btn btn-outline">
              Cancel
            </Link>
            <button className="btn btn-primary" onClick={handleVerify} disabled={isPending || !isConnected}>
              {isPending ? "Verifying..." : "Verify Interaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
