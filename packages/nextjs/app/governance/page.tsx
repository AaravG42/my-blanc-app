"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type FilterType = "all" | "active" | "ended" | "executed";

export default function GovernancePage() {
  const router = useRouter();
  const { address } = useAccount();
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("active");
  const [showInfo, setShowInfo] = useState(false);

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "BlancToken",
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "BlancToken",
    functionName: "totalSupply",
  });

  const { data: currentParams } = useScaffoldReadContract({
    contractName: "BlancGovernance",
    functionName: "getCurrentParams",
  });

  const { data: proposalCounter } = useScaffoldReadContract({
    contractName: "BlancGovernance",
    functionName: "proposalCounter",
  });

  const balance = tokenBalance ? Number(tokenBalance) / 1e18 : 0;
  const supply = totalSupply ? Number(totalSupply) / 1e18 : 1;
  const votingPower = (balance / supply) * 100;

  const totalProposals = proposalCounter ? Number(proposalCounter) : 0;
  const proposalIds = Array.from({ length: totalProposals }, (_, i) => BigInt(totalProposals - i));

  const recency = currentParams ? Number(currentParams[0]) : 40;
  const engagement = currentParams ? Number(currentParams[1]) : 35;
  const reputation = currentParams ? Number(currentParams[2]) : 25;

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
              ← Back
            </button>
            <h1 className="text-xl font-bold">🗳️ Governance</h1>
            <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowInfo(!showInfo)}>
              ℹ️
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {showInfo && (
          <div className="alert alert-info mb-6">
            <div className="flex-col items-start w-full">
              <div className="font-bold mb-2">How Governance Works</div>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Token holders control the feed algorithm</li>
                <li>Create proposals to adjust content ranking weights</li>
                <li>Vote with your BLANC tokens (1 token = 1 vote)</li>
                <li>Proposals need majority votes to pass</li>
                <li>Voting period: 3 days per proposal</li>
                <li>Need 1 BLANC to create proposals</li>
              </ul>
            </div>
          </div>
        )}

        <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-2">
              <h2 className="card-title text-lg">Your Voting Power</h2>
              {balance < 1 && <div className="badge badge-warning badge-sm">Need 1 BLANC to propose</div>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat bg-base-100 rounded-lg p-4">
                <div className="stat-title text-xs">Your Balance</div>
                <div className="stat-value text-2xl text-primary">{balance.toFixed(2)}</div>
                <div className="stat-desc">BLANC tokens</div>
              </div>
              <div className="stat bg-base-100 rounded-lg p-4">
                <div className="stat-title text-xs">Voting Weight</div>
                <div className="stat-value text-2xl text-secondary">{votingPower.toFixed(3)}%</div>
                <div className="stat-desc">of total supply</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-3">
              <h2 className="card-title">Current Algorithm Parameters</h2>
              <div className="badge badge-success badge-sm">Active</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🕐 Recency</span>
                    <span className="text-xs text-base-content/60">(newer posts ranked higher)</span>
                  </div>
                  <span className="font-bold text-lg text-primary">{recency}%</span>
                </div>
                <progress className="progress progress-primary w-full h-3" value={recency} max="100"></progress>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">❤️ Engagement</span>
                    <span className="text-xs text-base-content/60">(likes & comments matter)</span>
                  </div>
                  <span className="font-bold text-lg text-secondary">{engagement}%</span>
                </div>
                <progress className="progress progress-secondary w-full h-3" value={engagement} max="100"></progress>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">⭐ Reputation</span>
                    <span className="text-xs text-base-content/60">(trusted creators boosted)</span>
                  </div>
                  <span className="font-bold text-lg text-accent">{reputation}%</span>
                </div>
                <progress className="progress progress-accent w-full h-3" value={reputation} max="100"></progress>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Proposals</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateProposal(true)}
            disabled={!address || balance < 1}
          >
            + Create Proposal
          </button>
        </div>

        <div className="tabs tabs-boxed mb-4 bg-base-200">
          <button className={`tab ${filter === "all" ? "tab-active" : ""}`} onClick={() => setFilter("all")}>
            All ({totalProposals})
          </button>
          <button className={`tab ${filter === "active" ? "tab-active" : ""}`} onClick={() => setFilter("active")}>
            Active
          </button>
          <button className={`tab ${filter === "ended" ? "tab-active" : ""}`} onClick={() => setFilter("ended")}>
            Ended
          </button>
          <button className={`tab ${filter === "executed" ? "tab-active" : ""}`} onClick={() => setFilter("executed")}>
            Executed
          </button>
        </div>

        {totalProposals === 0 ? (
          <div className="card bg-base-100 shadow">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">🗳️</div>
              <p className="text-lg font-semibold text-base-content/70">No proposals yet</p>
              <p className="text-sm text-base-content/60">Be the first to shape the algorithm!</p>
              {balance < 1 && (
                <div className="alert alert-warning mt-4 max-w-sm mx-auto">
                  <span className="text-xs">
                    You need 1 BLANC token to create proposals. Earn tokens by creating and verifying posts!
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {proposalIds.map(proposalId => (
              <ProposalCard key={proposalId.toString()} proposalId={proposalId} userAddress={address} filter={filter} />
            ))}
          </div>
        )}

        {showCreateProposal && (
          <CreateProposalModal
            onClose={() => setShowCreateProposal(false)}
            hasMinTokens={balance >= 1}
            currentParams={{ recency, engagement, reputation }}
          />
        )}
      </div>
    </div>
  );
}

