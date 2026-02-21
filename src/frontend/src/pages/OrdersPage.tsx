import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useGetUserOrders } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Loader2, Package, ArrowRight, LogIn } from "lucide-react";

export function OrdersPage() {
  const { data: orders, isLoading } = useGetUserOrders();
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = loginStatus === "success" && identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <Package className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your order history
          </p>
          <Button onClick={() => login()} disabled={loginStatus === "logging-in"}>
            <LogIn className="w-4 h-4 mr-2" />
            {loginStatus === "logging-in" ? "Connecting..." : "Login"}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const sortedOrders = orders
    ? [...orders].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track your order history and current orders</p>
        </div>

        {sortedOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-display font-semibold text-xl mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start ordering from our menu to see your orders here
              </p>
              <Link to="/menu">
                <Button>
                  Browse Menu
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate({ to: "/order/$orderId", params: { orderId: order.id } })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="font-display text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ${order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
