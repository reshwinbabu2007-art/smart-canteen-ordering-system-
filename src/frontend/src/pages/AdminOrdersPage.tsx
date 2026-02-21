import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import {
  useGetAllOrders,
  useGetAllMenuItems,
  useUpdateOrderStatus,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import { Loader2, Package, Shield } from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";

const statusOptions: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.preparing,
  OrderStatus.ready,
  OrderStatus.completed,
  OrderStatus.cancelled,
];

export function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { data: allOrders, isLoading } = useGetAllOrders();
  const { data: menuItems } = useGetAllMenuItems();
  const { data: isAdmin } = useIsCallerAdmin();
  const updateStatus = useUpdateOrderStatus();

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page
          </p>
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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? allOrders
      : allOrders?.filter((order) => order.status === selectedStatus);

  const sortedOrders = filteredOrders
    ? [...filteredOrders].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Order Management</h1>
        <p className="text-muted-foreground">View and manage all customer orders</p>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="preparing">Preparing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-0">
          {sortedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
                <h3 className="font-display font-semibold text-xl mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  {selectedStatus === "all"
                    ? "There are no orders yet"
                    : `No orders with status: ${selectedStatus}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <CardTitle className="font-display text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => {
                          const menuItem = menuItems?.find((m) => m.id === item.menuItemId);
                          return (
                            <div key={index} className="text-sm flex items-center justify-between">
                              <span className="text-muted-foreground">
                                {menuItem?.name || "Unknown"} × {Number(item.quantity)}
                              </span>
                              <span className="font-medium">
                                ${menuItem ? (menuItem.price * Number(item.quantity)).toFixed(2) : "0.00"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Update Status:</label>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
