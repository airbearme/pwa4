// Binghamton AirBear Spots Data
export interface Spot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  amenities?: string[];
  isActive: boolean;
  createdAt?: Date;
}

export const spots: Spot[] = [
  {
    id: 'court-street-downtown',
    name: 'Court Street Downtown',
    latitude: 42.099118,
    longitude: -75.917538,
    description: 'Heart of downtown Binghamton with shopping and dining',
    amenities: ['Restaurants', 'Shopping', 'Banks', 'Government Buildings'],
    isActive: true,
  },
  {
    id: 'riverwalk-bu-center', 
    name: 'Riverwalk BU Center',
    latitude: 42.098765,
    longitude: -75.916543,
    description: 'Beautiful riverside walkway and community center',
    amenities: ['River Views', 'Walking Trails', 'Community Center', 'Parks'],
    isActive: true,
  },
  {
    id: 'confluence-park',
    name: 'Confluence Park',
    latitude: 42.090123,
    longitude: -75.912345,
    description: 'Scenic park at the confluence of rivers',
    amenities: ['Park', 'River Access', 'Picnic Areas', 'Nature Trails'],
    isActive: true,
  },
  {
    id: 'southside-walking-bridge',
    name: 'Southside Walking Bridge', 
    latitude: 42.091409,
    longitude: -75.914568,
    description: 'Pedestrian bridge connecting communities',
    amenities: ['Bridge Access', 'River Views', 'Walking Path'],
    isActive: true,
  },
  {
    id: 'general-hospital',
    name: 'General Hospital',
    latitude: 42.086741,
    longitude: -75.915711,
    description: 'Major healthcare facility',
    amenities: ['Hospital', 'Medical Services', 'Emergency Care'],
    isActive: true,
  },
  {
    id: 'mcarthur-park',
    name: 'McArthur Park',
    latitude: 42.086165,
    longitude: -75.926153,
    description: 'Community park with recreational facilities',
    amenities: ['Playground', 'Sports Fields', 'Picnic Areas', 'Walking Trails'],
    isActive: true,
  },
  {
    id: 'greenway-path',
    name: 'Greenway Path',
    latitude: 42.086678,
    longitude: -75.932483,
    description: 'Scenic greenway for walking and cycling',
    amenities: ['Bike Path', 'Walking Trail', 'Nature Views', 'Exercise Stations'],
    isActive: true,
  },
  {
    id: 'vestal-center',
    name: 'Vestal Center',
    latitude: 42.091851,
    longitude: -75.951729,
    description: 'Commercial and community hub in Vestal',
    amenities: ['Shopping', 'Restaurants', 'Services', 'Parking'],
    isActive: true,
  },
  {
    id: 'innovation-park',
    name: 'Innovation Park',
    latitude: 42.093877,
    longitude: -75.958331,
    description: 'Technology and business innovation center',
    amenities: ['Business Center', 'Technology Hub', 'Conference Facilities'],
    isActive: true,
  },
  {
    id: 'bu-east-gym',
    name: 'BU East Gym',
    latitude: 42.091695,
    longitude: -75.963590,
    description: 'Binghamton University East Campus Recreation Center',
    amenities: ['Gym', 'Fitness Center', 'Sports Facilities', 'Student Services'],
    isActive: true,
  },
  {
    id: 'bu-fine-arts-building',
    name: 'BU Fine Arts Building',
    latitude: 42.089282,
    longitude: -75.967441,
    description: 'Arts and culture center at Binghamton University',
    amenities: ['Art Galleries', 'Performance Spaces', 'Studios', 'Cultural Events'],
    isActive: true,
  },
  {
    id: 'whitney-hall',
    name: 'Whitney Hall',
    latitude: 42.088456,
    longitude: -75.965432,
    description: 'Academic building at Binghamton University',
    amenities: ['Classrooms', 'Lecture Halls', 'Study Spaces', 'Academic Services'],
    isActive: true,
  },
  {
    id: 'student-union',
    name: 'Student Union',
    latitude: 42.086903,
    longitude: -75.966704,
    description: 'Central hub of student life at Binghamton University',
    amenities: ['Food Court', 'Student Services', 'Meeting Rooms', 'Study Spaces'],
    isActive: true,
  },
  {
    id: 'appalachian-dining',
    name: 'Appalachian Dining',
    latitude: 42.084523,
    longitude: -75.971264,
    description: 'Dining hall serving the Appalachian community',
    amenities: ['Dining Hall', 'Food Services', 'Residential Area'],
    isActive: true,
  },
  {
    id: 'hinman-dining-hall',
    name: 'Hinman Dining Hall',
    latitude: 42.086314,
    longitude: -75.973292,
    description: 'Main dining facility in Hinman community',
    amenities: ['Dining Hall', 'Food Services', 'Student Housing Area'],
    isActive: true,
  },
  {
    id: 'bu-science-building',
    name: 'BU Science Building',
    latitude: 42.090227,
    longitude: -75.972315,
    description: 'Science and research facilities at Binghamton University',
    amenities: ['Laboratories', 'Research Facilities', 'Classrooms', 'Science Library'],
    isActive: true,
  },
];

