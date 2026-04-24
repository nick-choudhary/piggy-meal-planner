import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NutritionSummaryProps {
  summary: {
    dailyAverage: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    confidencePercent: number;
  };
}

export function NutritionSummary({ summary }: NutritionSummaryProps) {
  const { dailyAverage, confidencePercent } = summary;

  const macros = [
    {
      label: "Protein",
      value: dailyAverage.protein,
      unit: "g",
      target: "50-80g",
      color: "bg-blue-500",
    },
    {
      label: "Carbs",
      value: dailyAverage.carbs,
      unit: "g",
      target: "200-300g",
      color: "bg-amber-500",
    },
    {
      label: "Fat",
      value: dailyAverage.fat,
      unit: "g",
      target: "50-70g",
      color: "bg-rose-400",
    },
  ];

  const totalMacroGrams =
    dailyAverage.protein + dailyAverage.carbs + dailyAverage.fat;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Daily Nutrition
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {confidencePercent}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-semibold">
            {dailyAverage.calories.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">avg kcal / day</p>
        </div>

        {/* Macro bar */}
        <div className="flex rounded-full overflow-hidden h-3">
          {macros.map((macro) => {
            const pct = (macro.value / totalMacroGrams) * 100;
            return (
              <div
                key={macro.label}
                className={`${macro.color} transition-all`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>

        <div className="space-y-2.5">
          {macros.map((macro) => (
            <div
              key={macro.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${macro.color}`} />
                <span className="text-sm">{macro.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {macro.value}
                  {macro.unit}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  {macro.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
