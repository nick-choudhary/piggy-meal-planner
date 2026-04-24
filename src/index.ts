import * as dotenv from "dotenv";
dotenv.config();

import { MealPlanOrchestrator } from "./components/orchestrator";
import { RawInput, GoalType, SourceType } from "./models";

export { MealPlanOrchestrator } from "./components/orchestrator";
export { IntakeProcessor } from "./components/intake-processor";
export { PlanGenerator } from "./components/plan-generator";
export { ConstraintSolver } from "./components/constraint-solver";
export { MealResolver } from "./components/meal-resolver";
export { Aggregator } from "./components/aggregator";
export * from "./models";

/**
 * Example usage — generates a weekly meal plan with sample input.
 */
async function main() {
  const orchestrator = new MealPlanOrchestrator();

  const sampleInput: RawInput = {
    budget: 5000,
    startDate: "2026-04-27", // next Monday
    location: { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
    preferences: {
      dietType: "VEGETARIAN",
      homeCookedRatio: 0.5,
      deliveryRatio: 0.3,
      dineoutRatio: 0.2,
      cuisines: ["Indian", "Italian", "Mediterranean"],
    },
    healthGoals: {
      goalType: GoalType.MAINTENANCE,
      dailyCalories: { min: 1800, max: 2200 },
      proteinGrams: { min: 50, max: 80 },
      carbsGrams: { min: 200, max: 300 },
      fatGrams: { min: 50, max: 70 },
    },
    allergies: ["peanuts"],
    schedule: [
      // Mon - busy workday
      [
        {
          title: "Standup",
          startTime: "2026-04-27T09:30:00",
          endTime: "2026-04-27T10:00:00",
          type: "MEETING" as any,
        },
        {
          title: "Sprint Planning",
          startTime: "2026-04-27T14:00:00",
          endTime: "2026-04-27T15:30:00",
          type: "MEETING" as any,
        },
      ],
      // Tue
      [
        {
          title: "Team Sync",
          startTime: "2026-04-28T10:00:00",
          endTime: "2026-04-28T10:30:00",
          type: "MEETING" as any,
        },
      ],
      // Wed
      [],
      // Thu
      [
        {
          title: "Client Call",
          startTime: "2026-04-30T11:00:00",
          endTime: "2026-04-30T12:00:00",
          type: "MEETING" as any,
        },
      ],
      // Fri
      [
        {
          title: "Retro",
          startTime: "2026-05-01T16:00:00",
          endTime: "2026-05-01T17:00:00",
          type: "MEETING" as any,
        },
      ],
      // Sat - free
      [],
      // Sun - free
      [],
    ],
  };

  console.log("🐷 Piggy Weekly Meal Planner");
  console.log("============================\n");

  const result = await orchestrator.generateWeeklyMealPlan(sampleInput);

  if (!result.success) {
    console.error("❌ Plan generation failed:", result.message);
    if (result.violations.length > 0) {
      console.error("Violations:");
      for (const v of result.violations) {
        console.error(`  - [${v.type}] ${v.message}`);
      }
    }
    return;
  }

  const plan = result.plan;
  console.log(`✅ Plan generated: ${plan.planId}\n`);

  // Cost breakdown
  console.log("💰 Cost Breakdown:");
  console.log(
    `  Total:      ₹${plan.costBreakdown.totalCost.amount.toFixed(0)}`,
  );
  console.log(
    `  Groceries:  ₹${plan.costBreakdown.instamartCost.amount.toFixed(0)}`,
  );
  console.log(
    `  Delivery:   ₹${plan.costBreakdown.foodDeliveryCost.amount.toFixed(0)}`,
  );
  console.log(
    `  Dine-out:   ₹${plan.costBreakdown.dineoutCost.amount.toFixed(0)}`,
  );
  console.log(
    `  Remaining:  ₹${plan.costBreakdown.remainingBudget.amount.toFixed(0)}\n`,
  );

  // Nutrition summary
  console.log("🥗 Daily Nutrition Average:");
  const avg = plan.nutritionSummary.dailyAverage;
  console.log(
    `  Calories: ${avg.calories} | Protein: ${avg.protein}g | Carbs: ${avg.carbs}g | Fat: ${avg.fat}g`,
  );
  console.log(`  Confidence: ${plan.nutritionSummary.confidencePercent}%\n`);

  // Daily plan
  for (const day of plan.days) {
    console.log(
      `📅 ${day.date} (${day.dayOfWeek}) — ₹${day.dailyCost.amount.toFixed(0)}`,
    );
    for (const meal of day.meals) {
      const icon =
        meal.sourceType === SourceType.INSTAMART
          ? "🏠"
          : meal.sourceType === SourceType.DINEOUT
            ? "🍽️"
            : "🛵";
      const fallback = meal.fallbackUsed ? " [fallback]" : "";
      console.log(
        `  ${icon} ${meal.items[0]?.name || "Meal"} — ₹${meal.estimatedCost.amount.toFixed(0)}${fallback}`,
      );
    }
    console.log();
  }

  // Grocery list
  if (plan.groceryList.items.length > 0) {
    console.log("🛒 Consolidated Grocery List:");
    for (const item of plan.groceryList.items) {
      console.log(
        `  ${item.name} × ${item.totalQuantity} ${item.unit} — ₹${item.estimatedPrice.amount}`,
      );
    }
    console.log(`  Total: ₹${plan.groceryList.totalCost.amount}`);
    console.log(
      `  Suggested delivery: ${plan.groceryList.deliveryDays.join(", ")}`,
    );
  }
}

// Run if executed directly
main().catch(console.error);
