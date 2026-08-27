import { SiteLayout } from "@/components/site/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  MonitorCog,
  MemoryStick,
  HardDrive,
  Zap,
  Snowflake,
  CircuitBoard,
  Box,
  Check,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  Star,
  Trophy,
  Flame,
  Shield,
  Gem,
} from "lucide-react";
import { formatAr } from "@/lib/products";
import { useShop } from "@/store/shop";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { useNavigate } from "react-router-dom";
import { MiniHero } from "@/components/layout/MiniHero";
import { Product, productImage } from "@/hooks/useProducts";
import api from "@/service/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AICompatibilityPanel from "@/components/AICompatibilityPanel";
import mascote from "@/assets/3.png"
import {InfoBar} from "@/components/site/InfoBar"
// Mapping des références pour chaque catégorie
const referenceMapping = {
  case: ["CASE-"],
  cpu: ["CPU-"],
  motherboard: ["MB-"],
  cooling: ["CL-"],
  ram: ["RAM-"],
  storage: ["SD-", "HDD-", "SSD-"],
  gpu: ["GPU-"],
  psu: ["PSU-"],
};

// Icônes pour les atouts
const atoutIcons: Record<string, JSX.Element> = {
  performance: <Flame className="h-3 w-3" />,
  economie: <Gem className="h-3 w-3" />,
  gaming: <Trophy className="h-3 w-3" />,
  pro: <Star className="h-3 w-3" />,
  default: <Sparkles className="h-3 w-3" />,
};

// Configuration des étapes
const stepsConfig = [
  {
    key: "case",
    title: "Boîtier",
    subtitle: "La Forteresse",
    mascot: "La Forteresse",
    icon: Box,
    hint: "Choisissez un boîtier adapté à votre carte mère",
    color: "from-slate-500 to-gray-600",
  },
  {
    key: "cpu",
    title: "Processeur",
    subtitle: "Le Cerveau",
    mascot: "Le Cerveau",
    icon: Cpu,
    hint: "Le cœur de votre configuration",
    color: "from-purple-500 to-purple-700",
  },
  {
    key: "motherboard",
    title: "Carte mère",
    subtitle: "L'Architecte",
    mascot: "L'Architecte",
    icon: CircuitBoard,
    hint: "Assurez-vous de la compatibilité avec votre CPU",
    color: "from-blue-500 to-blue-700",
  },
  {
    key: "cooling",
    title: "Refroidissement",
    subtitle: "Sub-Zero",
    mascot: "Sub-Zero",
    icon: Snowflake,
    hint: "Gardez votre CPU au frais",
    color: "from-cyan-500 to-teal-600",
  },
  {
    key: "ram",
    title: "Mémoire RAM",
    subtitle: "L'Archiviste",
    mascot: "L'Archiviste",
    icon: MemoryStick,
    hint: "Plus de RAM = plus de multitâche",
    color: "from-emerald-500 to-green-700",
  },
  {
    key: "storage",
    title: "Stockage",
    subtitle: "L'Éclair",
    mascot: "L'Éclair",
    icon: HardDrive,
    hint: "SSD pour la vitesse, HDD pour la capacité",
    color: "from-amber-500 to-orange-600",
  },
  {
    key: "gpu",
    title: "Carte graphique",
    subtitle: "Le Titan",
    mascot: "Le Titan",
    icon: MonitorCog,
    hint: "Essentielle pour le gaming et le montage",
    color: "from-red-500 to-rose-700",
  },
  {
    key: "psu",
    title: "Alimentation",
    subtitle: "Le Générateur",
    mascot: "Le Générateur",
    icon: Zap,
    hint: "Prévoyez 20% de marge",
    color: "from-yellow-500 to-orange-600",
  },
];

type Selections = Record<string, Product | null>;

// Fonction pour filtrer les produits par référence
const filterProductsByReference = (
  products: Product[],
  refPrefixes: string[],
): Product[] => {
  const filtered = products.filter((product) => {
    if (!product.actif || product.quantite_stock <= 0) {
      return false;
    }
    const reference = product.reference || "";
    const matched = refPrefixes.some((prefix) => reference.startsWith(prefix));
    return matched;
  });
  return filtered;
};

