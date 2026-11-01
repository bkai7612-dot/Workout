import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
}

let listenerAttached = false;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  init: async () => {
    if (!listenerAttached) {
      listenerAttached = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    }
    try {
      const { data } = await supabase.auth.getSession();
      set({ session: data.session });
    } catch {
      set({ session: null });
    } finally {
      set({ initialized: true });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
