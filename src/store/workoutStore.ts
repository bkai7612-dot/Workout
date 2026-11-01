import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { TemplateExercise, WorkoutLog, WorkoutTemplate } from '@/types';
import { estimateTemplateMinutes } from '@/utils/workout';

export interface TemplateInput {
  name: string;
  description: string | null;
  exercises: TemplateExercise[];
}

interface WorkoutState {
  templates: WorkoutTemplate[];
  logs: WorkoutLog[];
  templatesLoaded: boolean;
  logsLoaded: boolean;
  fetchTemplates: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  createTemplate: (userId: string, input: TemplateInput) => Promise<WorkoutTemplate>;
  updateTemplate: (id: string, input: TemplateInput) => Promise<WorkoutTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  saveLog: (log: Omit<WorkoutLog, 'id' | 'created_at'>) => Promise<WorkoutLog>;
  deleteLog: (id: string) => Promise<void>;
  reset: () => void;
}

function friendlyTemplateError(e: { message?: string }) {
  if (e.message?.includes('TEMPLATE_LIMIT')) {
    return new Error('TEMPLATE_LIMIT');
  }
  return e;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  templates: [],
  logs: [],
  templatesLoaded: false,
  logsLoaded: false,

  fetchTemplates: async () => {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    set({ templates: (data ?? []) as WorkoutTemplate[], templatesLoaded: true });
  },

  fetchLogs: async () => {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    set({ logs: (data ?? []) as WorkoutLog[], logsLoaded: true });
  },

  createTemplate: async (userId, input) => {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        exercises: input.exercises,
        estimated_minutes: estimateTemplateMinutes(input.exercises),
      })
      .select('*')
      .single();
    if (error) throw friendlyTemplateError(error);
    const tpl = data as WorkoutTemplate;
    set({ templates: [tpl, ...get().templates] });
    return tpl;
  },

  updateTemplate: async (id, input) => {
    const { data, error } = await supabase
      .from('workout_templates')
      .update({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        exercises: input.exercises,
        estimated_minutes: estimateTemplateMinutes(input.exercises),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    const tpl = data as WorkoutTemplate;
    set({ templates: [tpl, ...get().templates.filter((t) => t.id !== id)] });
    return tpl;
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id);
    if (error) throw error;
    set({ templates: get().templates.filter((t) => t.id !== id) });
  },

  saveLog: async (log) => {
    const { data, error } = await supabase.from('workout_logs').insert(log).select('*').single();
    if (error) throw error;
    const saved = data as WorkoutLog;
    set({
      logs: [saved, ...get().logs].sort(
        (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
      ),
    });
    return saved;
  },

  deleteLog: async (id) => {
    const { error } = await supabase.from('workout_logs').delete().eq('id', id);
    if (error) throw error;
    set({ logs: get().logs.filter((l) => l.id !== id) });
  },

  reset: () => set({ templates: [], logs: [], templatesLoaded: false, logsLoaded: false }),
}));
