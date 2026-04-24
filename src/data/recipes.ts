import { MealType } from "../models";

export interface Recipe {
  name: string;
  cuisine: string;
  mealType: MealType[];
  dietType: string[]; // 'VEGETARIAN', 'VEGAN', 'NON_VEG'
  ingredients: RecipeIngredient[];
  estimatedCost: number; // INR
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface RecipeIngredient {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  maxPrice: number; // INR
}

/**
 * Basic recipe database for home-cooked meal suggestions.
 * In production, this would be a much larger database or API.
 */
export const RECIPES: Recipe[] = [
  {
    name: "Masala Oats",
    cuisine: "Indian",
    mealType: [MealType.BREAKFAST],
    dietType: ["VEGETARIAN", "VEGAN"],
    ingredients: [
      {
        name: "Oats",
        category: "grains",
        quantity: 100,
        unit: "g",
        maxPrice: 30,
      },
      {
        name: "Onion",
        category: "vegetables",
        quantity: 1,
        unit: "pc",
        maxPrice: 10,
      },
      {
        name: "Tomato",
        category: "vegetables",
        quantity: 1,
        unit: "pc",
        maxPrice: 10,
      },
      {
        name: "Green Chili",
        category: "vegetables",
        quantity: 2,
        unit: "pc",
        maxPrice: 5,
      },
    ],
    estimatedCost: 55,
    nutrition: { calories: 320, protein: 12, carbs: 52, fat: 8, fiber: 6 },
  },
  {
    name: "Egg Bhurji with Toast",
    cuisine: "Indian",
    mealType: [MealType.BREAKFAST],
    dietType: ["NON_VEG"],
    ingredients: [
      {
        name: "Eggs",
        category: "dairy",
        quantity: 3,
        unit: "pc",
        maxPrice: 30,
      },
      {
        name: "Bread",
        category: "bakery",
        quantity: 4,
        unit: "slices",
        maxPrice: 20,
      },
      {
        name: "Onion",
        category: "vegetables",
        quantity: 1,
        unit: "pc",
        maxPrice: 10,
      },
      {
        name: "Butter",
        category: "dairy",
        quantity: 20,
        unit: "g",
        maxPrice: 15,
      },
    ],
    estimatedCost: 75,
    nutrition: { calories: 420, protein: 22, carbs: 35, fat: 22, fiber: 3 },
  },
  {
    name: "Dal Tadka with Rice",
    cuisine: "Indian",
    mealType: [MealType.LUNCH, MealType.DINNER],
    dietType: ["VEGETARIAN", "VEGAN"],
    ingredients: [
      {
        name: "Toor Dal",
        category: "pulses",
        quantity: 150,
        unit: "g",
        maxPrice: 30,
      },
      {
        name: "Rice",
        category: "grains",
        quantity: 200,
        unit: "g",
        maxPrice: 25,
      },
      {
        name: "Onion",
        category: "vegetables",
        quantity: 1,
        unit: "pc",
        maxPrice: 10,
      },
      {
        name: "Tomato",
        category: "vegetables",
        quantity: 2,
        unit: "pc",
        maxPrice: 15,
      },
      {
        name: "Ghee",
        category: "dairy",
        quantity: 20,
        unit: "ml",
        maxPrice: 20,
      },
    ],
    estimatedCost: 100,
    nutrition: { calories: 550, protein: 20, carbs: 85, fat: 12, fiber: 8 },
  },
  {
    name: "Paneer Butter Masala with Roti",
    cuisine: "Indian",
    mealType: [MealType.LUNCH, MealType.DINNER],
    dietType: ["VEGETARIAN"],
    ingredients: [
      {
        name: "Paneer",
        category: "dairy",
        quantity: 200,
        unit: "g",
        maxPrice: 80,
      },
      {
        name: "Wheat Flour",
        category: "grains",
        quantity: 200,
        unit: "g",
        maxPrice: 15,
      },
      {
        name: "Tomato",
        category: "vegetables",
        quantity: 3,
        unit: "pc",
        maxPrice: 20,
      },
      {
        name: "Butter",
        category: "dairy",
        quantity: 30,
        unit: "g",
        maxPrice: 20,
      },
      {
        name: "Cream",
        category: "dairy",
        quantity: 50,
        unit: "ml",
        maxPrice: 25,
      },
    ],
    estimatedCost: 160,
    nutrition: { calories: 650, protein: 28, carbs: 55, fat: 35, fiber: 4 },
  },
  {
    name: "Pasta Arrabbiata",
    cuisine: "Italian",
    mealType: [MealType.LUNCH, MealType.DINNER],
    dietType: ["VEGETARIAN", "VEGAN"],
    ingredients: [
      {
        name: "Pasta",
        category: "grains",
        quantity: 200,
        unit: "g",
        maxPrice: 50,
      },
      {
        name: "Tomato Sauce",
        category: "sauces",
        quantity: 200,
        unit: "ml",
        maxPrice: 40,
      },
      {
        name: "Garlic",
        category: "vegetables",
        quantity: 4,
        unit: "cloves",
        maxPrice: 10,
      },
      {
        name: "Olive Oil",
        category: "oils",
        quantity: 30,
        unit: "ml",
        maxPrice: 30,
      },
    ],
    estimatedCost: 130,
    nutrition: { calories: 480, protein: 14, carbs: 72, fat: 15, fiber: 5 },
  },
  {
    name: "Chicken Stir Fry with Rice",
    cuisine: "Chinese",
    mealType: [MealType.LUNCH, MealType.DINNER],
    dietType: ["NON_VEG"],
    ingredients: [
      {
        name: "Chicken Breast",
        category: "meat",
        quantity: 250,
        unit: "g",
        maxPrice: 120,
      },
      {
        name: "Rice",
        category: "grains",
        quantity: 200,
        unit: "g",
        maxPrice: 25,
      },
      {
        name: "Bell Pepper",
        category: "vegetables",
        quantity: 2,
        unit: "pc",
        maxPrice: 30,
      },
      {
        name: "Soy Sauce",
        category: "sauces",
        quantity: 30,
        unit: "ml",
        maxPrice: 15,
      },
    ],
    estimatedCost: 190,
    nutrition: { calories: 580, protein: 42, carbs: 60, fat: 14, fiber: 3 },
  },
  {
    name: "Idli Sambar",
    cuisine: "Indian",
    mealType: [MealType.BREAKFAST],
    dietType: ["VEGETARIAN", "VEGAN"],
    ingredients: [
      {
        name: "Idli Batter",
        category: "grains",
        quantity: 500,
        unit: "ml",
        maxPrice: 50,
      },
      {
        name: "Sambar Powder",
        category: "spices",
        quantity: 30,
        unit: "g",
        maxPrice: 15,
      },
      {
        name: "Toor Dal",
        category: "pulses",
        quantity: 50,
        unit: "g",
        maxPrice: 15,
      },
      {
        name: "Mixed Vegetables",
        category: "vegetables",
        quantity: 100,
        unit: "g",
        maxPrice: 25,
      },
    ],
    estimatedCost: 105,
    nutrition: { calories: 350, protein: 14, carbs: 60, fat: 5, fiber: 7 },
  },
  {
    name: "Greek Salad with Pita",
    cuisine: "Mediterranean",
    mealType: [MealType.LUNCH],
    dietType: ["VEGETARIAN"],
    ingredients: [
      {
        name: "Cucumber",
        category: "vegetables",
        quantity: 1,
        unit: "pc",
        maxPrice: 15,
      },
      {
        name: "Tomato",
        category: "vegetables",
        quantity: 2,
        unit: "pc",
        maxPrice: 15,
      },
      {
        name: "Feta Cheese",
        category: "dairy",
        quantity: 100,
        unit: "g",
        maxPrice: 80,
      },
      {
        name: "Pita Bread",
        category: "bakery",
        quantity: 2,
        unit: "pc",
        maxPrice: 30,
      },
      {
        name: "Olive Oil",
        category: "oils",
        quantity: 20,
        unit: "ml",
        maxPrice: 20,
      },
    ],
    estimatedCost: 160,
    nutrition: { calories: 380, protein: 16, carbs: 40, fat: 18, fiber: 5 },
  },
];

/**
 * Get recipe suggestions matching criteria.
 */
export function getRecipeSuggestions(
  mealType: MealType,
  dietType: string,
  cuisine?: string,
  maxCost?: number,
): Recipe[] {
  return RECIPES.filter((r) => {
    if (!r.mealType.includes(mealType)) return false;
    if (!r.dietType.includes(dietType) && dietType !== "NON_VEG") return false;
    if (cuisine && r.cuisine !== cuisine) return false;
    if (maxCost && r.estimatedCost > maxCost) return false;
    return true;
  });
}

/** Find a substitute ingredient name */
export function findSubstitute(ingredientName: string): string | null {
  const substitutes: Record<string, string> = {
    Paneer: "Tofu",
    Butter: "Margarine",
    Cream: "Coconut Cream",
    Ghee: "Oil",
    "Chicken Breast": "Soya Chunks",
    Eggs: "Tofu",
    "Feta Cheese": "Cottage Cheese",
  };
  return substitutes[ingredientName] ?? null;
}
