'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
  sources?: { title: string; url: string }[];
}

interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  queryCount: number;
  maxQueries: number;
  conversationId: string | null;
  isLoading: boolean;

  toggleOpen: () => void;
  open: () => void;
  close: () => void;
  addMessage: (role: 'user' | 'bot', text: string, sources?: { title: string; url: string }[]) => void;
  sendQuery: (text: string) => Promise<void>;
  resetQueryCount: () => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const useChatbotStore = create<ChatbotState>()((set, get) => ({
  isOpen: false,
  messages: [],
  queryCount: 0,
  maxQueries: 10,
  conversationId: null,
  isLoading: false,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  addMessage: (role, text, sources) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      text,
      timestamp: Date.now(),
      sources,
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  sendQuery: async (text) => {
    if (!text.trim()) return;

    const { isLoading, conversationId, addMessage } = get();
    if (isLoading) return;

    addMessage('user', text);
    set({ isLoading: true });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const { answer, sources, conversationId: newConversationId } = data;

      if (newConversationId) {
        set({ conversationId: newConversationId });
      }

      addMessage('bot', answer, sources);
      set((state) => ({ queryCount: state.queryCount + 1 }));
    } catch {
      addMessage('bot', "Sorry, I'm having trouble responding right now. Please try again.");
    } finally {
      set({ isLoading: false });
    }
  },

  resetQueryCount: () => set({ queryCount: 0 }),
}));
