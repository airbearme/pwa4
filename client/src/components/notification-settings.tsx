import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";
import RickshawWheel from "@/components/airbear-wheel";
import {
  Bell,
  BellOff,
  Settings,
  Smartphone,
  MapPin,
  ShoppingCart,
  Crown,
  TestTube
} from "lucide-react";

export default function NotificationSettings() {
  const { toast } = useToast();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    testNotification
  } = usePushNotifications();

  const [showSettings, setShowSettings] = useState(false);

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    await updatePreferences({ [key]: value });
  };

  if (!isSupported) {
    return (
      <Card className="glass-morphism">
        <CardContent className="p-6 text-center">
          <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Push Notifications Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <p className="font-medium">
                    {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {permission === 'granted'
                      ? 'Permission granted'
                      : permission === 'denied'
                      ? 'Permission denied'
                      : 'Permission needed'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isSubscribed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testNotification}
                    className="hover-lift"
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Test
                  </Button>
                )}

                <Button
                  onClick={handleToggleSubscription}
                  disabled={isLoading}
                  className={`${isSubscribed ? 'bg-red-500 hover:bg-red-600' : 'eco-gradient'} text-white hover-lift`}
                >
                  {isLoading ? (
                    <RickshawWheel size="sm" className="mr-2" />
                  ) : isSubscribed ? (
                    <>
                      <BellOff className="mr-2 h-4 w-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Enable
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isSubscribed && (
              <div className="pt-4 border-t">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="hover-lift">
                      <Settings className="mr-2 h-4 w-4" />
                      Notification Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-morphism max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        Notification Preferences
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Driver Availability</p>
                              <p className="text-sm text-muted-foreground">When AirBears become available near you</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.driverAvailability}
                            onCheckedChange={(checked) => handlePreferenceChange('driverAvailability', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Ride Updates</p>
                              <p className="text-sm text-muted-foreground">Status updates for your bookings</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.rideUpdates}
                            onCheckedChange={(checked) => handlePreferenceChange('rideUpdates', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <ShoppingCart className="h-5 w-5 text-amber-500" />
                            <div>
                              <p className="font-medium">Promotions</p>
                              <p className="text-sm text-muted-foreground">Special offers and discounts</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.promotions}
                            onCheckedChange={(checked) => handlePreferenceChange('promotions', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Crown className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Maintenance Alerts</p>
                              <p className="text-sm text-muted-foreground">Fleet maintenance and service updates</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.maintenanceAlerts}
                            onCheckedChange={(checked) => handlePreferenceChange('maintenanceAlerts', checked)}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Active Preferences</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(preferences).map(([key, enabled]) => (
                            enabled && (
                              <Badge key={key} variant="secondary" className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Badge>
                            )
                          ))}
                          {Object.values(preferences).every(p => !p) && (
                            <Badge variant="outline">None</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Preview */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-blue-500" />
                Sample Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      🐻
                    </div>
                    <div>
                      <p className="font-medium text-sm">AirBear Alert</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <p className="text-sm">A driver is now available near you!</p>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" className="text-xs">Book Now</Button>
                    <Button size="sm" variant="outline" className="text-xs">Dismiss</Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Notifications appear in your browser and on mobile devices</p>
                  <p>• Click "Book Now" to quickly book a ride</p>
                  <p>• Customize which alerts you receive in settings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notification Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5 text-green-500" />
              Why Enable Notifications?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="font-semibold">Real-time Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications when AirBears become available
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="font-semibold">Never Miss a Ride</h4>
                <p className="text-sm text-muted-foreground">
                  Be the first to know when drivers are available
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
                <h4 className="font-semibold">Priority Access</h4>
                <p className="text-sm text-muted-foreground">
                  VIP notifications for CEO T-shirt holders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
