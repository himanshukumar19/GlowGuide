import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  className?: string;
}

const AdminStatsCard = ({ icon: Icon, label, value, trend, className }: AdminStatsCardProps) => {
  return (
    <Card className={cn("shadow-soft", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-semibold",
                    trend.direction === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.direction === "up" ? "+" : "-"}{trend.percentage}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatsCard;
