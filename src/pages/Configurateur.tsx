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

// Configuration des étapes
const stepsConfig = [
  {
    key: "case",
    title: "La Forteresse — Boîtier",
    mascot: "La Forteresse",
    icon: Box,
    hint: "Choisissez un boîtier adapté à votre carte mère",
  },
  {
    key: "cpu",
    title: "Le Cerveau — Processeur",
    mascot: "Le Cerveau",
    icon: Cpu,
    hint: "Le cœur de votre configuration",
  },
  {
    key: "motherboard",
    title: "L'Architecte — Carte mère",
    mascot: "L'Architecte",
    icon: CircuitBoard,
    hint: "Assurez-vous de la compatibilité avec votre CPU",
  },
  {
    key: "cooling",
    title: "Sub-Zero — Refroidissement",
    mascot: "Sub-Zero",
    icon: Snowflake,
    hint: "Gardez votre CPU au frais",
  },
  {
    key: "ram",
    title: "L'Archiviste — Mémoire RAM",
    mascot: "L'Archiviste",
    icon: MemoryStick,
    hint: "Plus de RAM = plus de multitâche",
  },
  {
    key: "storage",
    title: "L'Éclair — Stockage",
    mascot: "L'Éclair",
    icon: HardDrive,
    hint: "SSD pour la vitesse, HDD pour la capacité",
  },
  {
    key: "gpu",
    title: "Le Titan — Carte graphique",
    mascot: "Le Titan",
    icon: MonitorCog,
    hint: "Essentielle pour le gaming et le montage",
  },
  {
    key: "psu",
    title: "Le Générateur — Alimentation",
    mascot: "Le Générateur",
    icon: Zap,
    hint: "Prévoyez 20% de marge",
  },
];

type Selections = Record<string, Product | null>;

// Fonction pour filtrer les produits par référence
const filterProductsByReference = (
  products: Product[],
  refPrefixes: string[],
): Product[] => {
  const filtered = products.filter((product) => {
    // Vérifier si le produit est actif et disponible
    if (!product.actif || product.quantite_stock <= 0) {
      return false;
    }

    const reference = product.reference || "";
    const matched = refPrefixes.some((prefix) => reference.startsWith(prefix));

    return matched;
  });

  return filtered;
};

