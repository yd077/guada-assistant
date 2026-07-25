/**
 * Chargeur de l'API Google Maps JavaScript (navigateur uniquement).
 * Clé navigateur restreinte par référent : sûre côté client.
 */
declare global {
  interface Window {
    google?: any;
    __initGoogleMaps__?: () => void;
  }
}

let loaderPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as
    | string
    | undefined;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as
    | string
    | undefined;

  if (!key) return Promise.reject(new Error("Clé Google Maps navigateur manquante"));

  loaderPromise = new Promise((resolve, reject) => {
    window.__initGoogleMaps__ = () => resolve(window.google.maps);
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&loading=async&callback=__initGoogleMaps__&language=fr&region=GP` +
      (channel ? `&channel=${encodeURIComponent(channel)}` : "");
    script.async = true;
    script.onerror = () => reject(new Error("Chargement Google Maps impossible"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}
