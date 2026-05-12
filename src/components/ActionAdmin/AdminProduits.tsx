import { useState } from "react";
import { Package, PlusCircle, X, Save, XCircle, Pencil, Trash2, AlertTriangle, Search, Filter, ChevronDown, ChevronUp, Star, Sparkles } from "lucide-react";

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
  image?: string;
  category?: string;
};

const AdminProduits = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<keyof Produit>("nom");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const produits: Produit[] = [
    { id: "PROD-001", nom: "PC Gaming RTX 4060", prix: "2 500 000 Ar", stock: 12, statut: "Actif", category: "PC Gaming", image: "https://picsum.photos/id/0/50/50" },
    { id: "PROD-002", nom: "Clavier Mécanique RGB", prix: "120 000 Ar", stock: 45, statut: "Actif", category: "Périphériques", image: "https://picsum.photos/id/1/50/50" },
    { id: "PROD-003", nom: "Souris Gaming", prix: "85 000 Ar", stock: 0, statut: "Rupture", category: "Périphériques", image: "https://picsum.photos/id/2/50/50" },
    { id: "PROD-004", nom: "Processeur Intel i7", prix: "450 000 Ar", stock: 8, statut: "Actif", category: "Composants", image: "https://picsum.photos/id/3/50/50" },
    { id: "PROD-005", nom: "Carte Mère B760", prix: "320 000 Ar", stock: 15, statut: "Actif", category: "Composants", image: "https://picsum.photos/id/4/50/50" },
    { id: "PROD-006", nom: "Écran 144Hz", prix: "650 000 Ar", stock: 3, statut: "Actif", category: "Périphériques", image: "https://picsum.photos/id/5/50/50" },
  ];

  // Filtrer les produits
  const filteredProduits = produits.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && p.statut === "Actif") ||
                         (filterStatus === "out" && p.statut === "Rupture");
    return matchesSearch && matchesStatus;
  });

  // Trier les produits
  const sortedProduits = [...filteredProduits].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "prix") {
      aValue = parseInt(a.prix.replace(/[^0-9]/g, ""));
      bValue = parseInt(b.prix.replace(/[^0-9]/g, ""));
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProduits.length / itemsPerPage);
  const paginatedProduits = sortedProduits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Produit) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200";

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

  const FormFields = ({ f, onChange, onNomChange, onCheckbox }: any) => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nom <span className="text-destructive">*</span></label>
          <input name="nom" value={f.nom} onChange={onNomChange} placeholder="Ex: PC Gaming RTX 4060" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Référence</label>
          <input name="reference" value={f.reference} onChange={onChange} placeholder="Ex: REF-001" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Slug <span className="text-destructive">*</span></label>
        <input name="slug" value={f.slug} onChange={onChange} placeholder="auto-généré depuis le nom" className={`${inputClass} font-mono text-sm`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type de produit <span className="text-destructive">*</span></label>
          <select name="type_produit" value={f.type_produit} onChange={onChange} className={inputClass}>
            <option value="">-- Choisir --</option>
            {TYPES_PRODUIT.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Catégorie <span className="text-destructive">*</span></label>
          <input name="categorie_id" value={f.categorie_id} onChange={onChange} placeholder="Ex: 1" type="number" min="1" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Prix</label>
          <input name="prix" value={f.prix} onChange={onChange} placeholder="Ex: 2500000" type="number" min="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Devise</label>
          <select name="devise" value={f.devise} onChange={onChange} className={inputClass}>
            <option value="MGA">MGA - Ariary</option>
            <option value="EUR">EUR - Euro</option>
            <option value="USD">USD - Dollar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
          <input name="quantite_stock" value={f.quantite_stock} onChange={onChange} placeholder="Ex: 10" type="number" min="0" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description courte</label>
        <input name="description_courte" value={f.description_courte} onChange={onChange} placeholder="Résumé en quelques mots..." maxLength={500} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description complète</label>
        <textarea name="description" value={f.description} onChange={onChange} placeholder="Description détaillée..." rows={5} className={`${inputClass} resize-none`} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input type="checkbox" id="actif" checked={f.actif} onChange={e => onCheckbox(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
        <label htmlFor="actif" className="text-sm text-foreground/80">Produit actif (visible sur le site)</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestion des produits</h1>
          <p className="text-muted-foreground mt-1">Gérez votre catalogue de produits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="out">Rupture de stock</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tableau responsive */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Version Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1">
                    ID
                    {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("nom")}>
                  <div className="flex items-center gap-1">
                    Produit
                    {sortField === "nom" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégorie</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("prix")}>
                  <div className="flex items-center gap-1">
                    Prix
                    {sortField === "prix" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProduits.map((p, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{p.id}</td>
                  <td className="py-3 px-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden">
                      <img src={p.image} alt={p.nom} className="h-full w-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{p.nom}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">{p.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">{p.prix}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm ${p.stock === 0 ? "text-destructive font-medium" : "text-foreground"}`}>
                      {p.stock} unités
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.statut === "Actif"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${p.statut === "Actif" ? "bg-green-500" : "bg-destructive"}`} />
                      {p.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenDelete(p)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Version Mobile (Cartes) */}
        <div className="lg:hidden divide-y divide-border">
          {paginatedProduits.map((p, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-secondary overflow-hidden">
                    <img src={p.image} alt={p.nom} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{p.nom}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(p)} className="p-2 rounded-lg text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleOpenDelete(p)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Catégorie</p>
                  <p className="text-foreground">{p.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prix</p>
                  <p className="font-semibold text-foreground">{p.prix}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className={p.stock === 0 ? "text-destructive" : "text-foreground"}>{p.stock} unités</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    p.statut === "Actif" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                  }`}>
                    {p.statut}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-secondary/10">
            <p className="text-sm text-muted-foreground">
              {sortedProduits.length} produit{sortedProduits.length > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Précédent
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-foreground">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Modal Ajouter - mêmes modales mais avec le nouveau design */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Ajouter un produit</h2>
                  <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous</p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setForm(initialForm); }} className="p-2 rounded-lg hover:bg-secondary transition">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <FormFields f={form} onChange={handleChange} onNomChange={handleNomChange} onCheckbox={c => setForm(p => ({ ...p, actif: c }))} />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => { setShowModal(false); setForm(initialForm); }} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleValider} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
                <Save className="h-4 w-4" /> Ajouter le produit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Modifier le produit</h2>
                  <p className="text-sm text-muted-foreground font-mono">{selectedProduit?.id}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-secondary transition">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <FormFields f={editForm} onChange={handleEditChange} onNomChange={handleEditNomChange} onCheckbox={c => setEditForm(p => ({ ...p, actif: c }))} />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleValiderEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Suppression */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Confirmer la suppression</h3>
              <p className="text-muted-foreground">
                Voulez-vous vraiment supprimer <span className="font-semibold text-foreground">"{selectedProduit?.nom}"</span> ?
              </p>
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">
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