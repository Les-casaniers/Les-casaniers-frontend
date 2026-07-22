import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Package,
  PlusCircle,
  X,
  Save,
  Pencil,
  Trash2,
  Search,
  Eye,
  ChevronDown,
  ChevronRight,
  Grid,
  List,
  FolderTree,
  Layers,
  Tag,
  DollarSign,
  Warehouse,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Zap,
  Box,
  Hash,
  Award,
  FileText,
  Plus,
  Loader2,
  Filter,
} from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
  useSousCategories,
  useCreateSousCategory,
  useUpdateSousCategory,
  useDeleteSousCategory,
  SousCategory,
  useProductImageActions,
  Product as APIProduct,
  ProductFilters,
} from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/service/api";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_TYPES = [
  "pro",
  "gaming",
  "composants",
  "peripheriques",
  "services",
  "guides",
] as const;

type ProduitForm = {
  categorie_id: string;
  id_sous_categorie: string;
  reference: string;
  nom: string;
  description_courte: string;
  description: string;
  atout: string;
  prix: string;
  devise: string;
  quantite_stock: string;
  actif: boolean;
};

type CategoryForm = {
  nom: string;
  type: (typeof CATEGORY_TYPES)[number] | "";
  parent_id: string;
  ordre_tri: string;
};

const initialForm: ProduitForm = {
  categorie_id: "",
  id_sous_categorie: "",
  reference: "",
  nom: "",
  description_courte: "",
  description: "",
  atout: "",
  prix: "",
  devise: "MGA",
  quantite_stock: "",
  actif: true,
};

const initialCategoryForm: CategoryForm = {
  nom: "",
  type: "",
  parent_id: "",
  ordre_tri: "0",
};

type Produit = APIProduct;

interface TemplateCaracteristique {
  id: number;
  sous_categorie_id: number;
  nom_champ: string;
  type_champ: string;
  ordre_affichage: number;
  est_obligatoire: boolean;
  valeur_par_defaut: string | null;
}

const REFERENCE_PREFIXES = [
  { key: "CASE", label: "CASE-", description: "Unité Central", exemple: "CASE-001" },
  { key: "CPU",  label: "CPU-",  description: "Processeur",     exemple: "CPU-001" },
  { key: "MB",   label: "MB-",   description: "Carte mère",     exemple: "MB-001" },
  { key: "CL",   label: "CL-",   description: "Refroidissement",exemple: "CL-001" },
  { key: "RAM",  label: "RAM-",  description: "Mémoire RAM",    exemple: "RAM-001" },
  { key: "SD",   label: "SD-",   description: "Stockage",       exemple: "SD-001" },
  { key: "GPU",  label: "GPU-",  description: "Carte graphique",exemple: "GPU-001" },
  { key: "PSU",  label: "PSU-",  description: "Alimentation",   exemple: "PSU-001" },
  { key: "PC",   label: "PC-",   description: "Portable",       exemple: "PC-001" },
  { key: "CLV",  label: "CLV-",  description: "Clavier Gaming", exemple: "CLV-001" },
  { key: "SR",   label: "SR-",   description: "Souris Gaming",  exemple: "SR-001" },
  { key: "ECR",  label: "ECR-",  description: "Ecran Gaming",   exemple: "ECR-001" },
  { key: "CHS",  label: "CHS-",  description: "Chaise Gaming",  exemple: "CHS-001" },
  { key: "EXP",  label: "EXP-",  description: "Produit Exception",exemple: "EXP-001" },
  { key: "REF",  label: "REF-",  description: "Autres",         exemple: "REF-001" },
] as const;

const getFullImageUrl = (url: string) => {
  if (!url) return "/placeholder-pc.jpg";
  if (url.startsWith("/storage") || url.startsWith("/image")) {
    const base = (import.meta.env.VITE_API_URL as string | undefined)
      ?.replace(/\/api\/?$/, "") ?? "https://api.holines.xyz";
    return `${base}${url}`;
  }
  return url;
};

// ─── Modal Portal wrapper ────────────────────────────────────────────────────
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ margin: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>,
    document.body,
  );
};

// ─── Styles partagés ────────────────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-2.5 text-sm border border-border/60 rounded-xl bg-background/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 outline-none";

const MODAL_PANEL =
  "bg-card border border-border/60 rounded-2xl w-full shadow-2xl shadow-black/30 flex flex-col";

// ─── ProductForm ─────────────────────────────────────────────────────────────
const ProductForm = ({
  value,
  setValue,
  categories,
  sousCategories,
  selectedPrefix,
  setSelectedPrefix,
  generatedReference,
  generateReference,
  isEditMode = false,
  onCaracteristiquesChange,
  templatesDisponibles = [],
  caracteristiques = {},
  setCaracteristiques,
  loadTemplates,
  onDeleteTemplate,
  onEditTemplate,
}: {
  value: ProduitForm;
  setValue: React.Dispatch<React.SetStateAction<ProduitForm>>;
  categories: any[];
  sousCategories: any[];
  selectedPrefix: string;
  setSelectedPrefix: React.Dispatch<React.SetStateAction<string>>;
  generatedReference: string;
  generateReference: (prefixKey: string) => Promise<void>;
  isEditMode?: boolean;
  onCaracteristiquesChange?: (caracts: Record<string, string>) => void;
  templatesDisponibles?: TemplateCaracteristique[];
  caracteristiques?: Record<string, string>;
  setCaracteristiques?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loadTemplates?: (sousCategorieId: string) => Promise<void>;
  onDeleteTemplate?: (templateId: number, nomChamp: string) => void;
  onEditTemplate?: (templateId: number, oldNomChamp: string, newNomChamp: string) => Promise<void>;
}) => {
  const [newCaractNom, setNewCaractNom] = useState("");
  const [newCaractValeur, setNewCaractValeur] = useState("");
  const [newCaractType, setNewCaractType] = useState<"texte" | "nombre" | "booleen" | "date">("texte");
  const [newCaractObligatoire, setNewCaractObligatoire] = useState(false);
  const [showAddCaract, setShowAddCaract] = useState(false);
  const [editingCaract, setEditingCaract] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // Notifier le parent des changements de caractéristiques
  useEffect(() => {
    if (onCaracteristiquesChange && caracteristiques) {
      onCaracteristiquesChange(caracteristiques);
    }
  }, [caracteristiques, onCaracteristiquesChange]);

  // Ajouter une caractéristique personnalisée
  const handleAddCaracteristique = () => {
    if (!newCaractNom.trim() || !newCaractValeur.trim()) return;
    
    if (setCaracteristiques) {
      setCaracteristiques((prev) => ({
        ...prev,
        [newCaractNom.trim()]: newCaractValeur.trim(),
      }));
    }
    
    setNewCaractNom("");
    setNewCaractValeur("");
    setNewCaractType("texte");
    setNewCaractObligatoire(false);
    setShowAddCaract(false);
  };

  // Supprimer une caractéristique personnalisée
  const handleRemoveCaracteristique = (nomChamp: string) => {
    if (setCaracteristiques) {
      setCaracteristiques((prev) => {
        const newCaracts = { ...prev };
        delete newCaracts[nomChamp];
        return newCaracts;
      });
    }
  };

  // Modifier une valeur de caractéristique
  const handleCaractValueChange = (nomChamp: string, value: string) => {
    if (setCaracteristiques) {
      setCaracteristiques((prev) => ({
        ...prev,
        [nomChamp]: value,
      }));
    }
  };

  // Démarrer l'édition d'une caractéristique personnalisée
  const startEditingCaract = (nomChamp: string) => {
    setEditingCaract(nomChamp);
    setEditingTemplateId(null);
    setIsEditingTemplate(false);
    setNewCaractNom(nomChamp);
    setNewCaractValeur(caracteristiques?.[nomChamp] || "");
  };

  // Démarrer l'édition d'un template
  const startEditingTemplate = (template: TemplateCaracteristique) => {
    setEditingTemplateId(template.id);
    setEditingCaract(template.nom_champ);
    setIsEditingTemplate(true);
    setNewCaractNom(template.nom_champ);
    setNewCaractValeur(caracteristiques?.[template.nom_champ] || "");
  };

  // Sauvegarder la modification d'une caractéristique personnalisée
  const saveEditingCaract = () => {
    if (!editingCaract || !newCaractNom.trim() || !newCaractValeur.trim()) return;
    
    if (setCaracteristiques) {
      setCaracteristiques((prev) => {
        const newCaracts = { ...prev };
        delete newCaracts[editingCaract];
        newCaracts[newCaractNom.trim()] = newCaractValeur.trim();
        return newCaracts;
      });
    }
    
    setEditingCaract(null);
    setEditingTemplateId(null);
    setIsEditingTemplate(false);
    setNewCaractNom("");
    setNewCaractValeur("");
  };

  // Sauvegarder la modification d'un template
  const saveEditingTemplate = async () => {
    if (!editingTemplateId || !editingCaract || !newCaractNom.trim() || !newCaractValeur.trim()) return;
    
    if (onEditTemplate) {
      await onEditTemplate(editingTemplateId, editingCaract, newCaractNom.trim());
      
      // Mettre à jour localement
      if (setCaracteristiques) {
        setCaracteristiques((prev) => {
          const newCaracts = { ...prev };
          const oldValue = newCaracts[editingCaract] || "";
          delete newCaracts[editingCaract];
          newCaracts[newCaractNom.trim()] = oldValue || newCaractValeur.trim();
          return newCaracts;
        });
      }
    }
    
    setEditingCaract(null);
    setEditingTemplateId(null);
    setIsEditingTemplate(false);
    setNewCaractNom("");
    setNewCaractValeur("");
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingCaract(null);
    setEditingTemplateId(null);
    setIsEditingTemplate(false);
    setNewCaractNom("");
    setNewCaractValeur("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" /> Type de référence
        </label>
        <select
          className={INPUT}
          value={selectedPrefix}
          onChange={(e) => {
            setSelectedPrefix(e.target.value);
            if (!isEditMode) generateReference(e.target.value);
          }}
          disabled={isEditMode}
        >
          <option value="">Sélectionner un type</option>
          {REFERENCE_PREFIXES.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label} — {p.description}
            </option>
          ))}
        </select>
        {generatedReference && !isEditMode && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 text-xs">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Référence :</span>
            <span className="font-mono font-bold text-primary">{generatedReference}</span>
          </div>
        )}
        {isEditMode && value.reference && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40 border border-border/50 text-xs">
            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Référence actuelle :</span>
            <span className="font-mono font-bold text-primary">{value.reference}</span>
          </div>
        )}
      </div>

      <input type="hidden" name="reference" value={value.reference} />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" /> Nom du produit
        </label>
        <input
          className={INPUT}
          placeholder="Ex: RTX 4070 Ti Super 16GB"
          value={value.nom}
          onChange={(e) => setValue((p) => ({ ...p, nom: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5" /> Catégorie
          </label>
          <select
            className={INPUT}
            value={value.categorie_id}
            onChange={(e) =>
              setValue((p) => ({ ...p, categorie_id: e.target.value, id_sous_categorie: "" }))
            }
          >
            <option value="">— Catégorie —</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Sous-catégorie
          </label>
          <select
            className={INPUT}
            value={value.id_sous_categorie}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue((p) => ({ ...p, id_sous_categorie: newValue }));
              if (!isEditMode && loadTemplates && newValue) {
                loadTemplates(newValue);
              }
            }}
            disabled={!value.categorie_id}
          >
            <option value="">— Sous-catégorie —</option>
            {sousCategories
              .filter((sc: any) => String(sc.id_categorie) === String(value.categorie_id))
              .map((sc: any) => (
                <option key={sc.id} value={sc.id}>{sc.nom}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Prix (MGA)
          </label>
          <input
            className={INPUT}
            placeholder="0"
            value={value.prix}
            onChange={(e) => setValue((p) => ({ ...p, prix: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5" /> Stock
          </label>
          <input
            className={INPUT}
            placeholder="0"
            value={value.quantite_stock}
            onChange={(e) => setValue((p) => ({ ...p, quantite_stock: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Description
        </label>
        <textarea
          className={INPUT}
          placeholder="Description du produit..."
          value={value.description}
          onChange={(e) => setValue((p) => ({ ...p, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5" /> Point fort
        </label>
        <input
          className={INPUT}
          placeholder="Ex: Garantie 2 ans, Livraison gratuite..."
          value={value.atout}
          onChange={(e) => setValue((p) => ({ ...p, atout: e.target.value }))}
        />
      </div>

      {/* ─── SECTION CARACTÉRISTIQUES ─── */}
      <div className="space-y-3 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" /> Caractéristiques
          </label>
          <span className="text-[10px] text-muted-foreground">
            {Object.keys(caracteristiques || {}).length} caractéristique(s)
          </span>
        </div>

        {/* Templates existants (modifiables et supprimables en édition) */}
        {templatesDisponibles.map((template) => {
          const isEditing = isEditMode && editingTemplateId === template.id;
          
          if (isEditing) {
            return (
              <div
                key={template.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">Modifier le template</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded">template</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input
                      className="px-3 py-1.5 text-sm border border-border/40 rounded-lg bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                      placeholder="Nom du champ"
                      value={newCaractNom}
                      onChange={(e) => setNewCaractNom(e.target.value)}
                    />
                    <input
                      className="px-3 py-1.5 text-sm border border-border/40 rounded-lg bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                      placeholder="Valeur par défaut"
                      value={newCaractValeur}
                      onChange={(e) => setNewCaractValeur(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={saveEditingTemplate}
                    disabled={!newCaractNom.trim()}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          }
          
          return (
            <div
              key={template.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-border/40"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {template.nom_champ}
                  </span>
                  {template.est_obligatoire && (
                    <span className="text-[10px] text-red-500">*</span>
                  )}
                  <span className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded">
                    {template.type_champ}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded">
                    template
                  </span>
                </div>
                <input
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-border/40 rounded-lg bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                  placeholder={`Valeur pour ${template.nom_champ}`}
                  value={caracteristiques?.[template.nom_champ] || ""}
                  onChange={(e) => handleCaractValueChange(template.nom_champ, e.target.value)}
                  required={template.est_obligatoire}
                />
              </div>
              {/* Boutons pour les templates (uniquement en mode édition) */}
              {isEditMode && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEditingTemplate(template)}
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                    title="Modifier le nom du champ"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {onDeleteTemplate && (
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(template.id, template.nom_champ)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                      title="Supprimer cette caractéristique"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Caractéristiques personnalisées (modifiables et supprimables) */}
        {Object.entries(caracteristiques || {})
          .filter(([key]) => !templatesDisponibles.some((t) => t.nom_champ === key))
          .map(([nomChamp, valeur]) => {
            const isEditing = editingCaract === nomChamp && !isEditingTemplate;
            
            if (isEditing) {
              return (
                <div
                  key={nomChamp}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">Modifier</span>
                      <span className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded">personnalisé</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        className="px-3 py-1.5 text-sm border border-border/40 rounded-lg bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                        placeholder="Nom du champ"
                        value={newCaractNom}
                        onChange={(e) => setNewCaractNom(e.target.value)}
                      />
                      <input
                        className="px-3 py-1.5 text-sm border border-border/40 rounded-lg bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                        placeholder="Valeur"
                        value={newCaractValeur}
                        onChange={(e) => setNewCaractValeur(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={saveEditingCaract}
                      disabled={!newCaractNom.trim() || !newCaractValeur.trim()}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={nomChamp}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">{nomChamp}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded">personnalisé</span>
                  </div>
                  <input
                    className="w-full mt-1 px-3 py-1.5 text-sm border border-border/40 rounded-lg bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                    placeholder={`Valeur pour ${nomChamp}`}
                    value={valeur}
                    onChange={(e) => handleCaractValueChange(nomChamp, e.target.value)}
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEditingCaract(nomChamp)}
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                    title="Modifier le nom"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCaracteristique(nomChamp)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

        {/* Bouton Ajouter une caractéristique personnalisée */}
        {!showAddCaract ? (
          <button
            type="button"
            onClick={() => setShowAddCaract(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-sm text-muted-foreground hover:text-primary font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter une caractéristique personnalisée
          </button>
        ) : (
          <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nom du champ *</label>
                <input
                  className={INPUT}
                  placeholder="Ex: Couleur, Poids..."
                  value={newCaractNom}
                  onChange={(e) => setNewCaractNom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Valeur *</label>
                <input
                  className={INPUT}
                  placeholder="Ex: Rouge, 1.5kg..."
                  value={newCaractValeur}
                  onChange={(e) => setNewCaractValeur(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Type:</label>
                <select
                  className="px-3 py-1.5 text-sm border border-border/60 rounded-lg bg-background/60 outline-none focus:border-primary/60 transition-all"
                  value={newCaractType}
                  onChange={(e) => setNewCaractType(e.target.value as any)}
                >
                  <option value="texte">Texte</option>
                  <option value="nombre">Nombre</option>
                  <option value="booleen">Booléen</option>
                  <option value="date">Date</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCaractObligatoire}
                  onChange={(e) => setNewCaractObligatoire(e.target.checked)}
                  className="rounded border-border/60 text-primary focus:ring-primary/20"
                />
                Obligatoire
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCaracteristique}
                disabled={!newCaractNom.trim() || !newCaractValeur.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCaract(false);
                  setNewCaractNom("");
                  setNewCaractValeur("");
                  setNewCaractType("texte");
                  setNewCaractObligatoire(false);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border/60 hover:bg-secondary/50 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ImageUploadField ────────────────────────────────────────────────────────
const ImageUploadField = ({
  files,
  setFiles,
  label = "Images du produit",
}: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  label?: string;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
      <ImageIcon className="h-3.5 w-3.5" /> {label}
    </label>
    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/50 rounded-xl cursor-pointer bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40 transition-all duration-200 group">
      <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
        <ImageIcon className="h-5 w-5" />
        <span className="text-xs font-medium">Cliquer pour ajouter des images</span>
        <span className="text-[10px]">JPG, PNG, WEBP</span>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          setFiles((prev) => [...prev, ...selected]);
          e.currentTarget.value = "";
        }}
      />
    </label>
    {files.length > 0 && (
      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-1.5 bg-secondary/20 text-xs"
          >
            <span className="truncate pr-2 font-medium text-foreground/80">{file.name}</span>
            <button
              type="button"
              onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── ExistingImagesManager ───────────────────────────────────────────────────
const ExistingImagesManager = ({
  selectedProduit,
  existingImages,
  setExistingImages,
  setMainImage,
  deleteImage,
  handleApiError,
  toast,
}: {
  selectedProduit: Produit | null;
  existingImages: { id: number; url: string; alt: string; ordre?: number }[];
  setExistingImages: React.Dispatch<React.SetStateAction<{ id: number; url: string; alt: string; ordre?: number }[]>>;
  setMainImage: any;
  deleteImage: any;
  handleApiError: (error: any, fallback: string) => void;
  toast: any;
}) => {
  if (!selectedProduit) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5" /> Images existantes
      </h4>
      {existingImages.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/20 border border-border/40 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" /> Aucune image enregistrée.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {existingImages
            .slice()
            .sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999))
            .map((img) => (
              <div
                key={img.id}
                className="border border-border/40 rounded-xl overflow-hidden bg-secondary/10 hover:bg-secondary/20 transition-all"
              >
                <img
                  src={getFullImageUrl(img.url)}
                  alt={img.alt || "image produit"}
                  className="h-24 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-pc.jpg"; }}
                />
                <div className="p-2 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground block">Ordre: {img.ordre ?? "-"}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await setMainImage.mutateAsync({ produitId: selectedProduit.id, imageId: img.id });
                          const details = await api.get(`/produits/${selectedProduit.id}`);
                          setExistingImages(details?.data?.data?.images ?? []);
                          toast({ title: "Image principale mise à jour" });
                        } catch (e: any) { handleApiError(e, "Impossible de définir l'image principale."); }
                      }}
                      className="flex-1 py-1 text-[10px] font-medium rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                    >
                      Principale
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await deleteImage.mutateAsync(img.id);
                          setExistingImages((prev) => prev.filter((p) => p.id !== img.id));
                          toast({ title: "Image supprimée" });
                        } catch (e: any) { handleApiError(e, "Impossible de supprimer l'image."); }
                      }}
                      className="flex-1 py-1 text-[10px] font-medium rounded-lg border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ─── ProductMobileCard ───────────────────────────────────────────────────────
const ProductMobileCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onView, 
  getMainImage,
  expanded,
  onToggleExpand,
}: any) => {
  const mainImage = getMainImage(product);
  const caracteristiques = product.caracteristiques || {};

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
      <div className="flex gap-3">
        <div className="shrink-0">
          {mainImage?.url ? (
            <img
              src={getFullImageUrl(mainImage.url)}
              alt={mainImage.alt || product.nom}
              className="h-16 w-16 object-cover rounded-lg border border-border/50"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-pc.jpg"; }}
            />
          ) : (
            <div className="h-16 w-16 rounded-lg border border-border/50 flex items-center justify-center bg-secondary/20">
              <Package className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{product.nom}</div>
          <div className="text-xs text-muted-foreground font-mono">{product.reference || "-"}</div>
          <div className="text-xs mt-1 text-muted-foreground/70 truncate">
            {product.categorie?.nom ?? "-"}
            {product.sous_categorie?.nom ? ` › ${product.sous_categorie.nom}` : ""}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-sm text-primary">{product.prix} {product.devise}</div>
          <div className="text-xs text-muted-foreground">Stock: {product.quantite_stock}</div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${
            product.est_dispo
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 border border-red-500/20"
          }`}>
            {product.est_dispo ? "✓ Disponible" : "✕ Indisponible"}
          </span>
        </div>
      </div>
      
      {Object.keys(caracteristiques).length > 0 && (
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {expanded ? "Masquer les caractéristiques" : "Voir les caractéristiques"}
          <span className="text-[10px] text-muted-foreground/50">({Object.keys(caracteristiques).length})</span>
        </button>
      )}

      {expanded && Object.keys(caracteristiques).length > 0 && (
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          {Object.entries(caracteristiques).map(([nom, valeur]) => (
            <div key={nom} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">{nom}:</span>
              <span className="text-foreground">{valeur}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
        <button 
          onClick={() => onView(product)} 
          className="p-2 rounded-lg bg-white border border-border/50 hover:bg-secondary/50 transition-colors shadow-sm" 
          title="Voir détails"
        >
          <Eye className="h-4 w-4 text-foreground" />
        </button>
        <button 
          onClick={() => onEdit(product)} 
          className="p-2 rounded-lg bg-white border border-border/50 hover:bg-secondary/50 transition-colors shadow-sm" 
          title="Modifier"
        >
          <Pencil className="h-4 w-4 text-foreground" />
        </button>
        <button 
          onClick={() => onDelete(product)} 
          className="p-2 rounded-lg bg-white border border-border/50 hover:bg-destructive/10 transition-colors shadow-sm text-destructive" 
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
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
  <div className={`flex items-center justify-between px-6 py-4 border-b border-border/50 rounded-t-2xl ${accent ? "bg-gradient-to-r from-primary/5 to-transparent" : ""}`}>
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
  isLoading = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmIcon?: any;
  danger?: boolean;
  isLoading?: boolean;
}) => (
  <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl">
    <button
      onClick={onCancel}
      disabled={isLoading}
      className="px-4 py-2 text-sm border border-border/60 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50"
    >
      Annuler
    </button>
    <button
      onClick={onConfirm}
      disabled={isLoading}
      className={`px-5 py-2 text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-sm ${
        danger
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ConfirmIcon className="h-3.5 w-3.5" />}
      {isLoading ? "Enregistrement..." : confirmLabel}
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const AdminProduits = () => {
  const [activeTab, setActiveTab] = useState<"produits" | "categories" | "sous-categories">("produits");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSousCategoryModal, setShowSousCategoryModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedSousCategory, setSelectedSousCategory] = useState<SousCategory | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(initialCategoryForm);
  const [sousCategoryForm, setSousCategoryForm] = useState({ id_categorie: "", nom: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [dispoFilter, setDispoFilter] = useState<"all" | "available" | "unavailable">("all");
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; alt: string; ordre?: number }[]>([]);
  const [selectedPrefix, setSelectedPrefix] = useState<string>("");
  const [generatedReference, setGeneratedReference] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // États pour les caractéristiques du formulaire
  const [createCaracteristiques, setCreateCaracteristiques] = useState<Record<string, string>>({});
  const [editCaracteristiques, setEditCaracteristiques] = useState<Record<string, string>>({});
  const [createTemplates, setCreateTemplates] = useState<TemplateCaracteristique[]>([]);
  const [editTemplates, setEditTemplates] = useState<TemplateCaracteristique[]>([]);

  // États pour les filtres avancés
  const [filterCategorieId, setFilterCategorieId] = useState<string>("");
  const [filterSousCategorieId, setFilterSousCategorieId] = useState<string>("");
  const [filterCaracteristiques, setFilterCaracteristiques] = useState<Record<string, string[]>>({});
  const [templatesBySousCategorie, setTemplatesBySousCategorie] = useState<TemplateCaracteristique[]>([]);
  const [valeursByTemplate, setValeursByTemplate] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  // État pour gérer l'expansion des cartes
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  // État pour les produits avec leurs caractéristiques
  const [produitsWithCaracts, setProduitsWithCaracts] = useState<Produit[]>([]);

  // États pour la suppression/édition des caractéristiques
  const [showDeleteCaractModal, setShowDeleteCaractModal] = useState(false);
  const [caractToDelete, setCaractToDelete] = useState<{id: number, nom_champ: string, isTemplate: boolean} | null>(null);
  const [isDeletingCaract, setIsDeletingCaract] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, user, loading: authLoading, logout } = useAuth();

  const apiFilters = useMemo<ProductFilters>(
    () => ({
      search: searchTerm || undefined,
      est_dispo: dispoFilter === "all" ? undefined : dispoFilter === "available" ? 1 : 0,
    }),
    [searchTerm, dispoFilter],
  );

  const { data: produits, refetch } = useProducts(apiFilters);
  const { data: categories, refetch: refetchCategories } = useCategories();
  const { data: sousCategoriesData, refetch: refetchSousCategories } = useSousCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const createSousCategoryMutation = useCreateSousCategory();
  const updateSousCategoryMutation = useUpdateSousCategory();
  const deleteSousCategoryMutation = useDeleteSousCategory();
  const { uploadImage, deleteImage, setMainImage } = useProductImageActions();

  useEffect(() => {
    if (!authLoading && (!isAdmin || !user)) logout("/login?redirect_admin=true");
  }, [isAdmin, user, authLoading, logout]);

  // Charger les caractéristiques pour chaque produit
  useEffect(() => {
    const loadCaracteristiques = async () => {
      const normalizedProduits = produits ?? [];
      if (!normalizedProduits || normalizedProduits.length === 0) {
        setProduitsWithCaracts(normalizedProduits);
        return;
      }

      try {
        const produitsAvecCaracts = await Promise.all(
          normalizedProduits.map(async (produit) => {
            try {
              const response = await api.get(`/produits/${produit.id}/caracteristiques`);
              const caracts = response?.data?.data || [];
              const caractsObj: Record<string, string> = {};
              caracts.forEach((c: any) => {
                caractsObj[c.nom_champ] = c.valeur;
              });
              return {
                ...produit,
                caracteristiques: caractsObj
              };
            } catch (error) {
              console.error(`Erreur chargement caractéristiques pour produit ${produit.id}:`, error);
              return {
                ...produit,
                caracteristiques: {}
              };
            }
          })
        );
        setProduitsWithCaracts(produitsAvecCaracts);
      } catch (error) {
        console.error("Erreur lors du chargement des caractéristiques:", error);
        setProduitsWithCaracts(normalizedProduits);
      }
    };

    loadCaracteristiques();
  }, [produits]);

  // Charger les templates et valeurs pour une sous-catégorie (filtres)
  useEffect(() => {
    if (filterSousCategorieId) {
      loadTemplatesAndValues(filterSousCategorieId);
    } else {
      setTemplatesBySousCategorie([]);
      setValeursByTemplate({});
      setFilterCaracteristiques({});
    }
  }, [filterSousCategorieId]);

  const normalizedCategories = categories ?? [];
  const normalizedSousCategories = sousCategoriesData ?? [];
  
  // Filtrer les produits avec les filtres avancés
  const filteredProduits = useMemo(() => {
    let result = produitsWithCaracts;

    if (filterCategorieId) {
      result = result.filter(p => String(p.categorie_id) === filterCategorieId);
    }

    if (filterSousCategorieId) {
      result = result.filter(p => String(p.id_sous_categorie) === filterSousCategorieId);
    }

    Object.entries(filterCaracteristiques).forEach(([nomChamp, valeurs]) => {
      if (valeurs.length > 0) {
        result = result.filter(p => {
          const produitCaracts = p.caracteristiques || {};
          const valeurProduit = produitCaracts[nomChamp] || "";
          return valeurs.some(v => valeurProduit.includes(v));
        });
      }
    });

    return result;
  }, [produitsWithCaracts, filterCategorieId, filterSousCategorieId, filterCaracteristiques]);

  const getMainImage = (product: Produit) => {
    const images = product.images ?? [];
    if (images.length === 0) return null;
    return images.find((img) => img.ordre === 0) ?? images.slice().sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999))[0];
  };

  const handleApiError = (error: any, fallback: string) => {
    const responseData = error?.response?.data;
    let message = responseData?.message || fallback;
    if (responseData?.errors) {
      const firstKey = Object.keys(responseData.errors)[0];
      const firstError = responseData.errors[firstKey];
      message = Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    toast({ title: "Erreur", description: message, variant: "destructive" });
  };

  const toggleExpand = (productId: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Charger les templates pour une sous-catégorie (création/édition)
  const loadTemplatesForSousCategorie = async (sousCategorieId: string) => {
    if (!sousCategorieId) {
      setCreateTemplates([]);
      setCreateCaracteristiques({});
      return;
    }

    try {
      const response = await api.get(`/sous-categories/${sousCategorieId}/templates`);
      const templates = response?.data?.data || [];
      setCreateTemplates(templates);

      const initialCaracts: Record<string, string> = {};
      templates.forEach((t: TemplateCaracteristique) => {
        if (t.valeur_par_defaut) {
          initialCaracts[t.nom_champ] = t.valeur_par_defaut;
        }
      });
      setCreateCaracteristiques(initialCaracts);
    } catch (error) {
      console.error("Erreur chargement templates:", error);
    }
  };

  // Charger les templates et leurs valeurs pour les filtres
  const loadTemplatesAndValues = async (sousCategorieId: string) => {
    try {
      const templatesResponse = await api.get(`/sous-categories/${sousCategorieId}/templates`);
      const templates = templatesResponse?.data?.data || [];
      setTemplatesBySousCategorie(templates);

      const valeursMap: Record<string, string[]> = {};
      
      for (const template of templates) {
        try {
          const valuesResponse = await api.get(`/templates/${template.id}/valeurs-uniques`);
          const valeurs = valuesResponse?.data?.data || [];
          valeursMap[template.nom_champ] = valeurs;
        } catch (error) {
          console.error(`Erreur chargement valeurs pour ${template.nom_champ}:`, error);
          valeursMap[template.nom_champ] = [];
        }
      }
      
      setValeursByTemplate(valeursMap);
    } catch (error) {
      console.error("Erreur chargement templates:", error);
    }
  };

  // Supprimer une caractéristique (template)
  const deleteCaracteristique = async () => {
    if (!caractToDelete) return;
    
    setIsDeletingCaract(true);
    try {
      await api.delete(`/templates-caracteristiques/${caractToDelete.id}`);
      
      // Mettre à jour l'état local
      setEditTemplates(prev => prev.filter(t => t.id !== caractToDelete.id));
      setEditCaracteristiques(prev => {
        const newCaracts = { ...prev };
        delete newCaracts[caractToDelete.nom_champ];
        return newCaracts;
      });
      
      toast({
        title: "Caractéristique supprimée",
        description: `"${caractToDelete.nom_champ}" a été supprimé avec succès`
      });
      
      setShowDeleteCaractModal(false);
      setCaractToDelete(null);
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error?.response?.data?.message || "Impossible de supprimer cette caractéristique",
        variant: "destructive"
      });
    } finally {
      setIsDeletingCaract(false);
    }
  };

  // Modifier un template (nom du champ)
  const editTemplate = async (templateId: number, oldNomChamp: string, newNomChamp: string) => {
    try {
      await api.put(`/templates-caracteristiques/${templateId}`, {
        nom_champ: newNomChamp
      });
      
      // Mettre à jour l'état local
      setEditTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, nom_champ: newNomChamp } : t
      ));
      
      // Mettre à jour les caractéristiques
      setEditCaracteristiques(prev => {
        const newCaracts = { ...prev };
        const value = newCaracts[oldNomChamp] || "";
        delete newCaracts[oldNomChamp];
        newCaracts[newNomChamp] = value;
        return newCaracts;
      });
      
      toast({
        title: "Caractéristique modifiée",
        description: `"${oldNomChamp}" renommé en "${newNomChamp}"`
      });
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      toast({
        title: "Erreur",
        description: error?.response?.data?.message || "Impossible de modifier cette caractéristique",
        variant: "destructive"
      });
      throw error;
    }
  };

  const generateNextReference = async (prefixKey: string): Promise<string> => {
    if (!prefixKey) return "";
    const prefixConfig = REFERENCE_PREFIXES.find((p) => p.key === prefixKey);
    const prefix = prefixConfig?.label || `${prefixKey}-`;
    try {
      const response = await api.get("/produits", { params: { per_page: 10000, all: true } });
      const allProducts = response?.data?.data || [];
      const regex = new RegExp(`^${prefix}(\\d+)$`);
      let maxNumber = 0;
      allProducts.forEach((product: any) => {
        const match = product.reference?.match(regex);
        if (match) { const num = parseInt(match[1], 10); if (num > maxNumber) maxNumber = num; }
      });
      return `${prefix}${(maxNumber + 1).toString().padStart(3, "0")}`;
    } catch { return `${prefix}001`; }
  };

  const generateReference = async (prefixKey: string) => {
    if (!prefixKey) { setGeneratedReference(""); return; }
    try {
      const newReference = await generateNextReference(prefixKey);
      setGeneratedReference(newReference);
      setForm((prev) => ({ ...prev, reference: newReference }));
    } catch {
      toast({ title: "Erreur", description: "Impossible de générer la référence", variant: "destructive" });
    }
  };

  const buildFormData = (data: ProduitForm) => {
    const fd = new FormData();
    fd.append("categorie_id", data.categorie_id);
    if (data.id_sous_categorie) fd.append("id_sous_categorie", data.id_sous_categorie);
    fd.append("reference", data.reference);
    fd.append("nom", data.nom);
    fd.append("description_courte", data.description_courte);
    fd.append("description", data.description);
    fd.append("atout", data.atout);
    fd.append("prix", data.prix);
    fd.append("devise", data.devise);
    fd.append("quantite_stock", data.quantite_stock);
    fd.append("actif", data.actif ? "1" : "0");
    return fd;
  };

  const saveCaracteristiques = async (produitId: number, caracteristiques: Record<string, string>) => {
    const entries = Object.entries(caracteristiques).filter(([_, valeur]) => valeur && valeur.trim() !== "");
    if (entries.length === 0) return;

    try {
      await api.post(`/produits/${produitId}/caracteristiques/sync`, {
        caracteristiques: entries.map(([nom, valeur]) => ({
          nom_champ: nom,
          valeur: valeur.trim(),
          type_champ: "texte",
          est_obligatoire: false
        }))
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des caractéristiques:", error);
      throw error;
    }
  };

  const handleCreate = async () => {
    if (!form.reference) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un type de référence", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const created = await createProductMutation.mutateAsync(buildFormData(form));
      const createdProductId = created?.data?.data?.id as number | undefined;
      
      if (createdProductId) {
        await saveCaracteristiques(createdProductId, createCaracteristiques);
        if (createImageFiles.length > 0) {
          await Promise.all(createImageFiles.map((file, index) =>
            uploadImage.mutateAsync({ produitId: createdProductId, imageFile: file, alt: `${form.nom} - image ${index + 1}`, ordre: index }),
          ));
        }
      }
      
      setShowModal(false);
      setForm(initialForm);
      setSelectedPrefix("");
      setGeneratedReference("");
      setCreateImageFiles([]);
      setCreateCaracteristiques({});
      setCreateTemplates([]);
      await refetch();
      toast({ title: "Produit créé avec la référence " + form.reference });
    } catch (e: any) { 
      handleApiError(e, "Impossible de créer le produit."); 
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = async (p: Produit) => {
    setSelectedProduit(p);
    let existingPrefix = "";
    for (const prefix of REFERENCE_PREFIXES) {
      if (p.reference?.startsWith(prefix.label)) { existingPrefix = prefix.key; break; }
    }
    setSelectedPrefix(existingPrefix);
    setEditForm({
      categorie_id: String(p.categorie_id ?? ""),
      id_sous_categorie: String(p.id_sous_categorie ?? ""),
      reference: p.reference ?? "",
      nom: p.nom ?? "",
      description_courte: p.description_courte ?? "",
      description: p.description ?? "",
      atout: p.atout ?? "",
      prix: String(p.prix ?? ""),
      devise: p.devise ?? "MGA",
      quantite_stock: String(p.quantite_stock ?? ""),
      actif: p.actif ?? true,
    });
    setEditImageFiles([]);

    // Charger les templates de la sous-catégorie
    try {
      const templatesResponse = await api.get(`/sous-categories/${p.id_sous_categorie}/templates`);
      const templates = templatesResponse?.data?.data || [];
      setEditTemplates(templates);

      // Charger les caractéristiques existantes
      const response = await api.get(`/produits/${p.id}/caracteristiques`);
      const caracts = response?.data?.data || [];
      const caractsObj: Record<string, string> = {};
      caracts.forEach((c: any) => {
        caractsObj[c.nom_champ] = c.valeur;
      });
      setEditCaracteristiques(caractsObj);
    } catch (error) {
      console.error("Erreur chargement caractéristiques:", error);
    }

    try {
      const details = await api.get(`/produits/${p.id}`);
      setExistingImages(details?.data?.data?.images ?? []);
    } catch { setExistingImages(p.images ?? []); }
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedProduit) return;
    setIsUpdating(true);
    try {
      await updateProductMutation.mutateAsync({ id: selectedProduit.id, updatedProduct: buildFormData(editForm) });
      await saveCaracteristiques(selectedProduit.id, editCaracteristiques);

      if (editImageFiles.length > 0) {
        const startOrder = existingImages.length;
        await Promise.all(editImageFiles.map((file, index) =>
          uploadImage.mutateAsync({ produitId: selectedProduit.id, imageFile: file, alt: `${editForm.nom} - image ${startOrder + index + 1}`, ordre: startOrder + index }),
        ));
      }
      
      setShowEditModal(false);
      setSelectedProduit(null);
      setSelectedPrefix("");
      setEditImageFiles([]);
      setExistingImages([]);
      setEditCaracteristiques({});
      setEditTemplates([]);
      await refetch();
      toast({ title: "Produit mis à jour" });
    } catch (e: any) { 
      handleApiError(e, "Impossible de modifier le produit."); 
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduit) return;
    try {
      await deleteProductMutation.mutateAsync(selectedProduit.id);
      setShowDeleteAlert(false);
      setSelectedProduit(null);
      await refetch();
      toast({ title: "Produit supprimé" });
    } catch (e: any) { handleApiError(e, "Impossible de supprimer le produit."); }
  };

  const handleCategorySubmit = async () => {
    const payload = {
      nom: categoryForm.nom,
      type: categoryForm.type,
      parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : null,
      ordre_tri: Number(categoryForm.ordre_tri || 0),
    };
    try {
      if (selectedCategory?.id) await api.put(`/categories/${selectedCategory.id}`, payload);
      else await api.post("/categories", payload);
      setShowCategoryModal(false);
      setSelectedCategory(null);
      setCategoryForm(initialCategoryForm);
      await refetchCategories();
      toast({ title: "Catégorie enregistrée" });
    } catch (e: any) { handleApiError(e, "Impossible d'enregistrer la catégorie."); }
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setCreateImageFiles([]);
    setSelectedPrefix("");
    setGeneratedReference("");
    setForm(initialForm);
    setCreateCaracteristiques({});
    setCreateTemplates([]);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditImageFiles([]);
    setExistingImages([]);
    setSelectedPrefix("");
    setGeneratedReference("");
    setEditCaracteristiques({});
    setEditTemplates([]);
  };

  const handleCaracteristiqueFilterChange = (nomChamp: string, valeur: string, checked: boolean) => {
    setFilterCaracteristiques(prev => {
      const current = prev[nomChamp] || [];
      if (checked) {
        return { ...prev, [nomChamp]: [...current, valeur] };
      } else {
        return { ...prev, [nomChamp]: current.filter(v => v !== valeur) };
      }
    });
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Box className="h-3.5 w-3.5" />
            <span>Catalogue</span>
            <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
            <span className="text-foreground font-medium">Produits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des produits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez votre catalogue electronics</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 w-full sm:w-auto justify-center"
        >
          <PlusCircle className="h-4 w-4" /> Ajouter un produit
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1.5 flex-wrap border-b border-border/50 pb-0">
        {[
          { id: "produits", label: "Produits", icon: Package },
          { id: "categories", label: "Catégories", icon: FolderTree },
          { id: "sous-categories", label: "Sous-catégories", icon: Layers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Produits ── */}
      {activeTab === "produits" && (
        <div className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 border border-border/60 rounded-xl text-sm bg-background/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2.5 border border-border/60 rounded-xl bg-background/60 text-sm outline-none focus:border-primary/60 transition-all"
                  value={dispoFilter}
                  onChange={(e) => setDispoFilter(e.target.value as any)}
                >
                  <option value="all">Tous</option>
                  <option value="available">Disponibles</option>
                  <option value="unavailable">Indisponibles</option>
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-xl border border-border/60 text-sm font-medium transition-all flex items-center gap-2 ${
                    showFilters ? "bg-primary/10 text-primary border-primary/30" : "hover:bg-secondary/50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </button>
                <div className="flex gap-1 border border-border/60 rounded-xl p-1 bg-background/60">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="border border-border/50 rounded-2xl bg-card p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Catégorie
                    </label>
                    <select
                      className={INPUT}
                      value={filterCategorieId}
                      onChange={(e) => {
                        setFilterCategorieId(e.target.value);
                        setFilterSousCategorieId("");
                        setFilterCaracteristiques({});
                      }}
                    >
                      <option value="">Toutes les catégories</option>
                      {normalizedCategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sous-catégorie
                    </label>
                    <select
                      className={INPUT}
                      value={filterSousCategorieId}
                      onChange={(e) => {
                        setFilterSousCategorieId(e.target.value);
                        setFilterCaracteristiques({});
                      }}
                      disabled={!filterCategorieId}
                    >
                      <option value="">Toutes les sous-catégories</option>
                      {normalizedSousCategories
                        .filter((sc: any) => String(sc.id_categorie) === filterCategorieId)
                        .map((sc: any) => (
                          <option key={sc.id} value={sc.id}>{sc.nom}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {filterSousCategorieId && templatesBySousCategorie.length > 0 && (
                  <div className="border-t border-border/50 pt-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                      Caractéristiques
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templatesBySousCategorie.map((template) => (
                        <div key={template.id} className="space-y-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {template.nom_champ}
                          </span>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {(valeursByTemplate[template.nom_champ] || []).map((valeur) => (
                              <label key={valeur} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(filterCaracteristiques[template.nom_champ] || []).includes(valeur)}
                                  onChange={(e) => handleCaracteristiqueFilterChange(template.nom_champ, valeur, e.target.checked)}
                                  className="rounded border-border/60 text-primary focus:ring-primary/20"
                                />
                                {valeur}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-border/50">
                  <button
                    onClick={() => {
                      setFilterCategorieId("");
                      setFilterSousCategorieId("");
                      setFilterCaracteristiques({});
                      setTemplatesBySousCategorie([]);
                      setValeursByTemplate({});
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-border/60 hover:bg-secondary/50 transition-all"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tableau Desktop */}
          {viewMode === "table" && (
            <div className="hidden md:block border border-border/50 rounded-2xl overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/20">
                      {["Image","Référence","Nom","Catégorie","Prix","Stock","Disponibilité","Caractéristiques","Actions"].map((h) => (
                        <th key={h} className={`p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProduits.map((p) => {
                      const mainImage = getMainImage(p);
                      const caracteristiques = p.caracteristiques || {};
                      const isExpanded = expandedItems[p.id] || false;
                      
                      return (
                        <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors last:border-0">
                          <td className="p-4">
                            {mainImage?.url ? (
                              <img
                                src={getFullImageUrl(mainImage.url)}
                                alt={mainImage.alt || p.nom}
                                className="h-11 w-11 object-cover rounded-lg border border-border/40"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-pc.jpg"; }}
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-lg border border-border/40 flex items-center justify-center bg-secondary/20">
                                <Package className="h-4 w-4 text-muted-foreground/30" />
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-mono text-xs text-muted-foreground">{p.reference || "-"}</td>
                          <td className="p-4 max-w-[180px] truncate font-medium text-foreground">{p.nom}</td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {p.categorie?.nom ?? "-"}
                            {p.sous_categorie?.nom ? <span className="text-muted-foreground/60"> › {p.sous_categorie.nom}</span> : ""}
                          </td>
                          <td className="p-4 whitespace-nowrap font-bold text-primary text-sm">{p.prix} {p.devise}</td>
                          <td className="p-4 font-medium text-sm">{p.quantite_stock}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              p.est_dispo
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}>
                              {p.est_dispo ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              {p.est_dispo ? "Disponible" : "Indisponible"}
                            </span>
                          </td>
                          <td className="p-4">
                            {Object.keys(caracteristiques).length > 0 && (
                              <button
                                onClick={() => toggleExpand(p.id)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                              >
                                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                {isExpanded ? "Masquer" : "Voir"} ({Object.keys(caracteristiques).length})
                              </button>
                            )}
                            {isExpanded && (
                              <div className="mt-2 space-y-1 text-xs">
                                {Object.entries(caracteristiques).map(([nom, valeur]) => (
                                  <div key={nom} className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">{nom}:</span>
                                    <span className="text-foreground">{valeur}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => navigate(`/DashboardAdmin/produits/${p.id}`)} 
                                className="p-1.5 rounded-lg bg-white border border-border/40 hover:bg-secondary/50 transition-colors shadow-sm" 
                                title="Voir"
                              >
                                <Eye className="h-3.5 w-3.5 text-foreground" />
                              </button>
                              <button 
                                onClick={() => handleOpenEdit(p)} 
                                className="p-1.5 rounded-lg bg-white border border-border/40 hover:bg-secondary/50 transition-colors shadow-sm" 
                                title="Modifier"
                              >
                                <Pencil className="h-3.5 w-3.5 text-foreground" />
                              </button>
                              <button 
                                onClick={() => { setSelectedProduit(p); setShowDeleteAlert(true); }} 
                                className="p-1.5 rounded-lg bg-white border border-border/40 hover:bg-destructive/10 transition-colors shadow-sm text-destructive" 
                                title="Supprimer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredProduits.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="h-14 w-14 mx-auto mb-3 opacity-15" />
                  <p className="text-sm font-medium">Aucun produit trouvé</p>
                  <p className="text-xs mt-1 opacity-60">Modifiez vos filtres ou ajoutez un produit</p>
                </div>
              )}
            </div>
          )}

          {/* Grid Desktop */}
          {viewMode === "grid" && (
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProduits.map((p) => {
                const mainImage = getMainImage(p);
                const isExpanded = expandedItems[p.id] || false;
                const caracteristiques = p.caracteristiques || {};
                
                return (
                  <div key={p.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
                    <div className="relative">
                      {mainImage?.url ? (
                        <img src={getFullImageUrl(mainImage.url)} alt={mainImage.alt || p.nom} className="w-full h-40 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-pc.jpg"; }} />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-secondary/20">
                          <Package className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      )}
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.est_dispo ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}>
                        {p.est_dispo ? "Disponible" : "Indisponible"}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="font-semibold text-sm text-foreground truncate">{p.nom}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.reference || "-"}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{p.prix} {p.devise}</span>
                        <span className="text-xs text-muted-foreground">Stock: {p.quantite_stock}</span>
                      </div>
                      
                      {Object.keys(caracteristiques).length > 0 && (
                        <div className="space-y-1">
                          <button
                            onClick={() => toggleExpand(p.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            {isExpanded ? "Masquer les caractéristiques" : "Voir les caractéristiques"}
                            <span className="text-[10px] text-muted-foreground/50">({Object.keys(caracteristiques).length})</span>
                          </button>
                          {isExpanded && (
                            <div className="space-y-1 text-xs">
                              {Object.entries(caracteristiques).map(([nom, valeur]) => (
                                <div key={nom} className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">{nom}:</span>
                                  <span className="text-foreground">{valeur}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => navigate(`/DashboardAdmin/produits/${p.id}`)} 
                          className="flex-1 p-1.5 rounded-lg bg-white border border-border/40 hover:bg-secondary/50 transition-colors shadow-sm flex items-center justify-center"
                        >
                          <Eye className="h-3.5 w-3.5 text-foreground" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(p)} 
                          className="flex-1 p-1.5 rounded-lg bg-white border border-border/40 hover:bg-secondary/50 transition-colors shadow-sm flex items-center justify-center"
                        >
                          <Pencil className="h-3.5 w-3.5 text-foreground" />
                        </button>
                        <button 
                          onClick={() => { setSelectedProduit(p); setShowDeleteAlert(true); }} 
                          className="flex-1 p-1.5 rounded-lg bg-white border border-border/40 hover:bg-destructive/10 transition-colors shadow-sm flex items-center justify-center text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filteredProduits.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-14 w-14 mx-auto mb-3 opacity-15" />
                <p className="text-sm font-medium">Aucun produit trouvé</p>
              </div>
            ) : filteredProduits.map((p) => (
              <ProductMobileCard
                key={p.id}
                product={p}
                onEdit={handleOpenEdit}
                onDelete={(product: Produit) => { setSelectedProduit(product); setShowDeleteAlert(true); }}
                onView={(product: Produit) => navigate(`/DashboardAdmin/produits/${product.id}`)}
                getMainImage={getMainImage}
                expanded={expandedItems[p.id] || false}
                onToggleExpand={() => toggleExpand(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Catégories ── */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <button
            onClick={() => { setSelectedCategory(null); setCategoryForm(initialCategoryForm); setShowCategoryModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" /> Nouvelle catégorie
          </button>
          <div className="hidden md:block border border-border/50 rounded-2xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/20">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedCategories.map((c: any) => (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors last:border-0">
                    <td className="p-4 font-medium text-foreground">{c.nom}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground border border-border/40">{c.type}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelectedCategory(c); setCategoryForm({ nom: c.nom, type: c.type, parent_id: c.parent_id ? String(c.parent_id) : "", ordre_tri: String(c.ordre_tri ?? 0) }); setShowCategoryModal(true); }} className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/50 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={async () => { await api.delete(`/categories/${c.id}`); await refetchCategories(); }} className="p-1.5 rounded-lg border border-border/40 hover:bg-destructive/10 transition-colors text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {normalizedCategories.map((c: any) => (
              <div key={c.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{c.nom}</div>
                  <span className="text-xs text-muted-foreground">{c.type}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setSelectedCategory(c); setCategoryForm({ nom: c.nom, type: c.type, parent_id: c.parent_id ? String(c.parent_id) : "", ordre_tri: String(c.ordre_tri ?? 0) }); setShowCategoryModal(true); }} className="p-2 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={async () => { await api.delete(`/categories/${c.id}`); await refetchCategories(); }} className="p-2 rounded-lg border border-border/50 hover:bg-destructive/10 transition-colors text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Sous-catégories ── */}
      {activeTab === "sous-categories" && (
        <div className="space-y-4">
          <button
            onClick={() => { setSelectedSousCategory(null); setSousCategoryForm({ id_categorie: "", nom: "" }); setShowSousCategoryModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" /> Nouvelle sous-catégorie
          </button>
          <div className="hidden md:block border border-border/50 rounded-2xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/20">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégorie parente</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedSousCategories.map((sc: any) => (
                  <tr key={sc.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors last:border-0">
                    <td className="p-4 font-medium text-foreground">{sc.nom}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground border border-border/40">{sc.categorie?.nom || sc.id_categorie}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelectedSousCategory(sc); setSousCategoryForm({ id_categorie: String(sc.id_categorie), nom: sc.nom }); setShowSousCategoryModal(true); }} className="p-1.5 rounded-lg border border-border/40 hover:bg-secondary/50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={async () => { try { await deleteSousCategoryMutation.mutateAsync(sc.id); await refetchSousCategories(); toast({ title: "Sous-catégorie supprimée" }); } catch (e: any) { handleApiError(e, "Impossible de supprimer la sous-catégorie."); } }} className="p-1.5 rounded-lg border border-border/40 hover:bg-destructive/10 transition-colors text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {normalizedSousCategories.map((sc: any) => (
              <div key={sc.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{sc.nom}</div>
                  <span className="text-xs text-muted-foreground">{sc.categorie?.nom || sc.id_categorie}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setSelectedSousCategory(sc); setSousCategoryForm({ id_categorie: String(sc.id_categorie), nom: sc.nom }); setShowSousCategoryModal(true); }} className="p-2 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={async () => { try { await deleteSousCategoryMutation.mutateAsync(sc.id); await refetchSousCategories(); toast({ title: "Sous-catégorie supprimée" }); } catch (e: any) { handleApiError(e, "Impossible de supprimer."); } }} className="p-2 rounded-lg border border-border/50 hover:bg-destructive/10 transition-colors text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* Modal: Créer produit */}
      {showModal && (
        <ModalPortal onClose={closeCreateModal}>
          <div className={`${MODAL_PANEL} max-w-2xl max-h-[88vh]`}>
            <ModalHeader icon={Package} title="Ajouter un produit" onClose={closeCreateModal} accent />
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
              <ProductForm
                value={form}
                setValue={setForm}
                categories={normalizedCategories}
                sousCategories={normalizedSousCategories}
                selectedPrefix={selectedPrefix}
                setSelectedPrefix={setSelectedPrefix}
                generatedReference={generatedReference}
                generateReference={generateReference}
                isEditMode={false}
                onCaracteristiquesChange={setCreateCaracteristiques}
                templatesDisponibles={createTemplates}
                caracteristiques={createCaracteristiques}
                setCaracteristiques={setCreateCaracteristiques}
                loadTemplates={loadTemplatesForSousCategorie}
              />
              <ImageUploadField files={createImageFiles} setFiles={setCreateImageFiles} />
            </div>
            <ModalFooter 
              onCancel={closeCreateModal} 
              onConfirm={handleCreate} 
              confirmLabel="Créer le produit"
              isLoading={isCreating}
            />
          </div>
        </ModalPortal>
      )}

      {/* Modal: Modifier produit */}
      {showEditModal && (
        <ModalPortal onClose={closeEditModal}>
          <div className={`${MODAL_PANEL} max-w-2xl max-h-[88vh]`}>
            <ModalHeader icon={Pencil} title="Modifier le produit" onClose={closeEditModal} accent />
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
              <ProductForm
                value={editForm}
                setValue={setEditForm}
                categories={normalizedCategories}
                sousCategories={normalizedSousCategories}
                selectedPrefix={selectedPrefix}
                setSelectedPrefix={setSelectedPrefix}
                generatedReference={generatedReference}
                generateReference={generateReference}
                isEditMode={true}
                onCaracteristiquesChange={setEditCaracteristiques}
                templatesDisponibles={editTemplates}
                caracteristiques={editCaracteristiques}
                setCaracteristiques={setEditCaracteristiques}
                onDeleteTemplate={(templateId, nomChamp) => {
                  setCaractToDelete({ id: templateId, nom_champ: nomChamp, isTemplate: true });
                  setShowDeleteCaractModal(true);
                }}
                onEditTemplate={editTemplate}
              />
              <ExistingImagesManager
                selectedProduit={selectedProduit}
                existingImages={existingImages}
                setExistingImages={setExistingImages}
                setMainImage={setMainImage}
                deleteImage={deleteImage}
                handleApiError={handleApiError}
                toast={toast}
              />
              <ImageUploadField files={editImageFiles} setFiles={setEditImageFiles} label="Ajouter de nouvelles images" />
            </div>
            <ModalFooter 
              onCancel={closeEditModal} 
              onConfirm={handleEdit} 
              confirmLabel="Enregistrer"
              isLoading={isUpdating}
            />
          </div>
        </ModalPortal>
      )}

      {/* Modal: Catégorie */}
      {showCategoryModal && (
        <ModalPortal onClose={() => setShowCategoryModal(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <ModalHeader
              icon={FolderTree}
              title={selectedCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
              onClose={() => setShowCategoryModal(false)}
            />
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</label>
                <input className={INPUT} placeholder="Nom de la catégorie" value={categoryForm.nom} onChange={(e) => setCategoryForm((p) => ({ ...p, nom: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
                <select className={INPUT} value={categoryForm.type} onChange={(e) => setCategoryForm((p) => ({ ...p, type: e.target.value as CategoryForm["type"] }))}>
                  <option value="">— Sélectionner un type —</option>
                  {CATEGORY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent ID</label>
                  <input className={INPUT} placeholder="Optionnel" value={categoryForm.parent_id} onChange={(e) => setCategoryForm((p) => ({ ...p, parent_id: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordre de tri</label>
                  <input className={INPUT} placeholder="0" value={categoryForm.ordre_tri} onChange={(e) => setCategoryForm((p) => ({ ...p, ordre_tri: e.target.value }))} />
                </div>
              </div>
            </div>
            <ModalFooter onCancel={() => setShowCategoryModal(false)} onConfirm={handleCategorySubmit} />
          </div>
        </ModalPortal>
      )}

      {/* Modal: Sous-catégorie */}
      {showSousCategoryModal && (
        <ModalPortal onClose={() => setShowSousCategoryModal(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <ModalHeader
              icon={Layers}
              title={selectedSousCategory ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}
              onClose={() => setShowSousCategoryModal(false)}
            />
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</label>
                <input className={INPUT} placeholder="Nom de la sous-catégorie" value={sousCategoryForm.nom} onChange={(e) => setSousCategoryForm((p) => ({ ...p, nom: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégorie parente</label>
                <select className={INPUT} value={sousCategoryForm.id_categorie} onChange={(e) => setSousCategoryForm((p) => ({ ...p, id_categorie: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {normalizedCategories.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowSousCategoryModal(false)}
              onConfirm={async () => {
                if (!sousCategoryForm.nom || !sousCategoryForm.id_categorie) {
                  toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" }); return;
                }
                try {
                  if (selectedSousCategory) await updateSousCategoryMutation.mutateAsync({ id: selectedSousCategory.id, updatedData: sousCategoryForm });
                  else await createSousCategoryMutation.mutateAsync(sousCategoryForm);
                  setShowSousCategoryModal(false);
                  setSelectedSousCategory(null);
                  setSousCategoryForm({ id_categorie: "", nom: "" });
                  await refetchSousCategories();
                  toast({ title: "Sous-catégorie enregistrée" });
                } catch (e: any) { handleApiError(e, "Impossible d'enregistrer la sous-catégorie."); }
              }}
            />
          </div>
        </ModalPortal>
      )}

      {/* Modal: Supprimer produit */}
      {showDeleteAlert && (
        <ModalPortal onClose={() => setShowDeleteAlert(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Supprimer le produit</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Confirmer la suppression de{" "}
                    <span className="font-semibold text-foreground">« {selectedProduit?.nom} »</span>{" "}?
                    Cette action est irréversible.
                  </p>
                </div>
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowDeleteAlert(false)}
              onConfirm={handleDelete}
              confirmLabel="Supprimer définitivement"
              confirmIcon={Trash2}
              danger
            />
          </div>
        </ModalPortal>
      )}

      {/* Modal: Confirmation suppression caractéristique */}
      {showDeleteCaractModal && (
        <ModalPortal onClose={() => setShowDeleteCaractModal(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Supprimer la caractéristique
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Êtes-vous sûr de vouloir supprimer la caractéristique{" "}
                    <span className="font-semibold text-foreground">« {caractToDelete?.nom_champ} »</span> ?
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-red-500">
                    ⚠️ Cette action supprimera également toutes les valeurs associées à cette caractéristique.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl">
              <button
                onClick={() => setShowDeleteCaractModal(false)}
                disabled={isDeletingCaract}
                className="px-4 py-2 text-sm border border-border/60 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={deleteCaracteristique}
                disabled={isDeletingCaract}
                className="px-5 py-2 text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingCaract ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {isDeletingCaract ? "Suppression..." : "Supprimer définitivement"}
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

export default AdminProduits;