import { useMemo, useState, useEffect } from "react";
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

// Configuration des préfixes de référence
const REFERENCE_PREFIXES = [
  {
    key: "CASE",
    label: "CASE-",
    description: "Unité Central",
    exemple: "CASE-001",
  },
  { key: "CPU", label: "CPU-", description: "Processeur", exemple: "CPU-001" },
  { key: "MB", label: "MB-", description: "Carte mère", exemple: "MB-001" },
  {
    key: "CL",
    label: "CL-",
    description: "Refroidissement",
    exemple: "CL-001",
  },
  { key: "RAM", label: "RAM-", description: "Mémoire RAM", exemple: "RAM-001" },
  {
    key: "SD",
    label: "SD-",
    description: "Stockage (Disque Dur, NVMe)",
    exemple: "SD-001",
  },
  {
    key: "GPU",
    label: "GPU-",
    description: "Carte graphique",
    exemple: "GPU-001",
  },
  {
    key: "PSU",
    label: "PSU-",
    description: "Alimentation",
    exemple: "PSU-001",
  },
  { key: "PC", label: "PC-", description: "Portable", exemple: "PC-001" },
  {
    key: "CLV",
    label: "CLV-",
    description: "Clavier Gaming",
    exemple: "CLV-001",
  },
  { key: "SR", label: "SR-", description: "Souris Gaming", exemple: "SR-001" },
  {
    key: "ECR",
    label: "ECR-",
    description: "Ecran Gaming",
    exemple: "ECR-001",
  },
  {
    key: "CHS",
    label: "CHS-",
    description: "Chaise Gaming",
    exemple: "CHS-001",
  },
  {
    key: "EXP",
    label: "EXP-",
    description: "Produit Exception",
    exemple: "EXP-001",
  },
  { key: "REF", label: "REF-", description: "Autres", exemple: "REF-001" },
] as const;

// ==================== FONCTIONS UTILITAIRES ====================

const getFullImageUrl = (url: string) => {
  if (!url) return "/placeholder-pc.jpg";
  if (url.startsWith("/storage") || url.startsWith("/image")) {
    const base = (import.meta.env.VITE_API_URL as string | undefined)
      ?.replace(/\/api\/?$/, "") ?? "https://api.holines.xyz";
    return `${base}${url}`;
  }
  return url;
};

// ==================== COMPOSANTS EXTRAITS ====================

