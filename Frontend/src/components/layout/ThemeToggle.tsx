import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { Droplets, Heart } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 rounded-full bg-secondary px-4 py-2 transition-colors hover:bg-secondary/80"
      aria-label={`Switch to ${theme === "pink" ? "teal" : "pink"} theme`}
    >
      <motion.div
        className="absolute inset-0 rounded-full gradient-primary opacity-20"
        initial={false}
        animate={{ opacity: theme === "pink" ? 0.2 : 0.3 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        initial={false}
        animate={{ scale: theme === "pink" ? 1 : 0.8, opacity: theme === "pink" ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <Heart className="h-4 w-4 text-primary" />
      </motion.div>
      
      <motion.div
        className="h-5 w-10 rounded-full bg-muted relative"
        initial={false}
      >
        <motion.div
          className="absolute top-0.5 h-4 w-4 rounded-full gradient-primary"
          initial={false}
          animate={{ left: theme === "pink" ? "2px" : "22px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ scale: theme === "teal" ? 1 : 0.8, opacity: theme === "teal" ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <Droplets className="h-4 w-4 text-primary" />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
