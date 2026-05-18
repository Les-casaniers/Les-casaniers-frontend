import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, X, Home, Building, Package, Star, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

// Interface pour les adresses (correspondant à votre table)
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
  par_defaut_facturation: boolean;
  date_creation: string;
  date_modification: string;
};

// Interface pour l'utilisateur connecté
type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
};

const DashboardAdresses = () => {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedAdresse, setSelectedAdresse] = useState<Adresse | null>(null);
  const [form, setForm] = useState<Partial<Adresse>>({
    etiquette: "",
    nom_complet: "",
    telephone: "",
    adresse_ligne1: "",
    adresse_ligne2: "",
    code_postal: "",
    ville: "",
    region: "",
    pays: "Madagascar",
    par_defaut_expedition: false,
    par_defaut_facturation: false,
  });

  // Récupérer l'utilisateur connecté et ses adresses
  useEffect(() => {
    fetchUserAndAdresses();
  }, []);

  const fetchUserAndAdresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Récupérer le profil de l'utilisateur connecté
      const userResponse = await api.get('/utilisateurs/profile');
      console.log("Utilisateur connecté:", userResponse.data);
      
      let currentUser = null;
      if (userResponse.data.success && userResponse.data.data) {
        currentUser = userResponse.data.data;
      } else if (userResponse.data.data) {
        currentUser = userResponse.data.data;
      } else {
        currentUser = userResponse.data;
      }
      
      setUser(currentUser);
      
      // Récupérer les adresses de l'utilisateur connecté
      const adressesResponse = await api.get(`/adresses?utilisateur_id=${currentUser.id}`);
      console.log("Adresses récupérées:", adressesResponse.data);
      
      let userAdresses = [];
      if (adressesResponse.data.data) {
        userAdresses = Array.isArray(adressesResponse.data.data) ? adressesResponse.data.data : [];
      } else if (Array.isArray(adressesResponse.data)) {
        userAdresses = adressesResponse.data;
      } else if (adressesResponse.data.adresses) {
        userAdresses = adressesResponse.data.adresses;
      } else {
        userAdresses = [];
      }
      
      setAdresses(userAdresses);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      setError("Impossible de charger vos adresses. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleOpenAdd = () => {
    // Extraire le prénom et nom depuis nom_complet ou depuis user
    const nomComplet = user ? `${user.prenom} ${user.nom}` : "";
    
    setForm({
      etiquette: "",
      nom_complet: nomComplet,
      telephone: user?.telephone || "",
      adresse_ligne1: "",
      adresse_ligne2: "",
      code_postal: "",
      ville: "",
      region: "",
      pays: "Madagascar",
      par_defaut_expedition: adresses.length === 0,
      par_defaut_facturation: adresses.length === 0,
    });
    setSelectedAdresse(null);
    setShowModal(true);
  };

  const handleOpenEdit = (adresse: Adresse) => {
    setSelectedAdresse(adresse);
    setForm(adresse);
    setShowModal(true);
  };

  const handleOpenDelete = (adresse: Adresse) => {
    setSelectedAdresse(adresse);
    setShowDeleteAlert(true);
  };

  const handleSave = async () => {
    if (!form.nom_complet || !form.telephone || !form.adresse_ligne1 || !form.code_postal || !form.ville || !form.region) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (selectedAdresse) {
        // Modification
        const response = await api.put(`/adresses/${selectedAdresse.id}`, {
          etiquette: form.etiquette,
          nom_complet: form.nom_complet,
          telephone: form.telephone,
          adresse_ligne1: form.adresse_ligne1,
          adresse_ligne2: form.adresse_ligne2 || null,
          ville: form.ville,
          region: form.region,
          code_postal: form.code_postal,
          pays: form.pays,
          par_defaut_expedition: form.par_defaut_expedition,
          par_defaut_facturation: form.par_defaut_facturation,
        });
        
        if (response.data.success) {
          // Gérer l'adresse par défaut
          if (form.par_defaut_expedition) {
            await api.put('/adresses/set-default-expedition', { adresse_id: selectedAdresse.id });
          }
          
          await fetchUserAndAdresses(); // Recharger les adresses
          toast.success("Adresse modifiée avec succès");
        }
      } else {
        // Ajout
        const response = await api.post('/adresses', {
          utilisateur_id: user?.id,
          etiquette: form.etiquette || "Livraison",
          nom_complet: form.nom_complet,
          telephone: form.telephone,
          adresse_ligne1: form.adresse_ligne1,
          adresse_ligne2: form.adresse_ligne2 || null,
          ville: form.ville,
          region: form.region,
          code_postal: form.code_postal,
          pays: form.pays,
          par_defaut_expedition: form.par_defaut_expedition || adresses.length === 0,
          par_defaut_facturation: form.par_defaut_facturation || adresses.length === 0,
        });
        
        if (response.data.success) {
          await fetchUserAndAdresses(); // Recharger les adresses
          toast.success("Adresse ajoutée avec succès");
        }
      }
      
      setShowModal(false);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!selectedAdresse) return;
    
    try {
      const response = await api.delete(`/adresses/${selectedAdresse.id}`);
      
      if (response.data.success) {
        await fetchUserAndAdresses(); // Recharger les adresses
        setShowDeleteAlert(false);
        setSelectedAdresse(null);
        toast.success("Adresse supprimée avec succès");
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put('/adresses/set-default-expedition', { adresse_id: id });
      await fetchUserAndAdresses(); // Recharger les adresses
      toast.success("Adresse par défaut mise à jour");
    } catch (error: any) {
      console.error("Erreur lors du changement d'adresse par défaut:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const getTypeIcon = (etiquette: string) => {
    const type = etiquette?.toLowerCase() || "";
    if (type.includes("maison") || type.includes("home")) return <Home className="h-4 w-4" />;
    if (type.includes("appartement") || type.includes("apartment")) return <Building className="h-4 w-4" />;
    if (type.includes("bureau") || type.includes("office")) return <Package className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  const getTypeLabel = (etiquette: string) => {
    const type = etiquette?.toLowerCase() || "";
    if (type.includes("maison") || type.includes("home")) return "Maison";
    if (type.includes("appartement") || type.includes("apartment")) return "Appartement";
    if (type.includes("bureau") || type.includes("office")) return "Bureau";
    return etiquette || "Adresse";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de vos adresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchUserAndAdresses}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes adresses</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos adresses de livraison</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Ajouter une adresse
        </button>
      </div>

      {/* Liste des adresses */}
      {adresses.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune adresse</h3>
          <p className="text-muted-foreground mb-6">Vous n'avez pas encore ajouté d'adresse de livraison</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {adresses.map((adresse) => (
            <div
              key={adresse.id}
              className={`relative bg-card border rounded-2xl p-5 transition-all hover:shadow-md ${
                adresse.par_defaut_expedition ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              {/* Badge par défaut */}
              {adresse.par_defaut_expedition && (
                <div className="absolute -top-2 -left-2">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                    <Star className="h-3 w-3 fill-current" />
                    PAR DÉFAUT
                  </div>
                </div>
              )}

              {/* Type d'adresse */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  {getTypeIcon(adresse.etiquette)}
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTypeLabel(adresse.etiquette)}
                </span>
              </div>

              {/* Informations */}
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {adresse.nom_complet}
                </p>
                <p className="text-sm text-muted-foreground">{adresse.telephone}</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {adresse.adresse_ligne1}
                  {adresse.adresse_ligne2 && <><br />{adresse.adresse_ligne2}</>}
                  <br />
                  {adresse.code_postal} {adresse.ville}
                  <br />
                  {adresse.region}, {adresse.pays}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                {!adresse.par_defaut_expedition && (
                  <button
                    onClick={() => handleSetDefault(adresse.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(adresse)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleOpenDelete(adresse)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AJOUTER/MODIFIER - Adaptée à votre table */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedAdresse ? "Modifier l'adresse" : "Ajouter une adresse"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedAdresse ? "Modifiez les informations ci-dessous" : "Remplissez les informations de livraison"}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-secondary transition">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nom complet <span className="text-destructive">*</span></label>
                    <input name="nom_complet" value={form.nom_complet || ""} onChange={handleInputChange} className={inputClass} placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Téléphone <span className="text-destructive">*</span></label>
                    <input name="telephone" value={form.telephone || ""} onChange={handleInputChange} placeholder="034 12 345 67" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Adresse ligne 1 <span className="text-destructive">*</span></label>
                  <input name="adresse_ligne1" value={form.adresse_ligne1 || ""} onChange={handleInputChange} placeholder="Numéro et nom de rue" className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Adresse ligne 2 (optionnel)</label>
                  <input name="adresse_ligne2" value={form.adresse_ligne2 || ""} onChange={handleInputChange} placeholder="Appartement, étage, bâtiment..." className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Code postal <span className="text-destructive">*</span></label>
                    <input name="code_postal" value={form.code_postal || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ville <span className="text-destructive">*</span></label>
                    <input name="ville" value={form.ville || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Région <span className="text-destructive">*</span></label>
                    <input name="region" value={form.region || ""} onChange={handleInputChange} className={inputClass} placeholder="Analamanga, Atsinanana..." />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Pays</label>
                  <select name="pays" value={form.pays} onChange={handleInputChange} className={inputClass}>
                    <option value="Madagascar">Madagascar</option>
                    <option value="France">France</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Étiquette</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "Maison", label: "🏠 Maison" },
                      { value: "Appartement", label: "🏢 Appartement" },
                      { value: "Bureau", label: "💼 Bureau" }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, etiquette: type.value }))}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition border ${
                          form.etiquette === type.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="par_defaut_expedition"
                    name="par_defaut_expedition"
                    checked={form.par_defaut_expedition || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="par_defaut_expedition" className="text-sm text-foreground">
                    Définir comme adresse par défaut pour l'expédition
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
                <Check className="h-4 w-4" />
                {selectedAdresse ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Supprimer l'adresse</h3>
              <p className="text-muted-foreground">
                Voulez-vous vraiment supprimer cette adresse ?
              </p>
              {selectedAdresse?.par_defaut_expedition && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Cette adresse est votre adresse par défaut.
                </p>
              )}
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdresses;