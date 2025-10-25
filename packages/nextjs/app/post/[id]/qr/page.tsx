"use client";

import { useParams, useRouter } from "next/navigation";
import { QRCodeGenerator } from "~~/components/QRCodeGenerator";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function QRDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const postId = BigInt(params?.id as string);

  const { data: verificationStatus } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getVerificationStatus",
    args: [postId],
    watch: true,
  });

  const { data: post } = useScaffoldReadContract({
    contractName: "BlancPosts",
    functionName: "getPost",
    args: [postId],
    watch: true,
  });

  const verified = Number(verificationStatus?.[0] || 0);
  const required = Number(verificationStatus?.[1] || 0);
  const verifiers = verificationStatus?.[2] || [];
  const participants = post?.[2] || [];
  const isFullyVerified = post?.[11] || false;

  if (isFullyVerified) {
    router.push("/feed");
  }

  return (
    <div className="min-h-screen pb-20 bg-base-200">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <button className="btn btn-ghost btn-sm" onClick={() => router.push("/feed")}>
              ← Back
            </button>
            <h1 className="text-xl font-bold">Verification Required</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center">
            <h2 className="card-title text-center mb-6">Verification Required</h2>

            <div className="bg-white p-6 rounded-xl mb-6">
              <QRCodeGenerator interactionId={Number(postId)} size={240} />
            </div>

            <div className="w-full mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Verified:</span>
                <span className="text-lg font-bold text-primary">
                  {verified}/{required}
                </span>
              </div>
              <progress className="progress progress-primary w-full h-2" value={verified} max={required}></progress>
            </div>

            <div className="w-full space-y-2 mb-6">
              {participants.map((participant: string) => {
                const hasVerified = verifiers.some((v: string) => v.toLowerCase() === participant.toLowerCase());
                return (
                  <div key={participant} className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        hasVerified ? "bg-success text-success-content" : "bg-base-300"
                      }`}
                    >
                      {hasVerified ? "✓" : "○"}
                    </div>
                    <span className="text-sm font-mono">
                      {participant.slice(0, 6)}...{participant.slice(-4)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 w-full mb-4">
              <button
                className="btn btn-outline flex-1"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Verify this Blanc post",
                      url: `${window.location.origin}/verify?id=${postId}`,
                    });
                  }
                }}
              >
                📤 Share QR
              </button>
              <button
                className="btn btn-outline flex-1"
                onClick={() => {
                  const url = `${window.location.origin}/verify?id=${postId}`;
                  navigator.clipboard.writeText(url);
                  alert("Link copied!");
                }}
              >
                📋 Copy Link
              </button>
            </div>

            <div className="alert alert-warning">
              <div className="text-center w-full">
                <p className="text-sm font-semibold mb-1">Post will be live when</p>
                <p className="text-xs">all participants verify</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
