import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Loader2, RefreshCcw, Search, X, Clock, CheckCircle, Truck, Package, XCircle, RotateCcw } from "lucide-react";
import useCommande, { StatutCommandeApi, type CommandeDetail } from "@/hooks/useCommande";
import useClients from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<StatutCommandeApi, string> = {
  en_attente: "En attente",
  payee: "Payée",
  en_traitement: "En traitement",
  expediee: "Expédiée",
  terminee: "Terminée",
  annulee: "Annulée",
  remboursee: "Remboursée",
};

const STATUS_OPTIONS: StatutCommandeApi[] = [
  "en_attente", "payee", "en_traitement", "expediee", "terminee", "annulee", "remboursee",
];

const getStatusStyle = (statut: string) => {
  const styles: Record<string, string> = {
    en_attente: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    payee: "bg-green-500/10 text-green-600 border-green-500/20",
    en_traitement: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    expediee: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    terminee: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    annulee: "bg-destructive/10 text-destructive border-destructive/20",
    remboursee: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };
  return styles[statut] ?? "bg-secondary text-muted-foreground border-border";
};

const getStatusIcon = (statut: string) => {
  switch (statut) {
    case "en_attente": return <Clock className="h-3 w-3" />;
    case "payee": return <CheckCircle className="h-3 w-3" />;
    case "en_traitement": return <Package className="h-3 w-3" />;
    case "expediee": return <Truck className="h-3 w-3" />;
    case "terminee": return <CheckCircle className="h-3 w-3" />;
    case "annulee": return <XCircle className="h-3 w-3" />;
    case "remboursee": return <RotateCcw className="h-3 w-3" />;
    default: return null;
  }
};

const formatMoney = (value: number, devise: string) => `${value.toLocaleString()} ${devise}`;

const ITEMS_PER_PAGE = 8;

const AdminCommandes = () => {
  const { toast } = useToast();
  const { commandes, loading, error, fetchCommandes, fetchCommandeDetail, updateStatus, cancelCommande, createCommande } = useCommande();
  const { clients } = useClients();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<CommandeDetail | null>(null);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  // Create form
  const [submitting, setSubmitting] = useState(false);
  const [createClientId, setCreateClientId] = useState<number | "">("");
  const [createLivraison, setCreateLivraison] = useState("0");
  const [createDevise, setCreateDevise] = useState("MGA");

  const filtered = useMemo(() => {
    return commandes.filter((c) => {
      const byStatus = statusFilter === "all" || c.statut === statusFilter;
      const q = search.toLowerCase();
      const bySearch =
        c.uuid.toLowerCase().includes(q) ||
        c.clientNom.toLowerCase().includes(q) ||
        c.clientEmail.toLowerCase().includes(q);
      return byStatus && bySearch;
    });
  }, [commandes, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: commandes.length,
    enAttente: commandes.filter((c) => c.statut === "en_attente").length,
    payees: commandes.filter((c) => c.statut === "payee").length,
    expediees: commandes.filter((c) => c.statut === "expediee").length,
    montant: commandes.reduce((sum, c) => sum + c.total, 0),
  }), [commandes]);

  const onViewDetail = async (uuid: string) => {
    try {
      const payload = await fetchCommandeDetail(uuid);
      setSelectedUuid(uuid);
      setDetail(payload);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger le détail." });
    }
  };

  const onStatusChange = async (uuid: string, statut: StatutCommandeApi) => {
    try {
      await updateStatus(uuid, statut);
      toast({ title: "Statut mis à jour", description: `${STATUS_LABELS[statut]}` });
    } catch {
      toast({ title: "Erreur", description: "Échec de mise à jour du statut." });
    }
  };

  const onCancel = async (uuid: string) => {
    try {
      await cancelCommande(uuid);
      toast({ title: "Commande annulée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'annuler la commande." });
    }
  };

  const onCreateCommande = async () => {
    if (!createClientId) {
      toast({ title: "Champ requis", description: "Sélectionnez un client." });
      return;
    }
    try {
      setSubmitting(true);
      await createCommande({
        utilisateur_id: Number(createClientId),
        livraison: Number(createLivraison || 0),
        devise: createDevise || "MGA",
      });
      toast({ title: "Commande créée", description: "Commande créée depuis le panier actif du client." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Impossible de créer la commande." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Suivi et gestion des commandes clients.</p>
        </div>
        <button
          onClick={() => fetchCommandes()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">En attente</p><p className="text-xl font-bold text-amber-600">{stats.enAttente}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Payées</p><p className="text-xl font-bold text-green-600">{stats.payees}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">Expédiées</p><p className="text-xl font-bold text-indigo-600">{stats.expediees}</p></div>
        <div className="p-4 rounded-xl border bg-card"><p className="text-xs text-muted-foreground">CA total</p><p className="text-xl font-bold">{stats.montant.toLocaleString()} MGA</p></div>
      </div>

      {/* Create */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold">Créer une commande</h2>
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
          <input value={createLivraison} onChange={(e) => setCreateLivraison(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background" placeholder="Livraison (MGA)" />
          <input value={createDevise} onChange={(e) => setCreateDevise(e.target.value.toUpperCase())} className="px-3 py-2 rounded-lg border border-border bg-background" placeholder="Devise" />
        </div>
        <button onClick={onCreateCommande} disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60 transition">
          {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Création...</span> : "Créer la commande"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par UUID, client ou email"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-background"
        >
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
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
                <th className="text-left p-3">UUID</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Articles</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => (
                <tr key={c.uuid} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-mono text-xs">{c.uuid.slice(0, 8)}...</td>
                  <td className="p-3">
                    <div className="font-medium">{c.clientNom}</div>
                    <div className="text-muted-foreground text-xs">{c.clientEmail}</div>
                  </td>
                  <td className="p-3 font-semibold">{formatMoney(c.total, c.devise)}</td>
                  <td className="p-3">{c.itemsCount}</td>
                  <td className="p-3">
                    <select
                      value={c.statut}
                      onChange={(e) => onStatusChange(c.uuid, e.target.value as StatutCommandeApi)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border cursor-pointer ${getStatusStyle(c.statut)}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onViewDetail(c.uuid)} className="p-2 rounded hover:bg-secondary" title="Détail"><Eye className="h-4 w-4" /></button>
                      {c.statut !== "annulee" && c.statut !== "remboursee" && (
                        <button onClick={() => onCancel(c.uuid)} className="p-2 rounded text-destructive hover:bg-destructive/10" title="Annuler"><AlertTriangle className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td className="p-8 text-center text-muted-foreground" colSpan={6}>Aucune commande trouvée.</td></tr>
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
      {detail && selectedUuid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Détail commande</h2>
                <button onClick={() => { setDetail(null); setSelectedUuid(null); }}><X className="h-5 w-5" /></button>
              </div>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>UUID: <span className="text-foreground font-mono text-xs">{selectedUuid}</span></p>
                <p>Statut: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(detail.resume.statut)}`}>{getStatusIcon(detail.resume.statut)} {STATUS_LABELS[detail.resume.statut]}</span></p>
                <p>Total: <span className="text-foreground font-semibold">{formatMoney(detail.resume.total, detail.resume.devise)}</span></p>
              </div>
              <div className="space-y-2">
                {detail.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between border border-border/50 rounded-lg px-3 py-2">
                    <div>
                      <p className="font-medium">{it.titre}</p>
                      <p className="text-xs text-muted-foreground">Qté: {it.quantite}</p>
                    </div>
                    <div className="font-semibold">{formatMoney(it.prix_unitaire * it.quantite, it.devise)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommandes;
