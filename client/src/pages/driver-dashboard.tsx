import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useDriverLocation } from '@/hooks/use-driver-location';
import { Navigation, Battery, MapPin, Activity, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

export default function DriverDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [airbearId] = useState('00000000-0000-0000-0000-000000000001'); // Seeded airbear ID
    const { isTracking, location, error } = useDriverLocation(airbearId);

    const { data: pendingRides = [] } = useQuery({
        queryKey: ['rides', 'pending'],
        queryFn: async () => {
            const supabase = getSupabaseClient(false);
            if (!supabase) return [];
            const { data, error } = await supabase
                .from('rides')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        refetchInterval: 5000, // Check for new rides every 5 seconds
    });

    const handleAcceptRide = async (rideId: string) => {
        try {
            const supabase = getSupabaseClient(false);
            if (!supabase) return;

            const { error } = await supabase
                .from('rides')
                .update({ status: 'booked' })
                .eq('id', rideId);

            if (error) throw error;

            toast({
                title: "Ride Accepted!",
                description: "The customer has been notified.",
            });

            queryClient.invalidateQueries({ queryKey: ['rides', 'pending'] });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: 'destructive',
            });
        }
    };

    if (!user || user.role !== 'driver') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
                        <p className="text-muted-foreground">
                            This page is only accessible to drivers.
                        </p>
                    </CardContent>
                </Card>
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
                        Driver Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Welcome, {user.fullName || user.username}
                    </p>
                </motion.div>

                {/* Tracking Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>GPS Tracking Status</span>
                                <Badge variant={isTracking ? 'default' : 'secondary'}>
                                    {isTracking ? (
                                        <>
                                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                                            Active
                                        </>
                                    ) : (
                                        'Inactive'
                                    )}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            {isTracking && location && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Latitude</div>
                                                <div className="font-mono text-sm">{location.latitude.toFixed(6)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Longitude</div>
                                                <div className="font-mono text-sm">{location.longitude.toFixed(6)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Navigation className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Heading</div>
                                                <div className="font-mono text-sm">{location.heading.toFixed(0)}°</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Activity className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Speed</div>
                                                <div className="font-mono text-sm">
                                                    {(location.speed * 3.6).toFixed(1)} km/h
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">GPS Accuracy</span>
                                            <span className="font-medium">±{location.accuracy.toFixed(0)}m</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-2">
                                            <span className="text-muted-foreground">Last Update</span>
                                            <span className="font-medium">
                                                {new Date(location.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                                        <div className="flex items-center text-green-700 dark:text-green-300">
                                            <Activity className="h-4 w-4 mr-2 animate-pulse" />
                                            <span className="text-sm font-medium">
                                                Your location is being broadcast to customers in real-time
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isTracking && (
                                <div className="text-center py-8">
                                    <Navigation className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground mb-4">
                                        GPS tracking is currently inactive. Your location will automatically
                                        start broadcasting when you're logged in as a driver.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Make sure to allow location permissions in your browser.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Vehicle Info */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Vehicle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Vehicle ID</span>
                                    <span className="font-mono font-medium">{airbearId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="font-medium">Solar-Powered Rickshaw</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant="default" className="bg-green-500">
                                        <Battery className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Pending Rides</span>
                                {pendingRides.length > 0 && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        {pendingRides.length} New
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingRides.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No pending ride requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRides.map((ride: any) => (
                                        <div key={ride.id} className="p-3 border rounded-lg bg-muted/20">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm font-semibold">Ride #{ride.id.slice(0, 8)}</div>
                                                <Badge variant="outline">${Number(ride.fare).toFixed(2)}</Badge>
                                            </div>
                                            <div className="space-y-1 text-xs text-muted-foreground mb-3">
                                                <div className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1 text-primary" />
                                                    From: {ride.pickup_spot_id}
                                                </div>
                                                <div className="flex items-center">
                                                    <Navigation className="h-3 w-3 mr-1 text-primary" />
                                                    To: {ride.dropoff_spot_id}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="w-full eco-gradient"
                                                onClick={() => handleAcceptRide(ride.id)}
                                            >
                                                Accept Ride
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    className="mt-6 p-4 bg-muted/50 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <h3 className="font-semibold mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        How It Works
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                        <li>Your GPS location is automatically tracked while logged in</li>
                        <li>Location updates every few seconds with high accuracy</li>
                        <li>Customers see your real-time position on the map</li>
                        <li>Battery-efficient: uses native GPS APIs</li>
                        <li>Works offline and syncs when connection returns</li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