const Configurateur = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const { addToCart } = useShop();
  const navigate = useNavigate();

  // Récupérer tous les produits depuis l'API
  const {
    data: allProducts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["configurator-products"],
    queryFn: async () => {
      console.log("🚀 Chargement des produits...");

      const response = await api.get("/produits");

      console.log("📦 Statut:", response.status);
      console.log("📦 Structure response.data:", Object.keys(response.data));

      // === CORRECTION ICI ===
      // La réponse est { success: true, data: [...] }
      let products = [];

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        products = response.data.data;
        console.log("✅ Produits extraits de response.data.data");
      } else if (Array.isArray(response.data)) {
        products = response.data;
        console.log("✅ Produits extraits directement de response.data");
      } else {
        console.log(
          "❌ Structure inconnue, impossible d'extraire les produits",
        );
        return [];
      }

      console.log(`📦 ${products.length} produits chargés`);

      // Afficher les produits avec leurs références
      products.forEach((p: Product) => {
        console.log(
          `  - ID:${p.id} | ${p.nom} | Ref:"${p.reference}" | Stock:${p.quantite_stock}`,
        );
      });

      return products;
    },
  });

  //Fonction pour récupérée
  const getProductImageUrl = (product: Product) => {
    if (!product) return "/placeholder-pc.jpg";

    const images = product.images || [];
    if (images.length === 0) return "/placeholder-pc.jpg";

    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return "/placeholder-pc.jpg";

    // Si l'URL commence par /storage, ajouter le domaine
    if (mainImage.url.startsWith("/storage")) {
      return `http://127.0.0.1:8000${mainImage.url}`;
    }

    return mainImage.url;
  };

  useEffect(() => {
    document.title = "Configurateur PC — Les Casaniers Madagascar";
  }, []);

  // Filtrer les produits pour chaque étape (par référence)
  const categorizedProducts = useMemo(() => {
    console.log("\n🔄 Filtrage par référence...");
    const result: Record<string, Product[]> = {};

    for (const step of stepsConfig) {
      const refPrefixes =
        referenceMapping[step.key as keyof typeof referenceMapping] || [];
      console.log(`\n📁 Étape: ${step.key} (${step.title})`);
      console.log(
        `   Recherche des références commençant par: ${refPrefixes.join(", ")}`,
      );

      const filtered = filterProductsByReference(allProducts, refPrefixes);
      result[step.key] = filtered;

      console.log(`   ✅ ${filtered.length} produit(s) trouvé(s)`);
      if (filtered.length > 0) {
        filtered.forEach((p) => {
          console.log(`      - ${p.nom} (${p.reference})`);
        });
      }
    }

    return result;
  }, [allProducts]);

  const currentStepData = stepsConfig[currentStep];
  const currentProducts = categorizedProducts[currentStepData?.key] || [];


  const total = useMemo(() => {
    return Object.values(selections).reduce((sum, product) => {
      if (!product) return sum;
      
      // Convertir en string et extraire tous les chiffres
      const priceStr = String(product.prix);
      const numbers = priceStr.match(/\d+/g);
      
      if (!numbers) return sum; // Pas de chiffres trouvés
      
      const numericPrice = parseInt(numbers.join(''), 10);
      if (isNaN(numericPrice)) return sum;
      
      return sum + numericPrice;
    }, 0);
  }, [selections]);

  const completedCount = Object.values(selections).filter(Boolean).length;
  const progress = (completedCount / stepsConfig.length) * 100;
  const allDone = completedCount === stepsConfig.length;

  const handleSelect = (product: Product) => {
    setSelections((prev) => ({
      ...prev,
      [currentStepData.key]:
        prev[currentStepData.key]?.id === product.id ? null : product,
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
    if (!allDone) {
      toast({
        title: "Configuration incomplète",
        description:
          "Veuillez sélectionner tous les composants avant d'ajouter au panier.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedComponents = stepsConfig
        .map((step) => {
          const product = selections[step.key];
          return product ? `${step.mascot}: ${product.nom}` : null;
        })
        .filter(Boolean);

      const configData = {
        nom: "Configuration PC personnalisée",
        description: selectedComponents.join(" | "),
        prix: total,
        quantite: 1,
        meta_json: {
          type: "configurateur",
          components: selections,
          date_creation: new Date().toISOString(),
        },
      };

      const response = await api.post("/panier/ajouter", configData);

      if (response.data.success) {
        toast({
          title: "✅ Configuration ajoutée !",
          description: "Votre PC sur-mesure a été ajouté au panier.",
        });
        navigate("/panier");
      }
    } catch (error: any) {
      console.error("Erreur ajout panier:", error);
      toast({
        title: "Erreur",
        description:
          error.response?.data?.message || "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <MiniHero
          title="Composez votre machine idéale."
          description="Chargement des composants..."
          bg="5.png"
        />
        <section className="container-x py-20 text-center">
          <div className="animate-pulse">
            <Cpu className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">
              Chargement des composants disponibles...
            </p>
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
        />
        <section className="container-x py-20 text-center">
          <div className="bg-red-500/10 rounded-xl p-8 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">Erreur de chargement des produits</p>
            <p className="text-xs text-muted-foreground mt-2">
              {error.message}
            </p>
            <Button variant="soft" className="mt-4" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <MiniHero
        title="Composez votre machine idéale."
        description="Choisissez vos composants pièce par pièce"
        bg="5.png"
      />

      <section className="container-x py-10 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Barre de progression */}
          <div className="card-soft p-5">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="font-semibold">
                Étape {currentStep + 1} / {stepsConfig.length}
              </span>
              <span className="text-foreground/60 font-medium">
                {Math.round(progress)}% complété
              </span>
            </div>
            <div className="relative h-2.5 rounded-full overflow-hidden bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {stepsConfig.map((step, idx) => (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    idx === currentStep
                      ? "bg-gradient-accent text-accent-foreground shadow-glow"
                      : selections[step.key]
                        ? "bg-tech/10 text-tech"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {selections[step.key] && (
                    <Check className="h-3 w-3 inline mr-1" />
                  )}
                  {step.mascot}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection actuelle */}
          <div className="card-soft p-6 lg:p-8 animate-fade-up">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-accent flex items-center justify-center shrink-0 shadow-glow">
                <currentStepData.icon className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-accent">
                  {currentStepData.mascot}
                </div>
                <h2 className="font-display text-2xl lg:text-3xl font-bold">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{currentStepData.hint}"
                </p>
              </div>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-xl">
                <Box className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Aucune donnée pour le moment
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucun composant trouvé avec les références{" "}
                  {referenceMapping[
                    currentStepData.key as keyof typeof referenceMapping
                  ]?.join(", ")}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {/* {currentProducts.map((product) => {
                  const isSelected = selections[currentStepData.key]?.id === product.id;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className={`group text-left rounded-2xl border-2 transition-all hover-lift overflow-hidden ${
                        isSelected
                          ? "border-accent bg-accent/5 shadow-glow"
                          : "border-border bg-card hover:border-accent/40"
                      }`}
                    >
                      <div className="p-4">
                        <div className="font-semibold text-sm line-clamp-2 mb-2">{product.nom}</div>
                        <div className="flex items-center justify-between">
                          <div className="font-display font-bold text-sm text-primary">
                            {formatAr(product.prix)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.reference}
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-accent ml-2" />}
                        </div>
                      </div>
                    </button>
                  );
                })} */}
                {currentProducts.map((product) => {
                  const isSelected =
                    selections[currentStepData.key]?.id === product.id;
                  const imageUrl = getProductImageUrl(product);
                  console.log("--------------------------------");
                  console.log(imageUrl);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className={`group text-left rounded-2xl border-2 transition-all hover-lift overflow-hidden ${
                        isSelected
                          ? "border-accent bg-accent/5 shadow-glow"
                          : "border-border bg-card hover:border-accent/40"
                      }`}
                    >
                      {/* Image en haut */}
                      <div className="aspect-video bg-secondary/30 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.nom}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-pc.jpg";
                          }}
                        />
                      </div>

                      {/* Contenu en bas */}
                      <div className="p-4">
                        <div className="font-semibold text-sm line-clamp-2 mb-2">
                          {product.nom}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-display font-bold text-sm text-primary">
                            {formatAr(product.prix)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.reference}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-accent" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft /> Précédent
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === stepsConfig.length - 1}
              >
                Suivant <ChevronRight />
              </Button>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Récapitulatif */}
        <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-4">
          <div className="card-soft p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={fosa}
                alt="Le Fosa"
                className="h-10 w-10 animate-float"
              />
              <div>
                <div className="font-display font-bold">
                  Votre configuration
                </div>
                <div className="text-xs text-muted-foreground">
                  Mise à jour en temps réel
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
              {stepsConfig.map((step) => {
                const selectedProduct = selections[step.key];
                return (
                  <div
                    key={step.key}
                    className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {step.mascot}
                      </div>
                      <div className="font-medium text-sm truncate">
                        {selectedProduct?.nom || (
                          <span className="text-muted-foreground italic">
                            Non sélectionné
                          </span>
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

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total estimé
                  </div>
                  <div className="font-display font-bold text-2xl text-primary">
                    {formatAr(total)}
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!allDone}
                >
                  Ajouter au panier <ChevronRight />
                </Button>
              </div>
              {!allDone && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {stepsConfig.length - completedCount} composant(s) à
                  sélectionner
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
};

export default Configurateur;
