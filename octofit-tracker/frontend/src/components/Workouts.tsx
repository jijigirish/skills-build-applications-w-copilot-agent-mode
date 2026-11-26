import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutResponse = { suggestions: Array<{ title: string; reason: string }> };

export default function Workouts() {
  const userEmail = encodeURIComponent('mona@example.com');
  return <CapabilityCard<WorkoutResponse>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    load={() => getJson<WorkoutResponse>(`/api/workouts/suggestions/${userEmail}`)}
    emptyText="No workout suggestions"
    isEmpty={(data) => data.suggestions.length === 0}
    renderData={(data) => <ul>{data.suggestions.map((suggestion, index) => <li key={index}><strong>{suggestion.title}</strong>: {suggestion.reason}</li>)}</ul>}
  />;
}
