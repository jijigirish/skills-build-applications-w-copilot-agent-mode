import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardResponse = { leaderboard: Array<{ teamName: string; totalPoints: number; rank: number }> };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardResponse>
    title="Leaderboard"
    description="Compare team point totals."
    path="/api/leaderboard"
    emptyText="No leaderboard rankings"
    isEmpty={(data) => data.leaderboard.length === 0}
    renderData={(data) => <ol>{data.leaderboard.map((entry) => <li key={entry.rank}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol>}
  />;
}
