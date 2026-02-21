# Smart Canteen Ordering System

## Current State

This is a fresh Caffeine project with:
- Basic React + TypeScript frontend scaffold with shadcn/ui components
- Internet Identity authentication provider configured
- No App.tsx component yet (needs to be created)
- Empty backend (no Motoko code)
- No data models or business logic

## Requested Changes (Diff)

### Add

**Backend:**
- Menu management system with categories (Breakfast, Lunch, Dinner, Beverages, Snacks)
- Menu items with name, description, price, category, availability status, and image URL
- Order management system to track orders with statuses (pending, preparing, ready, completed, cancelled)
- Order items linking orders to menu items with quantity
- User order history
- Admin functions to add/edit/delete menu items and update item availability
- Admin functions to view all orders and update order status
- User functions to browse menu, create orders, view order status, and view order history

**Frontend:**
- App.tsx with routing for customer and admin views
- Customer menu browsing page with category filters
- Shopping cart functionality
- Order placement interface
- Real-time order status tracking page
- Order history page for customers
- Admin dashboard to manage menu items (add, edit, delete, toggle availability)
- Admin order management page to view incoming orders and update status
- Responsive design for mobile and tablet use

### Modify

None (new application)

### Remove

None (new application)

## Implementation Plan

1. **Select Components:**
   - authorization (for admin vs. customer role-based access)

2. **Backend Generation:**
   - Generate Motoko backend with:
     - Data types for MenuItem, Order, OrderItem
     - CRUD operations for menu items (admin only)
     - Order creation, retrieval, and status updates
     - Query functions for menu browsing by category
     - User order history retrieval
     - Admin order management functions

3. **Frontend Development:**
   - Create App.tsx with routing (react-router-dom)
   - Customer pages:
     - Menu browser with category tabs/filters
     - Cart sidebar/modal with add/remove items
     - Checkout and order confirmation
     - Order status tracker (shows current order progress)
     - Order history list
   - Admin pages:
     - Menu management table with inline edit/delete
     - Add new menu item form
     - Orders dashboard with status filter
     - Order detail view with status update controls
   - Shared components:
     - Navigation bar with role-based menu
     - Menu item card component
     - Order status badge component

4. **Validation:**
   - Run typecheck, lint, and build to ensure no errors

## UX Notes

- **Customer Flow:** Browse menu → Add to cart → Place order → Track order status → Receive notification when ready
- **Admin Flow:** Manage menu items (add/update/delete) → Monitor incoming orders → Update order status (preparing → ready → completed)
- **Authentication:** Use Internet Identity for login; authorization component assigns customer/admin roles
- **Visual Design:** Clean, food-focused interface with prominent menu item images, clear pricing, and intuitive cart interaction
- **Mobile-First:** Optimize for handheld devices as canteen users typically order on-the-go
- **Real-Time Updates:** Order status should be easily checkable; admin can efficiently process multiple orders
