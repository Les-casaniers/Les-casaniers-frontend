import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Eye,
  ImagePlus,
  Mail,
  Pencil,
  PlusCircle,
  Save,
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Star,
  Clock,
  Calendar,
  FileText,
  Tag,
  Layers,
} from "lucide-react";
import {
  GUIDE_BADGES,
  GUIDE_CATEGORIES,
  GUIDE_DIFFICULTIES,
  GUIDE_STATUSES,
  Guide,
  GuideCategory,
  GuideDifficulty,
  GuideFilters,
  GuideStatus,
  guideCategoryLabels,
  guideDifficultyLabels,
  guideStatusLabels,
  useCreateGuide,
  useDeleteGuide,
  useGuides,
  useNewsletterSubscribers,
  useUpdateGuide,
} from "@/hooks/useGuides";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────
type GuideForm = {
  titre: string;
  slug: string;
  resume: string;
  contenu: string;
  categorie: GuideCategory;
  statut: GuideStatus;
  badge: string;
  budget_min: string;
  budget_max: string;
  composants_recommandes: string;
  niveau: string;
  difficulte: GuideDifficulty | "";
  duree: string;
  etapes: string;
  video_url: string;
  tags: string;
  ordre: string;
  mis_en_avant: boolean;
  image_alt: string;
  auteur: string;
  temps_lecture: string;
  popularite: string;
  publie_le: string;
};

const initialForm: GuideForm = {
  titre: "",
  slug: "",
  resume: "",
  contenu: "",
  categorie: "guides-achat",
  statut: "brouillon",
  badge: "",
  budget_min: "",
  budget_max: "",
  composants_recommandes: "",
  niveau: "",
  difficulte: "",
  duree: "",
  etapes: "",
  video_url: "",
  tags: "",
  ordre: "0",
  mis_en_avant: false,
  image_alt: "",
  auteur: "Les Casaniers",
  temps_lecture: "",
  popularite: "0",
  publie_le: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getErrorMessage = (error: any, fallback: string) => {
  const payload = error?.response?.data;
  if (payload?.errors) {
    const firstKey = Object.keys(payload.errors)[0];
    const firstError = payload.errors[firstKey];
    return Array.isArray(firstError) ? firstError[0] : String(firstError);
  }
  return payload?.message || fallback;
};

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : "");
const linesToArray = (value: string) => value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const csvToArray = (value: string) => value.split(",").map((i) => i.trim()).filter(Boolean);
const arrayToLines = (value?: string[] | null) => value?.join("\n") ?? "";
const arrayToCsv = (value?: string[] | null) => value?.join(", ") ?? "";

// ─── Styles partagés ────────────────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-2.5 text-sm border border-border/60 rounded-xl bg-background/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 outline-none";

const LABEL = "flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider";

const MODAL_PANEL =
  "bg-card border border-border/60 rounded-2xl w-full shadow-2xl shadow-black/30 flex flex-col";

