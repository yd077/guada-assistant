import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMaps";

type Props = {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  onPick?: (lat: number, lng: number) => void;
};

const GUADELOUPE_CENTER = { lat: 16.25, lng: -61.55 };

export function GoogleZoneMap({ lat, lng, radiusKm, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: lat != null && lng != null ? { lat, lng } : GUADELOUPE_CENTER,
          zoom: lat != null ? 11 : 9,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          scrollwheel: false,
        });
        map.addListener("click", (e: any) => {
          if (e.latLng) onPickRef.current?.(e.latLng.lat(), e.latLng.lng());
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      circleRef.current?.setMap(null);
      markerRef.current = null;
      circleRef.current = null;
      mapRef.current = null;
    };
  }, []);

  // Marqueur + cercle de rayon
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !window.google?.maps) return;
    const maps = window.google.maps;

    if (lat == null || lng == null) {
      markerRef.current?.setMap(null);
      circleRef.current?.setMap(null);
      markerRef.current = null;
      circleRef.current = null;
      return;
    }

    const position = { lat, lng };

    if (!markerRef.current) {
      markerRef.current = new maps.Marker({ position, map });
    } else {
      markerRef.current.setPosition(position);
      markerRef.current.setMap(map);
    }

    if (!circleRef.current) {
      circleRef.current = new maps.Circle({
        map,
        center: position,
        radius: radiusKm * 1000,
        strokeColor: "#0f5132",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#10b981",
        fillOpacity: 0.15,
      });
    } else {
      circleRef.current.setCenter(position);
      circleRef.current.setRadius(radiusKm * 1000);
      circleRef.current.setMap(map);
    }

    map.setCenter(position);
    map.fitBounds(circleRef.current.getBounds());
  }, [ready, lat, lng, radiusKm]);

  if (error) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-2 bg-soft px-6 text-center text-sm text-muted-foreground">
        <span>Carte indisponible : {error}</span>
      </div>
    );
  }

  return (
    <div className="relative h-80">
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-soft">
          <Loader2 className="h-5 w-5 animate-spin text-emerald" />
        </div>
      )}
    </div>
  );
}
