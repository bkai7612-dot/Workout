import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { chunkedSecureStorage } from '@/services/secureStorage';
import type { ExerciseLog, MuscleGroup, SetLog, WeightUnit, WorkoutTemplate } from '@/types';
import { uid } from '@/utils/id';

export interface FinishedWorkout {
  templateId: string | null;
  templateName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: ExerciseLog[];
}

interface ActiveWorkoutState {
  active: boolean;
  templateId: string | null;
  templateName: string;
  startedAt: string | null;
  exercises: ExerciseLog[];
  restEndsAt: number | null;
  restDuration: number;
  finished: FinishedWorkout | null;

  start: (template: WorkoutTemplate | null, defaultUnit: WeightUnit) => void;
  addExercise: (input: { name: string; muscleGroup: MuscleGroup; restSeconds?: number; unit: WeightUnit }) => void;
  removeExercise: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setIndex: number, patch: Partial<SetLog>) => void;
  toggleSetComplete: (exerciseId: string, setIndex: number) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  setNotes: (exerciseId: string, notes: string) => void;
  startRest: (seconds: number) => void;
  extendRest: (seconds: number) => void;
  skipRest: () => void;
  finish: () => FinishedWorkout;
  discard: () => void;
  clearFinished: () => void;
}

const initial = {
  active: false,
  templateId: null,
  templateName: '',
  startedAt: null,
  exercises: [] as ExerciseLog[],
  restEndsAt: null,
  restDuration: 0,
  finished: null,
};

function parseTargetReps(reps: string): number | null {
  const m = reps.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => {
      const mapExercise = (id: string, fn: (e: ExerciseLog) => ExerciseLog) =>
        set({ exercises: get().exercises.map((e) => (e.id === id ? fn(e) : e)) });

      return {
        ...initial,

        start: (template, defaultUnit) => {
          const exercises: ExerciseLog[] = (template?.exercises ?? []).map((ex) => ({
            id: uid(),
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            targetReps: ex.reps,
            restSeconds: ex.restSeconds,
            notes: ex.notes ?? '',
            sets: Array.from({ length: Math.max(1, ex.sets) }, () => ({
              reps: parseTargetReps(ex.reps),
              weight: ex.weight,
              unit: ex.unit ?? defaultUnit,
              completed: false,
            })),
          }));
          set({
            ...initial,
            active: true,
            templateId: template?.id ?? null,
            templateName: template?.name ?? 'Quick workout',
            startedAt: new Date().toISOString(),
            exercises,
          });
        },

        addExercise: ({ name, muscleGroup, restSeconds = 90, unit }) =>
          set({
            exercises: [
              ...get().exercises,
              {
                id: uid(),
                name,
                muscleGroup,
                targetReps: '',
                restSeconds,
                notes: '',
                sets: [{ reps: null, weight: null, unit, completed: false }],
              },
            ],
          }),

        removeExercise: (exerciseId) => set({ exercises: get().exercises.filter((e) => e.id !== exerciseId) }),

        updateSet: (exerciseId, setIndex, patch) =>
          mapExercise(exerciseId, (e) => ({
            ...e,
            sets: e.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
          })),

        toggleSetComplete: (exerciseId, setIndex) => {
          const ex = get().exercises.find((e) => e.id === exerciseId);
          if (!ex) return;
          const nowComplete = !ex.sets[setIndex]?.completed;
          mapExercise(exerciseId, (e) => ({
            ...e,
            sets: e.sets.map((s, i) => (i === setIndex ? { ...s, completed: nowComplete } : s)),
          }));
          // Auto-start the rest timer after completing a set.
          if (nowComplete && ex.restSeconds > 0) get().startRest(ex.restSeconds);
        },

        addSet: (exerciseId) =>
          mapExercise(exerciseId, (e) => {
            const last = e.sets[e.sets.length - 1];
            return {
              ...e,
              sets: [
                ...e.sets,
                { reps: last?.reps ?? null, weight: last?.weight ?? null, unit: last?.unit ?? 'kg', completed: false },
              ],
            };
          }),

        removeSet: (exerciseId, setIndex) =>
          mapExercise(exerciseId, (e) => ({ ...e, sets: e.sets.filter((_, i) => i !== setIndex) })),

        setNotes: (exerciseId, notes) => mapExercise(exerciseId, (e) => ({ ...e, notes })),

        startRest: (seconds) => set({ restEndsAt: Date.now() + seconds * 1000, restDuration: seconds }),
        extendRest: (seconds) => {
          const ends = get().restEndsAt;
          if (!ends) return;
          set({ restEndsAt: ends + seconds * 1000, restDuration: get().restDuration + seconds });
        },
        skipRest: () => set({ restEndsAt: null, restDuration: 0 }),

        finish: () => {
          const s = get();
          const startedAt = s.startedAt ?? new Date().toISOString();
          const completedAt = new Date().toISOString();
          const finished: FinishedWorkout = {
            templateId: s.templateId,
            templateName: s.templateName,
            startedAt,
            completedAt,
            durationSeconds: Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000),
            // Drop sets that were never completed so history reflects what was actually done.
            exercises: s.exercises
              .map((e) => ({ ...e, sets: e.sets.filter((x) => x.completed) }))
              .filter((e) => e.sets.length > 0 || e.notes.trim().length > 0),
          };
          set({ ...initial, finished });
          return finished;
        },

        discard: () => set({ ...initial }),
        clearFinished: () => set({ finished: null }),
      };
    },
    {
      name: 'pb_active_workout',
      storage: createJSONStorage(() => chunkedSecureStorage),
    },
  ),
);
