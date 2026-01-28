import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AirbearWheel from "@/components/airbear-wheel";
import EcoImpact from "@/components/eco-impact";
import CeoTshirtPromo from "@/components/ceo-tshirt-promo";
import AirbearAvatar from "@/components/airbear-avatar";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import { Loader2, Crown, Play, Leaf, Store, Route, Map, ExternalLink } from "lucide-react";
import { useState } from "react";

// Types for API responses
type Analytics = {
  totalSpots: number;
  totalRickshaws: number;
  activeRickshaws: number;
  chargingRickshaws: number;
  maintenanceRickshaws: number;
  averageBatteryLevel: number;
};

export default function Home() {
  const [showCeoPromo, setShowCeoPromo] = useState(false);

  const { data: spots, isLoading } = useQuery({
    queryKey: ["spots"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/spots');
        if (!response.ok) throw new Error('Failed to fetch spots');
        return await response.json();
      } catch (error) {
        console.error('Error fetching spots:', error);
        return [];
      }
    }
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["analytics", "overview"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics/overview');
        if (!response.ok) {
          // Fallback to mock data if API fails
          return {
            totalSpots: 16,
            totalRickshaws: 1,
            activeRickshaws: 1,
            chargingRickshaws: 0,
            maintenanceRickshaws: 0,
            averageBatteryLevel: 95
          };
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
          totalSpots: 16,
          totalRickshaws: 1,
          activeRickshaws: 1,
          chargingRickshaws: 0,
          maintenanceRickshaws: 0,
          averageBatteryLevel: 95
        };
      }
    }
  });

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
          <motion.div
            className="absolute top-1/2 left-1/4"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <AirbearWheel size="lg" className="opacity-30" effectType="solar" />
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/4"
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          >
            <AirbearWheel size="lg" className="opacity-20" effectType="eco" />
          </motion.div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Mascot Image */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <img
              src="/airbear-mascot.png"
              alt="Friendly brown bear mascot with pilot goggles representing AirBear"
              className="mx-auto rounded-full w-32 h-32 object-cover border-4 border-primary/30 hover-lift animate-pulse-glow"
              data-testid="img-mascot"
            />
          </motion.div>

          {/* Mini rickshaw avatars */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AirbearAvatar size="sm" />
            <AirbearAvatar size="md" />
            <AirbearAvatar size="sm" className="scale-90" />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-amber-500 bg-clip-text text-transparent animate-pulse-glow airbear-holographic text-outline-strong">
              Welcome to AirBear
            </span>
            <br />
            <span className="text-foreground airbear-solar-rays">Solar Powered Rideshare</span>

            {/* Holographic overlay effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full opacity-60"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${30 + Math.sin(i) * 20}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360, 720],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed airbear-eco-breeze"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-primary font-bold animate-shimmer">Experience the future of sustainable transportation!</span>
            <br />
            Solar-powered vehicles with onboard shopping experiences,
            <span className="text-emerald-500 font-semibold airbear-god-rays"> zero emissions</span>, and
            <span className="text-amber-500 font-semibold"> revolutionary eco-mobility!</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/map">
              <Button
                size="lg"
                className="group relative eco-gradient text-white hover-lift ripple-effect px-8 py-4 text-lg font-semibold animate-neon-glow"
                data-testid="button-book-airbear"
              >
                <AirbearWheel size="sm" className="mr-3" animated glowing />
                Book Your AirBear
              </Button>
            </Link>

            <Button
              size="lg"
              onClick={() => setShowCeoPromo(true)}
              className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white hover-lift ripple-effect px-8 py-4 text-lg font-semibold animate-pulse-glow"
              data-testid="button-ceo-tshirt"
            >
              <Crown className="mr-3 h-6 w-6" />
              CEO T-Shirt $100
            </Button>

              <a
                href="https://facebook.com/airbearme"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch Demo (opens in a new tab)"
            >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold hover-lift ripple-effect"
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-3 h-4 w-4" />
                  Watch Demo
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center hover-lift" data-testid="stat-rides">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {analytics?.totalRickshaws || 5}
              </div>
              <div className="text-sm text-muted-foreground">Active AirBears</div>
            </div>
            <div className="text-center hover-lift" data-testid="stat-co2">
              <div className="text-2xl sm:text-3xl font-bold text-lime-500">582kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Saved</div>
            </div>
            <div className="text-center hover-lift" data-testid="stat-spots">
              <div className="text-2xl sm:text-3xl font-bold text-amber-500">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  analytics?.totalSpots || 16
                )}
              </div>
              <div className="text-sm text-muted-foreground">Active Spots</div>
            </div>
            <div className="text-center hover-lift" data-testid="stat-solar">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-500">100%</div>
              <div className="text-sm text-muted-foreground">Solar Powered</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-b from-transparent to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary animate-pulse-glow">AirBear</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <span className="text-emerald-600 font-semibold">"Buy the tee, ride for free—AirBear's eco-key!"</span>
              <br />Experience the future of sustainable transportation in Binghamton
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism hover-lift h-full" data-testid="card-eco-friendly">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                    100% Eco-Friendly
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Solar-powered rickshaws that produce zero emissions while reducing your carbon footprint
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism hover-lift h-full" data-testid="card-mobile-bodega">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                    Mobile Bodega
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Shop local products during your ride with our onboard convenience store
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism hover-lift h-full" data-testid="card-smart-routing">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Route className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                    Smart AirBear Routing
                  </h3>
                  <p className="text-muted-foreground text-center">
                    AI-powered AirBear routing across 16 Binghamton locations with clear pathways
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Eco Impact Section */}
      <EcoImpact />

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-500 via-lime-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Start Your Eco Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of Binghamton residents who are making a difference, one ride at a time
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-emerald-600 hover:bg-white/90 px-8 py-4 text-lg font-semibold hover-lift"
                  data-testid="button-get-started"
                >
                  <AirbearWheel size="sm" className="mr-3 border-emerald-600" />
                  Get Started Today
                </Button>
              </Link>

              <Link to="/map">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold hover-lift"
                  data-testid="button-explore-map"
                >
                  <Map className="mr-3 h-4 w-4" />
                  Explore Map
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CEO T-Shirt Promo Dialog */}
      <CeoTshirtPromo
        isOpen={showCeoPromo}
        onClose={() => setShowCeoPromo(false)}
      />
    </div>
  );
}
