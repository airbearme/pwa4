// Mock API for frontend development
import { spots } from './spots';

// Mock user data
const mockUser = {
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
};

// Mock rickshaw data
const mockRickshaws = spots.slice(0, 6).map((spot, index) => ({
  id: `fallback-${spot.id}-${index}`,
  currentSpotId: spot.id,
  batteryLevel: 80 - index * 5,
  isAvailable: index % 3 !== 0,
  isCharging: index % 5 === 0,
}));

// Mock API functions
export const mockApi: {
  get: (url: string) => Promise<{ json: () => Promise<any> }>;
  post: (url: string, data: any) => Promise<{ json: () => Promise<any> }>;
} = {
  get: async (url: string) => {
    if (url === '/api/spots') {
      return {
        json: async () => spots,
      };
    }
    if (url === '/api/rickshaws') {
      return {
        json: async () => mockRickshaws,
      };
    }
    if (url === '/api/user') {
      return {
        json: async () => mockUser,
      };
    }
    return {
      json: async () => ({}),
    };
  },
  post: async (url: string, data: any) => {
    if (url === '/api/rides') {
      return {
        json: async () => ({
          ...data,
          id: '456',
          status: 'pending',
        }),
      };
    }
    return {
      json: async () => ({}),
    };
  },
};
