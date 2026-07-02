'use client';

import { useState, useRef, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { useChatbotStore } from "@/store/useChatbotStore";
import { useAuth } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export const ChatInput = () => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendQuery, queryCount, maxQueries } = useChatbotStore();
  const { customer } = useAuth();

  const isPaid = customer?.subscriptionTier === "PAID";
  const isAtLimit = !isPaid && queryCount >= maxQueries;
  const remaining = maxQueries - queryCount;
  const trimmed = text.trim();

  const handleSubmit = useCallback(() => {
    if (!trimmed || isAtLimit) return;
    sendQuery(trimmed, isPaid);
    setText("");
    inputRef.current?.focus();
  }, [trimmed, isAtLimit, sendQuery, isPaid]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm">
      {isAtLimit && (
        <p className="text-xs text-muted-foreground text-center mb-2">
          You've used {queryCount}/{maxQueries} free queries today.{" "}
          <button className="text-primary underline font-medium hover:text-primary-hover transition-colors">
            Upgrade for unlimited
          </button>
        </p>
      )}

      {!isAtLimit && remaining > 0 && remaining <= 2 && (
        <p className="text-xs text-muted-foreground text-center mb-2">
          {remaining} query{remaining !== 1 ? "ies" : "y"} remaining today
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about products, skin concerns..."
          disabled={isAtLimit}
          className={cn(
            "flex-1 h-10 px-4 py-2 rounded-gg bg-muted border border-border text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />

        <button
          onClick={handleSubmit}
          disabled={!trimmed || isAtLimit}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
            trimmed && !isAtLimit
              ? "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95"
              : "bg-muted text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};