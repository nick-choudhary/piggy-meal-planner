import { mcpClient } from "./client";
import { InstamartProduct, Money } from "../models";
import { inr } from "../utils/helpers";

export interface InstamartSearchResult {
  productId: string;
  name: string;
  price: number;
  unit: string;
  rating: number;
  available: boolean;
}

export async function searchProducts(
  query: string,
  category?: string,
): Promise<InstamartSearchResult[]> {
  try {
    return await mcpClient.call<InstamartSearchResult[]>({
      server: "instamart",
      tool: "search_products",
      args: { query, category },
    });
  } catch {
    return [];
  }
}

export async function getProductDetails(
  productId: string,
): Promise<InstamartProduct | null> {
  try {
    return await mcpClient.call<InstamartProduct>({
      server: "instamart",
      tool: "get_product_details",
      args: { product_id: productId },
    });
  } catch {
    return null;
  }
}

/** Convert search result to InstamartProduct */
export function toInstamartProduct(
  result: InstamartSearchResult,
  qty: number,
): InstamartProduct {
  return {
    productId: result.productId,
    name: result.name,
    price: inr(result.price),
    quantity: qty,
    unit: result.unit,
    rating: result.rating,
  };
}
