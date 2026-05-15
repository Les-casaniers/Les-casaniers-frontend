import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Package, Tag, Cpu, ListChecks, BarChart3,
  ImageIcon, Pencil, X, PlusCircle, Trash2, Check, Loader2
} from "lucide-react";
import {
  useProduct, useUpdateProduct, useCategories,
  useProductImageActions, useProductAttributesActions,
  useCreateConfiguration, useDeleteConfiguration,
  Product, CreateConfigurationPayload,
} from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/service/api";
import { useToast } from "@/hooks/use-toast";

const TYPES_PRODUIT = ["pc", "portable", "composant", "peripherique", "service"] as const;
const NOM_CONFIGURATIONS = [
  "cpu", "carte_mere", "gpu", "ram", "ssd", "hdd", "stockage",
  "alimentation", "boitier", "refroidissement", "ventilateur",
  "ecran", "clavier", "souris", "os", "reseau", "autre"
] as const;

type Tab = "general" | "category" | "config" | "specs" | "stock" | "images";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "general", label: "Général", icon: <Package className="h-4 w-4" /> },
  { key: "category", label: "Catégorie", icon: <Tag className="h-4 w-4" /> },
  { key: "config", label: "Configuration PC", icon: <Cpu className="h-4 w-4" /> },
  { key: "specs", label: "Caractéristiques", icon: <ListChecks className="h-4 w-4" /> },
  { key: "stock", label: "Stock & Prix", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "images", label: "Images", icon: <ImageIcon className="h-4 w-4" /> },
];

const inputClass = "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";
const cardClass = "bg-card border border-border rounded-2xl p-6 space-y-5";

