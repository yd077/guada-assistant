import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadGoogleMaps, onGoogleMapsAuthFailure } from "@/lib/googleMaps";
import { OsmZoneMap } from "@/components/dashboard/OsmZoneMap";

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
    const offAuth = onGoogleMapsAuthFailure(() => {
      if (!cancelled) setError("clé Google Maps refusée pour ce domaine");
    });

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: lat != null && lng != null ? { lat, lng } : GUADELOUPE_CENTER,
          zoom: lat != null ? 11 : 9,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
        });
        map.addListener("click", (e: any) => {
          if (e.latLng) onPickRef.current?.(e.latLng.lat(), e.latLng.lng());
        });
        mapRef.current = map;
        setReady(true);
        // Le conteneur peut être mesuré à 0 lors du premier rendu.
        setTimeout(() => {
          if (cancelled || !mapRef.current) return;
          const center = mapRef.current.getCenter();
          window.google.maps.event.trigger(mapRef.current, "resize");
          if (center) mapRef.current.setCenter(center);
        }, 250);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
      offAuth();
      markerRef.current?.setMap(null);
      circleRef.current?.setMap(null);
      markerRef.current = null;
      circleRef.current = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      markerRef.current = new maps.Marker({ position, map, draggable: true });
      markerRef.current.addListener("dragend", (e: any) => {
        if (e.latLng) onPickRef.current?.(e.latLng.lat(), e.latLng.lng());
      });
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

    const bounds = circleRef.current.getBounds();
    if (bounds) map.fitBounds(bounds);
    else map.setCenter(position);
  }, [ready, lat, lng, radiusKm]);

  if (error) {
    // Repli sans clé : carte OpenStreetMap (cliquable, avec rayon)
    return (
      <div className="relative">
        <OsmZoneMap lat={lat} lng={lng} radiusKm={radiusKm} onPick={onPick} />
      </div>
    );
  }

  return (
    <div className="relative h-72 sm:h-80">
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-soft">
          <Loader2 className="h-5 w-5 animate-spin text-emerald" />
        </div>
      )}
    </div>
  );
}
