import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Délai en secondes avant l'animation (compat ancienne API motion). */
  delay?: number;
  /** Décalage vertical initial en px. */
  y?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Apparition au scroll, sans librairie d'animation.
 * - IntersectionObserver + transition CSS.
 * - Fail-safe : si l'observer ne déclenche jamais (iOS ancien, onglet en
 *   arrière-plan…), le contenu est révélé de toute façon après un court délai,
 *   donc aucun texte ne peut rester invisible.
 */
export function Reveal({ children, delay = 0, y = 24, className, style }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      setArmed(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    // Déjà dans le viewport au montage -> pas d'animation nécessaire.
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      setArmed(true);
      return;
    }

    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);

    // Fail-safe : révéler quoi qu'il arrive.
    const fallback = window.setTimeout(() => setVisible(true), 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const cssVars = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${Math.max(0, delay) * 1000}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...cssVars, ...style }}
      data-reveal={!armed ? "idle" : visible ? "in" : "out"}
    >
      {children}
    </div>
  );
}
