// src/components/mega-menu/MenuProductComponents.tsx
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { productImage } from "@/hooks/useProducts";
import type { Product, SousCategoryWithProducts } from "@/hooks/useProducts";

// Composant pour afficher les miniatures des produits
export const ProductMiniCard = ({ product }: { product: Product }) => (
  <Link
    to={`/produit/${product.id}`}
    className="group flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary/50 transition-all duration-200"
  >
    <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden flex-shrink-0">
      <img
        src={productImage(product)}
        alt={product.nom}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
        {product.nom}
      </p>
      <p className="text-xs font-bold text-primary">
        {product.prix.toLocaleString('fr-MG')} {product.devise || 'Ar'}
      </p>
    </div>
  </Link>
);

// Composant pour afficher une sous-catégorie avec ses produits
// RENOMMÉ de SousCategoryWithProducts à SousCategoryMenuSection
export const SousCategoryMenuSection = ({ 
  sousCategory, 
  categoryId 
}: { 
  sousCategory: SousCategoryWithProducts; 
  categoryId: number;
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayedProducts = showAll ? sousCategory.produits : sousCategory.produits.slice(0, 3);
  
  if (sousCategory.produits.length === 0) {
    return (
      <div className="py-2">
        <Link
          to={`/catalogue?categorie=${categoryId}&sous_categorie=${sousCategory.id}`}
          className="flex items-center gap-2 py-2 text-sm text-foreground/75 hover:text-primary transition-all duration-200"
        >
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all duration-200 shrink-0" />
          <span>{sousCategory.nom}</span>
        </Link>
        <p className="text-xs text-muted-foreground pl-5 mt-1">Aucun produit</p>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <Link
        to={`/catalogue?categorie=${categoryId}&sous_categorie=${sousCategory.id}`}
        className="flex items-center gap-2 py-2 text-sm font-semibold text-foreground hover:text-primary transition-all duration-200 border-b border-border/50 mb-2"
      >
        <ChevronRight className="h-3 w-3 text-primary" />
        <span>{sousCategory.nom}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          ({sousCategory.produits.length})
        </span>
      </Link>
      
      <div className="space-y-1 pl-4">
        {displayedProducts.map((product) => (
          <ProductMiniCard key={product.id} product={product} />
        ))}
        
        {sousCategory.produits.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 mt-2 ml-1"
          >
            {showAll ? (
              <>Voir moins <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Voir les {sousCategory.produits.length - 3} autres produits <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};