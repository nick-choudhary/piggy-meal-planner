import { v4 as uuid } from "uuid";
import {
  ResolvedMeal,
  WeeklyMealPlan,
  DayPlan,
  CostBreakdown,
  WeeklyNutritionSummary,
  GroceryList,
  GroceryListItem,
  SourceType,
  NutritionValues,
  Money,
  UserProfile,
  DayOfWeek,
} from "../models";
import {
  inr,
  sumMoney,
  addNutrition,
  zeroNutrition,
  averageNutrition,
  getDayOfWeek,
} from "../utils/helpers";

export class Aggregator {
  /**
   * Compile resolved meals into a final weekly plan.
   */
  compile(
    resolvedMeals: ResolvedMeal[],
    profile: UserProfile,
    startDate: string,
  ): WeeklyMealPlan {
    const dayMap = this.groupByDay(resolvedMeals);
    const days = this.buildDayPlans(dayMap, startDate);
    const costBreakdown = this.calculateCostBreakdown(resolvedMeals, profile);
    const nutritionSummary = this.calculateNutritionSummary(
      days,
      resolvedMeals,
    );
    const groceryList = this.generateConsolidatedGroceryList(resolvedMeals);

    return {
      planId: uuid(),
      userId: profile.userId,
      createdAt: new Date().toISOString(),
      days,
      costBreakdown,
      nutritionSummary,
      groceryList,
    };
  }

  /**
   * Calculate cost breakdown by source type.
   */
  calculateCostBreakdown(
    meals: ResolvedMeal[],
    profile: UserProfile,
  ): CostBreakdown {
    const instamartMeals = meals.filter(
      (m) => m.sourceType === SourceType.INSTAMART,
    );
    const foodMeals = meals.filter(
      (m) => m.sourceType === SourceType.FOOD_DELIVERY,
    );
    const dineoutMeals = meals.filter(
      (m) => m.sourceType === SourceType.DINEOUT,
    );

    const instamartCost = sumMoney(instamartMeals.map((m) => m.estimatedCost));
    const foodCost = sumMoney(foodMeals.map((m) => m.estimatedCost));
    const dineoutCost = sumMoney(dineoutMeals.map((m) => m.estimatedCost));
    const totalCost = sumMoney([instamartCost, foodCost, dineoutCost]);

    return {
      totalCost,
      instamartCost,
      foodDeliveryCost: foodCost,
      dineoutCost,
      remainingBudget: inr(profile.weeklyBudget.amount - totalCost.amount),
    };
  }

  /**
   * Calculate daily and weekly nutrition summaries.
   */
  calculateNutritionSummary(
    days: DayPlan[],
    meals: ResolvedMeal[],
  ): WeeklyNutritionSummary {
    const dailyTotals = days.map((d) => d.dailyNutrition);
    const dailyAverage = averageNutrition(dailyTotals, days.length);

    const estimatedCount = meals.filter((m) => m.nutritionEstimated).length;
    const confidencePercent =
      meals.length > 0
        ? Math.round(((meals.length - estimatedCount) / meals.length) * 100)
        : 0;

    return { dailyAverage, dailyTotals, confidencePercent };
  }

  /**
   * Consolidate grocery items across all Instamart meals.
   * Merges duplicates and batches by delivery day.
   */
  generateConsolidatedGroceryList(meals: ResolvedMeal[]): GroceryList {
    const instamartMeals = meals.filter(
      (m) => m.sourceType === SourceType.INSTAMART,
    );
    const itemMap = new Map<string, GroceryListItem>();

    for (const meal of instamartMeals) {
      for (const item of meal.items) {
        const key = `${item.name.toLowerCase()}-${item.unit}`;
        const existing = itemMap.get(key);

        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.estimatedPrice.amount += Math.round(
            meal.estimatedCost.amount / meal.items.length,
          );
        } else {
          itemMap.set(key, {
            name: item.name,
            totalQuantity: item.quantity,
            unit: item.unit,
            estimatedPrice: inr(
              Math.round(meal.estimatedCost.amount / meal.items.length),
            ),
          });
        }
      }
    }

    const items = Array.from(itemMap.values());
    const totalCost = sumMoney(items.map((i) => i.estimatedPrice));

    // Suggest 2-3 delivery days (batch orders)
    const deliveryDays = this.suggestDeliveryDays(instamartMeals);

    return { items, totalCost, deliveryDays };
  }

  // --- Private helpers ---

  private groupByDay(meals: ResolvedMeal[]): Map<string, ResolvedMeal[]> {
    const map = new Map<string, ResolvedMeal[]>();
    // We need to figure out the day from the slotId — but we don't have direct access
    // In practice, the orchestrator passes slot info. For now, group sequentially.
    // This is a simplification; the orchestrator will provide day mapping.
    return map;
  }

  private buildDayPlans(
    dayMap: Map<string, ResolvedMeal[]>,
    startDate: string,
  ): DayPlan[] {
    // Build 7 day plans — meals will be distributed by the orchestrator
    const days: DayPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      days.push({
        date: dateStr,
        dayOfWeek: getDayOfWeek(dateStr),
        meals: [],
        dailyCost: inr(0),
        dailyNutrition: zeroNutrition(),
      });
    }

    return days;
  }

  /**
   * Build day plans from resolved meals with slot-to-day mapping.
   */
  buildDayPlansFromSlots(
    resolvedMeals: ResolvedMeal[],
    slotDayMap: Map<string, string>,
    startDate: string,
  ): DayPlan[] {
    const days = this.buildDayPlans(new Map(), startDate);
    const dayIndex = new Map(days.map((d) => [d.date, d]));

    for (const meal of resolvedMeals) {
      const date = slotDayMap.get(meal.slotId);
      if (!date) continue;

      const day = dayIndex.get(date);
      if (!day) continue;

      day.meals.push(meal);
      day.dailyCost.amount += meal.estimatedCost.amount;
      day.dailyNutrition = addNutrition(
        day.dailyNutrition,
        meal.estimatedNutrition,
      );
    }

    return days;
  }

  private suggestDeliveryDays(instamartMeals: ResolvedMeal[]): string[] {
    // Suggest ordering on Sunday (for Mon-Wed) and Wednesday (for Thu-Sat)
    // This is a heuristic; in production, optimize based on actual meal dates
    const days = new Set<string>();

    if (instamartMeals.length > 0) {
      days.add("Sunday");
      if (instamartMeals.length > 5) {
        days.add("Wednesday");
      }
    }

    return Array.from(days);
  }
}
