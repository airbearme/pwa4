// Mock API for frontend development - Stateful & Dynamic with Persistence
import { spots } from './spots';

// Types
interface Rickshaw {
  id: string;
  currentSpotId: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  isAvailable: boolean;
  isCharging: boolean;
  heading: number;
}

const STORAGE_KEY = 'airbear_mock_db_v1';

// Initial State Generation
const generateInitialRickshaws = (): Rickshaw[] => {
  return spots.slice(0, 8).flatMap((spot, index) => {
    // Place rickshaws slightly offset from spots
    const offset = 0.002;
    return [
      {
        id: `bear-${index}-a`,
        currentSpotId: spot.id,
        latitude: spot.latitude + (Math.random() * offset - offset / 2),
        longitude: spot.longitude + (Math.random() * offset - offset / 2),
        batteryLevel: 85 + Math.floor(Math.random() * 15),
        isAvailable: true,
        isCharging: false,
        heading: Math.random() * 360,
      }
    ];
  });
};

const defaultState = {
  user: {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'Test User',
    avatarUrl: '/airbear-mascot.png',
    role: 'user',
    ecoPoints: 100,
    totalRides: 10,
    co2Saved: '10.5',
    hasCeoTshirt: false,
  },
  rickshaws: generateInitialRickshaws(),
  orders: [] as any[],
  rides: [] as any[],
};

// Load State from Storage
let state = defaultState;
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    state = { ...defaultState, ...JSON.parse(stored) };
    // Hydrate rickshaws if missing or empty (simple integrity check)
    if (!state.rickshaws || state.rickshaws.length === 0) {
      state.rickshaws = generateInitialRickshaws();
    }
  }
} catch (e) {
  console.error("Failed to load mock DB", e);
}

// Persist State
const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save mock DB", e);
  }
};

// Simulation Logic
const updateRickshawPositions = () => {
  state.rickshaws = state.rickshaws.map(r => {
    if (r.isCharging) return r; // Charging bears don't move

    // Random movement simulation (Random Walk)
    const speed = 0.0001; // ~10 meters per update
    const headingRad = r.heading * (Math.PI / 180);

    // Change heading slightly
    const newHeading = r.heading + (Math.random() * 60 - 30);

    // Calculate new position
    const newLat = r.latitude + Math.cos(headingRad) * speed;
    const newLon = r.longitude + Math.sin(headingRad) * speed * 1.5; // Longitude correction roughly

    // Drain battery slowly
    const newBattery = Math.max(0, r.batteryLevel - 0.005); // Slower drain

    return {
      ...r,
      latitude: newLat,
      longitude: newLon,
      batteryLevel: newBattery,
      heading: newHeading
    };
  });
  saveState(); // Save updated positions so they don't jump on reload
};

// Start Simulation Loop
if (typeof window !== 'undefined') {
  setInterval(updateRickshawPositions, 2000); // Update every 2 seconds
}

// Mock API Interface
export const mockApi = {
  get: async (url: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (url === '/api/spots') {
      return { json: async () => spots };
    }

    if (url === '/api/rickshaws') {
      return { json: async () => state.rickshaws };
    }

    if (url === '/api/user') {
      return { json: async () => state.user };
    }

    if (url === '/api/analytics/overview') {
      const active = state.rickshaws.filter(r => r.isAvailable).length;
      return {
        json: async () => ({
          totalSpots: spots.length,
          totalAirbears: state.rickshaws.length,
          activeAirbears: active,
          chargingAirbears: state.rickshaws.filter(r => r.isCharging).length,
          maintenanceAirbears: 0,
          averageBatteryLevel: Math.round(state.rickshaws.reduce((acc, r) => acc + r.batteryLevel, 0) / state.rickshaws.length)
        }),
      };
    }

    return { json: async () => ({}) };
  },

  post: async (url: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Longer delay for writes

    if (url === '/api/create-payment-intent') {
      if (data.paymentMethod === 'cash') {
        return { json: async () => ({ qrCode: `airbear-cash-${Date.now()}` }) };
      }
      return { json: async () => ({ clientSecret: `mock_pi_${Date.now()}_secret_${Math.random().toString(36).substr(2)}` }) };
    }

    if (url === '/api/rides') {
      const newRide = { ...data, id: `ride-${Date.now()}`, status: 'booked', createdAt: new Date() };
      state.rides.push(newRide);
      state.user.totalRides += 1;
      state.user.ecoPoints += 20; // Reward points
      saveState();
      return { json: async () => newRide };
    }

    if (url === '/api/auth/sync-profile') {
      state.user = { ...state.user, ...data };
      saveState();
      return { json: async () => ({ user: state.user }) };
    }

    return { json: async () => ({ success: true }) };
  }
};
