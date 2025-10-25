"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function ProfilePage() {
  const router = useRouter();
  const { address } = useAccount();

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-lg mb-4">Please connect your wallet</p>
        </div>
      </div>
    );
  }

  return <ProfileView address={address} />;
}

function ProfileView({ address }: { address: string }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicHash, setProfilePicHash] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: profile, refetch: refetchProfile } = useScaffoldReadContract({
    contractName: "BlancProfile",
    functionName: "getProfile",
    args: [address as `0x${string}`],
  });

  const { data: stats } = useScaffoldReadContract({
    contractName: "BlancProfile",
    functionName: "getProfileStats",
    args: [address as `0x${string}`],
  });

  const { data: userPosts } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getUserPosts",
    args: [address as `0x${string}`],
  });

  const { data: userCollabs } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getUserCollaborations",
    args: [address as `0x${string}`],
  });

  const { writeContractAsync: writeBlancProfile } = useScaffoldWriteContract("BlancProfile");

  const hasProfile = profile && profile[0];

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      notification.error("Username is required");
      return;
    }

    if (username.length > 32) {
      notification.error("Username must be 32 characters or less");
      return;
    }

    try {
      setIsCreating(true);
      await writeBlancProfile({
        functionName: "createProfile",
        args: [username, bio, profilePicHash],
      });

      notification.success("Profile created successfully!");
      setShowCreateModal(false);
      setUsername("");
      setBio("");
      setProfilePicHash("");
      await refetchProfile();
    } catch (error: any) {
      console.error("Error creating profile:", error);
      notification.error(error?.message || "Failed to create profile");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {!hasProfile ? (
          <>
            <div className="card bg-base-100 shadow">
              <div className="card-body text-center">
                <h2 className="card-title justify-center">Create Your Profile</h2>
                <p className="text-base-content/70">Set up your Blanc profile to get started</p>
                <button className="btn btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
                  Create Profile
                </button>
              </div>
            </div>

            {showCreateModal && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg mb-4">Create Your Profile</h3>

                  <div className="form-control w-full mb-4">
                    <label className="label">
                      <span className="label-text">Username *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      className="input input-bordered w-full"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      maxLength={32}
                    />
                    <label className="label">
                      <span className="label-text-alt">{username.length}/32 characters</span>
                    </label>
                  </div>

                  <div className="form-control w-full mb-4">
                    <label className="label">
                      <span className="label-text">Bio</span>
                    </label>
                    <textarea
                      placeholder="Tell us about yourself"
                      className="textarea textarea-bordered w-full"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="form-control w-full mb-4">
                    <label className="label">
                      <span className="label-text">Profile Picture (IPFS Hash)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Optional: Qm... or ipfs://..."
                      className="input input-bordered w-full"
                      value={profilePicHash}
                      onChange={e => setProfilePicHash(e.target.value)}
                    />
                  </div>

                  <div className="modal-action">
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setShowCreateModal(false);
                        setUsername("");
                        setBio("");
                        setProfilePicHash("");
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateProfile}
                      disabled={isCreating || !username.trim()}
                    >
                      {isCreating ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Creating...
                        </>
                      ) : (
                        "Create Profile"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="card bg-base-100 shadow mb-6">
              <div className="card-body items-center text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-primary text-primary-content rounded-full w-24">
                    <span className="text-3xl">{profile[0][0]}</span>
                  </div>
                </div>
                <h2 className="card-title">{profile[0]}</h2>
                <Address address={address} />
                <p className="text-sm text-base-content/70 mt-2">{profile[1] || "No bio yet"}</p>

                <div className="stats stats-vertical lg:stats-horizontal shadow mt-4 w-full">
                  <div className="stat place-items-center">
                    <div className="stat-title">Reputation</div>
                    <div className="stat-value text-primary">{Number(profile[3])}</div>
                  </div>
                  <div className="stat place-items-center">
                    <div className="stat-title">Posts</div>
                    <div className="stat-value">{userPosts?.length || 0}</div>
                  </div>
                  <div className="stat place-items-center">
                    <div className="stat-title">Collabs</div>
                    <div className="stat-value">{userCollabs?.length || 0}</div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4 w-full">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{Number(stats?.[1] || 0)}</div>
                    <div className="text-sm text-base-content/60">Followers</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{Number(stats?.[0] || 0)}</div>
                    <div className="text-sm text-base-content/60">Following</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tabs tabs-boxed w-full mb-4">
              <a className="tab tab-active flex-1">Posts</a>
              <a className="tab flex-1">Collabs</a>
              <a className="tab flex-1">Pending</a>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {(userPosts?.length || 0) > 0 ? (
                userPosts?.map(postId => <PostThumbnail key={postId.toString()} postId={postId} />)
              ) : (
                <div className="col-span-3 text-center py-12 text-base-content/60">No posts yet</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PostThumbnail({ postId }: { postId: bigint }) {
  const { data: post } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getPost",
    args: [postId],
  });

  if (!post) return null;

  const getIPFSUrl = (hash: string) => {
    if (hash.startsWith("ipfs://")) {
      return hash.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    if (hash.startsWith("Qm") || hash.startsWith("bafy")) {
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return hash;
  };

  const ipfsUrl = getIPFSUrl(post[3]);

  return (
    <div className="aspect-square bg-base-200 overflow-hidden">
      <img
        src={ipfsUrl}
        alt=""
        className="w-full h-full object-cover"
        onError={e => {
          e.currentTarget.src = "/placeholder-image.png";
        }}
      />
    </div>
  );
}
