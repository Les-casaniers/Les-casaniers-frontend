import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, PlusCircle, X, Save, Pencil, Trash2, Search, Eye } from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
  useProductImageActions,
  Product as APIProduct,
  ProductFilters,
} from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/service/api";
import { useToast } from "@/hooks/use-toast";

const TYPES_PRODUIT = ["pc", "portable", "composant", "peripherique", "service"] as const;
const CATEGORY_TYPES = ["pro", "gaming", "composants", "peripheriques", "services", "guides"] as const;

type ProduitForm = {
  categorie_id: string;
  reference: string;
  nom: string;
  description_courte: string;
  description: string;
  type_produit: (typeof TYPES_PRODUIT)[number] | "";
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
  reference: "",
  nom: "",
  description_courte: "",
  description: "",
  type_produit: "",
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

const AdminProduits = () => {
  const [activeTab, setActiveTab] = useState<"produits" | "categories">("produits");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(initialCategoryForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [dispoFilter, setDispoFilter] = useState<"all" | "available" | "unavailable">("all");
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; alt: string; ordre?: number }[]>([]);

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
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const { uploadImage, deleteImage, setMainImage } = useProductImageActions();

  useEffect(() => {
    if (!authLoading && (!isAdmin || !user)) {
      logout("/login?redirect_admin=true");
    }
  }, [isAdmin, user, authLoading, logout]);

  const normalizedProduits = produits ?? [];
  const normalizedCategories = categories ?? [];

  const filteredProduits = normalizedProduits;

  const getMainImage = (product: Produit) => {
    const images = product.images ?? [];
    if (images.length === 0) return null;
    return images.find((img) => img.ordre === 0) ?? images.slice().sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999))[0];
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

  const buildFormData = (data: ProduitForm) => {
    const fd = new FormData();
    fd.append("categorie_id", data.categorie_id);
    fd.append("reference", data.reference);
    fd.append("nom", data.nom);
    fd.append("description_courte", data.description_courte);
    fd.append("description", data.description);
    fd.append("type_produit", data.type_produit);
    fd.append("prix", data.prix);
    fd.append("devise", data.devise);
    fd.append("quantite_stock", data.quantite_stock);
    fd.append("actif", data.actif ? "1" : "0");
    return fd;
  };

  const handleCreate = async () => {
    try {
      const created = await createProductMutation.mutateAsync(buildFormData(form));
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
      setCreateImageFiles([]);
      await refetch();
      toast({ title: "Produit créé" });
    } catch (e: any) {
      handleApiError(e, "Impossible de créer le produit.");
    }
  };

  const handleOpenEdit = async (p: Produit) => {
    setSelectedProduit(p);
    setEditForm({
      categorie_id: String(p.categorie_id ?? ""),
      reference: p.reference ?? "",
      nom: p.nom ?? "",
      description_courte: p.description_courte ?? "",
      description: p.description ?? "",
      type_produit: (p.type_produit as ProduitForm["type_produit"]) ?? "",
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
      await updateProductMutation.mutateAsync({ id: selectedProduit.id, updatedProduct: buildFormData(editForm) });

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

  const ProductForm = ({ value, setValue }: { value: ProduitForm; setValue: React.Dispatch<React.SetStateAction<ProduitForm>> }) => (
    <div className="space-y-3">
      <input className={inputClass} placeholder="Nom" value={value.nom} onChange={(e) => setValue((p) => ({ ...p, nom: e.target.value }))} />
      <input className={inputClass} placeholder="Référence" value={value.reference} onChange={(e) => setValue((p) => ({ ...p, reference: e.target.value }))} />
      <select className={inputClass} value={value.type_produit} onChange={(e) => setValue((p) => ({ ...p, type_produit: e.target.value as ProduitForm["type_produit"] }))}>
        <option value="">Type produit</option>
        {TYPES_PRODUIT.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select className={inputClass} value={value.categorie_id} onChange={(e) => setValue((p) => ({ ...p, categorie_id: e.target.value }))}>
        <option value="">Catégorie</option>
        {normalizedCategories.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </select>
      <input className={inputClass} placeholder="Prix" value={value.prix} onChange={(e) => setValue((p) => ({ ...p, prix: e.target.value }))} />
      <input className={inputClass} placeholder="Stock" value={value.quantite_stock} onChange={(e) => setValue((p) => ({ ...p, quantite_stock: e.target.value }))} />
      <textarea className={inputClass} placeholder="Description" value={value.description} onChange={(e) => setValue((p) => ({ ...p, description: e.target.value }))} />
    </div>
  );

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
      <label className="text-sm font-medium">{label}</label>
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
        <div className="space-y-1">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span className="truncate pr-3">{file.name}</span>
              <button type="button" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))} className="p-1 border rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ExistingImagesManager = () => {
    if (!selectedProduit) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Images existantes</h4>
        {existingImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune image enregistrée.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingImages
              .slice()
              .sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999))
              .map((img) => (
                <div key={img.id} className="border rounded-xl p-2 space-y-2">
                  <img src={img.url} alt={img.alt || "image produit"} className="h-28 w-full object-cover rounded-lg border" />
                  <div className="text-xs text-muted-foreground">Ordre: {img.ordre ?? "-"}</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await setMainImage.mutateAsync({ produitId: selectedProduit.id, imageId: img.id });
                          const details = await api.get(`/produits/${selectedProduit.id}`);
                          setExistingImages(details?.data?.data?.images ?? []);
                          toast({ title: "Image principale mise à jour" });
                        } catch (e: any) {
                          handleApiError(e, "Impossible de définir l'image principale.");
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
                          setExistingImages((prev) => prev.filter((p) => p.id !== img.id));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" /> Gestion Catalogue
        </h1>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground">
          <PlusCircle className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("produits")} className="px-4 py-2 border rounded-xl">Produits</button>
        <button onClick={() => setActiveTab("categories")} className="px-4 py-2 border rounded-xl">Catégories</button>
      </div>

      {activeTab === "produits" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input
                className="w-full pl-10 pr-4 py-2 border rounded-xl"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-xl bg-background min-w-[220px]"
              value={dispoFilter}
              onChange={(e) => setDispoFilter(e.target.value as "all" | "available" | "unavailable")}
            >
              <option value="all">Tous les produits</option>
              <option value="available">Produits disponibles</option>
              <option value="unavailable">Produits indisponibles</option>
            </select>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Image</th>
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
                
                // Afficher dans la console pour debug
                console.log("Produit ID:", p.id);
                console.log("Produit Nom:", p.nom);
                console.log("mainImage:", mainImage);
                console.log("mainImage?.url:", mainImage?.url);
                
                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">
                      {mainImage?.url ? (
                        <img src={mainImage.url} alt={mainImage.alt || p.nom} className="h-12 w-12 object-cover rounded-md border" />
                      ) : (
                        <div className="h-12 w-12 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground">Aucune</div>
                      )}
                    </td>
                    <td className="p-3">{p.nom}</td>
                    <td className="p-3">{p.categorie?.nom ?? "-"}</td>
                    <td className="p-3">{p.prix}</td>
                    <td className="p-3">{p.quantite_stock}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.est_dispo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.est_dispo ? "Disponible" : "Indisponible"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/DashboardAdmin/produits/${p.id}`)} className="p-2 border rounded-lg hover:bg-muted transition-colors" title="Voir détails">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleOpenEdit(p)} className="p-2 border rounded-lg hover:bg-muted transition-colors" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedProduit(p); setShowDeleteAlert(true); }} className="p-2 border rounded-lg hover:bg-muted transition-colors" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-4">
          <button onClick={() => { setSelectedCategory(null); setCategoryForm(initialCategoryForm); setShowCategoryModal(true); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground">Nouvelle catégorie</button>
          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Parent</th>
                  <th className="text-left p-3">Ordre</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedCategories.map((c: any) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">{c.nom}</td>
                    <td className="p-3">{c.type}</td>
                    <td className="p-3">{c.parent_id ?? "-"}</td>
                    <td className="p-3">{c.ordre_tri ?? 0}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedCategory(c); setCategoryForm({ nom: c.nom, type: c.type, parent_id: c.parent_id ? String(c.parent_id) : "", ordre_tri: String(c.ordre_tri ?? 0) }); setShowCategoryModal(true); }} className="p-2 border rounded-lg"><Pencil className="h-4 w-4" /></button>
                        <button onClick={async () => { await api.delete(`/categories/${c.id}`); await refetchCategories(); }} className="p-2 border rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Ajouter produit</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <ProductForm value={form} setValue={setForm} />
            <ImageUploadField files={createImageFiles} setFiles={setCreateImageFiles} />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowModal(false); setCreateImageFiles([]); }} className="px-4 py-2 border rounded-xl">Annuler</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2"><Save className="h-4 w-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier produit</h2>
              <button onClick={() => setShowEditModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <ProductForm value={editForm} setValue={setEditForm} />
            <ExistingImagesManager />
            <ImageUploadField files={editImageFiles} setFiles={setEditImageFiles} label="Ajouter de nouvelles images" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowEditModal(false); setEditImageFiles([]); setExistingImages([]); }} className="px-4 py-2 border rounded-xl">Annuler</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2"><Save className="h-4 w-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Catégorie</h2>
              <button onClick={() => setShowCategoryModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <input className={inputClass} placeholder="Nom" value={categoryForm.nom} onChange={(e) => setCategoryForm((p) => ({ ...p, nom: e.target.value }))} />
            <select className={inputClass} value={categoryForm.type} onChange={(e) => setCategoryForm((p) => ({ ...p, type: e.target.value as CategoryForm["type"] }))}>
              <option value="">Type</option>
              {CATEGORY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input className={inputClass} placeholder="Parent ID" value={categoryForm.parent_id} onChange={(e) => setCategoryForm((p) => ({ ...p, parent_id: e.target.value }))} />
            <input className={inputClass} placeholder="Ordre" value={categoryForm.ordre_tri} onChange={(e) => setCategoryForm((p) => ({ ...p, ordre_tri: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-xl">Annuler</button>
              <button onClick={handleCategorySubmit} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex items-center gap-2"><Save className="h-4 w-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">Supprimer le produit</h3>
            <p>Confirmer la suppression de "{selectedProduit?.nom}" ?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteAlert(false)} className="px-4 py-2 border rounded-xl">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProduits;
