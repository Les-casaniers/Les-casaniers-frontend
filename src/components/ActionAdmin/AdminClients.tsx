import { useState } from "react";
import { Users, Trash2, AlertTriangle, X, Search, Filter, ChevronDown, ChevronUp, Mail, Phone, Calendar, ShoppingBag, DollarSign, UserCheck, UserX, Eye, MessageSquare, MapPin } from "lucide-react";

type Client = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  dateInscription: string;
  commandes: number;
  totalDepense: string;
  statut: "Actif" | "Inactif";
  ville?: string;
  dernierAchat?: string;
};

// Données par défaut
const clientsParDefaut: Client[] = [
  { id: "CLT-001", nom: "Jean Dupont", email: "jean.dupont@email.com", telephone: "034 12 345 67", dateInscription: "2025-01-15", commandes: 5, totalDepense: "1 250 000 Ar", statut: "Actif", ville: "Antananarivo", dernierAchat: "2025-05-10" },
  { id: "CLT-002", nom: "Marie Claire", email: "marie.claire@email.com", telephone: "033 98 765 43", dateInscription: "2025-02-20", commandes: 3, totalDepense: "450 000 Ar", statut: "Actif", ville: "Toamasina", dernierAchat: "2025-05-08" },
  { id: "CLT-003", nom: "Pierre Andrian", email: "pierre.andrian@email.com", telephone: "038 55 22 11", dateInscription: "2025-03-10", commandes: 8, totalDepense: "2 890 000 Ar", statut: "Actif", ville: "Fianarantsoa", dernierAchat: "2025-05-12" },
  { id: "CLT-004", nom: "Lala Rasoa", email: "lala.rasoa@email.com", telephone: "034 77 88 99", dateInscription: "2025-01-05", commandes: 2, totalDepense: "89 900 Ar", statut: "Inactif", ville: "Mahajanga", dernierAchat: "2025-03-15" },
  { id: "CLT-005", nom: "Toky Randria", email: "toky.randria@email.com", telephone: "032 11 22 33", dateInscription: "2025-04-01", commandes: 12, totalDepense: "3 450 000 Ar", statut: "Actif", ville: "Antsirabe", dernierAchat: "2025-05-11" },
  { id: "CLT-006", nom: "Miora Rabe", email: "miora.rabe@email.com", telephone: "034 99 88 77", dateInscription: "2025-03-25", commandes: 1, totalDepense: "25 000 Ar", statut: "Actif", ville: "Antananarivo", dernierAchat: "2025-04-20" },
  { id: "CLT-007", nom: "Hery Rajaonary", email: "hery.raja@email.com", telephone: "033 44 55 66", dateInscription: "2025-02-28", commandes: 6, totalDepense: "980 000 Ar", statut: "Actif", ville: "Toamasina", dernierAchat: "2025-05-09" },
  { id: "CLT-008", nom: "Voahangy Ranaivo", email: "voa.ranaivo@email.com", telephone: "034 77 66 55", dateInscription: "2025-04-15", commandes: 0, totalDepense: "0 Ar", statut: "Inactif", ville: "Antananarivo", dernierAchat: null },
];

