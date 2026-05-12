import { useState } from "react";
import { FileText, Download, Trash2, AlertTriangle, X, Eye, Filter, CheckCircle, Clock, XCircle, Printer } from "lucide-react";

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
];

const AdminFactures = () => {
  const [factures, setFactures] = useState<Facture[]>(facturesParDefaut);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<StatutPaiement | "Tous">("Tous");

  const inputClass = "px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30";

  const getStatutStyle = (statut: StatutPaiement) => {
    const styles = {
      "Payée": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50",
      "En attente": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/50",
      "En retard": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50",
      "Remboursée": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/50",
    };
    return styles[statut];
  };

  const getStatutIcone = (statut: StatutPaiement) => {
    switch (statut) {
      case "Payée": return <CheckCircle className="h-3 w-3" />;
      case "En attente": return <Clock className="h-3 w-3" />;
      case "En retard": return <XCircle className="h-3 w-3" />;
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
      ["ID Facture", "Commande", "Client", "Date émission", "Date échéance", "Montant TTC", "Statut"],
      ...factures.filter(f => filtreStatut === "Tous" || f.statut === filtreStatut).map(f => [
        f.id, f.commandeId, f.client, f.dateEmission, f.dateEcheance, f.montantTTC, f.statut
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

  const facturesFiltrees = factures.filter(f => filtreStatut === "Tous" || f.statut === filtreStatut);
  const stats = {
    total: factures.length,
    totalMontant: factures.reduce((sum, f) => sum + parseInt(f.montantTTC.replace(/[^0-9]/g, "")), 0),
    payees: factures.filter(f => f.statut === "Payée").length,
    enRetard: factures.filter(f => f.statut === "En retard").length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Factures</h1>
          <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">Gestion et historique des factures</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition text-sm font-medium border border-black/10 dark:border-white/10"
          >
            <Download className="h-4 w-4" />
            Exporter tout
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FileText className="h-5 w-5 text-black/40 dark:text-white/40" />
            <span className="text-2xl font-bold text-black dark:text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">Total factures</p>
        </div>
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-black/40 dark:text-white/40">Ar</span>
            <span className="text-2xl font-bold text-black dark:text-white">{stats.totalMontant.toLocaleString()}</span>
          </div>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">Chiffre d'affaires</p>
        </div>
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-black dark:text-white">{stats.payees}</span>
          </div>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">Factures payées</p>
        </div>
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-black dark:text-white">{stats.enRetard}</span>
          </div>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">Paiements en retard</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-black/50 dark:text-white/50" />
        <div className="flex flex-wrap gap-2">
          {["Tous", "Payée", "En attente", "En retard", "Remboursée"].map((statut) => (
            <button
              key={statut}
              onClick={() => setFiltreStatut(statut as typeof filtreStatut)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filtreStatut === statut
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20"
              }`}
            >
              {statut}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Facture</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Commande</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Client</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Émission</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Échéance</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Montant TTC</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Statut</th>
                <th className="text-right py-3 px-4 text-black/50 dark:text-white/50 font-medium">Actions</th>
               </tr>
            </thead>
            <tbody>
              {facturesFiltrees.map((facture) => (
                <tr key={facture.id} className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-black dark:text-white">{facture.id}</td>
                  <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">{facture.commandeId}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-black dark:text-white">{facture.client}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{facture.email}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">
                    {new Date(facture.dateEmission).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono text-xs ${new Date(facture.dateEcheance) < new Date() && facture.statut !== "Payée" ? "text-red-500" : "text-black/60 dark:text-white/60"}`}>
                      {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-black dark:text-white">{facture.montantTTC}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(facture.statut)}`}>
                      {getStatutIcone(facture.statut)}
                      {facture.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewDetails(facture)}
                        className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(facture)}
                        className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-blue-500 transition"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(facture)}
                        className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition"
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

        {facturesFiltrees.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
            <p className="text-black/40 dark:text-white/40">Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS FACTURE */}
      {showDetailsModal && selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                  <FileText className="h-5 w-5 text-black dark:text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black dark:text-white">Détails de la facture</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 font-mono">{selectedFacture.id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X className="h-5 w-5 text-black/50 dark:text-white/50" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
              {/* En-tête facture */}
              <div className="flex justify-between items-start pb-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <h3 className="font-bold text-lg text-black dark:text-white">INFIGO</h3>
                  <p className="text-xs text-black/50 dark:text-white/50">Matériel informatique</p>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-2">Antananarivo, Madagascar</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-black dark:text-white">Facture n°{selectedFacture.id}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">Commande : {selectedFacture.commandeId}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">Émise le : {new Date(selectedFacture.dateEmission).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              {/* Client */}
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1">CLIENT</p>
                <p className="font-medium text-black dark:text-white">{selectedFacture.client}</p>
                <p className="text-sm text-black/60 dark:text-white/60">{selectedFacture.email}</p>
              </div>

              {/* Articles */}
              <div>
                <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-2">ARTICLES</p>
                <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-black/50 dark:text-white/50">Produit</th>
                        <th className="text-center py-2 px-3 text-xs text-black/50 dark:text-white/50">Qté</th>
                        <th className="text-right py-2 px-3 text-xs text-black/50 dark:text-white/50">Prix</th>
                       </tr>
                    </thead>
                    <tbody>
                      {selectedFacture.articles.map((article, idx) => (
                        <tr key={idx} className="border-t border-black/5 dark:border-white/5">
                          <td className="py-2 px-3 text-black dark:text-white">{article.nom}</td>
                          <td className="text-center py-2 px-3 text-black/70 dark:text-white/70">{article.quantite}</td>
                          <td className="text-right py-2 px-3 text-black/70 dark:text-white/70">{article.prix}</td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totaux */}
              <div className="border-t border-black/10 dark:border-white/10 pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black/60 dark:text-white/60">Montant HT :</span>
                      <span className="text-black dark:text-white">{selectedFacture.montantHT}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black/60 dark:text-white/60">TVA (20%) :</span>
                      <span className="text-black dark:text-white">{selectedFacture.tva}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-black/10 dark:border-white/10">
                      <span className="font-semibold text-black dark:text-white">Total TTC :</span>
                      <span className="font-bold text-lg text-black dark:text-white">{selectedFacture.montantTTC}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div className="flex justify-between items-center pt-3">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getStatutStyle(selectedFacture.statut)}`}>
                  {getStatutIcone(selectedFacture.statut)}
                  {selectedFacture.statut}
                </span>
                <button
                  onClick={() => handleDownloadPDF(selectedFacture)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition"
                >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">Confirmer la suppression</h3>
                <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                  Voulez-vous vraiment supprimer la facture <span className="font-medium text-black dark:text-white">"{selectedFacture?.id}"</span> ?<br />
                  <span className="text-xs">Cette action est irréversible.</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteAlert(false)}
                className="flex-1 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleConfirmDelete}
                className="flex-1 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFactures;