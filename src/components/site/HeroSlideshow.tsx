import { useEffect, useState } from "react";

const SLIDES = [
  // Modern luxury construction & architecture
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=2400&q=85",
];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-midnight">
      {/* Image layer (animated) */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <img
            src={src}
            alt=""
            className={`h-full w-full object-cover ${
              i === index ? "animate-ken-burns" : ""
            }`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "low"}
          />
        </div>
      ))}

      {/* Static contrast overlays (separate fixed layer, no animation) */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.25) 40%, rgba(15,23,42,0.55) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, var(--background) 0%, transparent 100%)",
        }}
      />

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-[3px] rounded-full transition-all duration-500 ${
              i === index
                ? "w-12 bg-accent"
                : "w-5 bg-white/35 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
