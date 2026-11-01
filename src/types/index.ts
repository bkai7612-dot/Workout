export type WeightUnit = 'kg' | 'lbs';
export type ThemeMode = 'system' | 'dark' | 'light';

export type Goal = 'fat_loss' | 'build_muscle' | 'general_fitness' | 'endurance';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'bodyweight' | 'dumbbells' | 'full_gym';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'full body',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** Day keys used by the weekly plan: 0 = Sunday … 6 = Saturday (JS Date.getDay()). */
export type WeekdayKey = '0' | '1' | '2' | '3' | '4' | '5' | '6';
export type WeeklyPlan = Partial<Record<WeekdayKey, string>>; // weekday -> template id

export type SubscriptionStatus = 'none' | 'active' | 'trialing' | 'cancelled' | 'expired' | 'billing_issue';

export interface Profile {
  id: string;
  username: string;
  goal: Goal | null;
  level: Level | null;
  equipment: Equipment | null;
  days_per_week: number | null;
  gender: Gender | null;
  age: number | null;
  current_weight: number | null;
  weight_unit: WeightUnit;
  parq_completed: boolean;
  parq_cleared: boolean;
  onboarding_completed: boolean;
  dark_mode: ThemeMode;
  sunday_advice_enabled: boolean;
  notifications_enabled: boolean;
  weekly_plan: WeeklyPlan;
  plan_started_at: string | null;
  subscription_status: SubscriptionStatus;
  subscription_expiry: string | null;
  created_at: string;
}

export type ProfileUpdate = Partial<
  Omit<Profile, 'id' | 'created_at' | 'subscription_status' | 'subscription_expiry'>
>;

export interface TemplateExercise {
  id: string;
  name: string;
  libraryId?: string;
  sets: number;
  reps: string;
  weight: number | null;
  unit: WeightUnit;
  restSeconds: number;
  notes?: string;
  muscleGroup: MuscleGroup;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  exercises: TemplateExercise[];
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface SetLog {
  reps: number | null;
  weight: number | null;
  unit: WeightUnit;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetReps: string;
  restSeconds: number;
  notes: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  template_id: string | null;
  template_name: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  exercise_logs: ExerciseLog[];
  muscle_groups_hit: MuscleGroup[];
  rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  unit: WeightUnit;
  logged_at: string;
  notes: string | null;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'admin';
  message: string;
  read: boolean;
  created_at: string;
}

export type ExerciseEquipment =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'machine'
  | 'cable'
  | 'kettlebell'
  | 'band';

export interface LibraryExercise {
  id: string;
  name: string;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: ExerciseEquipment;
  instructions: string[];
}

export type NutritionCategory =
  | 'goal'
  | 'protein'
  | 'carbs'
  | 'hydration'
  | 'meal_timing'
  | 'supplements';

export interface NutritionTip {
  id: string;
  category: NutritionCategory;
  goals: Goal[] | 'all';
  title: string;
  body: string;
  premium: boolean;
}
