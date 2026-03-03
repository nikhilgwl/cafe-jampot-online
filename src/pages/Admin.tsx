import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Store,
  Package,
  LayoutDashboard,
  Search,
  Loader2,
  Users,
  UserCheck,
  Shield,
  Trash2,
  PlusCircle,
  UtensilsCrossed
} from "lucide-react";
import { categories } from "@/data/menuData";
import jampotLogo from "@/assets/cafe-jampot-logo.png";
import { isWithinDeliveryWindow } from "@/lib/deliveryWindow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MenuItemDB {
  id: string;
  name: string;
  price: number;
  price_small: number | null;
  price_large: number | null;
  category: string;
  is_veg: boolean;
  is_available: boolean;
  created_at: string;
}

interface StockStatus {
  item_id: string;
  is_available: boolean;
}

interface PendingUser {
  user_id: string;
  email: string;
  created_at: string;
}

interface UserWithRole {
  user_id: string;
  email: string;
  role: "admin" | "staff" | null;
  created_at: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [stockStatus, setStockStatus] = useState<{ [key: string]: boolean }>({});
  const [dbMenuItems, setDbMenuItems] = useState<MenuItemDB[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingDelivery, setUpdatingDelivery] = useState(false);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([]);
  const [approvingUser, setApprovingUser] = useState<string | null>(null);
  const [removingRole, setRemovingRole] = useState<string | null>(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);

