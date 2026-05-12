import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, X, Home, Building, Package, Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Adresse = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  complement?: string;
  codePostal: string;
  ville: string;
  pays: string;
  estParDefaut: boolean;
  type: "maison" | "appartement" | "bureau";
};

const DashboardAdresses = () => {
  const [adresses, setAdresses] = useState<Adresse[]>([
    {
      id: "1",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "034 12 345 67",
      adresse: "123 Avenue de l'Indépendance",
      complement: "Lot II J 151",
      codePostal: "101",
      ville: "Antananarivo",
      pays: "Madagascar",
      estParDefaut: true,
      type: "maison",
    },
    {
      id: "2",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "034 12 345 67",
      adresse: "45 Rue du Commerce",
      complement: "",
      codePostal: "501",
      ville: "Toamasina",
      pays: "Madagascar",
      estParDefaut: false,
      type: "bureau",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedAdresse, setSelectedAdresse] = useState<Adresse | null>(null);
  const [form, setForm] = useState<Partial<Adresse>>({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
    complement: "",
    codePostal: "",
    ville: "",
    pays: "Madagascar",
    estParDefaut: false,
    type: "maison",
  });

  const inputClass = "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleOpenAdd = () => {
    setForm({
      nom: "",
      prenom: "",
      telephone: "",
      adresse: "",
      complement: "",
      codePostal: "",
      ville: "",
      pays: "Madagascar",
      estParDefaut: adresses.length === 0,
      type: "maison",
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

  const handleSave = () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.adresse || !form.codePostal || !form.ville) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (selectedAdresse) {
      // Modification
      const updatedAdresses = adresses.map(a => 
        a.id === selectedAdresse.id ? { ...a, ...form as Adresse } : a
      );
      
      // Gérer l'adresse par défaut
      if (form.estParDefaut) {
        updatedAdresses.forEach(a => {
          if (a.id !== selectedAdresse.id) a.estParDefaut = false;
        });
      }
      
      setAdresses(updatedAdresses);
      toast.success("Adresse modifiée avec succès");
    } else {
      // Ajout
      const newAdresse: Adresse = {
        id: Date.now().toString(),
        nom: form.nom!,
        prenom: form.prenom!,
        telephone: form.telephone!,
        adresse: form.adresse!,
        complement: form.complement || "",
        codePostal: form.codePostal!,
        ville: form.ville!,
        pays: form.pays || "Madagascar",
        estParDefaut: form.estParDefaut || adresses.length === 0,
        type: form.type as "maison" | "appartement" | "bureau",
      };
      
      let newAdresses = [newAdresse, ...adresses];
      
      if (newAdresse.estParDefaut) {
        newAdresses = newAdresses.map(a => {
          if (a.id !== newAdresse.id) a.estParDefaut = false;
          return a;
        });
      }
      
      setAdresses(newAdresses);
      toast.success("Adresse ajoutée avec succès");
    }
    
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!selectedAdresse) return;
    
    const wasDefault = selectedAdresse.estParDefaut;
    const newAdresses = adresses.filter(a => a.id !== selectedAdresse.id);
    
    if (wasDefault && newAdresses.length > 0) {
      newAdresses[0].estParDefaut = true;
    }
    
    setAdresses(newAdresses);
    setShowDeleteAlert(false);
    setSelectedAdresse(null);
    toast.success("Adresse supprimée avec succès");
  };

  const handleSetDefault = (id: string) => {
    setAdresses(adresses.map(a => ({
      ...a,
      estParDefaut: a.id === id
    })));
    toast.success("Adresse par défaut mise à jour");
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "maison": return <Home className="h-4 w-4" />;
      case "appartement": return <Building className="h-4 w-4" />;
      case "bureau": return <Package className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "maison": return "Maison";
      case "appartement": return "Appartement";
      case "bureau": return "Bureau";
      default: return type;
    }
  };

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
                adresse.estParDefaut ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              {/* Badge par défaut */}
              {adresse.estParDefaut && (
                <div className="absolute -top-2 -left-2">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                    <Star className="h-3 w-3 fill-current" />
                    PAR DÉFAUT
                  </div>
                </div>
              )}

              {/* Type d'adresse */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${
                  adresse.type === "maison" ? "bg-green-500/10 text-green-600" :
                  adresse.type === "bureau" ? "bg-blue-500/10 text-blue-600" :
                  "bg-purple-500/10 text-purple-600"
                }`}>
                  {getTypeIcon(adresse.type)}
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {getTypeLabel(adresse.type)}
                </span>
              </div>

              {/* Informations */}
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {adresse.prenom} {adresse.nom}
                </p>
                <p className="text-sm text-muted-foreground">{adresse.telephone}</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {adresse.adresse}
                  {adresse.complement && <><br />{adresse.complement}</>}
                  <br />
                  {adresse.codePostal} {adresse.ville}
                  <br />
                  {adresse.pays}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                {!adresse.estParDefaut && (
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

      {/* MODAL AJOUTER/MODIFIER */}
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
                    <label className="block text-sm font-medium text-foreground mb-2">Prénom <span className="text-destructive">*</span></label>
                    <input name="prenom" value={form.prenom || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nom <span className="text-destructive">*</span></label>
                    <input name="nom" value={form.nom || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Téléphone <span className="text-destructive">*</span></label>
                  <input name="telephone" value={form.telephone || ""} onChange={handleInputChange} placeholder="034 12 345 67" className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Adresse <span className="text-destructive">*</span></label>
                  <input name="adresse" value={form.adresse || ""} onChange={handleInputChange} placeholder="Numéro et nom de rue" className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Complément (optionnel)</label>
                  <input name="complement" value={form.complement || ""} onChange={handleInputChange} placeholder="Appartement, étage, bâtiment..." className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Code postal <span className="text-destructive">*</span></label>
                    <input name="codePostal" value={form.codePostal || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ville <span className="text-destructive">*</span></label>
                    <input name="ville" value={form.ville || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Pays</label>
                    <select name="pays" value={form.pays} onChange={handleInputChange} className={inputClass}>
                      <option value="Madagascar">Madagascar</option>
                      <option value="France">France</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>


                

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type d'adresse</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "maison", label: "🏠 Maison" },
                      { value: "appartement", label: "🏢 Appartement" },
                      { value: "bureau", label: "💼 Bureau" }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, type: type.value as Adresse["type"] }))}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition border ${
                          form.type === type.value
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
                    id="estParDefaut"
                    name="estParDefaut"
                    checked={form.estParDefaut || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="estParDefaut" className="text-sm text-foreground">
                    Définir comme adresse par défaut
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
              {selectedAdresse?.estParDefaut && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Cette adresse est votre adresse par défaut. Une autre adresse sera définie par défaut.
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