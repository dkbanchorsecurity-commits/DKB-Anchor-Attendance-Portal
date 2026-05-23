const CACHE_NAME = 'dkb-guard-portal-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// --- 1. PWA INSTALL & CACHE CORE ASSETS ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// --- 2. CLEAN UP OLD CACHES ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// --- 3. FETCH EVENT (REQUIRED FOR INSTALLABILITY) ---
self.addEventListener('fetch', (event) => {
  // We don't want to cache Firebase database/API calls, only static app files
  if (event.request.url.includes('firestore.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if found, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});

// --- 4. FIREBASE BACKGROUND MESSAGING ---
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD7cUX5DXzGhktfRItpdXJ45TrYH9KlVm4",
  projectId: "dkb-anchor-management-system",
  messagingSenderId: "424257722432",
  appId: "1:424257722432:web:2f8c1a1cc7a69df4b0a7a5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'DKB Anchor Alert';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'logo.png',
    vibrate: [1000, 500, 1000, 500, 1000, 500],
    requireInteraction: true
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});