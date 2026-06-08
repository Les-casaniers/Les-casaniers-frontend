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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

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

  // Fonction pour récupérer l'image
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
  // Le bouton est activé si au moins un produit est sélectionné
  const hasSelection = completedCount > 0;

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

  // Fonction pour ajouter tous les produits sélectionnés au panier
const handleAddToCart = async () => {
  if (!isAuthenticated) {
    toast({
      title: "Connexion requise",
      description: "Veuillez vous connecter pour ajouter au panier",
      variant: "destructive",
    });
    navigate("/connexion");
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
    // CORRECTION ICI : Filtrer correctement pour enlever les undefined/null
    const selectedProducts = stepsConfig
      .map((step) => selections[step.key])
      .filter((product): product is Product => product !== null && product !== undefined);
    
    console.log("Produits sélectionnés à ajouter:", selectedProducts);
    console.log("Nombre de produits à ajouter:", selectedProducts.length);

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
    const errors: string[] = [];

    // Ajouter chaque produit un par un dans le panier
    for (const product of selectedProducts) {
      // Vérification supplémentaire pour chaque produit
      if (!product || !product.id) {
        console.error("Produit invalide:", product);
        errorCount++;
        errors.push("Produit invalide");
        continue;
      }

      try {
        console.log(`Ajout du produit: ${product.nom} (ID: ${product.id})`);
        
        await api.post("/panier/ajouter", {
          produit_id: product.id,
          quantite: 1,
          utilisateur_id: user?.id,
          prix_unitaire: product.prix,
          titre: product.nom,
        });
        
        successCount++;

        // Mettre à jour le store local
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
        
        console.log(`✅ Succès pour ${product.nom}`);
      } catch (err: any) {
        console.error(`Erreur pour ${product?.nom || "produit inconnu"}:`, err);
        errorCount++;
        errors.push(product?.nom || "Produit inconnu");
      }
    }

    if (successCount > 0) {
      toast({
        title: "✅ Configuration ajoutée !",
        description: `${successCount} composant(s) ajouté(s) au panier${errorCount > 0 ? ` (${errorCount} erreur(s))` : ""}`,
      });

      // Rediriger vers le panier seulement si tout a réussi
      if (errorCount === 0) {
        navigate("/panier");
      }
    } else {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter les composants: ${errors.join(", ")}`,
        variant: "destructive",
      });
    }
  } catch (error: any) {
    console.error("Erreur ajout panier:", error);
    toast({
      title: "Erreur",
      description:
        error.response?.data?.message || "Impossible d'ajouter au panier",
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
                {currentProducts.map((product) => {
                  const isSelected =
                    selections[currentStepData.key]?.id === product.id;
                  const imageUrl = getProductImageUrl(product);
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
                        
                        {/* AFFICHAGE DE L'ATOUT - AJOUTÉ ICI */}
                        {product.atout && product.atout.trim() !== "" && (
                          <div className="mb-3">
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full text-xs">
                              <span className="text-orange-600 dark:text-orange-400 font-medium">
                                Atout
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {product.atout}
                            </p>
                          </div>
                        )}

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
                  <div className="text-xs text-muted-foreground mt-1">
                    {completedCount} composant(s) sélectionné(s)
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!hasSelection || isAddingToCart}
                  className="min-w-[140px]"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      Ajouter <ChevronRight />
                    </>
                  )}
                </Button>
              </div>
              {!hasSelection && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Sélectionnez au moins un composant
                </p>
              )}
              {hasSelection && !allDone && (
                <p className="text-xs text-orange-500 mt-3 text-center">
                  {stepsConfig.length - completedCount} composant(s)
                  optionnel(s) non sélectionné(s)
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