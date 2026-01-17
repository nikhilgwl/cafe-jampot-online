import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import jampotLogo from "@/assets/cafe-jampot-logo.png";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [pendingAccess, setPendingAccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string | null } | null>(null);

  useEffect(() => {
    const evaluateAccess = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!session) {
        setCurrentUser(null);
        setPendingAccess(false);
        setCheckingAccess(false);
        return;
      }

      setCurrentUser({ id: session.user.id, email: session.user.email });
      setCheckingAccess(true);

      const [{ data: hasStaffRole }, { data: hasAdminRole }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "staff" }),
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }),
      ]);

      const allowed = Boolean(hasStaffRole || hasAdminRole);
      setPendingAccess(!allowed);
      setCheckingAccess(false);

      if (allowed) {
        navigate("/admin");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Avoid calling other Supabase methods synchronously inside the callback
      setTimeout(() => evaluateAccess(session), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      evaluateAccess(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      toast({
        title: "Sign Up Failed",
        description: "Unable to create account. Please try again or contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created",
        description: "Please contact admin to get staff access.",
      });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPendingAccess(false);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <img src={jampotLogo} alt="Cafe Jampot" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">Staff Login</CardTitle>
          <CardDescription>Access the dashboard and admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAccess && currentUser ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="font-medium">Your account is created, but access is not enabled yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask an admin to grant you a staff/admin role.
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email:</span> {currentUser.email}
                  </p>
                  <p className="break-all">
                    <span className="text-muted-foreground">User ID:</span> {currentUser.id}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Logout
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => navigate("/")}
                  >← Back to Menu</Button
                >
              </div>
            </div>
          ) : (
            <>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="staff@cafejampot.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || checkingAccess}>
                      <LogIn className="w-4 h-4 mr-2" />
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="staff@cafejampot.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || checkingAccess}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      After sign up, contact admin to receive staff access.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => navigate("/")}>← Back to Menu</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;