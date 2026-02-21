import { useParams, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useGetOrder, useGetAllMenuItems } from "../hooks/useQueries";
import { Loader2, ArrowLeft, Package } from "lucide-react";
import { OrderStatus } from "../backend";

const statusSteps: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.preparing,
  OrderStatus.ready,
  OrderStatus.completed,
];

export function OrderDetailPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: order, isLoading: orderLoading } = useGetOrder(orderId || "");
  const { data: menuItems } = useGetAllMenuItems();

  if (orderLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <Package className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate({ to: "/orders" })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === OrderStatus.cancelled;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/orders" })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <CardTitle className="font-display text-2xl mb-2">
                  Order #{order.id.slice(0, 8)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Status Progress Tracker */}
            {!isCancelled && (
              <div className="mb-6">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-10">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {statusSteps.map((status, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={status} className="flex flex-col items-center gap-2 relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-border"
                          }`}
                        >
                          {isCompleted && <span className="text-sm font-bold">✓</span>}
                        </div>
                        <span
                          className={`text-xs font-medium capitalize ${
                            isCurrent ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3 mb-6">
              {order.items.map((orderItem, index) => {
                const menuItem = menuItems?.find((m) => m.id === orderItem.menuItemId);
                return (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="font-medium">{menuItem?.name || "Unknown Item"}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {Number(orderItem.quantity)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${menuItem ? (menuItem.price * Number(orderItem.quantity)).toFixed(2) : "0.00"}
                    </p>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
