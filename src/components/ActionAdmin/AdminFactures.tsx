import { useState } from "react";
import { FileText, Download, Trash2, AlertTriangle, X, Eye, Filter, CheckCircle, Clock, XCircle, Printer, Search, ChevronDown, ChevronUp, DollarSign, TrendingUp, Calendar, Users } from "lucide-react";

type StatutPaiement = "Payée" | "En attente" | "En retard" | "Remboursée";

type Facture = {
  id: string;
  commandeId: string;
  client: string;
  email: string;
  dateEmission: string;
  dateEcheance: string;
  montantHT: string;
  tva: string;
  montantTTC: string;
  statut: StatutPaiement;
  articles: { nom: string; quantite: number; prix: string }[];
};

// Données mockées
const facturesParDefaut: Facture[] = [
  {
    id: "FAC-001",
    commandeId: "CMD-001",
    client: "Jean Dupont",
    email: "jean.dupont@email.com",
    dateEmission: "2025-05-01",
    dateEcheance: "2025-05-15",
    montantHT: "1 041 667 Ar",
    tva: "208 333 Ar",
    montantTTC: "1 250 000 Ar",
    statut: "Payée",
    articles: [
      { nom: "PC Gaming RTX 4060", quantite: 1, prix: "1 200 000 Ar" },
      { nom: "Souris Gaming", quantite: 2, prix: "50 000 Ar" },
    ],
  },
  {
    id: "FAC-002",
    commandeId: "CMD-002",
    client: "Marie Claire",
    email: "marie.claire@email.com",
    dateEmission: "2025-05-05",
    dateEcheance: "2025-05-19",
    montantHT: "2 083 Ar",
    tva: "417 Ar",
    montantTTC: "2 500 Ar",
    statut: "En attente",
    articles: [
      { nom: "Câble HDMI 2m", quantite: 1, prix: "2 500 Ar" },
    ],
  },
  {
    id: "FAC-003",
    commandeId: "CMD-003",
    client: "Pierre Andrian",
    email: "pierre.andrian@email.com",
    dateEmission: "2025-04-28",
    dateEcheance: "2025-05-12",
    montantHT: "74 917 Ar",
    tva: "14 983 Ar",
    montantTTC: "89 900 Ar",
    statut: "En retard",
    articles: [
      { nom: "Clavier Mécanique RGB", quantite: 1, prix: "89 900 Ar" },
    ],
  },
  {
    id: "FAC-004",
    commandeId: "CMD-004",
    client: "Lala Rasoa",
    email: "lala.rasoa@email.com",
    dateEmission: "2025-04-25",
    dateEcheance: "2025-05-09",
    montantHT: "375 000 Ar",
    tva: "75 000 Ar",
    montantTTC: "450 000 Ar",
    statut: "Payée",
    articles: [
      { nom: "Écran 27 pouces 4K", quantite: 1, prix: "450 000 Ar" },
    ],
  },
  {
    id: "FAC-005",
    commandeId: "CMD-005",
    client: "Toky Randria",
    email: "toky.randria@email.com",
    dateEmission: "2025-05-03",
    dateEcheance: "2025-05-17",
    montantHT: "10 417 Ar",
    tva: "2 083 Ar",
    montantTTC: "12 500 Ar",
    statut: "Remboursée",
    articles: [
      { nom: "Webcam HD", quantite: 1, prix: "12 500 Ar" },
    ],
  },
  {
    id: "FAC-006",
    commandeId: "CMD-006",
    client: "Miora Rabe",
    email: "miora.rabe@email.com",
    dateEmission: "2025-05-08",
    dateEcheance: "2025-05-22",
    montantHT: "20 833 Ar",
    tva: "4 167 Ar",
    montantTTC: "25 000 Ar",
    statut: "En attente",
    articles: [
      { nom: "Casque Gaming", quantite: 1, prix: "25 000 Ar" },
    ],
  },
];

