"use client";

import { Address } from "./scaffold-eth";

interface InteractionCardProps {
  id: number;
  initiator: string;
  verifier: string;
  caption: string;
  timestamp: bigint;
  verified: boolean;
  ipfsHash?: string;
  onClick?: () => void;
}

export const InteractionCard = ({
  id,
  initiator,
  verifier,
  caption,
  timestamp,
  verified,
  ipfsHash,
  onClick,
}: InteractionCardProps) => {
  const date = new Date(Number(timestamp) * 1000).toLocaleDateString();

  return (
    <div className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" onClick={onClick}>
      <figure>
        {ipfsHash ? (
          <img
            src={`https://gateway.pinata.cloud/ipfs/${ipfsHash.replace("ipfs://", "")}`}
            alt={caption}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-white text-2xl">📸</span>
          </div>
        )}
      </figure>
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">#{id}</span>
          {verified && <div className="badge badge-success">Verified</div>}
        </div>
        <p className="text-sm mb-2">{caption}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            Initiator: <Address address={initiator} format="short" />
          </div>
          {verified && (
            <div>
              Verified by: <Address address={verifier} format="short" />
            </div>
          )}
          <div>{date}</div>
        </div>
      </div>
    </div>
  );
};