// Composant badge d'atout
const AtoutBadge = ({ atout }: { atout?: string }) => {
  if (!atout || atout.trim() === "") return null;

  const getAtoutIcon = () => {
    const lowerAtout = atout.toLowerCase();
    if (lowerAtout.includes("perf") || lowerAtout.includes("puiss")) return atoutIcons.performance;
    if (lowerAtout.includes("éco") || lowerAtout.includes("prix")) return atoutIcons.economie;
    if (lowerAtout.includes("game") || lowerAtout.includes("gaming")) return atoutIcons.gaming;
    if (lowerAtout.includes("pro") || lowerAtout.includes("profe")) return atoutIcons.pro;
    return atoutIcons.default;
  };

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/20">
      {getAtoutIcon()}
      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 line-clamp-1">
        {atout.length > 35 ? atout.slice(0, 35) + "..." : atout}
      </span>
    </div>
  );
};

const Configurateur = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    data: allProducts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["configurator-products"],
    queryFn: async () => {
      const response = await api.get("/produits");
      let products = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      }
      return products;
    },
  });

  const getProductImageUrl = (product: Product) => {
    if (!product) return "/placeholder-pc.jpg";
    const images = product.images || [];
    if (images.length === 0) return "/placeholder-pc.jpg";
    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return "/placeholder-pc.jpg";
    if (mainImage.url.startsWith("/storage")) {
      return `http://127.0.0.1:8000${mainImage.url}`;
    }
    return mainImage.url;
  };

  useEffect(() => {
    document.title = "Configurateur PC — Les Casaniers Madagascar";
  }, []);

  const categorizedProducts = useMemo(() => {
    const result: Record<string, Product[]> = {};
    for (const step of stepsConfig) {
      const refPrefixes = referenceMapping[step.key as keyof typeof referenceMapping] || [];
      const filtered = filterProductsByReference(allProducts, refPrefixes);
      result[step.key] = filtered;
    }
    return result;
  }, [allProducts]);

  const currentStepData = stepsConfig[currentStep];
  const currentProducts = categorizedProducts[currentStepData?.key] || [];

  const total = useMemo(() => {
    return Object.values(selections).reduce((sum, product) => {
      if (!product) return sum;
      const priceStr = String(product.prix);
      const numbers = priceStr.match(/\d+/g);
      if (!numbers) return sum;
      const numericPrice = parseInt(numbers.join(""), 10);
      if (isNaN(numericPrice)) return sum;
      return sum + numericPrice;
    }, 0);
  }, [selections]);

  const completedCount = Object.values(selections).filter(Boolean).length;
  const progress = (completedCount / stepsConfig.length) * 100;
  const allDone = completedCount === stepsConfig.length;
  const hasSelection = completedCount > 0;

  const handleSelect = (product: Product) => {
    setSelections((prev) => ({
      ...prev,
      [currentStepData.key]: prev[currentStepData.key]?.id === product.id ? null : product,
    }));
  };

  const handleNext = () => {
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!hasSelection) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un composant",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      const selectedProducts = stepsConfig
        .map((step) => selections[step.key])
        .filter((product): product is Product => product !== null && product !== undefined);

      if (selectedProducts.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucun produit valide sélectionné",
          variant: "destructive",
        });
        setIsAddingToCart(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const product of selectedProducts) {
        if (!product || !product.id) {
          errorCount++;
          continue;
        }

        try {
          await api.post("/panier/ajouter", {
            produit_id: product.id,
            quantite: 1,
            utilisateur_id: user?.id,
            prix_unitaire: product.prix,
            titre: product.nom,
          });

          addToCart(
            String(product.id),
            1,
            {
              id: String(product.id),
              name: product.nom,
              category: product.type_produit || "composant",
              tagline: product.description_courte || "Composant PC",
              price: Number(product.prix),
              image: getProductImageUrl(product),
            }
          );

          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "✅ Configuration ajoutée !",
          description: `${successCount} composant(s) ajouté(s) au panier${errorCount > 0 ? ` (${errorCount} erreur(s))` : ""}`,
        });
        if (errorCount === 0) {
          navigate("/panier");
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter les composants",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erreur ajout panier:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <MiniHero
          title="Composez votre machine idéale."
          description="Chargement des composants..."
          bg="5.png"
          pill={{ icon: <Cpu className="h-3.5 w-3.5" />, label: "Configurateur" }}
        />
        <section className="container-x py-16 text-center">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Cpu className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Chargement des composants disponibles...</p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <MiniHero
          title="Composez votre machine idéale."
          description=""
          bg="5.png"
          pill={{ icon: <Cpu className="h-3.5 w-3.5" />, label: "Configurateur" }}
        />
        <section className="container-x py-16">
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-8 text-center max-w-md mx-auto">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-500 font-medium">Erreur de chargement</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
            <Button variant="soft" size="sm" className="mt-4" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
<div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
      {/* 1. Composant MiniHero */}
      <MiniHero
        title="Composez votre machine idéale."
        description={
          <div className="flex flex-col">
            <p>Assemblez votre PC pièce par pièce</p>
            <p className="pl-[2.5rem] sm:pl-[4.5rem] md:pl-[6rem]">
              avec nos experts.
            </p>
          </div>
        }
        bg="/5.png" // Image depuis le dossier public/
        mascot={mascote}
        pill={{ 
          icon: <Cpu className="h-3.5 w-3.5" />, 
          label: "Configurateur" 
        }}
      />

      {/* 2. InfoBar positionnée juste en dessous */}
      <InfoBar />
    </div>
      <section className="container-x py-8 grid lg:grid-cols-12 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-8 space-y-5">
          {/* Barre de progression compacte */}
          <div className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-medium text-muted-foreground">
                Progression
              </span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {stepsConfig.map((step, idx) => (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${idx === currentStep
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : selections[step.key]
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                >
                  {selections[step.key] && <Check className="h-2.5 w-2.5 inline mr-0.5" />}
                  {step.title}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection actuelle - design compact */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 animate-fade-up">
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-sm`}>
                <currentStepData.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-primary/70">
                  {currentStepData.subtitle}
                </div>
                <h2 className="text-lg font-bold">{currentStepData.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{currentStepData.hint}</p>
              </div>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-8 bg-secondary/20 rounded-lg">
                <Box className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Aucun composant trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentProducts.map((product) => {
                  const isSelected = selections[currentStepData.key]?.id === product.id;
                  const imageUrl = getProductImageUrl(product);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className={`group text-left rounded-xl border transition-all duration-200 overflow-hidden ${isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/70 bg-card hover:border-primary/30 hover:shadow-sm"
                        }`}
                    >
                      <div className="aspect-video bg-secondary/20 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.nom}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-pc.jpg";
                          }}
                        />
                      </div>
                      <div className="p-2.5">
                        <h3 className="font-semibold text-xs line-clamp-2 leading-tight mb-1.5">
                          {product.nom}
                        </h3>

                        <AtoutBadge atout={product.atout} />

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/30">
                          <span className="font-bold text-xs text-primary">
                            {formatAr(product.prix)}
                          </span>
                          {isSelected && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center mt-5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-xs h-8"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Précédent
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === stepsConfig.length - 1}
                className="text-xs h-8"
              >
                Suivant <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Récapitulatif compact */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-4">
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-secondary/20 p-5">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-border/30">
              <img src={fosa} alt="Le Fosa" className="h-8 w-8" />
              <div>
                <div className="font-bold text-sm">Votre configuration</div>
                <div className="text-[10px] text-muted-foreground">Mise à jour en temps réel</div>
              </div>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {stepsConfig.map((step) => {
                const selectedProduct = selections[step.key];
                return (
                  <div
                    key={step.key}
                    className={`flex items-center justify-between gap-2 py-1.5 border-b border-border/30 last:border-0 ${!selectedProduct ? "opacity-60" : ""
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {step.subtitle}
                      </div>
                      <div className="font-medium text-xs truncate">
                        {selectedProduct?.nom || (
                          <span className="text-muted-foreground italic">Non sélectionné</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-semibold tabular-nums text-primary shrink-0">
                      {selectedProduct ? formatAr(selectedProduct.prix) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total estimé
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {completedCount}/{stepsConfig.length} sélectionné(s)
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-xl text-primary">
                  {formatAr(total)}
                </div>
                <Button
                  variant="hero"
                  size="default"
                  onClick={handleAddToCart}
                  disabled={!hasSelection || isAddingToCart}
                  className="h-9 text-sm min-w-[120px]"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      Ajouter au panier
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
              {!hasSelection && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Sélectionnez au moins un composant
                </p>
              )}
              {hasSelection && !allDone && (
                <p className="text-[10px] text-amber-500 mt-2 text-center">
                  {stepsConfig.length - completedCount} composant(s) optionnel(s) manquant(s)
                </p>
              )}
            </div>
          </div>

          <AICompatibilityPanel
            selections={selections}
            autoAnalyze={true}
            apiKey={import.meta.env.VITE_GEMINI_API_KEY}
          />
          
          {/* Conseil supplémentaire compact */}
          <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-primary">Conseil Casanier</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Notre équipe peut vous aider à affiner votre configuration.
                  <a href="/contact" className="text-primary hover:underline ml-1">Contactez-nous</a>
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>


    </SiteLayout>
  );
};

export default Configurateur;