// ─── Statut badge colors ─────────────────────────────────────────────────────
const statusColors: Record<GuideStatus, string> = {
  publie:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  brouillon: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archive:   "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

// ─── ModalPortal ─────────────────────────────────────────────────────────────
const ModalPortal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
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

// ─── ModalHeader ─────────────────────────────────────────────────────────────
const ModalHeader = ({
  icon: Icon,
  title,
  onClose,
  accent = false,
}: {
  icon: any;
  title: string;
  onClose: () => void;
  accent?: boolean;
}) => (
  <div className={`flex items-center justify-between px-6 py-4 border-b border-border/50 rounded-t-2xl shrink-0 ${accent ? "bg-gradient-to-r from-primary/5 to-transparent" : ""}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
    <button
      onClick={onClose}
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

// ─── ModalFooter ─────────────────────────────────────────────────────────────
const ModalFooter = ({
  onCancel,
  onConfirm,
  confirmLabel = "Enregistrer",
  confirmIcon: ConfirmIcon = Save,
  danger = false,
  disabled = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmIcon?: any;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl shrink-0">
    <button
      onClick={onCancel}
      className="px-4 py-2 text-sm border border-border/60 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-200"
    >
      Annuler
    </button>
    <button
      onClick={onConfirm}
      disabled={disabled}
      className={`px-5 py-2 text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-sm disabled:opacity-50 ${
        danger
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
      }`}
    >
      <ConfirmIcon className="h-3.5 w-3.5" />
      {confirmLabel}
    </button>
  </div>
);

// ─── FormSection ─────────────────────────────────────────────────────────────
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
      <span className="h-px flex-1 bg-border/50" />
      {title}
      <span className="h-px flex-1 bg-border/50" />
    </h3>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const AdminGuides = () => {
  const { isAdmin, user, loading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuideStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<GuideCategory | "">("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [form, setForm] = useState<GuideForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAdmin || !user)) logout("/login?redirect_admin=true");
  }, [authLoading, isAdmin, logout, user]);

  const filters = useMemo<GuideFilters>(
    () => ({ search: searchTerm || undefined, statut: statusFilter, categorie: categoryFilter, page, per_page: 10 }),
    [categoryFilter, page, searchTerm, statusFilter],
  );

  const { data, isLoading, refetch } = useGuides(filters, true);
  const { data: subscribers } = useNewsletterSubscribers({ per_page: 5 });
  const createGuide = useCreateGuide();
  const updateGuide = useUpdateGuide();
  const deleteGuide = useDeleteGuide();
  const guides = data?.data ?? [];

  const setField = <K extends keyof GuideForm>(key: K, value: GuideForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setSelectedGuide(null);
    setForm(initialForm);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (guide: Guide) => {
    setSelectedGuide(guide);
    setForm({
      titre: guide.titre,
      slug: guide.slug ?? "",
      resume: guide.resume,
      contenu: guide.contenu,
      categorie: guide.categorie,
      statut: guide.statut,
      badge: guide.badge ?? "",
      budget_min: guide.budget_min ? String(guide.budget_min) : "",
      budget_max: guide.budget_max ? String(guide.budget_max) : "",
      composants_recommandes: arrayToLines(guide.composants_recommandes),
      niveau: guide.niveau ?? "",
      difficulte: guide.difficulte ?? "",
      duree: guide.duree ?? "",
      etapes: arrayToLines(guide.etapes),
      video_url: guide.video_url ?? "",
      tags: arrayToCsv(guide.tags),
      ordre: String(guide.ordre ?? 0),
      mis_en_avant: Boolean(guide.mis_en_avant),
      image_alt: guide.image_alt ?? "",
      auteur: guide.auteur ?? "",
      temps_lecture: guide.temps_lecture ?? "",
      popularite: String(guide.popularite ?? 0),
      publie_le: toDateInput(guide.publie_le),
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    const payload: Record<string, string | boolean> = {
      ...form,
      composants_recommandes: JSON.stringify(linesToArray(form.composants_recommandes)),
      etapes: JSON.stringify(linesToArray(form.etapes)),
      tags: JSON.stringify(csvToArray(form.tags)),
      mis_en_avant: form.mis_en_avant ? "1" : "0",
    };
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== "") fd.append(key, String(value));
    });
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const validateForm = () => {
    if (!form.titre.trim()) return "Le titre est obligatoire.";
    if (!form.resume.trim()) return "Le résumé est obligatoire.";
    if (!form.contenu.trim()) return "Le contenu est obligatoire.";
    if (form.budget_min && form.budget_max && Number(form.budget_min) > Number(form.budget_max))
      return "Le budget minimum doit être inférieur au budget maximum.";
    return null;
  };

  const saveGuide = async () => {
    const err = validateForm();
    if (err) { toast({ title: "Validation", description: err, variant: "destructive" }); return; }
    try {
      if (selectedGuide) {
        await updateGuide.mutateAsync({ id: selectedGuide.id, payload: buildFormData() });
        toast({ title: "Guide mis à jour" });
      } else {
        await createGuide.mutateAsync(buildFormData());
        toast({ title: "Guide créé" });
      }
      setModalOpen(false);
      setSelectedGuide(null);
      setImageFile(null);
      await refetch();
    } catch (error: any) {
      toast({ title: "Erreur", description: getErrorMessage(error, "Impossible d'enregistrer le guide."), variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedGuide) return;
    try {
      await deleteGuide.mutateAsync(selectedGuide.id);
      setDeleteOpen(false);
      setSelectedGuide(null);
      await refetch();
      toast({ title: "Guide supprimé" });
    } catch (error: any) {
      toast({ title: "Erreur", description: getErrorMessage(error, "Impossible de supprimer le guide."), variant: "destructive" });
    }
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) =>
    setImageFile(event.target.files?.[0] ?? null);

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Contenu</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Guides</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des guides</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Guides d'achat, actualités tech, tutoriels et newsletter.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" /> Ajouter un guide
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* ── Liste principale ── */}
        <div className="space-y-4">

          {/* Filtres */}
          <div className="grid gap-3 sm:grid-cols-[1fr_200px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Rechercher titre, résumé, contenu..."
                className="w-full pl-9 pr-3 py-2.5 border border-border/60 rounded-xl text-sm bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value as GuideCategory | ""); setPage(1); }}
              className={INPUT}
            >
              <option value="">Toutes les catégories</option>
              {GUIDE_CATEGORIES.map((c) => <option key={c} value={c}>{guideCategoryLabels[c]}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as GuideStatus | ""); setPage(1); }}
              className={INPUT}
            >
              <option value="">Tous les statuts</option>
              {GUIDE_STATUSES.map((s) => <option key={s} value={s}>{guideStatusLabels[s]}</option>)}
            </select>
          </div>

          {/* Tableau */}
          <div className="border border-border/50 rounded-2xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    {["Image","Titre / Résumé","Catégorie","Statut","Vedette","Vues","Publication","Actions"].map((h) => (
                      <th key={h} className={`p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-muted-foreground text-sm">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        Chargement...
                      </td>
                    </tr>
                  )}
                  {!isLoading && guides.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-muted-foreground text-sm">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-15" />
                        <p className="font-medium">Aucun guide trouvé</p>
                        <p className="text-xs mt-1 opacity-60">Modifiez vos filtres ou créez un guide</p>
                      </td>
                    </tr>
                  )}
                  {guides.map((guide) => (
                    <tr key={guide.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors last:border-0">
                      <td className="p-4">
                        {guide.image_url ? (
                          <img
                            src={guide.image_url}
                            alt={guide.image_alt || guide.titre}
                            className="h-12 w-16 object-cover rounded-lg border border-border/40"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-border/40 bg-secondary/20">
                            <BookOpen className="h-4 w-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 max-w-[220px]">
                        <div className="font-medium text-foreground truncate">{guide.titre}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{guide.resume}</div>
                        {guide.slug && (
                          <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">/{guide.slug}</div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                        {guideCategoryLabels[guide.categorie]}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[guide.statut]}`}>
                          {guideStatusLabels[guide.statut]}
                        </span>
                      </td>
                      <td className="p-4">
                        {guide.mis_en_avant
                          ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          : <span className="text-xs text-muted-foreground/40">—</span>
                        }
                      </td>
                      <td className="p-4 text-sm font-medium">{guide.vues ?? 0}</td>
                      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                        {guide.publie_le ? guide.publie_le.slice(0, 10) : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setSelectedGuide(guide); setPreviewOpen(true); }}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/50 transition-colors"
                            title="Aperçu"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(guide)}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => { setSelectedGuide(guide); setDeleteOpen(true); }}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-destructive/10 transition-colors text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <div className="flex items-center justify-end gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                className="p-2 rounded-xl border border-border/60 hover:bg-secondary/50 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground px-2">
                Page <span className="font-semibold text-foreground">{data.current_page}</span> / {data.last_page}
              </span>
              <button
                disabled={page >= data.last_page}
                onClick={() => setPage((v) => v + 1)}
                className="p-2 rounded-xl border border-border/60 hover:bg-secondary/50 transition-colors disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Sidebar Newsletter ── */}
        <aside className="border border-border/50 rounded-2xl bg-card p-5 h-fit">
          <h2 className="mb-4 flex items-center gap-2.5 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Mail className="h-3.5 w-3.5" />
            </div>
            Newsletter
          </h2>
          <div className="mb-4 p-3 rounded-xl bg-secondary/30 border border-border/40 text-center">
            <div className="text-2xl font-bold text-foreground">{subscribers?.total ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">abonné(s)</div>
          </div>
          <div className="space-y-2">
            {subscribers?.data.map((sub) => (
              <div key={sub.id} className="border border-border/40 rounded-xl p-3 hover:bg-secondary/20 transition-colors">
                <div className="font-medium text-sm text-foreground truncate">{sub.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${sub.actif ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span className="text-xs text-muted-foreground">{sub.actif ? "Actif" : "Inactif"} · {sub.source}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS — tous via createPortal
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* Modal: Créer / Modifier guide */}
      {modalOpen && (
        <ModalPortal onClose={() => setModalOpen(false)}>
          <div className={`${MODAL_PANEL} max-w-5xl max-h-[90vh]`}>
            <ModalHeader
              icon={selectedGuide ? Pencil : PlusCircle}
              title={selectedGuide ? "Modifier le guide" : "Ajouter un guide"}
              onClose={() => setModalOpen(false)}
              accent
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">

              {/* Informations principales */}
              <FormSection title="Informations principales">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`${LABEL} md:col-span-2`}>
                    Titre *
                    <input className={INPUT} placeholder="Titre du guide..." value={form.titre} onChange={(e) => setField("titre", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Slug SEO
                    <input className={INPUT} placeholder="auto-genere-si-vide" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Auteur
                    <input className={INPUT} value={form.auteur} onChange={(e) => setField("auteur", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Catégorie
                    <select className={INPUT} value={form.categorie} onChange={(e) => setField("categorie", e.target.value as GuideCategory)}>
                      {GUIDE_CATEGORIES.map((c) => <option key={c} value={c}>{guideCategoryLabels[c]}</option>)}
                    </select>
                  </div>
                  <div className={LABEL}>
                    Statut
                    <select className={INPUT} value={form.statut} onChange={(e) => setField("statut", e.target.value as GuideStatus)}>
                      {GUIDE_STATUSES.map((s) => <option key={s} value={s}>{guideStatusLabels[s]}</option>)}
                    </select>
                  </div>
                  <div className={LABEL}>
                    Badge
                    <select className={INPUT} value={form.badge} onChange={(e) => setField("badge", e.target.value)}>
                      <option value="">Aucun</option>
                      {GUIDE_BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className={LABEL}>
                    Date de publication
                    <input className={INPUT} type="date" value={form.publie_le} onChange={(e) => setField("publie_le", e.target.value)} />
                  </div>
                </div>
              </FormSection>

              {/* Contenu */}
              <FormSection title="Contenu">
                <div className="space-y-4">
                  <div className={LABEL}>
                    Résumé *
                    <textarea className={INPUT} rows={3} placeholder="Résumé visible dans les listes..." value={form.resume} onChange={(e) => setField("resume", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Contenu complet *
                    <textarea className={INPUT} rows={9} placeholder="Contenu Markdown ou texte brut..." value={form.contenu} onChange={(e) => setField("contenu", e.target.value)} />
                  </div>
                </div>
              </FormSection>

              {/* Détails techniques */}
              <FormSection title="Détails techniques">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={LABEL}>
                    Budget minimum (MGA)
                    <input className={INPUT} type="number" min="0" placeholder="0" value={form.budget_min} onChange={(e) => setField("budget_min", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Budget maximum (MGA)
                    <input className={INPUT} type="number" min="0" placeholder="0" value={form.budget_max} onChange={(e) => setField("budget_max", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Difficulté
                    <select className={INPUT} value={form.difficulte} onChange={(e) => setField("difficulte", e.target.value as GuideDifficulty | "")}>
                      <option value="">Non applicable</option>
                      {GUIDE_DIFFICULTIES.map((d) => <option key={d} value={d}>{guideDifficultyLabels[d]}</option>)}
                    </select>
                  </div>
                  <div className={LABEL}>
                    Niveau d'utilisation
                    <input className={INPUT} placeholder="Gaming, bureautique, pro..." value={form.niveau} onChange={(e) => setField("niveau", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Durée
                    <input className={INPUT} placeholder="45 min" value={form.duree} onChange={(e) => setField("duree", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Temps de lecture
                    <input className={INPUT} placeholder="6 min" value={form.temps_lecture} onChange={(e) => setField("temps_lecture", e.target.value)} />
                  </div>
                  <div className={`${LABEL} md:col-span-2`}>
                    Composants recommandés (un par ligne)
                    <textarea className={INPUT} rows={4} placeholder="RTX 4070&#10;Intel Core i7..." value={form.composants_recommandes} onChange={(e) => setField("composants_recommandes", e.target.value)} />
                  </div>
                  <div className={`${LABEL} md:col-span-2`}>
                    Étapes tutoriel (une par ligne)
                    <textarea className={INPUT} rows={4} placeholder="Étape 1 : ...&#10;Étape 2 : ..." value={form.etapes} onChange={(e) => setField("etapes", e.target.value)} />
                  </div>
                  <div className={`${LABEL} md:col-span-2`}>
                    URL vidéo YouTube
                    <input className={INPUT} placeholder="https://youtube.com/..." value={form.video_url} onChange={(e) => setField("video_url", e.target.value)} />
                  </div>
                </div>
              </FormSection>

              {/* SEO & médias */}
              <FormSection title="SEO & Médias">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={LABEL}>
                    Tags (séparés par virgule)
                    <input className={INPUT} placeholder="gaming, config, guide..." value={form.tags} onChange={(e) => setField("tags", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Texte alternatif image
                    <input className={INPUT} value={form.image_alt} onChange={(e) => setField("image_alt", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Ordre d'affichage
                    <input className={INPUT} type="number" min="0" value={form.ordre} onChange={(e) => setField("ordre", e.target.value)} />
                  </div>
                  <div className={LABEL}>
                    Popularité
                    <input className={INPUT} type="number" min="0" value={form.popularite} onChange={(e) => setField("popularite", e.target.value)} />
                  </div>

                  {/* Upload image */}
                  <div className={`${LABEL} md:col-span-2`}>
                    Image
                    <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-border/60 rounded-xl cursor-pointer bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40 transition-all duration-200 group">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                        <ImagePlus className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {imageFile ? imageFile.name : "Choisir une image (JPG, PNG, WEBP)"}
                      </span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageChange} />
                    </label>
                  </div>

                  {/* Mise en avant */}
                  <label className="flex items-center gap-3 cursor-pointer group col-span-full">
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${form.mis_en_avant ? "bg-primary" : "bg-border"}`}
                      onClick={() => setField("mis_en_avant", !form.mis_en_avant)}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.mis_en_avant ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Mettre en avant</div>
                      <div className="text-xs text-muted-foreground">Ce guide apparaîtra en vedette sur la page Guides</div>
                    </div>
                  </label>
                </div>
              </FormSection>
            </div>

            <ModalFooter
              onCancel={() => setModalOpen(false)}
              onConfirm={saveGuide}
              confirmLabel={selectedGuide ? "Enregistrer" : "Créer le guide"}
              disabled={createGuide.isPending || updateGuide.isPending}
            />
          </div>
        </ModalPortal>
      )}

      {/* Modal: Aperçu */}
      {previewOpen && selectedGuide && (
        <ModalPortal onClose={() => setPreviewOpen(false)}>
          <div className={`${MODAL_PANEL} max-w-3xl max-h-[90vh]`}>
            <ModalHeader icon={Eye} title="Aperçu avant publication" onClose={() => setPreviewOpen(false)} />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectedGuide.image_url && (
                <img
                  src={selectedGuide.image_url}
                  alt={selectedGuide.image_alt || selectedGuide.titre}
                  className="w-full aspect-[16/7] object-cover"
                />
              )}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[selectedGuide.statut]}`}>
                    {guideStatusLabels[selectedGuide.statut]}
                  </span>
                  <span className="text-xs text-muted-foreground">{guideCategoryLabels[selectedGuide.categorie]}</span>
                  {selectedGuide.mis_en_avant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <Star className="h-3 w-3 fill-current" /> Vedette
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-foreground">{selectedGuide.titre}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  {selectedGuide.auteur && <span>Par {selectedGuide.auteur}</span>}
                  {selectedGuide.temps_lecture && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedGuide.temps_lecture}</span>
                  )}
                  {selectedGuide.publie_le && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedGuide.publie_le.slice(0, 10)}</span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">{selectedGuide.resume}</p>
                {selectedGuide.budget_range && (
                  <p className="font-bold text-primary">{selectedGuide.budget_range}</p>
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert border-t border-border/50 pt-4">
                  {selectedGuide.contenu.split(/\n{2,}/).map((paragraph, i) => (
                    <p key={i} className="text-sm text-foreground/80 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Supprimer */}
      {deleteOpen && (
        <ModalPortal onClose={() => setDeleteOpen(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Supprimer le guide</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Confirmer la suppression de{" "}
                    <span className="font-semibold text-foreground">« {selectedGuide?.titre} »</span>{" "}?
                    Cette action est irréversible.
                  </p>
                </div>
              </div>
            </div>
            <ModalFooter
              onCancel={() => setDeleteOpen(false)}
              onConfirm={confirmDelete}
              confirmLabel="Supprimer définitivement"
              confirmIcon={Trash2}
              danger
              disabled={deleteGuide.isPending}
            />
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

export default AdminGuides;