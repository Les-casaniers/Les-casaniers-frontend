import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Keyboard, Mouse, Monitor, Armchair, Sparkles, Star, Zap, Loader2, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
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
  images?: { id: number; url: string; alt: string; ordre: number }[];
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
  referencePrefix: string;
  products: Product[];
}

type TabId = "claviers" | "souris" | "ecrans" | "chaises";

// Configuration des onglets
const TABS: { id: TabId; label: string; color: string; activeColor: string; icon: JSX.Element }[] = [
  {
    id: "claviers",
    label: "Claviers Gaming",
    color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10",
    activeColor: "bg-purple-500/10 border-purple-500/60",
    icon: <Keyboard className="h-3.5 w-3.5" />,
  },
  {
    id: "souris",
    label: "Souris Gaming",
    color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10",
    activeColor: "bg-blue-500/10 border-blue-500/60",
    icon: <Mouse className="h-3.5 w-3.5" />,
  },
  {
    id: "ecrans",
    label: "Écrans Gaming",
    color: "text-green-500 border-green-500/30 hover:bg-green-500/10",
    activeColor: "bg-green-500/10 border-green-500/60",
    icon: <Monitor className="h-3.5 w-3.5" />,
  },
  {
    id: "chaises",
    label: "Chaises Gaming",
    color: "text-red-500 border-red-500/30 hover:bg-red-500/10",
    activeColor: "bg-red-500/10 border-red-500/60",
    icon: <Armchair className="h-3.5 w-3.5" />,
  },
];

const Peripheriques = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("claviers");
  const [visible, setVisible] = useState(true);

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

  useEffect(() => {
    fetchPeripheriques();
  }, []);

  const fetchPeripheriques = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/produits', {
        params: { per_page: 1000 }
      });
      
      console.log("Réponse API périphériques:", response.data);
      
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
      
      const activeProducts = allProducts.filter(
        (product: Product) => product.actif === true
      );
      
      console.log("Produits actifs trouvés:", activeProducts);
      setProducts(activeProducts);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement des périphériques:", error);
      setError("Impossible de charger les périphériques. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPeripheralCategoryByReference = (product: Product): string => {
    const reference = product.reference || '';
    
    if (reference.startsWith('CLV-')) return 'claviers';
    if (reference.startsWith('SR-')) return 'souris';
    if (reference.startsWith('ECR-')) return 'ecrans';
    if (reference.startsWith('CHS-')) return 'chaises';
    
    return 'uncategorized';
  };

  const getProductImageUrl = (product: Product) => {
    const images = product.images || [];
    if (images.length === 0) return null;
    
    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return null;
    
    if (mainImage.url.startsWith('/storage')) {
      return `http://127.0.0.1:8000${mainImage.url}`;
    }
    
    return mainImage.url;
  };

  const peripheralCategories: PeripheralCategory[] = [
    {
      id: "claviers",
      name: "Claviers Gaming",
      icon: <Keyboard className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Des claviers mécaniques et membranaires pour tous les styles de jeu.",
      referencePrefix: "CLV-",
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
      referencePrefix: "SR-",
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
      referencePrefix: "ECR-",
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
      referencePrefix: "CHS-",
      products: []
    }
  ];

  const categorizedProducts = peripheralCategories.map(category => ({
    ...category,
    products: products.filter(product => {
      const productCategory = getPeripheralCategoryByReference(product);
      return productCategory === category.id;
    })
  }));

  const switchTab = (id: TabId) => {
    if (id === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(id);
      setVisible(true);
    }, 200);
  };

  const nonEmptyCategories = categorizedProducts.filter(cat => cat.products.length > 0);
  const activeCategory = nonEmptyCategories.find(cat => cat.id === activeTab);

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix);
  };

  const getSpecs = (product: Product) => {
    if (product.description_courte && product.description_courte !== product.nom) {
      return product.description_courte;
    }
    if (product.description) {
      return product.description.length > 100 
        ? product.description.substring(0, 100) + '...' 
        : product.description;
    }
    return "Périphérique gaming haute performance";
  };

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
      <MiniHero
        title="L'équipement pour dominer."
        description="Claviers, souris, écrans et chaises gaming | tout l'équipement nécessaire pour une expérience de jeu optimale."
        bg="4.png"
      />

      {/* Barre de navigation */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-x py-3">
          {/* Mobile : grille */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:hidden">
            {TABS.filter(tab => nonEmptyCategories.some(cat => cat.id === tab.id)).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center flex items-center justify-center gap-1 ${
                    isActive
                      ? `${tab.color} ${tab.activeColor}`
                      : `${tab.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop : ligne */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            {TABS.filter(tab => nonEmptyCategories.some(cat => cat.id === tab.id)).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                    isActive
                      ? `${tab.color} ${tab.activeColor}`
                      : `${tab.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenu avec fade-up */}
      <section className="py-16">
        <div className="container-x">
          <div
            style={{
              transition: "opacity 200ms ease, transform 200ms ease",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
            }}
          >
            {activeCategory ? (
              <div
                key={activeCategory.id}
                id={activeCategory.id}
                className={`border-l-4 ${activeCategory.borderColor} bg-secondary/20 rounded-r-lg p-6 scroll-mt-20`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full ${activeCategory.bgColor} ${activeCategory.color}`}>
                    {activeCategory.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${activeCategory.color}`}>
                      {activeCategory.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{activeCategory.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeCategory.products.length} produit(s) disponible(s)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {activeCategory.products.map((product) => {
                    const imageUrl = getProductImageUrl(product);
                    
                    return (
                      <div 
                        key={product.id} 
                        className="group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-500/10 to-secondary">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.nom} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {activeCategory.icon}
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-mono">
                            {product.reference}
                          </div>
                          
                          {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full">
                              Stock limité
                            </span>
                          )}
                          {product.quantite_stock === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-semibold rounded-full">
                              Rupture
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                            {product.nom}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {getSpecs(product)}
                          </p>
                          
                          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(product.prix, product.devise)}
                              </span>
                            </div>
                            <Link to={`/produit/${product.id}`}>
                              <button 
                                className="px-3 py-1.5 text-sm bg-foreground text-background hover:opacity-90 transition rounded-lg flex items-center gap-1"
                                disabled={product.quantite_stock === 0}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Voir</span>
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-background rounded-xl border border-border">
                <Keyboard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun périphérique disponible dans cette catégorie.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bandeau avantage */}
      <section className="py-12 bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-y border-border">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-bold text-sm">Compatibles PC/Console</div>
            </div>
            <div>
              <div className="font-bold text-sm">Livraison gratuite</div>
            </div>
            <div>
              <div className="font-bold text-sm">Garantie 24 mois</div>
            </div>
            <div>
              <div className="font-bold text-sm">Paiement à la livraison</div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Peripheriques;