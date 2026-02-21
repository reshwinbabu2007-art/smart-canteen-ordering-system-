import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { MenuItem, OrderRecord, OrderItem, MenuCategory, OrderStatus, UserRole } from "../backend";

// Menu Item Queries
export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems", "available"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMenuItemsByCategory(category: MenuCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems", "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getMenuItemsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetMenuItem(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem | null>({
    queryKey: ["menuItems", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMenuItem(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// Order Queries
export function useGetUserOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderRecord[]>({
    queryKey: ["orders", "user"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<OrderRecord | null>({
    queryKey: ["orders", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOrder(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderRecord[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrdersByStatus(status: OrderStatus | null) {
  const { actor, isFetching } = useActor();
  return useQuery<OrderRecord[]>({
    queryKey: ["orders", "status", status],
    queryFn: async () => {
      if (!actor || !status) return [];
      return actor.getOrdersByStatus(status);
    },
    enabled: !!actor && !isFetching && !!status,
  });
}

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: OrderRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateOrderStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: MenuItem) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addMenuItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: MenuItem }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMenuItem(id, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMenuItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
}

export function useToggleMenuItemAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleMenuItemAvailability(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
}
