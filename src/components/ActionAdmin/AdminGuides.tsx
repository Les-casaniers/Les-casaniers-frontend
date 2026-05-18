import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

const inputClass = "w-full border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary";
const labelClass = "space-y-1 text-xs font-medium text-muted-foreground";

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
const linesToArray = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const csvToArray = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const arrayToLines = (value?: string[] | null) => value?.join("\n") ?? "";
const arrayToCsv = (value?: string[] | null) => value?.join(", ") ?? "";

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
    if (!authLoading && (!isAdmin || !user)) {
      logout("/login?redirect_admin=true");
    }
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

  const setField = <K extends keyof GuideForm>(key: K, value: GuideForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

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
    if (!form.resume.trim()) return "Le resume est obligatoire.";
    if (!form.contenu.trim()) return "Le contenu est obligatoire.";
    if (form.budget_min && form.budget_max && Number(form.budget_min) > Number(form.budget_max)) {
      return "Le budget minimum doit etre inferieur au budget maximum.";
    }
    return null;
  };

  const saveGuide = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({ title: "Validation", description: validationError, variant: "destructive" });
      return;
    }

    try {
      if (selectedGuide) {
        await updateGuide.mutateAsync({ id: selectedGuide.id, payload: buildFormData() });
        toast({ title: "Guide mis a jour" });
      } else {
        await createGuide.mutateAsync(buildFormData());
        toast({ title: "Guide cree" });
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
      toast({ title: "Guide supprime" });
    } catch (error: any) {
      toast({ title: "Erreur", description: getErrorMessage(error, "Impossible de supprimer le guide."), variant: "destructive" });
    }
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] ?? null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><BookOpen className="h-6 w-6" /> Gestion des guides</h1>
          <p className="text-sm text-muted-foreground">Guides d'achat, actualites tech, tutos maintenance et newsletter.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <PlusCircle className="h-4 w-4" /> Ajouter un guide
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }}
                placeholder="Rechercher titre, resume, contenu..."
                className="w-full border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value as GuideCategory | ""); setPage(1); }} className={inputClass}>
              <option value="">Toutes les categories</option>
              {GUIDE_CATEGORIES.map((category) => <option key={category} value={category}>{guideCategoryLabels[category]}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as GuideStatus | ""); setPage(1); }} className={inputClass}>
              <option value="">Tous les statuts</option>
              {GUIDE_STATUSES.map((status) => <option key={status} value={status}>{guideStatusLabels[status]}</option>)}
            </select>
          </div>

          <div className="overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-secondary/50">
                  <tr className="border-b border-border">
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Titre</th>
                    <th className="p-3 text-left">Categorie</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Vedette</th>
                    <th className="p-3 text-left">Vues</th>
                    <th className="p-3 text-left">Publication</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Chargement...</td></tr>}
                  {!isLoading && guides.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Aucun guide trouve.</td></tr>}
                  {guides.map((guide) => (
                    <tr key={guide.id} className="border-b border-border">
                      <td className="p-3">
                        {guide.image_url ? (
                          <img src={guide.image_url} alt={guide.image_alt || guide.titre} className="h-12 w-16 object-cover" />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center border border-border text-[10px] text-muted-foreground">Aucune</div>
                        )}
                      </td>
                      <td className="max-w-sm p-3">
                        <div className="font-medium">{guide.titre}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{guide.resume}</div>
                        {guide.slug && <div className="text-xs text-muted-foreground">/{guide.slug}</div>}
                      </td>
                      <td className="p-3">{guideCategoryLabels[guide.categorie]}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs ${guide.statut === "publie" ? "bg-green-100 text-green-700" : guide.statut === "archive" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"}`}>
                          {guideStatusLabels[guide.statut]}
                        </span>
                      </td>
                      <td className="p-3">{guide.mis_en_avant ? "Oui" : "Non"}</td>
                      <td className="p-3">{guide.vues}</td>
                      <td className="p-3">{guide.publie_le ? guide.publie_le.slice(0, 10) : "-"}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedGuide(guide); setPreviewOpen(true); }} className="border border-border p-2 hover:bg-secondary" title="Apercu"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => openEdit(guide)} className="border border-border p-2 hover:bg-secondary" title="Modifier"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => { setSelectedGuide(guide); setDeleteOpen(true); }} className="border border-border p-2 text-destructive hover:bg-secondary" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.last_page > 1 && (
            <div className="flex items-center justify-end gap-2">
              <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="border border-border px-3 py-2 text-sm disabled:opacity-50">Precedent</button>
              <span className="text-sm text-muted-foreground">Page {data.current_page} / {data.last_page}</span>
              <button disabled={page >= data.last_page} onClick={() => setPage((value) => value + 1)} className="border border-border px-3 py-2 text-sm disabled:opacity-50">Suivant</button>
            </div>
          )}
        </div>

        <aside className="border border-border p-4">
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Mail className="h-4 w-4" /> Newsletter</h2>
          <p className="mb-3 text-sm text-muted-foreground">{subscribers?.total ?? 0} abonne(s)</p>
          <div className="space-y-2">
            {subscribers?.data.map((subscriber) => (
              <div key={subscriber.id} className="border border-border p-2 text-sm">
                <div className="font-medium">{subscriber.email}</div>
                <div className="text-xs text-muted-foreground">{subscriber.actif ? "Actif" : "Inactif"} - {subscriber.source}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-border bg-background p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedGuide ? "Modifier le guide" : "Ajouter un guide"}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className={`${labelClass} md:col-span-2`}>Titre<input className={inputClass} value={form.titre} onChange={(event) => setField("titre", event.target.value)} /></label>
              <label className={labelClass}>Slug SEO<input className={inputClass} placeholder="Auto si vide" value={form.slug} onChange={(event) => setField("slug", event.target.value)} /></label>
              <label className={labelClass}>Categorie<select className={inputClass} value={form.categorie} onChange={(event) => setField("categorie", event.target.value as GuideCategory)}>
                {GUIDE_CATEGORIES.map((category) => <option key={category} value={category}>{guideCategoryLabels[category]}</option>)}
              </select></label>
              <label className={labelClass}>Statut<select className={inputClass} value={form.statut} onChange={(event) => setField("statut", event.target.value as GuideStatus)}>
                {GUIDE_STATUSES.map((status) => <option key={status} value={status}>{guideStatusLabels[status]}</option>)}
              </select></label>
              <label className={labelClass}>Badge<select className={inputClass} value={form.badge} onChange={(event) => setField("badge", event.target.value)}>
                <option value="">Aucun</option>
                {GUIDE_BADGES.map((badge) => <option key={badge} value={badge}>{badge}</option>)}
              </select></label>
              <label className={labelClass}>Budget minimum<input className={inputClass} type="number" min="0" value={form.budget_min} onChange={(event) => setField("budget_min", event.target.value)} /></label>
              <label className={labelClass}>Budget maximum<input className={inputClass} type="number" min="0" value={form.budget_max} onChange={(event) => setField("budget_max", event.target.value)} /></label>
              <label className={labelClass}>Niveau d'utilisation<input className={inputClass} placeholder="Gaming, bureautique, pro..." value={form.niveau} onChange={(event) => setField("niveau", event.target.value)} /></label>
              <label className={labelClass}>Difficulte<select className={inputClass} value={form.difficulte} onChange={(event) => setField("difficulte", event.target.value as GuideDifficulty | "")}>
                <option value="">Non applicable</option>
                {GUIDE_DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{guideDifficultyLabels[difficulty]}</option>)}
              </select></label>
              <label className={labelClass}>Duree<input className={inputClass} placeholder="45 min" value={form.duree} onChange={(event) => setField("duree", event.target.value)} /></label>
              <label className={labelClass}>Date de publication<input className={inputClass} type="date" value={form.publie_le} onChange={(event) => setField("publie_le", event.target.value)} /></label>
              <label className={labelClass}>Auteur<input className={inputClass} value={form.auteur} onChange={(event) => setField("auteur", event.target.value)} /></label>
              <label className={labelClass}>Temps de lecture<input className={inputClass} placeholder="6 min" value={form.temps_lecture} onChange={(event) => setField("temps_lecture", event.target.value)} /></label>
              <label className={labelClass}>Ordre<input className={inputClass} type="number" min="0" value={form.ordre} onChange={(event) => setField("ordre", event.target.value)} /></label>
              <label className={labelClass}>Popularite<input className={inputClass} type="number" min="0" value={form.popularite} onChange={(event) => setField("popularite", event.target.value)} /></label>
              <label className={`${labelClass} md:col-span-2`}>Resume<textarea className={inputClass} rows={3} value={form.resume} onChange={(event) => setField("resume", event.target.value)} /></label>
              <label className={`${labelClass} md:col-span-2`}>Contenu<textarea className={inputClass} rows={9} value={form.contenu} onChange={(event) => setField("contenu", event.target.value)} /></label>
              <label className={`${labelClass} md:col-span-2`}>Composants recommandes (un par ligne)<textarea className={inputClass} rows={4} value={form.composants_recommandes} onChange={(event) => setField("composants_recommandes", event.target.value)} /></label>
              <label className={`${labelClass} md:col-span-2`}>Etapes tutoriel (une par ligne)<textarea className={inputClass} rows={4} value={form.etapes} onChange={(event) => setField("etapes", event.target.value)} /></label>
              <label className={labelClass}>URL video YouTube<input className={inputClass} value={form.video_url} onChange={(event) => setField("video_url", event.target.value)} /></label>
              <label className={labelClass}>Tags separes par virgule<input className={inputClass} value={form.tags} onChange={(event) => setField("tags", event.target.value)} /></label>
              <label className={labelClass}>Texte alternatif image<input className={inputClass} value={form.image_alt} onChange={(event) => setField("image_alt", event.target.value)} /></label>
              <label className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-sm hover:bg-secondary">
                <ImagePlus className="h-4 w-4" />
                <span className="truncate">{imageFile ? imageFile.name : "Choisir une image"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageChange} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.mis_en_avant} onChange={(event) => setField("mis_en_avant", event.target.checked)} />
                Mettre en avant sur la page Guides
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="border border-border px-4 py-2 text-sm">Annuler</button>
              <button onClick={saveGuide} disabled={createGuide.isPending || updateGuide.isPending} className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Apercu avant publication</h2>
              <button onClick={() => setPreviewOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {selectedGuide.image_url && <img src={selectedGuide.image_url} alt={selectedGuide.image_alt || selectedGuide.titre} className="mb-4 aspect-[16/7] w-full object-cover" />}
            <div className="mb-2 text-sm text-muted-foreground">{guideCategoryLabels[selectedGuide.categorie]} - {guideStatusLabels[selectedGuide.statut]}</div>
            <h3 className="text-2xl font-bold">{selectedGuide.titre}</h3>
            <p className="mt-3 text-muted-foreground">{selectedGuide.resume}</p>
            {selectedGuide.budget_range && <p className="mt-3 font-semibold text-primary">{selectedGuide.budget_range}</p>}
            <div className="prose prose-sm mt-5 max-w-none dark:prose-invert">
              {selectedGuide.contenu.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-border bg-background p-6">
            <h2 className="text-lg font-bold">Supprimer le guide</h2>
            <p className="mt-2 text-sm text-muted-foreground">Confirmer la suppression de "{selectedGuide?.titre}" ?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteOpen(false)} className="border border-border px-4 py-2 text-sm">Annuler</button>
              <button onClick={confirmDelete} disabled={deleteGuide.isPending} className="bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGuides;
