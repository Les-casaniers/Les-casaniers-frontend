import { Droplet, Eye, ShoppingCart, X, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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

export const WatercoolingCustom = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchWatercoolingProducts();
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (.current) {
      observer.observe(.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const fetchWatercoolingProducts = async () => {
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
      
      const clProducts = allProducts.filter(
        (product: Product) => 
          product.reference && 
          product.reference.startsWith('CL-') && 
          product.actif === true
      );
      
      console.log("Produits CL- (Watercooling) trouvés:", clProducts);
      setProducts(clProducts);
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      setError(`Impossible de charger les produits: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
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
      type: extractFromDescription(product.description, 'Type', 'Kit', 'Type de refroidissement'),
      compatibility: extractFromDescription(product.description, 'Compatible', 'Compatibilité', 'Socket', 'Supporté'),
      radiator: extractFromDescription(product.description, 'Radiateur', 'Rad', 'Taille radiateur', 'Radiator'),
      pump: extractFromDescription(product.description, 'Pompe', 'Pump', 'Type de pompe'),
      material: extractFromDescription(product.description, 'Matériau', 'Material', 'Tube', 'Tuyau')
    };
  };

  const extractFromDescription = (description: string, ...keywords: string[]) => {
    if (!description) return 'Non spécifié';
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[\\s:]*([^\\n,]+)`, 'i');
      const match = description.match(regex);
      if (match) return match[1].trim();
    }
    return 'Non spécifié';
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive"
      });
      navigate("/connexion");
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
      <section ref={sectionRef} className="py-12 bg-secondary/30">
        <div className="container-x">
          <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-64 bg-secondary animate-pulse rounded-lg" />
            <div className="h-10 w-32 bg-secondary animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-4 bg-secondary rounded w-5/6" />
                  <div className="h-4 bg-secondary rounded w-4/6" />
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
      <section className="py-12 bg-secondary/30">
        <div className="container-x">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Droplet className="h-8 w-8 text-cyan-500" />
            Watercooling Custom
          </h2>
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchWatercoolingProducts}
              className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
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
      <section className="py-12 bg-secondary/30">
        <div className="container-x">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Droplet className="h-8 w-8 text-cyan-500" />
            Watercooling Custom
          </h2>
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-12 text-center">
            <p className="text-yellow-600 dark:text-yellow-400">
              Aucun produit watercooling avec référence CL- disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vérifiez que des produits avec référence commençant par "CL-" existent dans la base.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={sectionRef} className="py-12 bg-secondary/30">
        <div className="container-x">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const imageUrl = getImageUrl(product);
              
              return (
                <div 
                  key={product.id} 
                  className={`group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1
                    ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`}
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-cyan-500/10 to-secondary">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.nom} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Droplet className="h-16 w-16 text-cyan-500/30" />
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
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold line-clamp-1 group-hover:text-cyan-600 transition-colors">
                        {product.nom}
                      </h3>
                      
                      <button
                        onClick={() => openModal(product)}
                        className="flex-shrink-0 p-1.5 bg-cyan-500/10 hover:bg-cyan-600 rounded-lg transition-all duration-300 hover:scale-110 group/eye"
                      >
                        <Eye className="h-4 w-4 text-cyan-600 group-hover/eye:text-white transition-colors" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description_courte || product.description?.substring(0, 100) || "Système de refroidissement liquide haute performance"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold text-cyan-600">
                          {formatPrice(product.prix, product.devise)}
                        </span>
                        {product.quantite_stock === 0 && (
                          <p className="text-xs text-red-500 mt-1">Rupture de stock</p>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product, 1)}
                        disabled={product.quantite_stock === 0 || addingToCart === product.id}
                        className="bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-1.5 text-sm font-medium border border-gray-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5" />
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
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-up {
            animation: fade-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          }
        `}</style>
      </section>

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Droplet className="h-6 w-6 text-cyan-500" />
                <div>
                  <h3 className="text-xl font-bold">{selectedProduct.nom}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedProduct.reference}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-cyan-600">Caractéristiques techniques</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Compatibilité :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).compatibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Radiateur :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).radiator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pompe :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).pump}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-cyan-600">Informations produit</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Matériau :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Stock :</span>
                        <span className="text-sm font-medium">
                          {selectedProduct.quantite_stock > 0 ? `${selectedProduct.quantite_stock} unités` : 'Rupture de stock'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Disponibilité :</span>
                        <span className={`text-sm font-medium ${selectedProduct.est_dispo ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.est_dispo ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                      <div className="flex justify-between mt-3 pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Prix :</span>
                        <span className="text-lg font-bold text-cyan-600">{formatPrice(selectedProduct.prix, selectedProduct.devise)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-cyan-600">Description</h4>
                  <p className="text-sm text-foreground">{selectedProduct.description || selectedProduct.description_courte || "Aucune description disponible"}</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
                Fermer
              </button>
              <button
                onClick={() => addToCart(selectedProduct, 1)}
                disabled={selectedProduct.quantite_stock === 0}
                className="flex-1 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
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
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
      `}</style>
    </>
  );
};
