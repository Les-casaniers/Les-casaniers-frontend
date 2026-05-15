// import { Cpu, Zap, HardDrive, MemoryStick } from "lucide-react";

// const products = [
//   {
//     id: 1,
//     name: "Gamer Pro Xtreme",
//     processor: "Intel Core i9-14900K",
//     ram: "32GB DDR5",
//     storage: "1TB NVMe SSD",
//     gpu: "RTX 4080",
//     price: "2 499 €",
//   },
//   {
//     id: 2,
//     name: "Mid-Tier Gaming",
//     processor: "AMD Ryzen 7 7800X3D",
//     ram: "16GB DDR5",
//     storage: "512GB NVMe SSD",
//     gpu: "RTX 4070",
//     price: "1 799 €",
//   },
//   {
//     id: 3,
//     name: "Entry Level Gaming",
//     processor: "Intel Core i5-13600K",
//     ram: "16GB DDR4",
//     storage: "1TB SSD",
//     gpu: "RTX 4060",
//     price: "1 199 €",
//   },
// ];

// export const UnitesCentralesGaming = () => {
//   return (
//     <section className="py-12">
//       <div className="container-x">
//         <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
//           <Cpu className="h-8 w-8 text-purple-500" />
//           Unités Centrales Gaming
//         </h2>
//         <p className="text-muted-foreground mb-8">
//           Des PC gaming prêts à dominer tous vos jeux. Performance maximale, refroidissement optimisé.
//         </p>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {products.map((product) => (
//             <div key={product.id} className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
//               <h3 className="text-xl font-bold mb-4">{product.name}</h3>
//               <div className="space-y-2 mb-4">
//                 <div className="flex items-center gap-2">
//                   <Cpu className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm">{product.processor}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <MemoryStick className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm">{product.ram}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <HardDrive className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm">{product.storage}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Zap className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm">{product.gpu}</span>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between mt-4">
//                 <span className="text-2xl font-bold text-primary">{product.price}</span>
//                 <button className="bg-foreground text-background px-4 py-2 hover:opacity-90 transition">
//                   Voir détails
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

import { Cpu, Zap, HardDrive, MemoryStick } from "lucide-react";
import { useEffect, useState } from "react";
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
}

export const UnitesCentralesGaming = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGamingPCs();
  }, []);

  const fetchGamingPCs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Récupérer tous les produits
      const response = await api.get('/produits');
      
      console.log("Tous les produits:", response.data); // Pour debug
      
      // Extraire les produits (adaptez selon la structure de votre API)
      let allProducts = [];
      if (response.data.data) {
        allProducts = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        allProducts = response.data;
      } else {
        allProducts = [];
      }
      
      // Filtrer les produits de type "pc"
      const pcProducts = allProducts.filter(
        (product: Product) => 
          product.type_produit === 'pc' && 
          product.actif === true
      );
      
      console.log("Produits PC filtrés:", pcProducts); // Pour debug
      
      setProducts(pcProducts);
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      console.error("Réponse erreur:", error.response?.data);
      setError(`Impossible de charger les produits: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (prix: number, devise: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix);
  };

  // Extraire les spécifications depuis la description ou utiliser des valeurs par défaut
  const extractSpecs = (product: Product) => {
    // Si vous avez des attributs spécifiques dans votre produit
    // Vous pouvez les extraire de la description ou d'autres champs
    return {
      processor: extractFromDescription(product.description, 'Processeur', 'CPU'),
      ram: extractFromDescription(product.description, 'RAM', 'Mémoire'),
      storage: extractFromDescription(product.description, 'Stockage', 'SSD'),
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

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container-x">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-purple-500 animate-pulse" />
            Unités Centrales Gaming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
      <section className="py-12">
        <div className="container-x">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-purple-500" />
            Unités Centrales Gaming
          </h2>
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchGamingPCs}
              className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
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
      <section className="py-12">
        <div className="container-x">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-purple-500" />
            Unités Centrales Gaming
          </h2>
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6 text-center">
            <p className="text-yellow-600 dark:text-yellow-400">
              Aucun PC gaming disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vérifiez que vos produits ont <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">type_produit = 'pc'</code> et <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">actif = true</code>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container-x">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Cpu className="h-8 w-8 text-purple-500" />
          Unités Centrales Gaming
        </h2>
        <p className="text-muted-foreground mb-8">
          Des PC gaming prêts à dominer tous vos jeux. Performance maximale, refroidissement optimisé.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const specs = extractSpecs(product);
            return (
              <div 
                key={product.id} 
                className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold mb-2">{product.nom}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description_courte || product.description?.substring(0, 100) || "PC gaming haute performance"}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{specs.processor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{specs.ram}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{specs.storage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{specs.gpu}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.prix, product.devise)}
                  </span>
                  <button 
                    className="bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition"
                    onClick={() => window.location.href = `/produit/${product.id}`}
                  >
                    Voir détails
                  </button>
                </div>
                
                {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                  <p className="text-xs text-orange-500 mt-2">
                    ⚡ Plus que {product.quantite_stock} en stock !
                  </p>
                )}
                {product.quantite_stock === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    ❌ Rupture de stock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};