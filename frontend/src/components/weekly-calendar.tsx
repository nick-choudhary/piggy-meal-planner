"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Truck, MapPin } from "lucide-react";
import type { DayPlan, ResolvedMeal } from "@/lib/sample-plan";

const DAY_LABELS: Record<string, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

const SOURCE_CONFIG = {
  INSTAMART: {
    label: "Home",
    icon: Home,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  FOOD_DELIVERY: {
    label: "Delivery",
    icon: Truck,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  DINEOUT: {
    label: "Dine Out",
    icon: MapPin,
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
};

interface WeeklyCalendarProps {
  days: DayPlan[];
}

export function WeeklyCalendar({ days }: WeeklyCalendarProps) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.dayOfWeek || "MON");

  const activeDay = days.find((d) => d.dayOfWeek === selectedDay) || days[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Weekly Meal Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="w-full grid grid-cols-7 mb-4">
            {days.map((day) => (
              <TabsTrigger
                key={day.dayOfWeek}
                value={day.dayOfWeek}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">
                  {DAY_LABELS[day.dayOfWeek]}
                </span>
                <span className="sm:hidden">
                  {DAY_LABELS[day.dayOfWeek].charAt(0)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map((day) => (
            <TabsContent key={day.dayOfWeek} value={day.dayOfWeek}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">{formatDate(day.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.dailyNutrition.calories} kcal &middot; ₹{day.dailyCost}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {getMealTypeCounts(day).map(({ type, count }) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={`text-xs ${SOURCE_CONFIG[type].color}`}
                    >
                      {count} {SOURCE_CONFIG[type].label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {day.meals.map((meal) => (
                  <MealCard key={meal.slotId} meal={meal} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MealCard({ meal }: { meal: ResolvedMeal }) {
  const config = SOURCE_CONFIG[meal.sourceType];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {meal.mealType}
        </span>
        <Badge variant="outline" className={`text-xs gap-1 ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </div>

      <div>
        <p className="font-medium text-sm leading-snug">
          {meal.items[0]?.name}
        </p>
        {meal.fallbackUsed && (
          <p className="text-xs text-amber-600 mt-0.5">
            Fallback — connect MCP for live data
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{meal.estimatedNutrition.calories} kcal</span>
        <span className="font-medium text-foreground">
          ₹{meal.estimatedCost}
        </span>
      </div>

      <div className="flex gap-2">
        <NutrientPill
          label="P"
          value={meal.estimatedNutrition.protein}
          unit="g"
        />
        <NutrientPill
          label="C"
          value={meal.estimatedNutrition.carbs}
          unit="g"
        />
        <NutrientPill label="F" value={meal.estimatedNutrition.fat} unit="g" />
      </div>
    </div>
  );
}

function NutrientPill({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>
      {value}
      {unit}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getMealTypeCounts(day: DayPlan) {
  const counts = new Map<string, number>();
  for (const meal of day.meals) {
    counts.set(meal.sourceType, (counts.get(meal.sourceType) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([type, count]) => ({
    type: type as keyof typeof SOURCE_CONFIG,
    count,
  }));
}
