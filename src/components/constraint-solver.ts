import {
  CandidatePlan,
  UserProfile,
  ValidationResult,
  Violation,
  SourceType,
  MealSlot,
} from "../models";
import { timeToMinutes } from "../utils/helpers";

export class ConstraintSolver {
  /**
   * Validate a candidate plan against all constraints.
   * Returns violations if any.
   */
  validate(plan: CandidatePlan, profile: UserProfile): ValidationResult {
    const violations: Violation[] = [
      ...this.checkBudgetConstraints(plan, profile),
      ...this.checkNutritionTargets(plan, profile),
      ...this.checkScheduleFeasibility(plan),
      ...this.checkVariety(plan),
    ];

    return { isValid: violations.length === 0, violations };
  }

  /**
   * Budget: total cost must not exceed weekly budget + 5% tolerance.
   */
  checkBudgetConstraints(
    plan: CandidatePlan,
    profile: UserProfile,
  ): Violation[] {
    const violations: Violation[] = [];
    const totalAllocated = plan.slots.reduce(
      (sum, s) => sum + s.budgetAllocation.amount,
      0,
    );
    const budgetLimit = profile.weeklyBudget.amount * 1.05;

    if (totalAllocated > budgetLimit) {
      violations.push({
        type: "budget",
        message: `Total allocated ₹${totalAllocated.toFixed(0)} exceeds budget ₹${profile.weeklyBudget.amount} (+5% = ₹${budgetLimit.toFixed(0)})`,
      });
    }

    return violations;
  }

  /**
   * Nutrition: daily calories and macros within ±15% of targets.
   */
  checkNutritionTargets(
    plan: CandidatePlan,
    profile: UserProfile,
  ): Violation[] {
    const violations: Violation[] = [];
    const targets = profile.healthGoals;

    // Group slots by day
    const dayGroups = new Map<string, MealSlot[]>();
    for (const slot of plan.slots) {
      const existing = dayGroups.get(slot.day) || [];
      existing.push(slot);
      dayGroups.set(slot.day, existing);
    }

    for (const [date, daySlots] of dayGroups) {
      // Sum up per-meal target midpoints to get daily total
      const dailyCalories = daySlots.reduce((sum, s) => {
        const mid =
          (s.targetNutrition.dailyCalories.min +
            s.targetNutrition.dailyCalories.max) /
          2;
        return sum + mid;
      }, 0);

      const calMin = targets.dailyCalories.min * 0.85;
      const calMax = targets.dailyCalories.max * 1.15;

      if (dailyCalories < calMin) {
        violations.push({
          type: "nutrition",
          date,
          message: `Daily calories ${dailyCalories.toFixed(0)} below minimum ${calMin.toFixed(0)} on ${date}`,
        });
      }
      if (dailyCalories > calMax) {
        violations.push({
          type: "nutrition",
          date,
          message: `Daily calories ${dailyCalories.toFixed(0)} above maximum ${calMax.toFixed(0)} on ${date}`,
        });
      }

      // Check protein
      const dailyProtein = daySlots.reduce((sum, s) => {
        const mid =
          (s.targetNutrition.proteinGrams.min +
            s.targetNutrition.proteinGrams.max) /
          2;
        return sum + mid;
      }, 0);

      if (
        dailyProtein < targets.proteinGrams.min * 0.85 ||
        dailyProtein > targets.proteinGrams.max * 1.15
      ) {
        violations.push({
          type: "nutrition",
          date,
          message: `Daily protein ${dailyProtein.toFixed(0)}g out of range on ${date}`,
        });
      }
    }

    return violations;
  }

  /**
   * Schedule: home-cooked needs 45min prep, dine-out needs 90min block.
   */
  checkScheduleFeasibility(plan: CandidatePlan): Violation[] {
    const violations: Violation[] = [];

    for (const slot of plan.slots) {
      const day = plan.schedule.days.find((d) => d.date === slot.day);
      if (!day) continue;

      const mealStart = timeToMinutes(slot.timeWindow.start);

      if (slot.sourceType === SourceType.INSTAMART) {
        // Need 45 min prep window before meal
        const prepStart = mealStart - 45;
        const hasConflict = day.events.some((ev) => {
          const evStart = timeToMinutes(
            new Date(ev.startTime).toTimeString().slice(0, 5),
          );
          const evEnd = timeToMinutes(
            new Date(ev.endTime).toTimeString().slice(0, 5),
          );
          return evStart < mealStart && evEnd > prepStart;
        });

        if (hasConflict) {
          violations.push({
            type: "schedule",
            slotId: slot.id,
            date: slot.day,
            message: `No 45-min prep window for home-cooked meal on ${slot.day} ${slot.mealType}`,
          });
        }
      }

      if (slot.sourceType === SourceType.DINEOUT) {
        // Need 90 min free block
        const dineEnd = mealStart + 90;
        const hasConflict = day.events.some((ev) => {
          const evStart = timeToMinutes(
            new Date(ev.startTime).toTimeString().slice(0, 5),
          );
          const evEnd = timeToMinutes(
            new Date(ev.endTime).toTimeString().slice(0, 5),
          );
          return evStart < dineEnd && evEnd > mealStart;
        });

        if (hasConflict) {
          violations.push({
            type: "schedule",
            slotId: slot.id,
            date: slot.day,
            message: `No 90-min free block for dine-out on ${slot.day} ${slot.mealType}`,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Variety: no 3 consecutive meals with same cuisine.
   */
  checkVariety(plan: CandidatePlan): Violation[] {
    const violations: Violation[] = [];
    const slots = plan.slots;

    for (let i = 2; i < slots.length; i++) {
      if (
        slots[i].cuisine &&
        slots[i].cuisine === slots[i - 1].cuisine &&
        slots[i].cuisine === slots[i - 2].cuisine
      ) {
        violations.push({
          type: "variety",
          slotId: slots[i].id,
          message: `Three consecutive ${slots[i].cuisine} meals at slot ${slots[i].id}`,
        });
      }
    }

    return violations;
  }
}
