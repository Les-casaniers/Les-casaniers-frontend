import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Cpu, Gamepad, MemoryStick, HardDrive, CircuitBoard, Zap, Server, Loader2, Eye, ShoppingCart } from "lucide-react";
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

// Interface pour les catégories de composants
interface ComponentCategory {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  referencePrefix: string; // Préfixe de référence
  products: Product[];
}

const Composants = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Composants PC — Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    meta.setAttribute(
      "content",
      "CPU, GPU, RAM, Stockage et Cartes mères : tous les composants PC pour assembler ou améliorer votre ordinateur à Madagascar."
    );
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  // Récupérer les produits depuis l'API
  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/produits', {
        params: { per_page: 1000 }
      });
      
      console.log("Réponse API complète:", response.data);
      
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
      
      // Filtrer les produits actifs
      const activeProducts = allProducts.filter(
        (product: Product) => product.actif === true
      );
      
      console.log("Produits actifs trouvés:", activeProducts);
      setProducts(activeProducts);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement des composants:", error);
      setError("Impossible de charger les composants. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour déterminer la catégorie basée sur la référence
  const getComponentCategoryByReference = (product: Product): string => {
    const reference = product.reference || '';
    
    if (reference.startsWith('CPU-')) return 'cpu';
    if (reference.startsWith('RAM-')) return 'ram';
    if (reference.startsWith('MB-')) return 'motherboard';
    if (reference.startsWith('SD-')) return 'storage';
    if (reference.startsWith('GPU-')) return 'gpu';
    
    return 'uncategorized';
  };

  // Fonction pour obtenir l'URL de l'image principale d'un produit
  const getProductImageUrl = (product: Product) => {
    const images = product.images || [];
    if (images.length === 0) return null;
    
    const mainImage = images.find((img: any) => img.ordre === 0) || images[0];
    if (!mainImage?.url) return null;
    
    // Si l'URL commence par /storage, ajouter le domaine
    if (mainImage.url.startsWith('/storage')) {
      return `http://127.0.0.1:8000${mainImage.url}`;
    }
    
    return mainImage.url;
  };

  // Définition des catégories de composants avec leurs préfixes de référence
  const componentCategories: ComponentCategory[] = [
    {
      id: "cpu",
      name: "CPU / Processeurs",
      icon: <Cpu className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Le cerveau de votre ordinateur. Performances et rapidité d'exécution.",
      referencePrefix: "CPU-",
      products: []
    },
    {
      id: "gpu",
      name: "GPU / Cartes graphiques",
      icon: <Gamepad className="h-8 w-8" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      description: "Carte graphique pour le gaming et la création.",
      referencePrefix: "GPU-",
      products: []
    },
    {
      id: "ram",
      name: "RAM / Mémoire",
      icon: <MemoryStick className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      description: "Mémoire vive pour le multitâche et la réactivité.",
      referencePrefix: "RAM-",
      products: []
    },
    {
      id: "storage",
      name: "Stockage / SSD & HDD",
      icon: <HardDrive className="h-8 w-8" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500",
      description: "SSD et HDD pour vos données et applications.",
      referencePrefix: "SD-",
      products: []
    },
    {
      id: "motherboard",
      name: "Cartes mères",
      icon: <CircuitBoard className="h-8 w-8" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500",
      description: "La base de votre configuration, compatible avec vos composants.",
      referencePrefix: "MB-",
      products: []
    }
  ];

  // Classer les produits dans leurs catégories respectives
  const categorizedProducts = componentCategories.map(category => ({
    ...category,
    products: products.filter(product => {
      const productCategory = getComponentCategoryByReference(product);
      return productCategory === category.id;
    })
  }));

  // Filtrer les catégories qui ont des produits
  const nonEmptyCategories = categorizedProducts.filter(cat => cat.products.length > 0);

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix);
  };

  // Extraire les spécifications de la description
  const getSpecs = (product: Product) => {
    if (product.description_courte && product.description_courte !== product.nom) {
      return product.description_courte;
    }
    if (product.description) {
      return product.description.length > 100 
        ? product.description.substring(0, 100) + '...' 
        : product.description;
    }
    return "Composant haute performance";
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <MiniHero
          title="Tous les composants pour votre PC."
          description="Des processeurs aux cartes mères, en passant par les cartes graphiques et la RAM, trouvez tout ce qu'il vous faut pour une configuration sur mesure."
          bg="7.png"
        />
        <section className="py-12">
          <div className="container-x">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-muted-foreground">Chargement des composants...</p>
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
          title="Tous les composants pour votre PC."
          description="Des processeurs aux cartes mères, en passant par les cartes graphiques et la RAM, trouvez tout ce qu'il vous faut pour une configuration sur mesure."
          bg="7.png"
        />
        <section className="py-12">
          <div className="container-x">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchComponents}
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
        title="Tous les composants pour votre PC."
        description="Des processeurs aux cartes mères, en passant par les cartes graphiques et la RAM, trouvez tout ce qu'il vous faut pour une configuration sur mesure."
        bg="7.png"
      />

      <section id="composants" className="py-12 scroll-mt-20">
        <div className="container-x">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Server className="h-8 w-8 text-yellow-500" />
              Nos Composants
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection de composants haute performance pour assembler ou améliorer votre PC.
              CPU, GPU, RAM, stockage et cartes mères : tout ce qu'il vous faut.
            </p>
          </div>

          <div className="space-y-12">
            {/* Afficher les catégories avec des produits */}
            {nonEmptyCategories.map((category) => {
              return (
                <div
                  key={category.id}
                  id={category.id}
                  className={`border-l-4 ${category.borderColor} bg-secondary/20 rounded-r-lg p-6 hover:shadow-lg transition-shadow`}
                >
                  {/* En-tête de catégorie */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${category.bgColor} ${category.color}`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${category.color}`}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.products.length} produit(s) disponible(s)
                      </p>
                    </div>
                  </div>

                  {/* Grille des produits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {category.products.map((product) => {
                      const imageUrl = getProductImageUrl(product);
                      
                      return (
                        <div 
                          key={product.id} 
                          className="group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                        >
                          {/* Image section */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-500/10 to-secondary">
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={product.nom} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {category.icon}
                              </div>
                            )}
                            
                            {/* Badge référence */}
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

                          {/* Content */}
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
              );
            })}
          </div>

          {/* Message si aucun produit dans aucune catégorie */}
          {nonEmptyCategories.length === 0 && (
            <div className="text-center py-20 bg-background rounded-xl border border-border">
              <Server className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun composant disponible pour le moment.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Vérifiez que des produits avec les références CPU-, RAM-, MB-, SD-, GPU- existent dans la base.
              </p>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Composants;