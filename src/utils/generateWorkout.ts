import { EXERCISES } from '@/data/exercises';
import type {
  Equipment,
  ExerciseEquipment,
  Goal,
  LibraryExercise,
  Level,
  MuscleGroup,
  TemplateExercise,
  WeightUnit,
} from '@/types';
import { uid } from './id';
import { capitalise } from './workout';

const EQUIPMENT_ALLOWED: Record<Equipment, ExerciseEquipment[]> = {
  bodyweight: ['bodyweight', 'band'],
  dumbbells: ['bodyweight', 'band', 'dumbbell', 'kettlebell'],
  full_gym: ['bodyweight', 'band', 'dumbbell', 'kettlebell', 'barbell', 'machine', 'cable'],
};

interface Prescription {
  sets: number;
  reps: string;
  rest: number;
}

function prescription(muscle: MuscleGroup, goal: Goal | null, level: Level | null): Prescription {
  if (muscle === 'cardio') return { sets: 4, reps: '40s on', rest: 20 };
  if (muscle === 'core') return { sets: 3, reps: '12–15', rest: 45 };
  const sets = level === 'beginner' ? 3 : level === 'advanced' ? 4 : 3;
  switch (goal) {
    case 'build_muscle':
      return { sets, reps: '8–12', rest: 90 };
    case 'fat_loss':
      return { sets, reps: '12–15', rest: 60 };
    case 'endurance':
      return { sets, reps: '15–20', rest: 45 };
    default:
      return { sets, reps: '10–12', rest: 75 };
  }
}

/** Small deterministic PRNG so "Shuffle" gives a new but reproducible mix. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export interface GeneratedWorkout {
  name: string;
  exercises: TemplateExercise[];
}

/**
 * Builds a workout for the selected muscle groups from the exercise library,
 * respecting the user's equipment, goal and level.
 */
export function generateWorkout(opts: {
  muscles: MuscleGroup[];
  equipment: Equipment | null;
  goal: Goal | null;
  level: Level | null;
  unit: WeightUnit;
  seed?: number;
}): GeneratedWorkout {
  const { muscles, equipment, goal, level, unit, seed = 1 } = opts;
  if (muscles.length === 0) return { name: 'Custom workout', exercises: [] };

  const allowed = EQUIPMENT_ALLOWED[equipment ?? 'full_gym'];
  const rand = seeded(seed * 9973 + muscles.length);
  const perMuscle = muscles.length === 1 ? 5 : muscles.length === 2 ? 3 : 2;
  const maxTotal = 8;
  const used = new Set<string>();
  const exercises: TemplateExercise[] = [];

  const pick = (pool: LibraryExercise[], n: number) =>
    pool
      .filter((e) => !used.has(e.id))
      .map((e) => ({ e, r: rand() }))
      .sort((a, b) => a.r - b.r)
      .slice(0, n)
      .map((x) => x.e);

  for (const muscle of muscles) {
    if (exercises.length >= maxTotal) break;
    const target = Math.min(perMuscle, maxTotal - exercises.length);
    // Prefer exercises whose primary muscle matches and that fit the equipment.
    let chosen = pick(EXERCISES.filter((e) => e.primary === muscle && allowed.includes(e.equipment)), target);
    if (chosen.length < target) {
      chosen = chosen.concat(
        pick(
          EXERCISES.filter((e) => e.secondary.includes(muscle) && allowed.includes(e.equipment) && !chosen.includes(e)),
          target - chosen.length,
        ),
      );
    }
    // Compound / free-weight movements first within each muscle group.
    const order: ExerciseEquipment[] = ['barbell', 'dumbbell', 'kettlebell', 'bodyweight', 'machine', 'cable', 'band'];
    chosen.sort((a, b) => order.indexOf(a.equipment) - order.indexOf(b.equipment));
    for (const lib of chosen) {
      used.add(lib.id);
      const p = prescription(muscle, goal, level);
      exercises.push({
        id: uid(),
        name: lib.name,
        libraryId: lib.id,
        muscleGroup: muscle,
        sets: p.sets,
        reps: p.reps,
        weight: null,
        unit,
        restSeconds: p.rest,
      });
    }
  }

  const name =
    muscles.length <= 3 ? `${muscles.map(capitalise).join(' & ')} workout` : `Custom ${muscles.length}-muscle workout`;
  return { name, exercises };
}
