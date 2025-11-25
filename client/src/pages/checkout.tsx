import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RickshawWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  Apple, 
  Wallet,
  Zap
} from "lucide-react";

import { getStripe, processApplePayPayment, processGooglePayPayment } from "@/lib/stripe";

const stripePromise = getStripe();

interface CheckoutFormProps {
  clientSecret: string;
  orderId?: string;
  rideId?: string;
  onSuccess: () => void;
}

function CheckoutForm({ clientSecret, orderId, rideId, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error", 
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full eco-gradient text-white hover-lift animate-pulse-glow"
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <RickshawWheel size="sm" className="mr-2" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Complete Payment
          </div>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cash">("stripe");
  const [clientSecret, setClientSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [walletLoading, setWalletLoading] = useState({ apple: false, google: false });

  // Sample order data - in real app this would come from cart/order context
  const orderData = {
    orderId: "order_123",
    rideId: "ride_456", 
    items: [
      { name: "Local Coffee Blend", price: 12.99, quantity: 1 },
      { name: "Fresh Produce Box", price: 24.99, quantity: 1 },
    ],
    subtotal: 37.98,
    tax: 3.04,
    total: 41.02,
  };

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setPaymentSuccess(true);
    }
  }, []);

  useEffect(() => {
    // Initialize payment intent when method changes
    if (orderData.total > 0) {
      createPaymentIntentMutation.mutate({
        amount: orderData.total,
        orderId: orderData.orderId,
        rideId: orderData.rideId,
        paymentMethod,
      });
    }
  }, [paymentMethod]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Redirect to success page after delay
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);
  };

  const handleApplePay = async () => {
    try {
      setWalletLoading((prev) => ({ ...prev, apple: true }));
      const result = await processApplePayPayment({
        amount: orderData.total,
        currency: "usd",
        orderId: orderData.orderId,
        rideId: orderData.rideId,
        paymentMethod: "apple_pay",
      });

      if (!result.success) {
        toast({
          title: "Apple Pay failed",
          description: result.error || "Apple Pay is unavailable on this device.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Apple Pay authorized",
        description: "Payment confirmed. Thank you!",
      });
      handlePaymentSuccess();
    } catch (error: any) {
      toast({
        title: "Apple Pay error",
        description: error.message || "Could not start Apple Pay.",
        variant: "destructive",
      });
    } finally {
      setWalletLoading((prev) => ({ ...prev, apple: false }));
    }
  };

  const handleGooglePay = async () => {
    try {
      setWalletLoading((prev) => ({ ...prev, google: true }));
      const result = await processGooglePayPayment({
        amount: orderData.total,
        currency: "usd",
        orderId: orderData.orderId,
        rideId: orderData.rideId,
        paymentMethod: "google_pay",
      });

      if (!result.success) {
        toast({
          title: "Google Pay failed",
          description: result.error || "Google Pay is unavailable on this device.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Google Pay authorized",
        description: "Payment confirmed. Thank you!",
      });
      handlePaymentSuccess();
    } catch (error: any) {
      toast({
        title: "Google Pay error",
        description: error.message || "Could not start Google Pay.",
        variant: "destructive",
      });
    } finally {
      setWalletLoading((prev) => ({ ...prev, google: false }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto glass-morphism">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to continue with checkout</p>
            <Button asChild className="eco-gradient text-white">
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto glass-morphism">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your order will be ready for pickup during your next ride.
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>Order ID: {orderData.orderId}</p>
                <p>Total: ${orderData.total.toFixed(2)}</p>
              </div>
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <RickshawWheel size="lg" />
              </motion.div>
              
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Checkout
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete your order for pickup during your next ride
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glass-morphism" data-testid="card-order-summary">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RickshawWheel size="sm" className="mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${orderData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${orderData.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center text-primary">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Free for AirBear users!</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Only transaction fees apply
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="glass-morphism" data-testid="card-payment-method">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "stripe" | "cash")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="stripe" data-testid="tab-card-payment">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Card Payment
                    </TabsTrigger>
                    <TabsTrigger value="cash" data-testid="tab-cash-payment">
                      <QrCode className="mr-2 h-4 w-4" />
                      Cash (QR)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stripe" className="space-y-6">
                    {/* Payment Options */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Button 
                        variant="outline" 
                        className="h-16 border-2 hover:border-primary hover:bg-primary/5"
                        onClick={handleApplePay}
                        disabled={walletLoading.apple}
                        data-testid="button-apple-pay"
                      >
                        <div className="text-center">
                          <Apple className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-sm">{walletLoading.apple ? "Requesting..." : "Apple Pay"}</span>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 border-2 hover:border-primary hover:bg-primary/5"
                        onClick={handleGooglePay}
                        disabled={walletLoading.google}
                        data-testid="button-google-pay"
                      >
                        <div className="text-center">
                          <Wallet className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-sm">{walletLoading.google ? "Requesting..." : "Google Pay"}</span>
                        </div>
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or pay with card</span>
                      </div>
                    </div>

                    {/* Stripe Payment Form */}
                    {clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm 
                          clientSecret={clientSecret}
                          orderId={orderData.orderId}
                          rideId={orderData.rideId}
                          onSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    ) : createPaymentIntentMutation.isPending ? (
                      <LoadingSpinner size="md" text="Setting up payment..." />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Payment setup failed. Please try again.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cash" className="space-y-6">
                    <div className="text-center">
                      <div className="w-48 h-48 bg-muted/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        {qrCode ? (
                          <div className="text-center">
                            <QrCode className="h-20 w-20 mx-auto mb-2 text-primary" />
                            <p className="text-sm text-muted-foreground">
                              Show this QR code to your driver
                            </p>
                          </div>
                        ) : createPaymentIntentMutation.isPending ? (
                          <LoadingSpinner size="md" text="Generating QR..." />
                        ) : (
                          <QrCode className="h-20 w-20 text-muted-foreground" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold mb-2">Cash Payment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Pay with cash during your ride. The driver will scan this QR code to confirm payment.
                      </p>
                      
                      <Badge variant="outline" className="border-primary text-primary">
                        Amount: ${orderData.total.toFixed(2)}
                      </Badge>
                    </div>

                    {qrCode && (
                      <Button 
                        onClick={handlePaymentSuccess}
                        className="w-full eco-gradient text-white hover-lift"
                        data-testid="button-confirm-cash-payment"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Cash Payment Setup
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