// Composant ProductForm
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
}) => {
  const inputClass =
    "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground";

  const handlePrefixChange = async (prefixKey: string) => {
    setSelectedPrefix(prefixKey);
    if (!isEditMode) {
      await generateReference(prefixKey);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
          Type de référence
        </label>
        <select
          className={inputClass}
          value={selectedPrefix}
          onChange={(e) => handlePrefixChange(e.target.value)}
          disabled={isEditMode}
        >
          <option value="">Sélectionner un type de référence</option>
          {REFERENCE_PREFIXES.map((prefix) => (
            <option key={prefix.key} value={prefix.key}>
              {prefix.label} - {prefix.description}
            </option>
          ))}
        </select>
        {generatedReference && !isEditMode && (
          <p className="text-xs text-muted-foreground">
            Référence générée :{" "}
            <span className="font-mono font-semibold text-primary">
              {generatedReference}
            </span>
          </p>
        )}
        {isEditMode && value.reference && (
          <p className="text-xs text-muted-foreground">
            Référence actuelle :{" "}
            <span className="font-mono font-semibold text-primary">
              {value.reference}
            </span>
          </p>
        )}
      </div>

      <input type="hidden" name="reference" value={value.reference} />

      <input
        className={inputClass}
        placeholder="Nom"
        value={value.nom}
        onChange={(e) => setValue((p) => ({ ...p, nom: e.target.value }))}
      />

      <select
        className={inputClass}
        value={value.categorie_id}
        onChange={(e) =>
          setValue((p) => ({ ...p, categorie_id: e.target.value, id_sous_categorie: "" }))
        }
      >
        <option value="">Catégorie</option>
        {categories.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </select>

      <select
        className={inputClass}
        value={value.id_sous_categorie}
        onChange={(e) =>
          setValue((p) => ({ ...p, id_sous_categorie: e.target.value }))
        }
        disabled={!value.categorie_id}
      >
        <option value="">Sous-catégorie</option>
        {sousCategories
          .filter((sc: any) => String(sc.id_categorie) === String(value.categorie_id))
          .map((sc: any) => (
            <option key={sc.id} value={sc.id}>
              {sc.nom}
            </option>
          ))}
      </select>

      <input
        className={inputClass}
        placeholder="Prix"
        value={value.prix}
        onChange={(e) => setValue((p) => ({ ...p, prix: e.target.value }))}
      />

      <input
        className={inputClass}
        placeholder="Stock"
        value={value.quantite_stock}
        onChange={(e) =>
          setValue((p) => ({ ...p, quantite_stock: e.target.value }))
        }
      />

      <textarea
        className={inputClass}
        placeholder="Description"
        value={value.description}
        onChange={(e) =>
          setValue((p) => ({ ...p, description: e.target.value }))
        }
        rows={3}
      />

      <input
        className={inputClass}
        placeholder="Atout du produit (ex: Garantie 2 ans, Livraison gratuite, etc.)"
        value={value.atout}
        onChange={(e) => setValue((p) => ({ ...p, atout: e.target.value }))}
      />
    </div>
  );
};

// Composant ImageUploadField
const ImageUploadField = ({
  files,
  setFiles,
  label = "Images du produit",
}: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  label?: string;
}) => {
  const inputClass =
    "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground";

  return (
    <div className="space-y-2">
      <label className="text-xs sm:text-sm font-medium">{label}</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className={inputClass}
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          setFiles((prev) => [...prev, ...selected]);
          e.currentTarget.value = "";
        }}
      />
      {files.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span className="truncate pr-3 text-xs sm:text-sm">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                className="p-1 border rounded shrink-0"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant ExistingImagesManager
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
  setExistingImages: React.Dispatch<
    React.SetStateAction<
      { id: number; url: string; alt: string; ordre?: number }[]
    >
  >;
  setMainImage: any;
  deleteImage: any;
  handleApiError: (error: any, fallback: string) => void;
  toast: any;
}) => {
  if (!selectedProduit) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs sm:text-sm font-medium">Images existantes</h4>
      {existingImages.length === 0 ? (
        <p className="text-xs sm:text-sm text-muted-foreground">
          Aucune image enregistrée.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
          {existingImages
            .slice()
            .sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999))
            .map((img) => (
              <div key={img.id} className="border rounded-xl p-2 space-y-2">
                <img
                  src={getFullImageUrl(img.url)}
                  alt={img.alt || "image produit"}
                  className="h-24 sm:h-28 w-full object-cover rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-pc.jpg";
                  }}
                />
                <div className="text-xs text-muted-foreground">
                  Ordre: {img.ordre ?? "-"}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await setMainImage.mutateAsync({
                          produitId: selectedProduit.id,
                          imageId: img.id,
                        });
                        const details = await api.get(
                          `/produits/${selectedProduit.id}`,
                        );
                        setExistingImages(details?.data?.data?.images ?? []);
                        toast({ title: "Image principale mise à jour" });
                      } catch (e: any) {
                        handleApiError(
                          e,
                          "Impossible de définir l'image principale.",
                        );
                      }
                    }}
                    className="px-2 py-1 text-xs border rounded-lg"
                  >
                    Définir principale
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteImage.mutateAsync(img.id);
                        setExistingImages((prev) =>
                          prev.filter((p) => p.id !== img.id),
                        );
                        toast({ title: "Image supprimée" });
                      } catch (e: any) {
                        handleApiError(e, "Impossible de supprimer l'image.");
                      }
                    }}
                    className="px-2 py-1 text-xs border rounded-lg text-destructive"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// Composant MobileCard pour l'affichage responsive sur mobile
