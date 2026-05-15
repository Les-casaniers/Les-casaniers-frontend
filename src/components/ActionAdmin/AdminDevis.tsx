import { useMemo, useState } from "react";
import { FileText, Loader2, RefreshCcw, Search, Eye, X, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import useDevis, { DEVIS_STATUS_LABELS, DEVIS_STATUS_OPTIONS, type DevisItem } from "@/hooks/useDevis";
import useClients from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

const formatMoney = (value: number, devise: string) => `${value.toLocaleString()} ${devise}`;
const formatDate = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
};

const getStatusStyle = (statut: string) => {
  const styles: Record<string, string> = {
    brouillon: "bg-secondary text-muted-foreground border-border",
    envoye: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    accepte: "bg-green-500/10 text-green-600 border-green-500/20",
    refuse: "bg-destructive/10 text-destructive border-destructive/20",
    expire: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  return styles[statut] ?? "bg-secondary text-muted-foreground border-border";
};

const getStatusIcon = (statut: string) => {
  switch (statut) {
    case "accepte": return <CheckCircle className="h-3 w-3" />;
    case "envoye": return <Clock className="h-3 w-3" />;
    case "refuse": return <XCircle className="h-3 w-3" />;
    case "expire": return <AlertTriangle className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
};

const ITEMS_PER_PAGE = 8;

const AdminDevis = () => {
  const { toast } = useToast();
  const { devis, stats, loading, error, fetchDevis, createDevis } = useDevis();
  const { clients } = useClients();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Create form
  const [createClientId, setCreateClientId] = useState<number | "">("");
  const [devisPanierId, setDevisPanierId] = useState("");
  const [devisNote, setDevisNote] = useState("");
  const [createDevise, setCreateDevise] = useState("MGA");
  const [submitting, setSubmitting] = useState(false);

  // Detail modal
  const [selectedDevis, setSelectedDevis] = useState<DevisItem | null>(null);

  const filtered = useMemo(() => {
    return devis.filter((d) => {
      const byStatus = statusFilter === "all" || d.statut === statusFilter;
      const q = search.toLowerCase();
      const clientNom = [d.utilisateur?.prenom, d.utilisateur?.nom].filter(Boolean).join(" ").toLowerCase();
      const bySearch =
        String(d.id).includes(q) ||
        clientNom.includes(q) ||
        (d.utilisateur?.email ?? "").toLowerCase().includes(q) ||
        (d.note ?? "").toLowerCase().includes(q);
      return byStatus && bySearch;
    });
  }, [devis, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const onCreateDevis = async () => {
    if (!createClientId) {
      toast({ title: "Champ requis", description: "Sélectionnez un client." });
      return;
    }
    try {
      setSubmitting(true);
      await createDevis({
        utilisateur_id: Number(createClientId),
        panier_id: devisPanierId ? Number(devisPanierId) : undefined,
        note: devisNote || undefined,
        devise: createDevise || "MGA",
      });
      toast({ title: "Devis créé", description: "Le devis a été créé avec succès." });
      setDevisPanierId("");
      setDevisNote("");
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat()[0]
        : e?.response?.data?.message || "Impossible de créer le devis.";
      toast({ title: "Erreur", description: String(msg) });
    } finally {
      setSubmitting(false);
    }
  };

  const getClientName = (d: DevisItem) => {
    return [d.utilisateur?.prenom, d.utilisateur?.nom].filter(Boolean).join(" ").trim() || "Client";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">Gestion et suivi des devis clients.</p>
        </div>
        <button
          onClick={() => fetchDevis()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Brouillons</p><p className="text-xl font-bold">{stats.brouillon}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Envoyés</p><p className="text-xl font-bold text-blue-600">{stats.envoye}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Acceptés</p><p className="text-xl font-bold text-green-600">{stats.accepte}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Refusés</p><p className="text-xl font-bold text-destructive">{stats.refuse}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Montant total</p><p className="text-xl font-bold">{(stats.montantTotal / 1000).toFixed(0)}K MGA</p></div>
      </div>

      {/* Create form */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold">Créer un devis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={createClientId}
            onChange={(e) => setCreateClientId(e.target.value ? Number(e.target.value) : "")}
            className="px-3 py-2 rounded-lg border border-border bg-background md:col-span-2"
          >
            <option value="">Choisir un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nomComplet} ({c.email})</option>
            ))}
          </select>
          <input value={devisPanierId} onChange={(e) => setDevisPanierId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background" placeholder="Panier ID (optionnel)" />
          <input value={createDevise} onChange={(e) => setCreateDevise(e.target.value.toUpperCase())} className="px-3 py-2 rounded-lg border border-border bg-background" placeholder="Devise (MGA)" />
          <input value={devisNote} onChange={(e) => setDevisNote(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background md:col-span-4" placeholder="Note (optionnel)" />
        </div>
        <button onClick={onCreateDevis} disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60 transition">
          {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Création...</span> : "Créer le devis"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par ID, client ou note..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-background"
        >
          <option value="all">Tous les statuts</option>
          {DEVIS_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{DEVIS_STATUS_LABELS[s]}</option>
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
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Montant</th>
                <th className="text-left p-3">Note</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((d) => (
                <tr key={d.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-mono text-xs">DEV-{String(d.id).padStart(3, "0")}</td>
                  <td className="p-3">
                    <div className="font-medium">{getClientName(d)}</div>
                    <div className="text-xs text-muted-foreground">{d.utilisateur?.email ?? "-"}</div>
                  </td>
                  <td className="p-3 font-semibold">{formatMoney(d.montant_total, d.devise)}</td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate">{d.note || "-"}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(d.date_creation)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(d.statut)}`}>
                      {getStatusIcon(d.statut)}
                      {DEVIS_STATUS_LABELS[d.statut]}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button onClick={() => setSelectedDevis(d)} className="p-2 rounded hover:bg-secondary" title="Détail"><Eye className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td className="p-8 text-center text-muted-foreground" colSpan={7}>Aucun devis trouvé.</td></tr>
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
      {selectedDevis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Détail du devis DEV-{String(selectedDevis.id).padStart(3, "0")}</h2>
                <button onClick={() => setSelectedDevis(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium">{getClientName(selectedDevis)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedDevis.utilisateur?.email ?? "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span className="font-semibold">{formatMoney(selectedDevis.montant_total, selectedDevis.devise)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date création</span><span>{formatDate(selectedDevis.date_creation)}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(selectedDevis.statut)}`}>
                    {getStatusIcon(selectedDevis.statut)}
                    {DEVIS_STATUS_LABELS[selectedDevis.statut]}
                  </span>
                </div>
                {selectedDevis.note && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Note</p>
                    <p className="text-foreground">{selectedDevis.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevis;
