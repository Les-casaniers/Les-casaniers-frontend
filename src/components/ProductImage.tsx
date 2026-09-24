import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getProductImageUrl } from "@/lib/utils";

const ProductImage = ({
  produit,
  className = "",
  showReference = true,
}: {
  produit?: any;
  className?: string;
  showReference?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = getProductImageUrl(produit);
  const hasRealImage = imageUrl !== "/placeholder-pc.jpg";

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [imageUrl]);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-secondary/30 to-muted/20 ${className}`}>
      {hasRealImage && !imageError && (
        <img
          src={imageUrl}
          alt={produit?.nom || "Produit"}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setImageError(true);
          }}
          loading="lazy"
        />
      )}

      {isLoading && hasRealImage && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {(!hasRealImage || imageError) && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center p-4">
            <div className="text-5xl mb-3">🖼️</div>
            {showReference && (
              <p className="text-xs font-medium text-muted-foreground">
                {produit?.reference || "Produit"}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {imageError ? "Image indisponible" : "Aucune image"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImage;