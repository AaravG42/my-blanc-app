"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { PostCard } from "~~/components/PostCard";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function FeedPage() {
  const { address } = useAccount();
  const [filter, setFilter] = useState<"all" | "following" | "trending" | "pending">("all");

  const { data: postCounter } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "postCounter",
  });

  const totalPosts = postCounter ? Number(postCounter) : 0;

  const postIds = Array.from({ length: totalPosts }, (_, i) => BigInt(totalPosts - i));

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-2xl font-bold">Blanc</h1>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm btn-circle">🔔</button>
              <button className="btn btn-ghost btn-sm btn-circle">🔍</button>
            </div>
          </div>

          <div className="tabs tabs-boxed justify-center mb-2">
            <a className={`tab ${filter === "all" ? "tab-active" : ""}`} onClick={() => setFilter("all")}>
              All
            </a>
            <a className={`tab ${filter === "following" ? "tab-active" : ""}`} onClick={() => setFilter("following")}>
              Following
            </a>
            <a className={`tab ${filter === "trending" ? "tab-active" : ""}`} onClick={() => setFilter("trending")}>
              🔥 Trending
            </a>
            <a className={`tab ${filter === "pending" ? "tab-active" : ""}`} onClick={() => setFilter("pending")}>
              ⏱️ Pending
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {totalPosts === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm text-base-content/60">Be the first to create a post!</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {postIds.map(postId => (
              <PostWrapper key={postId.toString()} postId={postId} userAddress={address} filter={filter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostWrapper({
  postId,
  userAddress,
  filter,
}: {
  postId: bigint;
  userAddress: string | undefined;
  filter: "all" | "following" | "trending" | "pending";
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: post, refetch } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getPost",
    args: [postId],
    watch: true,
  });

  const { data: hasLiked } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "hasUserLiked",
    args: [postId, userAddress],
    watch: true,
  });

  const handleDelete = async () => {
    if (!confirm("Delete this pending post? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      alert(
        "Note: Delete functionality requires smart contract update. For now, the post will remain until all participants verify or you redeploy the contract.",
      );
      setIsDeleting(false);
    }, 1000);
  };

  if (!post) {
    return null;
  }

  const isActive = post[11];
  const participants = post[2] || [];
  const verifiedBy = post[7] || [];
  const creator = post[1];

  const isParticipant = userAddress && participants.some((p: string) => p.toLowerCase() === userAddress.toLowerCase());
  const isCreator = userAddress && creator.toLowerCase() === userAddress.toLowerCase();
  const isInvolvedInPost = isParticipant || isCreator;

  if (!isActive && participants.length > 0) {
    if (filter === "pending" && isInvolvedInPost) {
      const userHasVerified =
        userAddress && verifiedBy.some((v: string) => v.toLowerCase() === userAddress.toLowerCase());

      return (
        <div className="card bg-base-100 shadow-sm mb-4 border-2 border-warning">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm text-warning"></span>
                <h3 className="font-semibold">Pending Verification</h3>
              </div>
              {isCreator && (
                <button
                  className={`btn btn-ghost btn-sm btn-circle text-error ${isDeleting ? "loading" : ""}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {!isDeleting && "✕"}
                </button>
              )}
            </div>

            {userHasVerified ? (
              <div className="alert alert-success mb-2">
                <span className="text-xs">✓ You have verified this post. Waiting for others...</span>
              </div>
            ) : (
              <div className="alert alert-warning mb-2">
                <span className="text-xs">⚠️ You need to verify this post!</span>
              </div>
            )}

            <p className="text-sm text-base-content/70">
              Verified: {verifiedBy.length}/{participants.length} participants
            </p>

            <div className="flex flex-wrap gap-1 mb-2">
              {participants.map((participant: string) => {
                const hasVerified = verifiedBy.some((v: string) => v.toLowerCase() === participant.toLowerCase());
                const isCurrentUser = userAddress && participant.toLowerCase() === userAddress.toLowerCase();
                return (
                  <div
                    key={participant}
                    className={`text-xs px-2 py-1 rounded ${
                      hasVerified
                        ? "bg-success/20 text-success"
                        : isCurrentUser
                          ? "bg-warning/20 text-warning border border-warning"
                          : "bg-base-200 text-base-content/60"
                    }`}
                  >
                    {hasVerified ? "✓" : "○"} {participant.slice(0, 6)}...{participant.slice(-4)}
                    {isCurrentUser && " (You)"}
                  </div>
                );
              })}
            </div>

            <div className="mt-2">
              <img
                src={
                  post[3].startsWith("ipfs://")
                    ? post[3].replace("ipfs://", "https://ipfs.io/ipfs/")
                    : `https://ipfs.io/ipfs/${post[3]}`
                }
                alt="Preview"
                className="w-full aspect-square object-cover rounded-lg opacity-50"
              />
            </div>

            <div className="mt-2 space-y-2">
              {!userHasVerified && (
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={() => {
                    window.location.href = `/verify?postId=${postId}`;
                  }}
                >
                  📷 Verify Now
                </button>
              )}
              {isCreator && (
                <button
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => {
                    window.location.href = `/post/${postId}/qr`;
                  }}
                >
                  📱 View QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  if (!isActive) {
    return null;
  }

  if (filter === "pending") {
    return null;
  }

  return (
    <PostCard
      postId={postId}
      creator={post[1]}
      ipfsHash={post[3]}
      caption={post[4]}
      timestamp={post[5]}
      likes={post[8]}
      comments={post[9]}
      shares={post[10]}
      isLiked={hasLiked || false}
      participants={post[2]}
      verifiedBy={post[7]}
    />
  );
}
