import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RickshawWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import {
  Target,
  Trophy,
  Leaf,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Gift,
  Award
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  points: number;
  co2Reduction: string;
  isCompleted: boolean;
  isActive: boolean;
  progress: number;
  target: number;
  icon: string;
}

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  // Mock challenges data - in real app this would come from API
  const challenges: Challenge[] = [
    {
      id: "daily-1",
      title: "Take 3 Eco Rides",
      description: "Complete 3 AirBear rides today to reduce your carbon footprint",
      type: "daily",
      points: 50,
      co2Reduction: "2.1 kg",
      isCompleted: false,
      isActive: true,
      progress: 1,
      target: 3,
      icon: "🌱"
    },
    {
      id: "daily-2",
      title: "Shop Local",
      description: "Purchase items from the AirBear bodega",
      type: "daily",
      points: 25,
      co2Reduction: "0.5 kg",
      isCompleted: true,
      isActive: true,
      progress: 1,
      target: 1,
      icon: "🛒"
    },
    {
      id: "weekly-1",
      title: "Carbon Neutral Week",
      description: "Complete 15 eco-friendly rides this week",
      type: "weekly",
      points: 200,
      co2Reduction: "8.5 kg",
      isCompleted: false,
      isActive: true,
      progress: 7,
      target: 15,
      icon: "🌿"
    },
    {
      id: "weekly-2",
      title: "Bodega Explorer",
      description: "Try 5 different bodega categories",
      type: "weekly",
      points: 75,
      co2Reduction: "1.2 kg",
      isCompleted: false,
      isActive: true,
      progress: 2,
      target: 5,
      icon: "🎒"
    }
  ];

  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      // In real app, this would call the API
      return { challengeId, completed: true, points: 50 };
    },
    onSuccess: (data) => {
      toast({
        title: "Challenge Completed!",
        description: `You earned ${data.points} eco points!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete challenge",
        variant: "destructive",
      });
    },
  });

  const filteredChallenges = challenges.filter(c => c.type === selectedPeriod && c.isActive);

  const completedChallenges = challenges.filter(c => c.isCompleted).length;
  const totalPoints = challenges
    .filter(c => c.isCompleted)
    .reduce((sum, c) => sum + c.points, 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading challenges..." />
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
            <Target className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Eco <span className="text-green-500">Challenges</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete missions, earn points, and make a real environmental impact
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="glass-morphism" data-testid="card-completed-challenges">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500 mb-2">
                {completedChallenges}
              </div>
              <p className="text-sm text-muted-foreground">
                Challenges finished
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism" data-testid="card-total-points">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Star className="mr-2 h-5 w-5 text-purple-500" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {totalPoints}
              </div>
              <p className="text-sm text-muted-foreground">
                Eco points earned
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism" data-testid="card-co2-saved-challenges">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-green-500" />
                CO₂ Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500 mb-2">
                4.2 kg
              </div>
              <p className="text-sm text-muted-foreground">
                From challenges
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-muted/50 p-1 rounded-lg">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={`mx-1 ${selectedPeriod === period ? "eco-gradient text-white" : ""}`}
                data-testid={`button-period-${period}`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Challenges Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-morphism hover-lift ${challenge.isCompleted ? 'border-green-500/50' : ''}`} data-testid={`card-challenge-${challenge.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{challenge.icon}</span>
                    {challenge.isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {challenge.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                    <Progress
                      value={(challenge.progress / challenge.target) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">{challenge.points} points</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{challenge.co2Reduction}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!challenge.isCompleted && (
                    <Button
                      onClick={() => completeChallengeMutation.mutate(challenge.id)}
                      disabled={completeChallengeMutation.isPending}
                      className="w-full eco-gradient text-white hover-lift"
                      data-testid={`button-complete-${challenge.id}`}
                    >
                      {completeChallengeMutation.isPending ? (
                        <div className="flex items-center">
                          <RickshawWheel size="sm" className="mr-2" />
                          Completing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Complete Challenge
                        </div>
                      )}
                    </Button>
                  )}

                  {challenge.isCompleted && (
                    <div className="text-center py-2">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed!
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Target className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No active challenges</h3>
            <p className="text-muted-foreground">
              Check back later for new eco challenges!
            </p>
          </motion.div>
        )}

        {/* Leaderboard Teaser */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="glass-morphism max-w-md mx-auto">
            <CardContent className="p-6">
              <Award className="h-8 w-8 text-amber-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Community Leaderboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Compete with other eco-warriors and climb the rankings!
              </p>
              <Button variant="outline" className="hover-lift">
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
