import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname, "client"),
  envDir: path.resolve(__dirname),
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['airbear-mascot.png', 'c4v-logo.svg'],
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'AirBear - Solar Rickshaw Ride Share',
        short_name: 'AirBear',
        description: 'Eco-friendly solar-powered rides in Binghamton, NY with onboard bodegas',
        theme_color: '#10b981',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'airbear-mascot.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'airbear-mascot.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "Book a Ride",
            short_name: "Book Ride",
            description: "Quickly book an AirBear ride",
            url: "/map"
          },
          {
            name: "Driver Dashboard",
            short_name: "Driver",
            description: "Access driver dashboard",
            url: "/driver-dashboard"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/vercel\.live\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vercel-live-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60 // 1 day
              }
            }
          }
        ]
      }
    })
  ],
  define: {
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLIC_KEY || ''),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''),
    'import.meta.env.VITE_USE_MOCK_API': JSON.stringify('false'),
    '__APP_VERSION__': JSON.stringify(Date.now().toString()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching and smaller bundles
          react: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          motion: ['framer-motion'],
          query: ['@tanstack/react-query'],
          router: ['wouter'],
          stripe: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    fs: {
      strict: false,
      allow: [".."],
    },
  },
  // PWA optimization
  esbuild: {
    target: 'es2018',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      'framer-motion',
      '@tanstack/react-query',
      'wouter',
      '@stripe/react-stripe-js',
      'clsx',
      'tailwind-merge'
    ]
  },
});