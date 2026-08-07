'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { analysisApi, type AnalysisHistoryItem } from "@/api/analysis.api";
import { AnalysisComparison } from "@/components/analysis/AnalysisComparison";
import { DashboardErrorBoundary } from "@/components/analysis/DashboardErrorBoundary";
import { RecommendedProducts } from "@/components/analysis/RecommendedProducts";
import type { Analysis } from "@/lib/schemas/analysis";

function toHistoryItem(analysis: Analysis): AnalysisHistoryItem {
  return {
    id: analysis.id,
    date: analysis.createdAt,
    healthScore: analysis.result.healthScore,
    skinType: analysis.result.skinType,
    confidence: analysis.result.confidence,
    concerns: analysis.result.concerns.map((c) => ({
      name: c.name,
      severity: c.severity,
    })),
    notes: analysis.skinNotes ?? undefined,
    routine: analysis.result.routine,
  };
}

const AnalysisResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [analysisData, historyData] = await Promise.all([
          analysisApi.getById(id),
          analysisApi.getHistory(10),
        ]);

        if (cancelled) return;

        setAnalysis(analysisData);
        setHistory(historyData.items);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load analysis";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <CardContent className="space-y-4 pt-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="font-heading text-2xl font-bold">Analysis Not Found</h2>
            <p className="text-muted-foreground text-sm">
              {error || "This analysis result could not be found. It may have been removed or the link is invalid."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/analysis">New Analysis</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthScore = analysis.result.healthScore;
  const scoreColor = healthScore >= 70 ? "text-success" : healthScore >= 40 ? "text-warning" : "text-destructive";
  const currentItem = toHistoryItem(analysis);
  const comparisonHistory = [currentItem, ...history.filter((h) => h.id !== currentItem.id)];

  return (
    <div className="min-h-screen py-8 gradient-hero">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground text-sm">
              {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-5xl font-bold font-heading mb-2">
                <span className={scoreColor}>{healthScore}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Skin Health Score</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold font-heading capitalize mb-1 text-primary">{analysis.result.skinType}</div>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Skin Type</p>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(analysis.result.confidence * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {analysis.result.concerns.map((c) => (
                  <span
                    key={c.name}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize"
                  >
                    {c.name.replace(/_/g, " ")} ({c.severity})
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Detected Concerns</p>
            </CardContent>
          </Card>
        </div>

        <section className="mb-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Your Routine</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {([
              { title: "Morning Routine", steps: analysis.result.routine.morning },
              { title: "Night Routine", steps: analysis.result.routine.night },
            ] as const).map(({ title, steps }) => (
              <Card key={title} className="shadow-card">
                <CardContent className="p-6">
                  <h3 className="font-heading text-xl font-semibold mb-5">{title}</h3>
                  <ol className="space-y-5">
                    {steps.map((step, index) => (
                      <li key={`${step.productType}-${index}`} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{step.productType}</p>
                          <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <RecommendedProducts routine={analysis.result.routine} />

        {analysis.skinNotes && (
          <Card className="shadow-card mb-8">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground text-sm">{analysis.skinNotes}</p>
            </CardContent>
          </Card>
        )}

        {comparisonHistory.length >= 2 && (
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold mb-4">Compare with other analyses</h2>
            <DashboardErrorBoundary>
              <AnalysisComparison history={comparisonHistory} />
            </DashboardErrorBoundary>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/analysis">New Analysis</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsPage;
