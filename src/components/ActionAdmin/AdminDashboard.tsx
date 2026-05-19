import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, Activity,
  FileText, ClipboardList, Loader2, RefreshCcw, AlertTriangle,
  CheckCircle, Clock, Truck, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import useCommande from "@/hooks/useCommande";
import useClients from "@/hooks/useClients";
import useDevis from "@/hooks/useDevis";
import useFacture from "@/hooks/useFacture";
import { useProducts } from "@/hooks/useProducts";

const formatMoney = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M Ar`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K Ar`;
  return `${value.toLocaleString()} Ar`;
};

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  payee: "Payée",
  en_traitement: "En traitement",
  expediee: "Expédiée",
  terminee: "Terminée",
  annulee: "Annulée",
  remboursee: "Remboursée",
};

const getStatusStyle = (statut: string) => {
  const styles: Record<string, string> = {
    en_attente: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    payee: "bg-green-500/10 text-green-700 dark:text-green-400",
    en_traitement: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    expediee: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    terminee: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    annulee: "bg-destructive/10 text-destructive",
    remboursee: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };
  return styles[statut] ?? "bg-secondary text-muted-foreground";
};

const getStatusIcon = (statut: string) => {
  switch (statut) {
    case "en_attente": return <Clock className="h-3 w-3" />;
    case "payee": return <CheckCircle className="h-3 w-3" />;
    case "expediee": return <Truck className="h-3 w-3" />;
    default: return null;
  }
};

const LOW_STOCK_THRESHOLD = 5;

const AdminDashboard = () => {
  const { commandes, loading: loadingCmd, fetchCommandes } = useCommande();
  const { clients, loading: loadingClients, fetchClients } = useClients();
  const { stats: devisStats, loading: loadingDevis } = useDevis();
  const { stats: factureStats, loading: loadingFactures } = useFacture();
  const { data: products, isLoading: loadingProducts } = useProducts();

  const isLoading = loadingCmd || loadingClients || loadingDevis || loadingFactures || loadingProducts;

  // Commande stats
  const cmdStats = useMemo(() => ({
    total: commandes.length,
    enAttente: commandes.filter((c) => c.statut === "en_attente").length,
    payees: commandes.filter((c) => c.statut === "payee").length,
    expediees: commandes.filter((c) => c.statut === "expediee").length,
    ca: commandes.reduce((sum, c) => sum + c.total, 0),
  }), [commandes]);

  // Product stats
  const productStats = useMemo(() => {
    if (!products) return { total: 0, actifs: 0, totalStock: 0, lowStock: [] as typeof products };
    const actifs = products.filter((p) => p.actif);
    const totalStock = products.reduce((sum, p) => sum + p.quantite_stock, 0);
    const lowStock = products
      .filter((p) => p.actif && p.quantite_stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.quantite_stock - b.quantite_stock)
      .slice(0, 5);
    return { total: products.length, actifs: actifs.length, totalStock, lowStock };
  }, [products]);

  // Recent commandes (last 5)
  const recentCommandes = useMemo(() => {
    return commandes.slice(0, 5);
  }, [commandes]);

  // KPI cards
  const kpiCards = [
    {
      icon: ShoppingCart,
      label: "Commandes",
      value: String(cmdStats.total),
      sub: `${cmdStats.enAttente} en attente`,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      icon: Users,
      label: "Clients",
      value: String(clients.length),
      sub: `${clients.filter((c) => c.statut === "Actif").length} actifs`,
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
    },
    {
      icon: Package,
      label: "Produits end stock",
      value: productStats.totalStock.toLocaleString(),
      sub: `${productStats.actifs} produits actifs`,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      icon: ClipboardList,
      label: "Devis",
      value: String(devisStats.total),
      sub: `${devisStats.accepte} acceptés`,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      icon: FileText,
      label: "Factures",
      value: String(factureStats.total),
      sub: `${factureStats.emises} en attente de paiement`,
      color: "text-teal-600",
      bg: "bg-teal-500/10",
    },
  ];

  const handleRefresh = () => {
    fetchCommandes();
    fetchClients();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? <span className="inline-block w-16 h-7 bg-secondary animate-pulse rounded" /> : kpi.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{isLoading ? "" : kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Dernières commandes + Résumé rapide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dernières commandes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Dernières commandes</h3>
            <Link to="/DashboardAdmin/commandes" className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
              Voir tout <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
            </div>
          ) : recentCommandes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune commande récente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">UUID</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Client</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Statut</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCommandes.map((cmd) => (
                    <tr key={cmd.uuid} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition">
                      <td className="py-3 font-mono text-xs">{cmd.uuid.slice(0, 8)}...</td>
                      <td className="py-3">
                        <p className="font-medium text-foreground">{cmd.clientNom}</p>
                        <p className="text-xs text-muted-foreground">{cmd.clientEmail}</p>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusStyle(cmd.statut)}`}>
                          {getStatusIcon(cmd.statut)}
                          {STATUS_LABELS[cmd.statut] ?? cmd.statut}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-foreground">{cmd.total.toLocaleString()} {cmd.devise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Résumé rapide */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Résumé rapide</h3>

          <div className="space-y-3">
            <Link to="/DashboardAdmin/commandes" className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition group">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Commandes en attente</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{cmdStats.enAttente}</span>
            </Link>

            <Link to="/DashboardAdmin/commandes" className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition group">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium">En cours d'expédition</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">{cmdStats.expediees}</span>
            </Link>

            <Link to="/DashboardAdmin/devis" className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition group">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Devis en attente</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{devisStats.envoye}</span>
            </Link>

            <Link to="/DashboardAdmin/factures" className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition group">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-500" />
                <span className="text-sm font-medium">Factures non payées</span>
              </div>
              <span className="text-lg font-bold text-teal-600">{factureStats.emises}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alertes stock + Répartition commandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alertes stock */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-destructive" />
              Alertes stock
            </h3>
            <Link to="/DashboardAdmin/produits" className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
              Gérer <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {loadingProducts ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement...
            </div>
          ) : productStats.lowStock.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Tous les stocks sont OK</span>
            </div>
          ) : (
            <div className="space-y-2">
              {productStats.lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${p.quantite_stock === 0 ? "text-destructive" : "text-amber-500"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.nom}</p>
                      <p className="text-[10px] text-muted-foreground">{p.reference ?? "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${p.quantite_stock === 0 ? "text-destructive" : "text-amber-600"}`}>
                      {p.quantite_stock}
                    </span>
                    <p className="text-[10px] text-muted-foreground">en stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition commandes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            Répartition des commandes
          </h3>
          {loadingCmd ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement...
            </div>
          ) : cmdStats.total === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune commande.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: "En attente", count: cmdStats.enAttente, color: "bg-amber-500", icon: <Clock className="h-3.5 w-3.5 text-amber-600" /> },
                { label: "Payées", count: cmdStats.payees, color: "bg-green-500", icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" /> },
                { label: "Expédiées", count: cmdStats.expediees, color: "bg-indigo-500", icon: <Truck className="h-3.5 w-3.5 text-indigo-600" /> },
              ].map((item) => {
                const pct = cmdStats.total > 0 ? Math.round((item.count / cmdStats.total) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-muted-foreground">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total commandes</span>
                <span className="font-bold text-foreground">{cmdStats.total}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;