import { SiteLayout } from "@/components/site/SiteLayout";
import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Cpu, MonitorCog, MemoryStick, HardDrive, Zap, Snowflake,
  CircuitBoard, Box, Check, AlertTriangle, ChevronRight, ChevronLeft, Sparkles
} from "lucide-react";
import { formatAr } from "@/lib/products";
import { useShop } from "@/store/shop";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { useNavigate } from "react-router-dom";
import { MiniHero } from "@/components/layout/MiniHero";

type Step = {
  key: string;
  title: string;
  mascot: string;
  icon: typeof Cpu;
  hint: string;
  options: {
    id: string;
    name: string;
    price: number;
    perf: number;
    tag?: string;
    warn?: string;
    image?: string;
  }[];
};

const steps: Step[] = [
  {
    key: "usage",
    title: "Quel est votre super-pouvoir ?",
    mascot: "Le Fosa",
    icon: Sparkles,
    hint: "On démarre par votre usage : ça oriente toutes les pièces ensuite.",
    options: [
      { id: "office", name: "Bureautique & Études", price: 0, perf: 1, tag: "Économique", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=80" },
      { id: "creator", name: "Création & Montage", price: 0, perf: 3, tag: "Polyvalent", image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=300&q=80" },
      { id: "gaming", name: "Gaming AAA", price: 0, perf: 4, tag: "Performance", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80" },
      { id: "extreme", name: "Streaming & 3D", price: 0, perf: 5, tag: "Extrême", image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&q=80" },
    ],
  },
  {
    key: "case",
    title: "La Forteresse — Boîtier",
    mascot: "La Forteresse",
    icon: Box,
    hint: "Vérifie le format (ATX, mATX, ITX). La longueur de la GPU doit rentrer !",
    options: [
      { id: "mini", name: "Mini-ITX compact", price: 190000, perf: 1, image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=300&q=80" },
      { id: "mid", name: "Mid-Tower ATX", price: 320000, perf: 3, tag: "Populaire", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&q=80" },
      { id: "full", name: "Full-Tower ATX", price: 590000, perf: 4, tag: "Spacieux", image: "https://images.unsplash.com/photo-1593640408182-31c228b29f6d?w=300&q=80" },
      { id: "rgb", name: "Mid-Tower RGB Vitré", price: 480000, perf: 3, tag: "Esthétique", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80" },
    ],
  },
  {
    key: "cpu",
    title: "Le Cerveau — Processeur",
    mascot: "Le Cerveau",
    icon: Cpu,
    hint: "Vérifie mon socket et mon iGPU. Plus de cœurs = plus de multitâche.",
    options: [
      { id: "i5", name: "Intel Core i5-12400F", price: 850000, perf: 2, image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80" },
      { id: "i7", name: "Intel Core i7-13700KF", price: 1850000, perf: 4, tag: "Best-seller", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80" },
      { id: "r9", name: "AMD Ryzen 9 7900X", price: 2390000, perf: 5, image: "https://images.unsplash.com/photo-1618389901049-4c2b0e157b83?w=300&q=80" },
      { id: "i9", name: "Intel Core i9-14900K", price: 3290000, perf: 5, tag: "Top", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80" },
    ],
  },
  {
    key: "motherboard",
    title: "L'Architecte — Carte mère",
    mascot: "L'Architecte",
    icon: CircuitBoard,
    hint: "Le socket doit correspondre à ton CPU ! Vérifie aussi les slots PCIe.",
    options: [
      { id: "b660", name: "MSI B660M PRO-A", price: 680000, perf: 2, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80" },
      { id: "z790", name: "ASUS ROG Strix Z790-E", price: 1590000, perf: 4, tag: "Gaming", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80" },
      { id: "x670", name: "Gigabyte X670E Aorus", price: 1890000, perf: 5, tag: "AMD", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80" },
      { id: "z790w", name: "MSI MEG Z790 ACE", price: 2490000, perf: 5, tag: "Pro", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80" },
    ],
  },
  {
    key: "cooling",
    title: "Sub-Zero — Refroidissement",
    mascot: "Sub-Zero",
    icon: Snowflake,
    hint: "Ton CPU chauffe à 150W ? Il te faut un AIO 240mm minimum.",
    options: [
      { id: "air", name: "Ventirad tour", price: 90000, perf: 2, warn: "Insuffisant pour i9 / Ryzen 9.", image: "https://images.unsplash.com/photo-1600348712270-ab4e34a2bbf7?w=300&q=80" },
      { id: "240", name: "Watercooling 240mm", price: 290000, perf: 4, image: "https://images.unsplash.com/photo-1593640408182-31c228b29f6d?w=300&q=80" },
      { id: "360", name: "Watercooling 360mm", price: 490000, perf: 5, tag: "Silencieux", image: "https://images.unsplash.com/photo-1593640408182-31c228b29f6d?w=300&q=80" },
    ],
  },
  {
    key: "ram",
    title: "L'Archiviste — Mémoire RAM",
    mascot: "L'Archiviste",
    icon: MemoryStick,
    hint: "DDR4 et DDR5 ne se mélangent jamais ! Vérifie ta carte mère.",
    options: [
      { id: "16", name: "16 Go DDR5 5200", price: 280000, perf: 2, image: "https://images.unsplash.com/photo-1562976540-1502c2145651?w=300&q=80" },
      { id: "32", name: "32 Go DDR5 6000", price: 520000, perf: 4, tag: "Recommandé", image: "https://images.unsplash.com/photo-1562976540-1502c2145651?w=300&q=80" },
      { id: "64", name: "64 Go DDR5 ECC", price: 1190000, perf: 5, image: "https://images.unsplash.com/photo-1562976540-1502c2145651?w=300&q=80" },
    ],
  },
  {
    key: "storage",
    title: "L'Éclair — Stockage",
    mascot: "L'Éclair",
    icon: HardDrive,
    hint: "NVMe Gen4, c'est le confort instantané. HDD pour archiver.",
    options: [
      { id: "500", name: "SSD NVMe 500 Go", price: 180000, perf: 2, image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=300&q=80" },
      { id: "1to", name: "SSD NVMe 1 To Gen4", price: 350000, perf: 4, tag: "Idéal", image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=300&q=80" },
      { id: "2to", name: "SSD NVMe 2 To + HDD 4 To", price: 890000, perf: 5, image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=300&q=80" },
    ],
  },
  {
    key: "gpu",
    title: "Le Titan — Carte graphique",
    mascot: "Le Titan",
    icon: MonitorCog,
    hint: "Je suis longue ! Mesure ton boîtier. Plus je suis grosse, plus je chauffe.",
    options: [
      { id: "igpu", name: "Aucune (iGPU)", price: 0, perf: 1, warn: "À choisir uniquement avec un CPU avec iGPU.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&q=80" },
      { id: "4060", name: "RTX 4060 8 Go", price: 1490000, perf: 3, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&q=80" },
      { id: "4070", name: "RTX 4070 12 Go", price: 2490000, perf: 4, tag: "1440p", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&q=80" },
      { id: "4090", name: "RTX 4090 24 Go", price: 6990000, perf: 5, tag: "4K Ultra", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&q=80" },
    ],
  },
  {
    key: "psu",
    title: "Le Générateur — Alimentation",
    mascot: "Le Générateur",
    icon: Zap,
    hint: "Toujours prévoir 20% de marge. Une RTX 4090 + i9 = 850W minimum.",
    options: [
      { id: "550", name: "550W 80+ Bronze", price: 220000, perf: 2, image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=300&q=80" },
      { id: "750", name: "750W 80+ Gold", price: 390000, perf: 3, tag: "Équilibré", image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=300&q=80" },
      { id: "850", name: "850W 80+ Gold Modulaire", price: 590000, perf: 4, tag: "Recommandé", image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=300&q=80" },
      { id: "1000", name: "1000W 80+ Platinum", price: 890000, perf: 5, tag: "Beast mode", image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=300&q=80" },
    ],
  },
];

type Selections = Record<string, string>;

const Configurateur = () => {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selections>({});
  const [ggPlayed, setGgPlayed] = useState(false);
  const { addToCart } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Configurateur PC — Les Casaniers Madagascar";
  }, []);

  const current = steps[step];
  const total = useMemo(
    () =>
      Object.entries(sel).reduce((sum, [k, v]) => {
        const opt = steps.find((s) => s.key === k)?.options.find((o) => o.id === v);
        return sum + (opt?.price ?? 0);
      }, 0),
    [sel],
  );

  const warnings = useMemo(() => {
    const w: string[] = [];
    if (sel.cpu === "i9" && sel.cooling === "air")
      w.push("Sub-Zero : un i9 avec un simple ventirad va surchauffer. Passez à du watercooling.");
    if (sel.gpu === "4090" && sel.cpu === "i5")
      w.push("L'Architecte : une RTX 4090 sera bridée par un i5. Envisagez un i7/i9.");
    if (sel.gpu === "igpu" && sel.cpu !== "i5")
      w.push("Le Cerveau : le CPU choisi n'a pas d'iGPU. Ajoutez une carte graphique !");
    return w;
  }, [sel]);

  // Count how many steps are completed
  const completedCount = steps.filter((s) => sel[s.key]).length;
  const progress = (completedCount / steps.length) * 100;
  const allDone = step >= steps.length;

  // Speak "GG" when all steps are done
  useEffect(() => {
    if (allDone && !ggPlayed && typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance("GG");
      utter.lang = "fr-FR";
      utter.pitch = 1.2;
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
      setGgPlayed(true);
    }
  }, [allDone, ggPlayed]);

  const handleSelect = (id: string) => {
    setSel((s) => ({ ...s, [current.key]: id }));
    setTimeout(() => setStep((s) => Math.min(s + 1, steps.length)), 250);
  };

  const handleAddToCart = () => {
    addToCart("p1", 1);
    toast({ title: "Configuration ajoutée", description: "Votre build sur-mesure est dans le panier." });
    navigate("/panier");
  };

  return (
    <SiteLayout>
      <MiniHero title="Composez votre machine idéale." description="" bg="5.png" />

      <section className="container-x py-10 grid lg:grid-cols-12 gap-8">
        {/* Steps & questions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress */}
          <div className="card-soft p-5">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="font-semibold">
                Étape {Math.min(step + 1, steps.length)} / {steps.length}
              </span>
              <span className="text-foreground/60 font-medium">{Math.round(progress)}% complété</span>
            </div>
            {/* Progress bar — lisible en mode clair ET sombre */}
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{
                backgroundColor: "rgba(128,128,128,0.18)",
                border: "1px solid rgba(128,128,128,0.25)",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "var(--foreground, #000)",
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    i === step
                      ? "bg-gradient-accent text-accent-foreground shadow-glow"
                      : sel[s.key]
                      ? "bg-tech/10 text-tech"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sel[s.key] && <Check className="h-3 w-3 inline mr-1" />}
                  {s.mascot}
                </button>
              ))}
            </div>
          </div>

          {!allDone ? (
            <div className="card-soft p-6 lg:p-8 animate-fade-up" key={current.key}>
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-accent flex items-center justify-center shrink-0 shadow-glow">
                  <current.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wider text-accent">{current.mascot}</div>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold">{current.title}</h2>
                  <p className="text-sm text-muted-foreground mt-2 italic">"{current.hint}"</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {current.options.map((o) => {
                  const active = sel[current.key] === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => handleSelect(o.id)}
                      className={`group text-left rounded-2xl border-2 transition-all hover-lift overflow-hidden ${
                        active
                          ? "border-accent bg-accent/5 shadow-glow"
                          : "border-border bg-card hover:border-accent/40"
                      }`}
                    >
                      {/* Component image */}
                      {o.image && (
                        <div className="relative h-36 w-full overflow-hidden bg-secondary/40">
                          <img
                            src={o.image}
                            alt={o.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {o.tag && (
                            <span className="absolute top-2 right-2 pill !py-0.5 !px-2 !text-[10px] bg-accent/90 text-accent-foreground border-accent/20">
                              {o.tag}
                            </span>
                          )}
                          {active && (
                            <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
                              <div className="h-10 w-10 rounded-full bg-accent/90 flex items-center justify-center shadow-glow">
                                <Check className="h-5 w-5 text-accent-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="font-semibold text-sm">{o.name}</div>
                          {!o.image && o.tag && (
                            <span className="pill !py-0.5 !px-2 !text-[10px] bg-accent/10 text-accent border-accent/20">
                              {o.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 w-5 rounded-full ${i < o.perf ? "bg-gradient-accent" : "bg-secondary"}`}
                            />
                          ))}
                        </div>
                        <div className="font-display font-bold text-sm">
                          {o.price === 0 ? "Inclus" : `+ ${formatAr(o.price)}`}
                        </div>
                        {o.warn && (
                          <div className="mt-2 text-[11px] text-accent flex items-start gap-1.5">
                            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                            {o.warn}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft /> Précédent
                </Button>
                <Button variant="soft" size="sm" onClick={() => setStep(Math.min(steps.length, step + 1))}>
                  Passer cette étape <ChevronRight />
                </Button>
              </div>
            </div>
          ) : (
            <div className="card-soft p-8 animate-fade-up text-center">
              <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-accent flex items-center justify-center shadow-glow mb-4">
                <Check className="h-10 w-10 text-accent-foreground" />
              </div>
              <h2 className="font-display text-3xl font-bold">Le Récapitulatif Épique</h2>
              <p className="text-muted-foreground mt-2">
                Votre configuration est prête. Le Fosa est fier de vous 🐾
              </p>
              <p className="text-4xl mt-3 animate-bounce">🎉 GG !</p>
              <Button variant="hero" size="lg" className="mt-6" onClick={handleAddToCart}>
                Ajouter au panier <ChevronRight />
              </Button>
            </div>
          )}
        </div>

        {/* Récap latéral */}
        <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-4">
          <div className="card-soft p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center gap-3 mb-4">
              <img src={fosa} alt="" className="h-10 w-10 animate-float" />
              <div>
                <div className="font-display font-bold">Votre build</div>
                <div className="text-xs text-muted-foreground">Mis à jour en temps réel</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {steps.map((s) => {
                const opt = s.options.find((o) => o.id === sel[s.key]);
                return (
                  <div
                    key={s.key}
                    className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0"
                  >
                    <div className="min-w-0 flex items-start gap-2">
                      {opt && sel[s.key] && (
                        <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.mascot}</div>
                        <div className="font-medium truncate">{opt?.name ?? "—"}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold tabular-nums text-muted-foreground shrink-0">
                      {opt ? (opt.price === 0 ? "Inclus" : formatAr(opt.price)) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-end justify-between mt-4 pt-4 border-t border-border">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total estimé</div>
                <div className="font-display font-bold text-2xl">{formatAr(total)}</div>
              </div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="card-soft p-4 border-accent/40 bg-accent/5 space-y-2">
              <div className="text-sm font-semibold text-accent flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Compatibilité
              </div>
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {w}
                </p>
              ))}
            </div>
          )}
        </aside>
      </section>
    </SiteLayout>
  );
};

export default Configurateur;