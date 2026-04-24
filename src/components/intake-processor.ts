import { v4 as uuid } from "uuid";
import {
  RawInput,
  UserProfile,
  WeeklySchedule,
  DaySchedule,
  DietaryRuleset,
  MealSlot,
  MealType,
  DayOfWeek,
  GoalType,
  NutritionTargets,
  Range,
} from "../models";
import { inr, getDayOfWeek, addDays, timeToMinutes } from "../utils/helpers";
import { validateRawInput, ValidationError } from "../utils/validation";

/** Budget weight per meal type (must sum to 1.0) */
const MEAL_BUDGET_WEIGHTS: Record<MealType, number> = {
  [MealType.BREAKFAST]: 0.15,
  [MealType.LUNCH]: 0.35,
  [MealType.DINNER]: 0.4,
  [MealType.SNACK]: 0.1,
};

/** Default meal time windows */
const DEFAULT_MEAL_TIMES: Record<MealType, { start: string; end: string }> = {
  [MealType.BREAKFAST]: { start: "07:00", end: "09:00" },
  [MealType.LUNCH]: { start: "12:00", end: "14:00" },
  [MealType.DINNER]: { start: "19:00", end: "21:00" },
  [MealType.SNACK]: { start: "16:00", end: "17:00" },
};

export class IntakeProcessor {
  /**
   * Validate raw input and produce a normalized UserProfile.
   */
  validateAndNormalize(rawInput: RawInput): UserProfile {
    const errors = validateRawInput(rawInput);
    if (errors.length > 0) {
      throw new IntakeValidationError(errors);
    }

    const dietaryPreferences = this.mergeDietaryRules(rawInput);

    return {
      userId: uuid(),
      location: rawInput.location,
      dietaryPreferences,
      healthGoals: {
        dailyCalories: rawInput.healthGoals.dailyCalories,
        proteinGrams: rawInput.healthGoals.proteinGrams,
        carbsGrams: rawInput.healthGoals.carbsGrams,
        fatGrams: rawInput.healthGoals.fatGrams,
        fiberGrams: rawInput.healthGoals.fiberGrams ?? { min: 20, max: 40 },
        goalType: rawInput.healthGoals.goalType,
      },
      weeklyBudget: inr(rawInput.budget),
      mealTypePreferences: {
        homeCookedRatio: rawInput.preferences.homeCookedRatio,
        deliveryRatio: rawInput.preferences.deliveryRatio,
        dineoutRatio: rawInput.preferences.dineoutRatio,
      },
      cuisinePreferences: rawInput.preferences.cuisines,
      allergies: rawInput.allergies,
    };
  }

  /**
   * Parse calendar events into a structured WeeklySchedule with meal slots.
   */
  parseSchedule(rawInput: RawInput): WeeklySchedule {
    const days: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(rawInput.startDate, i);
      const dayOfWeek = getDayOfWeek(date);
      const events = rawInput.schedule[i] || [];

      const mealSlots = this.computeMealSlots(
        date,
        dayOfWeek,
        events,
        rawInput.budget,
        rawInput.healthGoals as NutritionTargets,
      );

      days.push({ date, dayOfWeek, events, availableMealSlots: mealSlots });
    }

    return { days };
  }

  /**
   * Merge dietary preferences and health goals into a unified ruleset.
   */
  mergeDietaryRules(rawInput: RawInput): DietaryRuleset {
    const restrictions: string[] = [];

    if (rawInput.preferences.dietType === "VEGETARIAN") {
      restrictions.push("no-meat", "no-fish");
    } else if (rawInput.preferences.dietType === "VEGAN") {
      restrictions.push("no-meat", "no-fish", "no-dairy", "no-eggs");
    }

    // Add goal-based restrictions
    if (rawInput.healthGoals.goalType === GoalType.WEIGHT_LOSS) {
      restrictions.push("low-calorie", "low-fat");
    } else if (rawInput.healthGoals.goalType === GoalType.MUSCLE_GAIN) {
      restrictions.push("high-protein");
    }

    return {
      dietType: rawInput.preferences.dietType,
      restrictions,
      allergies: rawInput.allergies,
      preferredCuisines: rawInput.preferences.cuisines,
    };
  }

  /**
   * Compute available meal slots for a day, avoiding calendar event conflicts.
   */
  private computeMealSlots(
    date: string,
    dayOfWeek: DayOfWeek,
    events: { startTime: string; endTime: string }[],
    weeklyBudget: number,
    healthGoals: NutritionTargets,
  ): MealSlot[] {
    const dailyBudget = weeklyBudget / 7;
    const mealTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];
    const slots: MealSlot[] = [];

    for (const mealType of mealTypes) {
      const timeWindow = DEFAULT_MEAL_TIMES[mealType];
      const mealStart = timeToMinutes(timeWindow.start);
      const mealEnd = timeToMinutes(timeWindow.end);

      // Check if any event conflicts with this meal window
      const hasConflict = events.some((event) => {
        const evStart = timeToMinutes(
          new Date(event.startTime).toTimeString().slice(0, 5),
        );
        const evEnd = timeToMinutes(
          new Date(event.endTime).toTimeString().slice(0, 5),
        );
        return evStart < mealEnd && evEnd > mealStart;
      });

      if (!hasConflict) {
        slots.push({
          id: uuid(),
          day: date,
          dayOfWeek,
          mealType,
          timeWindow,
          budgetAllocation: inr(dailyBudget * MEAL_BUDGET_WEIGHTS[mealType]),
          targetNutrition: this.scaleMealNutrition(healthGoals, mealType),
        });
      }
    }

    // Ensure at least one slot per day
    if (slots.length === 0) {
      slots.push({
        id: uuid(),
        day: date,
        dayOfWeek,
        mealType: MealType.LUNCH,
        timeWindow: DEFAULT_MEAL_TIMES[MealType.LUNCH],
        budgetAllocation: inr(dailyBudget * 0.5),
        targetNutrition: this.scaleMealNutrition(healthGoals, MealType.LUNCH),
      });
    }

    return slots;
  }

  /** Scale daily nutrition targets to per-meal targets */
  private scaleMealNutrition(
    daily: NutritionTargets,
    mealType: MealType,
  ): NutritionTargets {
    const weight = MEAL_BUDGET_WEIGHTS[mealType];
    const scale = (r: Range): Range => ({
      min: Math.round(r.min * weight),
      max: Math.round(r.max * weight),
    });

    return {
      dailyCalories: scale(daily.dailyCalories),
      proteinGrams: scale(daily.proteinGrams),
      carbsGrams: scale(daily.carbsGrams),
      fatGrams: scale(daily.fatGrams),
      fiberGrams: daily.fiberGrams
        ? scale(daily.fiberGrams)
        : { min: 3, max: 10 },
      goalType: daily.goalType,
    };
  }
}

export class IntakeValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super(
      `Intake validation failed: ${errors.map((e) => e.message).join(", ")}`,
    );
    this.name = "IntakeValidationError";
  }
}
