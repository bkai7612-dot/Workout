export const NUDGES: string[] = [
  'It\'s been a few days. Even 20 minutes today counts — momentum is built one session at a time.',
  'Your future self is built by what you do today. Fancy a quick session?',
  'Missed a few days? No guilt. Just pick the next workout and get it done.',
  'Consistency beats intensity. A short session today keeps the habit alive.',
  'You don\'t need motivation to start — starting creates motivation. Let\'s go.',
];

export function pickNudge(seed: number): string {
  return NUDGES[Math.abs(seed) % NUDGES.length];
}
