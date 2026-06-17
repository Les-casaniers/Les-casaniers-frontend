import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import type { SousCategoryWithProducts } from "@/hooks/useProducts";

interface ProductMiniCardProps {
  product: {
    id: number;
    nom: string;
    prix: number;
    image_principale?: string | null;
    images?: { url: string }[];
  };
  onClose: () => void;
}

export const ProductMiniCard = ({ product, onClose }: ProductMiniCardProps) => {
  // Récupérer l'image (principale ou première du tableau)
  const imageUrl = product.image_principale || product.images?.[0]?.url || null;

  return (
    <Link
      to={`/produit/${product.id}`}
      onClick={onClose}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-all group/product"
    >
      <div className="w-12 h-12 rounded-md overflow-hidden bg-secondary flex-shrink-0 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.fallback-icon');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex';
                }
              }
            }}
          />
        ) : null}
        <div 
          className="fallback-icon w-full h-full flex items-center justify-center text-muted-foreground"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <Package className="h-5 w-5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover/product:text-primary transition-colors">
          {product.nom}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.prix} €
        </p>
      </div>
    </Link>
  );
};

interface SousCategoryMenuSectionProps {
  sousCategory: SousCategoryWithProducts;
  categoryId: number;
  onClose?: () => void;
}

export const SousCategoryMenuSection = ({ 
  sousCategory, 
  categoryId,
  onClose = () => {}
}: SousCategoryMenuSectionProps) => {
  const hasProducts = sousCategory.produits?.length > 0;

  return (
    <div className="space-y-2">
      <Link
        to={`/catalogue?categorie=${categoryId}&sous_categorie=${sousCategory.id}`}
        onClick={onClose}
        className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
      >
        {sousCategory.nom}
        {hasProducts && (
          <span className="text-xs text-muted-foreground">
            ({sousCategory.produits.length})
          </span>
        )}
        <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </Link>

      {hasProducts ? (
        <div className="space-y-2">
          {sousCategory.produits.slice(0, 3).map((product) => (
            <ProductMiniCard 
              key={product.id} 
              product={product} 
              onClose={onClose}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Aucun produit disponible
        </p>
      )}
    </div>
  );
};