import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon } from "lucide-react";
import type { MenuItem } from "../backend";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Unavailable</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-display line-clamp-1">{item.name}</CardTitle>
          <span className="text-lg font-semibold text-primary shrink-0">${item.price.toFixed(2)}</span>
        </div>
        <CardDescription className="line-clamp-2 text-sm">{item.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={() => onAddToCart(item)}
          disabled={!item.available}
          className="w-full font-medium"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
