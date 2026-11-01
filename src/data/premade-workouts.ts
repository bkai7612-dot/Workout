import type { Equipment, Level, MuscleGroup, TemplateExercise } from '@/types';
import { EXERCISES_BY_ID } from './exercises';

/**
 * Pre-made workouts written by the ProjectBuilt coach. Shown on the Quick
 * Workout screen and filtered by the muscle groups the user selects.
 */

interface PremadeItem {
  id: string; // exercise library id
  sets: number;
  reps: string;
  rest: number;
}

export interface PremadeWorkout {
  id: string;
  name: string;
  description: string;
  level: Level;
  equipment: Equipment; // minimum equipment needed
  items: PremadeItem[];
}

export const PREMADE_WORKOUTS: PremadeWorkout[] = [
  {
    id: 'pm-full-body-starter',
    name: 'Full Body Starter',
    description: 'A no-equipment session that hits everything. Perfect for beginners.',
    level: 'beginner',
    equipment: 'bodyweight',
    items: [
      { id: 'bodyweight-squat', sets: 3, reps: '12–15', rest: 60 },
      { id: 'incline-push-up', sets: 3, reps: '8–12', rest: 60 },
      { id: 'inverted-row', sets: 3, reps: '8–12', rest: 60 },
      { id: 'glute-bridge', sets: 3, reps: '15', rest: 45 },
      { id: 'plank', sets: 3, reps: '30s hold', rest: 45 },
    ],
  },
  {
    id: 'pm-upper-push',
    name: 'Upper Body Push',
    description: 'Chest, shoulders and triceps with heavy presses and accessories.',
    level: 'intermediate',
    equipment: 'full_gym',
    items: [
      { id: 'barbell-bench-press', sets: 4, reps: '6–8', rest: 120 },
      { id: 'incline-db-press', sets: 3, reps: '8–12', rest: 90 },
      { id: 'db-shoulder-press', sets: 3, reps: '8–12', rest: 90 },
      { id: 'lateral-raise', sets: 3, reps: '12–15', rest: 60 },
      { id: 'tricep-pushdown', sets: 3, reps: '12–15', rest: 60 },
    ],
  },
  {
    id: 'pm-upper-pull',
    name: 'Upper Body Pull',
    description: 'Back thickness and width, finished with biceps.',
    level: 'intermediate',
    equipment: 'full_gym',
    items: [
      { id: 'lat-pulldown', sets: 4, reps: '8–10', rest: 90 },
      { id: 'barbell-row', sets: 4, reps: '6–8', rest: 120 },
      { id: 'seated-cable-row', sets: 3, reps: '10–12', rest: 90 },
      { id: 'face-pull', sets: 3, reps: '15', rest: 60 },
      { id: 'hammer-curl', sets: 3, reps: '10–12', rest: 60 },
    ],
  },
  {
    id: 'pm-leg-day',
    name: 'Leg Day',
    description: 'Squat-led lower body session for strength and size.',
    level: 'intermediate',
    equipment: 'full_gym',
    items: [
      { id: 'back-squat', sets: 4, reps: '5–8', rest: 150 },
      { id: 'romanian-deadlift', sets: 3, reps: '8–10', rest: 120 },
      { id: 'leg-press', sets: 3, reps: '10–12', rest: 90 },
      { id: 'leg-curl', sets: 3, reps: '12', rest: 60 },
      { id: 'standing-calf-raise', sets: 4, reps: '12–15', rest: 45 },
    ],
  },
  {
    id: 'pm-db-full-body',
    name: 'Dumbbell Full Body',
    description: 'Everything you need from a pair of dumbbells and a bench.',
    level: 'beginner',
    equipment: 'dumbbells',
    items: [
      { id: 'goblet-squat', sets: 3, reps: '10–12', rest: 90 },
      { id: 'db-bench-press', sets: 3, reps: '8–12', rest: 90 },
      { id: 'db-row', sets: 3, reps: '10 each side', rest: 60 },
      { id: 'db-rdl', sets: 3, reps: '10–12', rest: 90 },
      { id: 'db-shoulder-press', sets: 3, reps: '10', rest: 60 },
      { id: 'dead-bug', sets: 3, reps: '10 each side', rest: 45 },
    ],
  },
  {
    id: 'pm-glutes-core',
    name: 'Glutes & Core',
    description: 'Build stronger glutes and a solid midsection.',
    level: 'beginner',
    equipment: 'dumbbells',
    items: [
      { id: 'bulgarian-split-squat', sets: 3, reps: '8–10 each side', rest: 90 },
      { id: 'glute-bridge', sets: 3, reps: '15', rest: 60 },
      { id: 'donkey-kick', sets: 3, reps: '15 each side', rest: 45 },
      { id: 'dead-bug', sets: 3, reps: '10 each side', rest: 45 },
      { id: 'side-plank', sets: 3, reps: '30s each side', rest: 45 },
    ],
  },
  {
    id: 'pm-arms',
    name: 'Arm Pump',
    description: 'Biceps and triceps supersets for a quick arm session.',
    level: 'beginner',
    equipment: 'dumbbells',
    items: [
      { id: 'db-curl', sets: 3, reps: '10–12', rest: 60 },
      { id: 'overhead-db-extension', sets: 3, reps: '10–12', rest: 60 },
      { id: 'hammer-curl', sets: 3, reps: '12', rest: 60 },
      { id: 'db-kickback', sets: 3, reps: '12–15', rest: 60 },
      { id: 'diamond-push-up', sets: 2, reps: 'To failure', rest: 60 },
    ],
  },
  {
    id: 'pm-hiit',
    name: '20-Minute HIIT',
    description: 'High-intensity conditioning. No equipment, big sweat.',
    level: 'intermediate',
    equipment: 'bodyweight',
    items: [
      { id: 'burpee', sets: 4, reps: '40s on', rest: 20 },
      { id: 'mountain-climber', sets: 4, reps: '40s on', rest: 20 },
      { id: 'jump-squat', sets: 4, reps: '40s on', rest: 20 },
      { id: 'high-knees', sets: 4, reps: '40s on', rest: 20 },
    ],
  },
  {
    id: 'pm-core-crusher',
    name: 'Core Crusher',
    description: 'Fifteen minutes of focused core work.',
    level: 'beginner',
    equipment: 'bodyweight',
    items: [
      { id: 'plank', sets: 3, reps: '40s hold', rest: 30 },
      { id: 'dead-bug', sets: 3, reps: '10 each side', rest: 30 },
      { id: 'russian-twist', sets: 3, reps: '20', rest: 30 },
      { id: 'hanging-leg-raise', sets: 3, reps: '10', rest: 45 },
    ],
  },
];

