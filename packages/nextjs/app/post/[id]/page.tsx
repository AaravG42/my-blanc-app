"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ChatBubbleLeftIcon, HeartIcon, PaperAirplaneIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getIPFSUrlWithFallbacks } from "~~/utils/ipfs";

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = BigInt(params?.id as string);
  const [comment, setComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: post } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getPost",
    args: [postId],
    watch: true,
  });

  const { data: hasLiked } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "hasUserLiked",
    args: [postId, undefined],
    watch: true,
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "BlancPosts" });

  const [isLikedState, setIsLikedState] = useState(hasLiked || false);
  const [likesCount, setLikesCount] = useState(0);

  if (!post) {
    return (
      <div className="min-h-screen pb-20 bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const creator = post[1];
  const participants = post[2] || [];
  const ipfsHash = post[3];
  const caption = post[4];
  const timestamp = post[5];
  const likes = post[8];
  const comments = post[9];
  const shares = post[10];
  const verifiedBy = post[7] || [];

  const ipfsUrls = getIPFSUrlWithFallbacks(ipfsHash);
  const currentImageUrl = ipfsUrls[currentImageIndex] || "/placeholder-image.png";

  const timeAgo = formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true });

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

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this Blanc post",
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      await writeContractAsync({
        functionName: "commentOnPost",
        args: [postId],
      });
      setComment("");
    } catch (error) {
      console.error("Error commenting:", error);
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
            <h1 className="text-xl font-bold">Post</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl">
        <div className="bg-base-100">
          <div className="px-4 py-3 flex justify-between items-center border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-xs">{creator.slice(2, 4).toUpperCase()}</span>
                </div>
              </div>
              <div>
                <Address address={creator} size="sm" />
                <p className="text-xs text-base-content/60">{timeAgo}</p>
              </div>
            </div>
          </div>

          <div className="relative w-full bg-base-300" style={{ aspectRatio: "1/1" }}>
            <img
              src={currentImageUrl}
              alt={caption}
              className="w-full h-full object-cover"
              onError={() => {
                if (currentImageIndex < ipfsUrls.length - 1) {
                  setCurrentImageIndex(prev => prev + 1);
                }
              }}
            />
          </div>

          <div className="px-4 py-3 border-b border-base-300">
            <div className="flex gap-4 mb-3">
              <button onClick={handleLike} className="flex items-center gap-1 transition-colors">
                {isLikedState ? (
                  <HeartIconSolid className="h-7 w-7 text-error" />
                ) : (
                  <HeartIcon className="h-7 w-7 hover:text-error" />
                )}
              </button>
              <button className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-7 w-7" />
              </button>
              <button onClick={handleShare} className="flex items-center gap-1">
                <ShareIcon className="h-7 w-7" />
              </button>
            </div>

            <div className="mb-2">
              <p className="font-semibold text-sm">{Number(likes)} likes</p>
            </div>

            {participants.length > 0 && (
              <div className="mb-3 p-2 bg-success/10 rounded-lg">
                <p className="text-sm text-success font-semibold mb-1">
                  ✓ Verified by {verifiedBy.length}/{participants.length} participants
                </p>
                <div className="flex flex-wrap gap-1">
                  {participants.map((participant: string, index: number) => {
                    const hasVerified = verifiedBy.some((v: string) => v.toLowerCase() === participant.toLowerCase());
                    return (
                      <div
                        key={participant}
                        className={`text-xs px-2 py-1 rounded ${
                          hasVerified ? "bg-success/20 text-success" : "bg-base-200 text-base-content/60"
                        }`}
                      >
                        {hasVerified ? "✓" : "○"} {participant.slice(0, 6)}...{participant.slice(-4)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-sm">
              <span className="font-semibold mr-2">
                <Address address={creator} size="sm" />
              </span>
              {caption}
            </div>
          </div>

          <div className="px-4 py-3 border-b border-base-300">
            <button className="text-sm text-base-content/60">View all {Number(comments)} comments</button>
          </div>

          <div className="px-4 py-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                className="input input-bordered flex-1"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    handleComment();
                  }
                }}
              />
              <button className="btn btn-ghost btn-circle" onClick={handleComment} disabled={!comment.trim()}>
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
