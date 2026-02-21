import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetAllMenuItems,
  useAddMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useToggleMenuItemAvailability,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import { Plus, Pencil, Trash2, Loader2, ImageIcon, Shield } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem, MenuCategory } from "../backend";

interface MenuItemFormData {
  id: string;
  name: string;
  description: string;
  price: string;
  category: MenuCategory;
  available: boolean;
  imageUrl: string;
}

const defaultFormData: MenuItemFormData = {
  id: "",
  name: "",
  description: "",
  price: "",
  category: "lunch" as MenuCategory,
  available: true,
  imageUrl: "",
};

export function AdminMenuPage() {
  const { data: menuItems, isLoading } = useGetAllMenuItems();
  const { data: isAdmin } = useIsCallerAdmin();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>(defaultFormData);

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

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        available: item.available,
        imageUrl: item.imageUrl || "",
      });
    } else {
      setEditingItem(null);
      setFormData(defaultFormData);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const menuItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price,
      category: formData.category,
      available: formData.available,
      imageUrl: formData.imageUrl || undefined,
    };

    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, item: menuItem });
        toast.success("Menu item updated successfully");
      } else {
        await addMenuItem.mutateAsync(menuItem);
        toast.success("Menu item added successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save menu item");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem.mutateAsync(id);
        toast.success("Menu item deleted");
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await toggleAvailability.mutateAsync(id);
      toast.success("Availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage menu items</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Caesar Salad"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the item..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as MenuCategory })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="snacks">Snacks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={addMenuItem.isPending || updateMenuItem.isPending}>
                {(addMenuItem.isPending || updateMenuItem.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingItem ? "Update" : "Add"} Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    {item.description}
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => handleToggleAvailability(item.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No menu items found. Add your first item to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
