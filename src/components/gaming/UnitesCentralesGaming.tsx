// import { Cpu, Zap, HardDrive, MemoryStick, Eye } from "lucide-react";
// import { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";
// import api from "@/service/api";

// interface Product {
//   id: number;
//   categorie_id: number;
//   reference: string;
//   nom: string;
//   description_courte: string;
//   description: string;
//   type_produit: string;
//   prix: number;
//   devise: string;
//   quantite_stock: number;
//   est_dispo: boolean;
//   actif: boolean;
//   date_creation: string;
//   date_modification: string;
//   images?: { url: string; ordre: number }[];
// }

// export const UnitesCentralesGaming = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     fetchGamingPCs();
    
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.1 }
//     );
    
//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }
    
//     return () => observer.disconnect();
//   }, []);

//   const fetchGamingPCs = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const response = await api.get('/produits');
      
//       let allProducts = [];
//       if (response.data.data) {
//         allProducts = Array.isArray(response.data.data) ? response.data.data : [];
//       } else if (Array.isArray(response.data)) {
//         allProducts = response.data;
//       } else {
//         allProducts = [];
//       }
      
//       const pcProducts = allProducts.filter(
//         (product: Product) => 
//           product.type_produit === 'pc' && 
//           product.actif === true
//       );
      
//       setProducts(pcProducts);
//     } catch (error: any) {
//       console.error("Erreur détaillée:", error);
//       setError(`Impossible de charger les produits: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatPrice = (prix: number, devise: string = 'MGA') => {
//     return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
//   };

//   const getImageUrl = (product: Product) => {
//     const images = product.images || [];
//     if (images.length === 0) return null;
//     const mainImage = images.find(img => img.ordre === 0) || images[0];
//     if (mainImage?.url) {
//       if (mainImage.url.startsWith('/storage')) {
//         return `http://127.0.0.1:8000${mainImage.url}`;
//       }
//       return mainImage.url;
//     }
//     return null;
//   };

//   const extractSpecs = (product: Product) => {
//     return {
//       processor: extractFromDescription(product.description, 'Processeur', 'CPU'),
//       ram: extractFromDescription(product.description, 'RAM', 'Mémoire'),
//       storage: extractFromDescription(product.description, 'Stockage', 'SSD', 'Disque'),
//       gpu: extractFromDescription(product.description, 'GPU', 'Carte graphique')
//     };
//   };

//   const extractFromDescription = (description: string, ...keywords: string[]) => {
//     if (!description) return 'Non spécifié';
//     for (const keyword of keywords) {
//       const regex = new RegExp(`${keyword}[\\s:]*([^\\n,]+)`, 'i');
//       const match = description.match(regex);
//       if (match) return match[1].trim();
//     }
//     return 'Non spécifié';
//   };

//   if (isLoading) {
//     return (
//       <section ref={sectionRef} className="py-12 bg-secondary/30">
//         <div className="container-x">
//           <div className="flex items-center justify-between mb-8">
//             <div className="h-10 w-64 bg-secondary animate-pulse rounded-lg" />
//             <div className="h-10 w-32 bg-secondary animate-pulse rounded-lg" />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
//                 <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
//                 <div className="space-y-2">
//                   <div className="h-4 bg-secondary rounded w-full" />
//                   <div className="h-4 bg-secondary rounded w-5/6" />
//                   <div className="h-4 bg-secondary rounded w-4/6" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="py-12 bg-secondary/30">
//         <div className="container-x">
//           <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
//             <Cpu className="h-8 w-8 text-purple-500" />
//             Unités Centrales Gaming
//           </h2>
//           <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
//             <p className="text-red-500 mb-4">{error}</p>
//             <button 
//               onClick={fetchGamingPCs}
//               className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//             >
//               Réessayer
//             </button>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (products.length === 0) {
//     return (
//       <section className="py-12 bg-secondary/30">
//         <div className="container-x">
//           <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
//             <Cpu className="h-8 w-8 text-purple-500" />
//             Unités Centrales Gaming
//           </h2>
//           <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-12 text-center">
//             <p className="text-yellow-600 dark:text-yellow-400">
//               Aucun PC gaming disponible pour le moment.
//             </p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section ref={sectionRef} className="py-12 bg-secondary/30">
//       <div className="container-x">
//         {/* En-tête avec bouton Voir tout */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
//           <div>
//             <h2 className="text-3xl font-bold flex items-center gap-3">
//               <Cpu className="h-8 w-8 text-purple-500" />
//               Unités Centrales Gaming
//             </h2>
//             <p className="text-muted-foreground mt-2">
//               Des PC gaming prêts à dominer tous vos jeux. Performance maximale, refroidissement optimisé.
//             </p>
//           </div>
//           <Link to="/catalogue?type=pc">
//             <button className="group inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium">
//               <span>Voir tout</span>
//               <Eye className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </button>
//           </Link>
//         </div>
        
//         {/* Grille des produits */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {products.map((product, index) => {
//             const specs = extractSpecs(product);
//             const imageUrl = getImageUrl(product);
            
//             return (
//               <div 
//                 key={product.id} 
//                 className={`group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1
//                   ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`}
//                 style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
//               >
//                 {/* Image section */}
//                 <Link to={`/produit/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-500/10 to-secondary">
//                   {imageUrl ? (
//                     <img 
//                       src={imageUrl} 
//                       alt={product.nom} 
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center">
//                       <Cpu className="h-16 w-16 text-purple-500/30" />
//                     </div>
//                   )}
//                   {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
//                     <span className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full">
//                       Stock limité
//                     </span>
//                   )}
//                 </Link>

