import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { Profile, ProfileUpdate } from '@/types';
import { useThemeStore } from './themeStore';

interface ProfileState {
  profile: Profile | null;
  /** True once we've attempted to load the profile for the current session. */
  loaded: boolean;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  createProfile: (userId: string, username: string) => Promise<Profile>;
  updateProfile: (patch: ProfileUpdate) => Promise<Profile>;
  isUsernameAvailable: (username: string) => Promise<boolean>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loaded: false,
  loading: false,

  fetchProfile: async (userId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      const profile = (data as Profile | null) ?? null;
      set({ profile, loaded: true });
      if (profile) useThemeStore.getState().setMode(profile.dark_mode);
      return profile;
    } finally {
      set({ loading: false });
    }
  },

  createProfile: async (userId, username) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, username: username.trim(), dark_mode: useThemeStore.getState().mode })
      .select('*')
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('That username is already taken.');
      throw error;
    }
    set({ profile: data as Profile, loaded: true });
    return data as Profile;
  },

  updateProfile: async (patch) => {
    const current = get().profile;
    if (!current) throw new Error('No profile loaded.');
    // Optimistic update so toggles feel instant.
    set({ profile: { ...current, ...patch } });
    if (patch.dark_mode) useThemeStore.getState().setMode(patch.dark_mode);
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', current.id)
      .select('*')
      .single();
    if (error) {
      set({ profile: current });
      if (current.dark_mode) useThemeStore.getState().setMode(current.dark_mode);
      if (error.code === '23505') throw new Error('That username is already taken.');
      throw error;
    }
    set({ profile: data as Profile });
    return data as Profile;
  },

  isUsernameAvailable: async (username) => {
    const { data, error } = await supabase.rpc('is_username_available', { candidate: username.trim() });
    if (error) throw error;
    return Boolean(data);
  },

  reset: () => set({ profile: null, loaded: false, loading: false }),
}));
