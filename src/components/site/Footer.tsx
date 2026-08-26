import logoImg from "@/assets/casaniers-logo.jpg";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import circuitIncone from "@/assets/circuit4.jpg";
import circuitIncone1 from "@/assets/circuit4.jpg";
import circuitIncone2 from "@/assets/circuit5.jpg";
import { useResponsive } from "@/hooks/useResponsive";

// Icône TikTok personnalisée (non incluse dans lucide-react)
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Colonnes de liens affichées dans le footer (Services + Légal)
const cols = [
  {
    title: "SERVICES",
    links: ["SAV et maintenance", "Audit de parc", "Devis sur-mesure", "Livraison Tana & Provinces"],
  },
  {
    title: "LEGAL",
    links: ["CGV", "CGU", "Mentions légales", "Confidentialité", "Cookies"],
  },
];

// URL de la carte Google Maps intégrée (localisation de l'atelier)
const MAPS_EMBED_URL =
  "https://maps.google.com/maps?q=5F4H%2BVPJ%2C+Antananarivo,+Madagascar&output=embed&z=16&t=k";

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const navigate = useNavigate();

  // isMobile permet d'éviter de charger des images/iframes lourdes sur téléphone
  const { isMobile } = useResponsive();

  // Envoie l'email de newsletter vers la page d'inscription (via sessionStorage)
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.trim() !== "") {
      sessionStorage.setItem("newsletterEmail", newsletterEmail.trim());
      navigate("/inscription");
    }
  };

  return (
    <footer className="bg-background text-foreground relative w-full max-w-full overflow-hidden box-border">
      {/* ── Bandeau newsletter ── */}
      <div className="border-b border-foreground/10 w-full">
        <div className="container-x py-8 md:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 w-full max-w-full box-border">
          <h3 className="font-display text-xl sm:text-2xl lg:text-3xl leading-snug text-center lg:text-left">
            <span className="align-top text-2xl lg:text-4xl mr-1">"</span>
            Recois <span className="font-black">nos news</span>
            <br />
            <span className="inline-block pl-20 sm:pl-28 lg:pl-44">
              avant tout le monde.
            </span>
            <span className="align-top text-2xl lg:text-4xl ml-1">"</span>
          </h3>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto"
          >
            <input
              type="email"
              placeholder="Balance ton email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="h-11 w-full sm:w-64 px-4 placeholder:italic rounded-full border border-foreground/20 bg-transparent placeholder:text-foreground/40 focus:border-foreground focus:outline-none text-sm box-border"
            />
            <button className="h-11 w-full sm:w-auto px-6 rounded-full bg-foreground text-background font-bold text-xs whitespace-nowrap hover:bg-foreground/80 transition-colors">
              Je m'inscris
            </button>
          </form>
        </div>
      </div>

      {/* ── Corps principal ── */}
      <div className="container-x relative pt-10 lg:pt-16 pb-0 w-full max-w-full box-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14 w-full">

          {/* — Marque + coordonnées — */}
          <div className="lg:col-span-3 relative flex flex-col items-center text-center lg:items-start lg:text-left w-full">

            {/* Image décorative */}
            {!isMobile && (
              <img
                src={circuitIncone}
                alt=""
                className="absolute -top-16 left-28 h-28 w-auto pointer-events-none opacity-40 z-0 object-contain"
              />
            )}

            <img
              src={logoImg}
              alt="Les Casaniers"
              className="h-20 w-20 object-contain rounded-xl relative z-10"
            />

            <p className="text-sm text-foreground/70 mt-5 leading-relaxed relative z-10">
              " T'accompagner vers le bon outil et son entretien durable. "
            </p>

            <div className="space-y-2.5 mt-6 text-sm text-foreground/80 relative z-10 w-full max-w-full overflow-hidden">
              <div className="flex items-center justify-center lg:justify-start gap-2 w-full">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contact@lescasaniers.mg" className="hover:text-foreground transition-colors truncate">
                  contact@lescasaniers.mg
                </a>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 w-full">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+261385157042" className="hover:text-foreground transition-colors break-all">
                  038 51 570 42 / 037 87 590 30
                </a>
              </div>
              <a
                href="https://maps.google.com/?q=5F4H+VPJ,+Antananarivo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center lg:justify-start gap-2 hover:text-foreground transition-colors w-full"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">Atelier - Antananarivo</span>
              </a>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex justify-center lg:justify-start gap-2 mt-6 relative z-10 w-full">
              <a href="#" className="h-9 w-9 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <TiktokIcon className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* — Liens de navigation (Services / Légal) — */}
          <div className="lg:col-span-4 lg:col-start-5 grid grid-cols-1 sm:grid-cols-2 gap-6 self-start text-center sm:text-left w-full">
            {cols.map((c) => (
              <div key={c.title} className="w-full">
                <div className="italic font-display text-sm mb-4 text-foreground/60">
                  {c.title}.
                </div>
                <ul className="space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* — Carte de localisation — */}
          <div className="md:col-span-2 lg:col-span-4 lg:col-start-9 relative w-full">
            {!isMobile && (
              <img
                src={circuitIncone2}
                alt=""
                className="absolute -top-12 right-0 h-24 w-auto pointer-events-none opacity-40 z-0 object-contain"
              />
            )}

            <div className="italic font-display text-sm mb-4 text-foreground/60 text-center sm:text-left relative z-10">
              NOUS TROUVER.
            </div>

            <div
              className="relative w-full overflow-hidden rounded-lg border border-foreground/15 z-10 box-border"
              style={{ aspectRatio: "4/3" }}
            >
              {isMobile ? (
                <a
                  href="https://maps.google.com/?q=5F4H+VPJ,+Antananarivo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/5 hover:bg-foreground/10 transition-colors p-4"
                >
                  <MapPin className="h-6 w-6 text-foreground/60" />
                  <span className="text-xs text-foreground/70 uppercase tracking-widest underline text-center">
                    Voir sur Google Maps
                  </span>
                </a>
              ) : (
                <>
                  {!mapLoaded && (
                    <div className="absolute inset-0 bg-foreground/5 flex flex-col items-center justify-center gap-3">
                      <MapPin className="h-6 w-6 text-foreground/30 animate-pulse" />
                      <span className="text-xs text-foreground/30 uppercase tracking-widest">
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre du bas ── */}
      <div className="container-x border-t border-foreground/10 py-6 text-center text-xs text-foreground/60 relative w-full max-w-full box-border">
        {!isMobile && (
          <img
            src={circuitIncone1}
            alt=""
            className="absolute left-0 bottom-0 h-16 w-auto pointer-events-none opacity-40 z-0 object-contain"
          />
        )}

        <span className="relative z-10">
          © 2026 Les Casaniers Madagascar
        </span>
      </div>
    </footer>
  );
};