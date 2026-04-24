export interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ResolvedMeal {
  slotId: string;
  sourceType: "INSTAMART" | "FOOD_DELIVERY" | "DINEOUT";
  items: MealItem[];
  estimatedCost: number;
  estimatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  fallbackUsed?: boolean;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
}

export interface DayPlan {
  date: string;
  dayOfWeek: string;
  meals: ResolvedMeal[];
  dailyCost: number;
  dailyNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeeklyPlan {
  planId: string;
  costBreakdown: {
    totalCost: number;
    instamartCost: number;
    foodDeliveryCost: number;
    dineoutCost: number;
    remainingBudget: number;
    weeklyBudget: number;
  };
  nutritionSummary: {
    dailyAverage: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    confidencePercent: number;
  };
  groceryList: {
    items: {
      name: string;
      totalQuantity: number;
      unit: string;
      estimatedPrice: number;
    }[];
    totalCost: number;
    deliveryDays: string[];
  };
  days: DayPlan[];
}

export const samplePlan: WeeklyPlan = {
  planId: "piggy-demo-001",
  costBreakdown: {
    totalCost: 3442,
    instamartCost: 1085,
    foodDeliveryCost: 2071,
    dineoutCost: 286,
    remainingBudget: 1558,
    weeklyBudget: 5000,
  },
  nutritionSummary: {
    dailyAverage: { calories: 1603, protein: 59, carbs: 223, fat: 53 },
    confidencePercent: 52,
  },
  groceryList: {
    items: [
      { name: "Oats", totalQuantity: 500, unit: "g", estimatedPrice: 70 },
      { name: "Onion", totalQuantity: 6, unit: "pc", estimatedPrice: 90 },
      { name: "Tomato", totalQuantity: 12, unit: "pc", estimatedPrice: 154 },
      {
        name: "Green Chili",
        totalQuantity: 10,
        unit: "pc",
        estimatedPrice: 70,
      },
      { name: "Paneer", totalQuantity: 200, unit: "g", estimatedPrice: 80 },
      {
        name: "Wheat Flour",
        totalQuantity: 200,
        unit: "g",
        estimatedPrice: 15,
      },
      { name: "Pasta", totalQuantity: 600, unit: "g", estimatedPrice: 150 },
      {
        name: "Tomato Sauce",
        totalQuantity: 600,
        unit: "ml",
        estimatedPrice: 120,
      },
      { name: "Toor Dal", totalQuantity: 150, unit: "g", estimatedPrice: 30 },
      { name: "Rice", totalQuantity: 200, unit: "g", estimatedPrice: 25 },
      { name: "Cucumber", totalQuantity: 1, unit: "pc", estimatedPrice: 15 },
      {
        name: "Feta Cheese",
        totalQuantity: 100,
        unit: "g",
        estimatedPrice: 80,
      },
      { name: "Pita Bread", totalQuantity: 2, unit: "pc", estimatedPrice: 30 },
    ],
    totalCost: 929,
    deliveryDays: ["Sunday", "Wednesday"],
  },
  days: [
    {
      date: "2026-04-27",
      dayOfWeek: "MON",
      dailyCost: 501,
      dailyNutrition: { calories: 1350, protein: 56, carbs: 187, fat: 43 },
      meals: [
        {
          slotId: "m1",
          sourceType: "INSTAMART",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Masala Oats",
              calories: 320,
              protein: 12,
              carbs: 52,
              fat: 8,
            },
          ],
          estimatedCost: 55,
          estimatedNutrition: {
            calories: 320,
            protein: 12,
            carbs: 52,
            fat: 8,
            fiber: 6,
          },
        },
        {
          slotId: "m2",
          sourceType: "INSTAMART",
          mealType: "LUNCH",
          items: [
            {
              name: "Greek Salad with Pita",
              calories: 380,
              protein: 16,
              carbs: 40,
              fat: 18,
            },
          ],
          estimatedCost: 160,
          estimatedNutrition: {
            calories: 380,
            protein: 16,
            carbs: 40,
            fat: 18,
            fiber: 5,
          },
        },
        {
          slotId: "m3",
          sourceType: "FOOD_DELIVERY",
          mealType: "DINNER",
          items: [
            {
              name: "Indian Dinner Combo",
              calories: 650,
              protein: 28,
              carbs: 95,
              fat: 17,
            },
          ],
          estimatedCost: 286,
          estimatedNutrition: {
            calories: 650,
            protein: 28,
            carbs: 95,
            fat: 17,
            fiber: 5,
          },
        },
      ],
    },
    {
      date: "2026-04-28",
      dayOfWeek: "TUE",
      dailyCost: 315,
      dailyNutrition: { calories: 1310, protein: 40, carbs: 196, fat: 38 },
      meals: [
        {
          slotId: "m4",
          sourceType: "INSTAMART",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Masala Oats",
              calories: 320,
              protein: 12,
              carbs: 52,
              fat: 8,
            },
          ],
          estimatedCost: 55,
          estimatedNutrition: {
            calories: 320,
            protein: 12,
            carbs: 52,
            fat: 8,
            fiber: 6,
          },
        },
        {
          slotId: "m5",
          sourceType: "INSTAMART",
          mealType: "LUNCH",
          items: [
            {
              name: "Pasta Arrabbiata",
              calories: 480,
              protein: 14,
              carbs: 72,
              fat: 15,
            },
          ],
          estimatedCost: 130,
          estimatedNutrition: {
            calories: 480,
            protein: 14,
            carbs: 72,
            fat: 15,
            fiber: 5,
          },
        },
        {
          slotId: "m6",
          sourceType: "INSTAMART",
          mealType: "DINNER",
          items: [
            {
              name: "Pasta Arrabbiata",
              calories: 510,
              protein: 14,
              carbs: 72,
              fat: 15,
            },
          ],
          estimatedCost: 130,
          estimatedNutrition: {
            calories: 510,
            protein: 14,
            carbs: 72,
            fat: 15,
            fiber: 5,
          },
        },
      ],
    },
    {
      date: "2026-04-29",
      dayOfWeek: "WED",
      dailyCost: 643,
      dailyNutrition: { calories: 1780, protein: 65, carbs: 248, fat: 58 },
      meals: [
        {
          slotId: "m7",
          sourceType: "FOOD_DELIVERY",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Indian Breakfast Combo",
              calories: 380,
              protein: 15,
              carbs: 58,
              fat: 12,
            },
          ],
          estimatedCost: 107,
          estimatedNutrition: {
            calories: 380,
            protein: 15,
            carbs: 58,
            fat: 12,
            fiber: 4,
          },
        },
        {
          slotId: "m8",
          sourceType: "FOOD_DELIVERY",
          mealType: "LUNCH",
          items: [
            {
              name: "Mediterranean Lunch Bowl",
              calories: 620,
              protein: 22,
              carbs: 85,
              fat: 22,
            },
          ],
          estimatedCost: 250,
          estimatedNutrition: {
            calories: 620,
            protein: 22,
            carbs: 85,
            fat: 22,
            fiber: 6,
          },
        },
        {
          slotId: "m9",
          sourceType: "FOOD_DELIVERY",
          mealType: "DINNER",
          items: [
            {
              name: "Mediterranean Dinner Platter",
              calories: 780,
              protein: 28,
              carbs: 105,
              fat: 24,
            },
          ],
          estimatedCost: 286,
          estimatedNutrition: {
            calories: 780,
            protein: 28,
            carbs: 105,
            fat: 24,
            fiber: 5,
          },
        },
      ],
    },
    {
      date: "2026-04-30",
      dayOfWeek: "THU",
      dailyCost: 435,
      dailyNutrition: { calories: 1420, protein: 48, carbs: 197, fat: 41 },
      meals: [
        {
          slotId: "m10",
          sourceType: "INSTAMART",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Masala Oats",
              calories: 320,
              protein: 12,
              carbs: 52,
              fat: 8,
            },
          ],
          estimatedCost: 55,
          estimatedNutrition: {
            calories: 320,
            protein: 12,
            carbs: 52,
            fat: 8,
            fiber: 6,
          },
        },
        {
          slotId: "m11",
          sourceType: "INSTAMART",
          mealType: "LUNCH",
          items: [
            {
              name: "Pasta Arrabbiata",
              calories: 480,
              protein: 14,
              carbs: 72,
              fat: 15,
            },
          ],
          estimatedCost: 130,
          estimatedNutrition: {
            calories: 480,
            protein: 14,
            carbs: 72,
            fat: 15,
            fiber: 5,
          },
        },
        {
          slotId: "m12",
          sourceType: "FOOD_DELIVERY",
          mealType: "DINNER",
          items: [
            {
              name: "Mediterranean Lunch Bowl",
              calories: 620,
              protein: 22,
              carbs: 73,
              fat: 18,
            },
          ],
          estimatedCost: 250,
          estimatedNutrition: {
            calories: 620,
            protein: 22,
            carbs: 73,
            fat: 18,
            fiber: 6,
          },
        },
      ],
    },
    {
      date: "2026-05-01",
      dayOfWeek: "FRI",
      dailyCost: 315,
      dailyNutrition: { calories: 1520, protein: 60, carbs: 192, fat: 55 },
      meals: [
        {
          slotId: "m13",
          sourceType: "INSTAMART",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Masala Oats",
              calories: 320,
              protein: 12,
              carbs: 52,
              fat: 8,
            },
          ],
          estimatedCost: 55,
          estimatedNutrition: {
            calories: 320,
            protein: 12,
            carbs: 52,
            fat: 8,
            fiber: 6,
          },
        },
        {
          slotId: "m14",
          sourceType: "INSTAMART",
          mealType: "LUNCH",
          items: [
            {
              name: "Paneer Butter Masala with Roti",
              calories: 650,
              protein: 28,
              carbs: 55,
              fat: 35,
            },
          ],
          estimatedCost: 160,
          estimatedNutrition: {
            calories: 650,
            protein: 28,
            carbs: 55,
            fat: 35,
            fiber: 4,
          },
        },
        {
          slotId: "m15",
          sourceType: "INSTAMART",
          mealType: "DINNER",
          items: [
            {
              name: "Dal Tadka with Rice",
              calories: 550,
              protein: 20,
              carbs: 85,
              fat: 12,
            },
          ],
          estimatedCost: 100,
          estimatedNutrition: {
            calories: 550,
            protein: 20,
            carbs: 85,
            fat: 12,
            fiber: 8,
          },
        },
      ],
    },
    {
      date: "2026-05-02",
      dayOfWeek: "SAT",
      dailyCost: 643,
      dailyNutrition: { calories: 1830, protein: 68, carbs: 258, fat: 55 },
      meals: [
        {
          slotId: "m16",
          sourceType: "FOOD_DELIVERY",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Indian Breakfast Combo",
              calories: 380,
              protein: 15,
              carbs: 58,
              fat: 12,
            },
          ],
          estimatedCost: 107,
          estimatedNutrition: {
            calories: 380,
            protein: 15,
            carbs: 58,
            fat: 12,
            fiber: 4,
          },
        },
        {
          slotId: "m17",
          sourceType: "FOOD_DELIVERY",
          mealType: "LUNCH",
          items: [
            {
              name: "Indian Lunch Thali",
              calories: 720,
              protein: 25,
              carbs: 105,
              fat: 22,
            },
          ],
          estimatedCost: 250,
          estimatedNutrition: {
            calories: 720,
            protein: 25,
            carbs: 105,
            fat: 22,
            fiber: 7,
          },
        },
        {
          slotId: "m18",
          sourceType: "DINEOUT",
          mealType: "DINNER",
          items: [
            {
              name: "Dinner at Olive Bistro",
              calories: 730,
              protein: 28,
              carbs: 95,
              fat: 21,
            },
          ],
          estimatedCost: 286,
          estimatedNutrition: {
            calories: 730,
            protein: 28,
            carbs: 95,
            fat: 21,
            fiber: 4,
          },
        },
      ],
    },
    {
      date: "2026-05-03",
      dayOfWeek: "SUN",
      dailyCost: 591,
      dailyNutrition: { calories: 1710, protein: 62, carbs: 240, fat: 48 },
      meals: [
        {
          slotId: "m19",
          sourceType: "INSTAMART",
          mealType: "BREAKFAST",
          items: [
            {
              name: "Idli Sambar",
              calories: 350,
              protein: 14,
              carbs: 60,
              fat: 5,
            },
          ],
          estimatedCost: 105,
          estimatedNutrition: {
            calories: 350,
            protein: 14,
            carbs: 60,
            fat: 5,
            fiber: 7,
          },
        },
        {
          slotId: "m20",
          sourceType: "FOOD_DELIVERY",
          mealType: "LUNCH",
          items: [
            {
              name: "Indian Lunch Thali",
              calories: 720,
              protein: 25,
              carbs: 105,
              fat: 22,
            },
          ],
          estimatedCost: 250,
          estimatedNutrition: {
            calories: 720,
            protein: 25,
            carbs: 105,
            fat: 22,
            fiber: 7,
          },
          fallbackUsed: true,
        },
        {
          slotId: "m21",
          sourceType: "FOOD_DELIVERY",
          mealType: "DINNER",
          items: [
            {
              name: "Indian Dinner Combo",
              calories: 640,
              protein: 23,
              carbs: 75,
              fat: 21,
            },
          ],
          estimatedCost: 236,
          estimatedNutrition: {
            calories: 640,
            protein: 23,
            carbs: 75,
            fat: 21,
            fiber: 5,
          },
          fallbackUsed: true,
        },
      ],
    },
  ],
};
