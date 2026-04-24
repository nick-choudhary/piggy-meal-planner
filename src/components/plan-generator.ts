import {
  UserProfile,
  WeeklySchedule,
  MealSlot,
  CandidatePlan,
  SourceType,
  MealType,
  DayOfWeek,
  Violation,
} from "../models";
import { isWeekend } from "../utils/helpers";

const CUISINES = [
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Thai",
  "Mediterranean",
  "Japanese",
  "Continental",
];

export class PlanGenerator {
  /**
   * Generate a candidate 7-day meal plan with source types assigned.
   */
  generateCandidatePlan(
    profile: UserProfile,
    schedule: WeeklySchedule,
  ): CandidatePlan {
    const allSlots: MealSlot[] = [];

    for (const day of schedule.days) {
      allSlots.push(...day.availableMealSlots);
    }

    const assignedSlots = this.assignMealSourceTypes(
      allSlots,
      profile,
      schedule,
    );
    this.assignCuisines(assignedSlots, profile.cuisinePreferences);

    return { slots: assignedSlots, schedule };
  }

  /**
   * Rebalance plan based on constraint violations.
   */
  rebalancePlan(plan: CandidatePlan, violations: Violation[]): CandidatePlan {
    const slots = [...plan.slots];

    for (const violation of violations) {
      if (violation.type === "budget") {
        // Shift expensive dineout/delivery slots to home-cooked
        this.shiftTowardsCheaper(slots);
      } else if (violation.type === "nutrition") {
        // Adjust cuisine assignments for better nutrition match
        this.adjustForNutrition(slots, violation);
      } else if (violation.type === "schedule") {
        // Change source type for conflicting slots
        if (violation.slotId) {
          const slot = slots.find((s) => s.id === violation.slotId);
          if (slot) {
            slot.sourceType = SourceType.FOOD_DELIVERY; // delivery is most schedule-flexible
          }
        }
      } else if (violation.type === "variety") {
        this.fixVariety(slots);
      }
    }

    return { slots, schedule: plan.schedule };
  }

  /**
   * Assign source types following Algorithm 2 from design.
   */
  assignMealSourceTypes(
    slots: MealSlot[],
    profile: UserProfile,
    schedule: WeeklySchedule,
  ): MealSlot[] {
    const total = slots.length;
    const prefs = profile.mealTypePreferences;
    const instamartTarget = Math.round(total * prefs.homeCookedRatio);
    const foodTarget = Math.round(total * prefs.deliveryRatio);

    let instamartCount = 0;
    let foodCount = 0;
    let dineoutCount = 0;
    const dineoutTarget = total - instamartTarget - foodTarget;

    // Sort by busyness (busiest days first)
    const sortedSlots = [...slots].sort((a, b) => {
      const aBusy = this.calculateBusyness(a, schedule);
      const bBusy = this.calculateBusyness(b, schedule);
      return bBusy - aBusy;
    });

    for (const slot of sortedSlots) {
      const busyness = this.calculateBusyness(slot, schedule);

      if (slot.mealType === MealType.BREAKFAST) {
        // Breakfast: prefer home-cooked or delivery, never dine-out
        if (instamartCount < instamartTarget && busyness < 0.7) {
          slot.sourceType = SourceType.INSTAMART;
          instamartCount++;
        } else if (foodCount < foodTarget) {
          slot.sourceType = SourceType.FOOD_DELIVERY;
          foodCount++;
        } else {
          slot.sourceType = SourceType.INSTAMART;
          instamartCount++;
        }
      } else if (
        slot.mealType === MealType.DINNER &&
        isWeekend(slot.dayOfWeek)
      ) {
        // Weekend dinners: prefer dine-out
        if (dineoutCount < dineoutTarget) {
          slot.sourceType = SourceType.DINEOUT;
          dineoutCount++;
        } else if (foodCount < foodTarget) {
          slot.sourceType = SourceType.FOOD_DELIVERY;
          foodCount++;
        } else {
          slot.sourceType = SourceType.INSTAMART;
          instamartCount++;
        }
      } else if (busyness > 0.8) {
        // Very busy: prefer delivery
        if (foodCount < foodTarget) {
          slot.sourceType = SourceType.FOOD_DELIVERY;
          foodCount++;
        } else {
          slot.sourceType = SourceType.INSTAMART;
          instamartCount++;
        }
      } else {
        // Default: home-cooked
        if (instamartCount < instamartTarget) {
          slot.sourceType = SourceType.INSTAMART;
          instamartCount++;
        } else if (foodCount < foodTarget) {
          slot.sourceType = SourceType.FOOD_DELIVERY;
          foodCount++;
        } else {
          slot.sourceType = SourceType.DINEOUT;
          dineoutCount++;
        }
      }
    }

    return slots;
  }

  /** Calculate busyness score (0-1) for a slot's day */
  private calculateBusyness(slot: MealSlot, schedule: WeeklySchedule): number {
    const day = schedule.days.find((d) => d.date === slot.day);
    if (!day) return 0;

    const eventMinutes = day.events.reduce((sum, ev) => {
      const start = new Date(ev.startTime).getTime();
      const end = new Date(ev.endTime).getTime();
      return sum + (end - start) / 60_000;
    }, 0);

    // Normalize: 8+ hours of events = fully busy
    return Math.min(eventMinutes / 480, 1);
  }

  /** Assign cuisines ensuring variety (no 3 consecutive same) */
  private assignCuisines(slots: MealSlot[], preferred: string[]): void {
    const pool = preferred.length > 0 ? preferred : CUISINES;

    for (let i = 0; i < slots.length; i++) {
      let cuisine: string;
      let attempts = 0;

      do {
        cuisine = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
      } while (
        attempts < 10 &&
        i >= 2 &&
        slots[i - 1].cuisine === cuisine &&
        slots[i - 2].cuisine === cuisine
      );

      slots[i].cuisine = cuisine;
    }
  }

  /** Shift dineout/delivery slots to instamart to reduce cost */
  private shiftTowardsCheaper(slots: MealSlot[]): void {
    for (const slot of slots) {
      if (slot.sourceType === SourceType.DINEOUT) {
        slot.sourceType = SourceType.FOOD_DELIVERY;
        return; // shift one at a time
      }
    }
    for (const slot of slots) {
      if (slot.sourceType === SourceType.FOOD_DELIVERY) {
        slot.sourceType = SourceType.INSTAMART;
        return;
      }
    }
  }

  /** Adjust cuisines for nutrition violations */
  private adjustForNutrition(slots: MealSlot[], violation: Violation): void {
    if (!violation.date) return;
    const daySlots = slots.filter((s) => s.day === violation.date);
    if (violation.message.includes("protein")) {
      // Shift toward protein-rich cuisines
      for (const slot of daySlots) {
        if (slot.cuisine !== "Indian" && slot.cuisine !== "Mediterranean") {
          slot.cuisine = "Indian"; // generally protein-rich options
          return;
        }
      }
    }
  }

  /** Fix variety violations */
  private fixVariety(slots: MealSlot[]): void {
    const pool = CUISINES;
    for (let i = 2; i < slots.length; i++) {
      if (
        slots[i].cuisine === slots[i - 1].cuisine &&
        slots[i].cuisine === slots[i - 2].cuisine
      ) {
        const alternatives = pool.filter((c) => c !== slots[i].cuisine);
        slots[i].cuisine =
          alternatives[Math.floor(Math.random() * alternatives.length)];
      }
    }
  }
}
