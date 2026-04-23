import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-midnight text-midnight-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              La plateforme de référence des artisans BTP de Guadeloupe.
              Sélection rigoureuse, expertise locale, transparence totale.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Particuliers
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/recherche" className="hover:text-white">
                  Trouver un artisan
                </Link>
              </li>
              <li>
                <Link to="/projet" className="hover:text-white">
                  Soumettre un projet
                </Link>
              </li>
              <li className="text-white/50">Comment ça marche</li>
              <li className="text-white/50">Tarifs indicatifs</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Artisans
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="text-white/50">Devenir partenaire</li>
              <li className="text-white/50">Espace pro</li>
              <li className="text-white/50">Charte qualité</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-accent" />
                <span>Pointe-à-Pitre, Guadeloupe</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-none text-accent" />
                <span>+590 590 00 00 00</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-accent" />
                <span>contact@btp-guada.fr</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a className="rounded-full border border-white/15 p-2 hover:bg-white/10" href="#">
                <Facebook className="h-4 w-4" />
              </a>
              <a className="rounded-full border border-white/15 p-2 hover:bg-white/10" href="#">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} BTP Guada — L'excellence du chantier en Guadeloupe.</p>
          <div className="flex gap-6">
            <span>Mentions légales</span>
            <span>Confidentialité</span>
            <span>CGU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
