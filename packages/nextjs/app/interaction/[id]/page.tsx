"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function InteractionDetailPage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const [tipAmount, setTipAmount] = useState("0");

  const id = BigInt(params?.id as string);

  const { data: interaction, refetch } = useScaffoldReadContract({
    contractName: "BlancInteractions",
    functionName: "getInteraction",
    args: [id],
  });

  const { writeContractAsync: tipContractAsync, isPending: isTipping } = useScaffoldWriteContract({
    contractName: "BlancInteractions",
  });

  if (!interaction) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>Interaction not found</span>
        </div>
      </div>
    );
  }

  const [interactionId, initiator, verifier, ipfsHash, caption, timestamp, verified, totalTipAmount] =
    interaction as any;

  const handleTip = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (parseFloat(tipAmount) <= 0) {
      toast.error("Please enter a valid tip amount");
      return;
    }

    try {
      toast.loading("Sending tip...");
      await tipContractAsync({
        functionName: "tipInteraction",
        args: [id],
        value: parseEther(tipAmount),
      });

      toast.success("Tip sent successfully!");
      refetch();
      setTipAmount("0");
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href="/" className="btn btn-ghost mb-4">
        ← Back
      </Link>

      <div className="card bg-base-100 shadow-xl">
        <figure>
          {ipfsHash ? (
            <img
              src={`https://gateway.pinata.cloud/ipfs/${(ipfsHash as string).replace("ipfs://", "")}`}
              alt={caption as string}
              className="w-full max-h-96 object-contain bg-gray-100"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-6xl">📸</span>
            </div>
          )}
        </figure>

        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Interaction #{Number(interactionId)}</h1>
            {verified && <div className="badge badge-success badge-lg">Verified</div>}
          </div>

          <p className="text-lg mb-6">{caption as string}</p>

          <div className="divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className="font-semibold text-gray-600">Initiator:</span>
              <Address address={initiator as string} />
            </div>
            {verified && (
              <div>
                <span className="font-semibold text-gray-600">Verified by:</span>
                <Address address={verifier as string} />
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-600">Date:</span>
              <p>{new Date(Number(timestamp) * 1000).toLocaleString()}</p>
            </div>
            {totalTipAmount > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Total Tips:</span>
                <p>{formatEther(totalTipAmount as bigint)} ETH</p>
              </div>
            )}
          </div>

          <div className="divider"></div>

          {verified && (
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Send a Tip</h3>
              <div className="flex gap-2">
                <EtherInput value={tipAmount} onChange={val => setTipAmount(val)} placeholder="0.0" />
                <button
                  className="btn btn-primary"
                  onClick={handleTip}
                  disabled={isTipping || !isConnected || parseFloat(tipAmount) <= 0}
                >
                  {isTipping ? "Tipping..." : "Send Tip"}
                </button>
              </div>
              {!isConnected && <p className="text-sm text-gray-600 mt-2">Connect your wallet to send a tip</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
