import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Cpu, Gamepad, MemoryStick, HardDrive, CircuitBoard, Zap, Server, Loader2 } from "lucide-react";
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
  keywords: string[]; // Mots-clés pour identifier le type de composant
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
      
      const response = await api.get('/produits');
      
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
      
      // Filtrer uniquement les composants (type_produit = 'composant')
      const componentProducts = allProducts.filter(
        (product: Product) => 
          product.type_produit === 'composant' && 
          product.actif === true
      );
      
      console.log("Composants trouvés:", componentProducts);
      setProducts(componentProducts);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement des composants:", error);
      setError("Impossible de charger les composants. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour déterminer le type de composant basé sur le nom et la description
  const getComponentType = (product: Product): string => {
    const searchText = `${product.nom} ${product.description_courte} ${product.description}`.toLowerCase();
    
    // Détection CPU / Processeur
    if (searchText.includes('cpu') || 
        searchText.includes('core') || 
        searchText.includes('ryzen') || 
        searchText.includes('processeur') ||
        searchText.includes('intel') ||
        searchText.includes('amd') ||
        (searchText.includes('i3') || searchText.includes('i5') || searchText.includes('i7') || searchText.includes('i9')) ||
        searchText.includes('threadripper')) {
      return 'cpu';
    }
    
    // Détection GPU / Carte graphique
    if (searchText.includes('gpu') || 
        searchText.includes('rtx') || 
        searchText.includes('gtx') || 
        searchText.includes('radeon') ||
        searchText.includes('carte graphique') ||
        searchText.includes('graphics') ||
        searchText.includes('geforce') ||
        searchText.includes('rx')) {
      return 'gpu';
    }
    
    // Détection RAM / Mémoire
    if (searchText.includes('ram') || 
        searchText.includes('ddr') || 
        searchText.includes('mémoire') ||
        searchText.includes('memory') ||
        searchText.includes('go ram') ||
        searchText.includes('gb ram')) {
      return 'ram';
    }
    
    // Détection Stockage / Disque dur / SSD
    if (searchText.includes('ssd') || 
        searchText.includes('hdd') || 
        searchText.includes('disque') ||
        searchText.includes('stockage') ||
        searchText.includes('nvme') ||
        searchText.includes('tera') ||
        searchText.includes('go') && (searchText.includes('stockage') || searchText.includes('disque')) ||
        searchText.includes('sata')) {
      return 'storage';
    }
    
    // Détection Carte mère
    if (searchText.includes('carte mère') || 
        searchText.includes('motherboard') ||
        searchText.includes('z790') ||
        searchText.includes('b650') ||
        searchText.includes('chipset') ||
        searchText.includes('socket')) {
      return 'motherboard';
    }
    
    // Par défaut, non classé
    return 'uncategorized';
  };

  // Définition des catégories de composants avec leurs mots-clés
  const componentCategories: ComponentCategory[] = [
    {
      id: "cpu",
      name: "CPU / Processeurs",
      icon: <Cpu className="h-8 w-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      description: "Le cerveau de votre ordinateur. Performances et rapidité d'exécution.",
      keywords: ["cpu", "processeur", "core", "ryzen", "intel", "amd", "i3", "i5", "i7", "i9", "threadripper"],
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
      keywords: ["gpu", "rtx", "gtx", "radeon", "carte graphique", "graphics", "geforce", "rx"],
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
      keywords: ["ram", "ddr", "mémoire", "memory"],
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
      keywords: ["ssd", "hdd", "disque", "stockage", "nvme", "sata", "tera", "go"],
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
      keywords: ["carte mère", "motherboard", "chipset", "socket", "z790", "b650", "b760", "x670"],
      products: []
    }
  ];

  // Classer les produits dans leurs catégories respectives
  const categorizedProducts = componentCategories.map(category => ({
    ...category,
    products: products.filter(product => {
      const productType = getComponentType(product);
      return productType === category.id;
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
            <Zap className="h-8 w-8 text-yellow-500" />
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de composants haute performance pour assembler ou améliorer votre PC.
            CPU, GPU, RAM, stockage et cartes mères : tout ce qu'il vous faut.
          </p>
        </div>

        <div className="space-y-12">
          {/* Afficher TOUTES les catégories, même vides */}
          {componentCategories.map((category) => {
            const categoryProducts = products.filter(product => {
              const productType = getComponentType(product);
              return productType === category.id;
            });

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
                  </div>
                </div>

                {/* Grille des produits ou message vide */}
                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="border border-border rounded-lg p-4 hover:bg-background hover:shadow-lg transition-all">
                        <h4 className="font-bold text-lg mb-2 line-clamp-1">{product.nom}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {getSpecs(product)}
                        </p>
                        <div className="text-xs text-muted-foreground mb-2">
                          Réf: {product.reference}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary">
                              {formatPrice(product.prix, product.devise)}
                            </span>
                            {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                              <p className="text-xs text-orange-500">Plus que {product.quantite_stock}</p>
                            )}
                            {product.quantite_stock === 0 && (
                              <p className="text-xs text-red-500">Rupture de stock</p>
                            )}
                          </div>
                          <button 
                            className="px-3 py-1.5 text-sm bg-foreground text-background hover:opacity-90 transition rounded"
                            disabled={product.quantite_stock === 0}
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 mt-4 bg-background/50 rounded-lg border border-dashed border-border">
                    <div className={`${category.color} mb-2`}>
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
            );
          })}
        </div>
      </div>
    </section>
  </SiteLayout>
);
};

export default Composants;