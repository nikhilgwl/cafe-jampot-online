import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  TrendingUp,
  IndianRupee,
  Settings,
  Users,
  Truck
} from "lucide-react";
import jampotLogo from "@/assets/cafe-jampot-logo.png";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

interface Order {
  id: string;
  customer_name: string;
  customer_mobile: string;
  hostel_name: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; isVeg: boolean }>;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string | null;
}

const HOSTELS = ["Fr. Enright", "Nilima", "MTR", "St. Thomas", "NH (Girls)", "NH (Boys)", "Other"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedHostel, setSelectedHostel] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");

  useEffect(() => {
    const checkRoleAndRedirect = async (userId: string) => {
      const [{ data: hasStaffRole }, { data: hasAdminRole }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "staff" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      ]);

      if (!hasStaffRole && !hasAdminRole) {
        toast({ title: "Access Denied", variant: "destructive" });
        navigate("/auth");
      } else {
        loadOrders();
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else checkRoleAndRedirect(session.user.id);
    });
  }, [navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as Order[]) || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    }
    setLoading(false);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.created_at);
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      if (orderDate < start || orderDate > end) return false;
      if (selectedHostel !== "all" && order.hostel_name !== selectedHostel) return false;
      if (selectedProduct !== "all") {
        return order.items.some((item) => item.name === selectedProduct);
      }
      return true;
    });
  }, [orders, startDate, endDate, selectedHostel, selectedProduct]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalDeliveryFees = filteredOrders.reduce((sum, order) => sum + Number(order.delivery_fee || 0), 0);
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_mobile)).size;

    const productSales: { [name: string]: { quantity: number; revenue: number } } = {};
    const hostelOrders: { [hostel: string]: number } = {};
    const hourlyVolume: { [hour: string]: number } = {};

    filteredOrders.forEach((order) => {
      // Product analytics
      order.items.forEach((item) => {
        if (!productSales[item.name]) productSales[item.name] = { quantity: 0, revenue: 0 };
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });

      // Hostel analytics
      hostelOrders[order.hostel_name] = (hostelOrders[order.hostel_name] || 0) + 1;

      // Hourly peak analysis
      const hour = format(parseISO(order.created_at), "HH:00");
      hourlyVolume[hour] = (hourlyVolume[hour] || 0) + 1;
    });

    return {
      totalRevenue,
      totalDeliveryFees,
      uniqueCustomers,
      totalOrders: filteredOrders.length,
      avgOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
      productSales: Object.entries(productSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10),
      hostelOrders: Object.entries(hostelOrders).sort((a, b) => b[1] - a[1]),
      hourlyVolume: Object.entries(hourlyVolume).sort((a, b) => a[0].localeCompare(b[0])),
    };
  }, [filteredOrders]);

  const uniqueProducts = useMemo(() => {
    const products = new Set<string>();
    orders.forEach((order) => order.items.forEach((item) => products.add(item.name)));
    return Array.from(products).sort();
  }, [orders]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={jampotLogo} alt="Cafe Jampot" className="w-10 h-10 object-contain" />
            <h1 className="font-display text-xl font-bold">Sales Analytics</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate("/admin")}><Settings className="w-4 h-4 mr-2" />Admin</Button>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))} className="border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/70">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Filters Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
              <div className="space-y-1"><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              <div className="space-y-1"><Label>Hostel</Label>
                <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                  <SelectTrigger><SelectValue placeholder="All Hostels" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Hostels</SelectItem>{HOSTELS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="All Products" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Products</SelectItem>{uniqueProducts.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-2xl font-bold">₹{stats.totalRevenue}</p></div>
            <IndianRupee className="text-emerald-500 w-8 h-8 opacity-20" />
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Customers</p><p className="text-2xl font-bold">{stats.uniqueCustomers}</p></div>
            <Users className="text-blue-500 w-8 h-8 opacity-20" />
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Delivery Rev</p><p className="text-2xl font-bold">₹{stats.totalDeliveryFees}</p></div>
            <Truck className="text-orange-500 w-8 h-8 opacity-20" />
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Avg Order</p><p className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(0)}</p></div>
            <TrendingUp className="text-purple-500 w-8 h-8 opacity-20" />
          </CardContent></Card>
        </div>

        {/* Richer Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {stats.productSales.map(([name, data]) => (
                <div key={name} className="flex justify-between items-center text-sm">
                  <span className="truncate flex-1">{name}</span>
                  <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground text-xs">{data.quantity} sold</span>
                    <Badge variant="secondary">₹{data.revenue}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Peak Order Times</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {stats.hourlyVolume.map(([hour, count]) => (
                <div key={hour} className="flex items-center gap-2">
                  <span className="text-xs w-12">{hour}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${(count / stats.totalOrders) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Order Log */}
        <Card>
          <CardHeader><CardTitle>Detailed Order Log</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-xs">{format(parseISO(order.created_at), "HH:mm, MMM dd")}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_mobile}</div>
                      </TableCell>
                      <TableCell>{order.hostel_name}</TableCell>
                      <TableCell className="text-right font-bold">₹{order.total_amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;