const ConfigPc = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, user, loading: authLoading, logout } = useAuth();

  const { data: product, isLoading, refetch } = useProduct(productId);
  const { data: categories } = useCategories();
  const updateMutation = useUpdateProduct();
  const { uploadImage, deleteImage, setMainImage } = useProductImageActions();
  const { syncAttributes, getStandardKeys } = useProductAttributesActions();
  const createConfigMutation = useCreateConfiguration();
  const deleteConfigMutation = useDeleteConfiguration();

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Configuration modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cfgNom, setCfgNom] = useState<string>("");
  const [cfgNomAutre, setCfgNomAutre] = useState("");
  const [cfgDevise, setCfgDevise] = useState("MGA");
  const [cfgComposants, setCfgComposants] = useState<{ nom: string; prix: string; quantite: string }[]>([{ nom: "", prix: "", quantite: "1" }]);
  const [cfgSaving, setCfgSaving] = useState(false);

  // Editable fields
  const [nom, setNom] = useState("");
  const [reference, setReference] = useState("");
  const [descCourte, setDescCourte] = useState("");
  const [description, setDescription] = useState("");
  const [typeProduit, setTypeProduit] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [prix, setPrix] = useState("");
  const [devise, setDevise] = useState("MGA");
  const [stock, setStock] = useState("");
  const [actif, setActif] = useState(true);
  const [attrs, setAttrs] = useState<{ cle_attr: string; valeur_attr: string; libelle_attr?: string }[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!authLoading && (!isAdmin || !user)) logout("/login?redirect_admin=true");
  }, [isAdmin, user, authLoading, logout]);

  // Populate form from product data
  useEffect(() => {
    if (!product) return;
    setNom(product.nom ?? "");
    setReference(product.reference ?? "");
    setDescCourte(product.description_courte ?? "");
    setDescription(product.description ?? "");
    setTypeProduit(product.type_produit ?? "");
    setCategorieId(String(product.categorie_id ?? ""));
    setPrix(String(product.prix ?? ""));
    setDevise(product.devise ?? "MGA");
    setStock(String(product.quantite_stock ?? ""));
    setActif(product.actif ?? true);
    setAttrs(product.attributs?.map(a => ({ cle_attr: a.cle_attr, valeur_attr: a.valeur_attr, libelle_attr: a.libelle_attr })) ?? []);
  }, [product]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nom", nom);
      fd.append("reference", reference);
      fd.append("description_courte", descCourte);
      fd.append("description", description);
      fd.append("type_produit", typeProduit);
      fd.append("categorie_id", categorieId);
      fd.append("prix", prix);
      fd.append("devise", devise);
      fd.append("quantite_stock", stock);
      fd.append("actif", actif ? "1" : "0");
      await updateMutation.mutateAsync({ id: product.id, updatedProduct: fd });

      if (attrs.length > 0) {
        await syncAttributes.mutateAsync({ produitId: product.id, attributes: attrs });
      }

      if (newImageFiles.length > 0) {
        const startOrdre = (product.images?.length ?? 0);
        await Promise.all(newImageFiles.map((file, i) =>
          uploadImage.mutateAsync({ produitId: product.id, imageFile: file, alt: `${nom} - ${i + 1}`, ordre: startOrdre + i })
        ));
        setNewImageFiles([]);
      }

      await refetch();
      setEditing(false);
      toast({ title: "Produit mis à jour avec succès" });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Erreur lors de la sauvegarde";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Produit introuvable</p>
        <button onClick={() => navigate("/DashboardAdmin/produits")} className="btn-secondary px-4 py-2 rounded-xl">Retour</button>
      </div>
    );
  }

  const images = (product.images ?? []).slice().sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999));
  const configs = product.configurations ?? [];
  const normalizedCategories = categories ?? [];
  const standardKeys = getStandardKeys.data ?? [];

  const renderReadonly = (label: string, value: string | number | null | undefined) => (
    <div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="text-sm font-medium mt-0.5">{value ?? "—"}</p>
    </div>
  );

  // ─── TAB: General ────────────────────────────────────────
  const GeneralTab = () => (
    <div className={cardClass}>
      <h3 className="text-lg font-semibold">Informations générales</h3>
      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Nom</label><input className={inputClass} value={nom} onChange={e => setNom(e.target.value)} /></div>
          <div><label className={labelClass}>Référence</label><input className={inputClass} value={reference} disabled /></div>
          <div><label className={labelClass}>Type produit</label>
            <select className={inputClass} value={typeProduit} onChange={e => setTypeProduit(e.target.value)}>
              <option value="">—</option>
              {TYPES_PRODUIT.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={actif} onChange={e => setActif(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-foreground transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm">{actif ? "Actif" : "Inactif"}</span>
          </div>
          <div className="md:col-span-2"><label className={labelClass}>Description courte</label><input className={inputClass} value={descCourte} onChange={e => setDescCourte(e.target.value)} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Description</label><textarea className={inputClass + " min-h-[120px]"} value={description} onChange={e => setDescription(e.target.value)} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderReadonly("Nom", product.nom)}
          {renderReadonly("Référence", product.reference)}
          {renderReadonly("Type", product.type_produit)}
          {renderReadonly("Statut", product.actif ? "Actif" : "Inactif")}
          {renderReadonly("Créé le", product.date_creation)}
          {renderReadonly("Modifié le", product.date_modification)}
          <div className="md:col-span-2 lg:col-span-3">{renderReadonly("Description courte", product.description_courte)}</div>
          <div className="md:col-span-2 lg:col-span-3">{renderReadonly("Description", product.description)}</div>
        </div>
      )}
    </div>
  );

  // ─── TAB: Category ───────────────────────────────────────
  const CategoryTab = () => (
    <div className={cardClass}>
      <h3 className="text-lg font-semibold">Catégorie associée</h3>
      {editing ? (
        <div>
          <label className={labelClass}>Catégorie</label>
          <select className={inputClass} value={categorieId} onChange={e => setCategorieId(e.target.value)}>
            <option value="">—</option>
            {normalizedCategories.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderReadonly("Catégorie", product.categorie?.nom)}
          {renderReadonly("ID Catégorie", product.categorie_id)}
        </div>
      )}
    </div>
  );

  // ─── Config modal helpers ─────────────────────────────────
  const resetConfigModal = () => {
    setCfgNom(""); setCfgNomAutre(""); setCfgDevise("MGA");
    setCfgComposants([{ nom: "", prix: "", quantite: "1" }]);
    setShowConfigModal(false);
  };

  const handleCreateConfig = async () => {
    if (!product || !cfgNom) return;
    setCfgSaving(true);
    try {
      const payload: CreateConfigurationPayload = {
        produit_id: product.id,
        nom_configuration: cfgNom,
        nom_configuration_autre: cfgNom === "autre" ? cfgNomAutre : null,
        devise: cfgDevise || "MGA",
        composants_json: cfgComposants
          .filter(c => c.nom.trim())
          .map(c => ({ nom: c.nom, prix: Number(c.prix) || 0, quantite: Number(c.quantite) || 1 })),
      };
      await createConfigMutation.mutateAsync(payload);
      await refetch();
      resetConfigModal();
      toast({ title: "Configuration créée avec succès" });
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e?.response?.data?.message || "Erreur lors de la création";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setCfgSaving(false);
    }
  };

  const handleDeleteConfig = async (configId: number) => {
    try {
      await deleteConfigMutation.mutateAsync(configId);
      await refetch();
      toast({ title: "Configuration supprimée" });
    } catch (e: any) {
      toast({ title: "Erreur", description: "Impossible de supprimer la configuration.", variant: "destructive" });
    }
  };

  // ─── TAB: Config PC ──────────────────────────────────────
  const ConfigTab = () => (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configurations PC associées</h3>
        <button
          onClick={() => setShowConfigModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" /> Ajouter une configuration
        </button>
      </div>
      {configs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune configuration associée à ce produit.</p>
      ) : (
        <div className="space-y-4">
          {configs.map(cfg => (
            <div key={cfg.id} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm capitalize">{cfg.nom_configuration}{cfg.nom_configuration_autre ? ` — ${cfg.nom_configuration_autre}` : ""}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full">{Number(cfg.prix_total).toLocaleString()} {cfg.devise ?? "MGA"}</span>
                  <button onClick={() => handleDeleteConfig(cfg.id)} className="p-1.5 border rounded-lg hover:bg-destructive/10 transition-colors" title="Supprimer"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </div>
              </div>
              {Array.isArray(cfg.composants_json) && cfg.composants_json.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Composants :</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cfg.composants_json.map((comp, i) => (
                      <div key={i} className="flex justify-between text-xs bg-muted/50 rounded-lg px-3 py-2">
                        <span>{comp.nom ?? `Composant ${i + 1}`}</span>
                        <span className="text-muted-foreground">{comp.quantite ?? 1}x — {Number(comp.prix ?? 0).toLocaleString()} MGA</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Ajouter Configuration ── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Nouvelle configuration</h2>
              <button onClick={resetConfigModal}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Type de configuration</label>
                <select className={inputClass} value={cfgNom} onChange={e => setCfgNom(e.target.value)}>
                  <option value="">Choisir…</option>
                  {NOM_CONFIGURATIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {cfgNom === "autre" && (
                <div>
                  <label className={labelClass}>Nom personnalisé</label>
                  <input className={inputClass} placeholder="Ex: Watercooling custom" value={cfgNomAutre} onChange={e => setCfgNomAutre(e.target.value)} />
                </div>
              )}
              <div>
                <label className={labelClass}>Devise</label>
                <input className={inputClass} value={cfgDevise} onChange={e => setCfgDevise(e.target.value)} />
              </div>
            </div>

            {/* Composants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Composants</label>
                <button
                  onClick={() => setCfgComposants(prev => [...prev, { nom: "", prix: "", quantite: "1" }])}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-lg hover:bg-muted transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>
              {cfgComposants.map((comp, i) => (
                <div key={i} className="grid grid-cols-[1fr_0.6fr_0.4fr_auto] gap-2 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground">Nom</label>
                    <input className={inputClass} placeholder="Ex: Ryzen 7 7800X3D" value={comp.nom} onChange={e => setCfgComposants(prev => prev.map((c, idx) => idx === i ? { ...c, nom: e.target.value } : c))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Prix</label>
                    <input className={inputClass} type="number" placeholder="0" value={comp.prix} onChange={e => setCfgComposants(prev => prev.map((c, idx) => idx === i ? { ...c, prix: e.target.value } : c))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Qté</label>
                    <input className={inputClass} type="number" min="1" value={comp.quantite} onChange={e => setCfgComposants(prev => prev.map((c, idx) => idx === i ? { ...c, quantite: e.target.value } : c))} />
                  </div>
                  <button
                    onClick={() => setCfgComposants(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-2 border rounded-lg hover:bg-destructive/10 transition-colors mb-0.5"
                    disabled={cfgComposants.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={resetConfigModal} className="px-4 py-2 border rounded-xl hover:bg-muted transition-colors">Annuler</button>
              <button
                onClick={handleCreateConfig}
                disabled={cfgSaving || !cfgNom || cfgComposants.every(c => !c.nom.trim())}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {cfgSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── TAB: Specs ──────────────────────────────────────────
  const SpecsTab = () => {
    const addAttr = () => setAttrs(prev => [...prev, { cle_attr: "", valeur_attr: "", libelle_attr: "" }]);
    const removeAttr = (i: number) => setAttrs(prev => prev.filter((_, idx) => idx !== i));
    const updateAttr = (i: number, field: string, val: string) => {
      setAttrs(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
    };

    return (
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Caractéristiques techniques</h3>
          {editing && <button onClick={addAttr} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-lg hover:bg-muted transition-colors"><PlusCircle className="h-3.5 w-3.5" /> Ajouter</button>}
        </div>
        {attrs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune caractéristique enregistrée.</p>
        ) : editing ? (
          <div className="space-y-3">
            {attrs.map((a, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Clé</label>
                  <select className={inputClass} value={a.cle_attr} onChange={e => updateAttr(i, "cle_attr", e.target.value)}>
                    <option value="">Choisir…</option>
                    {standardKeys.map((sk: any) => <option key={sk.cle_attr} value={sk.cle_attr}>{sk.libelle_attr}</option>)}
                    {a.cle_attr && !standardKeys.find((sk: any) => sk.cle_attr === a.cle_attr) && <option value={a.cle_attr}>{a.cle_attr}</option>}
                  </select>
                </div>
                <div><label className="text-xs text-muted-foreground">Valeur</label><input className={inputClass} value={a.valeur_attr} onChange={e => updateAttr(i, "valeur_attr", e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground">Libellé</label><input className={inputClass} value={a.libelle_attr ?? ""} onChange={e => updateAttr(i, "libelle_attr", e.target.value)} /></div>
                <button onClick={() => removeAttr(i)} className="p-2 border rounded-lg hover:bg-destructive/10 transition-colors mb-0.5"><Trash2 className="h-4 w-4 text-destructive" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attrs.map((a, i) => (
              <div key={i} className="flex justify-between items-center bg-muted/50 rounded-xl px-4 py-3">
                <span className="text-sm text-muted-foreground">{a.libelle_attr || a.cle_attr}</span>
                <span className="text-sm font-medium">{a.valeur_attr}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── TAB: Stock & Prix ───────────────────────────────────
  const StockTab = () => (
    <div className={cardClass}>
      <h3 className="text-lg font-semibold">Stock & Prix</h3>
      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className={labelClass}>Prix</label><input className={inputClass} type="number" value={prix} onChange={e => setPrix(e.target.value)} /></div>
          <div><label className={labelClass}>Devise</label><input className={inputClass} value={devise} onChange={e => setDevise(e.target.value)} /></div>
          <div><label className={labelClass}>Quantité en stock</label><input className={inputClass} type="number" value={stock} onChange={e => setStock(e.target.value)} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderReadonly("Prix", `${Number(product.prix).toLocaleString()} ${product.devise ?? "MGA"}`)}
          {renderReadonly("Devise", product.devise)}
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Stock</span>
            <p className={`text-sm font-medium mt-0.5 ${product.quantite_stock <= 0 ? "text-red-500" : product.quantite_stock < 5 ? "text-yellow-500" : ""}`}>
              {product.quantite_stock} unité(s)
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ─── TAB: Images ─────────────────────────────────────────
  const ImagesTab = () => (
    <div className={cardClass}>
      <h3 className="text-lg font-semibold">Images du produit</h3>
      {images.length === 0 && !editing ? (
        <p className="text-sm text-muted-foreground">Aucune image enregistrée.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="border rounded-xl overflow-hidden group relative">
              <img src={img.url} alt={img.alt || "image"} className="h-40 w-full object-cover" />
              <div className="p-2 text-xs text-muted-foreground">Ordre: {img.ordre ?? "—"}</div>
              {editing && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={async () => { await setMainImage.mutateAsync({ produitId: product.id, imageId: img.id }); await refetch(); toast({ title: "Image principale mise à jour" }); }} className="p-1.5 bg-background/90 border rounded-lg text-xs" title="Définir principale"><Check className="h-3 w-3" /></button>
                  <button onClick={async () => { await deleteImage.mutateAsync(img.id); await refetch(); toast({ title: "Image supprimée" }); }} className="p-1.5 bg-background/90 border rounded-lg text-xs text-destructive" title="Supprimer"><Trash2 className="h-3 w-3" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-medium">Ajouter des images</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className={inputClass} onChange={e => { setNewImageFiles(prev => [...prev, ...Array.from(e.target.files ?? [])]); e.currentTarget.value = ""; }} />
          {newImageFiles.length > 0 && (
            <div className="space-y-1">
              {newImageFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                  <span className="truncate">{f.name}</span>
                  <button onClick={() => setNewImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    general: <GeneralTab />,
    category: <CategoryTab />,
    config: <ConfigTab />,
    specs: <SpecsTab />,
    stock: <StockTab />,
    images: <ImagesTab />,
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/DashboardAdmin/produits")} className="p-2 border rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{product.nom}</h1>
            <p className="text-sm text-muted-foreground">{product.reference ?? "—"} · {product.type_produit}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); /* reset from product */ }} className="px-4 py-2 border rounded-xl hover:bg-muted transition-colors">
                <X className="h-4 w-4 inline mr-1" />Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Pencil className="h-4 w-4" /> Modifier
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-t-xl transition-colors ${
              activeTab === tab.key
                ? "bg-card border border-b-0 border-border font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tabContent[activeTab]}
    </div>
  );
};

export default ConfigPc;


