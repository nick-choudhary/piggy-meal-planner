import { Utensils } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Piggy</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Weekly Meal Planner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold text-[#fc8019]">Swiggy</span>
          </div>
        </div>
      </div>
    </header>
  );
}
