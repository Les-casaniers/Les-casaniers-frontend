import mascot from "@/assets/casaniers-mascot.png";
import logoImg from "@/assets/casaniers-logo.jpg";
import { Facebook, Instagram, Youtube, Twitch, MapPin, Phone, Mail, ArrowUpRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const cols = [
  { title: "Boutique", links: ["Pro & Freelance", "Gaming", "Composants", "Périphériques", "Importation SOS"] },
  { title: "Services", links: ["Configurateur", "Devis Pro", "SAV & Maintenance", "Audit de parc", "Showroom"] },
  { title: "Maison", links: ["Guides d'achat", "Actualités Tech", "Tutos Maintenance", "À propos", "Équipe"] },
  { title: "Légal", links: ["CGV", "CGU", "Mentions légales", "Confidentialité", "Cookies"] },
];

const MAPS_EMBED_URL =
  "https://maps.google.com/maps?q=5F4H%2BVPJ%2C+Antananarivo,+Madagascar&output=embed&z=16&t=k";

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const navigate = useNavigate();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.trim() !== "") {
      sessionStorage.setItem("newsletterEmail", newsletterEmail.trim());
      navigate("/inscription");
    }
  };

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">

      {/* ── Newsletter band ── */}
      <div className="border-b border-background/10">
        <div className="container-x py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-3">
              La lettre des Casaniers
            </div>
            <h3 className="font-display font-black text-3xl lg:text-4xl tracking-tight">
              Recevez nos nouveautés{" "}
              <span className="italic font-light">avant tout le monde.</span>
            </h3>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-0">
            <input
              type="email"
              placeholder="Votre email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1 h-14 px-5 bg-transparent border border-background/30 text-background placeholder:text-background/40 focus:border-background focus:outline-none text-sm"
            />
            <button className="h-14 px-6 bg-background text-foreground font-bold uppercase tracking-wider text-xs hover:bg-background/80 transition-colors flex items-center gap-2">
              S'inscrire <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="container-x relative pt-16 pb-0">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">

          {/* — Brand + contact — */}
          <div className="lg:col-span-3">
            <img
              src={logoImg}
              alt="Les Casaniers"
              className="h-16 w-auto object-contain"
            />
            <p className="text-sm text-background/70 mt-5 leading-relaxed">
              PC sur-mesure, conseils d'experts, importation directe d'Europe.
              La maison qui assemble votre machine idéale.
            </p>

            <div className="space-y-2.5 mt-6 text-sm text-background/80">
              <a
                href="https://maps.google.com/?q=5F4H+VPJ,+Antananarivo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-background transition-colors group"
              >
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Showroom · Antananarivo</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity ml-auto" />
              </a>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+261340000000" className="hover:text-background transition-colors">
                  +261 34 00 000 00
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href="mailto:contact@lescasaniers.mg"
                  className="hover:text-background transition-colors"
                >
                  contact@lescasaniers.mg
                </a>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {[Facebook, Instagram, Youtube, Twitch].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* — Nav links — */}
          <div className="lg:col-span-5 lg:col-start-4 grid grid-cols-2 sm:grid-cols-4 gap-6 self-start">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-background/60">
                  {c.title}
                </div>
                <ul className="space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-background/70 hover:text-background transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* — Map — */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-background/60">
              Nous trouver
            </div>

            {/* Map container with skeleton */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
              {/* Skeleton shown until iframe fires onLoad */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-background/5 flex flex-col items-center justify-center gap-3 border border-background/10">
                  <MapPin className="h-6 w-6 text-background/30 animate-pulse" />
                  <span className="text-xs text-background/30 uppercase tracking-widest">
                    Chargement…
                  </span>
                </div>
              )}

              <iframe
                title="Localisation Les Casaniers — Antananarivo"
                src={MAPS_EMBED_URL}
                className={[
                  "absolute inset-0 w-full h-full border-0 contrast-125 transition-opacity duration-500",
                  mapLoaded ? "opacity-100" : "opacity-0",
                ].join(" ")}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapLoaded(true)}
              />

              {/* Gold corner accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
                style={{ background: "#c8a96e" }}
              />

              {/* Directions CTA overlay (bottom-right) */}
              <a
                href="https://maps.google.com/?q=5F4H+VPJ,+Antananarivo"
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "absolute bottom-4 right-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-opacity duration-500",
                  "bg-foreground text-background hover:bg-background hover:text-foreground border border-background/20",
                  mapLoaded ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                Itinéraire <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Address pill below map */}
            <p className="text-[11px] text-background/40 mt-3 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              5F4H+VPJ · Antananarivo, Madagascar
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="container-x border-t border-background/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/60">
        <div className="flex items-center gap-3">
          <img
            src={mascot}
            alt=""
            aria-hidden
            className="h-12 w-12 object-contain -scale-x-100"
          />
          <span>À très vite — © 2026 Les Casaniers Madagascar</span>
        </div>
        <span>Importation Europe · Garantie 24 mois · Made in Antananarivo</span>
      </div>
    </footer>
  );
};