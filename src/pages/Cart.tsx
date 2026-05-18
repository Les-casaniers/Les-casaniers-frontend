import { SiteLayout } from "@/components/site/SiteLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Tag, Loader2, Heart, X, Check, MapPin, Home, Building, Package, Euro, DollarSign } from "lucide-react";
import { formatAr } from "@/lib/products";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import fosa from "@/assets/casaniers-mascot.png";
import { useCartApi } from "@/hooks/useCartApi";
import api from "@/service/api";
import { useNavigate } from 'react-router-dom';//pour la navigation 

// Types
type Adresse = {
  id: number;
  utilisateur_id: number;
  etiquette: string;
  nom_complet: string;
  telephone: string;
  adresse_ligne1: string;
  adresse_ligne2: string | null;
  ville: string;
  region: string;
  code_postal: string;
  pays: string;
  par_defaut_expedition: boolean;
};

type DevisResponse = {
  id: number;
  utilisateur_id: number;
  panier_id: number;
  statut: string;
  montant_total: number;
  devise: string;
};

const Cart = () => {
  const { cartDetailed, cartTotal, isLoading, updateQuantity, removeFromCart, clearCart, refreshCart, cartItems } = useCartApi();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);
  const previousCartCountRef = useRef(0);
  //Eto ftsn aloha
  const navigate = useNavigate();
  
  // État du modal de devis
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommandeSent, setIsCommandeSent] = useState(false);
  
  const [devisId, setDevisId] = useState<number | null>(null);
  const [devisValide, setDevisValide] = useState(false);
  
  // État du formulaire de devis
  const [devisForm, setDevisForm] = useState({
    besoinLivraison: false,
    adresseId: 0,
    adressePersonnalisee: "",
    note: "",
    devise: "MGA"
  });
  
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [isLoadingAdresses, setIsLoadingAdresses] = useState(false);

  useEffect(() => { 
    document.title = "Mon panier — Les Casaniers Madagascar"; 
  }, []);

  // Vérifier les nouveaux ajouts au panier
  useEffect(() => {
    const currentCount = cartDetailed.length;
    if (currentCount > previousCartCountRef.current && currentCount > 0) {
      const newItem = cartDetailed[0];
      if (newItem) {
        setLastAddedProduct(newItem.product.name);
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 3000);
      }
    }
    previousCartCountRef.current = currentCount;
  }, [cartDetailed]);

  const shipping = cartTotal > 5000000 ? 0 : 50000;
  const total = Math.max(0, cartTotal - discount + shipping);

  const applyPromo = () => {
    if (promo.toUpperCase() === "FOSA10") {
      setDiscount(Math.round(cartTotal * 0.1));
      toast({ title: "Code appliqué !", description: "-10% sur votre commande." });
    } else {
      toast({ title: "Code invalide", description: "Essayez FOSA10." });
    }
  };

  const handleSetQty = (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    updateQuantity(itemId, newQty);
  };

  const handleRemove = (itemId: number, productName: string) => {
    removeFromCart(itemId);
    toast({ title: "Article supprimé", description: `${productName} a été retiré de votre panier.` });
  };

  const handleClearCart = () => {
    if (cartDetailed.length > 0) clearCart();
  };

  // Charger les adresses de l'utilisateur
  const fetchAdresses = async () => {
    try {
      setIsLoadingAdresses(true);
      const response = await api.get('/adresses');
      let adressesData: Adresse[] = [];
      if (response.data.data) adressesData = Array.isArray(response.data.data) ? response.data.data : [];
      else if (Array.isArray(response.data)) adressesData = response.data;
      setAdresses(adressesData);
      
      // Sélectionner l'adresse par défaut si disponible
      const defaultAdresse = adressesData.find(a => a.par_defaut_expedition);
      if (defaultAdresse) {
        setDevisForm(prev => ({ ...prev, adresseId: defaultAdresse.id }));
      }
    } catch (error) {
      console.error("Erreur chargement adresses:", error);
    } finally {
      setIsLoadingAdresses(false);
    }
  };

  // Ouvrir le modal de devis
  const handleOpenDevisModal = async () => {
    if (cartDetailed.length === 0) {
      toast({ title: "Panier vide", description: "Ajoutez des produits avant de demander un devis.", variant: "destructive" });
      return;
    }
    setShowDevisModal(true);
    setIsCommandeSent(false);
    setDevisId(null);
    await fetchAdresses();
  };

  // Calcul du sous-total
  const calculateSubtotal = () => {
    return cartDetailed.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Calcul des frais de livraison
  const getLivraisonAmount = () => {
    if (!devisForm.besoinLivraison) return 0;
    return 50000; // Frais fixes pour l'exemple
  };

  // Calcul du total avec livraison
  const getTotalWithLivraison = () => {
    const subtotal = calculateSubtotal();
    const livraison = getLivraisonAmount();
    const discountAmount = discount;
    return subtotal - discountAmount + livraison;
  };

  // Formater le prix selon la devise
  const formatPriceWithDevise = (prix: number, devise: string) => {
    if (devise === 'EUR') return `€ ${prix.toLocaleString('fr-FR')}`;
    if (devise === 'USD') return `$ ${prix.toLocaleString('fr-FR')}`;
    return `${prix.toLocaleString('fr-FR')} Ar`;
  };

  // Générer un numéro de commande unique
  const generateOrderNumber = (prefix: string, lastNumber: number) => {
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `${prefix}-${newNumber}`;
  };

  // Valider et enregistrer le devis
//   const handleValidateDevis = async () => {
//   try {
//     setIsSubmitting(true);
    
//     // Récupérer l'utilisateur
//     const userResponse = await api.get('/utilisateurs/profile');
//     const userData = userResponse.data.data || userResponse.data;
//     const userId = userData.id;
    
//     // Calculer le montant total
//     const montantTotal = getTotalWithLivraison();
    
//     // Récupérer l'ID du panier
//     const firstCartItem = cartItems[0];
//     const panierId = firstCartItem?.id;
    
//     // Données du devis
//     const devisData = {
//       utilisateur_id: userId,
//       panier_id: panierId,
//       statut: 'en_attente',
//       note: devisForm.note || "",
//       montant_total: montantTotal,
//       devise: devisForm.devise
//     };
    
//     console.log("📦 Envoi devis:", devisData);
    
//     const response = await api.post('/devis', devisData);
    
//     console.log("📦 Réponse devis:", response.data);
    
//     if (response.data.success && response.data.data) {
//       const newDevisId = response.data.data.id;
      
//       if (newDevisId) {
//         setDevisId(newDevisId);
//         setDevisValide(true);
//         console.log("✅ Devis créé avec ID:", newDevisId);
        
//         toast({ 
//           title: "✅ Devis enregistré", 
//           description: `Votre devis N°${newDevisId} a été enregistré avec succès !`,
//           duration: 3000
//         });
//       } else {
//         throw new Error("ID non trouvé dans la réponse");
//       }
//     } else {
//       throw new Error(response.data.message || "Erreur lors de la création");
//     }
    
//   } catch (error: any) {
//     console.error("❌ Erreur création devis:", error);
//     console.error("❌ Réponse erreur:", error.response?.data);
//     console.error("❌ Status:", error.response?.status);
    
//     let errorMessage = "Impossible de créer le devis";
    
//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.response?.data?.errors) {
//       const errors = Object.values(error.response.data.errors).flat();
//       errorMessage = errors.join(', ');
//     }
    
//     toast({ 
//       title: "Erreur", 
//       description: errorMessage,
//       variant: "destructive"
//     });
//   } finally {
//     setIsSubmitting(false);
//   }
// };
  const handleValidateDevis = async () => {
  try {
    setIsSubmitting(true);
    
    // Récupérer l'utilisateur
    const userResponse = await api.get('/utilisateurs/profile');
    const userData = userResponse.data.data || userResponse.data;
    const userId = userData.id;
    
    // Calculer le montant total
    const montantTotal = getTotalWithLivraison();
    
    // Récupérer l'ID du panier
    const firstCartItem = cartItems[0];
    const panierId = firstCartItem?.id;
    
    // Données du devis
    const devisData = {
      utilisateur_id: userId,
      panier_id: panierId,
      statut: 'en_attente',
      note: devisForm.note || "",
      montant_total: montantTotal,
      devise: devisForm.devise
    };
    
    console.log("📦 Envoi devis:", devisData);
    
    const response = await api.post('/devis', devisData);
    
    console.log("📦 Réponse devis:", response.data);
    
    if (response.data.success && response.data.data) {
      const newDevisId = response.data.data.id;
      
      if (newDevisId) {
        setDevisId(newDevisId);
        setDevisValide(true);
        console.log("✅ Devis créé avec ID:", newDevisId);
        
        toast({ 
          title: "✅ Devis enregistré", 
          description: `Votre devis N°${newDevisId} a été enregistré avec succès !`,
          duration: 3000
        });
      } else {
        throw new Error("ID non trouvé dans la réponse");
      }
    } else {
      throw new Error(response.data.message || "Erreur lors de la création");
    }
    
  } catch (error: any) {
    console.error("❌ Erreur création devis:", error);
    
    let errorMessage = "Impossible de créer le devis";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      errorMessage = errors.join(', ');
    }
    
    toast({ 
      title: "Erreur", 
      description: errorMessage,
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Valider et lancer la commande //teto commente farany
  //const handleCommander = async () => {
//   // Validation 1 : Devis validé ?
//   if (!devisId) {
//     toast({ 
//       title: "Validation requise", 
//       description: "Veuillez d'abord valider le devis avant de commander.",
//       variant: "destructive"
//     });
//     return;
//   }
  
//   // Validation 2 : Adresse de livraison si besoin
//   if (devisForm.besoinLivraison && devisForm.adresseId === 0 && !devisForm.adressePersonnalisee) {
//     toast({ 
//       title: "Adresse requise", 
//       description: "Veuillez sélectionner ou saisir une adresse de livraison.",
//       variant: "destructive"
//     });
//     return;
//   }
  
//   try {
//     setIsSubmitting(true);
    
//     // Calcul des totaux
//     const sousTotal = calculateSubtotal() - discount;
//     const livraison = getLivraisonAmount();
    
//     // Adresse de livraison
//     let adresseExpeditionId = null;
//     if (devisForm.besoinLivraison && devisForm.adresseId > 0) {
//       adresseExpeditionId = devisForm.adresseId;
//     }
    
//     // Préparer les données pour le backend
//     const commandeData: any = {
//       livraison: livraison,
//       devise: devisForm.devise,
//       adresse_expedition_id: adresseExpeditionId,
//       adresse_facturation_id: null,
//       devis_id: devisId,
//     };
    
//     // Ajouter meta_json avec les détails
//     commandeData.meta_json = {
//       note: devisForm.note || null,
//       date_creation: new Date().toISOString(),
//       besoin_livraison: devisForm.besoinLivraison,
//       adresse_personnalisee: devisForm.adressePersonnalisee || null,
//       produits: cartDetailed.map(item => ({
//         id: item.product.id,
//         nom: item.product.name,
//         quantite: item.qty,
//         prix_unitaire: item.product.price,
//         sous_total: item.subtotal
//       }))
//     };

//     {/* Champ caché pour l'ID du devis */}
//     {devisId && (
//       <div className="bg-green-500/10 border border-green-500 rounded-xl p-3">
//         <div className="flex items-center gap-2">
//           <Check className="h-4 w-4 text-green-500" />
//           <p className="text-sm text-green-600 dark:text-green-400">
//             ✅ Devis validé N°{devisId}
//           </p>
//         </div>
//       </div>
//     )}
    
//     console.log("📦 Envoi commande au backend:", JSON.stringify(commandeData, null, 2));
    
//     const response = await api.post('/commandes', commandeData);
    
//     if (response.status === 200 || response.status === 201) {
//       const commandeDataResponse = response.data.data;
//       const commandeUuid = commandeDataResponse?.commande_uuid;
      
//       toast({ 
//         title: "✅ Commande enregistrée !", 
//         description: `Votre commande ${commandeUuid} a été créée avec succès.`,
//         duration: 4000
//       });
      
//       setShowDevisModal(false);
      
//       // Vider le panier après commande
//       await clearCart();
      
//       // Rediriger vers le catalogue après 2 secondes
//       setTimeout(() => {
//         navigate('/catalogue', { 
//           state: { 
//             message: `Commande ${commandeUuid} créée avec succès !`,
//             type: 'success' 
//           } 
//         });
//       }, 2000);
//     }
    
//   } catch (error: any) {
//     console.error("❌ Erreur détaillée:", error);
    
//     if (error.response?.data?.errors) {
//       const errors = error.response.data.errors;
//       console.log("📋 Erreurs de validation:", errors);
      
//       Object.keys(errors).forEach(key => {
//         toast({ 
//           title: `Erreur: ${key}`, 
//           description: errors[key][0],
//           variant: "destructive"
//         });
//       });
//     } else if (error.response?.data?.message) {
//       toast({ 
//         title: "Erreur", 
//         description: error.response.data.message,
//         variant: "destructive"
//       });
//     } else {
//       toast({ 
//         title: "Erreur", 
//         description: "Impossible de créer la commande. Vérifiez votre connexion.",
//         variant: "destructive"
//       });
//     }
//   } finally {
//     setIsSubmitting(false);
//   }
// };

  const handleCommander = async () => {
    console.log("🔍 Vérification devisId:", devisId);
    console.log("🔍 devisValide:", devisValide);
    
    // Validation 1 : Devis validé ?
    if (!devisId || !devisValide) {
      toast({ 
        title: "Validation requise", 
        description: "Veuillez d'abord valider le devis avant de commander.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation 2 : Adresse de livraison si besoin
    if (devisForm.besoinLivraison && devisForm.adresseId === 0 && !devisForm.adressePersonnalisee) {
      toast({ 
        title: "Adresse requise", 
        description: "Veuillez sélectionner ou saisir une adresse de livraison.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calcul des totaux
      const livraison = getLivraisonAmount();
      
      // Adresse de livraison
      let adresseExpeditionId = null;
      if (devisForm.besoinLivraison && devisForm.adresseId > 0) {
        adresseExpeditionId = devisForm.adresseId;
      }
      
      // Préparer les données pour le backend - INCLURE DEVIS_ID
      const commandeData: any = {
        livraison: livraison,
        devise: devisForm.devise,
        adresse_expedition_id: adresseExpeditionId,
        adresse_facturation_id: null,
        devis_id: devisId,  // ← L'ID du devis est ici
      };
      
      // Ajouter meta_json avec les détails
      commandeData.meta_json = {
        note: devisForm.note || null,
        date_creation: new Date().toISOString(),
        besoin_livraison: devisForm.besoinLivraison,
        adresse_personnalisee: devisForm.adressePersonnalisee || null,
        devis_id: devisId,  // ← Ajouté aussi dans meta_json pour sécurité
        produits: cartDetailed.map(item => ({
          id: item.product.id,
          nom: item.product.name,
          quantite: item.qty,
          prix_unitaire: item.product.price,
          sous_total: item.subtotal
        }))
      };
      
      console.log("📦 Envoi commande avec devis_id:", devisId);
      console.log("📦 Commande data:", JSON.stringify(commandeData, null, 2));
      
      const response = await api.post('/commandes', commandeData);
      
      if (response.status === 200 || response.status === 201) {
        const commandeDataResponse = response.data.data;
        const commandeUuid = commandeDataResponse?.commande_uuid;
        
        toast({ 
          title: "✅ Commande enregistrée !", 
          description: `Votre commande ${commandeUuid} a été créée avec succès.`,
          duration: 4000
        });
        
        setShowDevisModal(false);
        setDevisId(null);
        setDevisValide(false);
        
        // Vider le panier après commande
        await clearCart();
        
        // Rediriger vers le catalogue après 2 secondes
        setTimeout(() => {
          navigate('/catalogue', { 
            state: { 
              message: `Commande ${commandeUuid} créée avec succès !`,
              type: 'success' 
            } 
          });
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("❌ Erreur détaillée:", error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.log("📋 Erreurs de validation:", errors);
        
        Object.keys(errors).forEach(key => {
          toast({ 
            title: `Erreur: ${key}`, 
            description: errors[key][0],
            variant: "destructive"
          });
        });
      } else if (error.response?.data?.message) {
        toast({ 
          title: "Erreur", 
          description: error.response.data.message,
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Erreur", 
          description: "Impossible de créer la commande. Vérifiez votre connexion.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <section className="container-x py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement de votre panier...</p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (cartDetailed.length === 0) {
    return (
      <SiteLayout>
        <section className="container-x py-12">
          <div className="relative card-soft p-12 text-center max-w-xl mx-auto overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                <Heart className="h-64 w-64 text-rose-500" />
              </div>
            </div>
            <div className="relative">
              <img src={fosa} alt="Le Fosa" className="h-28 w-28 mx-auto animate-float mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">Le Fosa s'ennuie un peu ici…</h2>
              <p className="text-muted-foreground mb-6">Aucun article dans votre panier. Allez vite découvrir nos configurations !</p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/catalogue">Explorer le catalogue <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-x py-12">
        {/* Header existant... */}
        <div className="mb-8">
          <div className="pill mb-3"><ShoppingBag className="h-3.5 w-3.5 text-accent" /> Le Bond</div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">Votre panier</h1>
          <p className="text-muted-foreground mt-2">{cartDetailed.length} article{cartDetailed.length > 1 ? 's' : ''} dans votre panier</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Liste des produits - inchangée */}
          <div className="lg:col-span-8 space-y-4">
            {cartDetailed.map((item: any) => (
              <div key={item.id} className="card-soft p-5 flex gap-4 hover-lift relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
                </div>
                <Link to={`/produit/${item.product.id}`} className="shrink-0">
                  <div className="h-28 w-28 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="text-4xl">{item.product.category === 'pc' ? '🖥️' : item.product.category === 'portable' ? '💻' : item.product.category === 'composant' ? '🔧' : item.product.category === 'peripherique' ? '🎮' : '📦'}</span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wider text-accent">{item.product.category || 'Produit'}</div>
                  <Link to={`/produit/${item.product.id}`} className="font-display font-bold text-lg hover:text-accent transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground italic line-clamp-1">"{item.product.tagline || 'Article ajouté au panier'}"</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center bg-secondary rounded-full">
                      <button onClick={() => handleSetQty(item.id, item.qty - 1)} className="h-9 w-9 flex items-center justify-center hover:text-accent"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center font-semibold tabular-nums text-sm">{item.qty}</span>
                      <button onClick={() => handleSetQty(item.id, item.qty + 1)} className="h-9 w-9 flex items-center justify-center hover:text-accent"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-display font-bold text-primary">{formatAr(item.subtotal)}</div>
                      <button onClick={() => handleRemove(item.id, item.product.name)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <button onClick={handleClearCart} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"><Trash2 className="h-3 w-3" /> Vider le panier</button>
              <Link to="/catalogue" className="text-xs text-accent hover:underline">← Continuer mes achats</Link>
            </div>
          </div>

          {/* Sidebar avec bouton Demander mon devis */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-4">
            <div className="card-soft p-6">
              <h3 className="font-display font-bold text-lg mb-4">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <Row label="Sous-total" value={formatAr(calculateSubtotal())} />
                {discount > 0 && <Row label="Remise FOSA10" value={`- ${formatAr(discount)}`} accent />}
                <Row label="Livraison" value={shipping === 0 ? "Offerte 🎉" : formatAr(shipping)} />
              </div>
              <div className="border-t border-border mt-4 pt-4 flex items-end justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display font-bold text-2xl text-primary">{formatAr(total)}</span>
              </div>

              <div className="flex gap-2 mt-4">
                <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Code promo (FOSA10)" className="flex-1 h-10 px-4 rounded-full bg-secondary text-sm" />
                <Button variant="soft" size="sm" onClick={applyPromo}><Tag className="h-3.5 w-3.5" /></Button>
              </div>

              {/* Bouton Demander mon devis MODIFIÉ */}
              <Button variant="hero" size="lg" className="w-full mt-4 group" onClick={handleOpenDevisModal}>
                Demander mon devis 
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="soft" size="sm" className="w-full mt-2" asChild>
                <Link to="/catalogue">Continuer mes achats</Link>
              </Button>
            </div>

            <div className="card-soft p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /><span>Paiement sécurisé · 3× sans frais</span></div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /><span>Livraison gratuite dès 5 000 000 Ar</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* MODAL DEVIS */}
      {showDevisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><Package className="h-5 w-5 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Demande de devis</h2>
                  <p className="text-sm text-muted-foreground">Récapitulatif de votre panier</p>
                </div>
              </div>
              <button onClick={() => setShowDevisModal(false)} className="p-2 rounded-lg hover:bg-secondary transition"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            {/* Contenu du modal - Scrollable */}
            <div className="overflow-y-auto p-6 flex-1 space-y-6">
              {/* Liste des produits */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">📦 Produits sélectionnés</h3>
                <div className="space-y-3">
                  {cartDetailed.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Quantité: {item.qty}</p>
                      </div>
                      <p className="font-semibold text-primary">{formatPriceWithDevise(item.subtotal, devisForm.devise)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devise */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">💰 Devise</label>
                <select 
                  value={devisForm.devise} 
                  onChange={(e) => setDevisForm(prev => ({ ...prev, devise: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="MGA">🇲🇬 Ariary (MGA)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="USD">🇺🇸 Dollar (USD)</option>
                </select>
              </div>

              {/* Besoin de livraison - Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Besoin de livraison ?</p>
                    <p className="text-xs text-muted-foreground">Activez cette option si vous souhaitez une livraison à domicile</p>
                  </div>
                </div>
                <button
                  onClick={() => setDevisForm(prev => ({ ...prev, besoinLivraison: !prev.besoinLivraison }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${devisForm.besoinLivraison ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${devisForm.besoinLivraison ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Adresse de livraison (si besoin) */}
              {devisForm.besoinLivraison && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">📍 Adresse de livraison</label>
                  
                  {/* Sélection des adresses existantes */}
                  {adresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Ou choisissez une adresse existante :</p>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {adresses.map((adr) => (
                          <label key={adr.id} className="flex items-start gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-secondary/20">
                            <input
                              type="radio"
                              name="adresse"
                              checked={devisForm.adresseId === adr.id}
                              onChange={() => setDevisForm(prev => ({ ...prev, adresseId: adr.id, adressePersonnalisee: "" }))}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {adr.etiquette === 'Maison' && <Home className="h-4 w-4 text-green-500" />}
                                {adr.etiquette === 'Appartement' && <Building className="h-4 w-4 text-blue-500" />}
                                {adr.etiquette === 'Bureau' && <Package className="h-4 w-4 text-purple-500" />}
                                <p className="font-medium text-foreground">{adr.nom_complet}</p>
                                {adr.par_defaut_expedition && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Défaut</span>}
                              </div>
                              <p className="text-xs text-muted-foreground">{adr.adresse_ligne1}{adr.adresse_ligne2 && `, ${adr.adresse_ligne2}`}</p>
                              <p className="text-xs text-muted-foreground">{adr.code_postal} {adr.ville}, {adr.region}</p>
                              <p className="text-xs text-muted-foreground">📞 {adr.telephone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ou saisir manuellement */}
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Ou saisissez une nouvelle adresse :</p>
                    <textarea
                      value={devisForm.adressePersonnalisee}
                      onChange={(e) => setDevisForm(prev => ({ ...prev, adressePersonnalisee: e.target.value, adresseId: 0 }))}
                      placeholder="Entrez votre adresse complète (rue, ville, code postal, téléphone)..."
                      rows={3}
                      className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">📝 Note (optionnelle)</label>
                <textarea
                  value={devisForm.note}
                  onChange={(e) => setDevisForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Informations complémentaires pour votre devis..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Récapitulatif des prix */}
              <div className="bg-secondary/20 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-foreground mb-3">💰 Récapitulatif</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{formatPriceWithDevise(calculateSubtotal(), devisForm.devise)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remise</span>
                    <span className="font-medium text-green-600">-{formatPriceWithDevise(discount, devisForm.devise)}</span>
                  </div>
                )}
                {devisForm.besoinLivraison && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-medium">{formatPriceWithDevise(50000, devisForm.devise)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total TTC</span>
                    <span className="text-primary text-lg">{formatPriceWithDevise(getTotalWithLivraison(), devisForm.devise)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer avec boutons */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => setShowDevisModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <Button
                variant="soft"
                onClick={handleValidateDevis}
                disabled={isSubmitting || isCommandeSent}
                className="flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Valider le devis
              </Button>
              <Button
                variant="hero"
                onClick={handleCommander}
                disabled={isSubmitting || !devisId}
                className="flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                Commander
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animation du mascotte */}
      {showHeartAnimation && (
        <div className="fixed bottom-24 right-6 z-50 animate-slide-up pointer-events-none">
          <div className="relative">
            <img src={fosa} alt="Le Fosa" className="h-20 w-20 rounded-full shadow-xl border-2 border-rose-400 animate-bounce-slow" />
            <div className="absolute -top-6 -right-6 animate-heart-beat"><Heart className="h-8 w-8 text-rose-500 fill-rose-500" /></div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1">
              <Heart className="h-3 w-3 text-rose-400 fill-rose-400 animate-float-up delay-0" />
              <Heart className="h-2 w-2 text-rose-300 fill-rose-300 animate-float-up delay-100" />
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-float-up delay-200" />
            </div>
            <div className="absolute -top-16 -left-32 bg-white dark:bg-gray-800 rounded-2xl px-3 py-2 shadow-lg border border-rose-200 dark:border-rose-800 whitespace-nowrap">
              <p className="text-sm font-medium text-rose-500">🐧 *fait un cœur* {lastAddedProduct && <span className="ml-1 text-xs text-muted-foreground">{lastAddedProduct} ajouté ! ❤️</span>}</p>
              <div className="absolute bottom-0 right-4 translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-rose-200 dark:border-rose-800 rotate-45"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-slow { animation: bounce-slow 1s ease-in-out infinite; }
        @keyframes heart-beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
        .animate-heart-beat { animation: heart-beat 0.6s ease-in-out infinite; }
        @keyframes float-up { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-30px) scale(1.5); } }
        .animate-float-up { animation: float-up 1s ease-out forwards; }
        .delay-0 { animation-delay: 0s; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
      `}</style>
    </SiteLayout>
  );
};

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={`tabular-nums ${accent ? "text-accent font-semibold" : ""}`}>{value}</span>
  </div>
);

export default Cart;