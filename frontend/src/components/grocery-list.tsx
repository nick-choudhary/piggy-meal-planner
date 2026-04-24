import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CalendarDays } from "lucide-react";

interface GroceryListProps {
  grocery: {
    items: {
      name: string;
      totalQuantity: number;
      unit: string;
      estimatedPrice: number;
    }[];
    totalCost: number;
    deliveryDays: string[];
  };
}

export function GroceryList({ grocery }: GroceryListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Grocery List
          </CardTitle>
          <Badge variant="outline" className="text-xs gap-1">
            <ShoppingCart className="w-3 h-3" />
            {grocery.items.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {grocery.items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm py-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.totalQuantity} {item.unit}
                </span>
              </div>
              <span className="text-sm font-medium shrink-0 ml-2">
                ₹{item.estimatedPrice}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total</span>
          <span className="text-sm font-semibold">
            ₹{grocery.totalCost.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Delivery: {grocery.deliveryDays.join(", ")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
