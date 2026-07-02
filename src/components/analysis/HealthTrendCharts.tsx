'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { SkinAnalysisHistoryItem } from "@/data/analysisHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";

interface HealthTrendChartsProps {
  history: SkinAnalysisHistoryItem[];
}

export const HealthTrendCharts = ({ history }: HealthTrendChartsProps) => {
  // Format dates for charts (e.g., "Jan 10")
  const chartData = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => {
      const date = new Date(item.date);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Extract specific concern levels for the bar chart
      const acne = item.concerns.find((c) => c.name === "acne")?.severity || 0;
      const pores = item.concerns.find((c) => c.name === "pore_size")?.severity || 0;
      const sebum = item.concerns.find((c) => c.name === "sebum_level")?.severity || 0;
      
      return {
        label,
        "Health Score": item.healthScore,
        "Acne Severity": acne,
        "Pore Visibility": pores,
        "Sebum Output": sebum,
      };
    });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Health Score Line Chart */}
      <Card className="border border-border shadow-soft bg-card rounded-gg-lg">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Skin Health Progress
          </CardTitle>
          <CardDescription className="text-xs">
            Overall wellness score trend over time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBE7" />
              <XAxis
                dataKey="label"
                stroke="#7A7A7A"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#7A7A7A"
                fontSize={10}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #DCE3DE",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
              />
              <Line
                type="monotone"
                dataKey="Health Score"
                stroke="#3B5D4E"
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ stroke: "#3B5D4E", strokeWidth: 2, fill: "#ffffff", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Concerns Progress Bar Chart */}
      <Card className="border border-border shadow-soft bg-card rounded-gg-lg">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            Concern Marker Severity
          </CardTitle>
          <CardDescription className="text-xs">
            Symptom index reduction over active months
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBE7" />
              <XAxis
                dataKey="label"
                stroke="#7A7A7A"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#7A7A7A"
                fontSize={10}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #DCE3DE",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
              />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
              <Bar dataKey="Acne Severity" fill="#C58A7F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pore Visibility" fill="#E8D4C0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sebum Output" fill="#7EC8A0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};