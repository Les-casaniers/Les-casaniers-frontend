import logoImg from "@/assets/casaniers-logo.jpg";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import circuitIncone from "@/assets/circuit1.png";
import circuitIncone1 from "@/assets/circuit2.png";
import circuitIncone2 from "@/assets/circuit3.png";

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

const cols = [
  { title: "SERVICES", links: ["SAV et maintenance", "Audit de parc", "Devis sur-mesure", "Livraison Tana & Provinces"] },
  { title: "LEGAL", links: ["CGV", "CGU", "Mentions légales", "Confidentialité", "Cookies"] },
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
    <footer className="bg-background text-foreground relative overflow-hidden">

      {/* ── Newsletter band ── */}
      <div className="border-b border-foreground/10">
        <div className="container-x py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <h3 className="font-display text-2xl lg:text-3xl leading-snug">
            <span className="align-top text-3xl lg:text-4xl mr-1">"</span>
            Recevez <span className="font-black">nos news</span>
            <br className="hidden sm:block" />
            {" "}avant tout le monde.
            <span className="align-top text-3xl lg:text-4xl ml-1">"</span>
          </h3>

          <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-3 shrink-0">
            <input
              type="email"
              placeholder="Balance ton email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="h-11 w-56 sm:w-64 px-4 rounded-full border border-foreground/20 bg-transparent placeholder:text-foreground/40 focus:border-foreground focus:outline-none text-sm"
            />
            <button className="h-11 px-5 rounded-full bg-foreground text-background font-bold text-xs whitespace-nowrap hover:bg-foreground/80 transition-colors">
              S'inscrire
            </button>
          </form>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="container-x relative pt-16 pb-0">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">

          {/* — Brand + contact — */}
          <div className="lg:col-span-3 relative">
            
            {/* Circuit 1 (Logo) */}
            <img 
              src={circuitIncone} 
              alt="" 
              className="absolute -top-16 left-28 h-28 w-auto pointer-events-none opacity-40 z-0 object-contain"
            />

            <img
              src={logoImg}
              alt="Les Casaniers"
              className="h-20 w-20 object-contain rounded-xl relative z-10"
            />

            <p className="text-sm text-foreground/70 mt-5 leading-relaxed relative z-10">
              " T'accompagner vers le bon outil et son entretien durable. "
            </p>

            <div className="space-y-2.5 mt-6 text-sm text-foreground/80 relative z-10">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href="mailto:contact@lescasaniers.mg"
                  className="hover:text-foreground transition-colors"
                >
                  contact@lescasaniers.mg
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+261385157042" className="hover:text-foreground transition-colors">
                  038 51 570 42 / 037 87 590 30
                </a>
              </div>
              <a
                href="https://maps.google.com/?q=5F4H+VPJ,+Antananarivo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Atelier - Antananarivo</span>
              </a>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex gap-2 mt-6 relative z-10">
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

          {/* — Nav links — */}
          <div className="lg:col-span-4 lg:col-start-5 grid grid-cols-2 gap-6 self-start">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="italic font-display text-sm mb-4 text-foreground/60">
                  {c.title}.
                </div>
                <ul className="space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors"
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
          <div className="lg:col-span-4 lg:col-start-9 relative">
            
            {/* Circuit 3 (À côté de NOUS TROUVER) */}
            <img 
              src={circuitIncone2} 
              alt="" 
              className="absolute -top-16 right-0 h-24 w-auto pointer-events-none opacity-40 z-0 object-contain"
            />

            <div className="italic font-display text-sm mb-4 text-foreground/60 relative z-10">
              NOUS TROUVER.
            </div>

            <div className="relative w-full overflow-hidden rounded-lg border border-foreground/15 z-10" style={{ aspectRatio: "4/3" }}>
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="container-x border-t border-foreground/10 py-6 text-center text-xs text-foreground/60 relative">
        
        {/* Circuit 2 (Devant le copyright 2026) */}
        <img 
          src={circuitIncone1} 
          alt="" 
          className="absolute left-0 bottom-0 h-8 w-auto pointer-events-none opacity-40 z-0 object-contain"
        />

        <span className="relative z-10">
          © 2026 Les Casaniers Madagascar
        </span>
      </div>
    </footer>
  );
};