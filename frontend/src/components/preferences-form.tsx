"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, IndianRupee, X } from "lucide-react";

export interface UserPreferences {
  budget: number;
  dietType: string;
  goalType: string;
  calories: { min: number; max: number };
  homeCookedRatio: number;
  deliveryRatio: number;
  dineoutRatio: number;
  cuisines: string[];
  allergies: string[];
}

interface PreferencesFormProps {
  onGenerate: (prefs: UserPreferences) => void;
  isLoading?: boolean;
}

const CUISINE_OPTIONS = [
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Thai",
  "Mediterranean",
  "Japanese",
  "Continental",
  "Korean",
  "American",
];

const ALLERGY_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Dairy",
  "Gluten",
  "Soy",
  "Eggs",
  "Shellfish",
  "Fish",
];

export function PreferencesForm({
  onGenerate,
  isLoading,
}: PreferencesFormProps) {
  const [budget, setBudget] = useState(5000);
  const [dietType, setDietType] = useState("VEGETARIAN");
  const [goalType, setGoalType] = useState("MAINTENANCE");
  const [calorieRange, setCalorieRange] = useState([1800, 2200]);
  const [mealMix, setMealMix] = useState([50, 30, 20]); // home, delivery, dineout
  const [cuisines, setCuisines] = useState<string[]>([
    "Indian",
    "Italian",
    "Mediterranean",
  ]);
  const [allergies, setAllergies] = useState<string[]>(["Peanuts"]);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  };

  const handleSubmit = () => {
    onGenerate({
      budget,
      dietType,
      goalType,
      calories: { min: calorieRange[0], max: calorieRange[1] },
      homeCookedRatio: mealMix[0] / 100,
      deliveryRatio: mealMix[1] / 100,
      dineoutRatio: mealMix[2] / 100,
      cuisines,
      allergies: allergies.map((a) => a.toLowerCase()),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Budget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            Weekly Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="pl-7 text-lg font-semibold"
                min={500}
                step={500}
              />
            </div>
          </div>
          <Slider
            value={[budget]}
            onValueChange={(v) => setBudget(Array.isArray(v) ? v[0] : v)}
            min={500}
            max={15000}
            step={250}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹500</span>
            <span>₹15,000</span>
          </div>
        </CardContent>
      </Card>

      {/* Diet & Goals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Diet & Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Diet Type</Label>
              <Select
                value={dietType}
                onValueChange={(v) => v && setDietType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="NON_VEG">Non-Vegetarian</SelectItem>
                  <SelectItem value="EGGETARIAN">Eggetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Health Goal</Label>
              <Select
                value={goalType}
                onValueChange={(v) => v && setGoalType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                  <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                  <SelectItem value="BALANCED">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Daily Calories: {calorieRange[0]} – {calorieRange[1]} kcal
            </Label>
            <Slider
              value={calorieRange}
              onValueChange={(v) =>
                setCalorieRange(Array.isArray(v) ? [...v] : [v])
              }
              min={1200}
              max={3500}
              step={50}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meal Mix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Meal Mix</CardTitle>
          <p className="text-xs text-muted-foreground">
            How do you want your week split?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <MealMixSlider
            label="Home Cooked"
            emoji="🏠"
            value={mealMix[0]}
            onChange={(v) => redistributeMix(0, v, mealMix, setMealMix)}
          />
          <MealMixSlider
            label="Delivery"
            emoji="🛵"
            value={mealMix[1]}
            onChange={(v) => redistributeMix(1, v, mealMix, setMealMix)}
          />
          <MealMixSlider
            label="Dine Out"
            emoji="🍽️"
            value={mealMix[2]}
            onChange={(v) => redistributeMix(2, v, mealMix, setMealMix)}
          />
        </CardContent>
      </Card>

      {/* Cuisines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Preferred Cuisines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <Badge
                key={c}
                variant={cuisines.includes(c) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleItem(cuisines, setCuisines, c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((a) => (
              <Badge
                key={a}
                variant={allergies.includes(a) ? "destructive" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleItem(allergies, setAllergies, a)}
              >
                {allergies.includes(a) && <X className="w-3 h-3 mr-0.5" />}
                {a}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate */}
      <Button
        size="lg"
        className="w-full text-base font-semibold h-12"
        onClick={handleSubmit}
        disabled={isLoading || cuisines.length === 0}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating your plan...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Meal Plan
          </span>
        )}
      </Button>
    </div>
  );
}

function MealMixSlider({
  label,
  emoji,
  value,
  onChange,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm">
          {emoji} {label}
        </span>
        <span className="text-sm font-medium tabular-nums">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        min={0}
        max={100}
        step={5}
      />
    </div>
  );
}

function redistributeMix(
  index: number,
  newValue: number,
  mix: number[],
  setMix: (v: number[]) => void,
) {
  const updated = [...mix];
  const diff = newValue - updated[index];
  updated[index] = newValue;

  // Distribute the difference across the other two sliders proportionally
  const others = [0, 1, 2].filter((i) => i !== index);
  const othersTotal = others.reduce((s, i) => s + updated[i], 0);

  if (othersTotal === 0) {
    // Split evenly
    const each = Math.round((100 - newValue) / 2);
    updated[others[0]] = each;
    updated[others[1]] = 100 - newValue - each;
  } else {
    let remaining = 100 - newValue;
    for (const i of others) {
      const ratio = updated[i] / othersTotal;
      updated[i] = Math.max(0, Math.round(remaining * ratio));
    }
    // Fix rounding
    const total = updated.reduce((s, v) => s + v, 0);
    if (total !== 100) {
      updated[others[0]] += 100 - total;
    }
  }

  setMix(updated);
}
