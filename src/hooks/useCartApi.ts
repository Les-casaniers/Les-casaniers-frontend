// import { useState, useEffect } from 'react';
// import api from '@/service/api';
// import { toast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/AuthContext';

// export type CartItem = {
//   id: number;
//   utilisateur_id: number;
//   produit_id: number;
//   quantite: number;
//   prix_unitaire: number;
//   statut: string;
//   titre?: string;
//   configuration_id?: number | null;
//   produit?: {
//     id: number;
//     nom: string;
//     prix: number;
//     image?: string;
//     type_produit: string;
//   };
// };

// export const useCartApi = () => {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [cartCount, setCartCount] = useState(0);
//   const { isAuthenticated, user } = useAuth();

//   // Recalculer le compteur à partir des items
//   const updateCartCount = (items: CartItem[]) => {
//     const count = items.reduce((sum, item) => sum + item.quantite, 0);
//     setCartCount(count);
//     return count;
//   };

//   // Mettre à jour le total
//   const updateCartTotal = (items: CartItem[]) => {
//     const total = items.reduce((sum, item) => sum + (item.prix_unitaire * item.quantite), 0);
//     setCartTotal(total);
//   };

//   // Charger le panier de l'utilisateur connecté
//   const fetchCart = async () => {
//     if (!isAuthenticated) {
//       setCartItems([]);
//       setCartCount(0);
//       setCartTotal(0);
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const response = await api.get('/panier');
//       console.log("Panier récupéré:", response.data);
      
//       let items: CartItem[] = [];
//       if (response.data.data) {
//         items = Array.isArray(response.data.data) ? response.data.data : [];
//       } else if (Array.isArray(response.data)) {
//         items = response.data;
//       } else {
//         items = [];
//       }
      
//       setCartItems(items);
//       updateCartCount(items);
//       updateCartTotal(items);
      
//     } catch (error) {
//       console.error("Erreur chargement panier:", error);
//       setCartCount(0);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Ajouter un produit au panier
//   const addToCart = async (produitId: number, quantite: number = 1, prixUnitaire?: number, productName?: string) => {
//     if (!isAuthenticated) {
//       toast({ 
//         title: "Connexion requise", 
//         description: "Veuillez vous connecter pour ajouter au panier",
//         variant: "destructive"
//       });
//       return false;
//     }

//     try {
//       // Si le prix n'est pas fourni, on le récupère depuis l'API
//       let finalPrix = prixUnitaire;
//       let finalName = productName;
      
//       if (!finalPrix) {
//         const productResponse = await api.get(`/produits/${produitId}`);
//         if (productResponse.data.data) {
//           finalPrix = productResponse.data.data.prix;
//           finalName = productResponse.data.data.nom;
//         } else if (productResponse.data) {
//           finalPrix = productResponse.data.prix;
//           finalName = productResponse.data.nom;
//         }
//       }
      
//       const response = await api.post('/panier/ajouter', {
//         produit_id: produitId,
//         quantite: quantite,
//         titre: finalName,
//         prix_unitaire: finalPrix
//       });
      
//       if (response.data.success) {
//         // ✅ IMPORTANT: Recharger le panier immédiatement après l'ajout
//         await fetchCart();
        
//         toast({ 
//           title: "Ajouté au panier", 
//           description: finalName ? `${quantite} x ${finalName}` : "Produit ajouté avec succès"
//         });
//         return true;
//       }
//       return false;
      
//     } catch (error: any) {
//       console.error("Erreur ajout panier:", error);
//       if (error.response?.status === 401) {
//         toast({ 
//           title: "Connexion requise", 
//           description: "Veuillez vous connecter pour ajouter au panier",
//           variant: "destructive"
//         });
//       } else if (error.response?.status === 422) {
//         toast({ 
//           title: "Erreur", 
//           description: error.response?.data?.message || "Données invalides",
//           variant: "destructive"
//         });
//       } else {
//         toast({ 
//           title: "Erreur", 
//           description: "Impossible d'ajouter au panier",
//           variant: "destructive"
//         });
//       }
//       return false;
//     }
//   };

//   // Modifier la quantité
//   const updateQuantity = async (itemId: number, quantite: number) => {
//     if (!isAuthenticated) return false;
    
//     try {
//       if (quantite <= 0) {
//         return await removeFromCart(itemId);
//       }
      
//       const response = await api.put(`/panier/modifier/${itemId}`, { quantite });
      
