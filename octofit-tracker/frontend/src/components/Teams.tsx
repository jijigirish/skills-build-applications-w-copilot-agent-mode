import { CapabilityCard } from './CapabilityCard.js';

type TeamResponse = { teams: Array<{ name: string; members: string[] }> };

export default function Teams() {
  return <CapabilityCard<TeamResponse>
    title="Teams"
    description="Manage teams and members."
    path="/api/teams"
    emptyText="No teams"
    isEmpty={(data) => data.teams.length === 0}
    renderData={(data) => <ul>{data.teams.map((team, index) => <li key={index}>{team.name}: {team.members.join(', ')}</li>)}</ul>}
  />;
}
