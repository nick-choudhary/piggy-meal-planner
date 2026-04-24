import { Money, NutritionValues, TimeRange, DayOfWeek } from "../models";

export function inr(amount: number): Money {
  return { amount, currency: "INR" };
}

export function addMoney(a: Money, b: Money): Money {
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function sumMoney(items: Money[]): Money {
  return items.reduce((acc, m) => addMoney(acc, m), inr(0));
}

export function zeroNutrition(): NutritionValues {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
}

export function addNutrition(
  a: NutritionValues,
  b: NutritionValues,
): NutritionValues {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
  };
}

export function averageNutrition(
  values: NutritionValues[],
  count: number,
): NutritionValues {
  const total = values.reduce(
    (acc, v) => addNutrition(acc, v),
    zeroNutrition(),
  );
  return {
    calories: Math.round(total.calories / count),
    protein: Math.round(total.protein / count),
    carbs: Math.round(total.carbs / count),
    fat: Math.round(total.fat / count),
    fiber: Math.round(total.fiber / count),
  };
}

/** Parse "HH:mm" to minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Check if two time ranges overlap */
export function timeRangesOverlap(a: TimeRange, b: TimeRange): boolean {
  const aStart = timeToMinutes(a.start);
  const aEnd = timeToMinutes(a.end);
  const bStart = timeToMinutes(b.start);
  const bEnd = timeToMinutes(b.end);
  return aStart < bEnd && bStart < aEnd;
}

/** Get day of week from ISO date string */
export function getDayOfWeek(dateStr: string): DayOfWeek {
  const days: DayOfWeek[] = [
    DayOfWeek.SUN,
    DayOfWeek.MON,
    DayOfWeek.TUE,
    DayOfWeek.WED,
    DayOfWeek.THU,
    DayOfWeek.FRI,
    DayOfWeek.SAT,
  ];
  return days[new Date(dateStr).getDay()];
}

/** Check if a day is a weekend */
export function isWeekend(day: DayOfWeek): boolean {
  return day === DayOfWeek.SAT || day === DayOfWeek.SUN;
}

/** Add days to an ISO date string */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Sleep utility for backoff */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
