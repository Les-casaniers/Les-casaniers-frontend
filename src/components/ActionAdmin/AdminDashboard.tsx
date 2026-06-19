import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, Activity,
  FileText, ClipboardList, Loader2, RefreshCcw, AlertTriangle,
  CheckCircle, Clock, Truck, ArrowUpRight, ArrowDownRight,
  Eye, MoreVertical, ChevronRight, Zap, BarChart3, PieChart,
  Shield, Store, Star,
  Settings
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
    en_attente: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    payee: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    en_traitement: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    expediee: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    terminee: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    annulee: "bg-destructive/10 text-destructive border-destructive/20",
    remboursee: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  };
  return styles[statut] ?? "bg-secondary text-muted-foreground border-border";
};

const getStatusIcon = (statut: string) => {
  switch (statut) {
    case "en_attente": return <Clock className="h-3 w-3" />;
    case "payee": return <CheckCircle className="h-3 w-3" />;
    case "expediee": return <Truck className="h-3 w-3" />;
    case "en_traitement": return <Activity className="h-3 w-3" />;
    case "terminee": return <CheckCircle className="h-3 w-3" />;
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const isLoading = loadingCmd || loadingClients || loadingDevis || loadingFactures || loadingProducts;

  // Commande stats
  const cmdStats = useMemo(() => ({
    total: commandes.length,
    enAttente: commandes.filter((c) => c.statut === "en_attente").length,
    payees: commandes.filter((c) => c.statut === "payee").length,
    expediees: commandes.filter((c) => c.statut === "expediee").length,
    terminees: commandes.filter((c) => c.statut === "terminee").length,
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
      trend: cmdStats.total > 0 ? "+12%" : "0%",
      trendUp: true,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      icon: DollarSign,
      label: "CA Total",
      value: formatMoney(cmdStats.ca),
      sub: `${cmdStats.payees} commandes payées`,
      trend: "+8.5%",
      trendUp: true,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Users,
      label: "Clients",
      value: String(clients.length),
      sub: `${clients.filter((c) => c.statut === "Actif").length} actifs`,
      trend: "+5.2%",
      trendUp: true,
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-500/10",
    },
    {
      icon: Package,
      label: "Stock total",
      value: productStats.totalStock.toLocaleString(),
      sub: `${productStats.actifs} produits actifs`,
      trend: "-2.1%",
      trendUp: false,
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  const handleRefresh = () => {
    fetchCommandes();
    fetchClients();
  };

  return (
    <div className="space-y-8">
      {/* Header amélioré */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Administration</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Tableau de bord</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Vue d'ensemble
          </h1>
          <p className="text-muted-foreground mt-1">Analysez et gérez votre activité en temps réel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-secondary transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span className="text-sm font-medium">Actualiser</span>
          </button>
          <Link
            to="/DashboardAdmin/parametres"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 hover:shadow-lg hover:shadow-foreground/20"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Paramètres</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards améliorées */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className="relative bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:border-foreground/20 hover:-translate-y-1"
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`h-11 w-11 rounded-xl ${kpi.bg} flex items-center justify-center transition-transform duration-300 ${hoveredCard === idx ? 'scale-110' : ''}`}>
                <kpi.icon className={`h-5 w-5 text-${kpi.color.split('-')[1]}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? <span className="inline-block w-20 h-8 bg-secondary animate-pulse rounded" /> : kpi.value}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{kpi.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{isLoading ? "" : kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Section principale améliorée */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernières commandes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Dernières commandes</h3>
                <p className="text-xs text-muted-foreground/60">Les 5 dernières commandes passées</p>
              </div>
            </div>
            <Link
              to="/DashboardAdmin/commandes"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium transition-colors"
            >
              Voir tout
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
            </div>
          ) : recentCommandes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune commande récente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Commande</th>
                    <th className="text-left py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Client</th>
                    <th className="text-left py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Statut</th>
                    <th className="text-right py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCommandes.map((cmd) => (
                    <tr key={cmd.uuid} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors group">
                      <td className="py-3.5">
                        <span className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded">{cmd.uuid.slice(0, 8)}</span>
                      </td>
                      <td className="py-3.5">
                        <p className="font-medium text-foreground">{cmd.clientNom}</p>
                        <p className="text-xs text-muted-foreground">{cmd.clientEmail}</p>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium border ${getStatusStyle(cmd.statut)}`}>
                          {getStatusIcon(cmd.statut)}
                          {STATUS_LABELS[cmd.statut] ?? cmd.statut}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-foreground">
                        {cmd.total.toLocaleString()} <span className="text-xs text-muted-foreground">{cmd.devise}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Résumé rapide amélioré */}
        <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center">
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Actions rapides</h3>
              <p className="text-xs text-muted-foreground/60">Gérez vos tâches importantes</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/DashboardAdmin/commandes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group hover:pl-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm font-medium">En attente</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{cmdStats.enAttente}</span>
            </Link>

            <Link
              to="/DashboardAdmin/commandes"
              className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group hover:pl-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Truck className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="text-sm font-medium">À expédier</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">{cmdStats.expediees}</span>
            </Link>

            <Link
              to="/DashboardAdmin/devis"
              className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group hover:pl-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Devis en cours</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{devisStats.envoye}</span>
            </Link>

            <Link
              to="/DashboardAdmin/factures"
              className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group hover:pl-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <FileText className="h-4 w-4 text-teal-500" />
                </div>
                <span className="text-sm font-medium">Factures impayées</span>
              </div>
              <span className="text-lg font-bold text-teal-600">{factureStats.emises}</span>
            </Link>
          </div>

          {/* Taux de conversion */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taux de conversion</span>
              <span className="text-sm font-bold text-foreground">
                {cmdStats.total > 0 ? Math.round((cmdStats.payees / cmdStats.total) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                style={{ width: `${cmdStats.total > 0 ? (cmdStats.payees / cmdStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section inférieure améliorée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes stock */}
        <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Alertes stock</h3>
                <p className="text-xs text-muted-foreground/60">Produits en rupture ou en faible quantité</p>
              </div>
            </div>
            <Link
              to="/DashboardAdmin/produits"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium transition-colors"
            >
              Gérer
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
            </div>
          ) : productStats.lowStock.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Tous les stocks sont OK</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Aucun produit en dessous du seuil critique</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {productStats.lowStock.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                    p.quantite_stock === 0
                      ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10'
                      : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      p.quantite_stock === 0
                        ? 'bg-destructive/20'
                        : 'bg-amber-500/20'
                    }`}>
                      {p.quantite_stock === 0 ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Package className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.nom}</p>
                      <p className="text-[10px] text-muted-foreground">{p.reference ?? "Sans référence"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`text-lg font-bold ${
                      p.quantite_stock === 0 ? "text-destructive" : "text-amber-600"
                    }`}>
                      {p.quantite_stock}
                    </span>
                    <p className="text-[10px] text-muted-foreground">en stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition commandes améliorée */}
        <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Répartition</h3>
              <p className="text-xs text-muted-foreground/60">État des commandes en cours</p>
            </div>
          </div>

          {loadingCmd ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
            </div>
          ) : cmdStats.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune commande à analyser.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "En attente", count: cmdStats.enAttente, color: "from-amber-500 to-amber-400", icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> },
                { label: "Payées", count: cmdStats.payees, color: "from-green-500 to-green-400", icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" /> },
                { label: "Expédiées", count: cmdStats.expediees, color: "from-indigo-500 to-indigo-400", icon: <Truck className="h-3.5 w-3.5 text-indigo-500" /> },
                { label: "Terminées", count: cmdStats.terminees, color: "from-emerald-500 to-emerald-400", icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> },
              ].map((item) => {
                const pct = cmdStats.total > 0 ? Math.round((item.count / cmdStats.total) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-foreground/80">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-muted-foreground">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total commandes</span>
                <span className="font-bold text-foreground">{cmdStats.total}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.3);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;