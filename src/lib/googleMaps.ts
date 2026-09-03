/**
 * Chargeur de l'API Google Maps JavaScript (navigateur uniquement).
 * Clé navigateur restreinte par référent : sûre côté client.
 */
declare global {
  interface Window {
    google?: any;
    __initGoogleMaps__?: () => void;
    gm_authFailure?: () => void;
  }
}

let loaderPromise: Promise<any> | null = null;

/** Renseigné si Google refuse la clé (référent/facturation). */
export let googleMapsAuthFailed = false;
const authFailureListeners = new Set<() => void>();

export function onGoogleMapsAuthFailure(cb: () => void): () => void {
  authFailureListeners.add(cb);
  if (googleMapsAuthFailed) cb();
  return () => authFailureListeners.delete(cb);
}

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as
    | string
    | undefined;

  if (!key) return Promise.reject(new Error("Clé Google Maps navigateur manquante"));

  window.gm_authFailure = () => {
    googleMapsAuthFailed = true;
    authFailureListeners.forEach((cb) => cb());
  };

  loaderPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Délai dépassé au chargement de la carte")),
      15000,
    );
    window.__initGoogleMaps__ = () => {
      clearTimeout(timeout);
      resolve(window.google.maps);
    };
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&loading=async&callback=__initGoogleMaps__&language=fr&region=GP`;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      loaderPromise = null;
      reject(new Error("Chargement Google Maps impossible"));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