//       if (response.data.success) {
//         // ✅ IMPORTANT: Recharger le panier immédiatement
//         await fetchCart();
//         return true;
//       }
//       return false;
      
//     } catch (error) {
//       console.error("Erreur mise à jour quantité:", error);
//       toast({ 
//         title: "Erreur", 
//         description: "Impossible de modifier la quantité",
//         variant: "destructive"
//       });
//       return false;
//     }
//   };

//   // Supprimer un produit du panier
//   const removeFromCart = async (itemId: number) => {
//     if (!isAuthenticated) return false;
    
//     try {
//       const response = await api.delete(`/panier/supprimer/${itemId}`);
      
//       if (response.data.success) {
//         // ✅ IMPORTANT: Recharger le panier immédiatement après la suppression
//         await fetchCart();
        
//         toast({ 
//           title: "Retiré du panier", 
//           description: "Produit supprimé avec succès"
//         });
//         return true;
//       }
//       return false;
      
//     } catch (error) {
//       console.error("Erreur suppression panier:", error);
//       toast({ 
//         title: "Erreur", 
//         description: "Impossible de supprimer l'article",
//         variant: "destructive"
//       });
//       return false;
//     }
//   };

//   // Vider tout le panier
//   const clearCart = async () => {
//     if (!isAuthenticated) return false;
    
//     try {
//       const response = await api.delete('/panier/vider');
      
//       if (response.data.success) {
//         // ✅ IMPORTANT: Recharger le panier immédiatement
//         await fetchCart();
        
//         toast({ 
//           title: "Panier vidé", 
//           description: "Tous les articles ont été supprimés"
//         });
//         return true;
//       }
//       return false;
      
//     } catch (error) {
//       console.error("Erreur vidage panier:", error);
//       toast({ 
//         title: "Erreur", 
//         description: "Impossible de vider le panier",
//         variant: "destructive"
//       });
//       return false;
//     }
//   };

//   // Obtenir les détails du panier formatés pour l'affichage
//   const getCartDetailed = () => {
//     return cartItems.map(item => ({
//       id: item.id,
//       product: {
//         id: item.produit_id,
//         name: item.produit?.nom || item.titre || `Produit #${item.produit_id}`,
//         price: item.prix_unitaire,
//         image: item.produit?.image || "/placeholder.jpg",
//         category: item.produit?.type_produit || "Produit",
//         tagline: "Article ajouté au panier"
//       },
//       qty: item.quantite,
//       subtotal: item.prix_unitaire * item.quantite
//     }));
//   };

//   // Charger le panier au montage et quand l'authentification change
//   useEffect(() => {
//     fetchCart();
//   }, [isAuthenticated]);

//   return {
//     cartItems,
//     cartDetailed: getCartDetailed(),
//     cartTotal,
//     cartCount,
//     isLoading,
//     addToCart,
//     updateQuantity,
//     removeFromCart,
//     clearCart,
//     refreshCart: fetchCart
//   };
// };

// src/hooks/useCartApi.ts

import { useState, useEffect } from 'react';
import api from '@/service/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type CartItem = {
  id: number;
  utilisateur_id: number;
  produit_id: number | null;
  boutique_id: number | null;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  statut: string;
  titre?: string;
  configuration_id?: number | null;
  produit?: {
    id: number;
    nom: string;
    prix: number;
    image?: string;
    type_produit: string;
    images?: any[];
  };
  boutique?: {
    id: number;
    nom: string;
    prix: number;
    image_url: string | null;
    stock: number;
  };
};

