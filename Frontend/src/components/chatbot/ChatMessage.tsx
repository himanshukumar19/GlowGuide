import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/store/useChatbotStore";
import { cn } from "@/lib/utils";
const skincareChemist = "/images/skincare-chemist.jpg";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex gap-3 items-end", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20">
          <img src={skincareChemist} alt="Glowy" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={cn("max-w-[80%] space-y-1")}>
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-gg rounded-br-sm"
              : "bg-muted text-foreground rounded-gg rounded-bl-sm"
          )}
        >
          {message.text}
        </div>
        <p
          className={cn(
            "text-[10px] text-muted-foreground px-1",
            isUser ? "text-right" : "text-left"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  );
};
