'use client';

import { create } from 'zustand';
import { CHATBOT_RESPONSES, FALLBACK_RESPONSE } from '@/data/chatbotData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  queryCount: number;
  maxQueries: number;

  toggleOpen: () => void;
  open: () => void;
  close: () => void;
  addMessage: (role: 'user' | 'bot', text: string) => void;
  sendQuery: (text: string, isPaid: boolean) => void;
  resetQueryCount: () => void;
}

function findResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of CHATBOT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return FALLBACK_RESPONSE;
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

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  addMessage: (role, text) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      text,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  sendQuery: (text, isPaid) => {
    const { queryCount, addMessage } = get();
    const max = isPaid ? Infinity : 10;

    if (!isPaid && queryCount >= 10) return;

    addMessage('user', text);
    const response = findResponse(text);
    addMessage('bot', response);
    set({ queryCount: queryCount + 1, maxQueries: max });
  },

  resetQueryCount: () => set({ queryCount: 0 }),
}));