import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Keyboard, Mouse, Monitor, Armchair, Sparkles, Star, Zap, Loader2, Eye, ShoppingCart, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

// Couleurs des catégories
const CATEGORY_COLORS: Record<string, { gradient: string; badge: string }> = {
  claviers: { gradient: "from-purple-500 to-indigo-500", badge: "text-purple-600" },
  souris: { gradient: "from-blue-500 to-cyan-500", badge: "text-blue-600" },
  ecrans: { gradient: "from-green-500 to-emerald-500", badge: "text-green-600" },
  chaises: { gradient: "from-red-500 to-rose-500", badge: "text-red-600" },
};

const Peripheriques = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("claviers");
  const [visible, setVisible] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isModalOpen]);

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
      
      setProducts(activeProducts);
    } catch (error: any) {
      console.error("Erreur lors du chargement des périphériques:", error);
      setError("Impossible de charger les périphériques. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive"
      });
      return;
    }

    setAddingToCart(product.id);
    
    try {
      await api.post('/panier/ajouter', {
        produit_id: product.id,
        quantite: quantity,
        utilisateur_id: user?.id,
        prix_unitaire: product.prix,
        titre: product.nom
      });
      
      toast({
        title: "Ajouté au panier",
        description: `${quantity} x ${product.nom}`,
      });
    } catch (error: any) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible d'ajouter au panier",
        variant: "destructive"
      });
    } finally {
      setAddingToCart(null);
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
    { id: "claviers", name: "Claviers Gaming", icon: <Keyboard className="h-8 w-8" />, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500", description: "Des claviers mécaniques et membranaires.", referencePrefix: "CLV-", products: [] },
    { id: "souris", name: "Souris Gaming", icon: <Mouse className="h-8 w-8" />, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500", description: "Précision et rapidité pour dominer.", referencePrefix: "SR-", products: [] },
    { id: "ecrans", name: "Écrans Gaming", icon: <Monitor className="h-8 w-8" />, color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500", description: "Des écrans haute fréquence.", referencePrefix: "ECR-", products: [] },
    { id: "chaises", name: "Chaises Gaming", icon: <Armchair className="h-8 w-8" />, color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500", description: "Confort et soutien pour vos sessions.", referencePrefix: "CHS-", products: [] }
  ];

  const categorizedProducts = peripheralCategories.map(category => ({
    ...category,
    products: products.filter(product => getPeripheralCategoryByReference(product) === category.id)
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
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const getSpecs = (product: Product) => {
    if (product.description_courte && product.description_courte !== product.nom) {
      return product.description_courte;
    }
    if (product.description) {
      return product.description.length > 60 
        ? product.description.substring(0, 60) + '...' 
        : product.description;
    }
    return "Périphérique gaming haute performance";
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <MiniHero title="L'équipement pour dominer." description="Claviers, souris, écrans et chaises gaming" bg="4.png" />
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
        <MiniHero title="L'équipement pour dominer." description="..." bg="4.png" />
        <section className="py-16">
          <div className="container-x">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={fetchPeripheriques} className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90">Réessayer</button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:hidden">
            {TABS.filter(tab => nonEmptyCategories.some(cat => cat.id === tab.id)).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => switchTab(tab.id)} className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center flex items-center justify-center gap-1 ${isActive ? `${tab.color} ${tab.activeColor}` : `${tab.color} opacity-60 hover:opacity-100`}`}>
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none">
            {TABS.filter(tab => nonEmptyCategories.some(cat => cat.id === tab.id)).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => switchTab(tab.id)} className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 ${isActive ? `${tab.color} ${tab.activeColor}` : `${tab.color} opacity-60 hover:opacity-100`}`}>
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenu avec fade-up */}
      <section className="py-8">
        <div className="container-x">
          <div style={{ transition: "opacity 200ms ease, transform 200ms ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}>
            {activeCategory ? (
              <div>
                {/* En-tête compact */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[activeCategory.id]?.gradient || "from-gray-500 to-gray-600"} flex items-center justify-center`}>
                    {activeCategory.icon}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${activeCategory.color}`}>{activeCategory.name}</h2>
                    <p className="text-[10px] text-muted-foreground">{activeCategory.description}</p>
                  </div>
                  <div className="ml-auto text-[10px] text-muted-foreground">{activeCategory.products.length} produit(s)</div>
                </div>

                {/* Grille compacte */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {activeCategory.products.map((product) => {
                    const imageUrl = getProductImageUrl(product);
                    
                    return (
                      <div key={product.id} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-500/5 to-secondary/30">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">{activeCategory.icon}</div>
                          )}
                          <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full font-mono">{product.reference}</div>
                          {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-semibold rounded-full">Stock limité</span>
                          )}
                          <button onClick={() => openModal(product)} className="absolute bottom-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary">
                            <Eye className="h-3 w-3 text-white" />
                          </button>
                        </div>
                        <div className="p-2.5 space-y-1.5">
                          <h3 className="font-semibold text-xs leading-tight line-clamp-1 group-hover:text-primary transition-colors">{product.nom}</h3>
                          <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">{getSpecs(product)}</p>
                          <div className="flex items-center justify-between pt-1.5">
                            <span className="text-xs font-bold text-primary">{formatPrice(product.prix, product.devise)}</span>
                            <button onClick={() => addToCart(product, 1)} disabled={product.quantite_stock === 0 || addingToCart === product.id} className="h-6 px-2 bg-white text-black text-[9px] font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-1 border border-gray-200 shadow-sm disabled:opacity-50">
                              {addingToCart === product.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ShoppingCart className="h-2.5 w-2.5" />}
                              <span>Ajouter</span>
                            </button>
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
      <section className="py-8 bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-y border-border">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><div className="font-semibold text-xs">Compatibles PC/Console</div></div>
            <div><div className="font-semibold text-xs">Livraison gratuite</div></div>
            <div><div className="font-semibold text-xs">Garantie 24 mois</div></div>
            <div><div className="font-semibold text-xs">Paiement à la livraison</div></div>
          </div>
        </div>
      </section>

      {/* Modal avec Portal */}
      {isModalOpen && selectedProduct && createPortal(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]" onClick={closeModal} />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="bg-background rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-up" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-background border-b border-border/50 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[activeTab]?.gradient || "from-gray-500 to-gray-600"} flex items-center justify-center`}>
                    {activeCategory?.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold line-clamp-1">{selectedProduct.nom}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{selectedProduct.reference}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
                <div className="space-y-3">
                  <div className="aspect-video bg-secondary/30 rounded-lg overflow-hidden">
                    {getProductImageUrl(selectedProduct) ? (
                      <img src={getProductImageUrl(selectedProduct)!} alt={selectedProduct.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">{activeCategory?.icon}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <h4 className="font-semibold text-[10px] text-primary mb-1.5 uppercase tracking-wider">Informations</h4>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Référence :</span><span className="font-medium font-mono">{selectedProduct.reference}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Stock :</span><span className="font-medium">{selectedProduct.quantite_stock > 0 ? `${selectedProduct.quantite_stock} unités` : 'Rupture'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Disponibilité :</span><span className={`font-medium ${selectedProduct.est_dispo ? 'text-green-600' : 'text-red-600'}`}>{selectedProduct.est_dispo ? 'Disponible' : 'Indisponible'}</span></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <h4 className="font-semibold text-[10px] text-primary mb-1.5 uppercase tracking-wider">Caractéristiques</h4>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Type :</span><span className="font-medium">{activeCategory?.name}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Catégorie :</span><span className="font-medium">Périphérique Gaming</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <h4 className="font-semibold text-[10px] text-primary mb-1.5 uppercase tracking-wider">Description</h4>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{selectedProduct.description || selectedProduct.description_courte || "Aucune description disponible"}</p>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-background border-t border-border/50 p-3 flex gap-2">
                <div className="flex-1"><div className="text-[9px] text-muted-foreground">Prix total</div><div className="font-bold text-sm text-primary">{formatPrice(selectedProduct.prix, selectedProduct.devise)}</div></div>
                <button onClick={closeModal} className="px-4 py-1.5 border border-border rounded-lg text-xs hover:bg-secondary transition-colors">Fermer</button>
                <button onClick={() => addToCart(selectedProduct, 1)} disabled={selectedProduct.quantite_stock === 0} className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 border border-gray-200 disabled:opacity-50">
                  <ShoppingCart className="h-3 w-3" /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <style>{`
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up { animation: scale-up 0.25s ease-out; }
      `}</style>
    </SiteLayout>
  );
};

export default Peripheriques;