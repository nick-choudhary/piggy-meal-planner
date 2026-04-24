import { Card } from "@/components/ui/card";
import {
  IndianRupee,
  Flame,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import type { WeeklyPlan } from "@/lib/sample-plan";

interface StatsBarProps {
  plan: WeeklyPlan;
}

export function StatsBar({ plan }: StatsBarProps) {
  const stats = [
    {
      label: "Weekly Budget",
      value: `₹${plan.costBreakdown.totalCost.toLocaleString()}`,
      sub: `of ₹${plan.costBreakdown.weeklyBudget.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Avg Calories",
      value: plan.nutritionSummary.dailyAverage.calories.toLocaleString(),
      sub: "kcal / day",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Home Cooked",
      value: plan.days
        .reduce(
          (sum, d) =>
            sum + d.meals.filter((m) => m.sourceType === "INSTAMART").length,
          0,
        )
        .toString(),
      sub: "meals this week",
      icon: UtensilsCrossed,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Grocery Items",
      value: plan.groceryList.items.length.toString(),
      sub: `₹${plan.groceryList.totalCost} total`,
      icon: ShoppingCart,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 flex items-start gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} shrink-0`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
