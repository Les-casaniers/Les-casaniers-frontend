import { Link } from "react-router-dom";
import { Star, ArrowUpRight, Volume2, VolumeX, X } from "lucide-react";
import { formatAr } from "@/lib/products";
import mascot from "@/assets/casaniers-mascot.png";
import { useState, useRef, useEffect } from "react";
import api from "@/service/api";

interface Product {
  id: number;
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
  images?: { id: number; url: string; alt: string; ordre: number }[];
  categorie?: { id: number; nom: string };
}

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Récupérer les produits exception depuis l'API
  useEffect(() => {
    fetchExceptionProducts();
  }, []);

  const fetchExceptionProducts = async () => {
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
      
      // Filtrer les produits avec référence commençant par "EXP-" et actifs
      const expProducts = allProducts.filter(
        (product: Product) => 
          product.reference && 
          product.reference.startsWith('EXP-') && 
          product.actif === true
      );
      
      console.log("Produits EXP- trouvés:", expProducts);
      setProducts(expProducts);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement des produits exception:", error);
      setError("Impossible de charger les produits d'exception.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir l'URL de l'image principale d'un produit
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

  // Obtenir les 4 premiers produits
  const topProducts = products.slice(0, 4);

  // Format du prix (utilise la fonction existante formatAr ou crée une)
  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  // Déterminer le badge en fonction du stock ou du prix
  const getProductBadge = (product: Product) => {
    if (product.quantite_stock <= 2 && product.quantite_stock > 0) return "Dernière pièce";
    if (product.quantite_stock === 0) return "Rupture";
    if (product.prix >= 5000000) return "Premium";
    return "Exception";
  };

  // Déterminer la catégorie affichée
  const getProductCategory = (product: Product) => {
    if (product.type_produit === 'pc') return "PC GAMING";
    if (product.type_produit === 'portable') return "LAPTOP";
    if (product.type_produit === 'composant') return "COMPOSANT";
    if (product.type_produit === 'peripherique') return "PÉRIPHÉRIQUE";
    return "EXCEPTION";
  };

  if (isLoading) {
    return (
      <section className="bg-background py-24 border-b border-border relative overflow-hidden">
        <div className="container-x relative z-10">
          <div className="flex items-end justify-between mb-12 pb-6 border-b-2 border-foreground">
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3">— Sélection</div>
              <h2 className="font-display text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9]">
                Nos pièces <span className="italic font-light">d'exception.</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background border-r border-b border-border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-5 space-y-2">
                  <div className="h-3 bg-secondary rounded w-1/3" />
                  <div className="h-5 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-6 bg-secondary rounded w-1/2 mt-4" />
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
      <section className="bg-background py-24 border-b border-border relative overflow-hidden">
        <div className="container-x relative z-10">
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchExceptionProducts}
              className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (topProducts.length === 0) {
    return (
      <section className="bg-background py-24 border-b border-border relative overflow-hidden">
        <div className="container-x relative z-10">
          <div className="flex items-end justify-between mb-12 pb-6 border-b-2 border-foreground">
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3">— Sélection</div>
              <h2 className="font-display text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9]">
                Nos pièces <span className="italic font-light">d'exception.</span>
              </h2>
            </div>
          </div>
          <div className="text-center py-20 bg-secondary/20 rounded-xl">
            <p className="text-muted-foreground">Aucun produit exception disponible pour le moment.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Vérifiez que des produits avec référence "EXP-" existent dans la base.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-24 border-b border-border relative overflow-hidden">
      {/* Grid background subtile */}
      <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />
      
      {/* Détail décoratif */}
      <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />

      <div className="container-x relative z-10">
        <div className="flex items-end justify-between mb-12 pb-6 border-b-2 border-foreground">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3">— Sélection</div>
            <h2 className="font-display text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9]">
              Nos pièces <span className="italic font-light">d'exception.</span>
            </h2>
          </div>
          <Link to="/catalogue" className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">
            Tout voir <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topProducts.map((product, index) => {
            const imageUrl = getProductImageUrl(product);
            const badge = getProductBadge(product);
            const category = getProductCategory(product);
            
            return (
              <Link
                key={product.id}
                to={`/produit/${product.id}`}
                className="group bg-background border-r border-b border-border hover:bg-foreground hover:text-background transition-all duration-500 flex flex-col relative overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                
                <div className="relative aspect-square bg-secondary overflow-hidden group-hover:bg-foreground/10 transition-colors">
                  {badge && (
                    <span className="absolute top-3 left-3 z-10 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                      {badge}
                    </span>
                  )}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.nom}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/5 to-secondary">
                      <span className="text-4xl">✨</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[9px] uppercase tracking-[0.3em] opacity-60 mb-2">{category}</div>
                  <h3 className="font-display font-black text-lg leading-tight mb-2 line-clamp-2">
                    {product.nom}
                  </h3>
                  <p className="text-xs opacity-70 line-clamp-2 mb-3 italic">
                    {product.description_courte || product.description?.substring(0, 80) || "Produit d'exception"}
                  </p>
                  <div className="flex items-center gap-1 mb-3 text-xs">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-bold">5.0</span>
                    <span className="opacity-60">(exception)</span>
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-current/20 pt-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest opacity-60">à partir de</div>
                      <div className="font-display font-black text-lg">{formatPrice(product.prix, product.devise)}</div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="relative mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-6 flex-wrap md:flex-nowrap">
            {/* Mascotte cliquable */}
            <div 
              className="relative animate-float cursor-pointer group hidden md:block"
            >
              {/* Cercle lumineux */}
              <div className={`absolute inset-0 bg-amber-500/20 rounded-full blur-2xl scale-150 transition-all duration-500 ${isSpeaking ? 'bg-green-500/30 scale-175' : 'group-hover:bg-amber-500/30'}`} />
              
              {/* Image de la mascotte */}
              <img
                src={mascot}
                alt="Casio - Cliquez pour parler"
                className="h-24 w-auto object-contain relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-110 cursor-pointer"
              />
              
              {/* Indicateur de parole */}
              {isSpeaking && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-2 py-1 rounded-full whitespace-nowrap animate-pulse">
                  Fosa parle...
                </div>
              )}
            </div>
            
            {/* Message d'accompagnement */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Fosa te recommande</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
                Une pièce d'exception pour une <span className="italic font-light">configuration unique</span>
              </h3>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto md:mx-0">
                Chaque composant est choisi avec soin par nos experts. 
                Des pièces de qualité premium, importées directement d'Europe 
                pour garantir performance et durabilité.
              </p>
            </div>
            
            {/* Bouton CTA */}
            <Link
              to="/catalogue"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all hover:gap-3"
            >
              Découvrir la collection
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        .theme-transition { transition: all 0.3s ease; }
      `}</style>
    </section>
  );
};