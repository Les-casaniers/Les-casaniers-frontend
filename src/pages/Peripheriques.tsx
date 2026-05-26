import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Keyboard, Mouse, Monitor, Armchair, Sparkles, Star, Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import atelierCasanier from "@/assets/atelierCasanier.jpg";
import ecranGameurSimple from "@/assets/ecranGameurSimple.png";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/service/api";

// Interface pour les produits
interface Product {
  id: number;
  categorie_id: number;
  reference: string;
  nom: string;
  description_courte: string;
  description: string;
  type_produit: string;
  prix: number;
  devise: string;
  quantite_stock: number;
  est_dispo: boolean;
  actif: boolean;
  date_creation: string;
  date_modification: string;
}

// Interface pour les catégories de périphériques
interface PeripheralCategory {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  keywords: string[]; // Mots-clés pour identifier le type de périphérique
  products: Product[];
}

const Peripheriques = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Périphériques Gaming — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Découvrez notre sélection de claviers, souris, écrans et chaises gaming pour une expérience optimale."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Récupérer les produits depuis l'API
  useEffect(() => {
    fetchPeripheriques();
  }, []);

  const fetchPeripheriques = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/produits');
      
      console.log("Réponse API périphériques:", response.data);
      
      // Extraire les produits
      let allProducts: Product[] = [];
      if (response.data.data) {
        allProducts = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        allProducts = response.data;
      } else if (response.data.produits) {
        allProducts = response.data.produits;
      } else {
        allProducts = [];
      }
      
      // Filtrer uniquement les périphériques (type_produit = 'peripherique')
      const peripheralProducts = allProducts.filter(
        (product: Product) => 
          product.type_produit === 'peripherique' && 
          product.actif === true
      );
      
      console.log("Périphériques trouvés:", peripheralProducts);
      setProducts(peripheralProducts);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement des périphériques:", error);
      setError("Impossible de charger les périphériques. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour déterminer le type de périphérique basé sur le nom et la description
  const getPeripheralType = (product: Product): string => {
    const searchText = `${product.nom} ${product.description_courte} ${product.description}`.toLowerCase();
    
    // Détection Clavier
    if (searchText.includes('clavier') || 
        searchText.includes('keyboard') ||
        searchText.includes('corsair') && searchText.includes('k') ||
        searchText.includes('logitech') && searchText.includes('g')) {
      return 'claviers';
    }
    
    // Détection Souris
    if (searchText.includes('souris') || 
        searchText.includes('mouse') ||
        searchText.includes('g502') ||
        searchText.includes('deathadder')) {
      return 'souris';
    }
    
    // Détection Écran
    if (searchText.includes('ecran') || 
        searchText.includes('écran') ||
        searchText.includes('monitor') ||
        searchText.includes('asus') && searchText.includes('vg') ||
        searchText.includes('aoc') ||
        searchText.includes('msi') ||
        searchText.includes('samsung') && searchText.includes('odyssey')) {
      return 'ecrans';
    }
    
    // Détection Chaise
    if (searchText.includes('chaise') || 
        searchText.includes('fauteuil') ||
        searchText.includes('gaming chair') ||
        searchText.includes('gtplayer') ||
        searchText.includes('secretlab') ||
        searchText.includes('cougar')) {
      return 'chaises';
    }
    
    // Par défaut, non classé
    return 'uncategorized';
  };

  // Définition des catégories de périphériques avec leurs mots-clés
  const peripheralCategories: PeripheralCategory[] = [
    {
      id: "claviers",
      name: "Claviers Gaming",
      icon: <Keyboard className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Des claviers mécaniques et membranaires pour tous les styles de jeu.",
      keywords: ["clavier", "keyboard", "mécanique", "membranaire"],
      products: []
    },
    {
      id: "souris",
      name: "Souris Gaming",
      icon: <Mouse className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Précision et rapidité pour dominer vos adversaires.",
      keywords: ["souris", "mouse", "dpi"],
      products: []
    },
    {
      id: "ecrans",
      name: "Écrans Gaming",
      icon: <Monitor className="h-8 w-8" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      description: "Des écrans haute fréquence pour une immersion totale.",
      keywords: ["ecran", "écran", "monitor", "asus", "aoc", "msi", "samsung"],
      products: []
    },
    {
      id: "chaises",
      name: "Chaises Gaming",
      icon: <Armchair className="h-8 w-8" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500",
      description: "Confort et soutien pour vos longues sessions de jeu.",
      keywords: ["chaise", "fauteuil", "gaming chair", "gtplayer", "secretlab"],
      products: []
    }
  ];

  // Fonction pour extraire les spécifications du produit
  const getProductSpecs = (product: Product) => {
    const specs: Record<string, string> = {};
    const searchText = `${product.nom} ${product.description_courte} ${product.description}`.toLowerCase();
    
    // Extraction des spécifications selon le type
    if (searchText.includes('clavier') || peripheralCategories[0].keywords.some(k => searchText.includes(k))) {
      if (searchText.includes('mécanique') || searchText.includes('mecanique')) specs.type = "Mécanique";
      else if (searchText.includes('membranaire')) specs.type = "Membranaire";
      else specs.type = "Gaming";
      
      if (searchText.includes('rgb')) specs.rgb = "RGB";
      else specs.rgb = "Standard";
      
      specs.switches = extractSpecValue(searchText, ['cherry', 'gx', 'gateron', 'razer'], 'Switches');
    }
    else if (searchText.includes('souris') || peripheralCategories[1].keywords.some(k => searchText.includes(k))) {
      specs.dpi = extractSpecValue(searchText, ['dpi'], 'DPI');
      specs.buttons = extractSpecValue(searchText, ['boutons', 'buttons'], 'Boutons');
      specs.weight = extractSpecValue(searchText, ['grammes', 'g'], 'Poids');
    }
    else if (searchText.includes('ecran') || searchText.includes('écran') || peripheralCategories[2].keywords.some(k => searchText.includes(k))) {
      specs.size = extractSpecValue(searchText, ['pouces', '"'], 'Taille');
      specs.refresh = extractSpecValue(searchText, ['hz'], 'Fréquence');
      specs.resolution = extractSpecValue(searchText, ['hd', 'fhd', 'qhd', '4k'], 'Résolution');
    }
    else if (searchText.includes('chaise') || peripheralCategories[3].keywords.some(k => searchText.includes(k))) {
      specs.type = extractSpecValue(searchText, ['bureau', 'course', 'premium'], 'Type');
      specs.maxWeight = extractSpecValue(searchText, ['kg'], 'Poids max');
    }
    
    return specs;
  };

  const extractSpecValue = (text: string, keywords: string[], label: string): string => {
    for (const keyword of keywords) {
      const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${keyword}`, 'i');
      const match = text.match(regex);
      if (match) return `${match[1]} ${keyword.toUpperCase()}`;
    }
    return "Non spécifié";
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix);
  };

  // Classer les produits dans leurs catégories respectives
  const categorizedProducts = peripheralCategories.map(category => ({
    ...category,
    products: products.filter(product => {
      const productType = getPeripheralType(product);
      return productType === category.id;
    })
  }));

  if (isLoading) {
    return (
      <SiteLayout>
        <MiniHero
          title="L'équipement pour dominer."
          description="Claviers, souris, écrans et chaises gaming | tout l'équipement nécessaire pour une expérience de jeu optimale."
          bg="4.png"
        />
        <section className="py-16">
          <div className="container-x">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-muted-foreground">Chargement des périphériques...</p>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <MiniHero
          title="L'équipement pour dominer."
          description="Claviers, souris, écrans et chaises gaming | tout l'équipement nécessaire pour une expérience de jeu optimale."
          bg="4.png"
        />
        <section className="py-16">
          <div className="container-x">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchPeripheriques}
                className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
              >
                Réessayer
              </button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <MiniHero
        title="L'équipement pour dominer."
        description="Claviers, souris, écrans et chaises gaming | tout l'équipement nécessaire pour une expérience de jeu optimale."
        bg="4.png"
      />

      {/* Sections des produits */}
      <section className="py-16">
        <div className="container-x">
          <div className="space-y-16">
            {categorizedProducts.map((category) => (
              <div
                key={category.id}
                id={category.id}
                className={`border-l-4 ${category.borderColor} bg-secondary/20 rounded-r-lg p-6 scroll-mt-20`}
              >
                {/* En-tête de catégorie */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full ${category.bgColor} ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${category.color}`}>
                      {category.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                {/* Grille des produits */}
                {category.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {category.products.map((product) => {
                      const specs = getProductSpecs(product);
                      return (
                        <div key={product.id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105 duration-300">
                          {/* Image temporaire */}
                          <div className="h-48 overflow-hidden bg-secondary">
                            <img
                              src={ecranGameurSimple}
                              alt={product.nom}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Badge */}
                          <div className="absolute mt-2 ml-2">
                            <span className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                              {product.quantite_stock > 10 ? "Top vente" : "Stock limité"}
                            </span>
                          </div>

                          {/* Infos produit */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 truncate">{product.nom}</h3>
                            <div className="space-y-1 text-sm">
                              {Object.entries(specs).map(([key, value]) => {
                                const labels: Record<string, string> = {
                                  type: "Type",
                                  switches: "Switches",
                                  rgb: "RGB",
                                  dpi: "DPI",
                                  buttons: "Boutons",
                                  weight: "Poids",
                                  size: "Taille",
                                  refresh: "Fréquence",
                                  resolution: "Résolution",
                                  adjustable: "Réglages",
                                  maxWeight: "Poids max"
                                };
                                return (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-muted-foreground text-xs">{labels[key] || key}:</span>
                                    <span className="font-medium text-xs">{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(product.prix, product.devise)}
                              </span>
                              <button 
                                className="px-3 py-1.5 text-xs bg-foreground text-background hover:opacity-90 transition rounded flex items-center gap-1"
                                disabled={product.quantite_stock === 0}
                              >
                                <Zap className="h-3 w-3" />
                                {product.quantite_stock === 0 ? "Rupture" : "Ajouter"}
                              </button>
                            </div>
                            {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                              <p className="text-xs text-orange-500 mt-2">Plus que {product.quantite_stock} en stock !</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-background/50 rounded-lg border border-dashed border-border">
                    <div className={`${category.color} mb-2 flex justify-center`}>
                      {category.icon}
                    </div>
                    <p className="text-muted-foreground">
                      Aucun produit disponible pour le moment
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revenez bientôt pour découvrir nos {category.name.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau avantage */}
      <section className="py-12 bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-y border-border">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-bold text-sm">Compatibles PC/Console</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <div className="font-bold text-sm">Livraison gratuite</div>
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold text-sm">Garantie 24 mois</div>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-bold text-sm">Paiement à la livraison</div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Peripheriques;