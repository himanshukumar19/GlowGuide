import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useChatbotStore } from "@/store/useChatbotStore";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

import skincareChemist from "@/assets/skincare_chemist.jpg";

export const ChatbotWidget = () => {
  const { isOpen, toggleOpen, messages } = useChatbotStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {isDesktop ? (
              <motion.div
                key="chatbot-desktop"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed top-0 right-0 z-50 h-full w-[400px] bg-card border-l border-border shadow-elevated flex flex-col"
              >
                <ChatHeader />
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-soft mb-4 animate-float">
                        <img src={skincareChemist} alt="Glowy" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-heading text-base font-bold text-foreground mb-1">
                        Chat with Glowy
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        Ask me anything about skincare products, routines, and
                        ingredients!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput />
              </motion.div>
            ) : (
              <motion.div
                key="chatbot-mobile"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed inset-0 z-50 bg-card flex flex-col"
              >
                <ChatHeader />
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-soft mb-4 animate-float">
                        <img src={skincareChemist} alt="Glowy" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-heading text-base font-bold text-foreground mb-1">
                        Chat with Glowy
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        Ask me anything about skincare products, routines, and
                        ingredients!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(53, 82, 69, 0.5)",
            "0 0 0 12px rgba(53, 82, 69, 0)",
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          },
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shadow-elevated bg-card border border-border"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? (
          <div className="w-full h-full flex items-center justify-center bg-primary text-white">
            <X className="h-6 w-6" />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img src={skincareChemist} alt="Glowy Chat" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
          </div>
        )}
      </motion.button>
    </>
  );
};
