import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import RickshawWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import {
  Leaf,
  Battery,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
  Award,
  Target,
  Calendar,
  Navigation,
  Activity
} from "lucide-react";
import NotificationSettings from "@/components/notification-settings";
import { useAirbearLocationUpdates } from "@/hooks/use-driver-location";

interface Analytics {
  totalSpots: number;
  totalAirbears: number;
  activeAirbears: number;
  chargingAirbears: number;
  maintenanceAirbears: number;
  averageBatteryLevel: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("overview");

  const { data: rides, isLoading: ridesLoading } = useQuery<any[]>({
    queryKey: ["rides", user?.id],
    queryFn: async () => {
      const supabase = getSupabaseClient(false);
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const supabase = getSupabaseClient(false);
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["analytics", "overview"],
    queryFn: async () => {
      const supabase = getSupabaseClient(false);
      if (!supabase) return {
        totalSpots: 16,
        totalAirbears: 1,
        activeAirbears: 1,
        chargingAirbears: 0,
        maintenanceAirbears: 0,
        averageBatteryLevel: 95
      };

      const [spotsRes, airbearsRes] = await Promise.all([
        supabase.from('spots').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('airbears').select('*')
      ]);

      const airbears = airbearsRes.data || [];
      return {
        totalSpots: spotsRes.count || 0,
        totalAirbears: airbears.length,
        activeAirbears: airbears.filter((a: any) => a.is_available).length,
        chargingAirbears: airbears.filter((a: any) => a.is_charging).length,
        maintenanceAirbears: 0,
        averageBatteryLevel: airbears.length > 0
          ? Math.round(airbears.reduce((sum: number, a: any) => sum + (a.battery_level || 0), 0) / airbears.length)
          : 0
      };
    }
  });

  const liveFleet = useAirbearLocationUpdates();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user === null) {
      // Only redirect if we know there's no user (not just loading)
      setLocation('/auth');
    }
  }, [user, setLocation]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const renderUserDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center items-center space-x-3 mb-4">
          <RickshawWheel size="lg" animated glowing />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary animate-pulse-glow">{user.username}</span>!
            </h1>
            <p className="text-emerald-600 font-semibold">
              "AirBear flair, ride without a care!"
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">
          Ready for your next eco-friendly AirBear adventure?
        </p>
      </motion.div>

      {/* Eco Points Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="eco-gradient text-white overflow-hidden relative" data-testid="card-eco-points">
          <div className="absolute top-4 right-4">
            <RickshawWheel size="lg" className="opacity-30" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Leaf className="mr-3 h-6 w-6" />
              Eco Points
            </CardTitle>
            <CardDescription className="text-white/80">
              Keep riding to earn more points and unlock rewards!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4 mb-4">
              <div className="text-4xl font-bold">{user.ecoPoints?.toLocaleString() || 0}</div>
              <div className="text-white/80 pb-1">points</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next level</span>
                <span>73%</span>
              </div>
              <Progress value={73} className="bg-white/20 h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link to="/map">
          <Card className="hover-lift glass-morphism cursor-pointer group" data-testid="card-book-airbear">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors group-hover:animate-bounce">
                <div className="text-2xl group-hover:animate-spin">🐻</div>
              </div>
              <h3 className="font-semibold mb-2">Book AirBear</h3>
              <p className="text-sm text-muted-foreground">Find nearby eco-rides</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/bodega">
          <Card className="hover-lift glass-morphism cursor-pointer group" data-testid="card-shop-bodega">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                <ShoppingCart className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-2">Shop Bodega</h3>
              <p className="text-sm text-muted-foreground">Browse local products</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/challenges">
          <Card className="hover-lift glass-morphism cursor-pointer group" data-testid="card-eco-challenges">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Eco Challenges</h3>
              <p className="text-sm text-muted-foreground">Weekly missions</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/rewards">
          <Card
            className="hover-lift glass-morphism cursor-pointer group"
            data-testid="card-rewards"
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Rewards</h3>
              <p className="text-sm text-muted-foreground">Claim your prizes</p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card className="glass-morphism" data-testid="card-total-rides">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Total Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {user.totalRides || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Lifetime journeys completed
            </p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-co2-saved">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-green-500" />
              CO₂ Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500 mb-2">
              {user.co2Saved || "0"} kg
            </div>
            <p className="text-sm text-muted-foreground">
              Environmental impact
            </p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-community-rank">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-amber-500" />
              Community Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500 mb-2">
              #47
            </div>
            <p className="text-sm text-muted-foreground">
              Top eco-warrior
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card className="glass-morphism" data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest rides and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {ridesLoading ? (
              <LoadingSpinner size="sm" text="Loading activities..." />
            ) : Array.isArray(rides) && rides.length > 0 ? (
              <div className="space-y-4">
                {rides.slice(0, 5).map((ride: any, index: number) => (
                  <motion.div
                    key={ride.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Ride #{ride.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {ride.status === "completed" ? "Completed" : "In Progress"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={ride.status === "completed" ? "default" : "secondary"}>
                      {ride.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RickshawWheel size="lg" className="mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No rides yet. Ready to start your first journey?</p>
                <Link to="/map">
                  <Button className="mt-4 eco-gradient text-white" data-testid="button-book-first-ride">
                    Book Your First Ride
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <NotificationSettings />
      </motion.div>
    </div>
  );

  const renderDriverDashboard = () => (
    <div className="space-y-8">
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center items-center space-x-3 mb-4">
          <RickshawWheel size="lg" animated glowing />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              AirBear Driver Hub
            </h1>
            <p className="text-emerald-600 font-semibold">
              "Solar power in the air!"
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">
          Manage your AirBear and track your eco-earnings
        </p>
      </motion.div>

      {/* Driver Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="glass-morphism" data-testid="card-battery-level">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Battery className="mr-2 h-5 w-5 text-green-500" />
              Battery Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500 mb-2">87%</div>
            <Progress value={87} className="mb-2" />
            <p className="text-sm text-muted-foreground">Good for 12 more rides</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-todays-earnings">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Zap className="mr-2 h-5 w-5 text-amber-500" />
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500 mb-2">$127</div>
            <p className="text-sm text-muted-foreground">8 rides completed</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-inventory-status">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">73%</div>
            <p className="text-sm text-muted-foreground">Stock remaining</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-rating">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-500" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500 mb-2">4.9</div>
            <p className="text-sm text-muted-foreground">247 reviews</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center items-center space-x-3 mb-4">
          <RickshawWheel size="lg" animated glowing />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              AirBear Command Center
            </h1>
            <p className="text-emerald-600 font-semibold">
              "Eco-rides so rare, powered by solar air!"
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">
          Monitor AirBear fleet and eco-analytics
        </p>
      </motion.div>

      {/* Fleet Overview */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="glass-morphism" data-testid="card-total-airbears">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <RickshawWheel size="sm" className="mr-2" />
              Total Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {analytics?.totalAirbears || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active AirBears</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-active-rides">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-green-500" />
              Active Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500 mb-2">
              {analytics?.activeAirbears || 0}
            </div>
            <p className="text-sm text-muted-foreground">Currently in service</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-revenue">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-amber-500" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500 mb-2">$12.4K</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="card-users">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500 mb-2">1.2K</div>
            <p className="text-sm text-muted-foreground">Monthly active</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Fleet Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card className="glass-morphism overflow-hidden">
          <CardHeader className="border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Live Fleet Tracking</CardTitle>
                <CardDescription>Real-time location and status of all AirBears</CardDescription>
              </div>
              <Link to="/map">
                <Button size="sm" className="eco-gradient text-white">
                  <MapPin className="mr-2 h-4 w-4" />
                  View Full Map
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground uppercase text-xs">
                    <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Location</th>
                    <th className="px-6 py-4 text-left font-semibold">Battery</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {liveFleet.length > 0 ? (
                    liveFleet.map((bear: any, index: number) => (
                      <motion.tr
                        key={bear.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                              🐻
                            </div>
                            <div>
                              <div className="font-bold">{bear.id}</div>
                              <div className="text-xs text-muted-foreground">Heading: {Math.round(bear.heading || 0)}°</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={bear.is_available ? "default" : "secondary"} className={bear.is_available ? "bg-green-500" : ""}>
                            {bear.is_available ? "Available" : "In Service"}
                          </Badge>
                          {bear.is_charging && (
                            <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-600 border-amber-200">
                              <Zap className="h-3 w-3 mr-1" />
                              Charging
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {bear.latitude?.toFixed(5)}, {bear.longitude?.toFixed(5)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 w-24">
                            <Progress value={bear.battery_level} className="h-1.5" />
                            <span className="text-xs font-medium">{bear.battery_level}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
                            <Navigation className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                        No active AirBears found in the fleet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <div className="p-4 bg-muted/5 border-t text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
              <span>Real-time tracking active • Syncing with Supabase</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {user.role === "admin" ? (
          renderAdminDashboard()
        ) : user.role === "driver" ? (
          renderDriverDashboard()
        ) : (
          renderUserDashboard()
        )}
      </div>
    </div>
  );
}
