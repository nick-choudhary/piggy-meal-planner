import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, Truck, MapPin } from "lucide-react";

interface CostBreakdownProps {
  breakdown: {
    totalCost: number;
    instamartCost: number;
    foodDeliveryCost: number;
    dineoutCost: number;
    remainingBudget: number;
    weeklyBudget: number;
  };
}

export function CostBreakdown({ breakdown }: CostBreakdownProps) {
  const usedPercent = Math.round(
    (breakdown.totalCost / breakdown.weeklyBudget) * 100,
  );

  const categories = [
    {
      label: "Groceries",
      value: breakdown.instamartCost,
      icon: Home,
      color: "text-emerald-600",
    },
    {
      label: "Delivery",
      value: breakdown.foodDeliveryCost,
      icon: Truck,
      color: "text-amber-600",
    },
    {
      label: "Dine Out",
      value: breakdown.dineoutCost,
      icon: MapPin,
      color: "text-violet-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-2xl font-semibold">
              ₹{breakdown.totalCost.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              of ₹{breakdown.weeklyBudget.toLocaleString()}
            </span>
          </div>
          <Progress value={usedPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            ₹{breakdown.remainingBudget.toLocaleString()} remaining (
            {100 - usedPercent}%)
          </p>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                <span className="text-sm">{cat.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  ₹{cat.value.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({Math.round((cat.value / breakdown.totalCost) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
