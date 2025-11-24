import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}

interface NotificationPreferences {
  driverAvailability: boolean;
  rideUpdates: boolean;
  promotions: boolean;
  maintenanceAlerts: boolean;
}

export const usePushNotifications = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    isSubscribed: false,
    isLoading: true,
    permission: 'default',
    subscription: null
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    driverAvailability: true,
    rideUpdates: true,
    promotions: false,
    maintenanceAlerts: false
  });

  // Check if push notifications are supported and get current state
  useEffect(() => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription,
          subscription,
          permission: Notification.permission,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error checking push notification subscription:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSubscription();
  }, [state.isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: 'Push Notifications Not Supported',
        description: 'Your browser does not support push notifications.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setState(prev => ({ ...prev, permission }));
        toast({
          title: 'Notifications Enabled',
          description: 'You will receive alerts when drivers become available.',
        });
        return true;
      } else {
        toast({
          title: 'Notifications Denied',
          description: 'Please enable notifications to receive driver availability alerts.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Permission Error',
        description: 'Unable to request notification permission.',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.isSupported, toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive'
      });
      return false;
    }

    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const registration = await navigator.serviceWorker.ready;

      // You'll need to replace this with your actual VAPID public key
      const vapidPublicKey = 'BNQxGxE1C8fGpQ4Z9Y0K9F8G7H6I5J4K3L2M1N0O9P8Q7R6S5T4U3V2W1X0Y9Z8';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to your backend
      await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          preferences
        })
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false
      }));

      toast({
        title: 'Notifications Enabled',
        description: 'You will receive alerts when drivers become available.',
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Subscription Failed',
        description: 'Unable to subscribe to push notifications.',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission, preferences, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return true;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const success = await state.subscription.unsubscribe();

      if (success) {
        // Notify backend to remove subscription
        await fetch('/api/push-subscriptions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: state.subscription.endpoint
          })
        });

        setState(prev => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
          isLoading: false
        }));

        toast({
          title: 'Notifications Disabled',
          description: 'You will no longer receive driver availability alerts.',
        });

        return true;
      } else {
        throw new Error('Unsubscribe failed');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Unsubscribe Failed',
        description: 'Unable to unsubscribe from push notifications.',
        variant: 'destructive'
      });
      return false;
    }
  }, [state.subscription, toast]);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      if (state.subscription) {
        await fetch('/api/push-subscriptions', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: state.subscription.endpoint,
            preferences: updatedPreferences
          })
        });
      }

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Update Failed',
        description: 'Unable to update notification preferences.',
        variant: 'destructive'
      });
      return false;
    }
  }, [preferences, state.subscription, toast]);

  // Test notification
  const testNotification = useCallback(async (): Promise<void> => {
    if (!state.isSubscribed) {
      toast({
        title: 'Not Subscribed',
        description: 'Please subscribe to push notifications first.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      toast({
        title: 'Test Notification Sent',
        description: 'Check your notifications!',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Test Failed',
        description: 'Unable to send test notification.',
        variant: 'destructive'
      });
    }
  }, [state.isSubscribed, toast]);

  return {
    ...state,
    preferences,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    testNotification
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