const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>(clientsParDefaut);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Client>("dateInscription");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrer les clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (c.telephone && c.telephone.includes(searchTerm));
    const matchesStatus = filterStatus === "all" || c.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Trier les clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "commandes" || sortField === "totalDepense") {
      aValue = sortField === "commandes" ? a.commandes : parseInt(a.totalDepense.replace(/[^0-9]/g, ""));
      bValue = sortField === "commandes" ? b.commandes : parseInt(b.totalDepense.replace(/[^0-9]/g, ""));
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleOpenDelete = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteAlert(true);
  };

  const handleOpenDetails = (client: Client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedClient) return;
    setClients(clients.filter(c => c.id !== selectedClient.id));
    setShowDeleteAlert(false);
    setSelectedClient(null);
  };

  const getStatutStyle = (statut: string) => {
    return statut === "Actif"
      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
      : "bg-destructive/10 text-destructive border-destructive/20";
  };

  // Statistiques
  const stats = {
    total: clients.length,
    actifs: clients.filter(c => c.statut === "Actif").length,
    inactifs: clients.filter(c => c.statut === "Inactif").length,
    totalCommandes: clients.reduce((sum, c) => sum + c.commandes, 0),
    totalDepense: clients.reduce((sum, c) => sum + parseInt(c.totalDepense.replace(/[^0-9]/g, "")), 0),
    nouveauxMois: clients.filter(c => {
      const dateInscription = new Date(c.dateInscription);
      const now = new Date();
      return dateInscription.getMonth() === now.getMonth() && dateInscription.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestion des clients</h1>
          <p className="text-muted-foreground mt-1">Gérez votre base de clients</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{stats.total} clients</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total clients</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
          <p className="text-xs text-muted-foreground mt-1">Actifs</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.inactifs}</p>
          <p className="text-xs text-muted-foreground mt-1">Inactifs</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.totalCommandes}</p>
          <p className="text-xs text-muted-foreground mt-1">Commandes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{(stats.totalDepense / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted-foreground mt-1">Chiffre d'affaires</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.nouveauxMois}</p>
          <p className="text-xs text-muted-foreground mt-1">Nouveaux (mois)</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, ID, email ou téléphone..."
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
              <option value="Actif">Actifs</option>
              <option value="Inactif">Inactifs</option>
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
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("nom")}>
                  <div className="flex items-center gap-1">Client {sortField === "nom" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("dateInscription")}>
                  <div className="flex items-center gap-1">Inscription {sortField === "dateInscription" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("commandes")}>
                  <div className="flex items-center gap-1">Commandes {sortField === "commandes" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("totalDepense")}>
                  <div className="flex items-center gap-1">Dépenses {sortField === "totalDepense" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client) => (
                <tr key={client.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                  <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{client.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{client.nom.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.nom}</p>
                        {client.ville && <p className="text-xs text-muted-foreground">{client.ville}</p>}
                      </div>
                    </div>
                   </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{client.telephone}</span>
                      </div>
                    </div>
                   </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(client.dateInscription).toLocaleDateString("fr-FR")}
                    </div>
                   </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {client.commandes}
                    </span>
                   </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">{client.totalDepense}</span>
                   </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatutStyle(client.statut)}`}>
                      {client.statut === "Actif" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {client.statut}
                    </span>
                   </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenDetails(client)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Détails">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenDelete(client)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Supprimer">
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
            <p className="text-sm text-muted-foreground">{sortedClients.length} client{sortedClients.length > 1 ? 's' : ''}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition">Précédent</button>
              <span className="px-3 py-1.5 text-sm font-medium text-foreground">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition">Suivant</button>
            </div>
          </div>
        )}

        {/* Message si aucun client */}
        {sortedClients.length === 0 && (
          <div className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucun client trouvé</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Version Mobile (Cartes) */}
      <div className="lg:hidden space-y-4">
        {paginatedClients.map((client) => (
          <div key={client.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-base font-bold text-primary">{client.nom.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{client.nom}</p>
                  <p className="text-xs text-muted-foreground font-mono">{client.id}</p>
                  {client.ville && <p className="text-xs text-muted-foreground mt-0.5">{client.ville}</p>}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatutStyle(client.statut)}`}>
                {client.statut === "Actif" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                {client.statut}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{client.telephone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{new Date(client.dateInscription).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{client.commandes} commandes</span>
              </div>
              <div className="col-span-2 flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">Total dépensé</span>
                <span className="font-semibold text-foreground">{client.totalDepense}</span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleOpenDetails(client)} className="flex-1 py-2 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition">Détails</button>
              <button onClick={() => handleOpenDelete(client)} className="flex-1 py-2 rounded-xl text-sm font-medium border border-destructive/20 text-destructive hover:bg-destructive/10 transition">Supprimer</button>
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

      {/* MODAL DÉTAILS CLIENT */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Détails client</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg hover:bg-secondary transition"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{selectedClient.nom.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedClient.nom}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{selectedClient.id}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">{selectedClient.email}</span></div>
                <div className="flex items-center gap-3 py-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">{selectedClient.telephone}</span></div>
                {selectedClient.ville && <div className="flex items-center gap-3 py-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">{selectedClient.ville}</span></div>}
                <div className="flex items-center gap-3 py-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">Inscrit le {new Date(selectedClient.dateInscription).toLocaleDateString("fr-FR")}</span></div>
                {selectedClient.dernierAchat && <div className="flex items-center gap-3 py-2"><ShoppingBag className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">Dernier achat le {new Date(selectedClient.dernierAchat).toLocaleDateString("fr-FR")}</span></div>}
                <div className="flex items-center justify-between py-2 border-t border-border mt-2 pt-3">
                  <span className="text-sm text-muted-foreground">Commandes</span>
                  <span className="font-semibold text-foreground">{selectedClient.commandes}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Total dépensé</span>
                  <span className="font-bold text-primary">{selectedClient.totalDepense}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTE SUPPRESSION */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Confirmer la suppression</h3>
              <p className="text-muted-foreground">
                Supprimer le client <span className="font-semibold text-foreground">"{selectedClient?.nom}"</span> ?
              </p>
              <p className="text-sm text-destructive mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowDeleteAlert(false)} className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-secondary transition">Annuler</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;