// Helper functions for spots
export const getSpotById = (id: string): Spot | undefined => {
  return spots.find(spot => spot.id === id);
};

export const getSpotsByAmenity = (amenity: string): Spot[] => {
  return spots.filter(spot => 
    spot.amenities?.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
  );
};

export const getActiveSpots = (): Spot[] => {
  return spots.filter(spot => spot.isActive);
};

export const getNearbySpots = (
  latitude: number, 
  longitude: number, 
  radiusKm: number = 5
): Spot[] => {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return spots.filter(spot => {
    const distance = calculateDistance(latitude, longitude, spot.latitude, spot.longitude);
    return distance <= radiusKm && spot.isActive;
  });
};

export const getBinghamtonBounds = () => {
  const latitudes = spots.map(spot => spot.latitude);
  const longitudes = spots.map(spot => spot.longitude);
  
  return {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...longitudes),
    west: Math.min(...longitudes),
    center: {
      latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
      longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
    }
  };
};

export const getRouteDistance = (spot1Id: string, spot2Id: string): number | null => {
  const spot1 = getSpotById(spot1Id);
  const spot2 = getSpotById(spot2Id);
  
  if (!spot1 || !spot2) return null;
  
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(spot2.latitude - spot1.latitude);
  const dLon = toRadians(spot2.longitude - spot1.longitude);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(spot1.latitude)) * Math.cos(toRadians(spot2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const estimateRideFare = (distance: number): number => {
  return 4.00;
};

export const estimateRideTime = (distance: number): number => {
  const averageSpeedKmh = 15; // Average rickshaw speed including stops
  return Math.round((distance / averageSpeedKmh) * 60); // Return time in minutes
};

export const calculateCO2Saved = (distance: number): number => {
  const carEmissionsKgPerKm = 0.21; // Average car CO2 emissions in kg per km
  return Math.round(distance * carEmissionsKgPerKm * 100) / 100;
};

// CSV export function for admin use
export const exportSpotsToCSV = (): string => {
  const headers = ['Name', 'Latitude', 'Longitude', 'Description', 'Amenities', 'IsActive'];
  const rows = spots.map(spot => [
    spot.name,
    spot.latitude.toString(),
    spot.longitude.toString(),
    spot.description || '',
    spot.amenities?.join('; ') || '',
    spot.isActive.toString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

// Geofencing helper for location-based features
export const isWithinSpotRadius = (
  userLat: number, 
  userLon: number, 
  spotId: string, 
  radiusMeters: number = 100
): boolean => {
  const spot = getSpotById(spotId);
  if (!spot) return false;
  
  const distance = getRouteDistance(
    `user-${userLat}-${userLon}`, // Temporary ID for user location
    spotId
  );
  
  if (distance === null) return false;
  
  return (distance * 1000) <= radiusMeters; // Convert km to meters
};

export default spots;