//                 {/* Content */}
//                 <div className="p-5">
//                   <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
//                     {product.nom}
//                   </h3>
                  
//                   <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
//                     {product.description_courte || product.description?.substring(0, 100) || "PC gaming haute performance"}
//                   </p>
                  
//                   <div className="space-y-2 mb-4">
//                     <div className="flex items-center gap-2">
//                       <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
//                       <span className="text-sm text-muted-foreground">{specs.processor}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <MemoryStick className="h-4 w-4 text-muted-foreground shrink-0" />
//                       <span className="text-sm text-muted-foreground">{specs.ram}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
//                       <span className="text-sm text-muted-foreground">{specs.storage}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
//                       <span className="text-sm text-muted-foreground">{specs.gpu}</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
//                     <div>
//                       <span className="text-2xl font-bold text-purple-600">
//                         {formatPrice(product.prix, product.devise)}
//                       </span>
//                       {product.quantite_stock === 0 && (
//                         <p className="text-xs text-red-500 mt-1">Rupture de stock</p>
//                       )}
//                     </div>
//                     <Link to={`/produit/${product.id}`}>
//                       <button 
//                         className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center gap-2 group/btn"
//                         disabled={product.quantite_stock === 0}
//                       >
//                         <span>Voir détails</span>
//                         <Eye className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
//                       </button>
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <style>{`
//         @keyframes fade-up {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-up {
//           animation: fade-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
//         }
//       `}</style>
//     </section>
//   );
// };

import { Cpu, Zap, HardDrive, MemoryStick, Eye, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/service/api";

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
  images?: { url: string; ordre: number }[];
}

export const UnitesCentralesGaming = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGamingPCs();
    
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

  const fetchGamingPCs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/produits');
      
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
          product.type_produit === 'pc' && 
          product.actif === true
      );
      
      setProducts(pcProducts);
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
      processor: extractFromDescription(product.description, 'Processeur', 'CPU'),
      ram: extractFromDescription(product.description, 'RAM', 'Mémoire'),
      storage: extractFromDescription(product.description, 'Stockage', 'SSD', 'Disque'),
      gpu: extractFromDescription(product.description, 'GPU', 'Carte graphique')
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

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    // Ici vous pouvez ajouter la logique pour ajouter au panier (localStorage, context, etc.)
    console.log("Ajout au panier:", product);
    
    // Rediriger vers la page panier
    navigate("/panier");
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
            <Cpu className="h-8 w-8 text-purple-500" />
            Unités Centrales Gaming
          </h2>
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchGamingPCs}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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
            <Cpu className="h-8 w-8 text-purple-500" />
            Unités Centrales Gaming
          </h2>
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-12 text-center">
            <p className="text-yellow-600 dark:text-yellow-400">
              Aucun PC gaming disponible pour le moment.
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
          {/* En-tête avec bouton Voir tout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Cpu className="h-8 w-8 text-purple-500" />
                Unités Centrales Gaming
              </h2>
              <p className="text-muted-foreground mt-2">
                Des PC gaming prêts à dominer tous vos jeux. Performance maximale, refroidissement optimisé.
              </p>
            </div>
            <Link to="/catalogue?type=pc">
              <button className="group inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium">
                <span>Voir tout</span>
                <Eye className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
          
          {/* Grille des produits */}
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
                  {/* Image section */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-500/10 to-secondary">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.nom} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Cpu className="h-16 w-16 text-purple-500/30" />
                      </div>
                    )}
                    {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full">
                        Stock limité
                      </span>
                    )}
                  </div>

                  {/* Content simplifié */}
                  <div className="p-5">
                    {/* Titre avec œil à droite */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {product.nom}
                      </h3>
                      
                      {/* Bouton œil pour ouvrir le modal */}
                      <button
                        onClick={() => openModal(product)}
                        className="flex-shrink-0 p-1.5 bg-purple-500/10 hover:bg-purple-600 rounded-lg transition-all duration-300 hover:scale-110 group/eye"
                        aria-label="Voir les configurations"
                      >
                        <Eye className="h-4 w-4 text-purple-600 group-hover/eye:text-white transition-colors" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description_courte || product.description?.substring(0, 100) || "PC gaming haute performance"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold text-purple-600">
                          {formatPrice(product.prix, product.devise)}
                        </span>
                        {product.quantite_stock === 0 && (
                          <p className="text-xs text-red-500 mt-1">Rupture de stock</p>
                        )}
                      </div>
                      
                      {/* Bouton Ajouter au panier - plus petit, fond blanc, texte noir */}
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-1.5 text-sm font-medium border border-gray-200 shadow-sm"
                        disabled={product.quantite_stock === 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
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

      {/* Modal pour afficher les configurations */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            {/* En-tête du modal */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Cpu className="h-6 w-6 text-purple-500" />
                <h3 className="text-xl font-bold">{selectedProduct.nom}</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Corps du modal avec configurations */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-purple-600">Spécifications techniques</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Processeur :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).processor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">RAM :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).ram}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Stockage :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Carte graphique :</span>
                        <span className="text-sm font-medium">{extractSpecs(selectedProduct).gpu}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-purple-600">Informations produit</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Référence :</span>
                        <span className="text-sm font-medium">{selectedProduct.reference}</span>
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
                        <span className="text-lg font-bold text-purple-600">{formatPrice(selectedProduct.prix, selectedProduct.devise)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-purple-600">Description</h4>
                  <p className="text-sm text-foreground">{selectedProduct.description || selectedProduct.description_courte || "Aucune description disponible"}</p>
                </div>
              </div>
            </div>

            {/* Pied du modal */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="flex-1 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                disabled={selectedProduct.quantite_stock === 0}
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};