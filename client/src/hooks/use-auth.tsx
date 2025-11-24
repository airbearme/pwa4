import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  role: "user" | "driver" | "admin";
  ecoPoints: number;
  totalRides: number;
  co2Saved: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; username: string; password: string; role?: "user" | "driver" | "admin" }) => Promise<void>;
  loginWithOAuth: (provider: "google" | "apple") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("airbear-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("airbear-user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();
      
      setUser(data.user);
      localStorage.setItem("airbear-user", JSON.stringify(data.user));
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; username: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        ...userData,
        role: "user",
        ecoPoints: 0,
        totalRides: 0,
        co2Saved: "0",
      });
      const data = await response.json();
      
      setUser(data.user);
      localStorage.setItem("airbear-user", JSON.stringify(data.user));
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      // In a real app, this would redirect to OAuth provider
      // For demo purposes, we'll simulate a successful OAuth login
      const mockUser = {
        id: `oauth_${Date.now()}`,
        email: `user@${provider}.com`,
        username: `${provider}User`,
        role: "user" as const,
        ecoPoints: 0,
        totalRides: 0,
        co2Saved: "0",
      };
      
      setUser(mockUser);
      localStorage.setItem("airbear-user", JSON.stringify(mockUser));
      
      toast({
        title: "OAuth Success",
        description: `Successfully signed in with ${provider}`,
      });
    } catch (error: any) {
      throw new Error(`${provider} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("airbear-user");
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    loginWithOAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
