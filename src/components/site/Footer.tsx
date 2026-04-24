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
              <li>
                <Link to="/metiers" className="hover:text-white">
                  Tous les métiers
                </Link>
              </li>
              <li>
                <Link to="/comment-ca-marche" className="hover:text-white">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="hover:text-white">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Artisans
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/auth" className="hover:text-white">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white">
                  Espace pro
                </Link>
              </li>
              <li>
                <Link to="/abonnements" className="hover:text-white">
                  Abonnements
                </Link>
              </li>
              <li>
                <Link to="/contact-pro" className="hover:text-white">
                  Compte Agences/Syndics
                </Link>
              </li>
              <li>
                <Link to="/sos" className="hover:text-white">
                  SOS Urgence 24/7
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="hover:text-white">
                  Charte qualité
                </Link>
              </li>
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
                <a href="tel:+590590000000" className="hover:text-white">+590 590 00 00 00</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-accent" />
                <a href="mailto:contact@btp-guada.fr" className="hover:text-white">contact@btp-guada.fr</a>
              </li>
              <li>
                <Link to="/contact" className="text-accent hover:text-white">
                  → Formulaire de contact
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a className="rounded-full border border-white/15 p-2 hover:bg-white/10" href="#" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a className="rounded-full border border-white/15 p-2 hover:bg-white/10" href="#" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} BTP Guada — L'excellence du chantier en Guadeloupe.</p>
          <div className="flex flex-wrap gap-6">
            <Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link to="/confidentialite" className="hover:text-white">Confidentialité</Link>
            <Link to="/cgu" className="hover:text-white">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
