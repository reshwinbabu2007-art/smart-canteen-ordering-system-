import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    available: boolean;
    imageUrl?: string;
    category: MenuCategory;
    price: number;
}
export interface OrderRecord {
    id: string;
    status: OrderStatus;
    customer: Principal;
    timestamp: bigint;
    items: Array<OrderItem>;
    totalPrice: number;
}
export interface OrderItem {
    quantity: bigint;
    menuItemId: string;
}
export enum MenuCategory {
    breakfast = "breakfast",
    lunch = "lunch",
    snacks = "snacks",
    dinner = "dinner",
    beverages = "beverages"
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    ready = "ready"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(item: MenuItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(order: OrderRecord): Promise<void>;
    deleteMenuItem(id: string): Promise<void>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllOrders(): Promise<Array<OrderRecord>>;
    getAvailableMenuItems(): Promise<Array<MenuItem>>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItem(id: string): Promise<MenuItem | null>;
    getMenuItemsByCategory(category: MenuCategory): Promise<Array<MenuItem>>;
    getOrder(id: string): Promise<OrderRecord | null>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<OrderRecord>>;
    getUserOrders(): Promise<Array<OrderRecord>>;
    isCallerAdmin(): Promise<boolean>;
    toggleMenuItemAvailability(id: string): Promise<void>;
    updateMenuItem(id: string, item: MenuItem): Promise<void>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
}
