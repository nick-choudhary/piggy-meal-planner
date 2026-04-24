import { v4 as uuid } from "uuid";
import {
  MealSlot,
  ResolvedMeal,
  DietaryRuleset,
  SourceType,
  MealItem,
  InstamartCart,
  FoodOrder,
  DineoutBooking,
  NutritionValues,
  FoodMenuItem,
} from "../models";
import { inr, sumMoney, zeroNutrition } from "../utils/helpers";
import * as instamartApi from "../mcp/instamart";
import * as foodApi from "../mcp/food";
import * as dineoutApi from "../mcp/dineout";
import { getRecipeSuggestions, findSubstitute, Recipe } from "../data/recipes";
import { mcpClient } from "../mcp/client";

export class MealResolver {
  /**
   * Resolve a single meal slot to a concrete Swiggy action.
   */
  async resolveSlot(
    slot: MealSlot,
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    switch (slot.sourceType) {
      case SourceType.INSTAMART:
        return this.resolveInstamart(slot, dietRules);
      case SourceType.FOOD_DELIVERY:
        return this.resolveFoodDelivery(slot, dietRules);
      case SourceType.DINEOUT:
        return this.resolveDineout(slot, dietRules);
      default:
        return this.resolveFoodDelivery(slot, dietRules);
    }
  }

  /**
   * Resolve home-cooked meal via Instamart (Algorithm 4).
   */
  async resolveInstamart(
    slot: MealSlot,
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    // Get recipe suggestions
    const recipes = getRecipeSuggestions(
      slot.mealType,
      dietRules.dietType,
      slot.cuisine,
      slot.budgetAllocation.amount,
    );

    if (recipes.length === 0) {
      // Fallback: try without cuisine filter
      const anyRecipes = getRecipeSuggestions(
        slot.mealType,
        dietRules.dietType,
        undefined,
        slot.budgetAllocation.amount,
      );

      if (anyRecipes.length === 0) {
        return this.fallbackToFoodDelivery(slot, dietRules);
      }

      return this.buildInstamartMeal(slot, anyRecipes[0], dietRules);
    }

    // Pick best recipe by nutrition score
    const scored = recipes.map((r) => ({
      recipe: r,
      score: this.nutritionScore(r.nutrition, slot),
    }));
    scored.sort((a, b) => b.score - a.score);

    return this.buildInstamartMeal(slot, scored[0].recipe, dietRules);
  }

  /**
   * Resolve food delivery meal (Algorithm 5).
   */
  async resolveFoodDelivery(
    slot: MealSlot,
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    // Try to search restaurants via MCP
    if (mcpClient.isServerHealthy("food")) {
      try {
        const restaurants = await foodApi.searchRestaurants(
          dietRules.preferredCuisines,
          slot.budgetAllocation.amount,
          dietRules.restrictions,
        );

        if (restaurants.length > 0) {
          return this.resolveFromRestaurants(slot, restaurants, dietRules);
        }
      } catch {
        // Fall through to estimated meal
      }
    }

    // Generate estimated food delivery meal
    return this.buildEstimatedFoodDelivery(slot, dietRules);
  }

  /**
   * Resolve dine-out booking (Algorithm 6).
   */
  async resolveDineout(
    slot: MealSlot,
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    if (mcpClient.isServerHealthy("dineout")) {
      try {
        const restaurants = await dineoutApi.searchDineoutRestaurants(
          dietRules.preferredCuisines,
          slot.day,
          slot.timeWindow.start,
          1,
          slot.budgetAllocation.amount,
        );

        if (restaurants.length > 0) {
          return this.resolveFromDineout(slot, restaurants, dietRules);
        }
      } catch {
        // Fall through to fallback
      }
    }

    return this.fallbackToFoodDelivery(slot, dietRules);
  }

  // --- Private helpers ---

