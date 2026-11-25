import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };

  if (
    typeof userId !== 'string' ||
    typeof teamId !== 'string' ||
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(teamId) ||
    typeof type !== 'string' ||
    type.trim().length === 0 ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);

  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };

  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    typeof mascot !== 'string' ||
    mascot.trim().length === 0
  ) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member))) {
    throw Object.assign(new Error('Invalid team member'), { status: 400 });
  }

  const memberIds = members as string[];
  if (memberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
    if (memberCount !== memberIds.length) {
      throw Object.assign(new Error('Team member not found'), { status: 404 });
    }
  }

  return Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: memberIds,
  });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
  ]);

  const ranked = await Promise.all(totals.map(async (total) => {
    const team = await Team.findById(total._id).lean();
    return team ? { teamName: team.name, totalPoints: total.totalPoints, rank: 0 } : null;
  }));

  return ranked
    .filter((entry): entry is { teamName: string; totalPoints: number; rank: number } => entry !== null)
    .sort((first, second) => second.totalPoints - first.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(5)
    .lean();

  const recentTypes = recentActivities.map((activity) => activity.type.toLowerCase());
  let focus = user.fitnessGoal;

  if (recentTypes.includes('run') || recentTypes.includes('cycle')) {
    focus = 'endurance';
  } else if (recentTypes.includes('strength')) {
    focus = 'strength';
  }

  const workout = await Workout.findOne({ focus }).lean();
  if (!workout) {
    throw Object.assign(new Error('Workout not found'), { status: 404 });
  }

  return [{
    ...workout,
    reason: recentTypes.length > 0
      ? `Recommended for your ${recentTypes.join(', ')} activity and ${focus} goal.`
      : `Recommended for your ${focus} goal.`,
  }];
}

export { User };
