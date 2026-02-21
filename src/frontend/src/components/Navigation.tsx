import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShoppingCart, UtensilsCrossed, Package, Settings, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserRole } from "../hooks/useQueries";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onOpenCart: () => void;
}

export function Navigation({ onOpenCart }: NavigationProps) {
  const { totalItems } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userRole } = useGetCallerUserRole();
  const { theme, setTheme } = useTheme();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isAdmin = userRole === "admin";
  const isAuthenticated = loginStatus === "success" && identity;

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl hidden sm:inline">Smart Canteen</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/menu">
            <Button
              variant={isActive("/menu") ? "default" : "ghost"}
              size="sm"
              className="font-medium"
            >
              Menu
            </Button>
          </Link>
          
          {isAuthenticated && (
            <Link to="/orders">
              <Button
                variant={isActive("/orders") ? "default" : "ghost"}
                size="sm"
                className="font-medium"
              >
                <Package className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link to="/admin/menu">
                <Button
                  variant={isActive("/admin/menu") ? "default" : "ghost"}
                  size="sm"
                  className="font-medium hidden md:flex"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Menu
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button
                  variant={isActive("/admin/orders") ? "default" : "ghost"}
                  size="sm"
                  className="font-medium hidden md:flex"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Manage Orders
                </Button>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCart}
            className="relative font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {totalItems}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clear()}
              className="font-medium"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="font-medium"
            >
              <LogIn className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {loginStatus === "logging-in" ? "Connecting..." : "Login"}
              </span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
