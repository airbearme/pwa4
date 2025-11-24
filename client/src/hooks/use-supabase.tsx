import { createContext, useContext, ReactNode, useMemo } from "react";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

interface SupabaseContextType {
  subscribeToRides: (callback: (payload: any) => void) => () => void;
  subscribeToInventory: (callback: (payload: any) => void) => () => void;
  subscribeToOrders: (callback: (payload: any) => void) => () => void;
  uploadFile: (bucket: string, path: string, file: File) => Promise<string>;
  downloadFile: (bucket: string, path: string) => Promise<string>;
  trackUserPresence: (userId: string) => void;
  getOnlineUsers: () => Promise<string[]>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Real-time features will be disabled.");
}

const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let presenceChannel: RealtimeChannel | null = null;
let onlineUsersCache: string[] = [];

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const value = useMemo<SupabaseContextType>(() => {
    if (!supabase) {
      // Safe fallbacks if env vars are missing
      return {
        subscribeToRides: () => () => {},
        subscribeToInventory: () => () => {},
        subscribeToOrders: () => () => {},
        uploadFile: async () => {
          throw new Error("Supabase is not configured");
        },
        downloadFile: async () => {
          throw new Error("Supabase is not configured");
        },
        trackUserPresence: () => {},
        getOnlineUsers: async () => [],
      };
    }

    const subscribeToTable = (table: string) => (callback: (payload: any) => void) => {
      const channel = supabase
        .channel(`realtime:${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, callback)
        .subscribe();
      return () => supabase.removeChannel(channel);
    };

    const subscribeToRides = subscribeToTable("rides");
    const subscribeToInventory = subscribeToTable("airbear_inventory");
    const subscribeToOrders = subscribeToTable("orders");

    const uploadFile = async (bucket: string, path: string, file: File) => {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return publicUrl.publicUrl;
    };

    const downloadFile = async (bucket: string, path: string) => {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    };

    const trackUserPresence = (userId: string) => {
      if (!supabase) return;
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
      presenceChannel = supabase.channel("airbear-presence", {
        config: {
          presence: { key: userId }
        }
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel?.presenceState() ?? {};
          onlineUsersCache = Object.keys(state);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel?.track({ online: true });
          }
        });
    };

    const getOnlineUsers = async () => onlineUsersCache;

    return {
      subscribeToRides,
      subscribeToInventory,
      subscribeToOrders,
      uploadFile,
      downloadFile,
      trackUserPresence,
      getOnlineUsers,
    };
  }, []);

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
