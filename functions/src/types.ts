/// <reference types="@cloudflare/workers-types" />

declare global {
  // Extend the Cloudflare Workers Env interface
  interface Env {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    SUPABASE_SECRET_KEY: string
    STRIPE_SECRET_KEY: string
    // Add other environment variables here as needed
  }

  // Define a more specific context type for our request handlers
  interface RequestContext {
    request: Request
    env: Env
    params: Record<string, string>
    waitUntil: (promise: Promise<unknown>) => void
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>
  }

  // Define the request handler type
  type RequestHandler = (context: RequestContext) => Promise<Response> | Response
}

export type { Env, RequestContext, RequestHandler }
