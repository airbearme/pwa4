import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Warn if the key is missing or is a test key in production
if (import.meta.env.PROD && (!stripePublicKey || stripePublicKey.startsWith("pk_test_"))) {
  console.warn(
    "⚠️ Stripe is not configured for production. " +
    "Please provide a valid VITE_STRIPE_PUBLIC_KEY in your environment variables. " +
    "All payment features will be disabled."
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

// The getStripe function will now conditionally load Stripe
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePublicKey) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

// All payment-related functions will now gracefully fail if Stripe is not available.

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  orderId?: string;
  rideId?: string;
  paymentMethod?: 'stripe' | 'apple_pay' | 'google_pay' | 'cash';
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: any;
  error?: string;
  qrCode?: string;
}

// All other functions remain the same, but will now be protected by the getStripe check.

export const createPaymentIntent = async (data: PaymentIntentData): Promise<PaymentResult> => {
  if (!stripePublicKey) return { success: false, error: 'Payments are currently disabled.' };
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const result = await response.json();

    if (data.paymentMethod === 'cash') {
      return {
        success: true,
        qrCode: result.qrCode,
      };
    }

    return {
      success: true,
      paymentIntent: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment setup failed',
    };
  }
};

export const confirmPayment = async (
  stripe: Stripe,
  clientSecret: string,
  paymentElement: any,
  returnUrl?: string
): Promise<PaymentResult> => {
  if (!stripePublicKey) return { success: false, error: 'Payments are currently disabled.' };
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements: paymentElement,
      confirmParams: {
        return_url: returnUrl || `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Payment confirmation failed',
      };
    }

    return {
      success: true,
      paymentIntent,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment confirmation failed',
    };
  }
};

export const processApplePayPayment = async (data: PaymentIntentData): Promise<PaymentResult> => {
  const stripe = await getStripe();
  if (!stripe) return { success: false, error: 'Payments are currently disabled.' };
  
  try {
    const paymentIntent = await createPaymentIntent({
      ...data,
      paymentMethod: 'apple_pay',
      metadata: {
        ...data.metadata,
        payment_method: 'apple_pay',
      },
    });

    if (!paymentIntent.success || !paymentIntent.paymentIntent) {
      return paymentIntent;
    }

    const clientSecret =
      paymentIntent.paymentIntent.clientSecret ||
      paymentIntent.paymentIntent.client_secret;

    if (!clientSecret) {
      return { success: false, error: "Missing client secret from Stripe." };
    }

    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: data.currency || 'usd',
      total: {
        label: 'AirBear Ride',
        amount: data.amount * 100,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMakePayment = await paymentRequest.canMakePayment();
    
    if (!canMakePayment || !canMakePayment.applePay) {
      return {
        success: false,
        error: 'Apple Pay not available',
      };
    }

    return new Promise((resolve) => {
      paymentRequest.on('paymentmethod', async (event) => {
        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: event.paymentMethod.id,
          }
        );

        if (error) {
          event.complete('fail');
          resolve({
            success: false,
            error: error.message || 'Apple Pay payment failed',
          });
        } else {
          event.complete('success');
          resolve({
            success: true,
            paymentIntent: paymentIntent.paymentIntent,
          });
        }
      });

      paymentRequest.show();
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Apple Pay initialization failed',
    };
  }
};

export const processGooglePayPayment = async (data: PaymentIntentData): Promise<PaymentResult> => {
  const stripe = await getStripe();
  if (!stripe) return { success: false, error: 'Payments are currently disabled.' };

  try {
    const paymentIntent = await createPaymentIntent({
      ...data,
      paymentMethod: 'google_pay',
      metadata: {
        ...data.metadata,
        payment_method: 'google_pay',
      },
    });

    if (!paymentIntent.success || !paymentIntent.paymentIntent) {
      return paymentIntent;
    }

    const clientSecret =
      paymentIntent.paymentIntent.clientSecret ||
      paymentIntent.paymentIntent.client_secret;

    if (!clientSecret) {
      return { success: false, error: "Missing client secret from Stripe." };
    }

    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: data.currency || 'usd',
      total: {
        label: 'AirBear Ride',
        amount: data.amount * 100,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMakePayment = await paymentRequest.canMakePayment();
    
    if (!canMakePayment || !canMakePayment.googlePay) {
      return {
        success: false,
        error: 'Google Pay not available',
      };
    }

    return new Promise((resolve) => {
      paymentRequest.on('paymentmethod', async (event) => {
        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: event.paymentMethod.id,
          }
        );

        if (error) {
          event.complete('fail');
          resolve({
            success: false,
            error: error.message || 'Google Pay payment failed',
          });
        } else {
          event.complete('success');
          resolve({
            success: true,
            paymentIntent: paymentIntent.paymentIntent,
          });
        }
      });

      paymentRequest.show();
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Google Pay initialization failed',
    };
  }
};

export const generateCashQRCode = async (data: PaymentIntentData): Promise<PaymentResult> => {
  if (!stripePublicKey) return { success: false, error: 'Payments are currently disabled.' };
  try {
    const result = await createPaymentIntent({
      ...data,
      paymentMethod: 'cash',
    });

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'QR code generation failed',
    };
  }
};

export const confirmCashPayment = async (qrCode: string, driverId: string): Promise<PaymentResult> => {
  if (!stripePublicKey) return { success: false, error: 'Payments are currently disabled.' };
  try {
    const response = await fetch('/api/payments/confirm-cash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qrCode,
        driverId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Cash payment confirmation failed');
    }

    const result = await response.json();

    return {
      success: true,
      paymentIntent: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Cash payment confirmation failed',
    };
  }
};

export const purchaseCeoTshirt = async (data: PaymentIntentData & { size: string }): Promise<PaymentResult> => {
  if (!stripePublicKey) return { success: false, error: 'Payments are currently disabled.' };
  try {
    const response = await fetch('/api/ceo-tshirt/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        amount: 10000,
        metadata: {
          ...data.metadata,
          product_type: 'ceo_tshirt',
          size: data.size,
          unlimited_rides: 'true',
          non_transferable: 'true'
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to purchase CEO T-shirt');
    }

    const result = await response.json();
    return {
      success: true,
      paymentIntent: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'CEO T-shirt purchase failed',
    };
  }
};

export const validateFreeRide = async (userId: string): Promise<{ canRideFree: boolean; reason?: string }> => {
  if (!stripePublicKey) return { canRideFree: false, reason: 'Payments are currently disabled.' };
  try {
    const response = await fetch(`/api/users/${userId}/free-ride-status`);
    
    if (!response.ok) {
      throw new Error('Failed to validate free ride status');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      canRideFree: false,
      reason: error.message || 'Validation failed'
    };
  }
};

export const checkApplePayAvailability = async (): Promise<boolean> => {
  const stripe = await getStripe();
  if (!stripe) return false;

  const paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: { label: 'Test', amount: 100 },
  });

  const canMakePayment = await paymentRequest.canMakePayment();
  return canMakePayment?.applePay || false;
};

export const checkGooglePayAvailability = async (): Promise<boolean> => {
  const stripe = await getStripe();
  if (!stripe) return false;

  const paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: { label: 'Test', amount: 100 },
  });

  const canMakePayment = await paymentRequest.canMakePayment();
  return canMakePayment?.googlePay || false;
};
