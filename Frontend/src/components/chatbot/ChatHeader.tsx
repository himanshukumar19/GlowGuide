import { X } from "lucide-react";
import { useChatbotStore } from "@/store/useChatbotStore";
import { useAuth } from "@/store/useAuthStore";

export const ChatHeader = () => {
  const { close, queryCount, maxQueries } = useChatbotStore();
  const { customer } = useAuth();
  const isPaid = customer?.subscriptionTier === "paid";

  return (
    <div className="gradient-primary px-5 py-4">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="font-heading text-lg font-bold text-white">
          GlowGuide Assistant
        </h3>
        <button
          onClick={close}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close chatbot"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="text-sm text-white/70">Ask me anything about skincare</p>

      <div className="mt-2">
        {isPaid ? (
          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full">
            Unlimited
          </span>
        ) : (
          <span className="text-[10px] text-white/60 font-medium">
            {queryCount}/{maxQueries} today
          </span>
        )}
      </div>
    </div>
  );
};
