import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { mockApi } from '@/lib/mock-api';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (USE_MOCK_API) {
    if (method === 'GET') {
      return mockApi.get(url);
    }
    if (method === 'POST') {
      return mockApi.post(url, data);
    }
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      try {
        const res = await apiRequest("GET", queryKey.join("/") as string);
        return await res.json();
      } catch (error: any) {
        if (unauthorizedBehavior === "returnNull" && error.message.includes("401")) {
          return null;
        }
        throw error;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
