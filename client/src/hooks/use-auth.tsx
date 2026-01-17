import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { assertSupabase, getSupabaseClient } from "@/lib/supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: "user" | "driver" | "admin";
  ecoPoints: number;
  totalRides: number;
  co2Saved: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; username: string; password: string; confirmPassword: string; role: "user" | "driver" | "admin" }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = getSupabaseClient(false);

  const syncProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    const profilePayload = {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      username: (supabaseUser.user_metadata?.username as string) || supabaseUser.email?.split("@")[0] || "airbear",
      fullName: (supabaseUser.user_metadata?.fullName as string | undefined) || null,
      role: (supabaseUser.user_metadata?.role as "user" | "driver" | "admin" | undefined) || "user",
      avatarUrl: (supabaseUser.user_metadata?.avatar_url as string | undefined) || null,
    };

    try {
      const response = await apiRequest("POST", "/api/auth/sync-profile", profilePayload);
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("airbear-user", JSON.stringify(data.user));
    } catch (error) {
      // Fallback when API is unavailable (e.g., static hosting)
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: profilePayload.email,
        username: profilePayload.username,
        fullName: profilePayload.fullName || undefined,
        avatarUrl: profilePayload.avatarUrl || undefined,
        role: profilePayload.role || "user",
        ecoPoints: 0,
        totalRides: 0,
        co2Saved: "0",
      };
      setUser(fallbackUser);
      localStorage.setItem("airbear-user", JSON.stringify(fallbackUser));
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const fetchSession = async () => {
      try {
        const client = assertSupabase();
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        const supabaseUser = data.session?.user;
        if (supabaseUser) {
          await syncProfile(supabaseUser);
        } else {
          localStorage.removeItem("airbear-user");
        }

        const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            await syncProfile(session.user);
          } else {
            setUser(null);
            localStorage.removeItem("airbear-user");
          }
        });

        cleanup = () => listener.subscription.unsubscribe();
      } catch (error: any) {
        console.error("Supabase session fetch failed", error);
        toast({
          title: "Auth Error",
          description: error.message || "Unable to verify session. Check Supabase keys.",
          variant: "destructive",
        });
      }
    };

    fetchSession();

    return () => cleanup?.();
  }, [syncProfile, toast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const client = assertSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error(error?.message || "Login failed");
      }
      await syncProfile(data.user);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; username: string; password: string; confirmPassword: string; role: "user" | "driver" | "admin" }) => {
    setIsLoading(true);
    try {
      const client = assertSupabase();
      const { data, error } = await client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            role: userData.role,
            fullName: userData.username, // Use username as fullName for now
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Registration failed");
      }

      await syncProfile(data.user);
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    const client = getSupabaseClient(false);
    if (client) {
      client.auth.signOut();
    }
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
