'use client';

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { SkinAnalysisHistoryItem } from "@/data/analysisHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";

interface HealthTrendChartsProps {
  history: SkinAnalysisHistoryItem[];
}

const concernColors = ["#C58A7F", "#E8D4C0", "#7EC8A0", "#8EA8C3", "#B49ACB"];

function concernKey(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function concernLabel(name: string): string {
  return name.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const HealthTrendCharts = ({ history }: HealthTrendChartsProps) => {
  const concernSeries = Array.from(
    new Map(
      history.flatMap((item) =>
        item.concerns.map((concern) => [concernKey(concern.name), concern.name] as const)
      )
    )
  ).map(([key, name], index) => ({
    key,
    name: concernLabel(name),
    color: concernColors[index % concernColors.length],
  }));
  const concernKeys = concernSeries.map(({ key }) => key).join(",");
  const [selectedConcernKeys, setSelectedConcernKeys] = useState<string[]>(() =>
    concernSeries.map(({ key }) => key)
  );

  useEffect(() => {
    const availableKeys = new Set(concernSeries.map(({ key }) => key));
    setSelectedConcernKeys((selected) => [
      ...selected.filter((key) => availableKeys.has(key)),
      ...concernSeries
        .map(({ key }) => key)
        .filter((key) => !selected.includes(key)),
    ]);
  }, [concernKeys]);

  const toggleConcern = (key: string) => {
    setSelectedConcernKeys((selected) =>
      selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]
    );
  };

  // Format dates for charts (e.g., "Jan 10")
  const chartData = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => {
      const date = new Date(item.date);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      return {
        label,
        "Health Score": item.healthScore,
        ...Object.fromEntries(
          concernSeries.map(({ key }) => [
            key,
            item.concerns.find((concern) => concernKey(concern.name) === key)?.severity ?? 0,
          ])
        ),
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
          <div className="flex flex-wrap gap-x-3 gap-y-2 pt-3" aria-label="Concern markers">
            {concernSeries.map(({ key, name, color }) => (
              <label key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConcernKeys.includes(key)}
                  onChange={() => toggleConcern(key)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {name} severity
              </label>
            ))}
          </div>
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
              {selectedConcernKeys.length > 0 && (
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
                />
              )}
              {concernSeries.filter(({ key }) => selectedConcernKeys.includes(key)).map(({ key, name, color }) => (
                <Bar key={key} dataKey={key} name={`${name} Severity`} fill={color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