export const useCartApi = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  const updateCartCount = (items: CartItem[]) => {
    const count = items.reduce((sum, item) => sum + item.quantite, 0);
    setCartCount(count);
    return count;
  };

  const updateCartTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.prix_unitaire * item.quantite), 0);
    setCartTotal(total);
  };

  const fetchCart = async () => {
    if (!isAuthenticated || user?.poste === 'admin' || user?.poste === 'livreur') {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setIsLoading(false);
      return;
    }

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
      updateCartCount(items);
      updateCartTotal(items);
      
    } catch (error) {
      console.error("Erreur chargement panier:", error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Ajouter au panier (gère produit_id ET boutique_id)
  const addToCart = async (params: { 
  produit_id?: number; 
  boutique_id?: number; 
  quantite?: number; 
  prix_unitaire?: number; 
  titre?: string;
  }) => {
    if (!isAuthenticated) {
      toast({ 
        title: "🔒 Connexion requise", 
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive"
      });
      return false;
    }

    if (user?.poste === 'admin' || user?.poste === 'livreur') {
      toast({
        title: "Accès refusé",
        description: "Seuls les clients peuvent utiliser le panier.",
        variant: "destructive",
      });
      return false;
    }

    const { produit_id, boutique_id, quantite = 1, prix_unitaire, titre } = params;

    try {
      const payload: any = {
        quantite: quantite,
      };

      // ✅ Ajouter l'ID correspondant
      if (produit_id) {
        payload.produit_id = produit_id;
      }
      if (boutique_id) {
        payload.boutique_id = boutique_id;
      }
      if (prix_unitaire) {
        payload.prix_unitaire = prix_unitaire;
      }
      if (titre) {
        payload.titre = titre;
      }

      console.log('Payload envoyé:', payload);

      const response = await api.post('/panier/ajouter', payload);
      
      if (response.data.success) {
        await fetchCart();
        
        toast({ 
          title: "✅ Ajouté au panier", 
          description: titre ? `${quantite} x ${titre}` : "Article ajouté avec succès"
        });
        return true;
      }
      return false;
      
    } catch (error: any) {
      console.error("Erreur ajout panier:", error);
      
      // ✅ Afficher les erreurs de validation
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        let message = "Erreur de validation";
        if (errors) {
          message = Object.values(errors).flat().join(', ');
        }
        toast({ 
          title: "❌ Erreur", 
          description: message || "Données invalides",
          variant: "destructive"
        });
      } else {
        const message = error.response?.data?.message || "Impossible d'ajouter au panier";
        toast({ 
          title: "❌ Erreur", 
          description: message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  // ✅ Modifier la quantité
  const updateQuantity = async (itemId: number, quantite: number) => {
    if (!isAuthenticated) return false;
    
    try {
      if (quantite <= 0) {
        return await removeFromCart(itemId);
      }
      
      const response = await api.put(`/panier/modifier/${itemId}`, { quantite });
      
      if (response.data.success) {
        await fetchCart();
        return true;
      }
      return false;
      
    } catch (error) {
      console.error("Erreur mise à jour quantité:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible de modifier la quantité",
        variant: "destructive"
      });
      return false;
    }
  };

  // ✅ Supprimer du panier
  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.delete(`/panier/supprimer/${itemId}`);
      
      if (response.data.success) {
        await fetchCart();
        toast({ 
          title: "🗑️ Retiré du panier", 
          description: "Article supprimé avec succès"
        });
        return true;
      }
      return false;
      
    } catch (error) {
      console.error("Erreur suppression panier:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      });
      return false;
    }
  };

  // ✅ Vider le panier
  const clearCart = async () => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.delete('/panier/vider');
      
      if (response.data.success) {
        await fetchCart();
        toast({ 
          title: "🗑️ Panier vidé", 
          description: "Tous les articles ont été supprimés"
        });
        return true;
      }
      return false;
      
    } catch (error) {
      console.error("Erreur vidage panier:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible de vider le panier",
        variant: "destructive"
      });
      return false;
    }
  };

  // ✅ Obtenir les détails du panier formatés
  // 
  
  // Dans getCartDetailed
  const getCartDetailed = () => {
    return cartItems.map(item => {
      // Si c'est un article de boutique Misa
      if (item.boutique) {
        return {
          id: item.id,
          product: {
            id: item.boutique.id,
            name: item.boutique.nom,
            price: item.boutique.prix,
            image: item.boutique.image_url || "/images/placeholder.jpg",
            category: "Boutique Misa",
            tagline: "Article de la boutique Misa"
          },
          qty: item.quantite,
          subtotal: item.prix_unitaire * item.quantite,
          isBoutique: true,
        };
      }
      
      // Si c'est un produit classique
      return {
        id: item.id,
        product: {
          id: item.produit?.id || item.produit_id,
          name: item.produit?.nom || item.titre || `Produit #${item.produit_id}`,
          price: item.prix_unitaire,
          image: item.produit?.image || "/placeholder.jpg",
          category: item.produit?.type_produit || "Produit",
          tagline: "Article ajouté au panier"
        },
        qty: item.quantite,
        subtotal: item.prix_unitaire * item.quantite,
        isBoutique: false,
      };
    });
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  return {
    cartItems,
    cartDetailed: getCartDetailed(),
    cartTotal,
    cartCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    isAuthenticated,
  };
};