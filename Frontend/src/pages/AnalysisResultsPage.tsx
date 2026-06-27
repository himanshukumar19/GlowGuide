import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { MOCK_HISTORY } from "@/data/analysisHistory";
import { AnalysisComparison } from "@/components/analysis/AnalysisComparison";
import { DashboardErrorBoundary } from "@/components/analysis/DashboardErrorBoundary";

const AnalysisResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const analysis = MOCK_HISTORY.find((a) => a.id === id);

  if (!analysis) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent className="space-y-4 pt-6">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="font-heading text-2xl font-bold">Analysis Not Found</h2>
              <p className="text-muted-foreground text-sm">
                This analysis result could not be found. It may have been removed or the link is invalid.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link to="/analysis">New Analysis</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const healthScore = analysis.healthScore;
  const scoreColor = healthScore >= 70 ? "text-success" : healthScore >= 40 ? "text-warning" : "text-destructive";

  return (
    <Layout>
      <div className="min-h-screen py-8 gradient-hero">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-heading text-3xl font-bold">Analysis Results</h1>
              <p className="text-muted-foreground text-sm">
                {new Date(analysis.date).toLocaleDateString("en-US", {
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
                <div className="text-2xl font-bold font-heading capitalize mb-1 text-primary">{analysis.skinType}</div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Skin Type</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {analysis.concerns.map((c) => (
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

          {analysis.notes && (
            <Card className="shadow-card mb-8">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground text-sm">{analysis.notes}</p>
              </CardContent>
            </Card>
          )}

          {MOCK_HISTORY.length >= 2 && (
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Compare with other analyses</h2>
              <DashboardErrorBoundary>
                <AnalysisComparison history={MOCK_HISTORY} />
              </DashboardErrorBoundary>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/analysis">New Analysis</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalysisResultsPage;
