import { useState, useEffect } from 'react';
import api from '@/service/api';
import { toast } from '@/hooks/use-toast';

export type CartItem = {
  id: number;
  utilisateur_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  statut: string;
  titre?: string;
  configuration_id?: number | null;
  produit?: {
    id: number;
    nom: string;
    prix: number;
    image?: string;
    type_produit: string;
  };
};

export const useCartApi = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  // Charger le panier de l'utilisateur connecté
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/panier');
      console.log("Panier récupéré:", response.data);
      
      let items: CartItem[] = [];
      if (response.data.data) {
        items = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else {
        items = [];
      }
      
      setCartItems(items);
      
      // Calculer le total
      const total = items.reduce((sum, item) => sum + (item.prix_unitaire * item.quantite), 0);
      setCartTotal(total);
      
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un produit au panier
  const addToCart = async (produitId: number, quantite: number = 1, prixUnitaire?: number) => {
    try {
      // Si le prix n'est pas fourni, on le récupère depuis l'API
      let finalPrix = prixUnitaire;
      if (!finalPrix) {
        const productResponse = await api.get(`/produits/${produitId}`);
        if (productResponse.data.data) {
          finalPrix = productResponse.data.data.prix;
        } else if (productResponse.data) {
          finalPrix = productResponse.data.prix;
        }
      }
      
      const response = await api.post('/panier/ajouter', {
        produit_id: produitId,
        quantite: quantite
      });
      
      if (response.data.success) {
        await fetchCart(); // Recharger le panier
        toast({ 
          title: "Ajouté au panier", 
          description: "Produit ajouté avec succès"
        });
      }
      
    } catch (error: any) {
      console.error("Erreur ajout panier:", error);
      if (error.response?.status === 401) {
        toast({ 
          title: "Connexion requise", 
          description: "Veuillez vous connecter pour ajouter au panier",
          variant: "destructive"
        });
      } else if (error.response?.status === 422) {
        toast({ 
          title: "Erreur", 
          description: error.response?.data?.message || "Données invalides",
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Erreur", 
          description: "Impossible d'ajouter au panier",
          variant: "destructive"
        });
      }
    }
  };

  // Modifier la quantité
  const updateQuantity = async (itemId: number, quantite: number) => {
    try {
      if (quantite <= 0) {
        await removeFromCart(itemId);
        return;
      }
      
      const response = await api.put(`/panier/modifier/${itemId}`, { quantite });
      
      if (response.data.success) {
        await fetchCart(); // Recharger le panier
      }
      
    } catch (error) {
      console.error("Erreur mise à jour quantité:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de modifier la quantité",
        variant: "destructive"
      });
    }
  };

  // Supprimer un produit du panier
  const removeFromCart = async (itemId: number) => {
    try {
      const response = await api.delete(`/panier/supprimer/${itemId}`);
      
      if (response.data.success) {
        await fetchCart(); // Recharger le panier
        toast({ 
          title: "Retiré du panier", 
          description: "Produit supprimé avec succès"
        });
      }
      
    } catch (error) {
      console.error("Erreur suppression panier:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      });
    }
  };

  // Vider tout le panier
  const clearCart = async () => {
    try {
      const response = await api.delete('/panier/vider');
      
      if (response.data.success) {
        await fetchCart(); // Recharger le panier
        toast({ 
          title: "Panier vidé", 
          description: "Tous les articles ont été supprimés"
        });
      }
      
    } catch (error) {
      console.error("Erreur vidage panier:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de vider le panier",
        variant: "destructive"
      });
    }
  };

  // Obtenir le nombre total d'articles
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantite, 0);
  };

  // Obtenir les détails du panier formatés pour l'affichage
  const getCartDetailed = () => {
    return cartItems.map(item => ({
      id: item.id,
      product: {
        id: item.produit_id,
        name: item.produit?.nom || item.titre || `Produit #${item.produit_id}`,
        price: item.prix_unitaire,
        image: item.produit?.image || "/placeholder.jpg",
        category: item.produit?.type_produit || "Produit",
        tagline: "Article ajouté au panier"
      },
      qty: item.quantite,
      subtotal: item.prix_unitaire * item.quantite
    }));
  };

  // Charger le panier au montage
  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cartItems,
    cartDetailed: getCartDetailed(),
    cartTotal,
    cartCount: getCartCount(),
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };
};