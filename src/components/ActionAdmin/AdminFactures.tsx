import { useMemo, useState } from "react";
import { FileText, Download, Loader2, RefreshCcw, Search, Eye, X, CheckCircle, Clock, XCircle, DollarSign, Send } from "lucide-react";
import useFacture, { FACTURE_STATUS_LABELS, type FactureItem, type StatutFactureApi } from "@/hooks/useFacture";
import { useToast } from "@/hooks/use-toast";

const FACTURE_STATUS_OPTIONS: StatutFactureApi[] = ["brouillon", "emise", "payee", "annulee"];

const formatMoney = (value: number, devise: string) => `${value.toLocaleString()} ${devise}`;
const formatDate = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
};

const getStatusStyle = (statut: string) => {
  const styles: Record<string, string> = {
    brouillon: "bg-secondary text-muted-foreground border-border",
    emise: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    payee: "bg-green-500/10 text-green-600 border-green-500/20",
    annulee: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return styles[statut] ?? "bg-secondary text-muted-foreground border-border";
};

const getStatusIcon = (statut: string) => {
  switch (statut) {
    case "payee": return <CheckCircle className="h-3 w-3" />;
    case "emise": return <Send className="h-3 w-3" />;
    case "annulee": return <XCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const ITEMS_PER_PAGE = 8;

const AdminFactures = () => {
  const { toast } = useToast();
  const { factures, stats, loading, error, fetchFactures, emitFacture, markPaid, cancelFacture, downloadFacture } = useFacture();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedFacture, setSelectedFacture] = useState<FactureItem | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Payment modal
  const [payModal, setPayModal] = useState<FactureItem | null>(null);
  const [payMethod, setPayMethod] = useState("");

  const getClientName = (f: FactureItem) => {
    const u = f.commande?.utilisateur;
    return [u?.prenom, u?.nom].filter(Boolean).join(" ").trim() || "Client";
  };

  const filtered = useMemo(() => {
    return factures.filter((f) => {
      const byStatus = statusFilter === "all" || f.statut === statusFilter;
      const q = search.toLowerCase();
      const clientName = getClientName(f).toLowerCase();
      const bySearch =
        f.facture_ref.toLowerCase().includes(q) ||
        clientName.includes(q) ||
        (f.commande?.commande_uuid ?? "").toLowerCase().includes(q) ||
        (f.commande?.utilisateur?.email ?? "").toLowerCase().includes(q);
      return byStatus && bySearch;
    });
  }, [factures, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAction = async (id: number, action: () => Promise<void>, successMsg: string) => {
    try {
      setActionLoading(id);
      await action();
      toast({ title: "Succès", description: successMsg });
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat()[0]
        : e?.response?.data?.message || "Une erreur est survenue.";
      toast({ title: "Erreur", description: String(msg) });
    } finally {
      setActionLoading(null);
    }
  };

  const onPayConfirm = async () => {
    if (!payModal) return;
    await handleAction(payModal.id, () => markPaid(payModal.id, payMethod || undefined), "Facture marquée comme payée.");
    setPayModal(null);
    setPayMethod("");
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Référence", "Commande", "Client", "Montant", "Devise", "Statut", "Émission", "Paiement"],
      ...filtered.map(f => [
        f.facture_ref,
        f.commande?.commande_uuid ?? "-",
        getClientName(f),
        String(f.montant_total),
        f.devise,
        FACTURE_STATUS_LABELS[f.statut],
        formatDate(f.date_emission),
        formatDate(f.date_paiement),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">Gestion et suivi des factures.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition">
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
          <button onClick={() => fetchFactures()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition">
            <RefreshCcw className="h-4 w-4" /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Brouillons</p><p className="text-xl font-bold">{stats.brouillon}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Émises</p><p className="text-xl font-bold text-blue-600">{stats.emises}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Payées</p><p className="text-xl font-bold text-green-600">{stats.payees}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Annulées</p><p className="text-xl font-bold text-destructive">{stats.annulees}</p></div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-xs text-muted-foreground">CA facturé</p>
          <p className="text-xl font-bold">{(stats.montantTotal / 1000).toFixed(0)}K MGA</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par référence, commande ou client..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-background"
        >
          <option value="all">Tous les statuts</option>
          {FACTURE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{FACTURE_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...</div>
      ) : error ? (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">{error}</div>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left p-3">Référence</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Montant</th>
                <th className="text-left p-3">Émission</th>
                <th className="text-left p-3">Paiement</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((f) => (
                <tr key={f.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-mono text-xs font-semibold">{f.facture_ref}</td>
                  <td className="p-3">
                    <div className="font-medium">{getClientName(f)}</div>
                    <div className="text-xs text-muted-foreground">{f.commande?.utilisateur?.email ?? "-"}</div>
                  </td>
                  <td className="p-3 font-semibold">{formatMoney(f.montant_total, f.devise)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(f.date_emission)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(f.date_paiement)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(f.statut)}`}>
                      {getStatusIcon(f.statut)}
                      {FACTURE_STATUS_LABELS[f.statut]}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedFacture(f)} className="p-2 rounded hover:bg-secondary" title="Détail"><Eye className="h-4 w-4" /></button>
                      {f.statut === "brouillon" && (
                        <button
                          onClick={() => handleAction(f.id, () => emitFacture(f.id), "Facture émise.")}
                          disabled={actionLoading === f.id}
                          className="p-2 rounded text-blue-600 hover:bg-blue-500/10" title="Émettre"
                        >
                          {actionLoading === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      )}
                      {f.statut === "emise" && (
                        <button onClick={() => { setPayModal(f); setPayMethod(""); }} className="p-2 rounded text-green-600 hover:bg-green-500/10" title="Marquer payée">
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      {(f.statut === "brouillon" || f.statut === "emise") && (
                        <button
                          onClick={() => handleAction(f.id, () => cancelFacture(f.id), "Facture annulée.")}
                          disabled={actionLoading === f.id}
                          className="p-2 rounded text-destructive hover:bg-destructive/10" title="Annuler"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      {f.statut !== "brouillon" && (
                        <button
                          onClick={() => handleAction(f.id, () => downloadFacture(f.id), "Téléchargement lancé.")}
                          className="p-2 rounded hover:bg-secondary" title="Télécharger PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td className="p-8 text-center text-muted-foreground" colSpan={7}>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  Aucune facture trouvée.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} résultat(s)</p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border disabled:opacity-60" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
            <span className="text-sm">{currentPage}/{totalPages}</span>
            <button className="px-3 py-1 rounded border disabled:opacity-60" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Suivant</button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl"><FileText className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h2 className="font-bold text-lg">Facture {selectedFacture.facture_ref}</h2>
                    <p className="text-xs text-muted-foreground">Commande: {selectedFacture.commande?.commande_uuid?.slice(0, 8) ?? "-"}...</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFacture(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium">{getClientName(selectedFacture)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedFacture.commande?.utilisateur?.email ?? "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span className="font-bold text-lg text-primary">{formatMoney(selectedFacture.montant_total, selectedFacture.devise)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date émission</span><span>{formatDate(selectedFacture.date_emission)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date paiement</span><span>{formatDate(selectedFacture.date_paiement)}</span></div>
                {selectedFacture.methode_paiement && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Méthode</span><span>{selectedFacture.methode_paiement}</span></div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(selectedFacture.statut)}`}>
                    {getStatusIcon(selectedFacture.statut)}
                    {FACTURE_STATUS_LABELS[selectedFacture.statut]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Marquer comme payée</h3>
              <p className="text-sm text-muted-foreground">Facture <span className="font-semibold text-foreground">{payModal.facture_ref}</span> — {formatMoney(payModal.montant_total, payModal.devise)}</p>
              <input
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                placeholder="Méthode de paiement (ex: Virement, Espèces...)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
              <div className="flex gap-3">
                <button onClick={() => setPayModal(null)} className="flex-1 px-4 py-2 text-sm border border-border rounded-xl hover:bg-secondary transition">Annuler</button>
                <button onClick={onPayConfirm} className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition">Confirmer le paiement</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFactures;