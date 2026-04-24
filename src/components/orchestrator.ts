import {
  RawInput,
  PlanResult,
  SourceType,
  WeeklyMealPlan,
  ResolvedMeal,
  MealSlot,
  DietaryRuleset,
} from "../models";
import { IntakeProcessor } from "./intake-processor";
import { PlanGenerator } from "./plan-generator";
import { ConstraintSolver } from "./constraint-solver";
import { MealResolver } from "./meal-resolver";
import { Aggregator } from "./aggregator";

const MAX_CONSTRAINT_ITERATIONS = 5;
const RESOLUTION_TIMEOUT_MS = 60_000;

export class MealPlanOrchestrator {
  private intake = new IntakeProcessor();
  private planner = new PlanGenerator();
  private solver = new ConstraintSolver();
  private resolver = new MealResolver();
  private aggregator = new Aggregator();

  /**
   * Main entry point: generate a weekly meal plan from raw user input.
   * Pipeline: Intake → Planning → Constraint Solving → Resolution → Aggregation
   */
  async generateWeeklyMealPlan(rawInput: RawInput): Promise<PlanResult> {
    try {
      // Phase 1: Intake
      console.log("[Orchestrator] Phase 1: Intake processing...");
      const profile = this.intake.validateAndNormalize(rawInput);
      const schedule = this.intake.parseSchedule(rawInput);
      const dietRules = this.intake.mergeDietaryRules(rawInput);

      // Phase 2: Plan Generation
      console.log("[Orchestrator] Phase 2: Generating candidate plan...");
      let candidatePlan = this.planner.generateCandidatePlan(profile, schedule);

      // Phase 3: Constraint Solving (iterative)
      console.log("[Orchestrator] Phase 3: Constraint solving...");
      let validationResult = this.solver.validate(candidatePlan, profile);
      let iteration = 0;

      while (
        !validationResult.isValid &&
        iteration < MAX_CONSTRAINT_ITERATIONS
      ) {
        console.log(
          `  Iteration ${iteration + 1}: ${validationResult.violations.length} violations`,
        );
        candidatePlan = this.planner.rebalancePlan(
          candidatePlan,
          validationResult.violations,
        );
        validationResult = this.solver.validate(candidatePlan, profile);
        iteration++;
      }

      if (!validationResult.isValid) {
        return {
          success: false,
          message: `Unable to satisfy all constraints after ${MAX_CONSTRAINT_ITERATIONS} iterations. Consider increasing budget or adjusting preferences.`,
          violations: validationResult.violations,
        };
      }

      console.log(`  Constraints satisfied after ${iteration} iteration(s)`);

      // Phase 4: Resolution (parallel by source type)
      console.log("[Orchestrator] Phase 4: Resolving meals...");
      const resolvedMeals = await this.resolveAllMeals(
        candidatePlan.slots,
        dietRules,
      );

      // Phase 5: Aggregation
      console.log("[Orchestrator] Phase 5: Aggregating plan...");
      const slotDayMap = new Map(candidatePlan.slots.map((s) => [s.id, s.day]));
      const days = this.aggregator.buildDayPlansFromSlots(
        resolvedMeals,
        slotDayMap,
        rawInput.startDate,
      );

      const costBreakdown = this.aggregator.calculateCostBreakdown(
        resolvedMeals,
        profile,
      );
      const nutritionSummary = this.aggregator.calculateNutritionSummary(
        days,
        resolvedMeals,
      );
      const groceryList =
        this.aggregator.generateConsolidatedGroceryList(resolvedMeals);

      const plan: WeeklyMealPlan = {
        planId: `plan-${Date.now()}`,
        userId: profile.userId,
        createdAt: new Date().toISOString(),
        days,
        costBreakdown,
        nutritionSummary,
        groceryList,
      };

      console.log("[Orchestrator] Plan generated successfully!");
      return { success: true, plan };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Plan generation failed: ${message}`,
        violations: [],
      };
    }
  }

  /**
   * Resolve all meal slots in parallel, grouped by source type.
   */
  private async resolveAllMeals(
    slots: MealSlot[],
    dietRules: DietaryRuleset,
  ): Promise<ResolvedMeal[]> {
    const instamartSlots = slots.filter(
      (s) => s.sourceType === SourceType.INSTAMART,
    );
    const foodSlots = slots.filter(
      (s) => s.sourceType === SourceType.FOOD_DELIVERY,
    );
    const dineoutSlots = slots.filter(
      (s) => s.sourceType === SourceType.DINEOUT,
    );

    console.log(
      `  Resolving: ${instamartSlots.length} Instamart, ${foodSlots.length} Food, ${dineoutSlots.length} Dineout`,
    );

    // Resolve in parallel with timeout
    const resolveWithTimeout = async (
      resolveSlots: MealSlot[],
    ): Promise<ResolvedMeal[]> => {
      const results: ResolvedMeal[] = [];
      for (const slot of resolveSlots) {
        try {
          const resolved = await this.resolver.resolveSlot(slot, dietRules);
          results.push(resolved);
        } catch (err) {
          console.warn(`  Failed to resolve slot ${slot.id}: ${err}`);
          // Create a fallback estimated meal
          results.push(this.createFallbackMeal(slot));
        }
      }
      return results;
    };

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Resolution timeout")),
        RESOLUTION_TIMEOUT_MS,
      ),
    );

    try {
      const [instamartMeals, foodMeals, dineoutMeals] = (await Promise.race([
        Promise.all([
          resolveWithTimeout(instamartSlots),
          resolveWithTimeout(foodSlots),
          resolveWithTimeout(dineoutSlots),
        ]),
        timeoutPromise.then(() => {
          throw new Error("timeout");
        }),
      ])) as [ResolvedMeal[], ResolvedMeal[], ResolvedMeal[]];

      return [...instamartMeals, ...foodMeals, ...dineoutMeals];
    } catch {
      // On timeout, return whatever we have
      console.warn("  Resolution timed out, returning partial results");
      const partial = await Promise.all(
        slots.map((s) =>
          this.resolver
            .resolveSlot(s, dietRules)
            .catch(() => this.createFallbackMeal(s)),
        ),
      );
      return partial;
    }
  }

  private createFallbackMeal(slot: MealSlot): ResolvedMeal {
    const calTarget =
      (slot.targetNutrition.dailyCalories.min +
        slot.targetNutrition.dailyCalories.max) /
      2;

    return {
      slotId: slot.id,
      sourceType: SourceType.FOOD_DELIVERY,
      items: [
        {
          name: `${slot.mealType} (unresolved)`,
          quantity: 1,
          unit: "serving",
          calories: calTarget,
          protein: 20,
          carbs: 50,
          fat: 15,
        },
      ],
      estimatedCost: slot.budgetAllocation,
      estimatedNutrition: {
        calories: calTarget,
        protein: 20,
        carbs: 50,
        fat: 15,
        fiber: 5,
      },
      fallbackUsed: true,
      nutritionEstimated: true,
      actionPayload: {
        restaurantId: "unresolved",
        restaurantName: "Unresolved — connect MCP servers",
        items: [],
        totalPrice: slot.budgetAllocation,
        estimatedDeliveryTime: 0,
      },
    };
  }
}
