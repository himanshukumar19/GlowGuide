import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "pink" | "teal";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("skincare-theme");
    return (saved as Theme) || "pink";
  });

  useEffect(() => {
    localStorage.setItem("skincare-theme", theme);
    const root = document.documentElement;
    
    if (theme === "teal") {
      root.classList.add("teal-theme");
    } else {
      root.classList.remove("teal-theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "pink" ? "teal" : "pink"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
