import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { WeightLog, WeightUnit } from '@/types';

interface WeightState {
  entries: WeightLog[]; // ascending by logged_at
  loaded: boolean;
  fetchEntries: () => Promise<void>;
  addEntry: (input: { userId: string; weight: number; unit: WeightUnit; loggedAt: Date; notes?: string }) => Promise<WeightLog>;
  deleteEntry: (id: string) => Promise<void>;
  reset: () => void;
}

const sortAsc = (a: WeightLog, b: WeightLog) =>
  new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime();

export const useWeightStore = create<WeightState>((set, get) => ({
  entries: [],
  loaded: false,
  fetchEntries: async () => {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .order('logged_at', { ascending: true });
    if (error) throw error;
    set({ entries: (data ?? []) as WeightLog[], loaded: true });
  },
  addEntry: async ({ userId, weight, unit, loggedAt, notes }) => {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ user_id: userId, weight, unit, logged_at: loggedAt.toISOString(), notes: notes?.trim() || null })
      .select('*')
      .single();
    if (error) throw error;
    const entry = data as WeightLog;
    set({ entries: [...get().entries, entry].sort(sortAsc) });
    return entry;
  },
  deleteEntry: async (id) => {
    const { error } = await supabase.from('weight_logs').delete().eq('id', id);
    if (error) throw error;
    set({ entries: get().entries.filter((e) => e.id !== id) });
  },
  reset: () => set({ entries: [], loaded: false }),
}));