  private async buildInstamartMeal(
    slot: MealSlot,
    recipe: Recipe,
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    // Check allergens
    const hasAllergen = recipe.ingredients.some((ing) =>
      dietRules.allergies.some((a) =>
        ing.name.toLowerCase().includes(a.toLowerCase()),
      ),
    );
    if (hasAllergen) {
      return this.fallbackToFoodDelivery(slot, dietRules);
    }

    const items: MealItem[] = recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      calories: Math.round(
        recipe.nutrition.calories / recipe.ingredients.length,
      ),
      protein: Math.round(recipe.nutrition.protein / recipe.ingredients.length),
      carbs: Math.round(recipe.nutrition.carbs / recipe.ingredients.length),
      fat: Math.round(recipe.nutrition.fat / recipe.ingredients.length),
    }));

    const cart: InstamartCart = {
      products: recipe.ingredients.map((ing) => ({
        productId: `est-${uuid().slice(0, 8)}`,
        name: ing.name,
        price: inr(ing.maxPrice),
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      totalPrice: inr(recipe.estimatedCost),
      deliveryDate: slot.day,
    };

    return {
      slotId: slot.id,
      sourceType: SourceType.INSTAMART,
      items,
      estimatedCost: inr(recipe.estimatedCost),
      estimatedNutrition: recipe.nutrition,
      actionPayload: cart,
    };
  }

  private async resolveFromRestaurants(
    slot: MealSlot,
    restaurants: foodApi.RestaurantSearchResult[],
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    // Score and pick best restaurant
    const best = restaurants[0]; // simplified — in production, score all

    const menu = await foodApi.getRestaurantMenu(best.id);
    if (!menu || menu.items.length === 0) {
      return this.buildEstimatedFoodDelivery(slot, dietRules);
    }

    // Filter out allergens
    const safeItems = menu.items.filter(
      (item) => !item.allergens?.some((a) => dietRules.allergies.includes(a)),
    );

    // Select items within budget
    const selected = this.selectOptimalCombo(safeItems, slot);
    const menuItems = selected.map(foodApi.toFoodMenuItem);

    const order: FoodOrder = {
      restaurantId: best.id,
      restaurantName: best.name,
      items: menuItems,
      totalPrice: sumMoney(menuItems.map((i) => i.price)),
      estimatedDeliveryTime: best.deliveryTime,
    };

    return {
      slotId: slot.id,
      sourceType: SourceType.FOOD_DELIVERY,
      items: menuItems.map((i) => ({
        name: i.name,
        quantity: 1,
        unit: "serving",
        calories: i.calories ?? 0,
        protein: i.protein ?? 0,
        carbs: i.carbs ?? 0,
        fat: i.fat ?? 0,
      })),
      estimatedCost: order.totalPrice,
      estimatedNutrition: this.sumItemNutrition(menuItems),
      actionPayload: order,
    };
  }

  private async resolveFromDineout(
    slot: MealSlot,
    restaurants: dineoutApi.DineoutSearchResult[],
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal> {
    // Get details for top candidates
    for (const restaurant of restaurants.slice(0, 5)) {
      const details = await dineoutApi.getRestaurantDetails(restaurant.id);
      if (!details) continue;

      // Check dietary compatibility
      const compatible = details.menuHighlights.some(
        (h) =>
          !dietRules.allergies.some((a) =>
            h.toLowerCase().includes(a.toLowerCase()),
          ),
      );
      if (!compatible && details.menuHighlights.length > 0) continue;

      const booking: DineoutBooking = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        date: slot.day,
        time: slot.timeWindow.start,
        partySize: 1,
        offers: details.offers,
        estimatedCost: inr(details.averageCost),
      };

      return {
        slotId: slot.id,
        sourceType: SourceType.DINEOUT,
        items: [
          {
            name: `Meal at ${restaurant.name}`,
            quantity: 1,
            unit: "meal",
            calories: this.estimateDineoutCalories(slot),
            protein: 25,
            carbs: 60,
            fat: 20,
          },
        ],
        estimatedCost: inr(details.averageCost),
        estimatedNutrition: {
          calories: this.estimateDineoutCalories(slot),
          protein: 25,
          carbs: 60,
          fat: 20,
          fiber: 5,
        },
        nutritionEstimated: true,
        actionPayload: booking,
      };
    }

    return this.fallbackToFoodDelivery(slot, dietRules);
  }

  private buildEstimatedFoodDelivery(
    slot: MealSlot,
    dietRules: DietaryRuleset,
  ): ResolvedMeal {
    const calTarget =
      (slot.targetNutrition.dailyCalories.min +
        slot.targetNutrition.dailyCalories.max) /
      2;
    const cuisine = slot.cuisine || dietRules.preferredCuisines[0] || "Indian";

    const order: FoodOrder = {
      restaurantId: `est-${uuid().slice(0, 8)}`,
      restaurantName: `${cuisine} Restaurant (estimated)`,
      items: [
        {
          itemId: `est-${uuid().slice(0, 8)}`,
          name: `${cuisine} ${slot.mealType.toLowerCase()} combo`,
          price: inr(slot.budgetAllocation.amount),
        },
      ],
      totalPrice: inr(slot.budgetAllocation.amount),
      estimatedDeliveryTime: 35,
    };

    return {
      slotId: slot.id,
      sourceType: SourceType.FOOD_DELIVERY,
      items: [
        {
          name: `${cuisine} ${slot.mealType.toLowerCase()} combo`,
          quantity: 1,
          unit: "serving",
          calories: calTarget,
          protein: Math.round((calTarget * 0.15) / 4),
          carbs: Math.round((calTarget * 0.55) / 4),
          fat: Math.round((calTarget * 0.3) / 9),
        },
      ],
      estimatedCost: inr(slot.budgetAllocation.amount),
      estimatedNutrition: {
        calories: calTarget,
        protein: Math.round((calTarget * 0.15) / 4),
        carbs: Math.round((calTarget * 0.55) / 4),
        fat: Math.round((calTarget * 0.3) / 9),
        fiber: 5,
      },
      nutritionEstimated: true,
      actionPayload: order,
    };
  }

  private fallbackToFoodDelivery(
    slot: MealSlot,
    dietRules: DietaryRuleset,
  ): ResolvedMeal {
    const meal = this.buildEstimatedFoodDelivery(slot, dietRules);
    meal.fallbackUsed = true;
    return meal;
  }

  private nutritionScore(
    nutrition: { calories: number; protein: number },
    slot: MealSlot,
  ): number {
    const calTarget =
      (slot.targetNutrition.dailyCalories.min +
        slot.targetNutrition.dailyCalories.max) /
      2;
    const protTarget =
      (slot.targetNutrition.proteinGrams.min +
        slot.targetNutrition.proteinGrams.max) /
      2;

    const calDiff = Math.abs(nutrition.calories - calTarget) / calTarget;
    const protDiff =
      Math.abs(nutrition.protein - protTarget) / Math.max(protTarget, 1);

    return 1 - (calDiff * 0.6 + protDiff * 0.4);
  }

  private selectOptimalCombo(
    items: foodApi.MenuResult["items"],
    slot: MealSlot,
  ): foodApi.MenuResult["items"] {
    const budget = slot.budgetAllocation.amount;
    // Greedy: pick items sorted by nutrition density within budget
    const sorted = [...items].sort(
      (a, b) => (b.calories ?? 0) - (a.calories ?? 0),
    );
    const selected: typeof items = [];
    let spent = 0;

    for (const item of sorted) {
      if (spent + item.price <= budget) {
        selected.push(item);
        spent += item.price;
        if (selected.length >= 3) break; // max 3 items per meal
      }
    }

    return selected.length > 0 ? selected : sorted.slice(0, 1);
  }

  private sumItemNutrition(items: FoodMenuItem[]): NutritionValues {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories ?? 0),
        protein: acc.protein + (item.protein ?? 0),
        carbs: acc.carbs + (item.carbs ?? 0),
        fat: acc.fat + (item.fat ?? 0),
        fiber: acc.fiber,
      }),
      zeroNutrition(),
    );
  }

  private estimateDineoutCalories(slot: MealSlot): number {
    return (
      (slot.targetNutrition.dailyCalories.min +
        slot.targetNutrition.dailyCalories.max) /
      2
    );
  }
}
