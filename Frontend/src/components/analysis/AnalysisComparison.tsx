import { useState, useMemo } from "react";
import { SkinAnalysisHistoryItem } from "@/data/analysisHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Sparkles, TrendingUp, HelpCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalysisComparisonProps {
  history: SkinAnalysisHistoryItem[];
}

export const AnalysisComparison = ({ history }: AnalysisComparisonProps) => {
  // Sort chronological order
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  const [beforeId, setBeforeId] = useState<string>(() => {
    return sortedHistory[0]?.id || "";
  });

  const [afterId, setAfterId] = useState<string>(() => {
    return sortedHistory[sortedHistory.length - 1]?.id || "";
  });

  const beforeItem = useMemo(() => {
    return sortedHistory.find((item) => item.id === beforeId);
  }, [sortedHistory, beforeId]);

  const afterItem = useMemo(() => {
    return sortedHistory.find((item) => item.id === afterId);
  }, [sortedHistory, afterId]);

  const scoreDiff = useMemo(() => {
    if (!beforeItem || !afterItem) return 0;
    return afterItem.healthScore - beforeItem.healthScore;
  }, [beforeItem, afterItem]);

  return (
    <Card className="border border-border shadow-soft bg-card rounded-gg-lg">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Skin History Comparison
        </CardTitle>
        <CardDescription className="text-xs">
          Compare diagnostic reports side-by-side to review changes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Dropdowns */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Before / Baseline
            </span>
            <Select value={beforeId} onValueChange={setBeforeId}>
              <SelectTrigger className="rounded-gg-sm border-border bg-muted/20 text-xs">
                <SelectValue placeholder="Select older analysis" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-gg-sm">
                {sortedHistory.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {new Date(item.date).toLocaleDateString()} — {item.skinType.toUpperCase()} ({item.healthScore} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              After / Recent
            </span>
            <Select value={afterId} onValueChange={setAfterId}>
              <SelectTrigger className="rounded-gg-sm border-border bg-muted/20 text-xs">
                <SelectValue placeholder="Select recent analysis" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-gg-sm">
                {sortedHistory.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {new Date(item.date).toLocaleDateString()} — {item.skinType.toUpperCase()} ({item.healthScore} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {beforeItem && afterItem ? (
          <div className="space-y-6 animate-fade-in">
            {/* Health Score comparative stats */}
            <div className="p-4 rounded-gg bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  Diagnosis Impact Analysis
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comparison between baseline and your recent evaluation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-foreground">
                  {beforeItem.healthScore} ➔ {afterItem.healthScore}
                </span>
                <Badge
                  className={`font-black text-xs px-2.5 py-1 rounded-full uppercase border-0 ${
                    scoreDiff >= 0
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts
                </Badge>
              </div>
            </div>

            {/* Metrics table */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Old */}
              <Card className="border border-border/60 bg-muted/10 rounded-gg">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground font-semibold">Baseline Analysis</span>
                    <span className="text-xs text-foreground font-bold">
                      {new Date(beforeItem.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skin Type:</span>
                      <span className="font-bold text-foreground capitalize">{beforeItem.skinType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score Index:</span>
                      <span className="font-bold text-foreground">{beforeItem.healthScore} pts</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Symptoms & Concerns
                      </span>
                      {beforeItem.concerns.map((c) => (
                        <div key={c.name} className="flex justify-between items-center text-[11px]">
                          <span className="text-foreground/80 capitalize">{c.name.replace("_", " ")}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-secondary" style={{ width: `${c.severity}%` }} />
                            </div>
                            <span className="font-semibold text-foreground/90">{c.severity}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* New */}
              <Card className="border border-border/60 bg-muted/10 rounded-gg">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-primary font-bold">Recent Analysis</span>
                    <span className="text-xs text-foreground font-bold">
                      {new Date(afterItem.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skin Type:</span>
                      <span className="font-bold text-foreground capitalize">{afterItem.skinType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score Index:</span>
                      <span className="font-bold text-foreground">{afterItem.healthScore} pts</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Symptoms & Concerns
                      </span>
                      {afterItem.concerns.map((c) => (
                        <div key={c.name} className="flex justify-between items-center text-[11px]">
                          <span className="text-foreground/80 capitalize">{c.name.replace("_", " ")}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${c.severity}%` }} />
                            </div>
                            <span className="font-semibold text-foreground/90">{c.severity}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic text-center py-6">
            Insufficient analysis data to compare. Take another skin quiz to build your profile!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
