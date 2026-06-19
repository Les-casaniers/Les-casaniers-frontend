import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  Loader2,
  Trash2,
  Truck,
  Gift,
  RefreshCw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  CreditCard,
  LayoutGrid,
  List,
  X,
  Printer,
  ChevronDown,
  Box,
} from "lucide-react";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────────────
type StatutCommande =
  | "en_attente"
  | "payee"
  | "en_traitement"
  | "expediee"
  | "terminee"
  | "annulee";

type ProduitCommande = {
  id: number;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
};

type Commande = {
  id: number;
  commande_uuid: string;
  utilisateur_id: number;
  statut: StatutCommande;
  total: number;
  devise: string;
  date_creation: string;
  quantite: number;
  sous_total: number;
  livraison: number;
  titre?: string;
  produit_id?: number;
  prix_unitaire?: number;
  meta_json?: string | null;
  devis_id?: number | null;
  utilisateur?: { id: number; nom: string; prenom: string; email: string };
  produits?: ProduitCommande[];
};

type Statistiques = {
  total: number;
  enAttente: number;
  enPreparation: number;
  payee: number;
  expediee: number;
  livree: number;
  annulee: number;
};

// ─── Statuts ─────────────────────────────────────────────────────────────────
const statutsDisponibles: { value: StatutCommande; label: string; pill: string }[] = [
  { value: "en_attente",    label: "En attente",      pill: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "payee",         label: "Payée",           pill: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "en_traitement", label: "En préparation",  pill: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "expediee",      label: "Expédiée",        pill: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  { value: "terminee",      label: "Livrée",          pill: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "annulee",       label: "Annulée",         pill: "bg-red-500/10 text-red-600 border-red-500/20" },
];

const getStatut = (statut: StatutCommande) =>
  statutsDisponibles.find((s) => s.value === statut) ?? statutsDisponibles[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

const formatDateShort = (dateString: string) =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });

const formatPrice = (prix: number, devise = "MGA") =>
  new Intl.NumberFormat("fr-FR").format(prix) + ` ${devise}`;

const getProduitsFromCommande = (commande: Commande): ProduitCommande[] => {
  if (commande.produits?.length) return commande.produits;
  if (commande.meta_json) {
    try {
      const meta = typeof commande.meta_json === "string"
        ? JSON.parse(commande.meta_json) : commande.meta_json;
      if (meta.produits?.length) return meta.produits;
      if (meta.items?.length) return meta.items;
    } catch {}
  }
  if (commande.titre) {
    return [{
      id: commande.produit_id || 0,
      nom: commande.titre,
      quantite: commande.quantite || 1,
      prix_unitaire: commande.prix_unitaire || 0,
      sous_total: (commande.prix_unitaire || 0) * (commande.quantite || 1),
    }];
  }
  return [];
};

// ─── Styles partagés ────────────────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-2.5 text-sm border border-border/60 rounded-xl bg-background/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 outline-none";

const MODAL_PANEL =
  "bg-card border border-border/60 rounded-2xl w-full shadow-2xl shadow-black/30 flex flex-col";

// ─── ModalPortal ─────────────────────────────────────────────────────────────
const ModalPortal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>,
    document.body,
  );
};

