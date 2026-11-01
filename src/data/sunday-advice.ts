import type { Goal, Level, MuscleGroup } from '@/types';
import type { SetCounts } from '@/utils/workout';
import { capitalise } from '@/utils/workout';

/**
 * Sunday Weekly Review copy. All text is pre-written (no AI). The card combines
 * a goal × level message with a short, data-driven summary of the user's week.
 */

interface AdviceCopy {
  headline: string;
  focus: string;
  tip: string;
}

export const SUNDAY_ADVICE: Record<Goal, Record<Level, AdviceCopy>> = {
  fat_loss: {
    beginner: {
      headline: 'Momentum beats perfection.',
      focus:
        'Next week, aim to match this week\'s sessions and add one 20–30 minute walk on a rest day. Daily movement adds up faster than you think.',
      tip: 'Prep two protein-rich lunches tonight — it removes one decision on your busiest days.',
    },
    intermediate: {
      headline: 'Keep the muscle, lose the fat.',
      focus:
        'Prioritise your compound lifts next week and try to hold or beat your working weights. Strength maintained in a deficit means the weight you lose is fat.',
      tip: 'Check your weekly average weight, not single weigh-ins. Daily fluctuations of 1–2kg are normal.',
    },
    advanced: {
      headline: 'Precision week.',
      focus:
        'Keep training intensity high but manage volume — drop 1 set from accessory work if recovery is lagging. Step count and protein are your non-negotiables.',
      tip: 'If you\'ve dieted for 10+ weeks, plan a 1–2 week maintenance break soon.',
    },
  },
  build_muscle: {
    beginner: {
      headline: 'Every rep is building the foundation.',
      focus:
        'Next week, try to add a rep or a small amount of weight to each main exercise. Beginners can progress almost every session — make the most of it.',
      tip: 'Hit your protein target every day this week: around 1.6–2.2g per kg of body weight.',
    },
    intermediate: {
      headline: 'Volume drives growth.',
      focus:
        'Aim for roughly 10–20 hard sets per muscle group per week. Look at the list below — bring up anything under 10 sets next week.',
      tip: 'Sleep is when you grow. Protect 7–9 hours, especially after leg day.',
    },
    advanced: {
      headline: 'Small wins compound.',
      focus:
        'Progress is slower now, so track it carefully. Push your lagging muscle group first in the session next week while you\'re fresh.',
      tip: 'Consider a deload if your lifts have stalled for 3+ weeks and joints are achy.',
    },
  },
  general_fitness: {
    beginner: {
      headline: 'You showed up — that\'s the hardest part.',
      focus:
        'Next week, aim for a mix: two strength sessions and one activity you enjoy (walk, swim, class). Balance keeps it fun and sustainable.',
      tip: 'Schedule your sessions in your calendar now like appointments.',
    },
    intermediate: {
      headline: 'Well-rounded is the goal.',
      focus:
        'Hit each major area — push, pull, legs and core — at least once next week, and include one session that gets your heart rate up.',
      tip: 'Add 5–10 minutes of mobility after two of your sessions.',
    },
    advanced: {
      headline: 'Keep it varied, keep it honest.',
      focus:
        'Challenge yourself with a new skill or format next week — a conditioning circuit, a new lift, or a timed effort — while keeping your base routine.',
      tip: 'Review your rating trend in History — if sessions feel consistently hard, schedule an easier week.',
    },
  },
  endurance: {
    beginner: {
      headline: 'Build the engine slowly.',
      focus:
        'Next week, keep most of your cardio at an easy, conversational pace and add 5–10 minutes to your longest session.',
      tip: 'Two short strength sessions a week reduce injury risk for runners and cyclists.',
    },
    intermediate: {
      headline: 'Easy days easy, hard days hard.',
      focus:
        'Aim for roughly 80% easy and 20% hard training. Include one quality session (intervals or tempo) next week and keep the rest relaxed.',
      tip: 'Fuel sessions over 75 minutes with 30–60g of carbs per hour.',
    },
    advanced: {
      headline: 'Sharpen the edge.',
      focus:
        'Keep your long session, one threshold session and one strength session. Don\'t increase total volume by more than ~10% next week.',
      tip: 'Monitor resting heart rate — a rise of 5+ bpm can signal you need more recovery.',
    },
  },
};

const MAIN_GROUPS: MuscleGroup[] = ['chest', 'back', 'shoulders', 'legs', 'glutes', 'core', 'biceps', 'triceps'];

export interface SundayReview {
  title: string;
  summary: string;
  focus: string;
  tip: string;
}

export function buildSundayReview(
  goal: Goal | null,
  level: Level | null,
  sessionsThisWeek: number,
  counts: SetCounts,
): SundayReview {
  const copy = SUNDAY_ADVICE[goal ?? 'general_fitness'][level ?? 'beginner'];
  const worked = MAIN_GROUPS.filter((g) => counts[g] > 0 || counts['full body'] > 0);
  const missed = MAIN_GROUPS.filter((g) => counts[g] === 0 && counts['full body'] === 0);
  const top = [...MAIN_GROUPS, 'cardio' as MuscleGroup].sort((a, b) => counts[b] - counts[a])[0];

  let summary: string;
  if (sessionsThisWeek === 0) {
    summary =
      'No workouts logged this week — and that\'s okay. Life happens. The best time to restart is tomorrow, so pick one session and lock it in.';
  } else {
    const sessions = `${sessionsThisWeek} session${sessionsThisWeek === 1 ? '' : 's'}`;
    const topText = counts[top] > 0 ? ` Most of your work went into ${top} (${counts[top]} sets).` : '';
    const coverage =
      worked.length >= 6
        ? ' Great all-round coverage.'
        : missed.length
          ? ` Areas you didn't hit: ${missed.slice(0, 4).map(capitalise).join(', ')}.`
          : '';
    summary = `You completed ${sessions} this week.${topText}${coverage}`;
  }

  return { title: copy.headline, summary, focus: copy.focus, tip: copy.tip };
}
