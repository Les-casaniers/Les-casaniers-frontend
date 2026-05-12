import { useState } from "react";
import { Package, PlusCircle, X, Save, XCircle, Pencil, Trash2, AlertTriangle } from "lucide-react";

const TYPES_PRODUIT = ["pc", "portable", "composant", "peripherique", "service"] as const;

const initialForm = {
  categorie_id: "",
  reference: "",
  slug: "",
  nom: "",
  description_courte: "",
  description: "",
  type_produit: "" as typeof TYPES_PRODUIT[number] | "",
  prix: "",
  devise: "MGA",
  quantite_stock: "",
  actif: true,
};

type Produit = {
  id: string;
  nom: string;
  prix: string;
  stock: number;
  statut: string;
};

const AdminProduits = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);

  const produits: Produit[] = [
    { id: "PROD-001", nom: "PC Gaming RTX 4060", prix: "2 500 000 Ar", stock: 12, statut: "Actif" },
    { id: "PROD-002", nom: "Clavier Mécanique RGB", prix: "120 000 Ar", stock: 45, statut: "Actif" },
    { id: "PROD-003", nom: "Souris Gaming", prix: "85 000 Ar", stock: 0, statut: "Rupture" },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 focus:border-black dark:focus:border-white transition";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nom = e.target.value;
    const slug = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm(prev => ({ ...prev, nom, slug }));
  };

  const handleEditNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nom = e.target.value;
    const slug = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setEditForm(prev => ({ ...prev, nom, slug }));
  };

  // Ouvrir modal modifier avec les infos du produit pré-remplies
  const handleOpenEdit = (p: Produit) => {
    setSelectedProduit(p);
    setEditForm({
      ...initialForm,
      nom: p.nom,
      slug: p.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      prix: p.prix.replace(/[^0-9]/g, ""),
      quantite_stock: String(p.stock),
      actif: p.statut === "Actif",
    });
    setShowEditModal(true);
  };

  // Ouvrir alert suppression
  const handleOpenDelete = (p: Produit) => {
    setSelectedProduit(p);
    setShowDeleteAlert(true);
  };

  const handleValider = () => {
    console.log("Nouveau produit :", form);
    setShowModal(false);
    setForm(initialForm);
  };

  const handleValiderEdit = () => {
    console.log("Produit modifié :", { id: selectedProduit?.id, ...editForm });
    setShowEditModal(false);
    setSelectedProduit(null);
  };

  const handleConfirmDelete = () => {
    console.log("Supprimer produit :", selectedProduit?.id);
    setShowDeleteAlert(false);
    setSelectedProduit(null);
  };

  // Champs du formulaire — réutilisé pour Ajouter et Modifier
  const FormFields = ({
    f,
    onChange,
    onNomChange,
    onCheckbox,
  }: {
    f: typeof initialForm;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onNomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckbox: (checked: boolean) => void;
  }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Nom <span className="text-black dark:text-white">*</span></label>
          <input name="nom" value={f.nom} onChange={onNomChange} placeholder="Ex: PC Gaming RTX 4060" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Référence</label>
          <input name="reference" value={f.reference} onChange={onChange} placeholder="Ex: REF-001" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Slug <span className="text-black dark:text-white">*</span></label>
        <input name="slug" value={f.slug} onChange={onChange} placeholder="auto-généré depuis le nom" className={`${inputClass} font-mono text-xs`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Type de produit <span className="text-black dark:text-white">*</span></label>
          <select name="type_produit" value={f.type_produit} onChange={onChange} className={inputClass}>
            <option value="">-- Choisir --</option>
            {TYPES_PRODUIT.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Catégorie ID <span className="text-black dark:text-white">*</span></label>
          <input name="categorie_id" value={f.categorie_id} onChange={onChange} placeholder="Ex: 1" type="number" min="1" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Prix</label>
          <input name="prix" value={f.prix} onChange={onChange} placeholder="Ex: 2500000" type="number" min="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Devise</label>
          <select name="devise" value={f.devise} onChange={onChange} className={inputClass}>
            <option value="MGA">MGA</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Stock</label>
          <input name="quantite_stock" value={f.quantite_stock} onChange={onChange} placeholder="Ex: 10" type="number" min="0" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Description courte</label>
        <input name="description_courte" value={f.description_courte} onChange={onChange} placeholder="Résumé en quelques mots..." maxLength={500} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">Description complète</label>
        <textarea name="description" value={f.description} onChange={onChange} placeholder="Description détaillée..." rows={4} className={`${inputClass} resize-none`} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <input type="checkbox" id="actif" checked={f.actif} onChange={e => onCheckbox(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
        <label htmlFor="actif" className="text-sm text-black/70 dark:text-white/70">Produit actif (visible sur le site)</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Produits</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Prix</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Stock</th>
              <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Statut</th>
              <th className="text-right py-3 px-4 text-black/50 dark:text-white/50 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p, idx) => (
              <tr key={idx} className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition">
                <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">{p.id}</td>
                <td className="py-3 px-4 font-medium text-black dark:text-white">{p.nom}</td>
                <td className="py-3 px-4 text-black/70 dark:text-white/70">{p.prix}</td>
                <td className="py-3 px-4">
                  <span className={p.stock === 0 ? "text-black dark:text-white font-semibold" : "text-black/70 dark:text-white/70"}>{p.stock}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    p.statut === "Actif"
                      ? "bg-black/5 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20"
                      : "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  }`}>
                    {p.statut}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(p)}
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

      {/* ── MODAL AJOUTER ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                  <Package className="h-5 w-5 text-black dark:text-white" />
                </div>
                <h2 className="text-lg font-semibold text-black dark:text-white">Ajouter un produit</h2>
              </div>
              <button onClick={() => { setShowModal(false); setForm(initialForm); }} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X className="h-5 w-5 text-black/50 dark:text-white/50" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <FormFields f={form} onChange={handleChange} onNomChange={handleNomChange} onCheckbox={c => setForm(p => ({ ...p, actif: c }))} />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
              <button onClick={() => { setShowModal(false); setForm(initialForm); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <XCircle className="h-4 w-4" /> Annuler
              </button>
              <button onClick={handleValider}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition">
                <Save className="h-4 w-4" /> Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL MODIFIER ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                  <Pencil className="h-5 w-5 text-black dark:text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black dark:text-white">Modifier le produit</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 font-mono">{selectedProduit?.id}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X className="h-5 w-5 text-black/50 dark:text-white/50" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <FormFields f={editForm} onChange={handleEditChange} onNomChange={handleEditNomChange} onCheckbox={c => setEditForm(p => ({ ...p, actif: c }))} />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
              <button onClick={() => setShowEditModal(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <XCircle className="h-4 w-4" /> Annuler
              </button>
              <button onClick={handleValiderEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition">
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ALERT SUPPRESSION ── */}
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
                  Voulez-vous vraiment supprimer <span className="font-medium text-black dark:text-white">"{selectedProduit?.nom}"</span> ? Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteAlert(false)}
                className="flex-1 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleConfirmDelete}
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

export default AdminProduits;