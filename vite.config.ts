import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['airbear-mascot.png', 'c4v-logo.svg'],
      manifest: {
        name: 'AirBear',
        short_name: 'AirBear',
        description: 'Solar-Powered Eco-Ride Platform',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'airbear-mascot.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'airbear-mascot.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  envDir: path.resolve(__dirname),
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
