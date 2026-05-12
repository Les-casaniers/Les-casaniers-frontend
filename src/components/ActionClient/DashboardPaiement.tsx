import { useState } from "react";
import { CreditCard, Plus, Trash2, Check, X, Star, Shield, Calendar, Lock, Wallet, Building, Smartphone, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type CarteBancaire = {
  id: string;
  type: "visa" | "mastercard" | "amex";
  numero: string;
  titulaire: string;
  expiration: string;
  estParDefaut: boolean;
};

type MoyenPaiement = {
  id: string;
  type: "carte" | "mobile_money" | "virement";
  nom: string;
  details: any;
  estParDefaut: boolean;
};

const DashboardPaiement = () => {
  const [cartes, setCartes] = useState<CarteBancaire[]>([
    {
      id: "1",
      type: "visa",
      numero: "**** **** **** 4242",
      titulaire: "JEAN DUPONT",
      expiration: "12/28",
      estParDefaut: true,
    },
    {
      id: "2",
      type: "mastercard",
      numero: "**** **** **** 5555",
      titulaire: "JEAN DUPONT",
      expiration: "08/27",
      estParDefaut: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CarteBancaire | null>(null);
  const [newCard, setNewCard] = useState({
    numero: "",
    titulaire: "",
    expiration: "",
    cvv: "",
  });

  const getCardIcon = (type: string) => {
    switch(type) {
      case "visa":
        return <div className="text-blue-600 font-bold text-xl">VISA</div>;
      case "mastercard":
        return <div className="text-red-600 font-bold text-xl">MC</div>;
      case "amex":
        return <div className="text-blue-800 font-bold text-xl">AMEX</div>;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getCardBgColor = (type: string) => {
    switch(type) {
      case "visa":
        return "bg-gradient-to-r from-blue-700 to-blue-500";
      case "mastercard":
        return "bg-gradient-to-r from-red-700 to-red-500";
      case "amex":
        return "bg-gradient-to-r from-blue-800 to-blue-600";
      default:
        return "bg-gradient-to-r from-gray-700 to-gray-500";
    }
  };

  const handleSetDefault = (id: string) => {
    setCartes(cartes.map(c => ({
      ...c,
      estParDefaut: c.id === id
    })));
    toast.success("Carte par défaut mise à jour");
  };

  const handleRemoveCard = (card: CarteBancaire) => {
    if (card.estParDefaut && cartes.length > 1) {
      toast.error("Veuillez d'abord définir une autre carte par défaut");
      return;
    }
    setSelectedCard(card);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (!selectedCard) return;
    const wasDefault = selectedCard.estParDefaut;
    const newCartes = cartes.filter(c => c.id !== selectedCard.id);
    
    if (wasDefault && newCartes.length > 0) {
      newCartes[0].estParDefaut = true;
    }
    
    setCartes(newCartes);
    setShowDeleteAlert(false);
    setSelectedCard(null);
    toast.success("Carte supprimée avec succès");
  };

  const handleAddCard = () => {
    if (!newCard.numero || !newCard.titulaire || !newCard.expiration || !newCard.cvv) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const numeroMasque = "**** **** **** " + newCard.numero.slice(-4);
    const type = newCard.numero.startsWith("4") ? "visa" : 
                 newCard.numero.startsWith("5") ? "mastercard" : "amex";

    const nouvelleCarte: CarteBancaire = {
      id: Date.now().toString(),
      type,
      numero: numeroMasque,
      titulaire: newCard.titulaire.toUpperCase(),
      expiration: newCard.expiration,
      estParDefaut: cartes.length === 0,
    };

    let nouvellesCartes = [nouvelleCarte, ...cartes];
    if (nouvelleCarte.estParDefaut) {
      nouvellesCartes = nouvellesCartes.map(c => {
        if (c.id !== nouvelleCarte.id) c.estParDefaut = false;
        return c;
      });
    }

    setCartes(nouvellesCartes);
    setShowAddModal(false);
    setNewCard({ numero: "", titulaire: "", expiration: "", cvv: "" });
    toast.success("Carte ajoutée avec succès");
  };

  const formatNumeroCarte = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumeroCarte(e.target.value);
    setNewCard({ ...newCard, numero: formatted });
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setNewCard({ ...newCard, expiration: value });
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Moyens de paiement</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos cartes bancaires et moyens de paiement</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Ajouter une carte
        </button>
      </div>

      {/* Cartes existantes */}
      {cartes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune carte enregistrée</h3>
          <p className="text-muted-foreground mb-6">Ajoutez votre première carte bancaire pour faciliter vos paiements</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            Ajouter une carte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {cartes.map((carte) => (
            <div
              key={carte.id}
              className={`relative rounded-2xl p-5 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${getCardBgColor(carte.type)}`}
            >
              {/* Badge par défaut */}
              {carte.estParDefaut && (
                <div className="absolute -top-2 -left-2">
                  <div className="flex items-center gap-1 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    PAR DÉFAUT
                  </div>
                </div>
              )}

              {/* Icône carte */}
              <div className="flex justify-between items-start mb-6">
                <div className="text-white/80 text-lg font-bold">
                  {getCardIcon(carte.type)}
                </div>
                <Shield className="h-8 w-8 text-white/60" />
              </div>

              {/* Numéro */}
              <p className="font-mono text-lg tracking-wider mb-4">
                {carte.numero}
              </p>

              {/* Infos */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Titulaire</p>
                  <p className="font-medium text-sm">{carte.titulaire}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Expiration</p>
                  <p className="font-medium text-sm">{carte.expiration}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {!carte.estParDefaut && (
                  <button
                    onClick={() => handleSetDefault(carte.id)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-xs font-medium"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleRemoveCard(carte)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sécurité et informations */}
      <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Paiement sécurisé</h3>
            <p className="text-sm text-muted-foreground">
              Vos informations de paiement sont cryptées et sécurisées. Nous ne stockons jamais votre CVV.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                <span className="text-xs text-muted-foreground">Accepté</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center text-white text-[8px] font-bold">MC</div>
                <span className="text-xs text-muted-foreground">Accepté</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center text-white text-[8px] font-bold">AMEX</div>
                <span className="text-xs text-muted-foreground">Accepté</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center text-white text-[8px] font-bold">3D</div>
                <span className="text-xs text-muted-foreground">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajout carte */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Ajouter une carte</h2>
                  <p className="text-sm text-muted-foreground">Saisissez les informations de votre carte</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-secondary transition">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Aperçu carte */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 text-white">
                <div className="flex justify-between mb-4">
                  <CreditCard className="h-8 w-8 text-white/60" />
                  <Shield className="h-6 w-6 text-white/40" />
                </div>
                <p className="font-mono text-lg tracking-wider mb-3">
                  {newCard.numero || "**** **** **** ****"}
                </p>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase">Titulaire</p>
                    <p>{newCard.titulaire || "NOM PRENOM"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/60 uppercase">Expiration</p>
                    <p>{newCard.expiration || "MM/AA"}</p>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Numéro de carte</label>
                  <input
                    type="text"
                    value={newCard.numero}
                    onChange={handleNumeroChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Titulaire de la carte</label>
                  <input
                    type="text"
                    value={newCard.titulaire}
                    onChange={(e) => setNewCard({ ...newCard, titulaire: e.target.value.toUpperCase() })}
                    placeholder="JEAN DUPONT"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date d'expiration</label>
                    <input
                      type="text"
                      value={newCard.expiration}
                      onChange={handleExpirationChange}
                      placeholder="MM/AA"
                      maxLength={5}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                    <input
                      type="password"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="123"
                      maxLength={4}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Vos informations sont cryptées et sécurisées</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleAddCard} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
                <Check className="h-4 w-4" />
                Ajouter la carte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteAlert && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Supprimer la carte</h3>
              <p className="text-muted-foreground">
                Carte se terminant par <span className="font-semibold text-foreground">{selectedCard.numero.slice(-4)}</span>
              </p>
              {selectedCard.estParDefaut && cartes.length > 1 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Cette carte est votre carte par défaut. Veuillez d'abord en définir une autre.
                </p>
              )}
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPaiement;