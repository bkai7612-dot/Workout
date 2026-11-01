import type { WeightUnit } from '@/types';

export const KG_PER_LB = 0.45359237;

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  return from === 'kg' ? value / KG_PER_LB : value * KG_PER_LB;
}

export function roundWeight(value: number, dp = 1): number {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
}

export function formatWeight(value: number | null | undefined, unit: WeightUnit, dp = 1): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${roundWeight(value, dp)} ${unit}`;
}

/** Converts then formats, e.g. formatAs(80, 'kg', 'lbs') -> "176.4 lbs". */
export function formatAs(value: number, from: WeightUnit, to: WeightUnit, dp = 1): string {
  return formatWeight(convertWeight(value, from, to), to, dp);
}

export function parseNumber(input: string): number | null {
  const cleaned = input.replace(',', '.').trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
