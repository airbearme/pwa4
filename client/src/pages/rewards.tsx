import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import RickshawWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import {
  Award,
  Gift,
  Star,
  Trophy,
  Crown,
  Zap,
  CheckCircle,
  ShoppingBag,
  Coffee,
  Shirt
} from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: "discount" | "free_item" | "experience" | "exclusive";
  isAvailable: boolean;
  isClaimed: boolean;
  icon: string;
  color: string;
}

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  const rewards: Reward[] = [
    {
      id: "free-coffee",
      name: "Free Coffee",
      description: "One complimentary coffee from any AirBear bodega",
      pointsRequired: 100,
      category: "free_item",
      isAvailable: user?.ecoPoints ? user.ecoPoints >= 100 : false,
      isClaimed: claimedRewards.includes("free-coffee"),
      icon: "☕",
      color: "bg-amber-500"
    },
    {
      id: "discount-ride",
      name: "50% Off Ride",
      description: "Half price on your next AirBear ride",
      pointsRequired: 150,
      category: "discount",
      isAvailable: user?.ecoPoints ? user.ecoPoints >= 150 : false,
      isClaimed: claimedRewards.includes("discount-ride"),
      icon: "🚗",
      color: "bg-green-500"
    },
    {
      id: "eco-tshirt",
      name: "Eco Warrior T-Shirt",
      description: "Exclusive AirBear eco-warrior t-shirt",
      pointsRequired: 300,
      category: "exclusive",
      isAvailable: user?.ecoPoints ? user.ecoPoints >= 300 : false,
      isClaimed: claimedRewards.includes("eco-tshirt"),
      icon: "👕",
      color: "bg-purple-500"
    },
    {
      id: "priority-access",
      name: "Priority Access",
      description: "Skip the queue for one week",
      pointsRequired: 200,
      category: "experience",
      isAvailable: user?.ecoPoints ? user.ecoPoints >= 200 : false,
      isClaimed: claimedRewards.includes("priority-access"),
      icon: "⚡",
      color: "bg-yellow-500"
    },
    {
      id: "free-bodega",
      name: "Free Bodega Item",
      description: "One free item up to $10 from any bodega",
      pointsRequired: 250,
      category: "free_item",
      isAvailable: user?.ecoPoints ? user.ecoPoints >= 250 : false,
      isClaimed: claimedRewards.includes("free-bodega"),
      icon: "🛍️",
      color: "bg-blue-500"
    },
    {
      id: "carbon-neutral",
      name: "Carbon Neutral Badge",
      description: "Exclusive digital badge for carbon neutral users",
      pointsRequired: 500,
      category: "exclusive",
      isAvailable: user?.ecoPoints ? user.ecoPoints >= 500 : false,
      isClaimed: claimedRewards.includes("carbon-neutral"),
      icon: "🏆",
      color: "bg-emerald-500"
    }
  ];

  const handleClaimReward = (reward: Reward) => {
    if (!reward.isAvailable || reward.isClaimed) return;

    setClaimedRewards(prev => [...prev, reward.id]);
    toast({
      title: "Reward Claimed!",
      description: `${reward.name} has been added to your account.`,
    });
  };

  const currentPoints = user?.ecoPoints || 0;
  const availableRewards = rewards.filter(r => r.isAvailable && !r.isClaimed);
  const claimedCount = claimedRewards.length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading rewards..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Gift className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Rewards <span className="text-purple-500">Store</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Redeem your eco points for exclusive rewards and discounts
          </p>
        </motion.div>

        {/* Points Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="glass-morphism" data-testid="card-current-points">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Star className="mr-2 h-5 w-5 text-amber-500" />
                Current Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500 mb-2">
                {currentPoints}
              </div>
              <p className="text-sm text-muted-foreground">
                Eco points available
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism" data-testid="card-available-rewards">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Gift className="mr-2 h-5 w-5 text-green-500" />
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500 mb-2">
                {availableRewards.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Rewards you can claim
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism" data-testid="card-claimed-rewards">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-purple-500" />
                Claimed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {claimedCount}
              </div>
              <p className="text-sm text-muted-foreground">
                Rewards redeemed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rewards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-morphism hover-lift ${reward.isClaimed ? 'border-green-500/50' : ''} ${!reward.isAvailable && !reward.isClaimed ? 'opacity-60' : ''}`} data-testid={`card-reward-${reward.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{reward.icon}</span>
                    {reward.isClaimed && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {!reward.isAvailable && !reward.isClaimed && (
                      <Badge variant="outline" className="text-xs">
                        {reward.pointsRequired - currentPoints} more points
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {reward.description}
                  </p>

                  {/* Points Required */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">{reward.pointsRequired} points</span>
                    </div>
                    <Badge variant={reward.category === "exclusive" ? "default" : "secondary"} className="capitalize">
                      {reward.category.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Your Progress</span>
                      <span>{currentPoints}/{reward.pointsRequired}</span>
                    </div>
                    <Progress
                      value={(currentPoints / reward.pointsRequired) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Claim Button */}
                  <Button
                    onClick={() => handleClaimReward(reward)}
                    disabled={!reward.isAvailable || reward.isClaimed}
                    className={`w-full ${reward.isClaimed ? 'bg-green-500 hover:bg-green-600' : 'eco-gradient hover-lift'}`}
                    data-testid={`button-claim-${reward.id}`}
                  >
                    {reward.isClaimed ? (
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Claimed
                      </div>
                    ) : reward.isAvailable ? (
                      <div className="flex items-center">
                        <Gift className="mr-2 h-4 w-4" />
                        Claim Reward
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Need {reward.pointsRequired - currentPoints} more points
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-6 w-6 text-amber-500" />
                Achievement Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "First Ride", points: 10, earned: currentPoints >= 10 },
                  { name: "Eco Warrior", points: 100, earned: currentPoints >= 100 },
                  { name: "Carbon Hero", points: 250, earned: currentPoints >= 250 },
                  { name: "Sustainability Champion", points: 500, earned: currentPoints >= 500 }
                ].map((badge, index) => (
                  <div key={badge.name} className={`text-center p-4 rounded-lg ${badge.earned ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-muted/20'}`}>
                    <div className={`text-2xl mb-2 ${badge.earned ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                      {badge.earned ? '🏆' : '🏅'}
                    </div>
                    <p className={`text-sm font-medium ${badge.earned ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badge.points} points
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Earn Points */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="glass-morphism max-w-md mx-auto">
            <CardContent className="p-6">
              <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Need More Points?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Earn points by completing rides, shopping at bodegas, and participating in eco challenges!
              </p>
              <Button variant="outline" className="hover-lift">
                View Ways to Earn
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