const AdminFactures = () => {
  const [factures, setFactures] = useState<Facture[]>(facturesParDefaut);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<StatutPaiement | "Tous">("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Facture>("dateEmission");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrer les factures
  const filteredFactures = factures.filter(f => {
    const matchesSearch = f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.commandeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filtreStatut === "Tous" || f.statut === filtreStatut;
    return matchesSearch && matchesStatus;
  });

  // Trier les factures
  const sortedFactures = [...filteredFactures].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "montantTTC") {
      aValue = parseInt(a.montantTTC.replace(/[^0-9]/g, ""));
      bValue = parseInt(b.montantTTC.replace(/[^0-9]/g, ""));
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedFactures.length / itemsPerPage);
  const paginatedFactures = sortedFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Facture) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatutStyle = (statut: StatutPaiement) => {
    const styles = {
      "Payée": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      "En attente": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      "En retard": "bg-destructive/10 text-destructive border-destructive/20",
      "Remboursée": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
    return styles[statut];
  };

  const getStatutIcone = (statut: StatutPaiement) => {
    switch (statut) {
      case "Payée": return <CheckCircle className="h-3 w-3" />;
      case "En attente": return <Clock className="h-3 w-3" />;
      case "En retard": return <XCircle className="h-3 w-3" />;
      case "Remboursée": return <TrendingUp className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleOpenDelete = (facture: Facture) => {
    setSelectedFacture(facture);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedFacture) return;
    setFactures(factures.filter(f => f.id !== selectedFacture.id));
    setShowDeleteAlert(false);
    setSelectedFacture(null);
  };

  const handleViewDetails = (facture: Facture) => {
    setSelectedFacture(facture);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = (facture: Facture) => {
    alert(`Simulation : Téléchargement de la facture ${facture.id} au format PDF`);
  };

  const handleExportAll = () => {
    const csvContent = [
      ["ID Facture", "Commande", "Client", "Email", "Date émission", "Date échéance", "Montant HT", "TVA", "Montant TTC", "Statut"],
      ...filteredFactures.map(f => [
        f.id, f.commandeId, f.client, f.email, f.dateEmission, f.dateEcheance, f.montantHT, f.tva, f.montantTTC, f.statut
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factures_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: factures.length,
    totalMontant: factures.reduce((sum, f) => sum + parseInt(f.montantTTC.replace(/[^0-9]/g, "")), 0),
    payees: factures.filter(f => f.statut === "Payée").length,
    enAttente: factures.filter(f => f.statut === "En attente").length,
    enRetard: factures.filter(f => f.statut === "En retard").length,
    remboursees: factures.filter(f => f.statut === "Remboursée").length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Factures</h1>
          <p className="text-muted-foreground mt-1">Gestion et suivi des factures</p>
        </div>
        <button
          onClick={handleExportAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          <Download className="h-4 w-4" />
          Exporter tout
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition">
          <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total factures</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <DollarSign className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{(stats.totalMontant / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.payees}</p>
          <p className="text-xs text-muted-foreground">Payées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-600">{stats.enAttente}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <XCircle className="h-5 w-5 mx-auto text-destructive mb-2" />
          <p className="text-2xl font-bold text-destructive">{stats.enRetard}</p>
          <p className="text-xs text-muted-foreground">En retard</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.remboursees}</p>
          <p className="text-xs text-muted-foreground">Remboursées</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par ID, commande, client ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as typeof filtreStatut)}
              className="pl-10 pr-8 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Payée">Payées</option>
              <option value="En attente">En attente</option>
              <option value="En retard">En retard</option>
              <option value="Remboursée">Remboursées</option>
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
                  <div className="flex items-center gap-1">Facture {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("commandeId")}>
                  <div className="flex items-center gap-1">Commande {sortField === "commandeId" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("client")}>
                  <div className="flex items-center gap-1">Client {sortField === "client" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("dateEmission")}>
                  <div className="flex items-center gap-1">Émission {sortField === "dateEmission" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("dateEcheance")}>
                  <div className="flex items-center gap-1">Échéance {sortField === "dateEcheance" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition" onClick={() => handleSort("montantTTC")}>
                  <div className="flex items-center gap-1">Montant TTC {sortField === "montantTTC" && (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFactures.map((facture) => (
                <tr key={facture.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                  <td className="py-3 px-4 font-mono text-sm font-semibold text-foreground">{facture.id}</td>
                  <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{facture.commandeId}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{facture.client.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{facture.client}</p>
                        <p className="text-xs text-muted-foreground">{facture.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(facture.dateEmission).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-1.5 text-sm ${new Date(facture.dateEcheance) < new Date() && facture.statut !== "Payée" ? "text-destructive" : "text-muted-foreground"}`}>
                      <Calendar className="h-3 w-3" />
                      {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">{facture.montantTTC}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatutStyle(facture.statut)}`}>
                      {getStatutIcone(facture.statut)}
                      {facture.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleViewDetails(facture)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Détails">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDownloadPDF(facture)} className="p-2 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all" title="PDF">
                        <Download className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenDelete(facture)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Supprimer">
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
            <p className="text-sm text-muted-foreground">{sortedFactures.length} facture{sortedFactures.length > 1 ? 's' : ''}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition">Précédent</button>
              <span className="px-3 py-1.5 text-sm font-medium text-foreground">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition">Suivant</button>
            </div>
          </div>
        )}

        {sortedFactures.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucune facture trouvée</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Version Mobile (Cartes) */}
      <div className="lg:hidden space-y-4">
        {paginatedFactures.map((facture) => (
          <div key={facture.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">{facture.id}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Commande: {facture.commandeId}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatutStyle(facture.statut)}`}>
                {getStatutIcone(facture.statut)}
                {facture.statut}
              </span>
            </div>
            
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{facture.client.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{facture.client}</p>
                <p className="text-xs text-muted-foreground">{facture.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Émission</p>
                <p className="text-foreground">{new Date(facture.dateEmission).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Échéance</p>
                <p className={new Date(facture.dateEcheance) < new Date() && facture.statut !== "Payée" ? "text-destructive" : "text-foreground"}>
                  {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Montant TTC</p>
                <p className="text-lg font-bold text-foreground">{facture.montantTTC}</p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleViewDetails(facture)} className="flex-1 py-2 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition">Détails</button>
              <button onClick={() => handleDownloadPDF(facture)} className="flex-1 py-2 rounded-xl text-sm font-medium border border-border hover:bg-blue-500/10 hover:text-blue-500 transition">PDF</button>
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

      {/* MODAL DÉTAILS FACTURE */}
      {showDetailsModal && selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Détails de la facture</h2>
                  <p className="text-sm text-muted-foreground font-mono">{selectedFacture.id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 rounded-lg hover:bg-secondary transition">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 space-y-5">
              {/* En-tête facture */}
              <div className="flex justify-between items-start pb-4 border-b border-border">
                <div>
                  <h3 className="font-bold text-xl text-foreground">LES CASANIERS</h3>
                  <p className="text-xs text-muted-foreground">Matériel informatique</p>
                  <p className="text-xs text-muted-foreground mt-2">Antananarivo, Madagascar</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">Facture n°{selectedFacture.id}</p>
                  <p className="text-xs text-muted-foreground">Commande : {selectedFacture.commandeId}</p>
                  <p className="text-xs text-muted-foreground">Émise le : {new Date(selectedFacture.dateEmission).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              {/* Client */}
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Client</p>
                <p className="font-semibold text-foreground">{selectedFacture.client}</p>
                <p className="text-sm text-muted-foreground">{selectedFacture.email}</p>
              </div>

              {/* Articles */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Articles</p>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-muted-foreground">Produit</th>
                        <th className="text-center py-2 px-3 text-xs text-muted-foreground">Qté</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Prix</th>
                       </tr>
                    </thead>
                    <tbody>
                      {selectedFacture.articles.map((article, idx) => (
                        <tr key={idx} className="border-t border-border/50">
                          <td className="py-2 px-3 text-foreground">{article.nom}</td>
                          <td className="text-center py-2 px-3 text-muted-foreground">{article.quantite}</td>
                          <td className="text-right py-2 px-3 text-muted-foreground">{article.prix}</td>
                         </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              </div>

              {/* Totaux */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant HT :</span>
                      <span className="text-foreground">{selectedFacture.montantHT}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVA (20%) :</span>
                      <span className="text-foreground">{selectedFacture.tva}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total TTC :</span>
                      <span className="font-bold text-xl text-primary">{selectedFacture.montantTTC}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut et action */}
              <div className="flex justify-between items-center pt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatutStyle(selectedFacture.statut)}`}>
                  {getStatutIcone(selectedFacture.statut)}
                  {selectedFacture.statut}
                </span>
                <button onClick={() => handleDownloadPDF(selectedFacture)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
                  <Printer className="h-4 w-4" />
                  Télécharger PDF
                </button>
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
                Supprimer la facture <span className="font-semibold text-foreground">"{selectedFacture?.id}"</span> ?
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

export default AdminFactures;