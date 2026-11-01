import type {
  ExerciseLog,
  MuscleGroup,
  TemplateExercise,
  WeightUnit,
  WorkoutLog,
} from '@/types';
import { MUSCLE_GROUPS } from '@/types';
import { convertWeight } from './weight';

/** Average time under tension per working set, used in the duration estimate. */
export const SECONDS_PER_SET = 40;

/**
 * Estimated duration in minutes, from sets × (rest time + ~40s working time).
 */
export function estimateTemplateMinutes(exercises: TemplateExercise[]): number {
  const seconds = exercises.reduce(
    (acc, ex) => acc + Math.max(0, ex.sets) * (Math.max(0, ex.restSeconds) + SECONDS_PER_SET),
    0,
  );
  return Math.max(exercises.length ? 1 : 0, Math.round(seconds / 60));
}

export function muscleGroupsFromExercises(exercises: { muscleGroup: MuscleGroup }[]): MuscleGroup[] {
  const set = new Set<MuscleGroup>();
  exercises.forEach((e) => set.add(e.muscleGroup));
  return MUSCLE_GROUPS.filter((g) => set.has(g));
}

export function completedSets(exercise: ExerciseLog): number {
  return exercise.sets.filter((s) => s.completed).length;
}

/** Muscle groups with at least one completed set. */
export function muscleGroupsHit(exercises: ExerciseLog[]): MuscleGroup[] {
  return muscleGroupsFromExercises(exercises.filter((e) => completedSets(e) > 0));
}

export function totalCompletedSets(exercises: ExerciseLog[]): number {
  return exercises.reduce((acc, e) => acc + completedSets(e), 0);
}

/** Total volume (weight × reps) of completed sets, expressed in `unit`. */
export function totalVolume(exercises: ExerciseLog[], unit: WeightUnit): number {
  return exercises.reduce(
    (acc, e) =>
      acc +
      e.sets
        .filter((s) => s.completed && s.weight != null && s.reps != null)
        .reduce((a, s) => a + convertWeight(s.weight as number, s.unit, unit) * (s.reps as number), 0),
    0,
  );
}

export type SetCounts = Record<MuscleGroup, number>;

export function emptySetCounts(): SetCounts {
  return MUSCLE_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as SetCounts);
}

/** Completed sets per muscle group across all logs completed on/after `since`. */
export function setsPerMuscleGroup(logs: WorkoutLog[], since: Date): SetCounts {
  const counts = emptySetCounts();
  logs
    .filter((l) => new Date(l.completed_at ?? l.started_at) >= since)
    .forEach((l) =>
      l.exercise_logs.forEach((e) => {
        counts[e.muscleGroup] = (counts[e.muscleGroup] ?? 0) + completedSets(e);
      }),
    );
  return counts;
}

export function workedGroups(counts: SetCounts): Set<MuscleGroup> {
  return new Set(MUSCLE_GROUPS.filter((g) => counts[g] > 0));
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
