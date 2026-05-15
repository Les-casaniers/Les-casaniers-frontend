import { useMemo, useState } from "react";
import {
  Calendar,
  Eye,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import useClients from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

type StatusFilter = "all" | "Actif" | "Inactif";

const formatDate = (isoDate: string) => {
  if (!isoDate) return "-";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("fr-FR");
};

const AdminClients = () => {
  const { toast } = useToast();
  const {
    clients,
    loading,
    error,
    fetchClients,
    addressLoadingByClient,
    addressesByClient,
    fetchClientAddresses,
    getApiErrorMessage,
  } = useClients();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId],
  );

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.trim().toLowerCase();
      const bySearch =
        q.length === 0 ||
        c.nomComplet.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telephone.toLowerCase().includes(q);

      const byStatus = filterStatus === "all" || c.statut === filterStatus;
      return bySearch && byStatus;
    });
  }, [clients, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(
    () => ({
      total: clients.length,
      actifs: clients.filter((c) => c.statut === "Actif").length,
      inactifs: clients.filter((c) => c.statut === "Inactif").length,
    }),
    [clients],
  );

  const openDetail = (id: number) => {
    setSelectedClientId(id);
    setDetailOpen(true);
    fetchClientAddresses(id).catch((e: any) => {
      toast({
        title: "Erreur",
        description: getApiErrorMessage(e, "Impossible de charger les adresses du client."),
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des clients</h1>
          <p className="text-muted-foreground">Liste des clients et leurs informations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchClients()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-card border rounded-xl p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-card border rounded-xl p-4"><p className="text-xs text-muted-foreground">Actifs</p><p className="text-2xl font-bold text-green-600">{stats.actifs}</p></div>
        <div className="bg-card border rounded-xl p-4"><p className="text-xs text-muted-foreground">Inactifs</p><p className="text-2xl font-bold text-destructive">{stats.inactifs}</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, code, email, téléphone"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-border bg-background"
        >
          <option value="all">Tous</option>
          <option value="Actif">Actifs</option>
          <option value="Inactif">Inactifs</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...</div>
      ) : error ? (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">{error}</div>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Adresses</th>
                <th className="text-left p-3">Inscription</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">Détail</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((client) => {
                return (
                  <tr key={client.id} className="border-t border-border/50">
                    <td className="p-3 font-mono text-xs">{client.code}</td>
                    <td className="p-3 font-medium">{client.nomComplet}</td>
                    <td className="p-3">
                      <p>{client.email}</p>
                      <p className="text-xs text-muted-foreground">{client.telephone}</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border border-border">
                        {client.adressesCount} adresse(s)
                      </span>
                    </td>
                    <td className="p-3">{formatDate(client.dateInscription)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${client.statut === "Actif" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                        {client.statut}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end">
                        <button onClick={() => openDetail(client.id)} className="p-2 rounded hover:bg-secondary" title="Détail"><Eye className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td className="p-6 text-center text-muted-foreground" colSpan={7}>Aucun client trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} résultat(s)</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border disabled:opacity-60" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
          <span className="text-sm">{currentPage}/{totalPages}</span>
          <button className="px-3 py-1 rounded border disabled:opacity-60" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Suivant</button>
        </div>
      </div>

      {detailOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Détail client</h2>
                <button onClick={() => setDetailOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 text-sm mb-6">
                <p className="font-semibold">{selectedClient.nomComplet}</p>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {selectedClient.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {selectedClient.telephone}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {formatDate(selectedClient.dateInscription)}</div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Adresses client</h3>
                  <button
                    className="text-sm px-3 py-1 rounded border"
                    onClick={() => fetchClientAddresses(selectedClient.id)}
                  >
                    Actualiser adresses
                  </button>
                </div>

                {addressLoadingByClient[selectedClient.id] ? (
                  <div className="p-4 text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des adresses...</div>
                ) : (
                  <div className="space-y-2">
                    {(addressesByClient[selectedClient.id] ?? []).map((addr) => (
                      <div key={addr.id} className="border rounded-lg p-3">
                        <div className="text-sm">
                          <p className="font-medium">{addr.nom_complet} {addr.etiquette ? `(${addr.etiquette})` : ""}</p>
                          <p className="text-muted-foreground">{addr.adresse_ligne1}{addr.adresse_ligne2 ? `, ${addr.adresse_ligne2}` : ""}, {addr.ville}{addr.region ? `, ${addr.region}` : ""}{addr.code_postal ? ` (${addr.code_postal})` : ""}, {addr.pays}</p>
                          <p className="text-muted-foreground">{addr.telephone || "-"}</p>
                          {addr.par_defaut_expedition && <p className="text-xs text-green-600 mt-1">Adresse d'expédition par défaut</p>}
                        </div>
                      </div>
                    ))}
                    {(addressesByClient[selectedClient.id] ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucune adresse pour ce client.</p>
                    )}
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

export default AdminClients;
