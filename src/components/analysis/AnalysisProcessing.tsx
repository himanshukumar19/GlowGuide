'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AnalysisProcessingProps {
  statusText?: string;
}

const STEPS = [
  "Aligning multi-angle facial scans...",
  "Running skin type and concern models...",
  "Cross-referencing quiz answers with image signals...",
  "Calculating your skin health score...",
  "Preparing your personalized routine...",
  "Saving your analysis securely..."
];

export const AnalysisProcessing = ({ statusText }: AnalysisProcessingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center animate-fade-in">
      <Card className="w-full max-w-md p-8 rounded-gg-lg relative overflow-hidden border-0 shadow-elevated">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[8px]" style={{ backgroundImage: 'url(/analysis-bg.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <CardContent className="space-y-8 flex flex-col items-center pt-6 relative z-10">
          {/* DNA Helix Loader */}
          <div className="dna-loader relative w-48 h-16 flex items-center justify-between">
            {Array.from({ length: 14 }).map((_, i) => {
              // Custom delay and positions for sine wave effect
              const delay = `${i * 0.15}s`;
              return (
                <div key={i} className="dna-node flex flex-col justify-between h-full items-center">
                  <div
                    className="dna-dot top-dot w-2 h-2 rounded-full bg-primary"
                    style={{ animationDelay: delay }}
                  />
                  <div
                    className="dna-bar w-0.5 h-10 bg-white/20"
                    style={{ animationDelay: delay }}
                  />
                  <div
                    className="dna-dot bottom-dot w-2 h-2 rounded-full bg-secondary"
                    style={{ animationDelay: delay }}
                  />
                </div>
              );
            })}
          </div>

          {/* Spinner & Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                 Skin analysis running
              </span>
            </div>
            
            <h3 className="font-heading text-lg font-bold text-white h-7 overflow-hidden">
              {statusText || STEPS[currentStep]}
            </h3>
            
            <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              The first analysis may take up to a minute while the service wakes up. You can keep this screen open while your result is prepared.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Styled DNA animations */}
      <style>{`
        .dna-node {
          animation: nodeMove 2.5s ease-in-out infinite alternate;
        }
        .dna-dot {
          animation: dotPulse 1.25s ease-in-out infinite alternate;
        }
        .top-dot {
          animation-name: topMove;
        }
        .bottom-dot {
          animation-name: bottomMove;
        }
        .dna-bar {
          animation: barScale 1.25s ease-in-out infinite alternate;
        }

        @keyframes topMove {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(20px) scale(0.6); opacity: 0.5; }
          100% { transform: translateY(40px) scale(1); opacity: 1; }
        }

        @keyframes bottomMove {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(0.6); opacity: 0.5; }
          100% { transform: translateY(-40px) scale(1); opacity: 1; }
        }

        @keyframes barScale {
          0%, 100% { transform: scaleY(1); opacity: 0.4; }
          50% { transform: scaleY(0.1); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};
