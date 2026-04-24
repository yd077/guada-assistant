import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { Loader2, MapPin, Save, Search } from "lucide-react";
import { geocodeAddress } from "@/services/geocoding";

// Leaflet est chargé dynamiquement (utilise window — pas SSR-safe)
type MapModule = {
  MapContainer: React.ComponentType<any>;
  TileLayer: React.ComponentType<any>;
  Marker: React.ComponentType<any>;
  Circle: React.ComponentType<any>;
  useMap: () => any;
};

let mapModulePromise: Promise<MapModule> | null = null;
function loadMap(): Promise<MapModule> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (!mapModulePromise) {
    mapModulePromise = (async () => {
      const [rl, L] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
      ]);
      // CSS Leaflet
      await import("leaflet/dist/leaflet.css");
      // Fix icônes par défaut (bug bundler bien connu)
      // @ts-expect-error access private
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      return {
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Circle: rl.Circle,
        useMap: rl.useMap,
      };
    })();
  }
  return mapModulePromise;
}

type Props = {
  artisanId: string;
  initialLat: number | null;
  initialLng: number | null;
  initialRadiusKm: number;
  initialAddress: string | null;
  onSaved?: () => void;
};

const GUADELOUPE_CENTER: [number, number] = [16.25, -61.55];

export function ArtisanZoneEditor({
  artisanId,
  initialLat,
  initialLng,
  initialRadiusKm,
  initialAddress,
  onSaved,
}: Props) {
  const [Map, setMap] = useState<MapModule | null>(null);
  const [lat, setLat] = useState<number | null>(initialLat);
  const [lng, setLng] = useState<number | null>(initialLng);
  const [radius, setRadius] = useState<number>(initialRadiusKm || 20);
  const [address, setAddress] = useState<string>(initialAddress ?? "");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMap().then(setMap).catch(() => setMap(null));
  }, []);

  const handleGeocode = async () => {
    if (!address.trim()) {
      toast.error("Saisissez une adresse ou une commune");
      return;
    }
    setSearching(true);
    const r = await geocodeAddress(address);
    setSearching(false);
    if (!r) {
      toast.error("Adresse introuvable. Précisez la commune.");
      return;
    }
    setLat(r.lat);
    setLng(r.lng);
    toast.success(`Localisé : ${r.displayName.split(",").slice(0, 2).join(",")}`);
  };

  const handleSave = async () => {
    if (lat == null || lng == null) {
      toast.error("Définissez d'abord votre adresse");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("artisans")
      .update({
        base_lat: lat,
        base_lng: lng,
        radius_km: radius,
        base_address: address || null,
      })
      .eq("id", artisanId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Zone d'intervention enregistrée");
    onSaved?.();
  };

  const center: [number, number] = lat != null && lng != null ? [lat, lng] : GUADELOUPE_CENTER;

  return (
    <Reveal>
      <h2 className="font-serif text-2xl">Ma zone d'intervention</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Définissez votre adresse de référence et le rayon d'intervention pour ne
        recevoir que les chantiers à proximité.
      </p>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        {/* Adresse + recherche */}
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Adresse de base ou commune
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGeocode();
                }
              }}
              placeholder="ex. Pointe-à-Pitre, ou 12 rue Schœlcher Le Gosier"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
            />
          </div>
          <button
            type="button"
            onClick={handleGeocode}
            disabled={searching}
            className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Localiser
          </button>
        </div>

        {/* Rayon */}
        <div className="mt-5">
          <label className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Rayon d'intervention
            <span className="text-foreground">{radius} km</span>
          </label>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            className="w-full accent-emerald"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>5 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>

        {/* Carte */}
        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          {Map ? (
            <div className="h-80">
              <MapView
                Map={Map}
                center={center}
                lat={lat}
                lng={lng}
                radiusKm={radius}
              />
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center bg-soft text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>

        {lat != null && lng != null && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-emerald" />
            Position : {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || lat == null || lng == null}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald px-6 py-3 font-medium text-emerald-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement…" : "Enregistrer ma zone"}
        </button>
      </div>
    </Reveal>
  );
}

/* Composant interne — recentre la carte quand le centre change */
function MapView({
  Map,
  center,
  lat,
  lng,
  radiusKm,
}: {
  Map: MapModule;
  center: [number, number];
  lat: number | null;
  lng: number | null;
  radiusKm: number;
}) {
  const { MapContainer, TileLayer, Marker, Circle } = Map;
  return (
    <MapContainer
      center={center}
      zoom={lat != null ? 11 : 10}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lat != null && lng != null && (
        <>
          <Marker position={[lat, lng]} />
          <Circle
            center={[lat, lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.15 }}
          />
          <Recenter Map={Map} center={[lat, lng]} />
        </>
      )}
    </MapContainer>
  );
}

function Recenter({ Map, center }: { Map: MapModule; center: [number, number] }) {
  const map = Map.useMap();
  useEffect(() => {
    map.setView(center, 11);
  }, [map, center[0], center[1]]);
  return null;
}
