import { mcpClient } from "./client";
import { DineoutOffer } from "../models";

export interface DineoutSearchResult {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  averageCost: number;
  distance: number; // km
}

export interface DineoutDetails {
  restaurantId: string;
  name: string;
  rating: number;
  averageCost: number;
  distance: number;
  menuHighlights: string[];
  offers: DineoutOffer[];
  availableSlots: string[]; // HH:mm times
}

export async function searchDineoutRestaurants(
  cuisine: string[],
  date: string,
  time: string,
  partySize: number,
  budget: number,
): Promise<DineoutSearchResult[]> {
  try {
    return await mcpClient.call<DineoutSearchResult[]>({
      server: "dineout",
      tool: "search_restaurants",
      args: { cuisine, date, time, party_size: partySize, budget },
    });
  } catch {
    return [];
  }
}

export async function getRestaurantDetails(
  restaurantId: string,
): Promise<DineoutDetails | null> {
  try {
    return await mcpClient.call<DineoutDetails>({
      server: "dineout",
      tool: "get_restaurant_details",
      args: { restaurant_id: restaurantId },
    });
  } catch {
    return null;
  }
}