const EQUIPMENT_RANK: Record<Equipment, number> = { bodyweight: 0, dumbbells: 1, full_gym: 2 };

export function canDoWithEquipment(required: Equipment, available: Equipment | null): boolean {
  return EQUIPMENT_RANK[required] <= EQUIPMENT_RANK[available ?? 'full_gym'];
}

/** Turns a pre-made workout into template exercises (ready to start or save). */
export function premadeToExercises(workout: PremadeWorkout, makeId: () => string, unit: 'kg' | 'lbs'): TemplateExercise[] {
  return workout.items
    .filter((i) => EXERCISES_BY_ID[i.id])
    .map((i) => {
      const lib = EXERCISES_BY_ID[i.id];
      return {
        id: makeId(),
        name: lib.name,
        libraryId: lib.id,
        muscleGroup: lib.primary,
        sets: i.sets,
        reps: i.reps,
        weight: null,
        unit,
        restSeconds: i.rest,
      };
    });
}

/** Muscle groups a pre-made workout trains (primary muscles of its exercises). */
export function premadeMuscles(workout: PremadeWorkout): MuscleGroup[] {
  const set = new Set<MuscleGroup>();
  workout.items.forEach((i) => {
    const lib = EXERCISES_BY_ID[i.id];
    if (lib) set.add(lib.primary);
  });
  return Array.from(set);
}
