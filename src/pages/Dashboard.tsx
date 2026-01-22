import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Package,
  IndianRupee,
  Calendar,
  Filter,
  Settings,
  Loader2,
  BarChart3,
} from "lucide-react";
import { categories } from "@/data/menuData";
import jampotLogo from "@/assets/cafe-jampot-logo.png";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

interface Order {
  id: string;
  hostel_name: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; isVeg: boolean }>;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string | null;
}

const HOSTELS = ["GH-1", "GH-2", "GH-3", "GH-4", "GH-5", "GH-6", "GH-7", "GH-8", "GH-9", "GH-10", "GH-11", "GH-12", "Faculty Housing", "Other"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Filters
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHostel, setSelectedHostel] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");

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
        loadOrders();
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

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.created_at);
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));

      // Date filter
      if (orderDate < start || orderDate > end) return false;

      // Hostel filter
      if (selectedHostel !== "all" && order.hostel_name !== selectedHostel) return false;

      // Category/Product filter - check if any item matches
      if (selectedCategory !== "all" || selectedProduct !== "all") {
        const hasMatchingItem = order.items.some((item) => {
          if (selectedProduct !== "all" && item.name !== selectedProduct) return false;
          // Category matching would require item.category but we only have name
          return true;
        });
        if (!hasMatchingItem && selectedProduct !== "all") return false;
      }

      return true;
    });
  }, [orders, startDate, endDate, selectedCategory, selectedHostel, selectedProduct]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalOrders = filteredOrders.length;
    
    // Product sales
    const productSales: { [name: string]: { quantity: number; revenue: number } } = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    // Hostel-wise orders
    const hostelOrders: { [hostel: string]: number } = {};
    filteredOrders.forEach((order) => {
      hostelOrders[order.hostel_name] = (hostelOrders[order.hostel_name] || 0) + 1;
    });

    // Daily revenue
    const dailyRevenue: { [date: string]: number } = {};
    filteredOrders.forEach((order) => {
      const date = format(parseISO(order.created_at), "yyyy-MM-dd");
      dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.total_amount);
    });

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      productSales: Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10),
      hostelOrders: Object.entries(hostelOrders)
        .sort((a, b) => b[1] - a[1]),
      dailyRevenue: Object.entries(dailyRevenue)
        .sort((a, b) => a[0].localeCompare(b[0])),
    };
  }, [filteredOrders]);

  // Get unique products from orders
  const uniqueProducts = useMemo(() => {
    const products = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => products.add(item.name));
    });
    return Array.from(products).sort();
  }, [orders]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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
              <h1 className="font-display text-xl font-bold">Sales Dashboard</h1>
              <p className="text-primary-foreground/70 text-xs">Analytics & Reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/70">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hostel</Label>
                <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Hostels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hostels</SelectItem>
                    {HOSTELS.map((hostel) => (
                      <SelectItem key={hostel} value={hostel}>
                        {hostel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {uniqueProducts.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold font-display">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold font-display">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-3xl font-bold font-display">
                    ₹{stats.avgOrderValue.toFixed(0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Selling Products
              </CardTitle>
              <CardDescription>By revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.productSales.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No sales data available</p>
              ) : (
                <div className="space-y-3">
                  {stats.productSales.map(([name, data], index) => (
                    <div key={name} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.quantity} sold
                        </p>
                      </div>
                      <Badge variant="secondary">₹{data.revenue.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders by Hostel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Orders by Hostel
              </CardTitle>
              <CardDescription>Distribution of orders</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.hostelOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders data available</p>
              ) : (
                <div className="space-y-3">
                  {stats.hostelOrders.map(([hostel, count]) => (
                    <div key={hostel} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{hostel}</span>
                          <span className="text-sm text-muted-foreground">{count} orders</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${(count / stats.totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Revenue
            </CardTitle>
            <CardDescription>Revenue trend over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.dailyRevenue.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No revenue data available</p>
            ) : (
              <div className="space-y-2">
                {stats.dailyRevenue.map(([date, revenue]) => (
                  <div key={date} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">
                      {format(parseISO(date), "MMM dd")}
                    </span>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-primary/70 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.max(
                              (revenue / Math.max(...stats.dailyRevenue.map((d) => d[1] as number))) * 100,
                              10
                            )}%`,
                          }}
                        >
                          <span className="text-xs font-medium text-primary-foreground">
                            ₹{revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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

export default Dashboard;