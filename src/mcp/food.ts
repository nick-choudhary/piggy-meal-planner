import { mcpClient } from "./client";
import { FoodMenuItem, Money } from "../models";
import { inr } from "../utils/helpers";

export interface RestaurantSearchResult {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  deliveryTime: number; // minutes
  averageCost: number;
}

export interface MenuResult {
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    description?: string;
    isVeg?: boolean;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    allergens?: string[];
  }>;
}

export async function searchRestaurants(
  cuisine: string[],
  budget: number,
  dietary?: string[],
): Promise<RestaurantSearchResult[]> {
  try {
    return await mcpClient.call<RestaurantSearchResult[]>({
      server: "food",
      tool: "search_restaurants",
      args: { cuisine, budget, dietary },
    });
  } catch {
    return [];
  }
}

export async function getRestaurantMenu(
  restaurantId: string,
): Promise<MenuResult | null> {
  try {
    return await mcpClient.call<MenuResult>({
      server: "food",
      tool: "get_restaurant_menu",
      args: { restaurant_id: restaurantId },
    });
  } catch {
    return null;
  }
}

export function toFoodMenuItem(item: MenuResult["items"][0]): FoodMenuItem {
  return {
    itemId: item.itemId,
    name: item.name,
    price: inr(item.price),
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
  };
}