function ProposalCard({
  proposalId,
  userAddress,
  filter,
}: {
  proposalId: bigint;
  userAddress: string | undefined;
  filter: FilterType;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: proposal } = useScaffoldReadContract({
    contractName: "BlancGovernance",
    functionName: "getProposal",
    args: [proposalId],
  });

  const { data: hasVoted } = useScaffoldReadContract({
    contractName: "BlancGovernance",
    functionName: "hasVoted",
    args: [proposalId, userAddress as `0x${string}`],
  });

  const { writeContractAsync: vote } = useScaffoldWriteContract({
    contractName: "BlancGovernance",
  });

  const { writeContractAsync: execute } = useScaffoldWriteContract({
    contractName: "BlancGovernance",
  });

  if (!proposal) return null;

  const endTime = Number(proposal[9]) * 1000;
  const isEnded = Date.now() >= endTime;
  const isExecuted = proposal[10];

  if (filter === "active" && (isEnded || isExecuted)) return null;
  if (filter === "ended" && (!isEnded || isExecuted)) return null;
  if (filter === "executed" && !isExecuted) return null;

  const votesFor = Number(proposal[6]) / 1e18;
  const votesAgainst = Number(proposal[7]) / 1e18;
  const totalVotes = votesFor + votesAgainst;
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const isPassing = votesFor > votesAgainst;

  const proposer = proposal[1] as string;
  const description = proposal[2] as string;
  const newRecency = Number(proposal[3]);
  const newEngagement = Number(proposal[4]);
  const newReputation = Number(proposal[5]);

  const handleVote = async (support: boolean) => {
    try {
      await vote({
        functionName: "vote",
        args: [proposalId, support],
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleExecute = async () => {
    try {
      await execute({
        functionName: "executeProposal",
        args: [proposalId],
      });
    } catch (error) {
      console.error("Error executing:", error);
    }
  };

  return (
    <div
      className={`card bg-base-100 shadow hover:shadow-lg transition-shadow ${isPassing && !isEnded ? "border-2 border-success" : ""}`}
    >
      <div className="card-body">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h3 className="card-title text-base">Proposal #{proposalId.toString()}</h3>
            {isPassing && !isEnded && !isExecuted && <div className="badge badge-success badge-sm">Passing</div>}
          </div>
          {isExecuted ? (
            <span className="badge badge-success gap-1">✓ Executed</span>
          ) : isEnded ? (
            <span className="badge badge-error gap-1">⏱️ Ended</span>
          ) : (
            <span className="badge badge-primary gap-1">🔴 Active</span>
          )}
        </div>

        <p className="text-sm mb-3">{description}</p>

        <div className="divider my-2">Proposed Changes</div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-primary/10 rounded p-2 text-center">
            <div className="text-xs text-base-content/60">🕐 Recency</div>
            <div className="text-lg font-bold text-primary">{newRecency}%</div>
          </div>
          <div className="bg-secondary/10 rounded p-2 text-center">
            <div className="text-xs text-base-content/60">❤️ Engagement</div>
            <div className="text-lg font-bold text-secondary">{newEngagement}%</div>
          </div>
          <div className="bg-accent/10 rounded p-2 text-center">
            <div className="text-xs text-base-content/60">⭐ Reputation</div>
            <div className="text-lg font-bold text-accent">{newReputation}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4">
              <span className="font-semibold text-success">👍 {votesFor.toFixed(0)} For</span>
              <span className="font-semibold text-error">👎 {votesAgainst.toFixed(0)} Against</span>
            </div>
            {totalVotes > 0 && (
              <span className="text-xs text-base-content/60">{forPercentage.toFixed(1)}% in favor</span>
            )}
          </div>
          {totalVotes > 0 ? (
            <div className="relative">
              <progress
                className={`progress w-full h-4 ${isPassing ? "progress-success" : "progress-error"}`}
                value={votesFor}
                max={totalVotes}
              ></progress>
              <div className="text-xs text-center absolute inset-0 flex items-center justify-center font-semibold">
                {forPercentage.toFixed(0)}%
              </div>
            </div>
          ) : (
            <div className="alert alert-warning py-2">
              <span className="text-xs">No votes yet - be the first to vote!</span>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-base-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-base-content/60">Proposer:</span>
              <Address address={proposer} />
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/60">Voting Period:</span>
              <span>3 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/60">Total Votes:</span>
              <span>{totalVotes.toFixed(2)} BLANC</span>
            </div>
          </div>
        )}

        {!isEnded && (
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-base-content/60">
              ⏱️ {formatDistanceToNow(new Date(endTime), { addSuffix: true })}
            </p>
            <button className="btn btn-ghost btn-xs" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Hide" : "Details"}
            </button>
          </div>
        )}

        <div className="card-actions justify-end mt-3 gap-2">
          {!isEnded && !hasVoted && userAddress && (
            <>
              <button className="btn btn-sm btn-error btn-outline flex-1" onClick={() => handleVote(false)}>
                👎 Vote Against
              </button>
              <button className="btn btn-sm btn-success flex-1" onClick={() => handleVote(true)}>
                👍 Vote For
              </button>
            </>
          )}
          {!isEnded && !hasVoted && !userAddress && (
            <div className="alert alert-info py-2 w-full">
              <span className="text-xs">Connect wallet to vote</span>
            </div>
          )}
          {isEnded && !isExecuted && isPassing && (
            <button className="btn btn-sm btn-primary w-full" onClick={handleExecute}>
              ✓ Execute Proposal
            </button>
          )}
          {isEnded && !isExecuted && !isPassing && (
            <div className="alert alert-error py-2 w-full">
              <span className="text-xs">Proposal failed - Not enough support</span>
            </div>
          )}
          {hasVoted && !isEnded && <div className="badge badge-success gap-1">✓ You voted</div>}
        </div>
      </div>
    </div>
  );
}

function CreateProposalModal({
  onClose,
  hasMinTokens,
  currentParams,
}: {
  onClose: () => void;
  hasMinTokens: boolean;
  currentParams: { recency: number; engagement: number; reputation: number };
}) {
  const [description, setDescription] = useState("");
  const [recency, setRecency] = useState(currentParams.recency);
  const [engagement, setEngagement] = useState(currentParams.engagement);
  const [reputation, setReputation] = useState(currentParams.reputation);
  const [usePreset, setUsePreset] = useState(false);

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "BlancGovernance",
  });

  const total = recency + engagement + reputation;
  const isValid = total === 100 && description.trim().length > 10;

  const presets = [
    {
      name: "Chronological Feed",
      description: "Prioritize newest posts (like Twitter)",
      recency: 70,
      engagement: 20,
      reputation: 10,
    },
    {
      name: "Viral Content",
      description: "Boost highly engaged posts (like TikTok)",
      recency: 15,
      engagement: 70,
      reputation: 15,
    },
    {
      name: "Quality First",
      description: "Trust established creators",
      recency: 20,
      engagement: 30,
      reputation: 50,
    },
    {
      name: "Balanced",
      description: "Equal weight to all factors",
      recency: 33,
      engagement: 34,
      reputation: 33,
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setRecency(preset.recency);
    setEngagement(preset.engagement);
    setReputation(preset.reputation);
    setDescription(preset.description);
    setUsePreset(false);
  };

  const handleRecencyChange = (value: number) => {
    const remaining = 100 - value;
    const engagementRatio = engagement / (engagement + reputation || 1);
    setRecency(value);
    setEngagement(Math.round(remaining * engagementRatio));
    setReputation(100 - value - Math.round(remaining * engagementRatio));
  };

  const handleEngagementChange = (value: number) => {
    const remaining = 100 - value;
    const recencyRatio = recency / (recency + reputation || 1);
    setEngagement(value);
    setRecency(Math.round(remaining * recencyRatio));
    setReputation(100 - value - Math.round(remaining * recencyRatio));
  };

  const handleReputationChange = (value: number) => {
    const remaining = 100 - value;
    const recencyRatio = recency / (recency + engagement || 1);
    setReputation(value);
    setRecency(Math.round(remaining * recencyRatio));
    setEngagement(100 - value - Math.round(remaining * recencyRatio));
  };

  const handleCreate = async () => {
    if (!isValid) return;

    try {
      await writeContractAsync({
        functionName: "createProposal",
        args: [description, BigInt(recency), BigInt(engagement), BigInt(reputation)],
      });
      onClose();
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card bg-base-100 w-full max-w-lg my-8">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <h3 className="card-title">Create Proposal</h3>
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
              ✕
            </button>
          </div>

          {!hasMinTokens && (
            <div className="alert alert-warning">
              <div>
                <div className="font-bold">Insufficient BLANC Tokens</div>
                <div className="text-xs">
                  You need at least 1 BLANC token to create proposals. Earn tokens by creating and verifying posts!
                </div>
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Proposal Description</span>
              <span className="label-text-alt">{description.length}/500</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Explain why this change would improve the feed (minimum 10 characters)..."
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              maxLength={500}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="font-semibold">Algorithm Parameters</span>
            <button className="btn btn-ghost btn-xs" onClick={() => setUsePreset(!usePreset)}>
              {usePreset ? "Custom" : "Use Preset"}
            </button>
          </div>

          {usePreset ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  className="card bg-base-200 hover:bg-base-300 cursor-pointer p-3 text-left"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="font-semibold text-sm">{preset.name}</div>
                  <div className="text-xs text-base-content/60 mt-1">{preset.description}</div>
                  <div className="flex gap-1 mt-2 text-xs">
                    <span className="badge badge-primary badge-xs">{preset.recency}%</span>
                    <span className="badge badge-secondary badge-xs">{preset.engagement}%</span>
                    <span className="badge badge-accent badge-xs">{preset.reputation}%</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <span>🕐 Recency Weight</span>
                    <span className="text-xs text-base-content/60">(newer posts)</span>
                  </span>
                  <span className="label-text-alt font-bold text-lg text-primary">{recency}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={recency}
                  className="range range-primary"
                  onChange={e => handleRecencyChange(Number(e.target.value))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <span>❤️ Engagement Weight</span>
                    <span className="text-xs text-base-content/60">(likes/comments)</span>
                  </span>
                  <span className="label-text-alt font-bold text-lg text-secondary">{engagement}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={engagement}
                  className="range range-secondary"
                  onChange={e => handleEngagementChange(Number(e.target.value))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <span>⭐ Reputation Weight</span>
                    <span className="text-xs text-base-content/60">(creator trust)</span>
                  </span>
                  <span className="label-text-alt font-bold text-lg text-accent">{reputation}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reputation}
                  className="range range-accent"
                  onChange={e => handleReputationChange(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="alert alert-success mt-2">
            <span className="text-xs font-semibold">Total: {total}% ✓ Auto-balanced</span>
          </div>

          {description.length > 0 && description.length < 10 && (
            <div className="alert alert-warning">
              <span className="text-xs">Description too short (minimum 10 characters)</span>
            </div>
          )}

          <div className="divider my-2">Preview</div>

          <div className="bg-base-200 rounded-lg p-3 space-y-2">
            <div className="text-xs text-base-content/60">Your proposed feed will:</div>
            {recency > 50 && <div className="text-xs">• Strongly favor recent posts over older content</div>}
            {recency < 20 && <div className="text-xs">• Show older posts that might still be relevant</div>}
            {engagement > 50 && <div className="text-xs">• Prioritize viral content with high engagement</div>}
            {engagement < 20 && <div className="text-xs">• De-emphasize viral posts in favor of other factors</div>}
            {reputation > 50 && <div className="text-xs">• Boost content from established, trusted creators</div>}
            {reputation < 20 && <div className="text-xs">• Give newer creators equal visibility</div>}
          </div>

          <div className="card-actions justify-end gap-2 mt-4">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={!isValid || !hasMinTokens}>
              Submit Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
