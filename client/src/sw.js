import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { createHandlerBoundToURL } from 'workbox-precaching';

// AirBear PWA Service Worker
const CACHE_NAME = 'airbear-v1.2.2';
const STATIC_CACHE = 'airbear-static-v1.2.2';
const DYNAMIC_CACHE = 'airbear-dynamic-v1.2.2';

// Precaching from Vite
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Navigation route (SPA support)
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
    /\/api\/spots$/,
    /\/api\/health$/,
];

// Handle API requests with network-first strategy
registerRoute(
    ({ url }) => API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname)),
    new NetworkFirst({
        cacheName: DYNAMIC_CACHE,
    })
);

// Handle static assets and pages with cache-first strategy (for non-precached ones)
registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: STATIC_CACHE,
    })
);

// Install event
self.addEventListener('install', () => {
    console.log('Service Worker: Installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => ![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(key))
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Background sync for ride bookings when offline
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-rides') {
        event.waitUntil(syncPendingRides());
    }
});

// Sync pending rides
async function syncPendingRides() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const keys = await cache.keys();

        const pendingRequests = keys.filter(request =>
            request.url.includes('/api/rides') &&
            request.method === 'POST'
        );

        for (const request of pendingRequests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.delete(request);
                    console.log('Synced pending ride request');
                }
            } catch (error) {
                console.log('Failed to sync ride request:', error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// Push notifications for ride updates
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/airbear-mascot.png',
            badge: '/airbear-mascot.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: data.actions || [],
            requireInteraction: true,
            silent: false
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'AirBear Update', options)
        );
    } catch (error) {
        console.log('Push notification error:', error);
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    let url = '/';

    if (action === 'view-ride') {
        url = data.rideUrl || '/dashboard';
    } else if (action === 'book-again') {
        url = '/map';
    } else if (data && data.url) {
        url = data.url;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            for (const client of clients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});

// Message handling
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('AirBear Service Worker (Workbox) loaded');
