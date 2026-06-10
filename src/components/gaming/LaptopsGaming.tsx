import { Laptop, Battery, Weight, Eye, Cpu, Zap, ShoppingCart, X, Loader2, Settings, ChevronRight, Star, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

interface Configuration {
  id: number;
  produit_id: number;
  utilisateur_id: number;
  nom_configuration: string;
  nom_configuration_autre: string | null;
  devise: string;
  prix_total: number;
  composants_json: any;
  date_creation: string;
  date_modification: string;
}

export const LaptopsGaming = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchLaptops();
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

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

  const fetchLaptops = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/produits', {
        params: { per_page: 1000 }
      });
      
      let allProducts = [];
      if (response.data.data) {
        allProducts = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        allProducts = response.data;
      } else {
        allProducts = [];
      }
      
      const pcProducts = allProducts.filter(
        (product: Product) => 
          product.reference && 
          product.reference.startsWith('PC-') && 
          product.actif === true
      );
      
      console.log("Produits PC- trouvés:", pcProducts);
      setProducts(pcProducts);
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      setError(`Impossible de charger les produits: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigurations = async (produitId: number) => {
    try {
      setIsLoadingConfigs(true);
      
      const response = await api.get('/configurations');
      
      let allConfigs: Configuration[] = [];
      if (response.data.data) {
        allConfigs = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        allConfigs = response.data;
      } else {
        allConfigs = [];
      }
      
      const filteredConfigs = allConfigs.filter(
        (config: Configuration) => Number(config.produit_id) === Number(produitId)
      );
      
      setConfigurations(filteredConfigs);
    } catch (error) {
      console.error("Erreur chargement configurations:", error);
      setConfigurations([]);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const getImageUrl = (product: Product) => {
    const images = product.images || [];
    if (images.length === 0) return null;
    const mainImage = images.find(img => img.ordre === 0) || images[0];
    if (mainImage?.url) {
      if (mainImage.url.startsWith('/storage')) {
        return `http://127.0.0.1:8000${mainImage.url}`;
      }
      return mainImage.url;
    }
    return null;
  };

  const extractSpecs = (product: Product) => {
    return {
      screen: extractFromDescription(product.description, 'Écran', 'Ecran', 'Taille'),
      processor: extractFromDescription(product.description, 'Processeur', 'CPU'),
      gpu: extractFromDescription(product.description, 'GPU', 'Carte graphique'),
      ram: extractFromDescription(product.description, 'RAM', 'Mémoire'),
      storage: extractFromDescription(product.description, 'Stockage', 'SSD', 'Disque'),
      battery: extractFromDescription(product.description, 'Batterie', 'Autonomie'),
      weight: extractFromDescription(product.description, 'Poids', 'Weight')
    };
  };

  const extractFromDescription = (description: string, ...keywords: string[]) => {
    if (!description) return '—';
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[\\s:]*([^\\n,]+)`, 'i');
      const match = description.match(regex);
      if (match) return match[1].trim();
    }
    return '—';
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive"
      });
      navigate("/login");
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

  const openModal = async (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    await fetchConfigurations(product.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setConfigurations([]);
  };

  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-8 bg-secondary/20">
        <div className="container-x">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-6 bg-secondary animate-pulse rounded-full" />
            <div className="h-6 w-32 bg-secondary animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-secondary/50" />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2 bg-secondary rounded w-full" />
                  <div className="h-2 bg-secondary rounded w-5/6" />
                  <div className="h-4 bg-secondary rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-secondary/20">
        <div className="container-x">
          <div className="flex items-center gap-2 mb-5">
            <Laptop className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold">Laptops Gaming</h2>
          </div>
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button 
              onClick={fetchLaptops}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-8 bg-secondary/20">
        <div className="container-x">
          <div className="flex items-center gap-2 mb-5">
            <Laptop className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold">Laptops Gaming</h2>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6 text-center">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">
              Aucun laptop disponible pour le moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={sectionRef} className="py-8 bg-secondary/20">
        <div className="container-x">
          {/* En-tête compact */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Laptop className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold">Laptops Gaming</h2>
                <p className="text-[10px] text-muted-foreground">Puissance et mobilité pour vos jeux</p>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {products.length} produit(s)
            </div>
          </div>

          {/* Grille compacte */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product, index) => {
              const imageUrl = getImageUrl(product);
              const specs = extractSpecs(product);
              
              return (
                <div 
                  key={product.id} 
                  className={`group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                    ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-5'}`}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-500/5 to-secondary/30">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.nom} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Laptop className="h-8 w-8 text-blue-500/20" />
                      </div>
                    )}
                    
                    {/* Badge référence */}
                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full font-mono">
                      {product.reference}
                    </div>
                    
                    {/* Stock badge */}
                    {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-semibold rounded-full">
                        Stock limité
                      </span>
                    )}
                    
                    {/* Bouton œil */}
                    <button
                      onClick={() => openModal(product)}
                      className="absolute bottom-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-600"
                    >
                      <Eye className="h-3 w-3 text-white" />
                    </button>
                  </div>

                  {/* Contenu compact */}
                  <div className="p-2.5 space-y-1.5">
                    <h3 className="font-semibold text-xs leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.nom}
                    </h3>
                    
                    <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {product.description_courte || product.description?.substring(0, 60) || "Laptop gaming haute performance"}
                    </p>
                    
                    {/* Spécifications rapides */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {specs.processor !== '—' && (
                        <span className="text-[8px] bg-secondary/50 px-1.5 py-0.5 rounded-full text-muted-foreground flex items-center gap-0.5">
                          <Cpu className="h-2 w-2" /> {specs.processor.slice(0, 12)}
                        </span>
                      )}
                      {specs.ram !== '—' && (
                        <span className="text-[8px] bg-secondary/50 px-1.5 py-0.5 rounded-full text-muted-foreground">
                          {specs.ram}
                        </span>
                      )}
                    </div>
                    
                    {/* Prix et ajout */}
                    <div className="flex items-center justify-between pt-1.5">
                      <div>
                        <span className="text-xs font-bold text-blue-600">
                          {formatPrice(product.prix, product.devise)}
                        </span>
                        {product.quantite_stock === 0 && (
                          <p className="text-[8px] text-red-500">Rupture</p>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product, 1)}
                        disabled={product.quantite_stock === 0 || addingToCart === product.id}
                        className="h-6 px-2 bg-white text-black text-[9px] font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-1 border border-gray-200 shadow-sm disabled:opacity-50"
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-2.5 w-2.5" />
                        )}
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-up {
            animation: fade-up 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          }
        `}</style>
      </section>

      {/* Modal avec Portal */}
      {isModalOpen && selectedProduct && createPortal(
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
            onClick={closeModal}
          />
          
          {/* Modal container */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
              className="bg-background rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header compact */}
              <div className="sticky top-0 bg-background border-b border-border/50 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Laptop className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold line-clamp-1">{selectedProduct.nom}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{selectedProduct.reference}</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
                <div className="space-y-3">
                  {/* Image */}
                  <div className="aspect-video bg-secondary/30 rounded-lg overflow-hidden">
                    {getImageUrl(selectedProduct) ? (
                      <img 
                        src={getImageUrl(selectedProduct)!} 
                        alt={selectedProduct.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Laptop className="h-12 w-12 text-blue-500/30" />
                      </div>
                    )}
                  </div>

                  {/* Spécifications */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <h4 className="font-semibold text-[10px] text-blue-600 mb-1.5 uppercase tracking-wider">Caractéristiques</h4>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processeur :</span>
                          <span className="font-medium">{extractSpecs(selectedProduct).processor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GPU :</span>
                          <span className="font-medium text-right">{extractSpecs(selectedProduct).gpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RAM :</span>
                          <span className="font-medium">{extractSpecs(selectedProduct).ram}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stockage :</span>
                          <span className="font-medium">{extractSpecs(selectedProduct).storage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Écran :</span>
                          <span className="font-medium">{extractSpecs(selectedProduct).screen}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-2">
                      <h4 className="font-semibold text-[10px] text-blue-600 mb-1.5 uppercase tracking-wider">Informations</h4>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batterie :</span>
                          <span className="font-medium">{extractSpecs(selectedProduct).battery}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Poids :</span>
                          <span className="font-medium">{extractSpecs(selectedProduct).weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock :</span>
                          <span className="font-medium">{selectedProduct.quantite_stock > 0 ? `${selectedProduct.quantite_stock} unités` : 'Rupture'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disponibilité :</span>
                          <span className={`font-medium ${selectedProduct.est_dispo ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedProduct.est_dispo ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configurations */}
                  {isLoadingConfigs ? (
                    <div className="bg-secondary/30 rounded-lg p-3 flex justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  ) : configurations.length > 0 && (
                    <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Settings className="h-3.5 w-3.5 text-blue-500" />
                        <h4 className="font-semibold text-[10px] text-blue-600 uppercase tracking-wider">Configurations disponibles</h4>
                      </div>
                      <div className="space-y-1.5">
                        {configurations.map((config) => (
                          <div key={config.id} className="flex justify-between items-center text-[10px] border-b border-border/30 pb-1 last:border-0">
                            <span className="font-medium">{config.nom_configuration}</span>
                            <span className="font-bold text-blue-600">{formatPrice(config.prix_total, config.devise)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
                    <h4 className="font-semibold text-[10px] text-blue-600 mb-1.5 uppercase tracking-wider">Description</h4>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {selectedProduct.description || selectedProduct.description_courte || "Aucune description disponible"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer compact */}
              <div className="sticky bottom-0 bg-background border-t border-border/50 p-3 flex gap-2">
                <div className="flex-1">
                  <div className="text-[9px] text-muted-foreground">Prix total</div>
                  <div className="font-bold text-sm text-blue-600">{formatPrice(selectedProduct.prix, selectedProduct.devise)}</div>
                </div>
                <button 
                  onClick={closeModal} 
                  className="px-4 py-1.5 border border-border rounded-lg text-xs hover:bg-secondary transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => addToCart(selectedProduct, 1)}
                  disabled={selectedProduct.quantite_stock === 0}
                  className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 border border-gray-200 disabled:opacity-50"
                >
                  <ShoppingCart className="h-3 w-3" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-up { animation: scale-up 0.25s ease-out; }
      `}</style>
    </>
  );
};