import { Link } from "react-router-dom";
import { Star, ArrowUpRight, Volume2, VolumeX, X } from "lucide-react";
import { products, formatAr } from "@/lib/products";
import mascot from "@/assets/casaniers-mascot.png";
import { useState, useRef, useEffect } from "react";

export const FeaturedProducts = () => {
  const top = products.slice(0, 4);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  return (
    <section className="bg-background py-24 border-b border-border relative overflow-hidden">
      {/* Grid background subtile */}
      <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />
      
      {/* DÃ©tail dÃ©coratif */}
      <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />

      <div className="container-x relative z-10">
        <div className="flex items-end justify-between mb-12 pb-6 border-b-2 border-foreground">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3">â€” SÃ©lection</div>
            <h2 className="font-display text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9]">
              Nos piÃ¨ces <span className="italic font-light">d'exception.</span>
            </h2>
          </div>
          <Link to="/catalogue" className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">
            Tout voir <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {top.map((p, index) => (
            <Link
              key={p.id}
              to={`/produit/${p.id}`}
              className="group bg-background border-r border-b border-border hover:bg-foreground hover:text-background transition-all duration-500 flex flex-col relative overflow-hidden rounded-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              
              <div className="relative aspect-square bg-secondary overflow-hidden group-hover:bg-foreground/10 transition-colors">
                {p.badge && (
                  <span className="absolute top-3 left-3 z-10 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                    {p.badge}
                  </span>
                )}
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[9px] uppercase tracking-[0.3em] opacity-60 mb-2">{p.category}</div>
                <h3 className="font-display font-black text-lg leading-tight mb-2 line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs opacity-70 line-clamp-2 mb-3 italic">{p.tagline}</p>
                <div className="flex items-center gap-1 mb-3 text-xs">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-bold">{p.rating}</span>
                  <span className="opacity-60">({p.reviews})</span>
                </div>
                <div className="mt-auto flex items-end justify-between border-t border-current/20 pt-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest opacity-60">Ã  partir de</div>
                    <div className="font-display font-black text-lg">{formatAr(p.price)}</div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="relative mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-6 flex-wrap md:flex-nowrap">
            {/* Mascotte cliquable */}
            <div 
              className="relative animate-float cursor-pointer group hidden md:block"
            >
              {/* Cercle lumineux */}
              <div className={`absolute inset-0 bg-amber-500/20 rounded-full blur-2xl scale-150 transition-all duration-500 ${isSpeaking ? 'bg-green-500/30 scale-175' : 'group-hover:bg-amber-500/30'}`} />
              
              {/* Image de la mascotte */}
              <img
                src={mascot}
                alt="Casio - Cliquez pour parler"
                className="h-24 w-auto object-contain relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-110 cursor-pointer"
              />
              
              {/* Indicateur de parole */}
              {isSpeaking && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-2 py-1 rounded-full whitespace-nowrap animate-pulse">
                  Fosa parle...
                </div>
              )}
            </div>
            
            {/* Message d'accompagnement */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Fosa te recommande</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
                Une piÃ¨ce d'exception pour une <span className="italic font-light">configuration unique</span>
              </h3>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto md:mx-0">
                Chaque composant est choisi avec soin par nos experts. 
                Des piÃ¨ces de qualitÃ© premium, importÃ©es directement d'Europe 
                pour garantir performance et durabilitÃ©.
              </p>
            </div>
            
            {/* Bouton CTA */}
            <Link
              to="/catalogue"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all hover:gap-3"
            >
              DÃ©couvrir la collection
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        .theme-transition { transition: all 0.3s ease; }
      `}</style>
    </section>
  );
};