  // New Item Form State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemHasVariants, setNewItemHasVariants] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    price_small: "",
    price_large: "",
    category: "",
    is_veg: true,
  });

  useEffect(() => {
    const checkRoleAndRedirect = async (userId: string) => {
      const [{ data: hasStaffRole }, { data: hasAdminRole }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "staff" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      ]);

      if (!hasStaffRole && !hasAdminRole) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        setIsAdmin(hasAdminRole === true);
        loadData(hasAdminRole === true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
      else setTimeout(() => checkRoleAndRedirect(session.user.id), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else checkRoleAndRedirect(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (adminAccess: boolean) => {
    setLoading(true);
    try {
      // 1. Fetch menu items directly from Database
      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true });

      if (menuError) throw menuError;
      setDbMenuItems(menuData || []);

      // 2. Load delivery settings
      const { data: deliveryData } = await supabase
        .from("delivery_settings")
        .select("is_open")
        .limit(1)
        .maybeSingle();

      if (deliveryData) setIsDeliveryOpen(deliveryData.is_open);

      // 3. Load stock status
      const { data: stockData } = await supabase
        .from("stock_status")
        .select("item_id, is_available");

      if (stockData) {
        const status: { [key: string]: boolean } = {};
        stockData.forEach((item: StockStatus) => {
          status[item.item_id] = item.is_available;
        });
        setStockStatus(status);
      }

      if (adminAccess) await loadUserData();
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    const [{ data: pending }, { data: allUsers }] = await Promise.all([
      supabase.rpc("get_pending_users"),
      supabase.rpc("get_all_users_with_roles"),
    ]);
    if (pending) setPendingUsers(pending as PendingUser[]);
    if (allUsers) setUsersWithRoles(allUsers as UserWithRole[]);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) {
      toast({ title: "Error", description: "Name and category are required", variant: "destructive" });
      return;
    }

    setIsAddingItem(true);
    try {
      // Prepare payload based on variant selection
      const payload = {
        name: newItem.name,
        category: newItem.category,
        is_veg: newItem.is_veg,
        is_available: true,
        price: newItemHasVariants ? 0 : parseFloat(newItem.price || "0"),
        price_small: newItemHasVariants ? parseFloat(newItem.price_small || "0") : null,
        price_large: newItemHasVariants ? parseFloat(newItem.price_large || "0") : null,
      };

      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) throw error;

      toast({ title: "Success", description: "Item added to menu" });
      setNewItem({ name: "", price: "", price_small: "", price_large: "", category: "", is_veg: true });
      setNewItemHasVariants(false);
      loadData(isAdmin);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleApproveUser = async (userId: string, role: "admin" | "staff") => {
    setApprovingUser(userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast({ title: "Error", description: "Failed to approve user", variant: "destructive" });
    } else {
      toast({ title: "User Approved", description: `User granted ${role} access.` });
      await loadUserData();
    }
    setApprovingUser(null);
  };

  const handleRemoveRole = async (userId: string) => {
    setRemovingRole(userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: "Failed to remove role", variant: "destructive" });
    } else {
      toast({ title: "Role Removed", description: "User's access revoked." });
      await loadUserData();
    }
    setRemovingRole(null);
  };

  const updateDelivery = async (isOpen: boolean, override: boolean) => {
    setUpdatingDelivery(true);
    const { data: row } = await supabase.from("delivery_settings").select("id").limit(1).single();
    const { error } = await supabase
      .from("delivery_settings")
      .update({ is_open: isOpen, admin_override: override } as any)
      .eq("id", row?.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update delivery", variant: "destructive" });
    } else {
      setIsDeliveryOpen(isOpen);
      toast({ title: isOpen ? "Delivery Opened" : "Delivery Closed" });
    }
    setUpdatingDelivery(false);
  };

  const handleDeliveryToggle = async (checked: boolean) => {
    if (checked && !isWithinDeliveryWindow()) {
      setShowOverrideDialog(true);
      return;
    }
    await updateDelivery(checked, false);
  };

  const handleOverrideConfirm = async () => {
    setShowOverrideDialog(false);
    await updateDelivery(true, true);
  };

  const handleStockToggle = async (itemId: string, itemName: string, isAvailable: boolean) => {
    setUpdatingStock(itemId);
    const { data: existing } = await supabase.from("stock_status").select("id").eq("item_id", itemId).maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase.from("stock_status").update({ is_available: isAvailable }).eq("item_id", itemId));
    } else {
      ({ error } = await supabase.from("stock_status").insert({ item_id: itemId, item_name: itemName, is_available: isAvailable }));
    }

    if (error) {
      toast({ title: "Error", description: "Failed to update stock", variant: "destructive" });
    } else {
      setStockStatus((prev) => ({ ...prev, [itemId]: isAvailable }));
      toast({ title: isAvailable ? "Item Available" : "Out of Stock" });
    }
    setUpdatingStock(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredItems = dbMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: MenuItemDB[] });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={jampotLogo} alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-display text-xl font-bold">Admin Panel</h1>
              <p className="text-primary-foreground/70 text-xs">Staff Controls</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")}><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* New Item Form Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="w-5 h-5 text-primary" /> Add Menu Item</CardTitle>
            <CardDescription>Insert a new item directly into the database menu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Item Name</Label>
                <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Special Sandwich" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={(val) => setNewItem({ ...newItem, category: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-8 gap-4 px-2">
                <div className="flex items-center gap-2">
                  <Switch checked={newItem.is_veg} onCheckedChange={(v) => setNewItem({ ...newItem, is_veg: v })} />
                  <Label className="text-xs">{newItem.is_veg ? "VEG" : "NON-VEG"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newItemHasVariants} onCheckedChange={setNewItemHasVariants} />
                  <Label className="text-xs">VARIANTS</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {!newItemHasVariants ? (
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Small Price (₹)</Label>
                    <Input type="number" value={newItem.price_small} onChange={(e) => setNewItem({ ...newItem, price_small: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Large Price (₹)</Label>
                    <Input type="number" value={newItem.price_large} onChange={(e) => setNewItem({ ...newItem, price_large: e.target.value })} />
                  </div>
                </>
              )}
              <div className="md:col-start-3">
                <Button onClick={handleAddItem} disabled={isAddingItem} className="w-full">
                  {isAddingItem ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" /> Delivery Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={isDeliveryOpen} onCheckedChange={handleDeliveryToggle} disabled={updatingDelivery} />
              <Label>{isDeliveryOpen ? "Open for Delivery" : "Closed for Delivery"}</Label>
            </div>
            <Badge variant={isDeliveryOpen ? "default" : "secondary"}>{isDeliveryOpen ? "OPEN" : "CLOSED"}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Stock Management</CardTitle>
            <CardDescription>Fetching items live from DB. Out of stock items are hidden from customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(groupedItems).map(([catId, items]) => {
                const category = categories.find(c => c.id === catId);
                return (
                  <div key={catId} className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <span>{category?.icon || <UtensilsCrossed className="w-3 h-3" />}</span> {category?.name || catId}
                    </h3>
                    <div className="grid gap-2">
                      {items.map((item) => {
                        const isAvailable = stockStatus[item.id] !== false;
                        return (
                          <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${isAvailable ? "bg-card" : "bg-muted/50"}`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-3 h-3 border-2 rounded-sm flex-shrink-0 ${item.is_veg ? "border-emerald-600 bg-emerald-50" : "border-red-600 bg-red-50"}`} />
                              <span className={`truncate text-sm ${!isAvailable ? "line-through text-muted-foreground" : ""}`}>{item.name}</span>
                              <div className="flex gap-1 flex-shrink-0">
                                {item.price > 0 && <Badge variant="outline" className="text-[10px] py-0">₹{item.price}</Badge>}
                                {item.price_small && <Badge variant="outline" className="text-[10px] py-0">S:₹{item.price_small}</Badge>}
                                {item.price_large && <Badge variant="outline" className="text-[10px] py-0">L:₹{item.price_large}</Badge>}
                              </div>
                            </div>
                            <Switch checked={isAvailable} onCheckedChange={(c) => handleStockToggle(item.id, item.name, c)} disabled={updatingStock === item.id} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> User Management</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2"><UserCheck className="w-4 h-4" /> Pending ({pendingUsers.length})</h3>
                {pendingUsers.length === 0 ? <p className="text-sm text-muted-foreground py-2">No pending registrations</p> : (
                  <div className="space-y-2">
                    {pendingUsers.map(user => (
                      <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg border bg-amber-50">
                        <div className="flex flex-col"><span className="text-sm font-medium">{user.email}</span></div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApproveUser(user.user_id, "staff")}>Staff</Button>
                          <Button size="sm" onClick={() => handleApproveUser(user.user_id, "admin")}>Admin</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2"><Shield className="w-4 h-4" /> Active</h3>
                <div className="space-y-2">
                  {usersWithRoles.filter(u => u.role).map(user => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex flex-col"><span className="text-sm font-medium">{user.email}</span><Badge variant="secondary" className="w-fit text-[10px]">{user.role?.toUpperCase()}</Badge></div>
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveRole(user.user_id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open outside scheduled hours?</AlertDialogTitle>
            <AlertDialogDescription>The café is currently outside its scheduled window (Mon–Sat, 6:45 PM – 2:00 AM). Override and open delivery?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOverrideConfirm}>Confirm Override</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;