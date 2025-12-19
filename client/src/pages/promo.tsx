
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import RickshawWheel from "@/components/airbear-wheel";
import { useToast } from "@/hooks/use-toast";
import { purchaseCeoTshirt } from "@/lib/stripe";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/loading-spinner";
import {
  ShirtIcon as Shirt,
  Crown,
  Sparkles,
  Gift,
  CheckCircle,
  AlertTriangle,
  Calendar
} from "lucide-react";

export default function Promo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [promoActive, setPromoActive] = useState(false);
  const [selectedSize, setSelectedSize] = useState("L");

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please log in to purchase");

      return purchaseCeoTshirt({
        amount: 100,
        currency: 'usd',
        size: selectedSize,
        metadata: {
          user_id: user.id,
          product_type: 'ceo_tshirt'
        }
      });
    },
    onSuccess: (result) => {
      if (result.success && result.paymentIntent?.clientSecret) {
        // Redirect to checkout with the client secret
        const stripeUrl = `/checkout?clientSecret=${result.paymentIntent.clientSecret}&product=ceo_tshirt`;
        window.location.href = stripeUrl;
      } else {
        toast({
          title: "Purchase Setup Failed",
          description: result.error || "Unable to initiate payment",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handlePromoActivation = () => {
    if (!acceptedTerms) {
      setShowAgreement(true);
      return;
    }
    purchaseMutation.mutate();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block mb-6">
            <motion.div
              className="text-8xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👕
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Crown className="h-8 w-8 text-amber-500" />
            </motion.div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            CEO-Signed <span className="text-primary animate-pulse-glow">AirBear</span> T-Shirt
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            <span className="text-emerald-600 font-bold">"Buy the tee, ride for free—AirBear's eco-key!"</span>
          </p>
          <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
            Limited Time • $100 Value
          </Badge>
        </motion.div>

        {/* Promo Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {/* T-Shirt Card */}
          <Card className="glass-morphism hover-lift overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-emerald-500 to-lime-500 text-white">
              <CardTitle className="flex items-center text-2xl">
                <Shirt className="mr-3 h-8 w-8" />
                Exclusive CEO Edition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-emerald-100 to-lime-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🐻</div>
                    <div className="text-lg font-bold text-emerald-700">AirBear</div>
                    <div className="text-sm text-emerald-600">Solar Power in the Air!</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Size:</span>
                    <div className="flex space-x-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-colors ${selectedSize === size
                            ? 'bg-primary text-white border-primary'
                            : 'hover:bg-muted'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Material:</span>
                    <span>100% Organic Cotton</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Signature:</span>
                    <span className="text-primary">CEO Authenticated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Benefit:</span>
                    <span className="text-emerald-600">1 Free Ride/Day</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="glass-morphism hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Gift className="mr-3 h-8 w-8 text-amber-500" />
                Premium Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Daily Free AirBear Ride</p>
                  <p className="text-sm text-muted-foreground">One complimentary ride every 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">VIP Priority Booking</p>
                  <p className="text-sm text-muted-foreground">Skip the line with priority access</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Exclusive AirBear Events</p>
                  <p className="text-sm text-muted-foreground">Access to member-only gatherings</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
                <div>
                  <p className="font-medium text-amber-700">Non-Transferable</p>
                  <p className="text-sm text-muted-foreground">Benefits tied to your account only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="glass-morphism text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="text-4xl font-bold text-primary mb-2">$100</div>
                <p className="text-muted-foreground">One-time purchase • Lifetime benefits</p>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-6">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setShowAgreement(true)}
                  >
                    End User Agreement
                  </button>
                </label>
              </div>

              {promoActive ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center space-x-2 text-green-600 mb-4"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold">Promo Activated!</span>
                  </motion.div>
                  <p className="text-muted-foreground mb-4">
                    Your CEO T-shirt is being prepared. You now have daily free rides!
                  </p>
                  <Link to="/map">
                    <Button className="eco-gradient text-white hover-lift">
                      <RickshawWheel size="sm" className="mr-2" />
                      Book Your Free AirBear Ride
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handlePromoActivation}
                  disabled={!user || purchaseMutation.isPending}
                  className="eco-gradient text-white hover-lift ripple-effect px-8 py-4 text-lg font-semibold animate-pulse-glow"
                >
                  {purchaseMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-3" />
                  ) : (
                    <Sparkles className="mr-3 h-6 w-6" />
                  )}
                  {purchaseMutation.isPending ? 'Preparing Payment...' : 'Activate CEO T-Shirt Promo'}
                </Button>
              )}

              {!user && (
                <p className="text-sm text-muted-foreground mt-4">
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to activate this exclusive offer
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* End User Agreement Dialog */}
        <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
          <DialogContent className="glass-morphism max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Crown className="mr-2 h-6 w-6 text-amber-500" />
                AirBear CEO T-Shirt End User Agreement
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">1. EXCLUSIVE BENEFITS</h3>
                <p>The CEO-signed AirBear T-shirt grants the holder one (1) complimentary AirBear ride per 24-hour period. This benefit is non-transferable and tied exclusively to the purchaser's account.</p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">2. NON-TRANSFERABLE LICENSE</h3>
                <p>This promotional benefit cannot be sold, transferred, gifted, or shared with any other individual. Violation of this term results in immediate termination of benefits.</p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">3. RIDE LIMITATIONS</h3>
                <p>Free rides are limited to standard AirBear routes within Binghamton. Premium routes, extended trips, or special event transportation may incur additional charges.</p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">4. AUTHENTICITY GUARANTEE</h3>
                <p>Each T-shirt includes an authentic CEO signature and holographic verification. AirBear reserves the right to verify authenticity at any time.</p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">5. ENVIRONMENTAL COMMITMENT</h3>
                <p>By purchasing this item, you commit to supporting AirBear's mission of sustainable transportation and reducing carbon emissions in Binghamton.</p>
              </section>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAgreement(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setAcceptedTerms(true);
                    setShowAgreement(false);
                  }}
                  className="eco-gradient text-white"
                >
                  Accept Agreement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
