import { useProfileStore } from '@/store/profileStore';
import type { WeightUnit } from '@/types';

export function useUnit(): WeightUnit {
  return useProfileStore((s) => s.profile?.weight_unit ?? 'kg');
}
