import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "./components/Navigation";
import { CartSidebar } from "./components/CartSidebar";
import { CartProvider, useCart } from "./contexts/CartContext";
import { MenuPage } from "./pages/MenuPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { AdminMenuPage } from "./pages/AdminMenuPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCreateOrder } from "./hooks/useQueries";
import { toast } from "sonner";
import { Navigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { OrderStatus } from "./backend";
import type { OrderRecord, OrderItem } from "./backend";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { items, clearCart, totalPrice } = useCart();
  const { identity } = useInternetIdentity();
  const createOrder = useCreateOrder();

  const handleCheckout = async () => {
    if (!identity) {
      toast.error("Please log in to place an order");
      setCartOpen(false);
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const orderItems: OrderItem[] = items.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: BigInt(item.quantity),
      }));

      const order: OrderRecord = {
        id: Date.now().toString(),
        customer: identity.getPrincipal(),
        items: orderItems,
        totalPrice,
        status: OrderStatus.pending,
        timestamp: BigInt(Date.now() * 1000000),
      };

      await createOrder.mutateAsync(order);
      clearCart();
      setCartOpen(false);
      toast.success("Order placed successfully!", {
        description: "You can track your order in the Orders page",
      });
    } catch (error) {
      toast.error("Failed to place order", {
        description: "Please try again",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            © 2026. Built with{" "}
            <Heart className="w-4 h-4 text-primary fill-primary inline-block" />{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/menu" />,
});

const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/menu",
  component: MenuPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order/$orderId",
  component: OrderDetailPage,
});

const adminMenuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/menu",
  component: AdminMenuPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/orders",
  component: AdminOrdersPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  menuRoute,
  ordersRoute,
  orderDetailRoute,
  adminMenuRoute,
  adminOrdersRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
