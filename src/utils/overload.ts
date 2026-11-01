import type { SetLog, WorkoutLog } from '@/types';
import type { PreviousPerformance } from '@/store/activeWorkoutStore';
import { convertWeight, roundWeight } from './weight';

export type Comparison = 'up' | 'same' | 'down';

/**
 * Compares a set with the same set last time. Heavier weight wins; at the same
 * weight, more reps wins. Bodyweight sets compare on reps only.
 */
export function compareSet(current: SetLog, previous: SetLog | undefined): Comparison | null {
  if (!previous || current.reps == null || previous.reps == null) return null;
  const cw = current.weight != null ? convertWeight(current.weight, current.unit, 'kg') : null;
  const pw = previous.weight != null ? convertWeight(previous.weight, previous.unit, 'kg') : null;
  if (cw != null && pw != null && Math.abs(cw - pw) > 0.05) return cw > pw ? 'up' : 'down';
  if (current.reps !== previous.reps) return current.reps > previous.reps ? 'up' : 'down';
  return 'same';
}

/** "70 kg × 8" (in the set's own unit), or "8 reps" for bodyweight. */
export function formatPreviousSet(s: SetLog | undefined): string {
  if (!s) return '—';
  if (s.weight == null) return s.reps != null ? `${s.reps} reps` : '—';
  return `${roundWeight(s.weight)}${s.unit} × ${s.reps ?? '?'}`;
}

/**
 * Finds the most recent logged session of a template (matched by template id,
 * or by name for pre-made / generated workouts).
 */
export function findPreviousPerformance(
  logs: WorkoutLog[],
  source: { id?: string | null; name: string },
): PreviousPerformance | null {
  const last = logs
    .filter((l) => (source.id ? l.template_id === source.id : false) || (!!l.template_name && l.template_name === source.name))
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
  if (!last) return null;
  const exercises: Record<string, SetLog[]> = {};
  last.exercise_logs.forEach((e) => {
    if (e.sets.length) exercises[e.name.toLowerCase()] = e.sets;
  });
  return { date: last.started_at, exercises };
}
