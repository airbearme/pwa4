import { useState, useEffect, useRef, useMemo } from "react";
import { renderToString } from "react-dom/server";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import RickshawWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import { 
  estimateRideFare, 
  estimateRideTime,
  getActiveSpots,
} from "@/lib/spots";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AirbearAvatar from "@/components/airbear-avatar";
import { 
  MapPin, 
  Battery, 
  Clock,
} from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

interface Spot {
  id: string;
  name: string;
  latitude: number | string;
  longitude: number | string;
  isActive?: boolean;
}

interface Rickshaw {
  id: string;
  currentSpotId: string;
  batteryLevel: number;
  isAvailable: boolean;
  isCharging: boolean;
}

const calculateDistanceKm = (from: Spot, to: Spot): number | null => {
  const lat1 = Number(from.latitude);
  const lon1 = Number(from.longitude);
  const lat2 = Number(to.latitude);
  const lon2 = Number(to.longitude);

  if ([lat1, lon1, lat2, lon2].some((val) => Number.isNaN(val))) return null;

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Map() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Spot | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const { data: spotsData = [], isLoading: spotsLoading, error: spotsError } = useQuery<Spot[]>({
    queryKey: ["spots"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/spots");
      const data = await response.json();
      return (data || []).map((spot: any) => ({
        ...spot,
        latitude: Number(spot.latitude ?? spot.lat ?? spot.latitide),
        longitude: Number(spot.longitude ?? spot.lng ?? spot.long ?? spot.lon),
        isActive: spot.isActive ?? spot.is_active ?? true,
      }));
    },
    retry: 1,
  });

  const { data: rickshawsData = [], isLoading: rickshawLoading, error: rickshawError } = useQuery<Rickshaw[]>({
    queryKey: ["airbears"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/rickshaws");
      const data = await response.json();
      return (data || []).map((item: any) => ({
        id: item.id,
        currentSpotId: item.currentSpotId ?? item.current_spot_id ?? item.currentspotid ?? "",
        batteryLevel: Number(item.batteryLevel ?? item.battery_level ?? 100),
        isAvailable: item.isAvailable ?? item.is_available ?? false,
        isCharging: item.isCharging ?? item.is_charging ?? false,
      }));
    },
    retry: 1,
  });

  const activeSpots = useMemo(() => {
    if (spotsData.length > 0) {
      return spotsData.filter((spot) => spot.isActive !== false);
    }
    if (spotsError) {
      // Fallback to bundled spot list for static deployments
      return getActiveSpots();
    }
    return [];
  }, [spotsData, spotsError]);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const newLocation = JSON.parse(event.data as string);
      console.log("Received new location:", newLocation);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const rickshaws = useMemo(() => {
    if (rickshawsData.length > 0) return rickshawsData;
    if (rickshawError && activeSpots.length) {
      // Generate a lightweight fallback set tied to available spots
      return activeSpots.slice(0, 6).map((spot, index) => ({
        id: `fallback-${spot.id}-${index}`,
        currentSpotId: spot.id,
        batteryLevel: 80 - index * 5,
        isAvailable: index % 3 !== 0,
        isCharging: index % 5 === 0,
      }));
    }
    return [];
  }, [rickshawsData, rickshawError, activeSpots]);
  const availableAirbearsCount = rickshaws.filter(r => r.isAvailable).length;

  useEffect(() => {
    if (spotsError || rickshawError) {
      toast({
        title: "Live map unavailable",
        description: "Using offline map data. Live API unreachable; check your backend/Supabase settings for real-time data.",
        variant: "destructive",
      });
    }
  }, [spotsError, rickshawError, toast]);

  useEffect(() => {
    // This effect handles the initial loading transition.
    if (!spotsLoading && !rickshawLoading) {
      setMapLoading(false);
    }
  }, [spotsLoading, rickshawLoading]);

  // Initialize Leaflet map and WebSocket connection
  useEffect(() => {
    // Exit if the map container isn't rendered yet, or if the map is already initialized.
    if (!mapRef.current || mapInstanceRef.current) return;

    let map: any; // Define map and ws here to access them in the cleanup function
    let ws: WebSocket;

    const initMapAndSocket = async () => {
      try {
        if (!window.L) {
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(leafletCSS);

          await new Promise((resolve, reject) => {
            const leafletJS = document.createElement('script');
            leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            leafletJS.onload = resolve;
            leafletJS.onerror = reject;
            document.head.appendChild(leafletJS);
          });
        }

        map = window.L.map(mapRef.current, {
          center: [42.0987, -75.9179],
          zoom: 12,
          zoomControl: false,
        });
        mapInstanceRef.current = map;

        window.L.control.zoom({ position: 'topright' }).addTo(map);
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(map);

        setMapReady(true);

        // WebSocket setup
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log("WebSocket connected");
        ws.onmessage = (event) => {
          const newLocation = JSON.parse(event.data as string);
          console.log("Received new location:", newLocation);
          // Logic to update a marker on the map would go here
        };
        ws.onclose = () => console.log("WebSocket disconnected");

      } catch (error) {
        console.error('Error initializing map or WebSocket:', error);
        toast({
          title: "Map Loading Error",
          description: "Unable to load the map. Please try refreshing.",
          variant: "destructive",
        });
      }
    };

    initMapAndSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoading, toast]); // Reruns when loading is false

  // Add markers to map
  useEffect(() => {
    if (!mapInstanceRef.current || !activeSpots || !rickshaws || !mapReady) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add spot markers
    activeSpots.forEach((spot: Spot, index: number) => {
        const availableAirbears = rickshaws.filter(r => r.currentSpotId === spot.id && r.isAvailable);
        const hasAirbears = availableAirbears.length > 0;
        const spotNumber = index + 1;
        const latitude = Number(spot.latitude);
        const longitude = Number(spot.longitude);
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          return;
        }
        
        // Create marker color based on availability
        const markerColor = hasAirbears ? '#10b981' : '#6b7280'; // Green if available, gray if not
        
        const iconHtml = renderToString(
          <AirbearAvatar
            size="sm"
            showBadge={false}
            className={`
              transition-all duration-300
              ${hasAirbears ? 'shadow-lg shadow-green-500/50 scale-110' : 'opacity-50 grayscale'}
            `}
          />
        );

        const marker = window.L.marker([latitude, longitude], {
          icon: new window.L.DivIcon({
            html: iconHtml,
            className: 'bg-transparent border-0',
            iconSize: [48, 48],
            iconAnchor: [24, 48],
            popupAnchor: [0, -48]
          }),
        }).addTo(map);

        if (hasAirbears) {
          const pulsingIcon = window.L.circleMarker([latitude, longitude], {
            radius: 25,
            fillColor: '#10b981',
            fillOpacity: 0.3,
            color: '#10b981',
            weight: 1,
            opacity: 0.5,
          }).addTo(map);

          // Add a pulsing animation using CSS
          pulsingIcon.getElement().style.animation = 'pulse 2s infinite';
        }

      // Add popup
      const popupContent = `
        <div class="p-4 min-w-[250px] bg-white rounded-lg shadow-lg">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              ${spotNumber}
            </div>
            <span class="text-2xl mr-2">🐻</span>
            <h3 class="font-bold text-lg text-emerald-700">${spot.name}</h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center">
                <span class="w-3 h-3 rounded-full ${hasAirbears ? 'bg-green-500' : 'bg-gray-400'} mr-2"></span>
                AirBears Available
              </span>
              <span class="font-semibold ${hasAirbears ? 'text-green-600' : 'text-gray-500'}">
                ${hasAirbears ? `${availableAirbears.length} ready` : 'None'}
              </span>
            </div>
            ${hasAirbears ? `
              <div class="text-xs text-green-600 italic mb-2">
                "Glide with AirBear, eco-rides so rare!"
              </div>
              <button onclick="window.selectSpotForRide('${spot.id}')" 
                      class="w-full mt-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 
                             text-white rounded-lg hover:shadow-lg hover:scale-105
                             transition-all font-bold text-sm shadow-md">
                🚀 Book AirBear Ride
              </button>
            ` : `
              <div class="text-xs text-gray-500 italic">
                No AirBears available at this spot
              </div>
            `}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        if (hasAirbears) {
          setSelectedSpot(spot);
          setShowBookingDialog(true);
        }
      });
    });

    // Add custom locate button
    const locateButton = window.L.control({position: 'topleft'});
    locateButton.onAdd = function() {
      const div = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `
        <a href="#" title="Center Map" style="background: white; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; text-decoration: none; color: black;">
          📍
        </a>
      `;
      div.onclick = function(e: MouseEvent) {
        e.preventDefault();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([42.0987, -75.9179], 12);
        }
      };
      return div;
    };
    locateButton.addTo(map);

    // Global function for booking
    (window as any).selectSpotForRide = (spotId: string) => {
      const spot = activeSpots.find(s => s.id === spotId);
      if (spot) {
        setSelectedSpot(spot);
        setShowBookingDialog(true);
      }
    };

  }, [activeSpots, rickshaws, mapReady]);

  const handleBookRide = () => {
    if (!selectedSpot || !selectedDestination) {
      toast({
        title: "Missing Information",
        description: "Please select both pickup and destination locations.",
        variant: "destructive",
      });
      return;
    }

    const distance = calculateDistanceKm(selectedSpot, selectedDestination) || 0;
    const fare = estimateRideFare(distance);
    
    toast({
      title: "🎉 Demo Booking Complete!",
      description: `Your AirBear ride from ${selectedSpot.name} to ${selectedDestination.name} would cost $${fare.toFixed(2)}. This is a demo - in production this would connect to our booking system.`,
    });
    
    setShowBookingDialog(false);
    setSelectedSpot(null);
    setSelectedDestination(null);
  };

  if (mapLoading || spotsLoading || rickshawLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading map..." />
          <p className="mt-4 text-muted-foreground flex items-center justify-center gap-2">
            <AirbearAvatar size="sm" showBadge={false} />
            Setting up your AirBear adventure...
          </p>
        </div>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Find Your <span className="text-primary">Perfect Ride</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover all {activeSpots.length} AirBear spots across Binghamton with real-time availability
          </p>
        </motion.div>

        {/* Status Info */}
        <motion.div
          className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-lime-50 rounded-lg border border-emerald-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <RickshawWheel size="sm" className="text-primary" />
              <span className="font-semibold text-emerald-700">Live Map Status</span>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-emerald-600">
              <span>🟢 {availableAirbearsCount} AirBears Available</span>
              <span>📍 {activeSpots.length} Active Spots</span>
              <span>🌱 100% Solar Powered</span>
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          className="bg-card rounded-2xl p-6 shadow-2xl mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="aspect-video rounded-xl overflow-hidden relative shadow-inner">
            <div 
              ref={mapRef} 
              className="w-full h-full rounded-xl"
              data-testid="map-container"
            />
            
            {/* Live Stats Overlay */}
            <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md rounded-xl p-4 shadow-xl border">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <div>
                    <div className="font-semibold text-green-600">{availableAirbearsCount}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></div>
                  <div>
                    <div className="font-semibold text-amber-600">{rickshaws.filter(r => !r.isAvailable && !r.isCharging).length}</div>
                    <div className="text-xs text-muted-foreground">En Route</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                  <div>
                    <div className="font-semibold text-blue-600">{rickshaws.filter(r => r.isCharging).length}</div>
                    <div className="text-xs text-muted-foreground">Charging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-3 bg-card/50 rounded-lg px-4 py-2 border">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium">Available AirBear</span>
            </div>
            <div className="flex items-center space-x-3 bg-card/50 rounded-lg px-4 py-2 border">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="font-medium">No Availability</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/60 rounded-lg px-4 py-2 border">
              <AirbearAvatar size="sm" showBadge={false} />
              <span className="font-medium">AirBear mini-rickshaw marker</span>
            </div>
          </div>
        </motion.div>

        {/* Spots Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {activeSpots.map((spot: Spot, index: number) => {
            const availableAirbears = rickshaws.filter(r => r.currentSpotId === spot.id && r.isAvailable);
            const avgBattery = availableAirbears.length > 0 
              ? Math.round(availableAirbears.reduce((sum, r) => sum + r.batteryLevel, 0) / availableAirbears.length)
              : 0;
            
            return (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="hover-lift cursor-pointer group"
                  onClick={() => {
                    if (availableAirbears.length > 0) {
                      setSelectedSpot(spot);
                      setShowBookingDialog(true);
                    }
                  }}
                  data-testid={`card-spot-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="truncate">{spot.name}</span>
                      <RickshawWheel 
                        size="sm" 
                        animated={availableAirbears.length > 0}
                        className={availableAirbears.length > 0 ? "text-primary" : "text-muted-foreground"}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <Badge 
                        variant={availableAirbears.length > 0 ? "default" : "secondary"}
                        className={availableAirbears.length > 0 ? "bg-green-500" : ""}
                      >
                        {availableAirbears.length} AirBear{availableAirbears.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {availableAirbears.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Avg Battery</span>
                          <div className="flex items-center space-x-2">
                            <Battery className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{avgBattery}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Wait Time</span>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">~2 min</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button 
                      size="sm" 
                      className="w-full eco-gradient text-white"
                      disabled={availableAirbears.length === 0}
                      data-testid={`button-book-from-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {availableAirbears.length > 0 ? "Book Ride" : "No AirBears"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-md" data-testid="dialog-book-ride">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <RickshawWheel size="sm" className="mr-2" />
                Book Your Ride (Demo)
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Pickup Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Location</label>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-2" />
                    <span>{selectedSpot?.name}</span>
                  </div>
                </div>
              </div>

              {/* Destination Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {activeSpots.filter(s => s.id !== selectedSpot?.id).map((spot) => (
                    <div
                      key={spot.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDestination?.id === spot.id 
                          ? "bg-primary/20 border border-primary" 
                          : "bg-muted/10 hover:bg-muted/20"
                      }`}
                      onClick={() => setSelectedDestination(spot)}
                      data-testid={`option-destination-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{spot.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ride Summary */}
              {selectedDestination && (
                <div className="p-4 bg-muted/10 rounded-lg space-y-2">
                  {(() => {
                    const distance = selectedSpot ? calculateDistanceKm(selectedSpot, selectedDestination) : null;
                    const time = distance ? estimateRideTime(distance) : 0;
                    const fare = distance ? estimateRideFare(distance) : 0;
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Distance</span>
                          <span>{distance ? `${distance.toFixed(1)} km` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Est. Time</span>
                          <span>{time ? `${time} min` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fare</span>
                          <span>${fare.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>${fare.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <Button 
                onClick={handleBookRide}
                disabled={!selectedDestination}
                className="w-full eco-gradient text-white hover-lift"
                data-testid="button-confirm-booking"
              >
                Confirm Booking (Demo)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
