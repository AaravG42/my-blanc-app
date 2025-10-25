"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { readContract } from "viem";
import { InteractionCard } from "~~/components/InteractionCard";
import { InteractionStats } from "~~/components/InteractionStats";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { publicClient } from "~~/services/web3/wagmiConfig";

interface Interaction {
  id: bigint;
  initiator: string;
  verifier: string;
  ipfsHash: string;
  caption: string;
  timestamp: bigint;
  verified: boolean;
  tipAmount: bigint;
}

export default function ProfilePage() {
  const params = useParams();
  const address = params?.address as string;
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const { data: interactionIds } = useScaffoldReadContract({
    contractName: "BlancInteractions",
    functionName: "getUserInteractions",
    args: [address],
  });

  const { data: verifiedCount } = useScaffoldReadContract({
    contractName: "BlancInteractions",
    functionName: "getVerifiedInteractionsCount",
    args: [address],
  });

  const { data: contract } = useScaffoldContract({
    contractName: "BlancInteractions",
  });

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!interactionIds || !contract || !contract.data) return;

      try {
        const fetchedInteractions = await Promise.all(
          (interactionIds as bigint[]).map(async id => {
            try {
              const result = await readContract(publicClient, {
                address: contract.data.address,
                abi: contract.data.abi,
                functionName: "getInteraction",
                args: [id],
              });

              return {
                id: result[0] as bigint,
                initiator: result[1] as string,
                verifier: result[2] as string,
                ipfsHash: result[3] as string,
                caption: result[4] as string,
                timestamp: result[5] as bigint,
                verified: result[6] as boolean,
                tipAmount: result[7] as bigint,
              };
            } catch (e) {
              console.error("Error fetching interaction:", e);
              return null;
            }
          }),
        );

        setInteractions(
          fetchedInteractions
            .filter(i => i !== null)
            .sort((a, b) => Number(b!.timestamp) - Number(a!.timestamp)) as Interaction[],
        );
      } catch (e) {
        console.error("Error fetching interactions:", e);
      }
    };

    fetchInteractions();
  }, [interactionIds, contract]);

  if (!interactions) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-info">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="btn btn-ghost mb-4">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {verifiedCount !== undefined && (
        <InteractionStats
          totalInteractions={interactions.length}
          verifiedCount={Number(verifiedCount)}
          address={address}
        />
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Interactions</h2>
        {interactions.length === 0 ? (
          <div className="alert alert-info">
            <span>No interactions yet</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interactions.map(interaction => (
              <div
                key={interaction.id.toString()}
                onClick={() => (window.location.href = `/interaction/${interaction.id}`)}
              >
                <InteractionCard
                  id={Number(interaction.id)}
                  initiator={interaction.initiator}
                  verifier={interaction.verifier}
                  caption={interaction.caption}
                  timestamp={interaction.timestamp}
                  verified={interaction.verified}
                  ipfsHash={interaction.ipfsHash}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
