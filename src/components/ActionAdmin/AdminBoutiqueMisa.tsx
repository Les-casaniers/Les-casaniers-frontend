// src/components/ActionAdmin/AdminBoutiqueMisa.tsx
import { useState, useEffect } from "react";
import {
  Store,
  PlusCircle,
  X,
  Save,
  Pencil,
  Trash2,
  Search,
  Package,
} from "lucide-react";
import {
  useBoutiqueMisa,
  useCreateBoutiqueMisa,
  useUpdateBoutiqueMisa,
  useDeleteBoutiqueMisa,
  useUpdateBoutiqueMisaStock,
  BoutiqueMisaItem,
} from "@/hooks/useBoutiqueMisa";
import { useToast } from "@/hooks/use-toast";

const getFullImageUrl = (url: string) => {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("/storage") || url.startsWith("/image")) {
    const base = (import.meta.env.VITE_API_URL as string)
      ?.replace(/\/api\/?$/, "") ?? "https://api.holines.xyz";
    return `${base}${url}`;
  }
  return url;
};

// Composant formulaire
const BoutiqueMisaForm = ({
  value,
  setValue,
  imageFile,
  setImageFile,
  isEditMode = false,
}: {
  value: { nom: string; description: string; stock: string; prix: string };
  setValue: React.Dispatch<React.SetStateAction<{ nom: string; description: string; stock: string; prix: string }>>;
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  isEditMode?: boolean;
}) => {
  const inputClass = "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground";

  return (
    <div className="space-y-3">
      <input
        className={inputClass}
        placeholder="Nom de l'article"
        value={value.nom}
        onChange={(e) => setValue((p) => ({ ...p, nom: e.target.value }))}
      />
      
      <textarea
        className={inputClass}
        placeholder="Description"
        value={value.description}
        onChange={(e) => setValue((p) => ({ ...p, description: e.target.value }))}
        rows={3}
      />
      
      <input
        className={inputClass}
        type="number"
        placeholder="Stock"
        value={value.stock}
        onChange={(e) => setValue((p) => ({ ...p, stock: e.target.value }))}
      />
      
      <input
        className={inputClass}
        type="number"
        step="0.01"
        placeholder="Prix (MGA)"
        value={value.prix}
        onChange={(e) => setValue((p) => ({ ...p, prix: e.target.value }))}
      />
      
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
          Image
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={inputClass}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImageFile(file);
          }}
        />
        {isEditMode && !imageFile && (
          <p className="text-xs text-muted-foreground">
            Laissez vide pour conserver l'image actuelle
          </p>
        )}
      </div>
    </div>
  );
};

