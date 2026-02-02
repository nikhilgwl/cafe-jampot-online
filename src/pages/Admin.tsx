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
import { LogOut, Store, Package, LayoutDashboard, Search, Loader2, Users, UserCheck, Shield, Trash2 } from "lucide-react";
import { menuItems, categories } from "@/data/menuData";
import jampotLogo from "@/assets/cafe-jampot-logo.png";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingDelivery, setUpdatingDelivery] = useState(false);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([]);
  const [approvingUser, setApprovingUser] = useState<string | null>(null);
  const [removingRole, setRemovingRole] = useState<string | null>(null);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setTimeout(() => checkRoleAndRedirect(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        checkRoleAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (adminAccess: boolean) => {
    setLoading(true);
    try {
      // Load delivery settings
      const { data: deliveryData } = await supabase
        .from("delivery_settings")
        .select("is_open")
        .limit(1)
        .maybeSingle();

      if (deliveryData) {
        setIsDeliveryOpen(deliveryData.is_open);
      }

      // Load stock status
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

      // Load user management data if admin
      if (adminAccess) {
        await loadUserData();
      }
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

  const handleApproveUser = async (userId: string, role: "admin" | "staff") => {
    setApprovingUser(userId);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "User Approved",
        description: `User has been granted ${role} access.`,
      });
      await loadUserData();
    }
    setApprovingUser(null);
  };

  const handleRemoveRole = async (userId: string) => {
    setRemovingRole(userId);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "Failed to remove user role. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role Removed",
        description: "User's access has been revoked.",
      });
      await loadUserData();
    }
    setRemovingRole(null);
  };

  const handleDeliveryToggle = async (checked: boolean) => {
    setUpdatingDelivery(true);
    const { error } = await supabase
      .from("delivery_settings")
      .update({ is_open: checked })
      .eq("id", (await supabase.from("delivery_settings").select("id").limit(1).single()).data?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    } else {
      setIsDeliveryOpen(checked);
      toast({
        title: checked ? "Delivery Opened" : "Delivery Closed",
        description: `Customers ${checked ? "can now" : "cannot"} place orders.`,
      });
    }
    setUpdatingDelivery(false);
  };

  const handleStockToggle = async (itemId: string, itemName: string, isAvailable: boolean) => {
    setUpdatingStock(itemId);
    
    // Check if entry exists
    const { data: existing } = await supabase
      .from("stock_status")
      .select("id")
      .eq("item_id", itemId)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("stock_status")
        .update({ is_available: isAvailable })
        .eq("item_id", itemId));
    } else {
      ({ error } = await supabase
        .from("stock_status")
        .insert({ item_id: itemId, item_name: itemName, is_available: isAvailable }));
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update stock status",
        variant: "destructive",
      });
    } else {
      setStockStatus((prev) => ({ ...prev, [itemId]: isAvailable }));
      toast({
        title: isAvailable ? "Item Available" : "Item Out of Stock",
        description: `${itemName} is now ${isAvailable ? "available" : "out of stock"}.`,
      });
    }
    setUpdatingStock(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: typeof menuItems });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={jampotLogo} alt="Cafe Jampot" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-display text-xl font-bold">Admin Panel</h1>
              <p className="text-primary-foreground/70 text-xs">Staff Controls</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/70">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Delivery Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Delivery Status
            </CardTitle>
            <CardDescription>
              Toggle delivery availability for customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="delivery-status"
                  checked={isDeliveryOpen}
                  onCheckedChange={handleDeliveryToggle}
                  disabled={updatingDelivery}
                />
                <Label htmlFor="delivery-status" className="cursor-pointer">
                  {isDeliveryOpen ? "Open for Delivery" : "Closed for Delivery"}
                </Label>
              </div>
              <Badge variant={isDeliveryOpen ? "default" : "secondary"} className={isDeliveryOpen ? "bg-emerald-500" : ""}>
                {isDeliveryOpen ? "OPEN" : "CLOSED"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stock Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Stock Management
            </CardTitle>
            <CardDescription>
              Mark items as out of stock to hide them from customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {Object.entries(groupedItems).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId);
                return (
                  <div key={categoryId} className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <span>{category?.icon}</span>
                      {category?.name || categoryId}
                    </h3>
                    <div className="grid gap-2">
                      {items.map((item) => {
                        const isAvailable = stockStatus[item.id] !== false;
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isAvailable ? "bg-card" : "bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 border-2 rounded-sm flex-shrink-0 ${
                                  item.isVeg
                                    ? "border-emerald-600 bg-emerald-50"
                                    : "border-red-600 bg-red-50"
                                }`}
                              />
                              <span className={!isAvailable ? "line-through text-muted-foreground" : ""}>
                                {item.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                ₹{item.price}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {updatingStock === item.id && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                              <Switch
                                checked={isAvailable}
                                onCheckedChange={(checked) =>
                                  handleStockToggle(item.id, item.name, checked)
                                }
                                disabled={updatingStock === item.id}
                              />
                            </div>
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

        {/* User Management Card - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Approve pending registrations and manage user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pending Users */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Pending Approvals ({pendingUsers.length})
                </h3>
                {pendingUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No pending registrations</p>
                ) : (
                  <div className="space-y-2">
                    {pendingUsers.map((user) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">{user.email}</span>
                          <span className="text-xs text-muted-foreground">
                            Registered: {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {approvingUser === user.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveUser(user.user_id, "staff")}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Staff
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveUser(user.user_id, "admin")}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Admin
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Users with Roles */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Active Users
                </h3>
                {usersWithRoles.filter(u => u.role).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No active users with roles</p>
                ) : (
                  <div className="space-y-2">
                    {usersWithRoles
                      .filter((u) => u.role)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm">{user.email}</span>
                            <Badge
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className="w-fit text-xs"
                            >
                              {user.role?.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {removingRole === user.user_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveRole(user.user_id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="flex gap-4 justify-center pb-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            ← Back to Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Admin;