"use client";

interface InteractionStatsProps {
  totalInteractions: number;
  verifiedCount: number;
}

export const InteractionStats = ({ totalInteractions, verifiedCount }: InteractionStatsProps) => {
  const verificationRate = totalInteractions > 0 ? ((verifiedCount / totalInteractions) * 100).toFixed(1) : "0";

  return (
    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div className="stat">
        <div className="stat-title">Total Interactions</div>
        <div className="stat-value text-primary">{totalInteractions}</div>
        <div className="stat-desc">All your connections</div>
      </div>

      <div className="stat">
        <div className="stat-title">Verified</div>
        <div className="stat-value text-success">{verifiedCount}</div>
        <div className="stat-desc">{verificationRate}% verification rate</div>
      </div>
    </div>
  );
};
