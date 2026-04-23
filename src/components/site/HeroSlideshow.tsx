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
    // Preload all slides for seamless transitions
    SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-midnight">
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[2200ms] ease-in-out ${
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
      {/* Premium layered overlays for legibility & depth */}
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,23,42,0.55)_70%,rgba(15,23,42,0.85)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? "w-10 bg-accent" : "w-4 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
