'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Info, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "@/store/useChatbotStore";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const skincareChemist = "/images/skincare-chemist.jpg";

const DISCLAIMER_RE =
  /(?:^|\n)\s*(?:\*{1,2})?This is not medical advice[.!?]?\s*Please consult a dermatologist for diagnosis or treatment\.?\s*(?:\*{1,2})?\s*$/i;

const SOURCE_TYPE_LABELS: Record<string, string> = {
  peer_reviewed: "PubMed",
  dataset: "Dataset",
  web: "Web",
  web_live: "Live Web",
};

function splitDisclaimer(text: string): { body: string; disclaimer: string | null } {
  const match = text.match(DISCLAIMER_RE);
  if (!match) return { body: text, disclaimer: null };
  return {
    body: text.slice(0, match.index).trim(),
    disclaimer: match[0].replace(/[*_]/g, "").trim(),
  };
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const { body, disclaimer } = isUser
    ? { body: message.text, disclaimer: null }
    : splitDisclaimer(message.text);

  const sources = message.sources ?? [];

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
          {isUser ? (
            message.text
          ) : (
            <div className="space-y-2 [&_p]:m-0 [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-foreground/5 [&_code]:text-[13px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {body}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && disclaimer && (
          <div className="flex items-start gap-1.5 px-3 py-2 mt-1 rounded-gg-sm bg-muted/40 border-t border-border/50">
            <Info className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug text-muted-foreground/70">
              {disclaimer}
            </p>
          </div>
        )}

        {!isUser && sources.length > 0 && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center gap-1.5 px-3 py-1 mt-1 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded-full bg-muted/50 hover:bg-muted transition-colors"
                aria-expanded={sourcesOpen}
              >
                {sources.length} source{sources.length !== 1 ? "s" : ""}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    sourcesOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-1.5 space-y-1.5">
              {sources.map((source, idx) => {
                const badge = source.sourceType
                  ? SOURCE_TYPE_LABELS[source.sourceType] ?? source.sourceType
                  : null;

                const card = (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-gg-sm bg-muted/40 border border-border/40 hover:border-primary/30 transition-colors">
                    <span className="flex-1 text-xs font-medium text-foreground leading-snug break-words min-w-0">
                      {source.title}
                    </span>
                    {badge && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                  </div>
                );

                return source.url ? (
                  <a
                    key={`${source.url}-${idx}`}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={`source-${idx}`}>{card}</div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

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
