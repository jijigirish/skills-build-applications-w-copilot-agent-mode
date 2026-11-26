import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type ActivityResponse = { activities: Array<{ type: string; minutes: number; points: number }> };

export default function Activities() {
  return <CapabilityCard<ActivityResponse>
    title="Activities"
    description="Track student activity minutes and points."
    load={() => getJson<ActivityResponse>('/api/activities')}
    emptyText="No activities"
    isEmpty={(data) => data.activities.length === 0}
    renderData={(data) => <ul>{data.activities.map((activity, index) => <li key={index}>{activity.type}: {activity.minutes} minutes, {activity.points} points</li>)}</ul>}
  />;
}