const ProductMobileCard = ({
  product,
  onEdit,
  onDelete,
  onView,
  getMainImage,
}: any) => {
  const mainImage = getMainImage(product);

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <div className="shrink-0">
          {mainImage?.url ? (
            <img
              src={getFullImageUrl(mainImage.url)}
              alt={mainImage.alt || product.nom}
              className="h-16 w-16 object-cover rounded-md border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-pc.jpg";
              }}
            />
          ) : (
            <div className="h-16 w-16 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground bg-secondary">
              Aucune
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{product.nom}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {product.reference || "-"}
          </div>
          <div className="text-xs mt-1">
            {product.categorie?.nom ?? "-"}
            {product.sous_categorie?.nom ? ` > ${product.sous_categorie.nom}` : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-sm text-primary">
            {product.prix} {product.devise}
          </div>
          <div className="text-xs">Stock: {product.quantite_stock}</div>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${product.est_dispo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {product.est_dispo ? "Dispo" : "Indispo"}
          </span>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          onClick={() => onView(product)}
          className="p-1.5 border rounded-lg hover:bg-muted transition-colors"
          title="Voir détails"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="p-1.5 border rounded-lg hover:bg-muted transition-colors"
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-1.5 border rounded-lg hover:bg-muted transition-colors text-destructive"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================

const AdminProduits = () => {
  const [activeTab, setActiveTab] = useState<"produits" | "categories" | "sous-categories">(
    "produits",
  );
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
  const [dispoFilter, setDispoFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: number; url: string; alt: string; ordre?: number }[]
  >([]);

  const [selectedPrefix, setSelectedPrefix] = useState<string>("");
  const [generatedReference, setGeneratedReference] = useState<string>("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    console.log("ENV CHECK:", {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
    });
  }, []);

  const apiFilters = useMemo<ProductFilters>(
    () => ({
      search: searchTerm || undefined,
      est_dispo:
        dispoFilter === "all" ? undefined : dispoFilter === "available" ? 1 : 0,
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
    if (!authLoading && (!isAdmin || !user)) {
      logout("/login?redirect_admin=true");
    }
  }, [isAdmin, user, authLoading, logout]);

  const normalizedProduits = produits ?? [];
  const normalizedCategories = categories ?? [];
  const normalizedSousCategories = sousCategoriesData ?? [];

  const filteredProduits = normalizedProduits;

  const getMainImage = (product: Produit) => {
    const images = product.images ?? [];
    if (images.length === 0) return null;
    return (
      images.find((img) => img.ordre === 0) ??
      images.slice().sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999))[0]
    );
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground";

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

  const generateNextReference = async (prefixKey: string): Promise<string> => {
    if (!prefixKey) return "";

    const prefixConfig = REFERENCE_PREFIXES.find((p) => p.key === prefixKey);
    const prefix = prefixConfig?.label || `${prefixKey}-`;

    try {
      const response = await api.get("/produits", {
        params: {
          per_page: 10000,
          all: true,
        },
      });

      const allProducts = response?.data?.data || [];

      const regex = new RegExp(`^${prefix}(\\d+)$`);
      let maxNumber = 0;

      allProducts.forEach((product: any) => {
        const match = product.reference?.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      const nextNumber = (maxNumber + 1).toString().padStart(3, "0");
      return `${prefix}${nextNumber}`;
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      return `${prefix}001`;
    }
  };

  const generateReference = async (prefixKey: string) => {
    if (!prefixKey) {
      setGeneratedReference("");
      return;
    }

    try {
      const newReference = await generateNextReference(prefixKey);
      setGeneratedReference(newReference);
      setForm((prev) => ({ ...prev, reference: newReference }));
    } catch (error) {
      console.error("Erreur lors de la génération de la référence:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la référence",
        variant: "destructive",
      });
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

  const handleCreate = async () => {
    if (!form.reference) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de référence",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createProductMutation.mutateAsync(
        buildFormData(form),
      );
      const createdProductId = created?.data?.data?.id as number | undefined;

      if (createdProductId && createImageFiles.length > 0) {
        await Promise.all(
          createImageFiles.map((file, index) =>
            uploadImage.mutateAsync({
              produitId: createdProductId,
              imageFile: file,
              alt: `${form.nom} - image ${index + 1}`,
              ordre: index,
            }),
          ),
        );
      }

      setShowModal(false);
      setForm(initialForm);
      setSelectedPrefix("");
      setGeneratedReference("");
      setCreateImageFiles([]);
      await refetch();
      toast({ title: "Produit créé avec la référence " + form.reference });
    } catch (e: any) {
      handleApiError(e, "Impossible de créer le produit.");
    }
  };

  const handleOpenEdit = async (p: Produit) => {
    setSelectedProduit(p);

    let existingPrefix = "";
    for (const prefix of REFERENCE_PREFIXES) {
      if (p.reference?.startsWith(prefix.label)) {
        existingPrefix = prefix.key;
        break;
      }
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
    try {
      const details = await api.get(`/produits/${p.id}`);
      setExistingImages(details?.data?.data?.images ?? []);
    } catch {
      setExistingImages(p.images ?? []);
    }
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedProduit) return;
    try {
      await updateProductMutation.mutateAsync({
        id: selectedProduit.id,
        updatedProduct: buildFormData(editForm),
      });

      if (editImageFiles.length > 0) {
        const startOrder = existingImages.length;
        await Promise.all(
          editImageFiles.map((file, index) =>
            uploadImage.mutateAsync({
              produitId: selectedProduit.id,
              imageFile: file,
              alt: `${editForm.nom} - image ${startOrder + index + 1}`,
              ordre: startOrder + index,
            }),
          ),
        );
      }

      setShowEditModal(false);
      setSelectedProduit(null);
      setSelectedPrefix("");
      setEditImageFiles([]);
      setExistingImages([]);
      await refetch();
      toast({ title: "Produit mis à jour" });
    } catch (e: any) {
      handleApiError(e, "Impossible de modifier le produit.");
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
    } catch (e: any) {
      handleApiError(e, "Impossible de supprimer le produit.");
    }
  };

  const handleCategorySubmit = async () => {
    const payload = {
      nom: categoryForm.nom,
      type: categoryForm.type,
      parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : null,
      ordre_tri: Number(categoryForm.ordre_tri || 0),
    };

    try {
      if (selectedCategory?.id) {
        await api.put(`/categories/${selectedCategory.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      setShowCategoryModal(false);
      setSelectedCategory(null);
      setCategoryForm(initialCategoryForm);
      await refetchCategories();
      toast({ title: "Catégorie enregistrée" });
    } catch (e: any) {
      handleApiError(e, "Impossible d'enregistrer la catégorie.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* En-tête responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5 sm:h-6 sm:w-6" /> Gestion Catalogue
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <PlusCircle className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {/* Onglets responsive */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("produits")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-xl text-sm sm:text-base transition-all ${activeTab === "produits" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
        >
          Produits
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-xl text-sm sm:text-base transition-all ${activeTab === "categories" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
        >
          Catégories
        </button>
        <button
          onClick={() => setActiveTab("sous-categories")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-xl text-sm sm:text-base transition-all ${activeTab === "sous-categories" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
        >
          Sous-catégories
        </button>
      </div>

      {activeTab === "produits" && (
        <div className="space-y-4">
          {/* Filtres responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm bg-background"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-xl bg-background text-sm w-full sm:w-auto"
              value={dispoFilter}
              onChange={(e) =>
                setDispoFilter(
                  e.target.value as "all" | "available" | "unavailable",
                )
              }
            >
              <option value="all">Tous les produits</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Indisponibles</option>
            </select>
          </div>

          {/* Version Desktop - Tableau (caché sur mobile) */}
          <div className="hidden md:block border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">Image</th>
                  <th className="text-left p-3">Référence</th>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Catégorie</th>
                  <th className="text-left p-3">Prix</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Disponibilité</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduits.map((p) => {
                  const mainImage = getMainImage(p);
                  return (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        {mainImage?.url ? (
                          <img
                            src={getFullImageUrl(mainImage.url)}
                            alt={mainImage.alt || p.nom}
                            className="h-10 w-10 object-cover rounded-md border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-pc.jpg";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground bg-secondary">
                            Aucune
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs">
                        {p.reference || "-"}
                      </td>
                      <td className="p-3 max-w-[200px] truncate font-medium">
                        {p.nom}
                      </td>
                      <td className="p-3 text-xs">
                        {p.categorie?.nom ?? "-"}
                        {p.sous_categorie?.nom ? ` > ${p.sous_categorie.nom}` : ""}
                      </td>
                      <td className="p-3 whitespace-nowrap font-semibold text-primary">
                        {p.prix} {p.devise}
                      </td>
                      <td className="p-3">{p.quantite_stock}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${p.est_dispo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.est_dispo ? "Disponible" : "Indisponible"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/DashboardAdmin/produits/${p.id}`)
                            }
                            className="p-1.5 border rounded-lg hover:bg-muted transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 border rounded-lg hover:bg-muted transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduit(p);
                              setShowDeleteAlert(true);
                            }}
                            className="p-1.5 border rounded-lg hover:bg-muted transition-colors text-destructive"
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
            {filteredProduits.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun produit trouvé</p>
              </div>
            )}
          </div>

          {/* Version Mobile - Cartes (visible seulement sur mobile) */}
          <div className="md:hidden space-y-3">
            {filteredProduits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun produit trouvé</p>
              </div>
            ) : (
              filteredProduits.map((p) => (
                <ProductMobileCard
                  key={p.id}
                  product={p}
                  onEdit={handleOpenEdit}
                  onDelete={(product: Produit) => {
                    setSelectedProduit(product);
                    setShowDeleteAlert(true);
                  }}
                  onView={(product: Produit) =>
                    navigate(`/DashboardAdmin/produits/${product.id}`)
                  }
                  getMainImage={getMainImage}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setCategoryForm(initialCategoryForm);
              setShowCategoryModal(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base"
          >
            <PlusCircle className="h-4 w-4" /> Nouvelle catégorie
          </button>

          {/* Version Desktop - Tableau catégories */}
          <div className="hidden md:block border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedCategories.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 font-medium">{c.nom}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                        {c.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(c);
                            setCategoryForm({
                              nom: c.nom,
                              type: c.type,
                              parent_id: c.parent_id ? String(c.parent_id) : "",
                              ordre_tri: String(c.ordre_tri ?? 0),
                            });
                            setShowCategoryModal(true);
                          }}
                          className="p-1.5 border rounded-lg hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await api.delete(`/categories/${c.id}`);
                            await refetchCategories();
                          }}
                          className="p-1.5 border rounded-lg hover:bg-muted text-destructive"
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

          {/* Version Mobile - Cartes catégories */}
          <div className="md:hidden space-y-3">
            {normalizedCategories.map((c: any) => (
              <div
                key={c.id}
                className="bg-card border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{c.nom}</div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-secondary mt-1">
                    {c.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(c);
                      setCategoryForm({
                        nom: c.nom,
                        type: c.type,
                        parent_id: c.parent_id ? String(c.parent_id) : "",
                        ordre_tri: String(c.ordre_tri ?? 0),
                      });
                      setShowCategoryModal(true);
                    }}
                    className="p-2 border rounded-lg hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      await api.delete(`/categories/${c.id}`);
                      await refetchCategories();
                    }}
                    className="p-2 border rounded-lg hover:bg-muted text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "sous-categories" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setSelectedSousCategory(null);
              setSousCategoryForm({ id_categorie: "", nom: "" });
              setShowSousCategoryModal(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base"
          >
            <PlusCircle className="h-4 w-4" /> Nouvelle sous-catégorie
          </button>

          <div className="hidden md:block border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Catégorie Parente</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedSousCategories.map((sc: any) => (
                  <tr
                    key={sc.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 font-medium">{sc.nom}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                        {sc.categorie?.nom || sc.id_categorie}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedSousCategory(sc);
                            setSousCategoryForm({
                              id_categorie: String(sc.id_categorie),
                              nom: sc.nom,
                            });
                            setShowSousCategoryModal(true);
                          }}
                          className="p-1.5 border rounded-lg hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                                await deleteSousCategoryMutation.mutateAsync(sc.id);
                                await refetchSousCategories();
                                toast({ title: "Sous-catégorie supprimée" });
                            } catch (e: any) {
                                handleApiError(e, "Impossible de supprimer la sous-catégorie.");
                            }
                          }}
                          className="p-1.5 border rounded-lg hover:bg-muted text-destructive"
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

          <div className="md:hidden space-y-3">
            {normalizedSousCategories.map((sc: any) => (
              <div
                key={sc.id}
                className="bg-card border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{sc.nom}</div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-secondary mt-1">
                    {sc.categorie?.nom || sc.id_categorie}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSousCategory(sc);
                      setSousCategoryForm({
                        id_categorie: String(sc.id_categorie),
                        nom: sc.nom,
                      });
                      setShowSousCategoryModal(true);
                    }}
                    className="p-2 border rounded-lg hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                          await deleteSousCategoryMutation.mutateAsync(sc.id);
                          await refetchSousCategories();
                          toast({ title: "Sous-catégorie supprimée" });
                      } catch (e: any) {
                          handleApiError(e, "Impossible de supprimer la sous-catégorie.");
                      }
                    }}
                    className="p-2 border rounded-lg hover:bg-muted text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals - Version responsive */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center sticky top-0 bg-background pb-2">
              <h2 className="text-lg sm:text-xl font-bold">Ajouter produit</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
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
            />
            <ImageUploadField
              files={createImageFiles}
              setFiles={setCreateImageFiles}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sticky bottom-0 bg-background">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCreateImageFiles([]);
                  setSelectedPrefix("");
                  setGeneratedReference("");
                  setForm(initialForm);
                }}
                className="px-4 py-2 border rounded-xl order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 order-1 sm:order-2 justify-center"
              >
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center sticky top-0 bg-background pb-2">
              <h2 className="text-lg sm:text-xl font-bold">Modifier produit</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
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
            <ImageUploadField
              files={editImageFiles}
              setFiles={setEditImageFiles}
              label="Ajouter de nouvelles images"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sticky bottom-0 bg-background">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditImageFiles([]);
                  setExistingImages([]);
                  setSelectedPrefix("");
                  setGeneratedReference("");
                }}
                className="px-4 py-2 border rounded-xl order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 order-1 sm:order-2 justify-center"
              >
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Catégorie</h2>
              <button onClick={() => setShowCategoryModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Nom"
              value={categoryForm.nom}
              onChange={(e) =>
                setCategoryForm((p) => ({ ...p, nom: e.target.value }))
              }
            />
            <select
              className={inputClass}
              value={categoryForm.type}
              onChange={(e) =>
                setCategoryForm((p) => ({
                  ...p,
                  type: e.target.value as CategoryForm["type"],
                }))
              }
            >
              <option value="">Type</option>
              {CATEGORY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Parent ID"
              value={categoryForm.parent_id}
              onChange={(e) =>
                setCategoryForm((p) => ({ ...p, parent_id: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="Ordre"
              value={categoryForm.ordre_tri}
              onChange={(e) =>
                setCategoryForm((p) => ({ ...p, ordre_tri: e.target.value }))
              }
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border rounded-xl order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={handleCategorySubmit}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 order-1 sm:order-2 justify-center"
              >
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {showSousCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Sous-catégorie</h2>
              <button onClick={() => setShowSousCategoryModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Nom"
              value={sousCategoryForm.nom}
              onChange={(e) =>
                setSousCategoryForm((p) => ({ ...p, nom: e.target.value }))
              }
            />
            <select
              className={inputClass}
              value={sousCategoryForm.id_categorie}
              onChange={(e) =>
                setSousCategoryForm((p) => ({
                  ...p,
                  id_categorie: e.target.value,
                }))
              }
            >
              <option value="">Sélectionner une catégorie parente</option>
              {normalizedCategories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowSousCategoryModal(false)}
                className="px-4 py-2 border rounded-xl order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                    if (!sousCategoryForm.nom || !sousCategoryForm.id_categorie) {
                        toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
                        return;
                    }
                    try {
                        if (selectedSousCategory) {
                            await updateSousCategoryMutation.mutateAsync({
                                id: selectedSousCategory.id,
                                updatedData: sousCategoryForm
                            });
                        } else {
                            await createSousCategoryMutation.mutateAsync(sousCategoryForm);
                        }
                        setShowSousCategoryModal(false);
                        setSelectedSousCategory(null);
                        setSousCategoryForm({ id_categorie: "", nom: "" });
                        await refetchSousCategories();
                        toast({ title: "Sous-catégorie enregistrée" });
                    } catch (e: any) {
                        handleApiError(e, "Impossible d'enregistrer la sous-catégorie.");
                    }
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2 order-1 sm:order-2 justify-center"
              >
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4">
            <h3 className="text-lg font-bold">Supprimer le produit</h3>
            <p className="text-sm text-muted-foreground">
              Confirmer la suppression de "
              <span className="font-medium text-foreground">
                {selectedProduit?.nom}
              </span>
              " ?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowDeleteAlert(false)}
                className="px-4 py-2 border rounded-xl order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground order-1 sm:order-2"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProduits;
