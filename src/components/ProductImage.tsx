// src/components/ProductImage.tsx
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const ProductImage = ({ 
  produit, 
  className = "",
  showReference = true
}: { 
  produit?: any; 
  className?: string;
  showReference?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);

    if (!produit) {
      console.log("❌ Pas de produit");
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    console.log(`🔍 Produit ${produit.id} - ${produit.nom}`);
    console.log(`📸 Données brutes:`, produit);

    const extractImage = (obj: any): string | null => {
      if (!obj) return null;

      // 1. Vérifier images (tableau)
      if (obj.images && Array.isArray(obj.images) && obj.images.length > 0) {
        console.log(`📸 images[0]:`, obj.images[0]);
        const firstImage = obj.images[0];
        if (firstImage && typeof firstImage === 'object') {
          if (firstImage.url) {
            console.log(`✅ URL dans images[0].url:`, firstImage.url);
            return firstImage.url;
          }
          if (firstImage.path) {
            console.log(`✅ Path dans images[0].path:`, firstImage.path);
            return firstImage.path;
          }
          if (firstImage.filename) {
            console.log(`✅ Filename dans images[0].filename:`, firstImage.filename);
            return firstImage.filename;
          }
        }
        if (typeof firstImage === 'string') {
          console.log(`✅ URL dans images[0]:`, firstImage);
          return firstImage;
        }
      }

      // 2. Vérifier image
      if (obj.image && typeof obj.image === 'string' && obj.image.trim() !== '') {
        console.log(`✅ Image dans "image":`, obj.image);
        return obj.image;
      }

      // 3. Vérifier image_url
      if (obj.image_url && typeof obj.image_url === 'string' && obj.image_url.trim() !== '') {
        console.log(`✅ Image dans "image_url":`, obj.image_url);
        return obj.image_url;
      }

      // 4. Vérifier photo
      if (obj.photo && typeof obj.photo === 'string' && obj.photo.trim() !== '') {
        console.log(`✅ Image dans "photo":`, obj.photo);
        return obj.photo;
      }

      console.log(`❌ Aucune image trouvée pour le produit ${obj.id}`);
      return null;
    };

    const imageSource = extractImage(produit);
    console.log(`🎯 Source d'image:`, imageSource);

    if (!imageSource) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    // Si c'est une URL de données (base64)
    if (imageSource.startsWith('data:image')) {
      setImageUrl(imageSource);
      setIsLoading(false);
      return;
    }

    // Si c'est une URL complète
    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      setImageUrl(imageSource);
      setIsLoading(false);
      return;
    }

    // Si c'est un chemin relatif
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    let fileName = imageSource;
    if (fileName.includes('/')) {
      fileName = fileName.split('/').pop() || fileName;
    }

    const finalUrl = `${baseUrl}/image/${fileName}`;
    console.log(`🔗 URL finale: ${finalUrl}`);
    setImageUrl(finalUrl);
    setIsLoading(false);
  }, [produit]);

  const tryAlternativePath = (currentUrl: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const fileName = currentUrl.split('/').pop() || '';
    
    const alternatives = [
      `${baseUrl}/storage/image/${fileName}`,
      `${baseUrl}/storage/images/${fileName}`,
      `${baseUrl}/public/image/${fileName}`,
      `${baseUrl}/images/${fileName}`,
      `${baseUrl}/uploads/image/${fileName}`,
      `${baseUrl}/api/image/${fileName}`,
    ];
    
    for (const alt of alternatives) {
      if (alt !== currentUrl) {
        console.log(`🔄 Essai alternatif: ${alt}`);
        return alt;
      }
    }
    return null;
  };

  const handleImageError = () => {
    console.error(`❌ Erreur chargement: ${imageUrl}`);
    if (imageUrl) {
      const alternative = tryAlternativePath(imageUrl);
      if (alternative) {
        setImageUrl(alternative);
        return;
      }
    }
    setImageError(true);
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-secondary/30 to-muted/20 ${className}`}>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={produit?.nom || 'Produit'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
          onLoad={() => {
            console.log(`✅ Image chargée: ${produit?.nom}`);
          }}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center p-4">
            <div className="text-5xl mb-3">🖼️</div>
            {showReference && (
              <p className="text-xs font-medium text-muted-foreground">
                {produit?.reference || 'Produit'}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {imageError ? '❌ Erreur' : '📷 Aucune image'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImage;