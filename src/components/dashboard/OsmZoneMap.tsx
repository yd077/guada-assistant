import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  onPick?: (lat: number, lng: number) => void;
};

const TILE = 256;
const GUADELOUPE = { lat: 16.25, lng: -61.55 };

const lngToX = (lng: number, z: number) => ((lng + 180) / 360) * Math.pow(2, z) * TILE;
const latToY = (lat: number, z: number) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return (
    (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * TILE
  );
};
const xToLng = (x: number, z: number) => (x / (Math.pow(2, z) * TILE)) * 360 - 180;
const yToLat = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, z) * TILE);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

/**
 * Carte OpenStreetMap légère (tuiles + cercle SVG), sans dépendance ni clé API.
 * Sert de carte de secours quand l'API Google est restreinte.
 */
export function OsmZoneMap({ lat, lng, radiusKm, onPick }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 640, h: 320 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setSize({ w: el.clientWidth || 640, h: el.clientHeight || 320 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const center = lat != null && lng != null ? { lat, lng } : GUADELOUPE;

  // Zoom qui fait tenir le diamètre de la zone dans la largeur
  let zoom = 9;
  if (lat != null) {
    const metersPerPx = (radiusKm * 2200) / Math.max(size.w, 200);
    const z = Math.log2(
      (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) / metersPerPx,
    );
    zoom = Math.max(6, Math.min(15, Math.floor(z)));
  }

  const cx = lngToX(center.lng, zoom);
  const cy = latToY(center.lat, zoom);
  const left = cx - size.w / 2;
  const top = cy - size.h / 2;

  const tiles: { x: number; y: number; px: number; py: number }[] = [];
  const n = Math.pow(2, zoom);
  const x0 = Math.floor(left / TILE);
  const y0 = Math.floor(top / TILE);
  const x1 = Math.floor((left + size.w) / TILE);
  const y1 = Math.floor((top + size.h) / TILE);
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      if (y < 0 || y >= n) continue;
      tiles.push({
        x: ((x % n) + n) % n,
        y,
        px: x * TILE - left,
        py: y * TILE - top,
      });
    }
  }

  // Rayon en pixels
  const radiusPx =
    lat != null
      ? Math.abs(
          latToY(lat - radiusKm / 111.32, zoom) - latToY(lat, zoom),
        )
      : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onPick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = left + (e.clientX - rect.left);
    const py = top + (e.clientY - rect.top);
    onPick(yToLat(py, zoom), xToLng(px, zoom));
  };

  useEffect(() => {
    // rien : rendu purement dérivé de l'état
  }, [lat, lng, radiusKm]);

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="relative h-72 w-full cursor-crosshair overflow-hidden bg-soft sm:h-80"
    >
      {tiles.map((t) => (
        <img
          key={`${zoom}-${t.x}-${t.y}`}
          src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
          alt=""
          width={TILE}
          height={TILE}
          loading="lazy"
          className="pointer-events-none absolute select-none"
          style={{ left: t.px, top: t.py }}
        />
      ))}

      {lat != null && lng != null && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <circle
            cx={size.w / 2}
            cy={size.h / 2}
            r={radiusPx}
            fill="rgb(16 185 129 / 0.18)"
            stroke="#0f5132"
            strokeWidth={2}
          />
          <circle cx={size.w / 2} cy={size.h / 2} r={5} fill="#0f5132" />
        </svg>
      )}

      <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
        © OpenStreetMap
      </span>
    </div>
  );
}
