import { useState } from "react";
import { ShoppingCart, PlusCircle, X, Save, XCircle, Pencil, Trash2, AlertTriangle, Eye, Search, Filter, ChevronDown, ChevronUp, Truck, Package, Clock, CheckCircle, XCircle as XCircleIcon } from "lucide-react";

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
  telephone?: string;
  adresse?: string;
};

const initialForm = {
  client: "",
  email: "",
  telephone: "",
  adresse: "",
  montant: "",
  date: new Date().toISOString().split("T")[0],
  statut: "En attente" as StatutCommande,
  articles: 1,
};

// Données par défaut
const commandesParDefaut: Commande[] = [
  { id: "CMD-001", client: "Jean Dupont", email: "jean@email.com", telephone: "032 14 567 89", adresse: "Antananarivo, Madagascar", montant: "125 000 Ar", date: "2025-05-10", statut: "Confirmée", articles: 3 },
  { id: "CMD-002", client: "Marie Claire", email: "marie@email.com", telephone: "033 98 765 43", adresse: "Toamasina, Madagascar", montant: "2 500 Ar", date: "2025-05-09", statut: "Expédiée", articles: 1 },
  { id: "CMD-003", client: "Pierre Andrian", email: "pierre@email.com", telephone: "034 12 345 67", adresse: "Fianarantsoa, Madagascar", montant: "89 900 Ar", date: "2025-05-08", statut: "En attente", articles: 2 },
  { id: "CMD-004", client: "Lala Rasoa", email: "lala@email.com", telephone: "032 23 456 78", adresse: "Mahajanga, Madagascar", montant: "450 000 Ar", date: "2025-05-07", statut: "Livrée", articles: 5 },
  { id: "CMD-005", client: "Toky Randria", email: "toky@email.com", telephone: "033 34 567 89", adresse: "Antsirabe, Madagascar", montant: "12 500 Ar", date: "2025-05-06", statut: "Annulée", articles: 1 },
];

const AdminCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>(commandesParDefaut);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Commande>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const inputClass = "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200";

  // Filtrer les commandes
  const filteredCommandes = commandes.filter(c => {
    const matchesSearch = c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Trier les commandes
  const sortedCommandes = [...filteredCommandes].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "montant") {
      aValue = parseInt(a.montant.replace(/[^0-9]/g, ""));
      bValue = parseInt(b.montant.replace(/[^0-9]/g, ""));
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCommandes.length / itemsPerPage);
  const paginatedCommandes = sortedCommandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Commande) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const genererId = () => {
    const dernierId = commandes.length > 0 
      ? Math.max(...commandes.map(c => parseInt(c.id.split("-")[1])))
      : 0;
    return `CMD-${String(dernierId + 1).padStart(3, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenEdit = (commande: Commande) => {
    setSelectedCommande(commande);
    setEditForm({
      client: commande.client,
      email: commande.email,
      telephone: commande.telephone || "",
      adresse: commande.adresse || "",
      montant: commande.montant.replace(/[^0-9]/g, ""),
      date: commande.date,
      statut: commande.statut,
      articles: commande.articles,
    });
    setShowEditModal(true);
  };

  const handleOpenDetails = (commande: Commande) => {
    setSelectedCommande(commande);
    setShowDetailsModal(true);
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
      telephone: form.telephone,
      adresse: form.adresse,
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
            telephone: editForm.telephone,
            adresse: editForm.adresse,
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
      "En attente": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      "Confirmée": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      "Expédiée": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      "Livrée": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      "Annulée": "bg-destructive/10 text-destructive border-destructive/20",
    };
    return styles[statut];
  };

  const getStatutIcon = (statut: StatutCommande) => {
    switch(statut) {
      case "En attente": return <Clock className="h-3 w-3" />;
      case "Confirmée": return <CheckCircle className="h-3 w-3" />;
      case "Expédiée": return <Truck className="h-3 w-3" />;
      case "Livrée": return <Package className="h-3 w-3" />;
      case "Annulée": return <XCircleIcon className="h-3 w-3" />;
    }
  };

  const FormFields = ({ f, onChange }: { f: typeof initialForm; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void }) => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Client <span className="text-destructive">*</span></label>
          <input name="client" value={f.client} onChange={onChange} placeholder="Nom du client" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email <span className="text-destructive">*</span></label>
          <input name="email" type="email" value={f.email} onChange={onChange} placeholder="client@email.com" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Téléphone</label>
          <input name="telephone" value={f.telephone} onChange={onChange} placeholder="032 14 567 89" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Adresse</label>
          <textarea name="adresse" value={f.adresse} onChange={onChange} placeholder="Adresse complète" rows={2} className={`${inputClass} resize-none`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Montant (Ar)</label>
          <input name="montant" value={f.montant} onChange={onChange} placeholder="Ex: 125000" type="number" min="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date</label>
          <input name="date" value={f.date} onChange={onChange} type="date" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Articles</label>
          <input name="articles" value={f.articles} onChange={onChange} type="number" min="1" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Statut</label>
        <select name="statut" value={f.statut} onChange={onChange} className={inputClass}>
          {STATUTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Statistiques
  const stats = {
    total: commandes.length,
    enAttente: commandes.filter(c => c.statut === "En attente").length,
    confirmees: commandes.filter(c => c.statut === "Confirmée").length,
    expediees: commandes.filter(c => c.statut === "Expédiée").length,
    livrees: commandes.filter(c => c.statut === "Livrée").length,
    annulees: commandes.filter(c => c.statut === "Annulée").length,
    montantTotal: commandes.reduce((sum, c) => sum + parseInt(c.montant.replace(/[^0-9]/g, "")), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestion des commandes</h1>
          <p className="text-muted-foreground mt-1">Suivez et gérez toutes vos commandes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          Nouvelle commande
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.enAttente}</p>
          <p className="text-xs text-muted-foreground mt-1">En attente</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.confirmees}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.expediees}</p>
          <p className="text-xs text-muted-foreground mt-1">Expédiées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.livrees}</p>
          <p className="text-xs text-muted-foreground mt-1">Livrées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.annulees}</p>
          <p className="text-xs text-muted-foreground mt-1">Annulées</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par client, ID ou email..."
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
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1">ID {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("client")}>
                  <div className="flex items-center gap-1">Client {sortField === "client" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("montant")}>
                  <div className="flex items-center gap-1">Montant {sortField === "montant" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Articles</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">Date {sortField === "date" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
               </tr>
            </thead>
            <tbody>
              {paginatedCommandes.map((cmd) => (
                <tr key={cmd.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{cmd.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{cmd.client}</p>
                    <p className="text-xs text-muted-foreground">{cmd.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">{cmd.montant}</span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{cmd.articles} article{cmd.articles > 1 ? 's' : ''}</td>
                  <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{cmd.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatutStyle(cmd.statut)}`}>
                      {getStatutIcon(cmd.statut)}
                      {cmd.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenDetails(cmd)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Détails">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenEdit(cmd)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Modifier">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenDelete(cmd)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-secondary/10">
            <p className="text-sm text-muted-foreground">{sortedCommandes.length} commande{sortedCommandes.length > 1 ? 's' : ''}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition">Précédent</button>
              <span className="px-3 py-1.5 text-sm font-medium text-foreground">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {/* Version Mobile (Cartes) */}
      <div className="lg:hidden space-y-4">
        {paginatedCommandes.map((cmd) => (
          <div key={cmd.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm text-muted-foreground">{cmd.id}</p>
                <p className="font-semibold text-foreground mt-1">{cmd.client}</p>
                <p className="text-xs text-muted-foreground">{cmd.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatutStyle(cmd.statut)}`}>
                {getStatutIcon(cmd.statut)}
                {cmd.statut}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Montant</p>
                <p className="font-semibold text-foreground">{cmd.montant}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Articles</p>
                <p className="text-foreground">{cmd.articles}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-muted-foreground">{cmd.date}</p>
              </div>
              <div className="flex gap-2 pt-2 col-span-2">
                <button onClick={() => handleOpenDetails(cmd)} className="flex-1 py-2 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition">Détails</button>
                <button onClick={() => handleOpenEdit(cmd)} className="flex-1 py-2 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition">Modifier</button>
              </div>
            </div>
          </div>
        ))}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm border border-border disabled:opacity-50">←</button>
            <span className="px-3 py-1.5 text-sm">{currentPage}/{totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-border disabled:opacity-50">→</button>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS */}
      {showDetailsModal && selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Détails commande</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">ID</span><span className="font-mono">{selectedCommande.id}</span></div>
                <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Client</span><span className="font-medium">{selectedCommande.client}</span></div>
                <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Email</span><span>{selectedCommande.email}</span></div>
                {selectedCommande.telephone && <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Téléphone</span><span>{selectedCommande.telephone}</span></div>}
                {selectedCommande.adresse && <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Adresse</span><span>{selectedCommande.adresse}</span></div>}
                <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Montant</span><span className="font-semibold">{selectedCommande.montant}</span></div>
                <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Articles</span><span>{selectedCommande.articles}</span></div>
                <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Date</span><span>{selectedCommande.date}</span></div>
                <div className="flex justify-between py-2"><span className="text-muted-foreground">Statut</span><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatutStyle(selectedCommande.statut)}`}>{getStatutIcon(selectedCommande.statut)}{selectedCommande.statut}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><ShoppingCart className="h-5 w-5 text-primary" /></div>
                <div><h2 className="text-xl font-bold text-foreground">Ajouter une commande</h2><p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous</p></div>
              </div>
              <button onClick={() => { setShowModal(false); setForm(initialForm); }} className="p-2 rounded-lg hover:bg-secondary"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto p-6 flex-1"><FormFields f={form} onChange={handleChange} /></div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => { setShowModal(false); setForm(initialForm); }} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">Annuler</button>
              <button onClick={handleAjouter} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition"><Save className="h-4 w-4" /> Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><Pencil className="h-5 w-5 text-primary" /></div>
                <div><h2 className="text-xl font-bold text-foreground">Modifier la commande</h2><p className="text-sm text-muted-foreground font-mono">{selectedCommande?.id}</p></div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-secondary"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto p-6 flex-1"><FormFields f={editForm} onChange={handleEditChange} /></div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/10">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">Annuler</button>
              <button onClick={handleModifier} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition"><Save className="h-4 w-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTE SUPPRESSION */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center"><AlertTriangle className="h-8 w-8 text-destructive" /></div>
              <h3 className="text-xl font-bold text-foreground mb-2">Confirmer la suppression</h3>
              <p className="text-muted-foreground">Supprimer la commande <span className="font-semibold text-foreground">{selectedCommande?.id}</span> de <span className="font-semibold text-foreground">{selectedCommande?.client}</span> ?</p>
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">Annuler</button>
              <button onClick={handleSupprimer} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommandes;