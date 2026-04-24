import { MealType, SourceType, DayOfWeek, EventType, GoalType } from "./enums";

// --- Utility Types ---

export interface Range {
  min: number;
  max: number;
}

export interface Money {
  amount: number;
  currency: string; // default 'INR'
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

// --- User & Schedule ---

export interface DietaryRuleset {
  dietType: string; // e.g. 'VEGETARIAN', 'VEGAN', 'NON_VEG'
  restrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
}

export interface NutritionTargets {
  dailyCalories: Range;
  proteinGrams: Range;
  carbsGrams: Range;
  fatGrams: Range;
  fiberGrams: Range;
  goalType: GoalType;
}

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealTypeDistribution {
  homeCookedRatio: number;
  deliveryRatio: number;
  dineoutRatio: number;
}

export interface UserProfile {
  userId: string;
  location: GeoLocation;
  dietaryPreferences: DietaryRuleset;
  healthGoals: NutritionTargets;
  weeklyBudget: Money;
  mealTypePreferences: MealTypeDistribution;
  cuisinePreferences: string[];
  allergies: string[];
}

export interface CalendarEvent {
  title: string;
  startTime: string; // ISO datetime
  endTime: string;
  type: EventType;
}

export interface MealSlot {
  id: string;
  day: string; // ISO date
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  timeWindow: TimeRange;
  sourceType?: SourceType;
  budgetAllocation: Money;
  targetNutrition: NutritionTargets;
  cuisine?: string;
}

export interface DaySchedule {
  date: string; // ISO date
  dayOfWeek: DayOfWeek;
  events: CalendarEvent[];
  availableMealSlots: MealSlot[];
}

export interface WeeklySchedule {
  days: DaySchedule[];
}

// --- Resolved Meals ---

export interface MealItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface InstamartProduct {
  productId: string;
  name: string;
  price: Money;
  quantity: number;
  unit: string;
  rating?: number;
}

export interface InstamartCart {
  products: InstamartProduct[];
  totalPrice: Money;
  deliveryDate: string;
  deliverySlot?: TimeRange;
}

export interface FoodMenuItem {
  itemId: string;
  name: string;
  price: Money;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface FoodOrder {
  restaurantId: string;
  restaurantName: string;
  items: FoodMenuItem[];
  totalPrice: Money;
  estimatedDeliveryTime: number; // minutes
}

export interface DineoutOffer {
  offerId: string;
  description: string;
  discountPercent: number;
}

export interface DineoutBooking {
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  offers: DineoutOffer[];
  estimatedCost: Money;
}

export interface ResolvedMeal {
  slotId: string;
  sourceType: SourceType;
  items: MealItem[];
  estimatedCost: Money;
  estimatedNutrition: NutritionValues;
  fallbackUsed?: boolean;
  nutritionEstimated?: boolean;
  actionPayload: InstamartCart | FoodOrder | DineoutBooking;
}

// --- Weekly Plan Output ---

export interface DayPlan {
  date: string;
  dayOfWeek: DayOfWeek;
  meals: ResolvedMeal[];
  dailyCost: Money;
  dailyNutrition: NutritionValues;
}

export interface CostBreakdown {
  totalCost: Money;
  instamartCost: Money;
  foodDeliveryCost: Money;
  dineoutCost: Money;
  remainingBudget: Money;
}

export interface WeeklyNutritionSummary {
  dailyAverage: NutritionValues;
  dailyTotals: NutritionValues[];
  confidencePercent: number; // % of meals with actual vs estimated nutrition
}

export interface GroceryListItem {
  name: string;
  totalQuantity: number;
  unit: string;
  estimatedPrice: Money;
}

export interface GroceryList {
  items: GroceryListItem[];
  totalCost: Money;
  deliveryDays: string[];
}

export interface WeeklyMealPlan {
  planId: string;
  userId: string;
  createdAt: string;
  days: DayPlan[];
  costBreakdown: CostBreakdown;
  nutritionSummary: WeeklyNutritionSummary;
  groceryList: GroceryList;
}

// --- Validation & Errors ---

export type ViolationType = "budget" | "nutrition" | "schedule" | "variety";

export interface Violation {
  type: ViolationType;
  slotId?: string;
  date?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  violations: Violation[];
}

export interface CandidatePlan {
  slots: MealSlot[];
  schedule: WeeklySchedule;
}

export interface ErrorResult {
  success: false;
  message: string;
  violations: Violation[];
}

export interface SuccessResult {
  success: true;
  plan: WeeklyMealPlan;
}

export type PlanResult = SuccessResult | ErrorResult;

// --- Raw Input ---

export interface RawInput {
  budget: number;
  schedule: CalendarEvent[][]; // 7 days of events
  preferences: {
    dietType: string;
    homeCookedRatio: number;
    deliveryRatio: number;
    dineoutRatio: number;
    cuisines: string[];
  };
  healthGoals: {
    goalType: GoalType;
    dailyCalories: Range;
    proteinGrams: Range;
    carbsGrams: Range;
    fatGrams: Range;
    fiberGrams?: Range;
  };
  allergies: string[];
  location: GeoLocation;
  startDate: string; // ISO date for the week start (Monday)
}
