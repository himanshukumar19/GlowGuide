'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "pink" | "teal";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const updateThemeClass = (theme: Theme) => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (theme === "teal") {
    root.classList.add("teal-theme");
  } else {
    root.classList.remove("teal-theme");
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "pink",
      toggleTheme: () => {
        const nextTheme = get().theme === "pink" ? "teal" : "pink";
        set({ theme: nextTheme });
        updateThemeClass(nextTheme);
      },
      setTheme: (newTheme: Theme) => {
        set({ theme: newTheme });
        updateThemeClass(newTheme);
      }
    }),
    {
      name: "skincare-theme-store",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // Run update when store hydrates
        if (state) {
          updateThemeClass(state.theme);
        }
      }
    }
  )
);

export const useTheme = useThemeStore;
