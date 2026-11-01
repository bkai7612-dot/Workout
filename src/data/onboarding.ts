import type { Equipment, Gender, Goal, Level } from '@/types';

export const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'fat_loss', label: 'Fat loss', description: 'Lose body fat while keeping muscle' },
  { value: 'build_muscle', label: 'Build muscle', description: 'Get bigger and stronger' },
  { value: 'general_fitness', label: 'General fitness', description: 'Feel fitter, healthier and more energetic' },
  { value: 'endurance', label: 'Improve endurance', description: 'Go longer and recover faster' },
];

export const DAYS_OPTIONS = [1, 2, 3, 4, 5];

export const LEVEL_OPTIONS: { value: Level; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to training or returning after a long break' },
  { value: 'intermediate', label: 'Intermediate', description: 'Training consistently for 6+ months' },
  { value: 'advanced', label: 'Advanced', description: 'Several years of structured training' },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  { value: 'bodyweight', label: 'Bodyweight only', description: 'No equipment needed' },
  { value: 'dumbbells', label: 'Home gym with dumbbells', description: 'Dumbbells, maybe a bench or bands' },
  { value: 'full_gym', label: 'Full gym', description: 'Barbells, machines and cables' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const LEVEL_LABELS: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: 'Bodyweight only',
  dumbbells: 'Home gym with dumbbells',
  full_gym: 'Full gym',
};
