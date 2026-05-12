import { useState } from "react";
import { ShoppingCart, PlusCircle, X, Save, XCircle, Pencil, Trash2, AlertTriangle, Eye } from "lucide-react";

type StatutCommande = "En attente" | "Confirmée" | "Expédiée" | "Livrée" | "Annulée";

const STATUTS: StatutCommande[] = ["En attente", "Confirmée", "Expédiée", "Livrée", "Annulée"];

type Commande = {
  id: string;
  client: string;
  email: string;
  montant: string;
  date: string;
  statut: StatutCommande;
  articles: number;
};

const initialForm = {
  client: "",
  email: "",
  montant: "",
  date: new Date().toISOString().split("T")[0],
  statut: "En attente" as StatutCommande,
  articles: 1,
};

// Données par défaut
const commandesParDefaut: Commande[] = [
  { id: "CMD-001", client: "Jean Dupont", email: "jean@email.com", montant: "125 000 Ar", date: "2025-05-10", statut: "Confirmée", articles: 3 },
  { id: "CMD-002", client: "Marie Claire", email: "marie@email.com", montant: "2 500 Ar", date: "2025-05-09", statut: "Expédiée", articles: 1 },
  { id: "CMD-003", client: "Pierre Andrian", email: "pierre@email.com", montant: "89 900 Ar", date: "2025-05-08", statut: "En attente", articles: 2 },
  { id: "CMD-004", client: "Lala Rasoa", email: "lala@email.com", montant: "450 000 Ar", date: "2025-05-07", statut: "Livrée", articles: 5 },
  { id: "CMD-005", client: "Toky Randria", email: "toky@email.com", montant: "12 500 Ar", date: "2025-05-06", statut: "Annulée", articles: 1 },
];

const AdminCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>(commandesParDefaut);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);

  const inputClass = "w-full px-3 py-2 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 focus:border-black dark:focus:border-white transition";

  // Générer un ID de commande unique
  const genererId = () => {
    const dernierId = commandes.length > 0 
      ? Math.max(...commandes.map(c => parseInt(c.id.split("-")[1])))
      : 0;
    return `CMD-${String(dernierId + 1).padStart(3, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenEdit = (commande: Commande) => {
    setSelectedCommande(commande);
    setEditForm({
      client: commande.client,
      email: commande.email,
      montant: commande.montant.replace(/[^0-9]/g, ""),
      date: commande.date,
      statut: commande.statut,
      articles: commande.articles,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (commande: Commande) => {
    setSelectedCommande(commande);
    setShowDeleteAlert(true);
  };

  const handleAjouter = () => {
    const nouvelleCommande: Commande = {
      id: genererId(),
      client: form.client,
      email: form.email,
      montant: `${parseInt(form.montant).toLocaleString()} Ar`,
      date: form.date,
      statut: form.statut,
      articles: form.articles,
    };
    setCommandes([nouvelleCommande, ...commandes]);
    setShowModal(false);
    setForm(initialForm);
  };

  const handleModifier = () => {
    if (!selectedCommande) return;
    const commandesModifiees = commandes.map(c => 
      c.id === selectedCommande.id 
        ? {
            ...c,
            client: editForm.client,
            email: editForm.email,
            montant: `${parseInt(editForm.montant).toLocaleString()} Ar`,
            date: editForm.date,
            statut: editForm.statut,
            articles: editForm.articles,
          }
        : c
    );
    setCommandes(commandesModifiees);
    setShowEditModal(false);
    setSelectedCommande(null);
  };

  const handleSupprimer = () => {
    if (!selectedCommande) return;
    setCommandes(commandes.filter(c => c.id !== selectedCommande.id));
    setShowDeleteAlert(false);
    setSelectedCommande(null);
  };

  const getStatutStyle = (statut: StatutCommande) => {
    const styles = {
      "En attente": "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      "Confirmée": "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      "Expédiée": "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400",
      "Livrée": "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
      "Annulée": "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    };
    return styles[statut];
  };

  // Formulaire réutilisable
  const FormFields = ({ f, onChange }: { f: typeof initialForm; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Client <span className="text-black dark:text-white">*</span></label>
          <input name="client" value={f.client} onChange={onChange} placeholder="Nom du client" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Email <span className="text-black dark:text-white">*</span></label>
          <input name="email" type="email" value={f.email} onChange={onChange} placeholder="client@email.com" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Montant (Ar)</label>
          <input name="montant" value={f.montant} onChange={onChange} placeholder="Ex: 125000" type="number" min="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Date</label>
          <input name="date" value={f.date} onChange={onChange} type="date" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Articles</label>
          <input name="articles" value={f.articles} onChange={onChange} type="number" min="1" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Statut</label>
        <select name="statut" value={f.statut} onChange={onChange} className={inputClass}>
          {STATUTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Commandes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          Ajouter une commande
        </button>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Client</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Montant</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Articles</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Date</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Statut</th>
              <th className="text-right py-3 px-4 text-black/50 dark:text-white/50 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd) => (
              <tr key={cmd.id} className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition">
                <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">{cmd.id}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-black dark:text-white">{cmd.client}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{cmd.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-black dark:text-white">{cmd.montant}</td>
                <td className="py-3 px-4 text-black/70 dark:text-white/70">{cmd.articles}</td>
                <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">{cmd.date}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(cmd.statut)}`}>
                    {cmd.statut}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(cmd)}
                      className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(cmd)}
                      className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL AJOUTER */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-black dark:text-white" />
                </div>
                <h2 className="text-lg font-semibold text-black dark:text-white">Ajouter une commande</h2>
              </div>
              <button onClick={() => { setShowModal(false); setForm(initialForm); }} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X className="h-5 w-5 text-black/50 dark:text-white/50" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <FormFields f={form} onChange={handleChange} />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
              <button onClick={() => { setShowModal(false); setForm(initialForm); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <XCircle className="h-4 w-4" /> Annuler
              </button>
              <button onClick={handleAjouter}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition">
                <Save className="h-4 w-4" /> Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                  <Pencil className="h-5 w-5 text-black dark:text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black dark:text-white">Modifier la commande</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 font-mono">{selectedCommande?.id}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X className="h-5 w-5 text-black/50 dark:text-white/50" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <FormFields f={editForm} onChange={handleEditChange} />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
              <button onClick={() => setShowEditModal(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <XCircle className="h-4 w-4" /> Annuler
              </button>
              <button onClick={handleModifier}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition">
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTE SUPPRESSION */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-black/5 dark:bg-white/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-black dark:text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">Confirmer la suppression</h3>
                <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                  Voulez-vous vraiment supprimer la commande <span className="font-medium text-black dark:text-white">"{selectedCommande?.id}"</span> de <span className="font-medium text-black dark:text-white">{selectedCommande?.client}</span> ? Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteAlert(false)}
                className="flex-1 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleSupprimer}
                className="flex-1 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommandes;