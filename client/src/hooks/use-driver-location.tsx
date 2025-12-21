import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getSupabaseClient } from '@/lib/supabase-client';

interface DriverLocation {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    accuracy: number;
    timestamp: number;
}

/**
 * Hook for drivers to share their real-time location
 * Automatically tracks GPS and updates the airbear position in Supabase
 */
export function useDriverLocation(airbearId: string) {
    const { user } = useAuth();
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState<DriverLocation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only track if user is a driver
        if (!user || user.role !== 'driver') return;
        if (!airbearId) return;

        const supabase = getSupabaseClient(false);
        if (!supabase) {
            setError('Supabase not configured');
            return;
        }

        let watchId: number;

        const startTracking = () => {
            if (!navigator.geolocation) {
                setError('Geolocation not supported');
                return;
            }

            setIsTracking(true);

            // Watch position with high accuracy
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const newLocation: DriverLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        heading: position.coords.heading || 0,
                        speed: position.coords.speed || 0,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                    };

                    setLocation(newLocation);
                    setError(null);

                    // Update airbear position in Supabase
                    try {
                        const { error: updateError } = await supabase
                            .from('airbears')
                            .update({
                                latitude: newLocation.latitude,
                                longitude: newLocation.longitude,
                                heading: newLocation.heading,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', airbearId);

                        if (updateError) {
                            console.error('Failed to update airbear location:', updateError);
                            setError(updateError.message);
                        }
                    } catch (err: any) {
                        console.error('Location update error:', err);
                        setError(err.message);
                    }
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setError(err.message);
                    setIsTracking(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        };

        startTracking();

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                setIsTracking(false);
            }
        };
    }, [user, airbearId]);

    return { isTracking, location, error };
}

/**
 * Hook for customers and admins to subscribe to airbear location updates
 * Uses Supabase Realtime for instant updates and polling as a fallback
 */
export function useAirbearLocationUpdates() {
    const [airbears, setAirbears] = useState<any[]>([]);
    const supabase = getSupabaseClient(false);

    useEffect(() => {
        if (!supabase) return;

        // Initial fetch
        const fetchAirbears = async () => {
            const { data, error } = await supabase
                .from('airbears')
                .select('*');

            if (!error && data) {
                setAirbears(data);
            }
        };

        fetchAirbears();

        // 1. Subscribe to Realtime updates
        const channel = supabase
            .channel('airbear-locations')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'airbears',
                },
                (payload) => {
                    setAirbears((prev) =>
                        prev.map((bear) =>
                            bear.id === payload.new.id ? { ...bear, ...payload.new } : bear
                        )
                    );
                }
            )
            .subscribe();

        // 2. Poll as fallback (every 10 seconds, less aggressive than before since we have Realtime)
        const interval = setInterval(fetchAirbears, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [supabase]);

    return airbears;
}