// ─── StatutPill ──────────────────────────────────────────────────────────────
const StatutPill = ({ statut }: { statut: StatutCommande }) => {
  const s = getStatut(statut);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${s.pill}`}>
      {s.label}
    </span>
  );
};

// ─── ActionButtons ───────────────────────────────────────────────────────────
const ActionButtons = ({
  commande,
  actionInProgress,
  updateStatut,
  onDelete,
  compact = false,
}: {
  commande: Commande;
  actionInProgress: number | null;
  updateStatut: (c: Commande, s: StatutCommande) => void;
  onDelete: (c: Commande) => void;
  compact?: boolean;
}) => {
  const loading = actionInProgress === commande.id;
  const btnBase = `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${compact ? "px-2.5 py-1" : ""}`;

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-3 pt-3 border-t border-border/50"}`}>
      {commande.statut === "en_attente" && (
        <button onClick={() => updateStatut(commande, "payee")} disabled={loading}
          className={`${btnBase} bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white`}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
          Payer
        </button>
      )}
      {commande.statut === "payee" && (
        <button onClick={() => updateStatut(commande, "expediee")} disabled={loading}
          className={`${btnBase} bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white`}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
          Expédier
        </button>
      )}
      {commande.statut === "expediee" && (
        <button onClick={() => updateStatut(commande, "en_traitement")} disabled={loading}
          className={`${btnBase} bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white`}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          En préparation
        </button>
      )}
      {commande.statut === "en_traitement" && (
        <button onClick={() => updateStatut(commande, "terminee")} disabled={loading}
          className={`${btnBase} bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white`}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
          Livrée
        </button>
      )}
      {commande.statut !== "annulee" && commande.statut !== "terminee" && (
        <button onClick={() => updateStatut(commande, "annulee")} disabled={loading}
          className={`${btnBase} bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white`}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Annuler
        </button>
      )}
      {(commande.statut === "annulee" || commande.statut === "terminee") && (
        <button onClick={() => onDelete(commande)} disabled={loading}
          className={`${btnBase} bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white`}>
          <Trash2 className="h-3 w-3" />
          Supprimer
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const AdminCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("toutes");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [statistiques, setStatistiques] = useState<Statistiques>({
    total: 0, enAttente: 0, enPreparation: 0, payee: 0, expediee: 0, livree: 0, annulee: 0,
  });

  useEffect(() => { fetchCommandes(); }, []);
  useEffect(() => { filterCommandes(); }, [commandes, searchTerm, selectedStatut, startDate, endDate]);

  const fetchCommandes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/commandes");
      let data: Commande[] = response.data.data && Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data) ? response.data : [];

      const map = new Map<string, Commande>();
      data.forEach((cmd) => { if (!map.has(cmd.commande_uuid)) map.set(cmd.commande_uuid, cmd); });
      const uniques = Array.from(map.values());
      setCommandes(uniques);

      setStatistiques({
        total: uniques.length,
        enAttente: uniques.filter((c) => c.statut === "en_attente").length,
        enPreparation: uniques.filter((c) => c.statut === "en_traitement").length,
        payee: uniques.filter((c) => c.statut === "payee").length,
        expediee: uniques.filter((c) => c.statut === "expediee").length,
        livree: uniques.filter((c) => c.statut === "terminee").length,
        annulee: uniques.filter((c) => c.statut === "annulee").length,
      });
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les commandes", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCommandes = () => {
    let filtered = [...commandes];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((cmd) =>
        cmd.commande_uuid.toLowerCase().includes(term) ||
        cmd.utilisateur?.prenom?.toLowerCase().includes(term) ||
        cmd.utilisateur?.nom?.toLowerCase().includes(term) ||
        cmd.utilisateur?.email?.toLowerCase().includes(term),
      );
    }
    if (selectedStatut !== "toutes") filtered = filtered.filter((cmd) => cmd.statut === selectedStatut);
    if (startDate) filtered = filtered.filter((cmd) => new Date(cmd.date_creation) >= startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((cmd) => new Date(cmd.date_creation) <= end);
    }
    filtered.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
    setFilteredCommandes(filtered);
    setCurrentPage(1);
  };

  const updateStatut = async (commande: Commande, nouveauStatut: StatutCommande) => {
    try {
      setActionInProgress(commande.id);
      const response = await api.patch(`/admin/commandes/${commande.commande_uuid}/statut`, { statut: nouveauStatut });
      if (response.data.success) {
        toast({ title: "Statut mis à jour", description: `→ ${getStatut(nouveauStatut).label}` });
        await fetchCommandes();
        if (showDetails && selectedCommande?.id === commande.id)
          setSelectedCommande({ ...commande, statut: nouveauStatut });
      } else throw new Error(response.data.message);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.response?.data?.message || "Impossible de mettre à jour le statut", variant: "destructive" });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (commande: Commande) => {
    try {
      setActionInProgress(commande.id);
      const response = await api.delete(`/admin/commandes/${commande.commande_uuid}`);
      if (response.data.success) {
        toast({ title: "Commande supprimée" });
        await fetchCommandes();
        setShowDeleteAlert(false);
        setShowDetails(false);
        setSelectedCommande(null);
      } else throw new Error(response.data.message);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.response?.data?.message || "Impossible de supprimer", variant: "destructive" });
    } finally {
      setActionInProgress(null);
    }
  };

  const openDelete = (commande: Commande) => {
    setSelectedCommande(commande);
    setShowDeleteAlert(true);
  };

  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);
  const currentItems = filteredCommandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statCards = [
    { label: "Total",          value: statistiques.total,          icon: Package,    color: "bg-secondary/60 text-foreground" },
    { label: "En attente",     value: statistiques.enAttente,      icon: Clock,      color: "bg-amber-500/10 text-amber-600" },
    { label: "Payée",          value: statistiques.payee,          icon: CreditCard, color: "bg-blue-500/10 text-blue-600" },
    { label: "Expédiée",       value: statistiques.expediee,       icon: Truck,      color: "bg-indigo-500/10 text-indigo-600" },
    { label: "En préparation", value: statistiques.enPreparation,  icon: RefreshCw,  color: "bg-purple-500/10 text-purple-600" },
    { label: "Livrée",         value: statistiques.livree,         icon: Gift,       color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Annulée",        value: statistiques.annulee,        icon: XCircle,    color: "bg-red-500/10 text-red-600" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Box className="h-3.5 w-3.5" />
            <span>Ventes</span>
            <ChevronDown className="h-3 w-3 -rotate-90" />
            <span className="text-foreground font-medium">Commandes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des commandes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Suivez et gérez les commandes clients</p>
        </div>
        <button
          onClick={fetchCommandes}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 w-full sm:w-auto justify-center"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setSelectedStatut(
              stat.label === "Total" ? "toutes"
              : statutsDisponibles.find((s) => s.label === stat.label)?.value ?? "toutes"
            )}
            className={`bg-card border rounded-2xl p-3.5 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
              (stat.label === "Total" && selectedStatut === "toutes") ||
              statutsDisponibles.find((s) => s.label === stat.label)?.value === selectedStatut
                ? "border-primary/40 ring-1 ring-primary/20"
                : "border-border/50"
            }`}
          >
            <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-card border border-border/50 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="N° commande, client, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border/60 rounded-xl bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className={`${INPUT} pl-9 appearance-none`}
            >
              <option value="toutes">Tous les statuts</option>
              {statutsDisponibles.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 z-10 pointer-events-none" />
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              placeholderText="Date de début"
              locale={fr}
              dateFormat="dd/MM/yyyy"
              className={`${INPUT} pl-9`}
              isClearable
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 z-10 pointer-events-none" />
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              placeholderText="Date de fin"
              locale={fr}
              dateFormat="dd/MM/yyyy"
              className={`${INPUT} pl-9`}
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Barre vue + pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 border border-border/60 rounded-xl p-1 bg-card w-fit">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" /> Liste
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              viewMode === "card" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Cartes
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredCommandes.length}</span> commande{filteredCommandes.length !== 1 ? "s" : ""}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-secondary/50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground px-1">
                <span className="font-semibold text-foreground">{currentPage}</span> / {totalPages}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border/60 hover:bg-secondary/50 disabled:opacity-40 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vide */}
      {filteredCommandes.length === 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-14 text-center">
          <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-medium text-foreground">Aucune commande trouvée</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchTerm || selectedStatut !== "toutes" || startDate || endDate
              ? "Modifiez vos filtres pour voir plus de résultats"
              : "Aucune commande pour le moment"}
          </p>
        </div>
      )}

      {/* ── Mode Liste ── */}
      {filteredCommandes.length > 0 && viewMode === "list" && (
        <div className="space-y-3">
          {currentItems.map((commande) => (
            <div
              key={commande.id}
              className="bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/20 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-semibold text-sm text-foreground">
                      {commande.commande_uuid}
                    </span>
                    <StatutPill statut={commande.statut} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {commande.utilisateur?.prenom} {commande.utilisateur?.nom}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(commande.date_creation)}
                    </span>
                    <span>{commande.quantite} article{commande.quantite > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(commande.total, commande.devise)}
                  </p>
                  <button
                    onClick={() => { setSelectedCommande(commande); setShowDetails(true); }}
                    className="p-2 rounded-xl border border-border/60 hover:bg-secondary/50 hover:border-primary/30 transition-all"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ActionButtons
                commande={commande}
                actionInProgress={actionInProgress}
                updateStatut={updateStatut}
                onDelete={openDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Mode Cartes ── */}
      {filteredCommandes.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((commande) => (
            <div
              key={commande.id}
              className="bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/20 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono font-semibold text-sm text-foreground truncate pr-2">
                  {commande.commande_uuid}
                </span>
                <StatutPill statut={commande.statut} />
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{commande.utilisateur?.prenom} {commande.utilisateur?.nom}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDateShort(commande.date_creation)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <p className="font-bold text-foreground">{formatPrice(commande.total, commande.devise)}</p>
                <button
                  onClick={() => { setSelectedCommande(commande); setShowDetails(true); }}
                  className="p-1.5 rounded-lg border border-border/60 hover:bg-secondary/50 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
              <ActionButtons
                commande={commande}
                actionInProgress={actionInProgress}
                updateStatut={updateStatut}
                onDelete={openDelete}
                compact
              />
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS — via createPortal
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* Modal: Détails commande */}
      {showDetails && selectedCommande && (
        <ModalPortal onClose={() => setShowDetails(false)}>
          <div className={`${MODAL_PANEL} max-w-2xl max-h-[88vh]`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 rounded-t-2xl bg-gradient-to-r from-primary/5 to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Détails de la commande</h2>
                  <p className="text-xs font-mono text-muted-foreground">{selectedCommande.commande_uuid}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
              {/* Résumé */}
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="space-y-2">
                  <StatutPill statut={selectedCommande.statut} />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(selectedCommande.date_creation)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {selectedCommande.utilisateur?.prenom} {selectedCommande.utilisateur?.nom}
                    <span className="text-muted-foreground/60">· {selectedCommande.utilisateur?.email}</span>
                  </p>
                  {selectedCommande.devis_id && (
                    <p className="text-xs text-muted-foreground">Devis N°{selectedCommande.devis_id}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {formatPrice(selectedCommande.total, selectedCommande.devise)}
                  </p>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Articles commandés
                </h3>
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/20">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produit</th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qté</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">P.U.</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const produits = getProduitsFromCommande(selectedCommande);
                        if (!produits.length)
                          return (
                            <tr><td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">Aucun produit trouvé</td></tr>
                          );
                        return produits.map((p, i) => (
                          <tr key={i} className="border-t border-border/30 hover:bg-secondary/10 transition-colors last:border-0">
                            <td className="py-2.5 px-4 font-medium text-foreground">{p.nom}</td>
                            <td className="py-2.5 px-3 text-center text-muted-foreground">{p.quantite}</td>
                            <td className="py-2.5 px-3 text-right text-muted-foreground text-xs">{formatPrice(p.prix_unitaire, selectedCommande.devise)}</td>
                            <td className="py-2.5 px-4 text-right font-semibold text-foreground">{formatPrice(p.quantite * p.prix_unitaire, selectedCommande.devise)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span className="text-foreground">{formatPrice(selectedCommande.sous_total, selectedCommande.devise)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className={selectedCommande.livraison > 0 ? "text-foreground" : "text-emerald-600 font-medium"}>
                      {selectedCommande.livraison > 0 ? formatPrice(selectedCommande.livraison, selectedCommande.devise) : "Gratuite"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50 font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(selectedCommande.total, selectedCommande.devise)}</span>
                  </div>
                </div>
              </div>

              {/* Note meta */}
              {selectedCommande.meta_json && (() => {
                try {
                  const meta = typeof selectedCommande.meta_json === "string"
                    ? JSON.parse(selectedCommande.meta_json) : selectedCommande.meta_json;
                  if (meta.note) return (
                    <div className="bg-secondary/30 border border-border/40 rounded-xl p-3.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Note</p>
                      <p className="text-sm text-foreground">{meta.note}</p>
                    </div>
                  );
                } catch {}
                return null;
              })()}

              {/* Actions statut */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Actions</p>
                <ActionButtons
                  commande={selectedCommande}
                  actionInProgress={actionInProgress}
                  updateStatut={updateStatut}
                  onDelete={(c) => { setShowDetails(false); openDelete(c); }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2.5 px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl shrink-0">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-sm font-medium border border-border/60 rounded-xl hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Supprimer */}
      {showDeleteAlert && selectedCommande && (
        <ModalPortal onClose={() => setShowDeleteAlert(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Supprimer la commande</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Confirmer la suppression de{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {selectedCommande.commande_uuid}
                    </span>{" "}?
                    Cette action est irréversible.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl">
              <button
                onClick={() => setShowDeleteAlert(false)}
                className="px-4 py-2 text-sm border border-border/60 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(selectedCommande)}
                disabled={actionInProgress === selectedCommande.id}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {actionInProgress === selectedCommande.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.3); }
      `}</style>
    </div>
  );
};

export default AdminCommandes;