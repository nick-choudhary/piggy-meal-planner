"use client";

import { useState } from "react";
import { samplePlan } from "@/lib/sample-plan";
import type { WeeklyPlan } from "@/lib/sample-plan";
import { Header } from "@/components/header";
import { StatsBar } from "@/components/stats-bar";
import { WeeklyCalendar } from "@/components/weekly-calendar";
import { CostBreakdown } from "@/components/cost-breakdown";
import { GroceryList } from "@/components/grocery-list";
import { NutritionSummary } from "@/components/nutrition-summary";
import {
  PreferencesForm,
  type UserPreferences,
} from "@/components/preferences-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings2 } from "lucide-react";

export default function Home() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleGenerate = async (prefs: UserPreferences) => {
    setIsLoading(true);

    // Simulate plan generation delay (in production, this calls the backend)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use sample plan with the user's budget applied
    const generated = {
      ...samplePlan,
      costBreakdown: {
        ...samplePlan.costBreakdown,
        weeklyBudget: prefs.budget,
        remainingBudget: prefs.budget - samplePlan.costBreakdown.totalCost,
      },
    };

    setPlan(generated);
    setShowForm(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showForm ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Plan your week of meals
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Set your budget, dietary preferences, and health goals. Piggy
                will generate an optimized 7-day meal plan across home cooking,
                delivery, and dining out.
              </p>
            </div>
            <PreferencesForm
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </>
        ) : plan ? (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(true)}
                className="gap-1.5 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Preferences
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
                className="gap-1.5"
              >
                <Settings2 className="w-4 h-4" />
                Adjust Plan
              </Button>
            </div>
            <StatsBar plan={plan} />
            <WeeklyCalendar days={plan.days} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CostBreakdown breakdown={plan.costBreakdown} />
              <NutritionSummary summary={plan.nutritionSummary} />
              <GroceryList grocery={plan.groceryList} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