// Carte mobile
const MobileCard = ({
  item,
  onEdit,
  onDelete,
  onUpdateStock,
}: {
  item: BoutiqueMisaItem;
  onEdit: (item: BoutiqueMisaItem) => void;
  onDelete: (item: BoutiqueMisaItem) => void;
  onUpdateStock: (item: BoutiqueMisaItem, newStock: number) => void;
}) => {
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [newStock, setNewStock] = useState(item.stock.toString());

  const handleStockUpdate = () => {
    const stockValue = parseInt(newStock);
    if (!isNaN(stockValue) && stockValue !== item.stock) {
      onUpdateStock(item, stockValue);
    }
    setIsUpdatingStock(false);
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <div className="shrink-0">
          {item.image_url ? (
            <img
            src={item.image_url || "/placeholder-product.jpg"}
            alt={item.nom}
            className="h-16 w-16 object-cover rounded-md border"
            onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
            }}
            />
          ) : (
            <div className="h-16 w-16 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground bg-secondary">
              Aucune
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{item.nom}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {item.description || "Aucune description"}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-sm text-primary">
            {item.prix.toLocaleString()} MGA
          </div>
          {isUpdatingStock ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-16 px-1 py-0.5 text-xs border rounded"
                autoFocus
              />
              <button
                onClick={handleStockUpdate}
                className="px-1.5 py-0.5 text-xs bg-primary text-white rounded"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setIsUpdatingStock(false);
                  setNewStock(item.stock.toString());
                }}
                className="px-1.5 py-0.5 text-xs border rounded"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsUpdatingStock(true)}
              className="text-xs text-muted-foreground mt-1 hover:text-primary"
            >
              Stock: {item.stock}
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 border rounded-lg hover:bg-muted transition-colors"
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 border rounded-lg hover:bg-muted transition-colors text-destructive"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const AdminBoutiqueMisa = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BoutiqueMisaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  
  const [form, setForm] = useState({
    nom: "",
    description: "",
    stock: "",
    prix: "",
  });
  const [editForm, setEditForm] = useState({
    nom: "",
    description: "",
    stock: "",
    prix: "",
  });
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const { toast } = useToast();

  // Calculer les filtres
  const filters = {
    search: searchTerm || undefined,
    ...(stockFilter === "low" ? { stock_min: 1, per_page: 10000 } : {}),
    ...(stockFilter === "out" ? { stock_min: 0, per_page: 10000 } : {}),
    per_page: 10000,
  };

  const { data: itemsData, refetch } = useBoutiqueMisa(filters);
  const createMutation = useCreateBoutiqueMisa();
  const updateMutation = useUpdateBoutiqueMisa();
  const deleteMutation = useDeleteBoutiqueMisa();
  const updateStockMutation = useUpdateBoutiqueMisaStock();

  const items = itemsData?.data || [];

  const filteredItems = items.filter((item: BoutiqueMisaItem) => {
    if (stockFilter === "low") return item.stock > 0 && item.stock < 10;
    if (stockFilter === "out") return item.stock === 0;
    return true;
  });

  const handleCreate = async () => {
    if (!form.nom) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("nom", form.nom);
    if (form.description) formData.append("description", form.description);
    formData.append("stock", form.stock || "0");
    formData.append("prix", form.prix || "0");
    if (createImageFile) formData.append("image", createImageFile);

    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setForm({ nom: "", description: "", stock: "", prix: "" });
      setCreateImageFile(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenEdit = (item: BoutiqueMisaItem) => {
    setSelectedItem(item);
    setEditForm({
      nom: item.nom,
      description: item.description || "",
      stock: item.stock.toString(),
      prix: item.prix.toString(),
    });
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedItem) return;

    const formData = new FormData();
    formData.append("nom", editForm.nom);
    if (editForm.description) formData.append("description", editForm.description);
    formData.append("stock", editForm.stock);
    formData.append("prix", editForm.prix);
    if (editImageFile) formData.append("image", editImageFile);

    try {
      await updateMutation.mutateAsync({ id: selectedItem.id, formData });
      setShowEditModal(false);
      setSelectedItem(null);
      setEditImageFile(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      setShowDeleteAlert(false);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStock = async (item: BoutiqueMisaItem, newStock: number) => {
    try {
      await updateStockMutation.mutateAsync({ id: item.id, stock: newStock });
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const inputClass = "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground";

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          <Store className="h-5 w-5 sm:h-6 sm:w-6" /> Boutique Misa
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <PlusCircle className="h-4 w-4" /> Ajouter un article
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm bg-background"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border rounded-xl bg-background text-sm w-full sm:w-auto"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as "all" | "low" | "out")}
        >
          <option value="all">Tous les stocks</option>
          <option value="low">Stock faible (&lt;10)</option>
          <option value="out">Rupture de stock</option>
        </select>
      </div>

      {/* Version Desktop - Tableau */}
      <div className="hidden md:block border rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3">Image</th>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Prix</th>
              <th className="text-right p-3">Actions</th>
             </tr>
          </thead>
          <tbody>
            {filteredItems.map((item: BoutiqueMisaItem) => (
              <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  {item.image_url ? (
                        <img
                        src={item.image_url || "/placeholder-product.jpg"}
                        alt={item.nom}
                        className="h-10 w-10 object-cover rounded-md border"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                        }}
                        />
                  ) : (
                    <div className="h-10 w-10 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground bg-secondary">
                      Aucune
                    </div>
                  )}
                 </td>
                <td className="p-3 font-medium max-w-[150px] truncate">{item.nom}</td>
                <td className="p-3 text-muted-foreground max-w-[250px] truncate">
                  {item.description || "-"}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.stock === 0 ? "bg-red-100 text-red-700" : item.stock < 10 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {item.stock}
                  </span>
                 </td>
                <td className="p-3 font-semibold text-primary whitespace-nowrap">
                  {item.prix.toLocaleString()} MGA
                 </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 border rounded-lg hover:bg-muted transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
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
            ))}
          </tbody>
         </table>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun article trouvé</p>
          </div>
        )}
      </div>

      {/* Version Mobile - Cartes */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun article trouvé</p>
          </div>
        ) : (
          filteredItems.map((item: BoutiqueMisaItem) => (
            <MobileCard
              key={item.id}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={(item) => {
                setSelectedItem(item);
                setShowDeleteAlert(true);
              }}
              onUpdateStock={handleUpdateStock}
            />
          ))
        )}
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center sticky top-0 bg-background pb-2">
              <h2 className="text-lg sm:text-xl font-bold">Ajouter un article</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <BoutiqueMisaForm
              value={form}
              setValue={setForm}
              imageFile={createImageFile}
              setImageFile={setCreateImageFile}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sticky bottom-0 bg-background">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCreateImageFile(null);
                  setForm({ nom: "", description: "", stock: "", prix: "" });
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

      {/* Modal Modification */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center sticky top-0 bg-background pb-2">
              <h2 className="text-lg sm:text-xl font-bold">Modifier l'article</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
                {selectedItem?.image_url && !editImageFile && (
                <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Image actuelle
                    </label>
                    <img
                    src={selectedItem.image_url}
                    alt={selectedItem.nom}
                    className="h-24 w-24 object-cover rounded-lg border"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                    }}
                    />
                </div>
                )}
            <BoutiqueMisaForm
              value={editForm}
              setValue={setEditForm}
              imageFile={editImageFile}
              setImageFile={setEditImageFile}
              isEditMode={true}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sticky bottom-0 bg-background">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditImageFile(null);
                  setSelectedItem(null);
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

      {/* Modal Suppression */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4">
            <h3 className="text-lg font-bold">Supprimer l'article</h3>
            <p className="text-sm text-muted-foreground">
              Confirmer la suppression de "
              <span className="font-medium text-foreground">
                {selectedItem?.nom}
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

export default AdminBoutiqueMisa;