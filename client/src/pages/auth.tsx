import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AirbearWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";

export default function Auth() {
  const [, navigate] = useLocation();
  const { login, register, loginWithOAuth, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    role: "user" as "user" | "driver" | "admin",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === "signin") {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        });
        
        // Trigger confetti animation
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      
      toast({
        title: mode === "signin" ? "Welcome back!" : "Account created!",
        description: mode === "signin" 
          ? "You've been signed in successfully" 
          : "Welcome to the AirBear community!",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    try {
      await loginWithOAuth(provider);
      toast({
        title: "Welcome!",
        description: `Signed in with ${provider}`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "OAuth Error",
        description: error.message || "OAuth login failed",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-1/4 left-1/4"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <AirbearWheel size="xl" className="opacity-30" />
        </motion.div>
        <motion.div 
          className="absolute bottom-1/4 right-1/4"
          animate={{ rotate: -360, y: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <AirbearWheel size="lg" className="opacity-20" />
        </motion.div>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: 360,
                  y: [0, -100, 100],
                  x: [0, Math.random() * 200 - 100]
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeOut",
                  delay: i * 0.02
                }}
                exit={{ opacity: 0 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <motion.div 
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AirbearWheel size="xl" glowing className="animate-pulse-glow" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-foreground">
            Welcome to <span className="eco-gradient bg-clip-text text-transparent text-outline-strong">AirBear</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join the sustainable transportation revolution
          </p>
        </div>

        <Card className="glass-morphism shadow-2xl border-primary/20" data-testid="card-auth">
          <CardHeader className="text-center pb-4">
            <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid="tab-signin"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid="tab-signup"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("google")}
                className="w-full hover-lift ripple-effect border-primary/30 hover:bg-primary/10"
                data-testid="button-google-oauth"
              >
                <i className="fab fa-google mr-3 text-red-500"></i>
                Continue with Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("apple")}
                className="w-full hover-lift ripple-effect border-primary/30 hover:bg-primary/10"
                data-testid="button-apple-oauth"
              >
                <i className="fab fa-apple mr-3"></i>
                Continue with Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="Choose a username"
                    required={mode === "signup"}
                    className="focus:ring-primary"
                    data-testid="input-username"
                  />
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="focus:ring-primary"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="focus:ring-primary pr-10"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    required={mode === "signup"}
                    className="focus:ring-primary"
                    data-testid="input-confirm-password"
                  />
                </motion.div>
              )}

              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Account Type
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={formData.role === "user" ? "default" : "outline"}
                      onClick={() => handleInputChange("role", "user")}
                      className="text-sm"
                      data-testid="button-role-user"
                    >
                      User
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === "driver" ? "default" : "outline"}
                      onClick={() => handleInputChange("role", "driver")}
                      className="text-sm"
                      data-testid="button-role-driver"
                    >
                      Driver
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === "admin" ? "default" : "outline"}
                      onClick={() => handleInputChange("role", "admin")}
                      className="text-sm"
                      data-testid="button-role-admin"
                    >
                      Admin
                    </Button>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full eco-gradient text-white hover-lift animate-pulse-glow ripple-effect"
                data-testid="button-submit"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <AirbearWheel size="sm" className="mr-2" />
                    {mode === "signin" ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : (
                  <div className="flex items-center">
                    {mode === "signup" && <Sparkles className="w-4 h-4 mr-2" />}
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </div>
                )}
              </Button>
            </form>

            {mode === "signin" && (
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-primary hover:text-primary/80"
                  data-testid="button-forgot-password"
                  onClick={() => alert('Password reset functionality coming soon! Please contact support@airbear.com for assistance.')}
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </div>
      </motion.div>
    </div>
  );
}
