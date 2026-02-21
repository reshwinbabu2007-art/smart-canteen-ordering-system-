import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MenuItemCard } from "../components/MenuItemCard";
import { useGetAvailableMenuItems } from "../hooks/useQueries";
import { useCart } from "../contexts/CartContext";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { MenuCategory, MenuItem } from "../backend";
import { toast } from "sonner";

const categories = [
  { value: "all", label: "All Items" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "beverages", label: "Beverages" },
  { value: "snacks", label: "Snacks" },
];

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: menuItems, isLoading } = useGetAvailableMenuItems();
  const { addItem } = useCart();

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      description: `$${item.price.toFixed(2)}`,
    });
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems?.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4 text-balance">
              Delicious meals,
              <br />
              <span className="text-primary">one tap away</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Browse our fresh menu, order ahead, and skip the line. Your meal will be ready when you are.
            </p>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="container mx-auto px-4 py-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-8">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="font-medium whitespace-nowrap"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !filteredItems || filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-display font-semibold text-xl mb-2">No items available</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? "Check back soon for new menu items"
                  : "No items in this category right now"}
              </p>
            </div>
          ) : (
            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
}
