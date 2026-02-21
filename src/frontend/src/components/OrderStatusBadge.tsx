import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "../backend";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "default" },
  preparing: { label: "Preparing", variant: "secondary" },
  ready: { label: "Ready", variant: "outline" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  const colorClass = {
    pending: "bg-status-pending text-foreground",
    preparing: "bg-status-preparing text-white",
    ready: "bg-status-ready text-white",
    completed: "bg-status-completed text-muted-foreground",
    cancelled: "bg-status-cancelled text-white",
  }[status];

  return (
    <Badge variant={config.variant} className={colorClass}>
      {config.label}
    </Badge>
  );
}
