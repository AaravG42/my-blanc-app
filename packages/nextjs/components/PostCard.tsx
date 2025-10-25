"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Address } from "./scaffold-eth";
import { formatDistanceToNow } from "date-fns";
import { ChatBubbleLeftIcon, HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getIPFSUrlWithFallbacks } from "~~/utils/ipfs";

interface PostCardProps {
  postId: bigint;
  creator: string;
  ipfsHash: string;
  caption: string;
  timestamp: bigint;
  likes: bigint;
  comments: bigint;
  shares: bigint;
  isLiked?: boolean;
  participants?: string[];
  verifiedBy?: string[];
  onLike?: () => void;
}

export const PostCard = ({
  postId,
  creator,
  ipfsHash,
  caption,
  timestamp,
  likes,
  comments,
  shares,
  isLiked = false,
  participants = [],
  verifiedBy = [],
}: PostCardProps) => {
  const router = useRouter();
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(Number(likes));
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "BlancPosts" });

  const handleLike = async () => {
    try {
      if (isLikedState) {
        await writeContractAsync({
          functionName: "unlikePost",
          args: [postId],
        });
        setIsLikedState(false);
        setLikesCount(prev => prev - 1);
      } else {
        await writeContractAsync({
          functionName: "likePost",
          args: [postId],
        });
        setIsLikedState(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ipfsUrls = getIPFSUrlWithFallbacks(ipfsHash);
  const currentImageUrl = ipfsUrls[currentImageIndex] || "/placeholder-image.png";

  return (
    <div className="card bg-base-100 shadow-sm mb-4">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Address address={creator} size="sm" />
        </div>
        <span className="text-xs text-base-content/60">{timeAgo}</span>
      </div>

      <div
        className="relative aspect-square w-full bg-base-200 cursor-pointer"
        onClick={() => router.push(`/post/${postId}`)}
      >
        <img
          src={currentImageUrl}
          alt={caption}
          className="w-full h-full object-cover"
          onError={() => {
            if (currentImageIndex < ipfsUrls.length - 1) {
              setCurrentImageIndex(prev => prev + 1);
            } else {
              setCurrentImageIndex(0);
            }
          }}
        />
      </div>

      <div className="px-4 py-3">
        <div className="flex gap-4 mb-3">
          <button onClick={handleLike} className="flex items-center gap-1 transition-colors">
            {isLikedState ? (
              <HeartIconSolid className="h-6 w-6 text-error" />
            ) : (
              <HeartIcon className="h-6 w-6 hover:text-error" />
            )}
            <span className="text-sm">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span className="text-sm">{Number(comments)}</span>
          </button>
          <button className="flex items-center gap-1">
            <ShareIcon className="h-6 w-6" />
            <span className="text-sm">{Number(shares)}</span>
          </button>
        </div>

        {participants.length > 0 && (
          <div className="mb-2">
            <span className="text-sm text-success">
              ✓ Verified by {verifiedBy.length}/{participants.length} participants
            </span>
          </div>
        )}

        <div className="text-sm cursor-pointer" onClick={() => router.push(`/post/${postId}`)}>
          <span className="font-semibold">
            <Address address={creator} size="sm" />
          </span>{" "}
          {caption}
        </div>
      </div>
    </div>
  );
};
