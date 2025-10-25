"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { InteractionStats } from "~~/components/InteractionStats";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address } = useAccount();

  const { data: interactionCounter } = useScaffoldReadContract({
    contractName: "BlancInteractions",
    functionName: "getInteractionCounter",
  });

  const totalInteractions = interactionCounter ? Number(interactionCounter) : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="hero bg-base-200 rounded-lg mb-8">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-4">Blanc</h1>
            <p className="mb-6 text-lg">Capture and verify real-world moments with strangers</p>
            <div className="flex gap-4 justify-center">
              <Link href="/create" className="btn btn-primary">
                Create Interaction
              </Link>
              <Link href="/verify" className="btn btn-outline">
                Verify
              </Link>
            </div>
          </div>
        </div>
      </div>

      {address && (
        <div className="mb-8">
          <Link href={`/profile/${address}`} className="link">
            <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
          </Link>
          <InteractionStats totalInteractions={0} verifiedCount={0} />
          <div className="mt-4">
            <Link href={`/profile/${address}`} className="btn btn-outline">
              View All My Interactions
            </Link>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Interactions</h2>
        <div className="alert alert-info">
          <span>
            {totalInteractions > 0
              ? `Total interactions on chain: ${totalInteractions}`
              : "No interactions yet. Create one to get started!"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">🌐 Decentralized</h3>
            <p>All interactions are stored on the blockchain, ensuring permanent records of your connections.</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">🔐 Verified</h3>
            <p>Both parties must verify each interaction, creating a trusted social graph of real-world connections.</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">💡 Permanent Memories</h3>
            <p>Photos and videos are stored on IPFS, creating an immutable archive of your experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
