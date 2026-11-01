import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import type { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  loaded: boolean;
  fetchMessages: () => Promise<void>;
  send: (userId: string, message: string) => Promise<void>;
  subscribe: (userId: string) => () => void;
  markRead: () => Promise<void>;
  reset: () => void;
}

let channel: RealtimeChannel | null = null;

const upsert = (list: ChatMessage[], msg: ChatMessage) =>
  [...list.filter((m) => m.id !== msg.id), msg].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loaded: false,

  fetchMessages: async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    set({ messages: (data ?? []) as ChatMessage[], loaded: true });
  },

  send: async (userId, message) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ user_id: userId, sender: 'user', message: message.trim() })
      .select('*')
      .single();
    if (error) throw error;
    set({ messages: upsert(get().messages, data as ChatMessage) });
  },

  subscribe: (userId) => {
    if (channel) supabase.removeChannel(channel);
    channel = supabase
      .channel(`chat:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const old = payload.old as Partial<ChatMessage>;
            set({ messages: get().messages.filter((m) => m.id !== old.id) });
          } else {
            set({ messages: upsert(get().messages, payload.new as ChatMessage) });
          }
        },
      )
      .subscribe();
    return () => {
      if (channel) supabase.removeChannel(channel);
      channel = null;
    };
  },

  markRead: async () => {
    const unread = get().messages.some((m) => m.sender === 'admin' && !m.read);
    if (!unread) return;
    await supabase.rpc('mark_admin_messages_read');
    set({ messages: get().messages.map((m) => (m.sender === 'admin' ? { ...m, read: true } : m)) });
  },

  reset: () => set({ messages: [], loaded: false }),
}));
