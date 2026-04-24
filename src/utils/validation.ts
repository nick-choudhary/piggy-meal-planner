import { RawInput, UserProfile, WeeklySchedule } from "../models";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRawInput(input: RawInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.budget || input.budget < 500) {
    errors.push({
      field: "budget",
      message: "Weekly budget must be at least ₹500",
    });
  }

  if (!input.schedule || input.schedule.length !== 7) {
    errors.push({
      field: "schedule",
      message: "Schedule must contain exactly 7 days",
    });
  }

  if (!input.preferences?.dietType) {
    errors.push({
      field: "preferences.dietType",
      message: "At least one dietary preference is required",
    });
  }

  const {
    homeCookedRatio = 0,
    deliveryRatio = 0,
    dineoutRatio = 0,
  } = input.preferences || {};
  const ratioSum = homeCookedRatio + deliveryRatio + dineoutRatio;
  if (Math.abs(ratioSum - 1.0) > 0.01) {
    errors.push({
      field: "preferences.ratios",
      message: `Meal type ratios must sum to 1.0, got ${ratioSum}`,
    });
  }

  if (!input.healthGoals?.dailyCalories) {
    errors.push({
      field: "healthGoals.dailyCalories",
      message: "Daily calorie target is required",
    });
  }

  if (!input.location?.latitude || !input.location?.longitude) {
    errors.push({
      field: "location",
      message: "Valid location (lat/lng) is required",
    });
  }

  if (!input.startDate) {
    errors.push({ field: "startDate", message: "Start date is required" });
  }

  return errors;
}

export function validateUserProfile(profile: UserProfile): ValidationError[] {
  const errors: ValidationError[] = [];

  if (profile.weeklyBudget.amount < 500) {
    errors.push({
      field: "weeklyBudget",
      message: "Budget must be at least ₹500",
    });
  }

  if (!profile.dietaryPreferences.dietType) {
    errors.push({
      field: "dietaryPreferences",
      message: "Diet type is required",
    });
  }

  const { homeCookedRatio, deliveryRatio, dineoutRatio } =
    profile.mealTypePreferences;
  if (Math.abs(homeCookedRatio + deliveryRatio + dineoutRatio - 1.0) > 0.01) {
    errors.push({
      field: "mealTypePreferences",
      message: "Ratios must sum to 1.0",
    });
  }

  return errors;
}

export function validateWeeklySchedule(
  schedule: WeeklySchedule,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (schedule.days.length !== 7) {
    errors.push({
      field: "days",
      message: `Schedule must have 7 days, got ${schedule.days.length}`,
    });
  }

  for (const day of schedule.days) {
    const slotCount = day.availableMealSlots.length;
    if (slotCount < 1 || slotCount > 5) {
      errors.push({
        field: `days[${day.date}].slots`,
        message: `Day must have 1-5 meal slots, got ${slotCount}`,
      });
    }
  }

  return errors;
}
