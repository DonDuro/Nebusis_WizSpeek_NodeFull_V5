import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, setupInstallPrompt } from "./lib/pwa";

// Clear any existing service worker cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    names.forEach(function(name) {
      caches.delete(name);
    });
  });
}

// Setup install prompt handling
setupInstallPrompt();

// Hide any loading fallback when React takes over
const rootElement = document.getElementById("root")!;
const loadingFallback = rootElement.querySelector('.loading-fallback') as HTMLElement;
if (loadingFallback) {
  loadingFallback.style.display = 'none';
}

createRoot(rootElement).render(<App />);
